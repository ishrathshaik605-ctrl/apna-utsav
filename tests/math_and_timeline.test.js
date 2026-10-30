import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatCurrency,
  formatIndianNumber,
  computeBudgetSplit,
  calculateBudgetStats,
  rebalanceBudget,
  getCategoriesForEvent
} from '../public/js/math.js';

import { computeTimelineTasks, generateICS, getDayOfSchedule } from '../public/js/timeline.js';

test('Indian Number Formatting', () => {
  assert.equal(formatIndianNumber(125000), '1,25,000');
  assert.equal(formatIndianNumber(1200000), '12,00,000');
  assert.equal(formatIndianNumber(500), '500');
  assert.equal(formatIndianNumber(1000), '1,000');
});

test('Currency Formatting for INR and USD', () => {
  assert.equal(formatCurrency(1200000, 'INR'), '₹12,00,000');
  assert.equal(formatCurrency(50000, 'USD'), '$50,000');
});

test('Budget Split - Enforces exact total sum and mandatory 8-10% contingency', () => {
  const total = 1000000; // 10 Lakh
  const categories = [
    { name: 'Venue', percent: 30 },
    { name: 'Catering', percent: 30 },
    { name: 'Decor', percent: 15 },
    { name: 'Photography', percent: 15 }
  ];

  const items = computeBudgetSplit(total, categories);
  const sumPlanned = items.reduce((acc, i) => acc + i.plannedAmount, 0);

  // Math must be deterministic to the single rupee
  assert.equal(sumPlanned, total, 'Planned items sum must equal total budget');

  // Verify contingency was auto-injected
  const hasContingency = items.some(i => i.category.toLowerCase().includes('contingency'));
  assert.equal(hasContingency, true, 'Mandatory contingency must be included');
});

test('Budget Stats Calculation & Over-Budget Warning', () => {
  const items = [
    { plannedAmount: 50000, actualAmount: 30000 },
    { plannedAmount: 50000, actualAmount: 35000 }
  ];
  const stats = calculateBudgetStats(100000, items, 100);

  assert.equal(stats.totalBudget, 100000);
  assert.equal(stats.totalActual, 65000);
  assert.equal(stats.remaining, 35000);
  assert.equal(stats.costPerGuest, 1000);
  assert.equal(stats.isOverBudget, false);

  // Test over-budget detection
  const overItems = [
    { plannedAmount: 50000, actualAmount: 60000 },
    { plannedAmount: 50000, actualAmount: 55000 }
  ];
  const overStats = calculateBudgetStats(100000, overItems, 100);
  assert.equal(overStats.isOverBudget, true);
  assert.equal(overStats.overBudgetAmount, 15000);
});

test('Timeline generation backward planning & iCalendar (.ics) export', () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 90);
  const dateStr = futureDate.toISOString().split('T')[0];

  const tasks = computeTimelineTasks(dateStr, 'wedding');
  assert.ok(tasks.length >= 5, 'Should generate milestone tasks');

  // Validate tasks have dueDate string
  tasks.forEach(t => {
    assert.ok(t.dueDate, 'Task must have a due date');
    assert.ok(t.title, 'Task must have a title');
    assert.ok(t.priority, 'Task must have a priority');
  });

  // Generate .ics string
  const event = {
    id: 'test_evt',
    title: 'Test Wedding',
    date: dateStr,
    city: 'Hyderabad',
    guestCount: 200,
    totalBudget: 500000,
    currency: 'INR'
  };
  const ics = generateICS(event, tasks);
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('END:VCALENDAR'));
  assert.ok(ics.includes('SUMMARY:🎉 Test Wedding'));
});

test('Intimate PG Room Birthday Micro-Budget & Timeline (₹1,000 for 4 friends)', () => {
  const total = 1000;
  const categories = [
    { name: 'Birthday Cake, Pastries & Candles', percent: 35 },
    { name: 'Food & Drinks (Swiggy / Zomato Biryani & Soft Drinks)', percent: 40 },
    { name: 'Room Fairy Lights, Balloons & Streamers', percent: 15 },
    { name: 'Contingency Safety Reserve', percent: 10 }
  ];

  const items = computeBudgetSplit(total, categories);
  const sumPlanned = items.reduce((acc, i) => acc + i.plannedAmount, 0);

  // Exact deterministic sum to ₹1,000
  assert.equal(sumPlanned, 1000, 'Sum of planned items must equal exactly 1000 rupees');

  // Verify item amounts are reasonable integers
  const cake = items.find(i => i.category.includes('Cake'));
  assert.ok(cake && cake.plannedAmount === 350, 'Cake should be exactly ₹350');

  const food = items.find(i => i.category.includes('Food'));
  assert.ok(food && food.plannedAmount === 400, 'Food should be exactly ₹400');

  const decor = items.find(i => i.category.includes('Fairy Lights'));
  assert.ok(decor && decor.plannedAmount === 150, 'Decor should be exactly ₹150');

  const reserve = items.find(i => i.category.includes('Contingency'));
  assert.ok(reserve && reserve.plannedAmount === 100, 'Reserve should be exactly ₹100');

  // Verify day-of PG schedule
  const schedule = getDayOfSchedule('birthday', true);
  assert.ok(schedule.length >= 5, 'PG day-of schedule must have milestones');
  assert.ok(schedule.some(s => s.activity.includes('Midnight Cake Cutting')));
  assert.ok(schedule.some(s => s.activity.includes('fairy lights')));

  // Verify timeline tasks for PG
  const tasks = computeTimelineTasks(new Date().toISOString(), 'birthday', true);
  assert.ok(tasks.some(t => t.title.includes('Blinkit') || t.title.includes('Swiggy')));
  assert.ok(tasks.some(t => t.title.includes('Quiet Hours')));
});

test('Venue Option (Own Space / PG vs Rented Hall) Budget & Timeline Adjustment', () => {
  // Case 1: Birthday at Own Space (Home/PG, needsVenue = false)
  const homeCategories = getCategoriesForEvent('birthday', false, false);
  const hasHomeVenue = homeCategories.some(c => c.name.toLowerCase().includes('venue') || c.name.toLowerCase().includes('hall rental'));
  assert.equal(hasHomeVenue, false, 'Own space celebration must have ₹0 venue/hall rental');

  const homeItems = computeBudgetSplit(20000, homeCategories);
  const homeSum = homeItems.reduce((acc, i) => acc + i.plannedAmount, 0);
  assert.equal(homeSum, 20000, 'Sum must equal exactly 20,000');

  const homeTasks = computeTimelineTasks(new Date().toISOString(), 'birthday', false, false);
  assert.ok(homeTasks.some(t => t.title.includes('Space') || t.title.includes('Room')), 'Home tasks must include space prep');
  assert.equal(homeTasks.some(t => t.title.includes('Reserve Party Hall')), false, 'Home tasks must not require hall reservation');

  // Case 2: Birthday with Rented Hall (needsVenue = true)
  const hallCategories = getCategoriesForEvent('birthday', false, true);
  const hasHallVenue = hallCategories.some(c => c.name.toLowerCase().includes('venue') || c.name.toLowerCase().includes('hall rental'));
  assert.equal(hasHallVenue, true, 'Rented venue celebration must include venue/hall rental');

  const hallItems = computeBudgetSplit(50000, hallCategories);
  const hallSum = hallItems.reduce((acc, i) => acc + i.plannedAmount, 0);
  assert.equal(hallSum, 50000, 'Sum must equal exactly 50,000');

  const hallTasks = computeTimelineTasks(new Date().toISOString(), 'birthday', false, true);
  assert.ok(hallTasks.some(t => t.title.includes('Reserve Party Hall')), 'Must include party hall reservation task');
});
