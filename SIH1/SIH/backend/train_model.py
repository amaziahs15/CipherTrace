"""
train_model.py
--------------
Generates synthetic fraud data with 8 features (including velocity, fraud type,
and bank influence), trains an XGBClassifier, prints evaluation metrics & feature
importances, and saves the model as fraud_model.pkl.

Run once:
    python train_model.py
"""

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score
from xgboost import XGBClassifier

np.random.seed(42)
N = 10_000  # samples

# Feature 1: fraud_amount
fraud_amount = np.random.exponential(scale=25_000, size=N).clip(500, 500_000)

# Feature 2: suspect_account_age_days
account_age = np.random.exponential(scale=120, size=N).clip(1, 3650)

# Feature 3: hour_of_day
hour_of_day = np.random.randint(0, 24, size=N)

# Feature 4: day_of_week
day_of_week = np.random.randint(0, 7, size=N)

# Feature 5: dist_from_center (km from geographic centre of India)
dist_from_center = np.random.uniform(200, 2000, size=N)

# Feature 6: fraud_type_code (0: UPI Fraud, 1: Phishing, 2: Fake Investment, 3: OTP Fraud, 4: Loan App Scam)
fraud_type_code = np.random.randint(0, 5, size=N)

# Feature 7: bank_code (0: SBI, 1: HDFC, 2: ICICI, 3: Axis, 4: PNB, 5: Bank of Baroda)
bank_code = np.random.randint(0, 6, size=N)

# Feature 8: recent_complaints_same_ip_24h (velocity)
# Normal cases: mostly 0-3; fresh/high-risk accounts spike to 5-15
velocity_base  = np.random.choice([0, 1, 2, 3], size=N, p=[0.50, 0.25, 0.15, 0.10])
velocity_spike = np.random.randint(5, 16, size=N)
spike_flag = (account_age < 30).astype(int)
velocity = np.where(spike_flag & (np.random.rand(N) > 0.4), velocity_spike, velocity_base)

# ── 1. Base Geographical Label Assignment (0: Mumbai, 1: Kolkata, 2: Chennai, 3: Delhi, 4: Bengaluru) ──
label = np.zeros(N, dtype=int)
label[dist_from_center < 500]                                              = 0  # Mumbai
label[(dist_from_center >= 500)  & (dist_from_center < 800)]              = 1  # Kolkata
label[(dist_from_center >= 800)  & (dist_from_center < 1200)]             = 2  # Chennai
label[(dist_from_center >= 1200) & (dist_from_center < 1600)]             = 3  # Delhi
label[dist_from_center >= 1600]                                            = 4  # Bengaluru

# ── 2. Fraud Type Influence (Realistic Fraud Geography) ───────────────────
# UPI Fraud (0) and OTP Fraud (3): skew heavily toward major cyber hubs / high-volume metros (Mumbai: 0, Delhi: 3)
upi_otp_mask = ((fraud_type_code == 0) | (fraud_type_code == 3)) & (np.random.rand(N) < 0.45)
label[upi_otp_mask] = np.random.choice([0, 3], size=upi_otp_mask.sum())

# Fake Investment Scams (2): large organized syndicate scams skewing toward financial/tech hotspots (Delhi: 3, Mumbai: 0, Bengaluru: 4)
fake_inv_mask = (fraud_type_code == 2) & (np.random.rand(N) < 0.50)
label[fake_inv_mask] = np.random.choice([0, 3, 4], size=fake_inv_mask.sum())

# Loan App Scam (4) & Phishing (1): distributed across all hotspots with mild random dispersion
loan_phish_mask = ((fraud_type_code == 1) | (fraud_type_code == 4)) & (np.random.rand(N) < 0.15)
label[loan_phish_mask] = np.random.randint(0, 5, size=loan_phish_mask.sum())

# ── 3. Bank-Based Tendency (Mild regional density pull) ────────────────────
# PNB (4) -> Northern hub (Delhi: 3)
# Bank of Baroda (5) -> Western hub (Mumbai: 0)
# ICICI/HDFC (1, 2) -> Financial/South hubs (Mumbai: 0, Chennai: 2, Bengaluru: 4)
bank_pull_mask = np.random.rand(N) < 0.25  # moderate pull for 25% of cases

pnb_mask = (bank_code == 4) & bank_pull_mask
label[pnb_mask] = 3

bob_mask = (bank_code == 5) & bank_pull_mask
label[bob_mask] = 0

private_bank_mask = ((bank_code == 1) | (bank_code == 2)) & bank_pull_mask
label[private_bank_mask] = np.random.choice([0, 2, 4], size=private_bank_mask.sum())

# ── 4. Transaction Amount & Velocity Overrides ────────────────────────────
large_mask = fraud_amount > 80_000
label[large_mask] = np.random.choice([0, 3], size=large_mask.sum())

hi_vel_mask = velocity >= 8
label[hi_vel_mask] = np.random.choice([0, 3], size=hi_vel_mask.sum())

# ── 5. Label Noise (~8% for realism) ──────────────────────────────────────
noise_idx = np.random.choice(N, size=int(0.08 * N), replace=False)
label[noise_idx] = np.random.randint(0, 5, size=len(noise_idx))

# Assemble DataFrame
df = pd.DataFrame({
    "fraud_amount":                  fraud_amount,
    "suspect_account_age_days":      account_age,
    "hour_of_day":                   hour_of_day,
    "day_of_week":                   day_of_week,
    "dist_from_center":              dist_from_center,
    "fraud_type_code":               fraud_type_code,
    "bank_code":                     bank_code,
    "recent_complaints_same_ip_24h": velocity,
    "hotspot_cluster":               label,
})

X = df.drop("hotspot_cluster", axis=1)
y = df["hotspot_cluster"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Train XGBClassifier
xgb = XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric="mlogloss",
    random_state=42,
    n_jobs=-1,
)
xgb.fit(X_train, y_train)

# Evaluate
y_pred = xgb.predict(X_test)
acc  = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
rec  = recall_score(y_test, y_pred, average="weighted", zero_division=0)

print("=" * 60)
print("  XGBoost Model -- Evaluation on Hold-out Set")
print("=" * 60)
print(f"  Accuracy  : {acc:.4f}  ({acc*100:.1f}%)")
print(f"  Precision : {prec:.4f}  (weighted)")
print(f"  Recall    : {rec:.4f}  (weighted)")
print("=" * 60)
print("  Feature Importances:")
importances = xgb.feature_importances_
feature_names = X.columns
fi_df = pd.DataFrame({"Feature": feature_names, "Importance": importances})
fi_df = fi_df.sort_values(by="Importance", ascending=False).reset_index(drop=True)
for idx, row in fi_df.iterrows():
    print(f"    {row['Feature']:<30} : {row['Importance']:.4f} ({row['Importance']*100:.1f}%)")
print("=" * 60)

# Save model
joblib.dump(xgb, "fraud_model.pkl")
print("  fraud_model.pkl saved (XGBoost, 8 features)")


# Save metrics JSON
import json
metrics_dict = {
    'model_type': 'XGBoost Classifier',
    'test_samples': len(y_test),
    'metrics': {
        'accuracy': round(float(acc), 4),
        'precision': round(float(prec), 4),
        'recall': round(float(rec), 4)
    },
    'feature_importances': [
        {'key': row['Feature'], 'name': str(row['Feature']), 'importance': round(float(row['Importance']), 4)}
        for _, row in fi_df.iterrows()
    ],
    'label_note': 'Metrics computed on held-out test data during model training.'
}
with open('model_metrics.json', 'w', encoding='utf-8') as f:
    json.dump(metrics_dict, f, indent=2)
print('  model_metrics.json saved')
