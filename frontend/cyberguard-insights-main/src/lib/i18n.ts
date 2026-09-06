// ─── i18n — CipherTrace translations ─────────────────────────────────────────
// Supports: English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali,
//           Marathi, Gujarati, Punjabi, Odia, Assamese, Urdu, Japanese

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

export type LangCode =
  | "en" | "hi" | "ta" | "te" | "kn" | "ml"
  | "bn" | "mr" | "gu" | "pa" | "or" | "as" | "ur" | "ja";

export const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
  { code: "en", label: "English",    native: "English" },
  { code: "hi", label: "Hindi",      native: "हिन्दी" },
  { code: "ta", label: "Tamil",      native: "தமிழ்" },
  { code: "te", label: "Telugu",     native: "తెలుగు" },
  { code: "kn", label: "Kannada",    native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam",  native: "മലയാളം" },
  { code: "bn", label: "Bengali",    native: "বাংলা" },
  { code: "mr", label: "Marathi",    native: "मराठी" },
  { code: "gu", label: "Gujarati",   native: "ગુજરાતી" },
  { code: "pa", label: "Punjabi",    native: "ਪੰਜਾਬੀ" },
  { code: "or", label: "Odia",       native: "ଓଡ଼ିଆ" },
  { code: "as", label: "Assamese",   native: "অসমীয়া" },
  { code: "ur", label: "Urdu",       native: "اردو" },
  { code: "ja", label: "Japanese",   native: "日本語" },
];

import enJson from "@/locales/en.json";
import taJson from "@/locales/ta.json";

// ─── Translation keys ─────────────────────────────────────────────────────────

const RAW_TRANSLATIONS = {
  en: {
    ...enJson,
    appName:              "CipherTrace",
    appSub:               "Cybercrime Cash Withdrawal Intelligence · Restricted Use",
    modelActive:          "Model v2.1 active",
    live:                 "Live",
    complaintsProcessed:  "Complaints Processed",
    rolling30:            "Rolling 30-day intake",
    activeHotspots:       "Active Hotspot Zones",
    zonesUnder:           "Zones under surveillance",
    topFraud:             "Top Fraud Category",
    topFraudSub:          "38% of all registered complaints",
    newComplaint:         "New Complaint Entry",
    newComplaintSub:      "All fields required · use map search to auto-fill coordinates",
    victimLat:            "Victim Latitude",
    victimLon:            "Victim Longitude",
    fraudAmount:          "Fraud Amount (₹)",
    accountAge:           "Suspect Acct Age (days)",
    hourOfDay:            "Hour of Day (0–23)",
    dayOfWeek:            "Day of Week",
    fraudType:            "Fraud Type",
    bank:                 "Victim's Bank",
    predict:              "Predict Withdrawal Location",
    predicting:           "Analysing Pattern…",
    predictionResult:     "Prediction Result",
    predictionResultSub:  "Real-time ML output",
    noPredict:            "No prediction yet",
    noPredictSub:         "Fill in the complaint form and click Predict to generate an ML-based hotspot forecast.",
    topPredictedZones:    "Top Predicted Zones",
    primaryConfidence:    "Primary confidence",
    estWindow:            "Est. Withdrawal Window",
    recommendedAction:    "Recommended Action",
    mapTitle:             "Live Hotspot Zone Map",
    mapSub:               "India · ATM withdrawal cluster analysis · Search to auto-fill coordinates",
    knownHotspot:         "Known hotspot",
    pred1:                "#1 Predicted",
    pred2:                "#2 Predicted",
    pred3:                "#3 Predicted",
    auditLog:             "Audit Log",
    auditSub:             "Tamper-evident prediction history",
    chainVerified:        "Chain Verified ✓",
    tampered:             "Tampered ✗",
    refresh:              "Refresh",
    noLogs:               "No predictions logged yet. Make your first prediction above.",
    loadingAudit:         "Loading audit log…",
    colTimestamp:         "Timestamp",
    colFraudType:         "Fraud Type",
    colBank:              "Bank",
    colZone:              "Predicted Zone",
    colConfidence:        "Confidence",
    colTriage:            "Triage",
    aiAssistant:          "AI Investigation Assistant",
    aiSub:                "Powered by Groq · Ask questions about predictions & fraud patterns",
    aiContext:            "Context",
    aiWelcomeTitle:       "CipherTrace AI",
    aiWelcomeText:        "Ask me about fraud patterns, prediction confidence, or investigation steps. Make a prediction first for contextual answers.",
    aiWelcomeCtx:         "I have context on your latest prediction. Ask me anything about it.",
    aiInputPlaceholder:   "Ask about fraud patterns, confidence scores…",
    aiInputCtxPlaceholder:"Ask about",
    aiFooter:             "Press Enter to send · Groq AI · Responses may take a few seconds",
    aiChatFailed:         "Chat failed. Please try again.",
    warmupWarning:        "The prediction server is warming up. This can take 30–60 seconds on the first request — please wait…",
    predFailed:           "Prediction Failed",
    dismiss:              "Dismiss",
    timedOut:             "Request timed out after 90 seconds. The server is warming up — please wait a moment and try again.",
    networkError:         "Network error: could not reach the prediction server. Please check your connection and try again.",
    loadingMap:           "Loading map…",
    loadingAI:            "Loading AI assistant…",
    suggest1:             "What does this confidence score mean?",
    suggest2:             "Should I deploy a patrol unit?",
    suggest3:             "Explain the triage status",
    suggest4:             "What is a tier-1 high risk case?",
    navOverview:          "Overview",
    navOverviewSub:       "Risk Heatmap & Filters",
    navNewComplaintSub:   "Intake & Hotspot Prediction",
    navAIAssistantSub:    "Groq Intelligence Chat",
    navAlerts:            "Live Alerts",
    navAlertsSub:         "LEA & Bank Dispatches",
    navInvestigator:      "Investigator View",
    navInvestigatorSub:   "LEA Case Dockets",
    navAuditSub:          "SHA-256 Hash Chain",
    roleCitizen:          "Citizen Triage",
    roleInvestigator:     "Investigator (LEA)",
    radarActive:          "RADAR ACTIVE",
    portal:               "Portal",
  },
  hi: {
    appName:              "CipherTrace",
    appSub:               "साइबर अपराध नकद निकासी खुफिया · प्रतिबंधित उपयोग",
    modelActive:          "मॉडल v2.1 सक्रिय",
    live:                 "लाइव",
    complaintsProcessed:  "शिकायतें प्रसंस्कृत",
    rolling30:            "30-दिन का रोलिंग डेटा",
    activeHotspots:       "सक्रिय हॉटस्पॉट क्षेत्र",
    zonesUnder:           "निगरानी में क्षेत्र",
    topFraud:             "शीर्ष धोखाधड़ी श्रेणी",
    topFraudSub:          "सभी पंजीकृत शिकायतों का 38%",
    newComplaint:         "नई शिकायत प्रविष्टि",
    newComplaintSub:      "सभी फ़ील्ड आवश्यक · निर्देशांक भरने के लिए मानचित्र खोज का उपयोग करें",
    victimLat:            "पीड़ित अक्षांश",
    victimLon:            "पीड़ित देशांतर",
    fraudAmount:          "धोखाधड़ी राशि (₹)",
    accountAge:           "संदिग्ध खाता आयु (दिन)",
    hourOfDay:            "दिन का घंटा (0–23)",
    dayOfWeek:            "सप्ताह का दिन",
    fraudType:            "धोखाधड़ी प्रकार",
    bank:                 "पीड़ित का बैंक",
    predict:              "निकासी स्थान का अनुमान लगाएं",
    predicting:           "पैटर्न विश्लेषण हो रहा है…",
    predictionResult:     "भविष्यवाणी परिणाम",
    predictionResultSub:  "रियल-टाइम ML आउटपुट",
    noPredict:            "अभी तक कोई भविष्यवाणी नहीं",
    noPredictSub:         "शिकायत फॉर्म भरें और ML-आधारित हॉटस्पॉट पूर्वानुमान के लिए अनुमान पर क्लिक करें।",
    topPredictedZones:    "शीर्ष अनुमानित क्षेत्र",
    primaryConfidence:    "प्राथमिक विश्वास",
    estWindow:            "अनुमानित निकासी विंडो",
    recommendedAction:    "अनुशंसित कार्रवाई",
    mapTitle:             "लाइव हॉटस्पॉट ज़ोन मानचित्र",
    mapSub:               "भारत · एटीएम निकासी क्लस्टर विश्लेषण · निर्देशांक भरने के लिए खोजें",
    knownHotspot:         "ज्ञात हॉटस्पॉट",
    pred1:                "#1 अनुमानित",
    pred2:                "#2 अनुमानित",
    pred3:                "#3 अनुमानित",
    auditLog:             "ऑडिट लॉग",
    auditSub:             "अपरिवर्तनीय भविष्यवाणी इतिहास",
    chainVerified:        "श्रृंखला सत्यापित ✓",
    tampered:             "छेड़छाड़ ✗",
    refresh:              "रीफ़्रेश",
    noLogs:               "अभी तक कोई भविष्यवाणी दर्ज नहीं की गई।",
    loadingAudit:         "ऑडिट लॉग लोड हो रहा है…",
    colTimestamp:         "समय",
    colFraudType:         "धोखाधड़ी प्रकार",
    colBank:              "बैंक",
    colZone:              "अनुमानित क्षेत्र",
    colConfidence:        "विश्वास",
    colTriage:            "ट्राइएज",
    aiAssistant:          "एआई जांच सहायक",
    aiSub:                "ग्रोक द्वारा संचालित · भविष्यवाणियों और धोखाधड़ी पैटर्न के बारे में प्रश्न पूछें",
    aiContext:            "संदर्भ",
    aiWelcomeTitle:       "CipherTrace AI",
    aiWelcomeText:        "धोखाधड़ी पैटर्न, भविष्यवाणी विश्वास, या जांच चरणों के बारे में पूछें।",
    aiWelcomeCtx:         "मेरे पास आपकी नवीनतम भविष्यवाणी का संदर्भ है।",
    aiInputPlaceholder:   "धोखाधड़ी पैटर्न, विश्वास स्कोर के बारे में पूछें…",
    aiInputCtxPlaceholder:"के बारे में पूछें",
    aiFooter:             "भेजने के लिए Enter दबाएं · ग्रोक एआई",
    aiChatFailed:         "चैट विफल रही। कृपया पुनः प्रयास करें।",
    warmupWarning:        "सर्वर शुरू हो रहा है। कृपया प्रतीक्षा करें…",
    predFailed:           "भविष्यवाणी विफल",
    dismiss:              "खारिज करें",
    timedOut:             "अनुरोध का समय समाप्त हो गया।",
    networkError:         "नेटवर्क त्रुटि: सर्वर से संपर्क नहीं हो सका।",
    loadingMap:           "मानचित्र लोड हो रहा है…",
    loadingAI:            "एआई सहायक लोड हो रहा है…",
    suggest1:             "इस विश्वास स्कोर का क्या अर्थ है?",
    suggest2:             "क्या मुझे गश्ती दल तैनात करना चाहिए?",
    suggest3:             "ट्राइएज स्थिति स्पष्ट करें",
    suggest4:             "टियर-1 उच्च जोखिम क्या है?",
    navOverview:          "अवलोकन",
    navOverviewSub:       "जोखिम हीटमैप व फ़िल्टर",
    navNewComplaintSub:   "शिकायत व हॉटस्पॉट अनुमान",
    navAIAssistantSub:    "ग्रोक इंटेलिजेंस चैट",
    navAlerts:            "लाइव अलर्ट",
    navAlertsSub:         "पुलिस व बैंक प्रेषण",
    navInvestigator:      "अन्वेषक पोर्टल",
    navInvestigatorSub:   "पुलिस केस डॉकेट्स",
    navAuditSub:          "SHA-256 हैश श्रृंखला",
    roleCitizen:          "नागरिक पोर्टल",
    roleInvestigator:     "अन्वेषक (पुलिस)",
    radarActive:          "रडार सक्रिय",
    portal:               "पोर्टल",
  },
  ta: {
    ...enJson,
    ...taJson,
    appName:              "CipherTrace",
    appSub:               "சைபர் குற்ற பணம் திரும்பப் பெறும் நுண்ணறிவு · கட்டுப்படுத்தப்பட்ட பயன்பாடு",
    modelActive:          "மாதிரி v2.1 செயலில்",
    live:                 "நேரடி",
    complaintsProcessed:  "புகார்கள் செயலாக்கப்பட்டன",
    rolling30:            "30-நாள் உருளும் தரவு",
    activeHotspots:       "செயலில் உள்ள ஹாட்ஸ்பாட் மண்டலங்கள்",
    zonesUnder:           "கண்காணிப்பில் உள்ள மண்டலங்கள்",
    topFraud:             "சிறந்த மோசடி வகை",
    topFraudSub:          "அனைத்து பதிவு புகார்களில் 38%",
    newComplaint:         "புதிய புகார் பதிவு",
    newComplaintSub:      "அனைத்து புலங்களும் தேவை · ஆள்கூறுகளை நிரப்ப வரைபட தேடலை பயன்படுத்தவும்",
    victimLat:            "பாதிக்கப்பட்டவர் அட்சரேகை",
    victimLon:            "பாதிக்கப்பட்டவர் தீர்க்கரேகை",
    fraudAmount:          "மோசடி தொகை (₹)",
    accountAge:           "சந்தேகாஸ்பதமான கணக்கு வயது (நாட்கள்)",
    hourOfDay:            "நாளின் மணி (0–23)",
    dayOfWeek:            "வாரத்தின் நாள்",
    fraudType:            "மோசடி வகை",
    bank:                 "பாதிக்கப்பட்டவரின் வங்கி",
    predict:              "திரும்பப் பெறும் இடத்தை கணிக்க",
    predicting:           "வடிவத்தை பகுப்பாய்வு செய்கிறது…",
    predictionResult:     "கணிப்பு முடிவு",
    predictionResultSub:  "நிகழ்நேர ML வெளியீடு",
    noPredict:            "இன்னும் கணிப்பு இல்லை",
    noPredictSub:         "புகார் படிவத்தை நிரப்பி கணிக்க கிளிக் செய்யவும்.",
    topPredictedZones:    "சிறந்த கணிக்கப்பட்ட மண்டலங்கள்",
    primaryConfidence:    "முதன்மை நம்பிக்கை",
    estWindow:            "மதிப்பிடப்பட்ட திரும்பப் பெறும் சாளரம்",
    recommendedAction:    "பரிந்துரைக்கப்பட்ட நடவடிக்கை",
    mapTitle:             "நேரடி ஹாட்ஸ்பாட் மண்டல வரைபடம்",
    mapSub:               "இந்தியா · ATM திரும்பப் பெறுதல் கிளஸ்டர் பகுப்பாய்வு",
    knownHotspot:         "அறியப்பட்ட ஹாட்ஸ்பாட்",
    pred1:                "#1 கணிக்கப்பட்டது",
    pred2:                "#2 கணிக்கப்பட்டது",
    pred3:                "#3 கணிக்கப்பட்டது",
    auditLog:             "தணிக்கை பதிவு",
    auditSub:             "சேதப்படுத்த-எதிர்ப்பு கணிப்பு வரலாறு",
    chainVerified:        "சங்கிலி சரிபார்க்கப்பட்டது ✓",
    tampered:             "சேதப்படுத்தப்பட்டது ✗",
    refresh:              "புதுப்பி",
    noLogs:               "இன்னும் பதிவுகள் இல்லை. மேலே உங்கள் முதல் கணிப்பை செய்யுங்கள்.",
    loadingAudit:         "தணிக்கை பதிவு ஏற்றுகிறது…",
    colTimestamp:         "நேரம்",
    colFraudType:         "மோசடி வகை",
    colBank:              "வங்கி",
    colZone:              "கணிக்கப்பட்ட மண்டலம்",
    colConfidence:        "நம்பிக்கை",
    colTriage:            "ட்ரையேஜ்",
    aiAssistant:          "AI விசாரணை உதவியாளர்",
    aiSub:                "Groq ஆல் இயக்கப்படுகிறது · கணிப்புகள் பற்றி கேளுங்கள்",
    aiContext:            "சூழல்",
    aiWelcomeTitle:       "CipherTrace AI",
    aiWelcomeText:        "மோசடி வடிவங்கள், கணிப்பு நம்பிக்கை பற்றி என்னிடம் கேளுங்கள்.",
    aiWelcomeCtx:         "உங்கள் சமீபத்திய கணிப்பின் சூழல் என்னிடம் உள்ளது. எதை வேண்டுமானாலும் கேளுங்கள்.",
    aiInputPlaceholder:   "மோசடி வடிவங்கள் பற்றி கேளுங்கள்…",
    aiInputCtxPlaceholder:"கேளுங்கள்",
    aiFooter:             "அனுப்ப Enter அழுத்தவும் · Groq AI",
    aiChatFailed:         "அரட்டை தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
    warmupWarning:        "கணிப்பு சேவையகம் தயாராகிறது. 30-60 வினாடிகள் ஆகலாம்.",
    predFailed:           "கணிப்பு தோல்வியடைந்தது",
    dismiss:              "மூடு",
    timedOut:             "90 வினாடிகளுக்குப் பிறகு நேரம் முடிந்தது.",
    networkError:         "நெட்வொர்க் பிழை: சேவையகத்தை அடைய முடியவில்லை.",
    loadingMap:           "வரைபடம் ஏற்றுகிறது…",
    loadingAI:            "AI உதவியாளரை ஏற்றுகிறது…",
    suggest1:             "இந்த நம்பிக்கை மதிப்பெண்ணின் அர்த்தம் என்ன?",
    suggest2:             "ரோந்து படையை அனுப்ப வேண்டுமா?",
    suggest3:             "ட்ரையேஜ் நிலையை விளக்கவும்",
    suggest4:             "டியர்-1 அதிக ஆபத்து என்றால் என்ன?",
  },
  te: {
    appName:              "CipherTrace",
    appSub:               "సైబర్ నేరం నగదు ఉపసంహరణ నిఘా · పరిమిత వినియోగం",
    modelActive:          "మోడల్ v2.1 సక్రియం",
    live:                 "లైవ్",
    complaintsProcessed:  "ఫిర్యాదులు ప్రాసెస్ చేయబడ్డాయి",
    rolling30:            "30-రోజుల డేటా",
    activeHotspots:       "సక్రియ హాట్‌స్పాట్ జోన్లు",
    zonesUnder:           "నిఘాలో ఉన్న జోన్లు",
    topFraud:             "అగ్ర మోసం వర్గం",
    topFraudSub:          "అన్ని ఫిర్యాదుల 38%",
    newComplaint:         "కొత్త ఫిర్యాదు నమోదు",
    newComplaintSub:      "అన్ని ఫీల్డ్‌లు అవసరం",
    victimLat:            "బాధితుడి అక్షాంశం",
    victimLon:            "బాధితుడి రేఖాంశం",
    fraudAmount:          "మోసం మొత్తం (₹)",
    accountAge:           "అనుమానిత ఖాతా వయసు (రోజులు)",
    hourOfDay:            "రోజు గంట (0–23)",
    dayOfWeek:            "వారంలో రోజు",
    fraudType:            "మోసం రకం",
    bank:                 "బాధితుడి బ్యాంక్",
    predict:              "ఉపసంహరణ స్థానాన్ని అంచనా వేయండి",
    predicting:           "నమూనా విశ్లేషణ జరుగుతోంది…",
    predictionResult:     "అంచనా ఫలితం",
    predictionResultSub:  "రియల్-టైమ్ ML అవుట్‌పుట్",
    noPredict:            "ఇంకా అంచనా లేదు",
    noPredictSub:         "ఫారమ్ నింపి అంచనా వేయండి.",
    topPredictedZones:    "అగ్ర అంచనా జోన్లు",
    primaryConfidence:    "ప్రాథమిక విశ్వాసం",
    estWindow:            "అంచనా ఉపసంహరణ వింటో",
    recommendedAction:    "సిఫార్సు చేయబడిన చర్య",
    mapTitle:             "లైవ్ హాట్‌స్పాట్ జోన్ మ్యాప్",
    mapSub:               "భారతదేశం · ATM ఉపసంహరణ క్లస్టర్ విశ్లేషణ",
    knownHotspot:         "తెలిసిన హాట్‌స్పాట్",
    pred1:                "#1 అంచనా",
    pred2:                "#2 అంచనా",
    pred3:                "#3 అంచనా",
    auditLog:             "ఆడిట్ లాగ్",
    auditSub:             "టాంపర్-నిరోధక అంచనా చరిత్ర",
    chainVerified:        "చైన్ ధృవీకరించబడింది ✓",
    tampered:             "టాంపర్ చేయబడింది ✗",
    refresh:              "రిఫ్రెష్",
    noLogs:               "ఇంకా లాగ్‌లు లేవు.",
    loadingAudit:         "ఆడిట్ లాగ్ లోడ్ అవుతోంది…",
    colTimestamp:         "సమయం",
    colFraudType:         "మోసం రకం",
    colBank:              "బ్యాంక్",
    colZone:              "అంచనా జోన్",
    colConfidence:        "విశ్వాసం",
    colTriage:            "ట్రైయేజ్",
    aiAssistant:          "AI దర్యాప్తు సహాయకుడు",
    aiSub:                "Groq ద్వారా నడపబడుతుంది",
    aiContext:            "సందర్భం",
    aiWelcomeTitle:       "CipherTrace AI",
    aiWelcomeText:        "మోసం నమూనాల గురించి అడగండి.",
    aiWelcomeCtx:         "మీ తాజా అంచనా సందర్భం నా దగ్గర ఉంది.",
    aiInputPlaceholder:   "అడగండి…",
    aiInputCtxPlaceholder:"అడగండి",
    aiFooter:             "పంపడానికి Enter నొక్కండి · Groq AI",
    aiChatFailed:         "చాట్ విఫలమైంది. మళ్ళీ ప్రయత్నించండి.",
    warmupWarning:        "సర్వర్ వేడెక్కుతోంది. దయచేసి వేచి ఉండండి…",
    predFailed:           "అంచనా విఫలమైంది",
    dismiss:              "తొలగించు",
    timedOut:             "అభ్యర్థన గడువు ముగిసింది.",
    networkError:         "నెట్‌వర్క్ లోపం.",
    loadingMap:           "మ్యాప్ లోడ్ అవుతోంది…",
    loadingAI:            "AI అసిస్టెంట్ లోడ్ అవుతోంది…",
    suggest1:             "ఈ కాన్ఫిడెన్స్ స్కోర్ అర్థం ఏమిటి?",
    suggest2:             "పెట్రోల్ యూనిట్ పంపాలా?",
    suggest3:             "ట్రైయేజ్ స్థితిని వివరించండి",
    suggest4:             "టియర్-1 అధిక ప్రమాదం అంటే ఏమిటి?",
  },
  kn: {
    appName: "CipherTrace", appSub: "ಸೈಬರ್ ಅಪರಾಧ ನಗದು ಹಿಂಪಡೆಯುವ ಗುಪ್ತಚರ · ಸೀಮಿತ ಬಳಕೆ",
    modelActive: "ಮಾದರಿ v2.1 ಸಕ್ರಿಯ", live: "ನೇರ",
    complaintsProcessed: "ದೂರುಗಳು ಸಂಸ್ಕರಿಸಲಾಗಿದೆ", rolling30: "30-ದಿನ ದತ್ತಾಂಶ",
    activeHotspots: "ಸಕ್ರಿಯ ಹಾಟ್‌ಸ್ಪಾಟ್ ವಲಯಗಳು", zonesUnder: "ನಿಗಾದಲ್ಲಿರುವ ವಲಯಗಳು",
    topFraud: "ಮುಖ್ಯ ವಂಚನೆ ವರ್ಗ", topFraudSub: "ಎಲ್ಲಾ ದೂರುಗಳ 38%",
    newComplaint: "ಹೊಸ ದೂರು ನಮೂದಿಸಿ", newComplaintSub: "ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳು ಅಗತ್ಯ",
    victimLat: "ಸಂತ್ರಸ್ತರ ಅಕ್ಷಾಂಶ", victimLon: "ಸಂತ್ರಸ್ತರ ರೇಖಾಂಶ",
    fraudAmount: "ವಂಚನೆ ಮೊತ್ತ (₹)", accountAge: "ಶಂಕಿತ ಖಾತೆ ವಯಸ್ಸು (ದಿನಗಳು)",
    hourOfDay: "ದಿನದ ಗಂಟೆ (0–23)", dayOfWeek: "ವಾರದ ದಿನ",
    fraudType: "ವಂಚನೆ ಪ್ರಕಾರ", bank: "ಸಂತ್ರಸ್ತರ ಬ್ಯಾಂಕ್",
    predict: "ಹಿಂಪಡೆಯುವ ಸ್ಥಳ ಊಹಿಸಿ", predicting: "ಮಾದರಿ ವಿಶ್ಲೇಷಣೆ…",
    predictionResult: "ಊಹೆ ಫಲಿತಾಂಶ", predictionResultSub: "ರಿಯಲ್-ಟೈಮ್ ML ಔಟ್‌ಪುಟ್",
    noPredict: "ಇನ್ನು ಊಹೆ ಇಲ್ಲ", noPredictSub: "ಫಾರ್ಮ್ ತುಂಬಿ ಊಹೆ ಮಾಡಿ.",
    topPredictedZones: "ಮೇಲ್ ಊಹೆ ವಲಯಗಳು", primaryConfidence: "ಪ್ರಾಥಮಿಕ ವಿಶ್ವಾಸ",
    estWindow: "ಅಂದಾಜು ಹಿಂಪಡೆಯುವ ಕಿಟಕಿ", recommendedAction: "ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ",
    mapTitle: "ನೇರ ಹಾಟ್‌ಸ್ಪಾಟ್ ವಲಯ ನಕ್ಷೆ", mapSub: "ಭಾರತ · ATM ಹಿಂಪಡೆಯುವ ಕ್ಲಸ್ಟರ್ ವಿಶ್ಲೇಷಣೆ",
    knownHotspot: "ತಿಳಿದ ಹಾಟ್‌ಸ್ಪಾಟ್", pred1: "#1 ಊಹಿಸಲಾಗಿದೆ", pred2: "#2 ಊಹಿಸಲಾಗಿದೆ", pred3: "#3 ಊಹಿಸಲಾಗಿದೆ",
    auditLog: "ಆಡಿಟ್ ಲಾಗ್", auditSub: "ಊಹೆ ಇತಿಹಾಸ", chainVerified: "ಸರಪಳಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ ✓", tampered: "ಟ್ಯಾಂಪರ್ ✗",
    refresh: "ರಿಫ್ರೆಶ್", noLogs: "ಇನ್ನು ಲಾಗ್‌ಗಳಿಲ್ಲ.", loadingAudit: "ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
    colTimestamp: "ಸಮಯ", colFraudType: "ವಂಚನೆ ಪ್ರಕಾರ", colBank: "ಬ್ಯಾಂಕ್",
    colZone: "ಊಹೆ ವಲಯ", colConfidence: "ವಿಶ್ವಾಸ", colTriage: "ಟ್ರಯೇಜ್",
    aiAssistant: "AI ತನಿಖಾ ಸಹಾಯಕ", aiSub: "Groq ಮೂಲಕ ಚಾಲಿತ",
    aiContext: "ಸಂದರ್ಭ", aiWelcomeTitle: "CipherTrace AI",
    aiWelcomeText: "ವಂಚನೆ ಮಾದರಿಗಳ ಬಗ್ಗೆ ಕೇಳಿ.", aiWelcomeCtx: "ನಿಮ್ಮ ಊಹೆಯ ಸಂದರ್ಭ ನನ್ನಲ್ಲಿದೆ.",
    aiInputPlaceholder: "ಕೇಳಿ…", aiInputCtxPlaceholder: "ಕೇಳಿ",
    aiFooter: "ಕಳುಹಿಸಲು Enter · Groq AI", aiChatFailed: "ಚಾಟ್ ವಿಫಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    warmupWarning: "ಸರ್ವರ್ ಬಿಸಿಯಾಗುತ್ತಿದೆ…", predFailed: "ಊಹೆ ವಿಫಲ",
    dismiss: "ತೆಗೆ", timedOut: "ಸಮಯ ಮೀರಿತು.", networkError: "ನೆಟ್‌ವರ್ಕ್ ದೋಷ.",
    loadingMap: "ನಕ್ಷೆ ಲೋಡ್…", loadingAI: "AI ಲೋಡ್…",
    suggest1: "ಈ ವಿಶ್ವಾಸ ಸ್ಕೋರ್ ಅರ್ಥವೇನು?", suggest2: "ಗಸ್ತು ತಂಡ ಕಳುಹಿಸಬೇಕೇ?",
    suggest3: "ಟ್ರಯೇಜ್ ಸ್ಥಿತಿ ವಿವರಿಸಿ", suggest4: "ಟಯರ್-1 ಹೆಚ್ಚಿನ ಅಪಾಯ ಎಂದರೇನು?",
  },
  ml: {
    appName: "CipherTrace", appSub: "സൈബർ കുറ്റകൃത്യ നോട്ടുക്കടൽ ഇന്റലിജൻസ് · പരിമിത ഉപയോഗം",
    modelActive: "മോഡൽ v2.1 സക്രിയം", live: "തത്സമയം",
    complaintsProcessed: "പരാതികൾ പ്രോസസ്സ് ചെയ്തു", rolling30: "30 ദിവസ ഡേറ്റ",
    activeHotspots: "സജീവ ഹോട്ട്‌സ്‌പോട്ട് മേഖലകൾ", zonesUnder: "നിരീക്ഷണത്തിലുള്ള മേഖലകൾ",
    topFraud: "മുൻനിര തട്ടിപ്പ് വിഭാഗം", topFraudSub: "എല്ലാ പരാതികളുടെയും 38%",
    newComplaint: "പുതിയ പരാതി നൽകൽ", newComplaintSub: "എല്ലാ ഫീൽഡുകളും ആവശ്യമാണ്",
    victimLat: "ഇരയുടെ അക്ഷാംശം", victimLon: "ഇരയുടെ രേഖാംശം",
    fraudAmount: "തട്ടിപ്പ് തുക (₹)", accountAge: "സംശയ അക്കൗണ്ട് പഴക്കം (ദിവസം)",
    hourOfDay: "ദിവസത്തെ മണിക്കൂർ (0–23)", dayOfWeek: "ആഴ്ചയിലെ ദിവസം",
    fraudType: "തട്ടിപ്പ് തരം", bank: "ഇരയുടെ ബാങ്ക്",
    predict: "പിൻവലിക്കൽ സ്ഥലം പ്രവചിക്കുക", predicting: "പാറ്റേൺ വിശകലനം…",
    predictionResult: "പ്രവചന ഫലം", predictionResultSub: "റിയൽ-ടൈം ML ഔട്ട്പുട്ട്",
    noPredict: "ഇതുവരെ പ്രവചനം ഇല്ല", noPredictSub: "ഫോം പൂരിപ്പിച്ച് പ്രവചിക്കുക.",
    topPredictedZones: "മുൻ പ്രവചന മേഖലകൾ", primaryConfidence: "പ്രാഥമിക വിശ്വാസ്യത",
    estWindow: "കണക്കാക്കിയ പിൻവലിക്കൽ വിൻഡോ", recommendedAction: "ശുപാർശ ചെയ്ത നടപടി",
    mapTitle: "തത്സമയ ഹോട്ട്‌സ്‌പോട്ട് മേഖല ഭൂപടം", mapSub: "ഇന്ത്യ · ATM വിശകലനം",
    knownHotspot: "അറിയപ്പെടുന്ന ഹോട്ട്‌സ്‌പോട്ട്", pred1: "#1 പ്രവചനം", pred2: "#2 പ്രവചനം", pred3: "#3 പ്രവചനം",
    auditLog: "ഓഡിറ്റ് ലോഗ്", auditSub: "തട്ടിക്കളി-വിരുദ്ധ ചരിത്രം", chainVerified: "ശൃംഖല സ്ഥിരീകരിച്ചു ✓", tampered: "തട്ടിക്കളി ✗",
    refresh: "പുതുക്കുക", noLogs: "ഇതുവരെ ലോഗുകൾ ഇല്ല.", loadingAudit: "ലോഡ് ചെയ്യുന്നു…",
    colTimestamp: "സമയം", colFraudType: "തട്ടിപ്പ് തരം", colBank: "ബാങ്ക്",
    colZone: "പ്രവചന മേഖല", colConfidence: "വിശ്വാസ്യത", colTriage: "ട്രൈയേജ്",
    aiAssistant: "AI അന്വേഷണ സഹായി", aiSub: "Groq ഉപയോഗിക്കുന്നു",
    aiContext: "സന്ദർഭം", aiWelcomeTitle: "CipherTrace AI",
    aiWelcomeText: "തട്ടിപ്പ് പാറ്റേണുകളെക്കുറിച്ച് ചോദിക്കൂ.", aiWelcomeCtx: "നിങ്ങളുടെ പ്രവചനത്തിന്റെ സന്ദർഭം എന്നിലുണ്ട്.",
    aiInputPlaceholder: "ചോദിക്കൂ…", aiInputCtxPlaceholder: "ചോദിക്കൂ",
    aiFooter: "അയക്കാൻ Enter · Groq AI", aiChatFailed: "ചാറ്റ് പരാജയപ്പെട്ടു.",
    warmupWarning: "സർവർ ചൂടുപിടിക്കുന്നു…", predFailed: "പ്രവചനം പരാജയപ്പെട്ടു",
    dismiss: "നീക്കുക", timedOut: "സമയം കഴിഞ്ഞു.", networkError: "നെറ്റ്‌വർക്ക് പിശക്.",
    loadingMap: "ഭൂപടം ലോഡ്…", loadingAI: "AI ലോഡ്…",
    suggest1: "ഈ കോൺഫിഡൻസ് സ്കോർ എന്താണ്?", suggest2: "പട്രോൾ അയക്കണോ?",
    suggest3: "ട്രൈയേജ് സ്ഥിതി വിശദീകരിക്കൂ", suggest4: "ടയർ-1 ഉയർന്ന ഭീഷണി എന്തൊക്കെ?",
  },
  bn: {
    appName: "CipherTrace", appSub: "সাইবার অপরাধ নগদ উত্তোলন গোয়েন্দা · সীমাবদ্ধ ব্যবহার",
    modelActive: "মডেল v2.1 সক্রিয়", live: "লাইভ",
    complaintsProcessed: "অভিযোগ প্রক্রিয়াকৃত", rolling30: "৩০-দিনের ডেটা",
    activeHotspots: "সক্রিয় হটস্পট এলাকা", zonesUnder: "নজরদারিতে এলাকা",
    topFraud: "শীর্ষ প্রতারণা বিভাগ", topFraudSub: "সব অভিযোগের ৩৮%",
    newComplaint: "নতুন অভিযোগ প্রবেশ", newComplaintSub: "সব ক্ষেত্র প্রয়োজন",
    victimLat: "ভিকটিমের অক্ষাংশ", victimLon: "ভিকটিমের দ্রাঘিমাংশ",
    fraudAmount: "প্রতারণার পরিমাণ (₹)", accountAge: "সন্দেহভাজন অ্যাকাউন্টের বয়স (দিন)",
    hourOfDay: "দিনের ঘণ্টা (০–২৩)", dayOfWeek: "সপ্তাহের দিন",
    fraudType: "প্রতারণার ধরন", bank: "ভিকটিমের ব্যাংক",
    predict: "উত্তোলনের স্থান পূর্বাভাস দিন", predicting: "প্যাটার্ন বিশ্লেষণ…",
    predictionResult: "পূর্বাভাস ফলাফল", predictionResultSub: "রিয়েল-টাইম ML আউটপুট",
    noPredict: "এখনো পূর্বাভাস নেই", noPredictSub: "ফর্ম পূরণ করুন এবং পূর্বাভাস ক্লিক করুন।",
    topPredictedZones: "শীর্ষ পূর্বাভাস এলাকা", primaryConfidence: "প্রাথমিক আস্থা",
    estWindow: "আনুমানিক উত্তোলন উইন্ডো", recommendedAction: "প্রস্তাবিত পদক্ষেপ",
    mapTitle: "লাইভ হটস্পট এলাকা মানচিত্র", mapSub: "ভারত · ATM বিশ্লেষণ",
    knownHotspot: "পরিচিত হটস্পট", pred1: "#১ পূর্বাভাস", pred2: "#২ পূর্বাভাস", pred3: "#৩ পূর্বাভাস",
    auditLog: "অডিট লগ", auditSub: "টেম্পার-প্রতিরোধী ইতিহাস", chainVerified: "চেইন যাচাই ✓", tampered: "টেম্পার ✗",
    refresh: "রিফ্রেশ", noLogs: "এখনো লগ নেই।", loadingAudit: "লোড হচ্ছে…",
    colTimestamp: "সময়", colFraudType: "প্রতারণার ধরন", colBank: "ব্যাংক",
    colZone: "পূর্বাভাস এলাকা", colConfidence: "আস্থা", colTriage: "ট্রায়াজ",
    aiAssistant: "AI তদন্ত সহায়ক", aiSub: "Groq চালিত",
    aiContext: "প্রসঙ্গ", aiWelcomeTitle: "CipherTrace AI",
    aiWelcomeText: "প্রতারণার ধরন সম্পর্কে জিজ্ঞেস করুন।", aiWelcomeCtx: "আপনার সর্বশেষ পূর্বাভাসের প্রসঙ্গ আমার কাছে আছে।",
    aiInputPlaceholder: "জিজ্ঞেস করুন…", aiInputCtxPlaceholder: "জিজ্ঞেস করুন",
    aiFooter: "পাঠাতে Enter · Groq AI", aiChatFailed: "চ্যাট ব্যর্থ। আবার চেষ্টা করুন।",
    warmupWarning: "সার্ভার গরম হচ্ছে…", predFailed: "পূর্বাভাস ব্যর্থ",
    dismiss: "বাতিল", timedOut: "সময় শেষ।", networkError: "নেটওয়ার্ক ত্রুটি।",
    loadingMap: "মানচিত্র লোড…", loadingAI: "AI লোড…",
    suggest1: "এই আস্থা স্কোর মানে কী?", suggest2: "টহল দল পাঠানো উচিত?",
    suggest3: "ট্রায়াজ স্ট্যাটাস ব্যাখ্যা করুন", suggest4: "টায়ার-১ উচ্চ ঝুঁকি কী?",
  },
  mr: {
    appName: "CipherTrace", appSub: "सायबर गुन्हा रोख निकासी गुप्तचर · मर्यादित वापर",
    modelActive: "मॉडेल v2.1 सक्रिय", live: "थेट",
    complaintsProcessed: "तक्रारी प्रक्रिया केल्या", rolling30: "३०-दिवस डेटा",
    activeHotspots: "सक्रिय हॉटस्पॉट क्षेत्रे", zonesUnder: "देखरेखीत क्षेत्रे",
    topFraud: "शीर्ष फसवणूक श्रेणी", topFraudSub: "सर्व तक्रारींपैकी ३८%",
    newComplaint: "नवीन तक्रार नोंद", newComplaintSub: "सर्व फील्ड आवश्यक",
    victimLat: "पीडिताचा अक्षांश", victimLon: "पीडिताचा रेखांश",
    fraudAmount: "फसवणुकीची रक्कम (₹)", accountAge: "संशयित खाते वय (दिवस)",
    hourOfDay: "दिवसाचा तास (0–23)", dayOfWeek: "आठवड्याचा दिवस",
    fraudType: "फसवणुकीचा प्रकार", bank: "पीडिताचे बँक",
    predict: "निकासी स्थान अंदाज करा", predicting: "नमुना विश्लेषण…",
    predictionResult: "अंदाज परिणाम", predictionResultSub: "रिअल-टाइम ML आउटपुट",
    noPredict: "अजून अंदाज नाही", noPredictSub: "फॉर्म भरा आणि अंदाज करा.",
    topPredictedZones: "शीर्ष अंदाजित क्षेत्रे", primaryConfidence: "प्राथमिक विश्वास",
    estWindow: "अंदाजित निकासी विंडो", recommendedAction: "शिफारस केलेली कृती",
    mapTitle: "थेट हॉटस्पॉट क्षेत्र नकाशा", mapSub: "भारत · ATM विश्लेषण",
    knownHotspot: "ज्ञात हॉटस्पॉट", pred1: "#1 अंदाज", pred2: "#2 अंदाज", pred3: "#3 अंदाज",
    auditLog: "ऑडिट लॉग", auditSub: "छेडछाड-विरोधी इतिहास", chainVerified: "साखळी सत्यापित ✓", tampered: "छेडछाड ✗",
    refresh: "रिफ्रेश", noLogs: "अजून लॉग नाहीत.", loadingAudit: "लोड होत आहे…",
    colTimestamp: "वेळ", colFraudType: "फसवणुकीचा प्रकार", colBank: "बँक",
    colZone: "अंदाजित क्षेत्र", colConfidence: "विश्वास", colTriage: "ट्रायेज",
    aiAssistant: "AI तपास सहाय्यक", aiSub: "Groq द्वारे चालवले",
    aiContext: "संदर्भ", aiWelcomeTitle: "CipherTrace AI",
    aiWelcomeText: "फसवणूक नमुन्यांबद्दल विचारा.", aiWelcomeCtx: "तुमच्या अंदाजाचा संदर्भ माझ्याकडे आहे.",
    aiInputPlaceholder: "विचारा…", aiInputCtxPlaceholder: "विचारा",
    aiFooter: "पाठवण्यासाठी Enter · Groq AI", aiChatFailed: "चॅट अयशस्वी. पुन्हा प्रयत्न करा.",
    warmupWarning: "सर्व्हर गरम होत आहे…", predFailed: "अंदाज अयशस्वी",
    dismiss: "बंद करा", timedOut: "वेळ संपली.", networkError: "नेटवर्क त्रुटी.",
    loadingMap: "नकाशा लोड…", loadingAI: "AI लोड…",
    suggest1: "या विश्वास स्कोरचा अर्थ काय?", suggest2: "गस्त पथक पाठवायचे का?",
    suggest3: "ट्रायेज स्थिती स्पष्ट करा", suggest4: "टियर-1 उच्च धोका म्हणजे काय?",
  },
  gu: {
    appName: "CipherTrace", appSub: "સાઇબર ગુના રોકડ ઉપાડ ઇન્ટેલિજન્સ · મર્યાદિત ઉપયોગ",
    modelActive: "મોડેલ v2.1 સક્રિય", live: "લાઈવ",
    complaintsProcessed: "ફરિયાદો પ્રોસેસ", rolling30: "30-દિવસ ડેટા",
    activeHotspots: "સક્રિય હોટસ્પોટ ઝોન", zonesUnder: "નિગ્રાની હેઠળ ઝોન",
    topFraud: "ટોચ છેતરપિંડી શ્રેણી", topFraudSub: "બધી ફરિયાદોનો 38%",
    newComplaint: "નવી ફરિયાદ નોંધ", newComplaintSub: "બધા ફીલ્ડ જરૂરી",
    victimLat: "પીડિતાનો અક્ષાંશ", victimLon: "પીડિતાનો રેખાંશ",
    fraudAmount: "છેતરપિંડી રકમ (₹)", accountAge: "શંકાસ્પદ ખાતાની ઉંમર (દિવસ)",
    hourOfDay: "દિવસ કલાક (0–23)", dayOfWeek: "અઠવાડિયાનો દિવસ",
    fraudType: "છેતરપિંડી પ્રકાર", bank: "પીડિતાની બેંક",
    predict: "ઉપાડ સ્થળ અનુમાન", predicting: "પેટર્ન વિશ્લેષણ…",
    predictionResult: "અનુમાન પરિણામ", predictionResultSub: "રીઅલ-ટાઇમ ML આઉટપુટ",
    noPredict: "હજુ અનુમાન નથી", noPredictSub: "ફોર્મ ભરો અને અનુમાન કરો.",
    topPredictedZones: "ટોચ અનુમાન ઝોન", primaryConfidence: "પ્રાથમિક વિશ્વાસ",
    estWindow: "અંદાજિત ઉપાડ વિન્ડો", recommendedAction: "ભલામણ કરેલ ક્રિયા",
    mapTitle: "લાઈવ હોટસ્પોટ ઝોન નકશો", mapSub: "ભારત · ATM વિશ્લેષણ",
    knownHotspot: "જાણીતો હોટસ્પોટ", pred1: "#1 અનુમાન", pred2: "#2 અનુમાન", pred3: "#3 અનુમાન",
    auditLog: "ઓડિટ લોગ", auditSub: "ટેમ્પર-પ્રૂફ ઇતિહાસ", chainVerified: "ચેઇન ચકાસ્યું ✓", tampered: "ટેમ્પર ✗",
    refresh: "રિફ્રેશ", noLogs: "હજુ લોગ નથી.", loadingAudit: "લોડ…",
    colTimestamp: "સમય", colFraudType: "છેતરપિંડી", colBank: "બેંક",
    colZone: "ઝોન", colConfidence: "વિશ્વાસ", colTriage: "ટ્રાઇઝ",
    aiAssistant: "AI તપાસ સહાયક", aiSub: "Groq દ્વારા",
    aiContext: "સંદર્ભ", aiWelcomeTitle: "CipherTrace AI",
    aiWelcomeText: "છેતરપિંડી પેટર્ન વિશે પૂછો.", aiWelcomeCtx: "તમારા અનુમાનનો સંદર્ભ મારી પાસે છે.",
    aiInputPlaceholder: "પૂછો…", aiInputCtxPlaceholder: "પૂછો",
    aiFooter: "મોકલવા Enter · Groq AI", aiChatFailed: "ચૅટ નિષ્ફળ.",
    warmupWarning: "સર્વર ગરમ થઈ રહ્યો છે…", predFailed: "અનુમાન નિષ્ફળ",
    dismiss: "બંધ", timedOut: "સમય સમાપ્ત.", networkError: "નેટવર્ક ભૂલ.",
    loadingMap: "નકશો…", loadingAI: "AI…",
    suggest1: "આ કોન્ફિડન્સ સ્કોર શું છે?", suggest2: "પેટ્રોલ ટીમ મોકલવી?",
    suggest3: "ટ્રાઇઝ સ્ટેટસ સમજાવો", suggest4: "ટીઅર-1 ઉચ્ચ જોખમ શું?",
  },
  pa: {
    appName: "CipherTrace", appSub: "ਸਾਈਬਰ ਅਪਰਾਧ ਨਕਦ ਕਢਵਾਉਣ ਗੁਪਤ ਸੂਚਨਾ · ਸੀਮਿਤ ਵਰਤੋਂ",
    modelActive: "ਮਾਡਲ v2.1 ਸਰਗਰਮ", live: "ਲਾਈਵ",
    complaintsProcessed: "ਸ਼ਿਕਾਇਤਾਂ ਪ੍ਰੋਸੈਸ", rolling30: "30-ਦਿਨ ਡੇਟਾ",
    activeHotspots: "ਸਰਗਰਮ ਹੌਟਸਪੌਟ ਜ਼ੋਨ", zonesUnder: "ਨਿਗਰਾਨੀ ਹੇਠ ਜ਼ੋਨ",
    topFraud: "ਸਿਖਰ ਧੋਖਾਧੜੀ ਸ਼੍ਰੇਣੀ", topFraudSub: "ਸਾਰੀਆਂ ਸ਼ਿਕਾਇਤਾਂ ਦਾ 38%",
    newComplaint: "ਨਵੀਂ ਸ਼ਿਕਾਇਤ ਦਰਜ਼", newComplaintSub: "ਸਾਰੇ ਖੇਤਰ ਲਾਜ਼ਮੀ",
    victimLat: "ਪੀੜਤ ਅਕਸ਼ਾਂਸ਼", victimLon: "ਪੀੜਤ ਦੇਸ਼ਾਂਤਰ",
    fraudAmount: "ਧੋਖਾਧੜੀ ਰਕਮ (₹)", accountAge: "ਸ਼ੱਕੀ ਖਾਤੇ ਦੀ ਉਮਰ (ਦਿਨ)",
    hourOfDay: "ਦਿਨ ਦਾ ਘੰਟਾ (0–23)", dayOfWeek: "ਹਫ਼ਤੇ ਦਾ ਦਿਨ",
    fraudType: "ਧੋਖਾਧੜੀ ਕਿਸਮ", bank: "ਪੀੜਤ ਦਾ ਬੈਂਕ",
    predict: "ਕਢਵਾਉਣ ਸਥਾਨ ਦੱਸੋ", predicting: "ਪੈਟਰਨ ਵਿਸ਼ਲੇਸ਼ਣ…",
    predictionResult: "ਭਵਿੱਖਬਾਣੀ ਨਤੀਜਾ", predictionResultSub: "ਰੀਅਲ-ਟਾਈਮ ML ਆਉਟਪੁੱਟ",
    noPredict: "ਹਾਲੇ ਭਵਿੱਖਬਾਣੀ ਨਹੀਂ", noPredictSub: "ਫਾਰਮ ਭਰੋ ਅਤੇ ਭਵਿੱਖਬਾਣੀ ਕਰੋ।",
    topPredictedZones: "ਸਿਖਰ ਭਵਿੱਖਬਾਣੀ ਜ਼ੋਨ", primaryConfidence: "ਪ੍ਰਾਇਮਰੀ ਵਿਸ਼ਵਾਸ",
    estWindow: "ਅਨੁਮਾਨਿਤ ਵਿੰਡੋ", recommendedAction: "ਸਿਫਾਰਸ਼ ਕੀਤੀ ਕਾਰਵਾਈ",
    mapTitle: "ਲਾਈਵ ਹੌਟਸਪੌਟ ਜ਼ੋਨ ਨਕਸ਼ਾ", mapSub: "ਭਾਰਤ · ATM ਵਿਸ਼ਲੇਸ਼ਣ",
    knownHotspot: "ਜਾਣਿਆ ਹੌਟਸਪੌਟ", pred1: "#1 ਭਵਿੱਖਬਾਣੀ", pred2: "#2", pred3: "#3",
    auditLog: "ਆਡਿਟ ਲੌਗ", auditSub: "ਛੇੜਛਾੜ-ਰੋਧੀ ਇਤਿਹਾਸ", chainVerified: "ਚੇਨ ਤਸਦੀਕ ✓", tampered: "ਛੇੜਛਾੜ ✗",
    refresh: "ਤਾਜ਼ਾ", noLogs: "ਹਾਲੇ ਕੋਈ ਲੌਗ ਨਹੀਂ।", loadingAudit: "ਲੋਡ…",
    colTimestamp: "ਸਮਾਂ", colFraudType: "ਕਿਸਮ", colBank: "ਬੈਂਕ",
    colZone: "ਜ਼ੋਨ", colConfidence: "ਵਿਸ਼ਵਾਸ", colTriage: "ਟ੍ਰਾਈਜ",
    aiAssistant: "AI ਜਾਂਚ ਸਹਾਇਕ", aiSub: "Groq ਦੁਆਰਾ",
    aiContext: "ਸੰਦਰਭ", aiWelcomeTitle: "CipherTrace AI",
    aiWelcomeText: "ਧੋਖਾਧੜੀ ਪੈਟਰਨ ਬਾਰੇ ਪੁੱਛੋ।", aiWelcomeCtx: "ਤੁਹਾਡੀ ਭਵਿੱਖਬਾਣੀ ਦਾ ਸੰਦਰਭ ਮੇਰੇ ਕੋਲ ਹੈ।",
    aiInputPlaceholder: "ਪੁੱਛੋ…", aiInputCtxPlaceholder: "ਪੁੱਛੋ",
    aiFooter: "ਭੇਜਣ ਲਈ Enter · Groq AI", aiChatFailed: "ਚੈਟ ਅਸਫਲ।",
    warmupWarning: "ਸਰਵਰ ਗਰਮ ਹੋ ਰਿਹਾ ਹੈ…", predFailed: "ਭਵਿੱਖਬਾਣੀ ਅਸਫਲ",
    dismiss: "ਬੰਦ", timedOut: "ਸਮਾਂ ਸਮਾਪਤ।", networkError: "ਨੈੱਟਵਰਕ ਗਲਤੀ।",
    loadingMap: "ਨਕਸ਼ਾ…", loadingAI: "AI…",
    suggest1: "ਇਹ ਵਿਸ਼ਵਾਸ ਸਕੋਰ ਦਾ ਮਤਲਬ?", suggest2: "ਗਸ਼ਤ ਟੀਮ ਭੇਜਣੀ ਚਾਹੀਦੀ?",
    suggest3: "ਟ੍ਰਾਈਜ ਸਥਿਤੀ ਦੱਸੋ", suggest4: "ਟੀਅਰ-1 ਉੱਚ ਖਤਰਾ ਕੀ ਹੈ?",
  },
  or: {
    appName: "CipherTrace", appSub: "ସାଇବର ଅପରାଧ ନଗଦ ଉଠାଣ ଗୋଇନ୍ଦା · ସୀମିତ ବ୍ୟବହାର",
    modelActive: "ମଡେଲ v2.1 ସକ୍ରିୟ", live: "ସରାସରି",
    complaintsProcessed: "ଅଭିଯୋଗ ପ୍ରକ୍ରିୟା", rolling30: "30-ଦିନ ତଥ୍ୟ",
    activeHotspots: "ସକ୍ରିୟ ହଟସ୍ପଟ ଜୋନ", zonesUnder: "ନଜରରେ ଜୋନ",
    topFraud: "ଶୀର୍ଷ ଠକ ଶ୍ରେଣୀ", topFraudSub: "ସବୁ ଅଭିଯୋଗର 38%",
    newComplaint: "ନୂଆ ଅଭିଯୋଗ", newComplaintSub: "ସବୁ ଫିଲ୍ଡ ଆବଶ୍ୟକ",
    victimLat: "ପୀଡ଼ିତ ଅକ୍ଷାଂଶ", victimLon: "ପୀଡ଼ିତ ଦ୍ରାଘିମା",
    fraudAmount: "ଠକ ପରିମାଣ (₹)", accountAge: "ସନ୍ଦିଗ୍ଧ ଖାତା ବୟସ (ଦିନ)",
    hourOfDay: "ଦିନ ଘଣ୍ଟା (0–23)", dayOfWeek: "ସପ୍ତାହ ଦିନ",
    fraudType: "ଠକ ପ୍ରକାର", bank: "ପୀଡ଼ିତ ବ୍ୟାଙ୍କ",
    predict: "ଉଠାଣ ସ୍ଥାନ ଅନୁମାନ", predicting: "ପ୍ୟାଟର୍ନ ବିଶ୍ଳେଷଣ…",
    predictionResult: "ଅନୁମାନ ଫଳ", predictionResultSub: "ରିଅଲ-ଟାଇମ ML",
    noPredict: "ଏଯାଏ ଅନୁମାନ ନାହିଁ", noPredictSub: "ଫର୍ମ ଭରନ୍ତୁ।",
    topPredictedZones: "ଶୀର୍ଷ ଅନୁମାନ ଜୋନ", primaryConfidence: "ପ୍ରାଥମିକ ବିଶ୍ୱାସ",
    estWindow: "ଅନୁମାନିତ ଉଠାଣ ଉଇଣ୍ଡୋ", recommendedAction: "ପ୍ରସ୍ତାବିତ ପଦକ୍ଷେପ",
    mapTitle: "ସରାସରି ହଟସ୍ପଟ ଜୋନ ମ୍ୟାପ", mapSub: "ଭାରତ · ATM ବିଶ୍ଳେଷଣ",
    knownHotspot: "ଜଣା ହଟସ୍ପଟ", pred1: "#1 ଅନୁମାନ", pred2: "#2", pred3: "#3",
    auditLog: "ଅଡିଟ ଲଗ", auditSub: "ଟ୍ୟାମ୍ପର-ରୋଧୀ ଇତିହାସ", chainVerified: "ଚେଇନ ଯାଞ୍ଚ ✓", tampered: "ଟ୍ୟାମ୍ପର ✗",
    refresh: "ରିଫ୍ରେଶ", noLogs: "ଏଯାଏ ଲଗ ନାହିଁ।", loadingAudit: "ଲୋଡ…",
    colTimestamp: "ସମୟ", colFraudType: "ଠକ ପ୍ରକାର", colBank: "ବ୍ୟାଙ୍କ",
    colZone: "ଜୋନ", colConfidence: "ବିଶ୍ୱାସ", colTriage: "ଟ୍ରାଇଜ",
    aiAssistant: "AI ତଦନ୍ତ ସହାୟକ", aiSub: "Groq ଦ୍ୱାରା",
    aiContext: "ପ୍ରସଙ୍ଗ", aiWelcomeTitle: "CipherTrace AI",
    aiWelcomeText: "ଠକ ପ୍ୟାଟର୍ନ ବିଷୟରେ ପଚାରନ୍ତୁ।", aiWelcomeCtx: "ଆପଣଙ୍କ ଅନୁମାନ ପ୍ରସଙ୍ଗ ମୋ ପାଖରେ।",
    aiInputPlaceholder: "ପଚାରନ୍ତୁ…", aiInputCtxPlaceholder: "ପଚାରନ୍ତୁ",
    aiFooter: "ପଠାଇବାକୁ Enter · Groq AI", aiChatFailed: "ଚ୍ୟାଟ ବିଫଳ।",
    warmupWarning: "ସର୍ଭର ଗରମ ହଉଛି…", predFailed: "ଅନୁମାନ ବିଫଳ",
    dismiss: "ବନ୍ଦ", timedOut: "ସମୟ ଶେଷ।", networkError: "ନେଟ୍‌ୱର୍କ ତ୍ରୁଟି।",
    loadingMap: "ମ୍ୟାପ…", loadingAI: "AI…",
    suggest1: "ଏ ବିଶ୍ୱାସ ସ୍କୋର ମାନେ?", suggest2: "ଟ୍ୟୁଲ ପ୍ରୟୋଗ?", suggest3: "ଟ୍ରାଇଜ ବ୍ୟାଖ୍ୟା", suggest4: "ଟିୟର-1 ବିପଦ?",
  },
  as: {
    appName: "CipherTrace", appSub: "চাইবাৰ অপৰাধ নগদ উত্তোলন গোপনীয়তা · সীমিত ব্যৱহাৰ",
    modelActive: "মডেল v2.1 সক্রিয়", live: "লাইভ",
    complaintsProcessed: "অভিযোগ প্ৰক্ৰিয়া", rolling30: "৩০-দিন ডেটা",
    activeHotspots: "সক্রিয় হটস্পট জোন", zonesUnder: "নজৰত জোন",
    topFraud: "শীৰ্ষ প্ৰতাৰণা শ্ৰেণী", topFraudSub: "সকলো অভিযোগৰ ৩৮%",
    newComplaint: "নতুন অভিযোগ", newComplaintSub: "সকলো ক্ষেত্ৰ আৱশ্যক",
    victimLat: "ভুক্তভোগীৰ অক্ষাংশ", victimLon: "ভুক্তভোগীৰ দ্ৰাঘিমাংশ",
    fraudAmount: "প্ৰতাৰণাৰ পৰিমাণ (₹)", accountAge: "সন্দেহজনক একাউন্টৰ বয়স",
    hourOfDay: "দিনৰ ঘণ্টা (0–23)", dayOfWeek: "সপ্তাহৰ দিন",
    fraudType: "প্ৰতাৰণাৰ প্ৰকাৰ", bank: "ভুক্তভোগীৰ বেংক",
    predict: "উত্তোলন স্থান অনুমান", predicting: "পেটাৰ্ন বিশ্লেষণ…",
    predictionResult: "অনুমান ফলাফল", predictionResultSub: "ৰিয়েল-টাইম ML",
    noPredict: "এতিয়ালৈকে অনুমান নাই", noPredictSub: "ফৰ্ম পূৰণ কৰক।",
    topPredictedZones: "শীৰ্ষ অনুমান জোন", primaryConfidence: "প্ৰাথমিক বিশ্বাস",
    estWindow: "অনুমানিত উত্তোলন উইণ্ড'", recommendedAction: "পৰামৰ্শিত পদক্ষেপ",
    mapTitle: "লাইভ হটস্পট জোন মেপ", mapSub: "ভাৰত · ATM বিশ্লেষণ",
    knownHotspot: "পৰিচিত হটস্পট", pred1: "#1 অনুমান", pred2: "#2", pred3: "#3",
    auditLog: "অডিট লগ", auditSub: "টেম্পাৰ-ৰোধী ইতিহাস", chainVerified: "চেইন যাচাই ✓", tampered: "টেম্পাৰ ✗",
    refresh: "ৰিফ্ৰেছ", noLogs: "এতিয়ালৈকে লগ নাই।", loadingAudit: "লোড…",
    colTimestamp: "সময়", colFraudType: "প্ৰতাৰণা", colBank: "বেংক",
    colZone: "জোন", colConfidence: "বিশ্বাস", colTriage: "ট্ৰায়াজ",
    aiAssistant: "AI তদন্ত সহায়ক", aiSub: "Groq দ্বাৰা",
    aiContext: "প্ৰসংগ", aiWelcomeTitle: "CipherTrace AI",
    aiWelcomeText: "প্ৰতাৰণা পেটাৰ্নৰ বিষয়ে সুধক।", aiWelcomeCtx: "আপোনাৰ অনুমানৰ প্ৰসংগ মোৰ ওচৰত।",
    aiInputPlaceholder: "সুধক…", aiInputCtxPlaceholder: "সুধক",
    aiFooter: "পঠাবলৈ Enter · Groq AI", aiChatFailed: "চ্যাট বিফল।",
    warmupWarning: "ছাৰ্ভাৰ গৰম হৈ আছে…", predFailed: "অনুমান বিফল",
    dismiss: "বন্ধ", timedOut: "সময় শেষ।", networkError: "নেটৱৰ্ক ভুল।",
    loadingMap: "মেপ…", loadingAI: "AI…",
    suggest1: "এই বিশ্বাস স্কোৰ মানে কি?", suggest2: "পেট্ৰল দল পঠাব?", suggest3: "ট্ৰায়াজ ব্যাখ্যা কৰক", suggest4: "টিয়াৰ-1 বিপদ?",
  },
  ur: {
    appName: "CipherTrace", appSub: "سائبر جرائم نقد نکالنے کی انٹیلی جنس · محدود استعمال",
    modelActive: "ماڈل v2.1 فعال", live: "براہ راست",
    complaintsProcessed: "شکایات پروسیس", rolling30: "30 دن کا ڈیٹا",
    activeHotspots: "فعال ہاٹ اسپاٹ زون", zonesUnder: "نگرانی میں زون",
    topFraud: "اعلی دھوکہ دہی زمرہ", topFraudSub: "تمام شکایات کا 38%",
    newComplaint: "نئی شکایت درج کریں", newComplaintSub: "تمام فیلڈز لازمی",
    victimLat: "متاثرہ عرض البلد", victimLon: "متاثرہ طول البلد",
    fraudAmount: "دھوکہ دہی کی رقم (₹)", accountAge: "مشتبہ اکاؤنٹ کی عمر (دن)",
    hourOfDay: "دن کا گھنٹہ (0–23)", dayOfWeek: "ہفتے کا دن",
    fraudType: "دھوکہ دہی کی قسم", bank: "متاثرہ بینک",
    predict: "نکالنے کی جگہ پیش گوئی", predicting: "پیٹرن تجزیہ…",
    predictionResult: "پیش گوئی نتیجہ", predictionResultSub: "ریئل ٹائم ML آؤٹ پٹ",
    noPredict: "ابھی کوئی پیش گوئی نہیں", noPredictSub: "فارم بھریں اور پیش گوئی کریں۔",
    topPredictedZones: "اعلی پیش گوئی زون", primaryConfidence: "بنیادی اعتماد",
    estWindow: "تخمینی نکالنے کی ونڈو", recommendedAction: "تجویز کردہ اقدام",
    mapTitle: "براہ راست ہاٹ اسپاٹ زون نقشہ", mapSub: "بھارت · ATM تجزیہ",
    knownHotspot: "معلوم ہاٹ اسپاٹ", pred1: "#1 پیش گوئی", pred2: "#2", pred3: "#3",
    auditLog: "آڈٹ لاگ", auditSub: "چھیڑ چھاڑ مخالف تاریخ", chainVerified: "چین تصدیق ✓", tampered: "چھیڑ چھاڑ ✗",
    refresh: "تازہ کریں", noLogs: "ابھی کوئی لاگ نہیں۔", loadingAudit: "لوڈ ہو رہا ہے…",
    colTimestamp: "وقت", colFraudType: "دھوکہ دہی قسم", colBank: "بینک",
    colZone: "پیش گوئی زون", colConfidence: "اعتماد", colTriage: "ٹریج",
    aiAssistant: "AI تحقیقاتی معاون", aiSub: "Groq سے چلائی گئی",
    aiContext: "سیاق", aiWelcomeTitle: "CipherTrace AI",
    aiWelcomeText: "دھوکہ دہی کے نمونوں کے بارے میں پوچھیں۔", aiWelcomeCtx: "آپ کی پیش گوئی کا سیاق میرے پاس ہے۔",
    aiInputPlaceholder: "پوچھیں…", aiInputCtxPlaceholder: "پوچھیں",
    aiFooter: "بھیجنے کے لیے Enter · Groq AI", aiChatFailed: "چیٹ ناکام۔",
    warmupWarning: "سرور گرم ہو رہا ہے…", predFailed: "پیش گوئی ناکام",
    dismiss: "بند کریں", timedOut: "وقت ختم۔", networkError: "نیٹ ورک خرابی۔",
    loadingMap: "نقشہ لوڈ…", loadingAI: "AI لوڈ…",
    suggest1: "اس اعتماد اسکور کا مطلب؟", suggest2: "پیٹرول ٹیم بھیجنی چاہیے؟",
    suggest3: "ٹریج اسٹیٹس سمجھائیں", suggest4: "ٹیر-1 اعلی خطرہ کیا ہے؟",
  },
  ja: {
    appName: "CipherTrace", appSub: "サイバー犯罪現金引き出し予測システム · 限定使用",
    modelActive: "モデル v2.1 稼働中", live: "ライブ",
    complaintsProcessed: "処理済み申告数", rolling30: "30日間データ",
    activeHotspots: "活動中ホットスポット区域", zonesUnder: "監視対象区域",
    topFraud: "最多詐欺分類", topFraudSub: "全申告の38%",
    newComplaint: "新規申告入力", newComplaintSub: "全フィールド必須・座標入力にマップ検索を使用",
    victimLat: "被害者緯度", victimLon: "被害者経度",
    fraudAmount: "詐欺金額 (₹)", accountAge: "容疑者口座日数",
    hourOfDay: "時刻 (0–23)", dayOfWeek: "曜日",
    fraudType: "詐欺種別", bank: "被害者銀行",
    predict: "引き出し場所を予測", predicting: "パターン分析中…",
    predictionResult: "予測結果", predictionResultSub: "リアルタイム ML 出力",
    noPredict: "まだ予測がありません", noPredictSub: "フォームを入力して予測を生成してください。",
    topPredictedZones: "上位予測区域", primaryConfidence: "信頼度",
    estWindow: "推定引き出し時間帯", recommendedAction: "推奨対応",
    mapTitle: "リアルタイム ホットスポット区域マップ", mapSub: "インド · ATM 引き出しクラスター分析",
    knownHotspot: "既知ホットスポット", pred1: "#1 予測", pred2: "#2 予測", pred3: "#3 予測",
    auditLog: "監査ログ", auditSub: "改ざん防止予測履歴", chainVerified: "チェーン検証済み ✓", tampered: "改ざん検知 ✗",
    refresh: "更新", noLogs: "まだログはありません。", loadingAudit: "読み込み中…",
    colTimestamp: "日時", colFraudType: "詐欺種別", colBank: "銀行",
    colZone: "予測区域", colConfidence: "信頼度", colTriage: "トリアージ",
    aiAssistant: "AI 捜査アシスタント", aiSub: "Groq AI · 予測と詐欺パターンについて質問",
    aiContext: "コンテキスト", aiWelcomeTitle: "CipherTrace AI",
    aiWelcomeText: "詐欺パターン・信頼度・捜査手順について質問してください。",
    aiWelcomeCtx: "最新の予測データを把握しています。何でもお聞きください。",
    aiInputPlaceholder: "詐欺パターンについて質問…", aiInputCtxPlaceholder: "について質問",
    aiFooter: "Enterキーで送信 · Groq AI · 応答に数秒かかる場合があります",
    aiChatFailed: "チャット失敗。再試行してください。",
    warmupWarning: "予測サーバーが起動中です。30〜60秒かかる場合があります。",
    predFailed: "予測失敗", dismiss: "閉じる",
    timedOut: "90秒後にタイムアウトしました。", networkError: "ネットワークエラー。",
    loadingMap: "マップ読み込み中…", loadingAI: "AI 読み込み中…",
    suggest1: "この信頼度スコアの意味は？", suggest2: "パトロール部隊を派遣すべきか？",
    suggest3: "トリアージ状態を説明してください", suggest4: "ティア1高リスクとは？",
  },
};

export type T = typeof RAW_TRANSLATIONS.en;
export const TRANSLATIONS: Record<LangCode, T> = Object.fromEntries(
  Object.entries(RAW_TRANSLATIONS).map(([k, v]) => [
    k,
    { ...RAW_TRANSLATIONS.en, ...v },
  ]),
) as Record<LangCode, T>;

// ─── Global React Context I18n Provider & Hook ───────────────────────────────

const STORAGE_KEY_LANG = "ct_lang";

interface I18nContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (typeof TRANSLATIONS)["en"];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getInitialLang(): LangCode {
  if (typeof localStorage === "undefined") return "en";
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LANG) as LangCode | null;
    if (stored && stored in TRANSLATIONS) return stored;
  } catch (e) {
    console.warn("Could not read language from localStorage", e);
  }
  return "en";
}

function applyLangToDOM(lang: LangCode) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(getInitialLang);

  useEffect(() => {
    applyLangToDOM(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch (e) {
      console.warn("Could not save language to localStorage", e);
    }
  }, [lang]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_LANG && e.newValue && e.newValue in TRANSLATIONS) {
        setLangState(e.newValue as LangCode);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setLang = useCallback((l: LangCode) => {
    if (l in TRANSLATIONS) {
      setLangState(l);
    }
  }, []);

  const t = useMemo(() => TRANSLATIONS[lang] || TRANSLATIONS.en, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    const fallbackLang = getInitialLang();
    return {
      lang: fallbackLang,
      setLang: () => {},
      t: TRANSLATIONS[fallbackLang] || TRANSLATIONS.en,
    };
  }
  return ctx;
}

// ─── Dynamic formatters ───────────────────────────────────────────────────────

export function formatActionText(
  lang: LangCode,
  prediction: {
    actionCode?: string;
    action?: string;
    confidence: number;
    zoneName: string;
    screeningTier?: string;
    timeWindowHours?: { min: number; max: number };
  },
): string {
  const isHighRisk = prediction.screeningTier === "tier1_high_risk";
  const minH = prediction.timeWindowHours?.min ?? 2;
  const maxH = prediction.timeWindowHours?.max ?? 6;
  const conf = Math.round(prediction.confidence);
  const zone = prediction.zoneName;

  if (prediction.actionCode === "low_confidence_review" || conf < 40) {
    switch (lang) {
      case "hi":
        return `कम विश्वास (${conf}%) — पैटर्न स्पष्ट रूप से ज्ञात हॉटस्पॉट से मेल नहीं खाता। स्वचालित गश्त प्रेषण के बजाय मैनुअल अन्वेषक समीक्षा के लिए चिह्नित करें।`;
      case "ta":
        return `குறைந்த நம்பிக்கை (${conf}%) — அறியப்பட்ட ஹாட்ஸ்பாட்களுடன் முறை தெளிவாகப் பொருந்தவில்லை. தானியங்கி ரோந்து அனுப்பலுக்குப் பதிலாக கையேடு புலனாய்வாளர் மதிப்பாய்வுக்குக் கொடியிடவும்.`;
      case "te":
        return `తక్కువ విశ్వాసం (${conf}%) — తెలిసిన హాట్‌స్పాట్‌లతో సరిపోలడం లేదు. మానవీయ సమీక్ష కోసం ఫ్లాగ్ చేయండి.`;
      case "kn":
        return `ಕಡಿಮೆ ವಿಶ್ವಾಸ (${conf}%) — ಮಾದರಿ ಸ್ಪಷ್ಟವಾಗಿ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ. ಮ್ಯಾನುವಲ್ ತನಿಖೆಗೆ ಕಳುಹಿಸಿ.`;
      case "ml":
        return `കുറഞ്ഞ വിശ്വാസ്യത (${conf}%) — പാറ്റേൺ വ്യക്തമായി പൊരുത്തപ്പെടുന്നില്ല. മാനുവൽ അവലോകനത്തിനായി ഫ്ലാഗ് ചെയ്യുക.`;
      case "bn":
        return `কম আস্থা (${conf}%) — প্যাটার্ন স্পষ্টভাবে পরিচিত হটস্পটের সাথে মিলছে না। ম্যানুয়াল পর্যালোচনার জন্য চিহ্নিত করুন।`;
      case "mr":
        return `कमी विश्वास (${conf}%) — पॅटर्न ज्ञात हॉटस्पॉटशी स्पष्टपणे जुळत नाही. मॅन्युअल तपासणीसाठी ध्वजांकित करा.`;
      case "gu":
        return `ઓછો વિશ્વાસ (${conf}%) — પેટર્ન જાણીતા હોટસ્પોટ સાથે મેળ ખાતી નથી. મેન્યુઅલ રિવ્યૂ માટે ચિહ્નિત કરો.`;
      case "pa":
        return `ਘੱਟ ਵਿਸ਼ਵਾਸ (${conf}%) — ਪੈਟਰਨ ਜਾਣੇ-ਪਛਾਣੇ ਹੌਟਸਪੌਟ ਨਾਲ ਮੇਲ ਨਹੀਂ ਖਾਂਦਾ। ਮੈਨੂਅਲ ਸਮੀਖਿਆ ਲਈ ਫਲੈਗ ਕਰੋ।`;
      case "or":
        return `କମ ବିଶ୍ୱାସ (${conf}%) — ପ୍ୟାଟର୍ନ ସ୍ପଷ୍ଟ ଭାବରେ ମେଳ ଖାଉନାହିଁ। ମାନୁଆଲ ସମୀକ୍ଷା ପାଇଁ ଚିହ୍ନିତ କରନ୍ତୁ।`;
      case "as":
        return `কম বিশ্বাস (${conf}%) — পেটাৰ্ন স্পষ্টভাৱে পৰিচিত হটস্পটৰ সৈতে মিল নাই। মেনুৱেল পৰ্যালোচনাৰ বাবে চিহ্নিত কৰক।`;
      case "ur":
        return `کم اعتماد (${conf}%) — پیٹرن واضح طور پر معلوم ہاٹ اسپاٹ سے میل نہیں کھاتا۔ دستی جائزہ کے لیے نشان زد کریں۔`;
      case "ja":
        return `低信頼度 (${conf}%) — パターンが既知のホットスポットと明確に一致しません。自動派遣ではなく手動捜査レビューに回してください。`;
      default:
        return `LOW CONFIDENCE (${conf}%) — pattern does not clearly match known hotspots. Flag for manual investigator review instead of automated patrol dispatch.`;
    }
  }

  // Auto dispatch / high confidence
  switch (lang) {
    case "hi":
      return `हॉटस्पॉट क्षेत्र (${zone}) में ${minH}–${maxH} घंटों के भीतर निकटतम गश्ती दल को सतर्क करें${isHighRisk ? " [उच्च जोखिम — तत्काल प्राथमिकता]" : ""}`;
    case "ta":
      return `ஹாட்ஸ்பாட் மண்டலம் (${zone}) க்கு ${minH}–${maxH} மணி நேரத்திற்குள் அருகிலுள்ள ரோந்துப் படையை எச்சரிக்கவும்${isHighRisk ? " [அதிக ஆபத்து — உடனடி முன்னுரிமை]" : ""}`;
    case "te":
      return `హాట్‌స్పాట్ జోన్ (${zone}) వద్ద ${minH}–${maxH} గంటల్లో సమీప పెట్రోల్ విభాగాన్ని అప్రమత్తం చేయండి${isHighRisk ? " [అధిక ప్రమాదం — తక్షణ ప్రాధాన్యత]" : ""}`;
    case "kn":
      return `ಹಾಟ್‌ಸ್ಪಾಟ್ ವಲಯ (${zone}) ಗೆ ${minH}–${maxH} ಗಂಟೆಗಳ ಒಳಗೆ ಸಮೀಪದ ಗಸ್ತು ತಂಡವನ್ನು ಎಚ್ಚರಿಸಿ${isHighRisk ? " [ಹೆಚ್ಚಿನ ಅಪಾಯ — ತಕ್ಷಣದ ಆದ್ಯತೆ]" : ""}`;
    case "ml":
      return `ഹോട്ട്‌സ്‌പോട്ട് മേഖലയിലേക്ക് (${zone}) ${minH}–${maxH} മണിക്കൂറിനുള്ളിൽ പട്രോൾ യൂണിറ്റിനെ ജാഗ്രതപ്പെടുത്തുക${isHighRisk ? " [ഉയർന്ന ഭീഷണി — അടിയന്തര മുൻഗണന]" : ""}`;
    case "bn":
      return `হটস্পট এলাকায় (${zone}) ${minH}–${maxH} ঘণ্টার মধ্যে নিকটবর্তী টহল দলকে সতর্ক করুন${isHighRisk ? " [উচ্চ ঝুঁকি — অবিলম্বে অগ্রাধিকার]" : ""}`;
    case "mr":
      return `हॉटस्पॉट क्षेत्रात (${zone}) ${minH}–${maxH} तासांत जवळच्या गस्त पथकाला सतर्क करा${isHighRisk ? " [उच्च धोका — त्वरित प्राधान्य]" : ""}`;
    case "gu":
      return `હોટસ્પોટ ઝોન (${zone}) માં ${minH}–${maxH} કલાકમાં નજીકના પેટ્રોલ યુનિટને ચેતવો${isHighRisk ? " [ઉચ્ચ જોખમ — તાત્કાલિક પ્રાધાન્ય]" : ""}`;
    case "pa":
      return `ਹੌਟਸਪੌਟ ਜ਼ੋਨ (${zone}) ਲਈ ${minH}–${maxH} ਘੰਟਿਆਂ ਦੇ ਅੰਦਰ ਨਜ਼ਦੀਕੀ ਗਸ਼ਤ ਟੀਮ ਨੂੰ ਸੁਚੇਤ ਕਰੋ${isHighRisk ? " [ਉੱਚ ਖਤਰਾ — ਤੁਰੰਤ ਤਰਜੀਹ]" : ""}`;
    case "or":
      return `ହଟସ୍ପଟ ଜୋନ (${zone}) କୁ ${minH}–${maxH} ଘଣ୍ଟା ମଧ୍ୟରେ ନିକଟତମ ପାଟ୍ରୋଲ ୟୁନିଟକୁ ସତର୍କ କରନ୍ତୁ${isHighRisk ? " [ଉଚ୍ଚ ବିପଦ — ତୁରନ୍ତ ପ୍ରାଥମିକତା]" : ""}`;
    case "as":
      return `হটস্পট জোন (${zone}) লৈ ${minH}–${maxH} ঘণ্টাৰ ভিতৰত নিকটতম পেট্ৰল দলক সতৰ্ক কৰক${isHighRisk ? " [উচ্চ বিপদ — তাৎক্ষণিক অগ্ৰাধিকাৰ]" : ""}`;
    case "ur":
      return `ہاٹ اسپاٹ زون (${zone}) پر ${minH}–${maxH} گھنٹوں میں قریبی گشتی یونٹ کو الرٹ کریں${isHighRisk ? " [اعلی خطرہ — فوری ترجیح]" : ""}`;
    case "ja":
      return `ホットスポット区域 (${zone}) へ ${minH}〜${maxH}時間以内に最寄りの巡回部隊を派遣警報${isHighRisk ? " [高リスク — 緊急優先]" : ""}`;
    default:
      return `Alert nearest patrol unit to Hotspot Zone (${zone}) within ${minH}-${maxH} hours${isHighRisk ? " [HIGH-RISK — immediate priority]" : ""}`;
  }
}

export function formatWindowText(lang: LangCode, minH = 2, maxH = 6): string {
  switch (lang) {
    case "hi": return `${minH}–${maxH} घंटे`;
    case "ta": return `${minH}–${maxH} மணி நேரம்`;
    case "te": return `${minH}–${maxH} గంటలు`;
    case "kn": return `${minH}–${maxH} ಗಂಟೆಗಳು`;
    case "ml": return `${minH}–${maxH} മണിക്കൂർ`;
    case "bn": return `${minH}–${maxH} ঘণ্টা`;
    case "mr": return `${minH}–${maxH} तास`;
    case "gu": return `${minH}–${maxH} કલાક`;
    case "pa": return `${minH}–${maxH} ਘੰਟੇ`;
    case "or": return `${minH}–${maxH} ଘଣ୍ଟା`;
    case "as": return `${minH}–${maxH} ঘণ্টা`;
    case "ur": return `${minH}–${maxH} گھنٹے`;
    case "ja": return `${minH}〜${maxH}時間`;
    default:   return `${minH}-${maxH} hours`;
  }
}

export function formatTriageBadge(lang: LangCode, status?: string): string {
  const isActionable = status === "auto_actionable";
  switch (lang) {
    case "hi": return isActionable ? "स्वचालित कार्रवाई" : "समीक्षा आवश्यक";
    case "ta": return isActionable ? "தானியங்கி நடவடிக்கை" : "மதிப்பாய்வு தேவை";
    case "te": return isActionable ? "స్వయంచాలక చర్య" : "సమీక్ష అవసరం";
    case "kn": return isActionable ? "ಸ್ವಯಂಚಾಲಿತ ಕ್ರಮ" : "ಪರಿಶೀಲನೆ ಅಗತ್ಯ";
    case "ml": return isActionable ? "ഓട്ടോമേറ്റഡ് നടപടി" : "അവലോകനം വേണം";
    case "bn": return isActionable ? "স্বয়ংক্রিয় পদক্ষেপ" : "পর্যালোচনা প্রয়োজন";
    case "mr": return isActionable ? "स्वयंचलित कृती" : "पुनरावलोकन आवश्यक";
    case "gu": return isActionable ? "સ્વચાલિત ક્રિયા" : "સમીક્ષા જરૂરી";
    case "pa": return isActionable ? "ਸਵੈਚਾਲਿਤ ਕਾਰਵਾਈ" : "ਸਮੀਖਿਆ ਦੀ ਲੋੜ";
    case "or": return isActionable ? "ସ୍ୱୟଂଚାଳିତ କାର୍ଯ୍ୟାନୁଷ୍ଠାନ" : "ସମୀକ୍ଷା ଆବଶ୍ୟକ";
    case "as": return isActionable ? "স্বয়ংক্ৰিয় ব্যৱস্থা" : "পৰ্যালোচনা প্ৰয়োজন";
    case "ur": return isActionable ? "خودکار کارروائی" : "جائزہ درکار";
    case "ja": return isActionable ? "自動アクション可" : "要確認";
    default:   return isActionable ? "Auto-Actionable" : "Needs Review";
  }
}

export function formatScreeningBadge(lang: LangCode, tier?: string): string {
  const isHighRisk = tier === "tier1_high_risk";
  switch (lang) {
    case "hi": return isHighRisk ? "टियर 1: उच्च जोखिम" : "टियर 1: मानक";
    case "ta": return isHighRisk ? "டியர் 1: அதிக ஆபத்து" : "டியர் 1: தரநிலை";
    case "te": return isHighRisk ? "టియర్ 1: అధిక ప్రమాదం" : "టియర్ 1: ప్రామాణికం";
    case "kn": return isHighRisk ? "ಟಯರ್ 1: ಹೆಚ್ಚಿನ ಅಪಾಯ" : "ಟಯರ್ 1: ಸಾಮಾನ್ಯ";
    case "ml": return isHighRisk ? "ടയർ 1: ഉയർന്ന ഭീഷണി" : "ടയർ 1: സാധാരണ";
    case "bn": return isHighRisk ? "টায়ার ১: উচ্চ ঝুঁকি" : "টায়ার ১: মানক";
    case "mr": return isHighRisk ? "टियर 1: उच्च धोका" : "टियर 1: मानक";
    case "gu": return isHighRisk ? "ટીઅર 1: ઉચ્ચ જોખમ" : "ટીઅર 1: પ્રમાણભૂત";
    case "pa": return isHighRisk ? "ਟੀਅਰ 1: ਉੱਚ ਖਤਰਾ" : "ਟੀਅਰ 1: ਮਿਆਰੀ";
    case "or": return isHighRisk ? "ଟିୟର 1: ଉଚ୍ଚ ବିପଦ" : "ଟିୟର 1: ମାନକ";
    case "as": return isHighRisk ? "টিয়াৰ 1: উচ্চ বিপদ" : "টিয়াৰ 1: মানক";
    case "ur": return isHighRisk ? "ٹیر 1: اعلی خطرہ" : "ٹیر 1: معیاری";
    case "ja": return isHighRisk ? "ティア 1: 高リスク" : "ティア 1: 標準";
    default:   return isHighRisk ? "Tier 1: High Risk" : "Tier 1: Standard";
  }
}

