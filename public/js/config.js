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
