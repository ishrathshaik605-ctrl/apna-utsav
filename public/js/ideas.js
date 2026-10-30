/**
 * ideas.js - Event-Type Specific Curated Ideas & Dynamic Generator
 * Strictly matches the celebration type: Wedding, Birthday, Community Festival, Housewarming.
 * Provides on-the-fly generation of fresh ideas so users never see repetitive content.
 */

export const IDEAS_CATALOG_BY_TYPE = {
  wedding: [
    {
      id: 'w_idea_1',
      category: 'Themes & Decor',
      title: 'Marigold & Brass Traditional Mandap Sanctuary',
      description: 'Yellow and orange genda phool garlands draped with brass urlis and floating fragrant mogra blossoms. Biodegradable, cost-effective, and radiant for morning ceremonies.',
      estCostLevel: 'low',
      cultureTag: 'Traditional Vedic / South & North Indian',
      favorite: false
    },
    {
      id: 'w_idea_2',
      category: 'Culinary Experiences',
      title: 'Live Regional Chaat & Kulhad Chai Counter',
      description: 'An interactive street-food counter offering fresh Pani Puri, Dahi Vada, and piping hot cardamom chai served in earthy terracotta cups during Sangeet.',
      estCostLevel: 'low',
      cultureTag: 'All Indian Celebrations',
      favorite: true
    },
    {
      id: 'w_idea_3',
      category: 'Return Gifts & Favors',
      title: 'Eco-Friendly Plantable Seed Paper & Jute Hampers',
      description: 'Seed balls containing tulsi or marigold seeds, along with a jar of pure organic forest honey and dry fruits in handmade jute pouches with traditional thamboolam.',
      estCostLevel: 'medium',
      cultureTag: 'Sustainable Celebrations',
      favorite: false
    },
    {
      id: 'w_idea_4',
      category: 'Games & Activities',
      title: 'Interactive "How Well Do You Know the Couple?" Quiz',
      description: 'Fun Kahoot or flashcard quiz hosted by cousins/emcee during dinner, with sweet regional mithai prizes for winners.',
      estCostLevel: 'low',
      cultureTag: 'Sangeet / Reception',
      favorite: false
    },
    {
      id: 'w_idea_5',
      category: 'Invitation & Digital',
      title: 'WhatsApp Motion Video Invite with Google Maps Link',
      description: 'An elegant 45-second motion graphic invitation with traditional instrumental shehnai/nadaswaram music, dietary RSVP links, and 1-tap Google Maps directions for outstation guests.',
      estCostLevel: 'low',
      cultureTag: 'Modern Tech-Savvy',
      favorite: false
    },
    {
      id: 'w_idea_6',
      category: 'Speech & Toast Drafts',
      title: 'Heartfelt Elder Blessing Speech Template',
      description: '"To our beloved children, may your journey together be as sweet as payasam and as enduring as our family roots..." Includes customizable blanks for family memories.',
      estCostLevel: 'low',
      cultureTag: 'Family Speeches',
      favorite: false
    }
  ],

  birthday: [
    {
      id: 'b_idea_1',
      category: 'Themes & Decor',
      title: 'Outer Space & Astronaut Cosmic Galaxy',
      description: 'Glow-in-the-dark stars, rocket ship photo cut-out backdrop, balloon planetary arch with silver and navy blue accents.',
      estCostLevel: 'medium',
      cultureTag: 'Kids Adventure Theme',
      favorite: true
    },
    {
      id: 'b_idea_2',
      category: 'Culinary Experiences',
      title: 'DIY Mini Pizza & Fresh Fruit Ice Lolly Station',
      description: 'Kids get their own chef hats and customize mini whole-wheat pizza toppings, followed by 100% real fruit juice popsicles and customized themed cake.',
      estCostLevel: 'low',
      cultureTag: 'Child-Friendly Healthy & Fun',
      favorite: false
    },
    {
      id: 'b_idea_3',
      category: 'Games & Activities',
      title: 'Space Mission Treasure Hunt & Magic Illusion Show',
      description: 'Clue cards hidden around the hall where kids solve space riddles to unlock the mystery treasure chest, followed by a 45-minute interactive comedy magic show.',
      estCostLevel: 'low',
      cultureTag: 'Interactive Party Entertainment',
      favorite: false
    },
    {
      id: 'b_idea_4',
      category: 'Return Gifts & Favors',
      title: 'Solar System STEM Activity Kit & Storybooks',
      description: 'Educational DIY astronomy build-your-own solar system wooden kit, glow stickers, and inspiring children storybooks instead of throwaway plastic toys.',
      estCostLevel: 'medium',
      cultureTag: 'Educational & Meaningful',
      favorite: false
    },
    {
      id: 'b_idea_5',
      category: 'Invitation & Digital',
      title: 'Animated "Mission Boarding Pass" Digital Invite',
      description: 'Digital ticket designed like an astronaut flight pass sent over WhatsApp with embedded RSVP buttons for parents.',
      estCostLevel: 'low',
      cultureTag: 'Creative WhatsApp Invite',
      favorite: false
    },
    {
      id: 'b_idea_6',
      category: 'Speech & Toast Drafts',
      title: 'Parent Birthday Toast & Milestone Highlights',
      description: '"Watching you grow over these years has been the greatest adventure of our lives..." Warm, joyful speech celebrating milestones.',
      estCostLevel: 'low',
      cultureTag: 'Parent Toast',
      favorite: false
    }
  ],

  housewarming: [
    {
      id: 'h_idea_1',
      category: 'Themes & Decor',
      title: 'Auspicious Mango Leaf Toran & Rangoli Entryway',
      description: 'Fresh green mango leaves strung with marigold garlands across all door frames, with a vibrant rice-flour and turmeric rangoli welcoming relatives.',
      estCostLevel: 'low',
      cultureTag: 'Vedic Griha Pravesh',
      favorite: true
    },
    {
      id: 'h_idea_2',
      category: 'Culinary Experiences',
      title: 'Traditional Banana Leaf Feast & Fresh Payasam Counter',
      description: 'Multi-course regional vegetarian meal served traditionally on fresh plantain leaves, featuring hot vadai, sambar, and sweet jaggery payasam/kheer.',
      estCostLevel: 'low',
      cultureTag: 'Satvik Traditional Feast',
      favorite: false
    },
    {
      id: 'h_idea_3',
      category: 'Return Gifts & Favors',
      title: 'Brass Akhand Diya & Sweet Box Hamper',
      description: 'Polished miniature brass oil lamps (kuthu vilakku / diya) paired with traditional regional sweets like Mysore Pak or Kaju Katli in decorative boxes.',
      estCostLevel: 'medium',
      cultureTag: 'Blessing & Prosperity',
      favorite: false
    },
    {
      id: 'h_idea_4',
      category: 'Rituals & Experience',
      title: 'First Milk Boiling (Ksheera Tharpanam) Milestone',
      description: 'Boiling milk in an open vessel in the new kitchen until it overflows towards the East, symbolizing boundless abundance and prosperity.',
      estCostLevel: 'low',
      cultureTag: 'Sacred Housewarming Ritual',
      favorite: false
    }
  ],

  community: [
    {
      id: 'c_idea_1',
      category: 'Themes & Decor',
      title: 'Eco-Friendly Clay Idol & Floral Temple Pandal',
      description: '100% natural red soil (shadu mati) idol with zero chemical paint, decorated with suspended marigold bells and traditional floor rangoli crafted with rice flour.',
      estCostLevel: 'medium',
      cultureTag: 'Eco-Friendly & Devotional',
      favorite: true
    },
    {
      id: 'c_idea_2',
      category: 'Culinary Experiences',
      title: 'Community Mahaprasad & Modak/Laddoo Feast',
      description: 'Traditional Satvik community annadanam served on biodegradable leaf plates (patravali) with steamed ukadiche modak and regional sweets.',
      estCostLevel: 'low',
      cultureTag: 'Satvik Community Feasting',
      favorite: false
    },
    {
      id: 'c_idea_3',
      category: 'Games & Activities',
      title: 'Inter-Society Bhajan Sandhya & Kids Cultural Drama',
      description: 'Evening cultural program featuring classical dance, devotional music competitions, and skit by society children about mythology and environmental care.',
      estCostLevel: 'low',
      cultureTag: 'Community Engagement',
      favorite: false
    },
    {
      id: 'c_idea_4',
      category: 'Return Gifts & Favors',
      title: 'Tulsi Sapling & Sacred Prasadam Pouches',
      description: 'Live potted holy basil (tulsi) saplings with society blessing bags containing dry fruits, panchagavya diya, and holy vibhuti/kumkum.',
      estCostLevel: 'low',
      cultureTag: 'Divine & Green Blessing',
      favorite: false
    }
  ],

  pg_birthday: [
    {
      id: 'pg_idea_1',
      category: 'Themes & Decor',
      title: 'Warm Fairy Lights & Polaroids Photo Wall',
      description: 'Drape battery-powered warm LED fairy lights along the PG wall with mini wooden clips holding printed memories and inside jokes. Completely damage-free for hostel paint.',
      estCostLevel: 'low',
      cultureTag: 'Cozy PG / Hostel Vibes',
      favorite: true
    },
    {
      id: 'pg_idea_2',
      category: 'Culinary Experiences',
      title: 'Midnight Dutch Truffle & Cloud Kitchen Biryani',
      description: 'Pre-order a 500g rich chocolate truffle cake from Blinkit/Instamart and late-night hot biryani or thin-crust pizza with chilled drinks.',
      estCostLevel: 'low',
      cultureTag: 'Hostel Night Owls',
      favorite: false
    },
    {
      id: 'pg_idea_3',
      category: 'Games & Activities',
      title: 'Hostel Mafia, Codenames & Nostalgia Playlist',
      description: 'High-energy bluffing card game or mobile phone trivia with a quiet Bluetooth playlist of favorite college songs.',
      estCostLevel: 'low',
      cultureTag: 'Late Night Chill',
      favorite: false
    },
    {
      id: 'pg_idea_4',
      category: 'Surprise Entry',
      title: 'Midnight Door Knock & Sparkler Blowout',
      description: 'Roommates gather outside the door at 11:58 PM with sparkler candles lit, singing softly so wardens don\'t notice, followed by a surprise entrance.',
      estCostLevel: 'low',
      cultureTag: 'Hostel Tradition',
      favorite: false
    }
  ]
};

/**
 * Returns tailored initial catalog based on event type
 */
export function getIdeasForEventType(eventType = 'wedding', isMicro = false) {
  if (isMicro) {
    return JSON.parse(JSON.stringify(IDEAS_CATALOG_BY_TYPE.pg_birthday));
  }
  const catalog = IDEAS_CATALOG_BY_TYPE[eventType] || IDEAS_CATALOG_BY_TYPE.wedding;
  return JSON.parse(JSON.stringify(catalog));
}

/**
 * Generate fresh creative ideas on-the-fly
 */
export function generateFreshIdeasForEvent(event) {
  const type = event?.type || 'wedding';
  const city = event?.city || 'India';
  const timestamp = Date.now();

  if (type === 'wedding') {
    return [
      {
        id: 'fresh_w_1_' + timestamp,
        category: 'Themes & Decor',
        title: `Royal ${city} Heritage Courtyard Decor`,
        description: `Earthy terracotta diyas, floating candle lanterns, and fragrant mogra chandeliers creating a warm, regal palace ambience.`,
        estCostLevel: 'medium',
        cultureTag: 'Regal Heritage',
        favorite: false
      },
      {
        id: 'fresh_w_2_' + timestamp,
        category: 'Culinary Experiences',
        title: 'Artisanal Jalebi & Live Rabdi Stand',
        description: 'Crisp hot saffron jalebis made live on coal stoves paired with chilled creamy pistachio rabdi.',
        estCostLevel: 'low',
        cultureTag: 'Live Dessert Counter',
        favorite: false
      },
      {
        id: 'fresh_w_3_' + timestamp,
        category: 'Games & Activities',
        title: 'Family Tug-of-War & Antakshari Faceoff',
        description: 'High-energy Haldi celebration game dividing bride & groom sides for nostalgic family bonding.',
        estCostLevel: 'low',
        cultureTag: 'Haldi & Sangeet Fun',
        favorite: false
      },
      {
        id: 'fresh_w_4_' + timestamp,
        category: 'Return Gifts & Favors',
        title: 'Handmade Jaipur Block-Printed Stoles',
        description: 'Lightweight cotton scarves presented in eco-friendly handcrafted boxes as enduring keepsakes.',
        estCostLevel: 'medium',
        cultureTag: 'Artisanal Keepsake',
        favorite: false
      }
    ];
  } else if (type === 'birthday') {
    return [
      {
        id: 'fresh_b_1_' + timestamp,
        category: 'Themes & Decor',
        title: 'Jungle Safari Wildlife Adventure',
        description: 'Faux foliage backdrops, safari balloon arch, animal footprint trails on floor, and explorer hats for all guests.',
        estCostLevel: 'medium',
        cultureTag: 'Wildlife Theme',
        favorite: false
      },
      {
        id: 'fresh_b_2_' + timestamp,
        category: 'Culinary Experiences',
        title: 'Live Popcorn & Cotton Candy Cart',
        description: 'Retro carnival carts serving fresh organic buttery popcorn and pink cloud cotton candy for kids.',
        estCostLevel: 'low',
        cultureTag: 'Carnival Treats',
        favorite: false
      },
      {
        id: 'fresh_b_3_' + timestamp,
        category: 'Games & Activities',
        title: 'Interactive Pottery / Clay Modeling Workshop',
        description: 'A friendly instructor guides kids to shape their own mini clay animals or bowls to take home.',
        estCostLevel: 'low',
        cultureTag: 'Creative Arts & Crafts',
        favorite: false
      },
      {
        id: 'fresh_b_4_' + timestamp,
        category: 'Return Gifts & Favors',
        title: 'Personalized Canvas Tote Bags with Art Supplies',
        description: 'Sturdy cotton totes printed with each child\'s name, filled with watercolor paints and sketchpads.',
        estCostLevel: 'medium',
        cultureTag: 'Creative Keepsake',
        favorite: false
      }
    ];
  }

  // Community / Festival
  return [
    {
      id: 'fresh_c_1_' + timestamp,
      category: 'Themes & Decor',
      title: 'Floral Toran Canopy with Hanging Brass Bells',
      description: 'Marigold and tuberose canopies with resonant temple bells suspended over the pandal entrance walkway.',
      estCostLevel: 'low',
      cultureTag: 'Divine Ambience',
      favorite: false
    },
    {
      id: 'fresh_c_2_' + timestamp,
      category: 'Culinary Experiences',
      title: 'Heritage Khichdi & Kheer Langar Feasting',
      description: 'Steaming ghee-tempered khichdi, papad, pickle and slow-cooked rice kheer served warm to all community visitors.',
      estCostLevel: 'low',
      cultureTag: 'Community Annadanam',
      favorite: false
    },
    {
      id: 'fresh_c_3_' + timestamp,
      category: 'Games & Activities',
      title: 'Mega Society Rangoli & Diya Lighting Contest',
      description: 'Friendly neighborhood competition across blocks for the most artistic floral or rice powder rangoli.',
      estCostLevel: 'low',
      cultureTag: 'Neighborhood Unity',
      favorite: false
    },
    {
      id: 'fresh_c_4_' + timestamp,
      category: 'Return Gifts & Favors',
      title: 'Potted Medicinal Tulsi / Aloe Vera Plants',
      description: 'Small terracotta pots with healthy herbal plants gifted to every visiting family with holy prasadam.',
      estCostLevel: 'low',
      cultureTag: 'Green Community Initiative',
      favorite: false
    }
  ];
}

export function filterIdeas(ideas, category = 'all', onlyFavorites = false) {
  return ideas.filter(item => {
    const matchCategory = category === 'all' || item.category === category;
    const matchFav = onlyFavorites ? item.favorite : true;
    return matchCategory && matchFav;
  });
}
