import test from 'node:test';
import assert from 'node:assert/strict';

// Setup mock localStorage before importing state.js
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.has(key) ? storage.get(key) : null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear()
};

import { store, INITIAL_EMPTY_STATE } from '../public/js/state.js';

test('StateStore - Fresh initialization', () => {
  storage.clear();
  store.resetAllData();
  const state = store.getState();
  assert.equal(state.version, 3);
  assert.equal(state.events.length, 0);
  assert.equal(state.hasActivePlan, false);
  assert.equal(state.event, null);
});

test('StateStore - Add Event and Set as Active', () => {
  storage.clear();
  store.resetAllData();

  const plan = {
    event: {
      id: 'test_wedding_1',
      title: 'Sister Wedding',
      type: 'wedding',
      city: 'Hyderabad',
      guestCount: 200,
      totalBudget: 1000000,
      currency: 'INR',
      language: 'en'
    },
    budgetItems: [
      { id: 'b1', category: 'Catering', plannedAmount: 300000, actualAmount: 0 }
    ],
    tasks: [
      { id: 't1', title: 'Book Mandapam', completed: false }
    ],
    vendors: [],
    ideas: []
  };

  store.addEvent(plan);
  const state = store.getState();
  assert.equal(state.events.length, 1);
  assert.equal(state.hasActivePlan, true);
  assert.equal(state.event.title, 'Sister Wedding');
  assert.equal(state.budgetItems.length, 1);
  assert.equal(state.tasks.length, 1);
});

test('StateStore - Multi-Event Management and Switching', () => {
  const plan2 = {
    event: {
      id: 'test_bday_2',
      title: 'Hostel Birthday Bash',
      type: 'birthday',
      city: 'Bengaluru',
      guestCount: 4,
      totalBudget: 1000,
      currency: 'INR',
      language: 'en'
    },
    budgetItems: [
      { id: 'b2', category: 'Cake & Sweets', plannedAmount: 400, actualAmount: 0 }
    ],
    tasks: [],
    vendors: [],
    ideas: []
  };

  store.addEvent(plan2);
  let state = store.getState();
  assert.equal(state.events.length, 2);
  assert.equal(state.event.title, 'Hostel Birthday Bash', 'Newly added event should be active');

  // Switch back to wedding
  store.switchEvent('test_wedding_1');
  state = store.getState();
  assert.equal(state.event.title, 'Sister Wedding');
  assert.equal(state.event.totalBudget, 1000000);

  // Switch back to birthday
  store.switchEvent('test_bday_2');
  state = store.getState();
  assert.equal(state.event.title, 'Hostel Birthday Bash');
  assert.equal(state.event.totalBudget, 1000);
});

test('StateStore - Language change syncs global and active plan', () => {
  store.setLanguage('te');
  const state = store.getState();
  assert.equal(state.language, 'te');
  assert.equal(state.event.language, 'te');
});

test('StateStore - Undo history restores previous state', () => {
  const initialTitle = store.getState().event.title;
  
  // Make a change
  store.updateActivePlan(active => ({
    ...active,
    event: { ...active.event, title: 'Updated Title Modified' }
  }));

  assert.equal(store.getState().event.title, 'Updated Title Modified');

  // Perform undo
  const undone = store.undo();
  assert.equal(undone, true, 'Undo should succeed');
  assert.equal(store.getState().event.title, initialTitle, 'Should revert back to previous title');
});

test('StateStore - Delete Event falls back to next available event', () => {
  assert.equal(store.getState().events.length, 2);
  
  // Delete active event
  const currentActiveId = store.getState().activeEventId;
  store.deleteEvent(currentActiveId);

  const state = store.getState();
  assert.equal(state.events.length, 1);
  assert.ok(state.activeEventId);
  assert.notEqual(state.activeEventId, currentActiveId);
});

test('StateStore - Migration from v2 single-event schema', () => {
  storage.clear();
  const v2LegacyData = {
    version: 2,
    hasActivePlan: true,
    event: {
      id: 'legacy_evt',
      title: 'Legacy Griha Pravesh',
      type: 'housewarming',
      city: 'Pune',
      guestCount: 50,
      totalBudget: 150000,
      currency: 'INR'
    },
    budgetItems: [{ id: 'b_legacy', category: 'Puja Samagri', plannedAmount: 15000, actualAmount: 0 }],
    tasks: [{ id: 't_legacy', title: 'Consult Panditji', completed: true }]
  };
  storage.set('apna_utsav_v2_state', JSON.stringify(v2LegacyData));

  // Reload state in store
  const loaded = store.loadState();
  assert.equal(loaded.version, 3);
  assert.equal(loaded.events.length, 1);
  assert.equal(loaded.events[0].id, 'legacy_evt');
  assert.equal(loaded.events[0].event.title, 'Legacy Griha Pravesh');
  assert.equal(loaded.events[0].budgetItems.length, 1);
  assert.equal(loaded.events[0].tasks.length, 1);
});
