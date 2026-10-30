/**
 * timeline.js - Backward Planned Timeline & Day-Of Run-of-Show Schedule
 * Milestones computed backward from celebration day.
 * Includes risk detection for compressed deadlines & .ics export.
 */

export function computeTimelineTasks(eventDateStr, eventType = 'wedding', isMicro = false, needsVenue = true) {
  const eventDate = new Date(eventDateStr || Date.now());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const isCompressed = diffDays < 21; // Tight timeline under 3 weeks

  const baseTasks = [];

  const add = (title, dueOffsetDays, category, priority, notes) => {
    const due = new Date(eventDate);
    let effectiveOffset = dueOffsetDays;
    let effectivePriority = priority;
    let riskFlag = null;

    if (isCompressed && dueOffsetDays < -diffDays) {
      effectiveOffset = -Math.max(1, Math.floor(diffDays * 0.7));
      effectivePriority = 'high';
      riskFlag = '⚡ High Priority: Event is soon! Complete immediately to avoid vendor unavailability.';
    }

    due.setDate(due.getDate() + effectiveOffset);
    const dueDateStr = due.toISOString().split('T')[0];

    baseTasks.push({
      id: 'tsk_' + Math.random().toString(36).substr(2, 7),
      title,
      dueDate: dueDateStr,
      status: 'todo', // 'todo' | 'done'
      priority: effectivePriority,
      category,
      notes: riskFlag || notes || '',
      isRisk: Boolean(riskFlag)
    });
  };

  if (isMicro) {
    // Intimate PG / Hostel / Room Celebration
    add('Order Themed Cake & Sparkler Candles on Blinkit / Swiggy Instamart', -1, 'Cake', 'high', 'Pre-order 500g chocolate or custom cake with candles');
    add('Pick Up Room Fairy Lights & Balloons for Photo Corner', -2, 'Decor', 'medium', 'Warm LED fairy lights and wall tape that does not damage PG walls');
    add('Coordinate Food Delivery (Biryani / Pizza & Soft Drinks)', 0, 'Food', 'high', 'Schedule delivery for 10:30 PM before midnight countdown');
    add('Check PG Quiet Hours & Roommate Etiquette', 0, 'Hostel Norms', 'high', 'Keep Bluetooth speaker volume polite after 10:30 PM to respect wardens');
    add('Midnight Cake Cutting & Surprise Entry', 0, 'Run-of-Show', 'high', 'Gather friends outside room at 11:58 PM for the countdown!');
  } else if (eventType === 'wedding') {
    if (needsVenue) {
      add('Finalize & Book Wedding Venue & Guest Rooms', -90, 'Venue', 'high', 'Ensure AC, backup generator & ample car parking capacity');
    } else {
      add('Prepare Home / Temple Premises & Seating Layout', -30, 'Space Prep', 'high', 'Arrange shamiana, floor carpets, and guest washroom essentials');
    }
    add('Book Feast Caterer & Finalize Degchi/Buffet Menu', -60, 'Catering', 'high', 'Conduct food tasting with family elders; test dessert items');
    add('Hire Candid Wedding Photographer & Cinematographer', -45, 'Photography', 'high', 'Check drone permissions & raw footage handover policy');
    add('Finalize Stage Backdrop, Mandap & Floral Decor Theme', -30, 'Decor', 'medium', 'Marigold, Jasmine and ambient warm lighting');
    add('Shop Bridal & Groom Silks, Attire & Jewelry', -25, 'Attire', 'high', 'Allow 2-3 weeks for alteration & dry cleaning');
    add('Send Digital & Physical Invitations with RSVP Link', -15, 'Invitations', 'high', 'Include Google Maps location link on invite');
    add('Confirm Sangeet Music, Sound System & Emcee Roster', -10, 'Entertainment', 'medium', 'Apply for local sound permit if playing after 10 PM');
    add('Final Headcount Reconfirmation with Head Caterer', -3, 'Catering', 'high', 'Keep 10% plate buffer for unexpected guests');
    add('Family Briefing & Day-Of Run-of-Show Walkthrough', -1, 'Run-of-Show', 'high', 'Prepare first aid kit, cash envelope & coordinator roster');
  } else if (eventType === 'birthday') {
    if (needsVenue) {
      add('Reserve Party Hall or Lawn Venue', -30, 'Venue', 'high', 'Confirm music permit and air conditioning');
    } else {
      add('Setup Living Room / PG Space & Photo Corner', -5, 'Space Prep', 'medium', 'Clear furniture, test fairy lights and arrange comfortable floor seating');
    }
    add('Finalize Birthday Theme & Order Custom Cake', -20, 'Catering', 'high', 'Specify eggless/flavor details and delivery timing');
    add('Book Magician, Game Host or Mascot Entertainer', -15, 'Entertainment', 'medium', 'Coordinate interactive group games and prizes');
    add('Design Balloon Arch, Welcome Cutout & Table Decor', -10, 'Decor', 'medium', 'Eco-friendly balloon & paper decorations');
    add('Send WhatsApp Invites with Dietary RSVP', -7, 'Invitations', 'high', 'Ask parents about food allergies or preferences');
    add('Assemble Return Gift Goodie Hampers & Game Prizes', -3, 'Gifts', 'low', 'Books, stationery and healthy treats (no cheap plastic)');
    add('Day-of Setup: Music playlist, photo area & cake table', 0, 'Run-of-Show', 'high', 'Arrive at hall or room 1.5 hours prior to guests');
  } else if (eventType === 'housewarming') {
    add('Confirm Auspicious Muhurtham Timings with Pandit', -30, 'Rituals', 'high', 'Collect required puja samagri list');
    add('Book Vegetarian Feast Caterer & Sweet Makers', -20, 'Catering', 'high', 'Arrange traditional banana leaf service & Payasam');
    add('Order Fresh Mango Leaves, Marigold Garlands & Toran', -7, 'Decor', 'medium', 'Decorate main doorway and puja altar');
    add('Send Digital Griha Pravesh Invites to Family & Neighbors', -5, 'Invitations', 'high', 'Share Google Maps pin and landmark notes');
    add('Boiling Milk Ceremony & Vastu Puja Preparation', 0, 'Run-of-Show', 'high', 'Keep new stainless steel/brass vessel ready');
  } else {
    // Community Festival / Puja
    add('Obtain Society / Police & Sound Loudspeaker Permissions', -45, 'Permits', 'high', 'Mandatory for public loudspeakers and processions');
    add('Erect Pandal / Shamiana & Secure Backup Generator', -25, 'Infrastructure', 'high', 'Inspect electrical earthing and fire extinguishers');
    add('Order Sacred Clay Murti / Puja Items & Flowers', -20, 'Puja', 'high', '100% eco-friendly clay idol with priest coordination');
    add('Organize Mahaprasad / Annadanam Community Kitchen Team', -15, 'Catering', 'high', 'Food grade serving plates & clean drinking water');
    add('Publish Resident Schedule & Cultural Program Timings', -7, 'Invitations', 'medium', 'Share notice in society WhatsApp groups');
    add('Volunteer Briefing: Crowd control, first aid & dustbins', -2, 'Volunteers', 'high', 'Designate green marshals for waste segregation');
  }

  return baseTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

/**
 * Hour-by-hour day-of Run-of-Show
 */
export function getDayOfSchedule(eventType = 'wedding', isMicro = false) {
  if (isMicro) {
    return [
      { time: '08:30 PM', activity: 'Decorate PG room: string up fairy lights & arrange balloons on wall', owner: 'Friends' },
      { time: '10:00 PM', activity: 'Receive food delivery (Biryani/Pizza) & Cake; keep chilled', owner: 'Roommates' },
      { time: '11:30 PM', activity: 'Friends gather quietly outside room; test playlist & candles', owner: 'All Friends' },
      { time: '11:59 PM', activity: 'Turn off main lights, light sparkler candles & start countdown', owner: 'Lead Friend' },
      { time: '12:00 AM', activity: 'Midnight Cake Cutting, Birthday Song & celebration cheers!', owner: 'Birthday Star & Friends' },
      { time: '12:25 AM', activity: 'Midnight feast: Hot biryani, pizza slices & cold drinks', owner: 'All' },
      { time: '01:15 AM', activity: 'Quick room cleanup and trash disposal (paper plates to bin)', owner: 'Friends' }
    ];
  } else if (eventType === 'wedding') {
    return [
      { time: '06:00 AM', activity: 'Mangala Snanam / Haldi ceremony for bride and groom', owner: 'Family Elders' },
      { time: '08:00 AM', activity: 'Bridal & Groom Makeup and traditional attire dressing', owner: 'Stylist & Family' },
      { time: '09:30 AM', activity: 'Mandap Floral Inspection & Priest Samagri setup', owner: 'Decor Lead & Pandit' },
      { time: '10:00 AM', activity: 'Guest Arrival, Welcome Drinks & Traditional Instrumental Music', owner: 'Welcome Committee' },
      { time: '10:45 AM', activity: 'Auspicious Muhurtham Rituals, Kanyadanam & Jeelakarra Bellam', owner: 'Pandit / Priest' },
      { time: '12:30 PM', activity: 'Traditional Feast / Lunch Buffet Service opens', owner: 'Catering Lead' },
      { time: '02:30 PM', activity: 'Photo Session with Extended Family & Candid Portraits', owner: 'Photographer' },
      { time: '06:30 PM', activity: 'Grand Evening Reception & Stage Entry', owner: 'Emcee & Sound Team' },
      { time: '08:30 PM', activity: 'Dinner Buffet, Celebration Music & Family Dancing', owner: 'Caterer & DJ' },
      { time: '10:30 PM', activity: 'Vendor settlements & Return gift distribution to departing guests', owner: 'Event Lead' }
    ];
  } else if (eventType === 'birthday') {
    return [
      { time: '03:30 PM', activity: 'Decorators arrive: Balloon Arch, Backdrop & Cake Table setup', owner: 'Decorator' },
      { time: '04:30 PM', activity: 'Custom Cake delivery & sound system music check', owner: 'Host' },
      { time: '05:00 PM', activity: 'Guests arrive: Welcome drinks & tattoo/face-painting counter opens', owner: 'Coordinator' },
      { time: '05:45 PM', activity: 'Interactive Party Games & Magic Show led by Emcee', owner: 'Game Host' },
      { time: '06:45 PM', activity: 'Cake Cutting Ceremony & Birthday Celebration Song', owner: 'Family & Friends' },
      { time: '07:15 PM', activity: 'Kids & Parents Dinner/Snacks Buffet opens', owner: 'Catering' },
      { time: '08:30 PM', activity: 'Return Gift Hamper Distribution and Farewell', owner: 'Hosts' }
    ];
  } else if (eventType === 'housewarming') {
    return [
      { time: '05:30 AM', activity: 'Auspicious Entry: Cow & Calf greeting / Threshold Puja', owner: 'Head of Family' },
      { time: '06:30 AM', activity: 'Milk Boiling Ritual (Ksheera Tharpanam) in new kitchen', owner: 'Family Elders' },
      { time: '08:00 AM', activity: 'Ganapati Homa & Vastu Puja by Vedic Priests', owner: 'Head Priest' },
      { time: '10:30 AM', activity: 'Purnahuti & Holy Water Sprinkle throughout all rooms', owner: 'Priest & Family' },
      { time: '11:30 AM', activity: 'Family & Neighbor Arrival, Traditional Feast served', owner: 'Catering Lead' },
      { time: '01:30 PM', activity: 'Tamboolam & Return Gift distribution to guests', owner: 'Host' }
    ];
  } else {
    // Community Festival / Puja
    return [
      { time: '06:00 AM', activity: 'Morning Bells, Deity Alankaram & Sacred Chanting', owner: 'Puja Committee' },
      { time: '08:30 AM', activity: 'Main Prana Pratishtha & Havan by Vedic Priests', owner: 'Head Priest' },
      { time: '11:30 AM', activity: 'Maha Aarti with musical accompaniment and Dhol', owner: 'All Residents' },
      { time: '12:30 PM', activity: 'Community Mahaprasad / Annadanam Serving opens', owner: 'Kitchen Volunteers' },
      { time: '05:30 PM', activity: 'Kids Cultural Performances & Bhajan Sandhya', owner: 'Cultural Secretary' },
      { time: '08:00 PM', activity: 'Evening Aarti & Eco-friendly Visarjan prep', owner: 'Volunteer Marshals' }
    ];
  }
}

/**
 * Generate iCalendar (.ics) string for tasks and event day
 */
export function generateICS(event, tasks = []) {
  const pad = n => (n < 10 ? '0' + n : n);
  const formatDateICS = dateStr => {
    const d = new Date(dateStr);
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T090000Z`;
  };

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Apna Utsav//Celebration Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  // Event day milestone
  const eventDateICS = formatDateICS(event.date || Date.now());
  ics.push(
    'BEGIN:VEVENT',
    `UID:evt-${event.id || 'main'}@apnautsav.app`,
    `DTSTAMP:${eventDateICS}`,
    `DTSTART:${eventDateICS}`,
    `SUMMARY:🎉 ${event.title || 'Celebration'} (${event.type || 'Event'})`,
    `DESCRIPTION:Location: ${event.city || 'India'}\\nGuests: ${event.guestCount || 0}\\nBudget: ${event.totalBudget || 0} ${event.currency || 'INR'}`,
    `LOCATION:${event.city || 'India'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT'
  );

  // Each milestone task
  tasks.forEach(task => {
    const taskDateICS = formatDateICS(task.dueDate);
    ics.push(
      'BEGIN:VEVENT',
      `UID:task-${task.id}@apnautsav.app`,
      `DTSTAMP:${taskDateICS}`,
      `DTSTART:${taskDateICS}`,
      `SUMMARY:📌 Task: ${task.title}`,
      `DESCRIPTION:Category: ${task.category}\\nPriority: ${(task.priority || 'normal').toUpperCase()}\\nNotes: ${task.notes || 'None'}`,
      'STATUS:TENTATIVE',
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}
