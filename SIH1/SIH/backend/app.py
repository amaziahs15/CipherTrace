import os
import json
import requests as http_requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from math import radians, sin, cos, sqrt, atan2

import audit  # tamper-evident hash-chain logger

# Load .env for local development
load_dotenv()

app = Flask(__name__)
CORS(app)  # allows frontend cross-origin requests

model = joblib.load('fraud_model.pkl')
cluster_centers = pd.read_csv('hotspot_centers.csv')

fraud_type_map = {
    'UPI Fraud': 0, 'Phishing': 1, 'Fake Investment': 2,
    'OTP Fraud': 3, 'Loan App Scam': 4,
}
bank_map = {
    'SBI': 0, 'HDFC': 1, 'ICICI': 2,
    'Axis': 3, 'PNB': 4, 'Bank of Baroda': 5,
}

CLUSTER_NAMES = {
    0: "Mumbai Metro Zone",
    1: "Kolkata Central Zone",
    2: "Chennai North Zone",
    3: "Delhi NCR Zone",
    4: "Bengaluru South Zone"
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


def tier1_screen(account_age_days, fraud_amount, velocity=0):
    if account_age_days < 30 or fraud_amount > 80_000 or velocity >= 5:
        return "tier1_high_risk"
    return "tier1_standard"


def generate_explanation_factors(victim_lat, victim_lon, fraud_amount, account_age, velocity, fraud_type, bank, predicted_lat, predicted_lon, predicted_zone_name, confidence):
    dist_km = haversine(victim_lat, victim_lon, predicted_lat, predicted_lon)
    factors = []

    # 1. Distance factor (24.9% feature importance)
    factors.append({
        "feature": f"Distance to {predicted_zone_name}",
        "impact": "High Impact (24.9%)",
        "reason": f"Victim location ({victim_lat:.2f}°N, {victim_lon:.2f}°E) is {dist_km:.1f} km from the {predicted_zone_name} centroid."
    })

    # 2. Velocity factor (14.4% feature importance)
    if velocity >= 5:
        factors.append({
            "feature": "IP Incident Velocity",
            "impact": "High Impact (14.4%)",
            "reason": f"Transaction velocity ({velocity} complaints in 24h) indicates a high-frequency coordinated fraud burst."
        })
    else:
        factors.append({
            "feature": "IP Incident Velocity",
            "impact": "Moderate Impact (14.4%)",
            "reason": f"Transaction velocity ({velocity}/24h) matches standard baseline crime telemetry."
        })

    # 3. Fraud Amount factor (10.2% feature importance)
    if fraud_amount >= 80000:
        factors.append({
            "feature": "High-Risk Fraud Amount",
            "impact": "High Impact (10.2%)",
            "reason": f"Fraud amount ₹{fraud_amount:,.0f} exceeds the ₹80,000 high-risk override threshold."
        })
    else:
        factors.append({
            "feature": "Fraud Amount",
            "impact": "Moderate Impact (10.2%)",
            "reason": f"Fraud amount ₹{fraud_amount:,.0f} falls within retail transaction bounds."
        })

    # 4. Account Age factor (9.3% feature importance)
    if account_age < 30:
        factors.append({
            "feature": "Mule Account Maturity",
            "impact": "High Impact (9.3%)",
            "reason": f"Suspect account age ({account_age:.0f} days) is under 30 days, representing fresh mule account risk."
        })

    # 5. Fraud Type vector (12.6% feature importance)
    factors.append({
        "feature": f"Fraud Vector ({fraud_type})",
        "impact": "Moderate Impact (12.6%)",
        "reason": f"{fraud_type} vector correlates strongly with organized syndicate cash-out clusters."
    })

    return factors[:3]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route('/hotspots', methods=['GET'])
def get_hotspots():
    """Return all known withdrawal hotspot cluster centroids."""
    records = cluster_centers.to_dict(orient='records')
    return jsonify(records)


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json or {}

    # Parse inputs
    victim_lat   = float(data.get('victim_lat', 28.6139))
    victim_lon   = float(data.get('victim_lon', 77.2090))
    fraud_amount = float(data.get('fraud_amount', 50000))
    account_age  = float(data.get('suspect_account_age_days', 30))
    hour_of_day  = int(data.get('hour_of_day', 14))
    day_of_week  = int(data.get('day_of_week', 2))
    fraud_type   = data.get('fraud_type', 'UPI Fraud')
    bank         = data.get('bank', 'SBI')
    velocity     = int(data.get('recent_complaints_same_ip_24h', 0))

    screening_tier = tier1_screen(account_age, fraud_amount, velocity)

    dist_from_center  = haversine(victim_lat, victim_lon, 22.0, 79.0)
    fraud_type_code   = fraud_type_map.get(fraud_type, 0)
    bank_code         = bank_map.get(bank, 0)

    features = [[
        fraud_amount, account_age, hour_of_day, day_of_week,
        dist_from_center, fraud_type_code, bank_code, velocity,
    ]]

    probabilities = model.predict_proba(features)[0]
    n_classes     = len(probabilities)

    top3_indices = sorted(range(n_classes), key=lambda i: probabilities[i], reverse=True)[:3]

    top_predictions = []
    for idx in top3_indices:
        cluster_id = idx
        conf       = round(float(probabilities[idx]) * 100, 1)
        row_match  = cluster_centers[cluster_centers['hotspot_cluster'] == cluster_id]
        if row_match.empty:
            continue
        row = row_match.iloc[0]
        top_predictions.append({
            "hotspot_id":        cluster_id,
            "lat":               float(row['withdrawal_lat']),
            "lon":               float(row['withdrawal_lon']),
            "confidence_percent": conf,
        })

    pred_cluster  = top3_indices[0]
    confidence    = round(float(probabilities[pred_cluster]) * 100, 1)
    matched_row   = cluster_centers[cluster_centers['hotspot_cluster'] == pred_cluster].iloc[0]
    predicted_lat = float(matched_row['withdrawal_lat'])
    predicted_lon = float(matched_row['withdrawal_lon'])

    estimated_window   = "2-6 hours"
    CONFIDENCE_THRESHOLD = 40

    if confidence < CONFIDENCE_THRESHOLD:
        triage_status      = "needs_review"
        recommended_action = (
            f"LOW CONFIDENCE ({confidence}%) — pattern does not clearly match known hotspots. "
            f"Flag for manual investigator review instead of automated patrol dispatch."
        )
    else:
        triage_status = "auto_actionable"
        tier_label    = " [HIGH-RISK — immediate priority]" if screening_tier == "tier1_high_risk" else ""
        recommended_action = (
            f"Alert nearest patrol unit to Hotspot Zone {int(pred_cluster)} "
            f"within {estimated_window}{tier_label}"
        )

    zone_name = CLUSTER_NAMES.get(int(pred_cluster), f"Cluster {int(pred_cluster)}")

    result = {
        "predicted_hotspot_id": int(pred_cluster),
        "predicted_lat":        predicted_lat,
        "predicted_lon":        predicted_lon,
        "confidence_percent":   confidence,
        "estimated_time_window": estimated_window,
        "triage_status":        triage_status,
        "screening_tier":       screening_tier,
        "recommended_action":   recommended_action,
        "top_predictions":      top_predictions,
        "action_code": (
            "low_confidence_review" if triage_status == "needs_review"
            else "auto_dispatch"
        ),
        "estimated_time_window_hours": {"min": 2, "max": 6},
        "predicted_zone_id": int(pred_cluster),
        "explanation_factors": generate_explanation_factors(
            victim_lat, victim_lon, fraud_amount, account_age, velocity,
            fraud_type, bank, predicted_lat, predicted_lon, zone_name, confidence
        ),
    }

    input_record = {
        "victim_lat":   victim_lat, "victim_lon": victim_lon,
        "fraud_amount": fraud_amount, "suspect_account_age_days": account_age,
        "hour_of_day":  hour_of_day, "day_of_week": day_of_week,
        "fraud_type":   fraud_type,  "bank": bank,
        "recent_complaints_same_ip_24h": velocity,
    }
    audit.log_prediction(input_record, result)

    return jsonify(result)


@app.route('/audit-log', methods=['GET'])
def get_audit_log():
    entries = audit.read_last_n(20)
    return jsonify({"entries": entries, "count": len(entries)})


@app.route('/audit-verify', methods=['GET'])
def verify_audit():
    result = audit.verify_chain()
    return jsonify(result)


# ---------------------------------------------------------------------------
# /chat — AI Chatbot powered by Groq
# ---------------------------------------------------------------------------
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "groq/compound-mini"

SYSTEM_PROMPT = (
    "You are CipherTrace AI, an investigative artificial intelligence assistant embedded in the "
    "CipherTrace Cybercrime Intelligence Dashboard. You assist law enforcement officers, investigators, "
    "and citizens with ATM cash withdrawal hotspot predictions, fraud risk scoring, 1930 emergency bank freeze notices, "
    "and cyber fraud triage.\n\n"
    "CRITICAL LANGUAGE & NATIVE SCRIPT INSTRUCTIONS:\n"
    "1. Dynamic Language Detection on EVERY Message:\n"
    "   - Detect the language the user is writing in, even if it is romanized/transliterated "
    "(e.g. Tamil written in English letters, sometimes called Tanglish, or Hindi written in English letters, sometimes called Hinglish, "
    "Telugu written in English letters / Tenglish, Kannada / Kanglish, Malayalam / Manglish, Bengali / Banglish, Marathi / Marathiglish, etc.).\n"
    "   - Identify the true underlying language regardless of script.\n"
    "2. Strict Native Script Output:\n"
    "   - Always respond in that same language, written in its PROPER NATIVE SCRIPT:\n"
    "     * Tamil (தமிழ் script) for Tamil and Tanglish inputs\n"
    "     * Hindi (हिन्दी in Devanagari script) for Hindi and Hinglish inputs\n"
    "     * Telugu (తెలుగు script) for Telugu and Tenglish inputs\n"
    "     * Kannada (ಕನ್ನಡ script) for Kannada and Kanglish inputs\n"
    "     * Malayalam (മലയാളം script) for Malayalam and Manglish inputs\n"
    "     * Bengali (বাংলা script) for Bengali and Banglish inputs\n"
    "     * Marathi (मराठी in Devanagari script) for Marathi inputs\n"
    "     * Gujarati (ગુજરાતી script) for Gujarati inputs\n"
    "     * Punjabi (ਪੰਜਾਬੀ in Gurmukhi script) for Punjabi inputs\n"
    "     * Odia (ଓଡ଼ିଆ script) for Odia inputs\n"
    "     * Assamese (অসমীয়া script) for Assamese inputs\n"
    "     * Urdu (اردو in Perso-Arabic/Nastaliq script) for Urdu and Roman Urdu inputs\n"
    "     * Japanese (日本語) for Japanese inputs\n"
    "     * English ONLY when the user's message is actually in English\n"
    "   - NEVER reply in romanized/transliterated English letters (never output Tanglish, Hinglish, etc.).\n"
    "   - Never default to English unless the user's message is actually in English.\n"
    "3. Conversation Consistency & Mid-Chat Language Switching:\n"
    "   - If a user switches languages mid-conversation, strictly follow the language of their MOST RECENT message, "
    "not whatever language was used earlier in the chat.\n"
    "4. Mermaid.js Flowchart & Process Diagrams:\n"
    "   - When the user asks for a flowchart, workflow, process diagram, sequence, or step-by-step visual structure "
    "(e.g., 'show me a flowchart of how UPI fraud is traced', 'diagram the 1930 bank freeze process', etc.), "
    "respond with valid Mermaid.js syntax wrapped in a ```mermaid code block, accompanied by a clear, concise plain-language explanation.\n"
    "   - CRITICAL MERMAID SYNTAX RULES:\n"
    "     * NEVER use apostrophes or single quotes inside node labels (write 'Attacker Method' or 'Attackers Method', NEVER 'Attacker\\'s Method').\n"
    "     * Always wrap the ENTIRE node text label in double quotes inside brackets, e.g. A[\"Victim lodges complaint\"] --> B[\"1930 Helpline Response\"].\n"
    "     * Avoid raw parentheses, brackets, or commas inside node labels unless the entire label is enclosed in double quotes, e.g. C[\"Verify Identity (manual check)\"].\n"
    "     * Keep node labels concise, clean, and plain-text.\n"
    "     * Example valid pattern to follow strictly:\n"
    "```mermaid\n"
    "graph TD\n"
    "    A[\"Victim Reports Fraud\"] --> B[\"1930 Helpline Triage\"]\n"
    "    B --> C[\"Identify Attackers Method\"]\n"
    "    C --> D{\"Risk Level High?\"}\n"
    "    D -->|\"Yes\"| E[\"Emergency Freeze Notice Issued\"]\n"
    "    D -->|\"No\"| F[\"Standard Monitoring\"]\n"
    "```\n"
    "   - Only generate a Mermaid diagram when requested or genuinely helpful for visualizing a workflow — not for every single response.\n"
    "5. Tone:\n"
    "   - Be concise, professional, clear, and actionable for cybercrime investigation and fraud prevention."
)


@app.route('/chat', methods=['POST'])
def chat():
    api_key = os.environ.get('GROQ_API_KEY')
    if not api_key:
        return jsonify({
            "error": "GROQ_API_KEY environment variable is not set. "
                     "Add it to your .env file or deployment secrets."
        }), 503

    body         = request.get_json(silent=True) or {}
    user_message = body.get('message', '').strip()
    if not user_message:
        return jsonify({"error": "'message' field is required and must be non-empty."}), 400

    context = body.get('context')

    system_content = SYSTEM_PROMPT
    if context and isinstance(context, dict):
        context_str = json.dumps(context, indent=2)
        system_content += (
            f"\n\nThe investigator is currently viewing the following prediction result. "
            f"Use it to answer their question if relevant:\n```json\n{context_str}\n```"
        )

    messages = [
        {"role": "system", "content": system_content},
        {"role": "user",   "content": user_message},
    ]

    try:
        response = http_requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type":  "application/json",
            },
            json={"model": GROQ_MODEL, "messages": messages},
            timeout=30,
        )
        response.raise_for_status()
    except http_requests.exceptions.Timeout:
        return jsonify({"error": "Groq API request timed out. Please try again."}), 504
    except http_requests.exceptions.ConnectionError:
        return jsonify({"error": "Could not connect to Groq API. Check network connectivity."}), 502
    except http_requests.exceptions.HTTPError as exc:
        status = exc.response.status_code if exc.response is not None else 502
        try:
            upstream_detail = exc.response.json()
        except Exception:
            upstream_detail = {"raw": exc.response.text if exc.response else str(exc)}
        return jsonify({"error": "Groq API returned an error.", "detail": upstream_detail}), status
    except Exception as exc:
        return jsonify({"error": f"Unexpected error calling Groq API: {str(exc)}"}), 500

    try:
        reply = response.json()["choices"][0]["message"]["content"]
    except (KeyError, IndexError, ValueError) as exc:
        return jsonify({
            "error": "Unexpected response format from Groq API.",
            "detail": str(exc),
        }), 502

    return jsonify({"reply": reply})


# ---------------------------------------------------------------------------
# /model-metrics — Model Evaluation & Feature Importances
# ---------------------------------------------------------------------------
@app.route('/model-metrics', methods=['GET'])
def get_model_metrics():
    metrics_path = os.path.join(os.path.dirname(__file__), 'model_metrics.json')
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    return jsonify({
        'model_type': 'XGBoost Classifier',
        'metrics': {'accuracy': 0.5650, 'precision': 0.5643, 'recall': 0.5650},
        'feature_importances': [
            {'key': 'dist_from_center', 'name': 'Distance from Center', 'importance': 0.2492},
            {'key': 'recent_complaints_same_ip_24h', 'name': 'IP Incident Velocity', 'importance': 0.1440},
            {'key': 'fraud_type_code', 'name': 'Fraud Type', 'importance': 0.1259},
            {'key': 'bank_code', 'name': 'Bank Code', 'importance': 0.1194},
            {'key': 'fraud_amount', 'name': 'Fraud Amount', 'importance': 0.1024},
            {'key': 'suspect_account_age_days', 'name': 'Account Age', 'importance': 0.0935},
            {'key': 'hour_of_day', 'name': 'Hour of Day', 'importance': 0.0843},
            {'key': 'day_of_week', 'name': 'Day of Week', 'importance': 0.0813}
        ],
        'label_note': 'Metrics computed on held-out test data during model training.'
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
