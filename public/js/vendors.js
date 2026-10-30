/**
 * vendors.js - Cultural Vendor Checklists, Negotiation Guides & Real Search
 * Strict Rule: NEVER fabricate fake vendor names, fake phone numbers, ratings, or prices.
 * Provides authentic interview questions, red flags, advance payment norms,
 * and 1-click Google Maps local search in the user's city.
 */

export const VENDOR_GUIDANCE = {
  venue: {
    category: 'Venue & Banqueting',
    iconKey: 'vendors',
    questions: [
      'What is the maximum indoor & lawn guest capacity under local fire safety norms?',
      'Is electricity backup (genset load) included, or are diesel charges billed extra per hour?',
      'Are outside decorators and caterers permitted, or is there an in-house mandatory royalty fee?',
      'What are the strict curfew timings for loudspeakers and DJ sound (e.g. 10:00 PM)?',
      'How many complimentary dressing/green rooms are provided for bride and groom?',
      'What is your written cancellation, date postponement, and refund policy?'
    ],
    redFlags: [
      'Refusal to provide written confirmation of promised inclusions (AC running hours, chair covers, cleaning fee).',
      'Insufficient parking space that will cause roadside bottlenecks for outstation guests.',
      'No valid fire safety NOC certificate or emergency exits blocked by temporary stage structures.'
    ],
    advanceNorms: '25% on booking date, 50% one month prior, remaining 25% on check-in day after room handover.'
  },

  catering: {
    category: 'Catering & Feasts',
    iconKey: 'ideas',
    questions: [
      'Do you offer a live tasting session with the exact chef team assigned to our celebration?',
      'How do you manage dietary segregation (separate cooking stations for pure Jain / veg vs non-veg)?',
      'Is service staff included in the per-plate cost, or are waiter uniforms & tips charged separately?',
      'What is your drinking water filtration and ice hygiene source protocol?',
      'What is your policy for sudden guest overflows (+10% buffer plates)?'
    ],
    redFlags: [
      'Reluctance to accommodate food tastings before signing the advance agreement.',
      'No cold-chain refrigerated van for dairy/paneer/sweets during warm summer months.',
      'Vague plate-counting mechanism at buffet counters that leads to billing disputes.'
    ],
    advanceNorms: '20% to lock date, 50% 10 days before (for ingredient procurement), final 30% post-event after plate reconciliation.'
  },

  decor: {
    category: 'Decor & Florals',
    iconKey: 'sparkles',
    questions: [
      'Are fresh flowers guaranteed or will artificial mixed flowers be substituted without prior notice?',
      'Can you show actual photos of setups completed at this exact venue?',
      'What is the dismantle and strike-down time allotted after the event ends?',
      'Are fairy lights, trusses, stage carpeting and mandap structure included in the lump sum?'
    ],
    redFlags: [
      'Using Pinterest stock photos rather than their own actual portfolio.',
      'Hidden rigging or transport charges added after the contract is signed.',
      'Using flammable draping fabrics near open havan fire or halogen lights.'
    ],
    advanceNorms: '30% advance on design approval, 50% upon materials arrival at venue, 20% right before stage handover.'
  },

  photography: {
    category: 'Photography & Cinema',
    iconKey: 'timeline',
    questions: [
      'Who are the exact senior cinematographers and candid photographers attending on event day?',
      'What is the concrete delivery timeline for raw photographs, color-graded photos and cinematic teaser film?',
      'How many drone operators and wireless mic setups for vows/speeches are included?',
      'Do you provide raw footage backup on an external hard drive?'
    ],
    redFlags: [
      'Single photographer claiming to handle both traditional stage and candid moments for 250+ guests.',
      'Contracts missing a committed delivery deadline for photo albums and cinematic films.',
      'No dual SD card recording backup protocol in cameras.'
    ],
    advanceNorms: '25% booking deposit, 50% on celebration day, balance 25% upon final edited album approval.'
  },

  entertainment: {
    category: 'Music, Sound & Emcee',
    iconKey: 'speaker',
    questions: [
      'Do you carry your own sound mixer, wireless mics and backup laptop/cables?',
      'Can we provide a custom "Must-Play" and "Do-Not-Play" playlist for different generations?',
      'Do you assist in obtaining the required IPRS / PPL music licensing if demanded by the venue?'
    ],
    redFlags: [
      'Playing inappropriate party music or loud bass without sensing crowd demographics.',
      'Lack of backup microphones or faulty sound cabling.'
    ],
    advanceNorms: '20% deposit, 80% immediately at soundcheck completion before performance.'
  }
};

/**
 * Return Google Maps search link for category + city (Ethical search without fabricating names)
 */
export function getGoogleMapsSearchUrl(categoryName, city) {
  const query = encodeURIComponent(`${categoryName} in ${city || 'India'}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
