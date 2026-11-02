import test from 'node:test';
import assert from 'node:assert/strict';

import { getCategoriesForEvent } from '../public/js/math.js';
import { VENDOR_GUIDANCE } from '../public/js/vendors.js';
import { getDayOfSchedule } from '../public/js/timeline.js';

test('Cultural Intelligence - Category percentages sum exactly to 100% with contingency', () => {
  const eventTypes = ['wedding', 'birthday', 'housewarming', 'community'];
  
  eventTypes.forEach(type => {
    // Case 1: Rented Venue
    const rentedCats = getCategoriesForEvent(type, false, true);
    const rentedSum = rentedCats.reduce((acc, c) => acc + c.percent, 0);
    assert.equal(rentedSum, 100, `${type} (rented) category percentages must sum to 100%`);
    
    const rentedContingency = rentedCats.find(c => c.name.toLowerCase().includes('contingency'));
    assert.ok(rentedContingency, `${type} (rented) must include contingency`);
    assert.ok(rentedContingency.percent >= 8 && rentedContingency.percent <= 10, 'Contingency must be 8-10%');

    // Case 2: Own Space / Home / PG (needsVenue = false)
    const ownSpaceCats = getCategoriesForEvent(type, false, false);
    const ownSum = ownSpaceCats.reduce((acc, c) => acc + c.percent, 0);
    assert.equal(ownSum, 100, `${type} (own space) category percentages must sum to 100%`);
    
    // Own space should not allocate separate venue rental percentage for birthdays
    if (type === 'birthday') {
      const hasVenueRental = ownSpaceCats.some(c => c.name.toLowerCase().includes('rental'));
      assert.equal(hasVenueRental, false, 'Birthday at home/PG should not allocate venue rental');
    }

    // Case 3: Micro budget (e.g. ₹1000 PG Room Birthday)
    const microCats = getCategoriesForEvent(type, true, false);
    const microSum = microCats.reduce((acc, c) => acc + c.percent, 0);
    assert.equal(microSum, 100, `${type} (micro) category percentages must sum to 100%`);
  });
});

test('Cultural Intelligence - Vendor guidance contains authentic checklists and zero fake data', () => {
  const categories = Object.keys(VENDOR_GUIDANCE);
  assert.ok(categories.length >= 4, 'Must include venue, catering, decor, photography');

  categories.forEach(catKey => {
    const guide = VENDOR_GUIDANCE[catKey];
    assert.ok(guide.category, `${catKey} must have category title`);
    assert.ok(Array.isArray(guide.questions) && guide.questions.length >= 3, `${catKey} must have >= 3 interview questions`);
    assert.ok(Array.isArray(guide.redFlags) && guide.redFlags.length >= 2, `${catKey} must have >= 2 contract red flags`);
    assert.ok(guide.advanceNorms && guide.advanceNorms.length > 10, `${catKey} must provide standard advance payment norms`);

    // Verify no fake phone numbers (e.g. +91 9876543210 or 555-)
    const jsonStr = JSON.stringify(guide);
    assert.equal(jsonStr.includes('+91-'), false, 'Never include fake phone numbers');
    assert.equal(jsonStr.includes('555-'), false, 'Never include fake phone numbers');
  });
});

test('Cultural Intelligence - Day-of Schedule generates time-blocked milestones', () => {
  const schedule = getDayOfSchedule('wedding');
  assert.ok(Array.isArray(schedule) && schedule.length >= 4, 'Wedding day-of schedule must have structured blocks');
  
  schedule.forEach(block => {
    assert.ok(block.time, 'Schedule block must have time');
    assert.ok(block.activity, 'Schedule block must have activity description');
    assert.ok(block.owner, 'Schedule block must have owner/lead assigned');
  });
});
