import { useAppStore } from './store/useAppStore';

const translations = {
  en: {
    dashboard: "Dashboard",
    digitalId: "Digital ID",
    tripPlanner: "Trip Planner",
    sosMap: "SOS & Map",
    adminCentre: "Admin Command Centre",
    logout: "Log Out",
    welcome: "Welcome",
    emergencySos: "EMERGENCY SOS",
    shieldId: "SHIELD ID",
    destination: "Destination",
    emergencyContact: "Emergency Contact",
    passport: "Passport Number",
    generateId: "Generate SHIELD ID",
    downloadQr: "Download QR Code",
    tripDays: "Number of Days",
    tripBudget: "Budget ($)",
    tripLang: "Preferred Language",
    planTrip: "Plan Smart Trip",
    highRiskZone: "⚠️ Entered High Risk Zone",
    gpsStatus: "GPS Tracking Active",
    fallDetect: "Fall Detection (Simulated)",
    voiceActive: "Voice Activation Listening (Say: 'Shield Help')",
    offlinePending: "Pending Offline SOS Alerts",
    generateFir: "Generate E-FIR",
    adminLiveFeed: "Live Security & Incident Command Feed",
    efirHeader: "POLICE E-FIR - MINISTRY OF HOME AFFAIRS",
    efirNumber: "E-FIR NUMBER",
    incidentTime: "Incident Timestamp",
    location: "Precise Location",
    telemetry: "Telemetry Data",
    sysMessage: "System Message",
    downloadPDF: "Download PDF Report",
    downloadJSON: "Download JSON",
    close: "Close"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    digitalId: "डिजिटल आईडी",
    tripPlanner: "यात्रा योजनाकार",
    sosMap: "एसओएस और मानचित्र",
    adminCentre: "प्रशासन कमांड सेंटर",
    logout: "लॉग आउट",
    welcome: "स्वागत है",
    emergencySos: "आपातकालीन एसओएस",
    shieldId: "शील्ड आईडी",
    destination: "गंतव्य",
    emergencyContact: "आपातकालीन संपर्क",
    passport: "पासपोर्ट नंबर",
    generateId: "शील्ड आईडी बनाएं",
    downloadQr: "क्यूआर कोड डाउनलोड करें",
    tripDays: "दिनों की संख्या",
    tripBudget: "बजट ($)",
    tripLang: "पसंदीदा भाषा",
    planTrip: "स्मार्ट यात्रा बनाएं",
    highRiskZone: "⚠️ उच्च जोखिम वाले क्षेत्र में प्रवेश किया",
    gpsStatus: "जीपीएस ट्रैकिंग सक्रिय",
    fallDetect: "गिरावट का पता लगाना (सिम्युलेटेड)",
    voiceActive: "आवाज सक्रियण सुन रहा है ('Shield Help' बोलें)",
    offlinePending: "लंबित ऑफ़लाइन एसओएस अलर्ट",
    generateFir: "ई-एफआईआर उत्पन्न करें",
    adminLiveFeed: "लाइव सुरक्षा और घटना फ़ीड",
    efirHeader: "पुलिस ई-एफआईआर - गृह मंत्रालय",
    efirNumber: "ई-एफआईआर नंबर",
    incidentTime: "घटना का समय",
    location: "सटीक स्थान",
    telemetry: "टेलीमेट्री डेटा",
    sysMessage: "सिस्टम संदेश",
    downloadPDF: "पीडीएफ रिपोर्ट डाउनलोड करें",
    downloadJSON: "जेएसओएन डाउनलोड करें",
    close: "बंद करें"
  }
};

export const useTranslation = () => {
  const language = useAppStore((state) => state.language);
  const t = (key: keyof typeof translations['en']) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };
  return { t, language };
};
