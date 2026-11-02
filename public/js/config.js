/**
 * config.js - Global App Configuration & Rebranding Center
 * Store name in a single constant for easy rebranding
 */

export const APP_CONFIG = {
  NAME: 'Apna Utsav',
  TAGLINE: 'Intelligent, Cultural Celebration Planner',
  VERSION: '2.0.0',
  DEFAULT_CURRENCY: 'INR',
  DEFAULT_LANGUAGE: 'en',
  CONTINGENCY_PERCENT_MIN: 8,
  CONTINGENCY_PERCENT_MAX: 10,

  SUPPORTED_LANGUAGES: [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
  ],

  SUPPORTED_CURRENCIES: [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'AED', symbol: 'AED ', name: 'UAE Dirham' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
  ],

  // 4 Core Pre-Configured Celebration Starters for the ChatGPT-Style Landing Screen
  INSPIRATION_CHIPS: [
    {
      id: 'wedding',
      icon: '💍',
      badge: 'Wedding',
      title: 'Grand Vivaham / Wedding',
      prompt: 'Plan a 2-day traditional wedding in Jaipur for 250 guests with a budget of 15 Lakhs and vegetarian feast.'
    },
    {
      id: 'birthday',
      icon: '🎂',
      badge: 'Birthday',
      title: 'Kids Milestone Birthday',
      prompt: 'Plan an 8-year-old child\'s birthday party in Bengaluru for 40 guests with a budget of 30,000 and fun space theme.'
    },
    {
      id: 'community',
      icon: '🪔',
      badge: 'Community',
      title: 'Apartment Ganesh / Diwali Utsav',
      prompt: 'Plan a 3-day apartment society Ganesh Utsav in Pune for 150 residents with a budget of 80,000 and eco-friendly pandal.'
    },
    {
      id: 'housewarming',
      icon: '🏡',
      badge: 'Housewarming',
      title: 'Griha Pravesh Celebration',
      prompt: 'Plan a traditional Griha Pravesh housewarming in Hyderabad for 75 family guests with a budget of 1.5 Lakhs.'
    }
  ]
};

export function getLocalizedInspirationChips(lang = 'en') {
  const LOCALIZED_CHIPS = {
    te: [
      { id: 'wedding', icon: '💍', title: 'గ్రాండ్ వివాహం & రిసెప్షన్', prompt: 'జైపూర్‌లో 250 మంది అతిథులతో 2 రోజుల సాంప్రదాయ వివాహం, 15 లక్షల బడ్జెట్ మరియు శాఖాహార విందు.' },
      { id: 'birthday', icon: '🎂', title: 'కిడ్స్ మైల్‌స్టోన్ బర్త్‌డే', prompt: 'బెంగళూరులో 40 మంది అతిథులతో 8 సంవత్సరాల పిల్లల పుట్టినరోజు, 30,000 బడ్జెట్ మరియు స్పేస్ థీమ్.' },
      { id: 'community', icon: '🪔', title: 'అపార్ట్‌మెంట్ గణేష్ / దీపావళి ఉత్సవం', prompt: 'పూణేలో 150 మంది నివాసితులతో 3 రోజుల సొసైటీ ఉత్సవం, 80,000 బడ్జెట్ మరియు పర్యావరణహిత పండల్.' },
      { id: 'housewarming', icon: '🏡', title: 'సాంప్రదాయ గృహప్రవేశం', prompt: 'హైదరాబాద్‌లో 75 మంది కుటుంబ సభ్యులతో గృహప్రవేశ పూజ, 1.5 లక్షల బడ్జెట్.' }
    ],
    hi: [
      { id: 'wedding', icon: '💍', title: 'भव्य विवाह और रिसेप्शन', prompt: 'जयपुर में 250 मेहमानों के लिए 15 लाख के बजट में 2 दिवसीय पारंपरिक विवाह और शाकाहारी दावत।' },
      { id: 'birthday', icon: '🎂', title: 'बच्चों का जन्मदिन समारोह', prompt: 'बेंगलुरु में 40 मेहमानों के लिए 30,000 के बजट में 8 साल के बच्चे की जन्मदिन पार्टी और स्पेस थीम।' },
      { id: 'community', icon: '🪔', title: 'सोसायटी गणेश / दिवाली उत्सव', prompt: 'पुणे में 150 निवासियों के लिए 80,000 के बजट में 3 दिवसीय गणेश उत्सव और इको-फ्रेंडली पंडाल।' },
      { id: 'housewarming', icon: '🏡', title: 'पारंपरिक गृह प्रवेश', prompt: 'हैदराबाद में 75 पारिवारिक मेहमानों के लिए 1.5 लाख के बजट में गृह प्रवेश पूजा।' }
    ],
    kn: [
      { id: 'wedding', icon: '💍', title: 'ಭವ್ಯ ವಿವಾಹ ಮತ್ತು ಆರತಕ್ಷತೆ', prompt: 'ಜೈಪುರದಲ್ಲಿ 250 ಅತಿಥಿಗಳಿಗೆ 15 ಲಕ್ಷದ ಬಜೆಟ್‌ನಲ್ಲಿ 2 ದಿನಗಳ ಸಾಂಪ್ರದಾಯಿಕ ವಿವಾಹ ಮತ್ತು ಸಸ್ಯಾಹಾರಿ ಔತಣಕೂಟ.' },
      { id: 'birthday', icon: '🎂', title: 'ಮಕ್ಕಳ ಹುಟ್ಟುಹಬ್ಬದ ಸಂಭ್ರಮ', prompt: 'ಬೆಂಗಳೂರಿನಲ್ಲಿ 40 ಅತಿಥಿಗಳಿಗೆ 30,000 ಬಜೆಟ್‌ನಲ್ಲಿ 8 ವರ್ಷದ ಮಗುವಿನ ಹುಟ್ಟುಹಬ್ಬದ ಪಾರ್ಟಿ.' },
      { id: 'community', icon: '🪔', title: 'ಸೊಸೈಟಿ ಗಣೇಶ / ದೀಪಾವಳಿ ಉತ್ಸವ', prompt: 'ಪುಣೆಯಲ್ಲಿ 150 ನಿವಾಸಿಗಳಿಗೆ 80,000 ಬಜೆಟ್‌ನಲ್ಲಿ 3 ದಿನಗಳ ಅಪಾರ್ಟ್‌ಮೆಂಟ್ ಗಣೇಶೋತ್ಸವ.' },
      { id: 'housewarming', icon: '🏡', title: 'ಸಾಂಪ್ರದಾಯಿಕ ಗೃಹಪ್ರವೇಶ', prompt: 'ಹೈದರಾಬಾದ್‌ನಲ್ಲಿ 75 ಕುಟುಂಬ ಸದಸ್ಯರಿಗೆ 1.5 ಲಕ್ಷದ ಬಜೆಟ್‌ನಲ್ಲಿ ಗೃಹಪ್ರವೇಶ ಪೂಜೆ.' }
    ],
    ta: [
      { id: 'wedding', icon: '💍', title: 'மங்களகரமான திருமணம் & வரவேற்பு', prompt: 'ஜெய்ப்பூரில் 250 விருந்தினர்களுடன் 15 லட்சம் பட்ஜெட்டில் 2 நாள் பாரம்பரிய திருமணம் மற்றும் சைவ விருந்து.' },
      { id: 'birthday', icon: '🎂', title: 'குழந்தைகள் பிறந்தநாள் விழா', prompt: 'பெங்களூரில் 40 விருந்தினர்களுடன் 30,000 பட்ஜெட்டில் 8 வயது குழந்தையின் பிறந்தநாள் விழா.' },
      { id: 'community', icon: '🪔', title: 'குடியிருப்பு விநாயகர் / தீபாவளி உத்சவம்', prompt: 'புனேயில் 150 குடியிருப்பாளர்களுடன் 80,000 பட்ஜெட்டில் 3 நாள் சமூக திருவிழா.' },
      { id: 'housewarming', icon: '🏡', title: 'பாரம்பரிய கிரகப்பிரவேசம்', prompt: 'ஹைதராபாத்தில் 75 குடும்ப உறுப்பினர்களுடன் 1.5 லட்சம் பட்ஜெட்டில் கிரகப்பிரவேச பூஜை.' }
    ]
  };

  return LOCALIZED_CHIPS[lang] || APP_CONFIG.INSPIRATION_CHIPS;
}
