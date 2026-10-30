/**
 * state.js - Multi-Event Application State with Versioning & Undo Stack
 * Supports unlimited simultaneous celebration plans (Weddings, PG Birthdays, Community Pujas)
 * With seamless 1-tap switching between events.
 */

const STORAGE_KEY = 'apna_utsav_v3_state';
const SCHEMA_VERSION = 3;

export const INITIAL_EMPTY_STATE = {
  version: SCHEMA_VERSION,
  events: [], // Array of celebration plans
  activeEventId: null,
  activeTab: 'dashboard'
};

class StateStore {
  constructor() {
    this.state = this.loadState();
    this.listeners = new Set();
    this.historyStack = [];
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Try migrating from v2 single-event state if present
        const v2Raw = localStorage.getItem('apna_utsav_v2_state');
        if (v2Raw) {
          const v2Data = JSON.parse(v2Raw);
          if (v2Data.hasActivePlan && v2Data.event) {
            const singleEvent = {
              id: v2Data.event.id || 'evt_' + Date.now(),
              event: v2Data.event,
              budgetItems: v2Data.budgetItems || [],
              tasks: v2Data.tasks || [],
              vendors: v2Data.vendors || [],
              ideas: v2Data.ideas || []
            };
            return {
              version: SCHEMA_VERSION,
              events: [singleEvent],
              activeEventId: singleEvent.id,
              activeTab: 'dashboard'
            };
          }
        }
        return JSON.parse(JSON.stringify(INITIAL_EMPTY_STATE));
      }
      const parsed = JSON.parse(raw);
      return this.migrate(parsed);
    } catch (e) {
      console.warn('Failed to load state from localStorage, using clean initial state:', e);
      return JSON.parse(JSON.stringify(INITIAL_EMPTY_STATE));
    }
  }

  migrate(data) {
    if (!data.version || data.version < SCHEMA_VERSION) {
      data.version = SCHEMA_VERSION;
    }
    if (!Array.isArray(data.events)) {
      data.events = [];
      data.activeEventId = null;
    }
    return { ...INITIAL_EMPTY_STATE, ...data };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Storage full or error saving state:', e);
    }
    this.notify();
  }

  pushHistory() {
    if (this.historyStack.length > 20) {
      this.historyStack.shift();
    }
    this.historyStack.push(JSON.stringify(this.state));
  }

  undo() {
    if (this.historyStack.length === 0) return false;
    const previous = this.historyStack.pop();
    try {
      this.state = JSON.parse(previous);
      this.saveState();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Returns current active celebration object or null
   */
  getActivePlan() {
    if (!this.state.events || this.state.events.length === 0) return null;
    return this.state.events.find(e => e.id === this.state.activeEventId) || this.state.events[0] || null;
  }

  /**
   * Convenience getter mimicking old state shape for smooth compatibility
   */
  getState() {
    const active = this.getActivePlan();
    return {
      ...this.state,
      hasActivePlan: Boolean(active),
      event: active?.event || null,
      budgetItems: active?.budgetItems || [],
      tasks: active?.tasks || [],
      vendors: active?.vendors || [],
      ideas: active?.ideas || []
    };
  }

  /**
   * Switch active celebration
   */
  switchEvent(eventId) {
    this.pushHistory();
    this.state.activeEventId = eventId;
    this.saveState();
  }

  /**
   * Add a new celebration plan to the list and make it active
   */
  addEvent(plan) {
    this.pushHistory();
    const eventObj = {
      id: plan.event?.id || 'evt_' + Date.now(),
      event: plan.event,
      budgetItems: plan.budgetItems || [],
      tasks: plan.tasks || [],
      vendors: plan.vendors || [],
      ideas: plan.ideas || []
    };
    this.state.events = [...(this.state.events || []), eventObj];
    this.state.activeEventId = eventObj.id;
    this.saveState();
  }

  /**
   * Update active celebration
   */
  updateActivePlan(updater) {
    this.pushHistory();
    const active = this.getActivePlan();
    if (!active) return;

    let updatedActive = active;
    if (typeof updater === 'function') {
      updatedActive = updater(active);
    } else {
      updatedActive = { ...active, ...updater };
    }

    this.state.events = this.state.events.map(e => e.id === active.id ? updatedActive : e);
    this.saveState();
  }

  /**
   * Delete an event by ID
   */
  deleteEvent(eventId) {
    this.pushHistory();
    this.state.events = this.state.events.filter(e => e.id !== eventId);
    if (this.state.activeEventId === eventId) {
      this.state.activeEventId = this.state.events.length > 0 ? this.state.events[0].id : null;
    }
    this.saveState();
  }

  /**
   * Reset all celebrations
   */
  resetAllData() {
    this.pushHistory();
    this.state = JSON.parse(JSON.stringify(INITIAL_EMPTY_STATE));
    this.saveState();
  }

  setState(updater) {
    this.pushHistory();
    const active = this.getActivePlan();
    if (active) {
      const currentStateLikeV2 = {
        ...this.state,
        hasActivePlan: true,
        event: active.event,
        budgetItems: active.budgetItems,
        tasks: active.tasks,
        vendors: active.vendors,
        ideas: active.ideas
      };

      const updated = typeof updater === 'function' ? updater(currentStateLikeV2) : { ...currentStateLikeV2, ...updater };
      
      // Update the active event entry in events array
      this.state.events = this.state.events.map(e => {
        if (e.id === active.id) {
          return {
            ...e,
            event: updated.event || e.event,
            budgetItems: updated.budgetItems || e.budgetItems,
            tasks: updated.tasks || e.tasks,
            vendors: updated.vendors || e.vendors,
            ideas: updated.ideas || e.ideas
          };
        }
        return e;
      });
      if (updated.activeTab) this.state.activeTab = updated.activeTab;
    } else if (typeof updater === 'function') {
      this.state = updater(this.state);
    }
    this.saveState();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.getState());
      } catch (e) {
        console.error('State subscriber error:', e);
      }
    }
  }
}

export const store = new StateStore();
