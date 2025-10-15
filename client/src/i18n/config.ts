/*
  i18n Configuration for multi-language support
  Supports: English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati
*/

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      welcome: 'Welcome to Speak Bee',
      continue: 'Continue',
      back: 'Back',
      next: 'Next',
      skip: 'Skip',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      
      // Navigation
      nav: {
        home: 'Home',
        kids: 'Kids',
        adults: 'Adults',
        ielts: 'IELTS/PTE',
        progress: 'Progress',
        profile: 'Profile',
        settings: 'Settings'
      },
      
      // Auth
      auth: {
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot Password?',
        createAccount: 'Create Account',
        signIn: 'Sign In',
        logout: 'Logout'
      },
      
      // Learning
      learning: {
        startLesson: 'Start Lesson',
        practiceNow: 'Practice Now',
        yourProgress: 'Your Progress',
        level: 'Level',
        points: 'Points',
        streak: 'Day Streak',
        lessonsCompleted: 'Lessons Completed',
        achievements: 'Achievements',
        vocabulary: 'Vocabulary',
        pronunciation: 'Pronunciation',
        grammar: 'Grammar',
        fluency: 'Fluency'
      },
      
      // Feedback
      feedback: {
        excellent: 'Excellent!',
        good: 'Good job!',
        tryAgain: 'Try again',
        keepPracticing: 'Keep practicing!',
        wellDone: 'Well done!',
        perfect: 'Perfect!'
      }
    }
  },
  
  hi: {
    translation: {
      // Common
      welcome: 'स्पीक बी में आपका स्वागत है',
      continue: 'जारी रखें',
      back: 'वापस',
      next: 'अगला',
      skip: 'छोड़ें',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      loading: 'लोड हो रहा है...',
      
      // Navigation
      nav: {
        home: 'होम',
        kids: 'बच्चे',
        adults: 'वयस्क',
        ielts: 'आईईएलटीएस/पीटीई',
        progress: 'प्रगति',
        profile: 'प्रोफ़ाइल',
        settings: 'सेटिंग्स'
      },
      
      // Auth
      auth: {
        login: 'लॉगिन',
        register: 'पंजीकरण',
        email: 'ईमेल',
        password: 'पासवर्ड',
        forgotPassword: 'पासवर्ड भूल गए?',
        createAccount: 'खाता बनाएं',
        signIn: 'साइन इन करें',
        logout: 'लॉगआउट'
      },
      
      // Learning
      learning: {
        startLesson: 'पाठ शुरू करें',
        practiceNow: 'अभी अभ्यास करें',
        yourProgress: 'आपकी प्रगति',
        level: 'स्तर',
        points: 'अंक',
        streak: 'दिन की लकीर',
        lessonsCompleted: 'पाठ पूर्ण',
        achievements: 'उपलब्धियां',
        vocabulary: 'शब्दावली',
        pronunciation: 'उच्चारण',
        grammar: 'व्याकरण',
        fluency: 'प्रवाह'
      },
      
      // Feedback
      feedback: {
        excellent: 'उत्कृष्ट!',
        good: 'अच्छा काम!',
        tryAgain: 'फिर से कोशिश करें',
        keepPracticing: 'अभ्यास जारी रखें!',
        wellDone: 'बहुत बढ़िया!',
        perfect: 'परफेक्ट!'
      }
    }
  },
  
  ta: {
    translation: {
      // Common
      welcome: 'ஸ்பீக் பீ-க்கு வரவேற்கிறோம்',
      continue: 'தொடரவும்',
      back: 'பின்',
      next: 'அடுத்து',
      skip: 'தவிர்க்கவும்',
      save: 'சேமிக்கவும்',
      cancel: 'ரத்து செய்',
      loading: 'ஏற்றுகிறது...',
      
      // Navigation
      nav: {
        home: 'முகப்பு',
        kids: 'குழந்தைகள்',
        adults: 'பெரியவர்கள்',
        ielts: 'ஐஇஎல்டிஎஸ்/பிடிஇ',
        progress: 'முன்னேற்றம்',
        profile: 'சுயவிவரம்',
        settings: 'அமைப்புகள்'
      },
      
      // Auth
      auth: {
        login: 'உள்நுழைய',
        register: 'பதிவு',
        email: 'மின்னஞ்சல்',
        password: 'கடவுச்சொல்',
        forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
        createAccount: 'கணக்கை உருவாக்கு',
        signIn: 'உள்நுழைய',
        logout: 'வெளியேறு'
      },
      
      // Learning
      learning: {
        startLesson: 'பாடத்தைத் தொடங்கு',
        practiceNow: 'இப்போது பயிற்சி செய்',
        yourProgress: 'உங்கள் முன்னேற்றம்',
        level: 'நிலை',
        points: 'புள்ளிகள்',
        streak: 'நாள் தொடர்',
        lessonsCompleted: 'பாடங்கள் முடிந்தது',
        achievements: 'சாதனைகள்',
        vocabulary: 'சொல்வளம்',
        pronunciation: 'உச்சரிப்பு',
        grammar: 'இலக்கணம்',
        fluency: 'சரளம்'
      },
      
      // Feedback
      feedback: {
        excellent: 'சிறப்பு!',
        good: 'நல்ல வேலை!',
        tryAgain: 'மீண்டும் முயற்சிக்கவும்',
        keepPracticing: 'பயிற்சியைத் தொடரவும்!',
        wellDone: 'நன்று!',
        perfect: 'சரியானது!'
      }
    }
  },
  
  te: {
    translation: {
      // Common
      welcome: 'స్పీక్ బీకి స్వాగతం',
      continue: 'కొనసాగించు',
      back: 'వెనుకకు',
      next: 'తదుపరి',
      skip: 'దాటవేయి',
      save: 'సేవ్ చేయి',
      cancel: 'రద్దు చేయి',
      loading: 'లోడ్ అవుతోంది...',
      
      // Navigation
      nav: {
        home: 'హోమ్',
        kids: 'పిల్లలు',
        adults: 'పెద్దలు',
        ielts: 'ఐఈఎల్టీఎస్/పిటిఈ',
        progress: 'పురోగతి',
        profile: 'ప్రొఫైల్',
        settings: 'సెట్టింగ్స్'
      },
      
      // Auth
      auth: {
        login: 'లాగిన్',
        register: 'రిజిస్టర్',
        email: 'ఇమెయిల్',
        password: 'పాస్వర్డ్',
        forgotPassword: 'పాస్వర్డ్ మర్చిపోయారా?',
        createAccount: 'ఖాతా సృష్టించండి',
        signIn: 'సైన్ ఇన్',
        logout: 'లాగౌట్'
      },
      
      // Learning
      learning: {
        startLesson: 'పాఠం ప్రారంభించండి',
        practiceNow: 'ఇప్పుడు అభ్యసించండి',
        yourProgress: 'మీ పురోగతి',
        level: 'స్థాయి',
        points: 'పాయింట్లు',
        streak: 'రోజుల వరుస',
        lessonsCompleted: 'పాఠాలు పూర్తయ్యాయి',
        achievements: 'విజయాలు',
        vocabulary: 'పదజాలం',
        pronunciation: 'ఉచ్ఛారణ',
        grammar: 'వ్యాకరణం',
        fluency: 'ప్రవాహం'
      },
      
      // Feedback
      feedback: {
        excellent: 'అద్భుతం!',
        good: 'మంచి పని!',
        tryAgain: 'మళ్ళీ ప్రయత్నించండి',
        keepPracticing: 'అభ్యాసం కొనసాగించండి!',
        wellDone: 'బాగా చేశారు!',
        perfect: 'పర్ఫెక్ట్!'
      }
    }
  },
  
  bn: {
    translation: {
      // Common - Bengali
      welcome: 'স্পিক বি-তে স্বাগতম',
      continue: 'চালিয়ে যান',
      back: 'পিছনে',
      next: 'পরবর্তী',
      skip: 'এড়িয়ে যান',
      save: 'সংরক্ষণ করুন',
      cancel: 'বাতিল করুন',
      loading: 'লোড হচ্ছে...',
      
      nav: {
        home: 'হোম',
        kids: 'শিশুরা',
        adults: 'প্রাপ্তবয়স্ক',
        ielts: 'আইইএলটিএস/পিটিই',
        progress: 'অগ্রগতি',
        profile: 'প্রোফাইল',
        settings: 'সেটিংস'
      }
    }
  },
  
  mr: {
    translation: {
      // Common - Marathi
      welcome: 'स्पीक बी मध्ये आपले स्वागत आहे',
      continue: 'सुरू ठेवा',
      back: 'मागे',
      next: 'पुढे',
      skip: 'वगळा',
      save: 'जतन करा',
      cancel: 'रद्द करा',
      loading: 'लोड होत आहे...',
      
      nav: {
        home: 'होम',
        kids: 'मुले',
        adults: 'प्रौढ',
        ielts: 'आयईएलटीएस/पीटीई',
        progress: 'प्रगती',
        profile: 'प्रोफाइल',
        settings: 'सेटिंग्ज'
      }
    }
  },
  
  gu: {
    translation: {
      // Common - Gujarati
      welcome: 'સ્પીક બીમાં આપનું સ્વાગત છે',
      continue: 'ચાલુ રાખો',
      back: 'પાછળ',
      next: 'આગળ',
      skip: 'છોડો',
      save: 'સાચવો',
      cancel: 'રદ કરો',
      loading: 'લોડ થઈ રહ્યું છે...',
      
      nav: {
        home: 'હોમ',
        kids: 'બાળકો',
        adults: 'પુખ્ત',
        ielts: 'આઈઈએલટીએસ/પીટીઈ',
        progress: 'પ્રગતિ',
        profile: 'પ્રોફાઇલ',
        settings: 'સેટિંગ્સ'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;

