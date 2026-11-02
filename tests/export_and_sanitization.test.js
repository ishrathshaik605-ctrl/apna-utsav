import test from 'node:test';
import assert from 'node:assert/strict';

import { generateGuestSummary } from '../public/js/export.js';
import { generateICS } from '../public/js/timeline.js';

test('Export - Guest Summary preserves family privacy by omitting budget numbers', () => {
  const plan = {
    event: {
      title: 'Aarav & Meera Wedding Celebration',
      type: 'wedding',
      city: 'Hyderabad',
      date: '2026-12-15',
      guestCount: 250,
      totalBudget: 1500000,
      dietary: ['Pure Vegetarian South Indian', 'Live Chaat Counter'],
      style: ['Royal Deccan', 'Marigold Floral']
    }
  };

  const summary = generateGuestSummary(plan);

  // Must include guest-relevant celebration details
  assert.ok(summary.includes('Aarav & Meera Wedding Celebration'));
  assert.ok(summary.includes('Hyderabad'));
  assert.ok(summary.includes('250'));
  assert.ok(summary.includes('Pure Vegetarian South Indian'));

  // MUST NOT leak budget or financial data
  assert.equal(summary.includes('1500000'), false, 'Should not contain raw total budget');
  assert.equal(summary.includes('₹'), false, 'Should not contain currency symbols or budget amounts');
  assert.equal(summary.includes('Lakh'), false, 'Should not mention budget scale');
});

test('Export - Guest Summary handles null or empty plans gracefully', () => {
  assert.equal(generateGuestSummary(null), 'No active celebration plan.');
  assert.equal(generateGuestSummary({}), 'No active celebration plan.');
});

test('Export - iCalendar (.ics) RFC 5545 compliant calendar export', () => {
  const event = {
    id: 'evt_test_77',
    title: 'Griha Pravesh Housewarming',
    city: 'Bengaluru',
    date: '2026-11-20',
    guestCount: 60,
    totalBudget: 150000,
    currency: 'INR'
  };

  const tasks = [
    {
      id: 'task_1',
      title: 'Consult Panditji for Auspicious Muhurtham',
      category: 'Rituals',
      priority: 'high',
      dueDate: '2026-11-05',
      completed: false
    },
    {
      id: 'task_2',
      title: 'Order Eco-friendly Brass Diyas & Flowers',
      category: 'Decor',
      priority: 'medium',
      dueDate: '2026-11-15',
      completed: true
    }
  ];

  const ics = generateICS(event, tasks);

  assert.ok(ics.startsWith('BEGIN:VCALENDAR'), 'Must start with BEGIN:VCALENDAR');
  assert.ok(ics.endsWith('END:VCALENDAR\r\n') || ics.endsWith('END:VCALENDAR'), 'Must end with END:VCALENDAR');
  assert.ok(ics.includes('VERSION:2.0'), 'Must specify iCal VERSION:2.0');
  assert.ok(ics.includes('PRODID:-//Apna Utsav//Celebration Planner//EN'));

  // Main event VEVENT
  assert.ok(ics.includes('SUMMARY:🎉 Griha Pravesh Housewarming'));
  assert.ok(ics.includes('LOCATION:Bengaluru'));

  // Task VEVENTs
  assert.ok(ics.includes('SUMMARY:📌 Task: Consult Panditji for Auspicious Muhurtham'));
  assert.ok(ics.includes('SUMMARY:📌 Task: Order Eco-friendly Brass Diyas & Flowers'));
});
