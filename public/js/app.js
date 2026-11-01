/**
 * app.js - Main Application Orchestrator for Apna Utsav 2.0
 * Pure SVG Iconography | Google Gemini ☰ Drawer | ChatGPT-Style Clean Onboarding
 * Deterministic Financial Calculations | Event-Specific Dynamic Ideas
 */

import { APP_CONFIG } from './config.js';
import { getIcon } from './icons.js';
import { getTranslation } from './translations.js';
import { store, INITIAL_EMPTY_STATE } from './state.js';
import { formatCurrency, computeBudgetSplit, calculateBudgetStats, getCategoriesForEvent } from './math.js';
import { computeTimelineTasks, getDayOfSchedule } from './timeline.js';
import { VENDOR_GUIDANCE, getGoogleMapsSearchUrl } from './vendors.js';
import { getIdeasForEventType, generateFreshIdeasForEvent, filterIdeas } from './ideas.js';
import { exportCalendar, printPDFReport, generateGuestSummary, exportJSONBackup } from './export.js';
import { VoiceChatBoard } from './chat.js';

class App {
  constructor() {
    this.viewContainer = document.getElementById('view-container');
    this.currentTab = 'dashboard';
    this.voiceChatBoard = null;
    this.ideasFilter = 'all';

    this.init();
  }

  init() {
    this.initTheme();
    this.initLanguageSwitcher();
    this.renderStaticIcons();
    this.initDrawer();
    this.initAddEventModal();
    this.initVoiceChatBoard();
    this.initSettingsModal();

    // Subscribe to central state changes
    store.subscribe(() => {
      this.updateDrawerStatus();
      this.render();
    });

    // Handle hash routing
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  // --- 1. RENDER GUARANTEED VECTOR ICONS (Zero text ligatures) ---
  renderStaticIcons() {
    const setInner = (id, iconKey, cls = '') => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = getIcon(iconKey, cls);
    };

    setInner('menu-icon-placeholder', 'menu');
    setInner('settings-icon-placeholder', 'settings');
    setInner('close-icon-placeholder', 'close');
    setInner('reset-icon-slot', 'reset');
    setInner('fab-mic-icon-slot', 'sparkles');
    setInner('chat-sparkles-slot', 'sparkles');
    setInner('chat-close-icon-slot', 'close');
    setInner('voice-mic-icon-slot', 'mic');
    setInner('send-icon-slot', 'send');
    setInner('settings-close-icon-slot', 'close');
    setInner('drawer-add-icon-slot', 'add');
    setInner('plan-another-icon-slot', 'add');
    setInner('add-event-close-icon-slot', 'close');
    setInner('add-event-mic-icon-slot', 'mic');

    // Drawer navigation icons
    document.querySelectorAll('.nav-icon-slot[data-icon]').forEach(slot => {
      const key = slot.getAttribute('data-icon');
      slot.innerHTML = getIcon(key);
    });

    // Update theme icon
    const curTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setInner('theme-icon-placeholder', curTheme === 'dark' ? 'theme_light' : 'theme_dark');
  }

  // --- 2. THEME CONTROLLER ---
  initTheme() {
    const savedTheme = localStorage.getItem('apna_utsav_v2_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const toggleBtn = document.getElementById('btn-theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'light';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('apna_utsav_v2_theme', next);
        document.getElementById('theme-icon-placeholder').innerHTML = getIcon(next === 'dark' ? 'theme_light' : 'theme_dark');
      });
    }
  }

  // --- 2.5 LANGUAGE SWITCHER CONTROLLER ---
  initLanguageSwitcher() {
    const langBtn = document.getElementById('btn-header-lang');
    const dropdown = document.getElementById('header-lang-dropdown');
    const label = document.getElementById('header-lang-label');
    const drawerSelect = document.getElementById('drawer-lang-dropdown-select');

    const langNames = {
      en: 'English',
      hi: 'हिन्दी',
      te: 'తెలుగు',
      kn: 'ಕನ್ನಡ',
      ta: 'தமிழ்'
    };

    const updateLangUI = (code) => {
      if (label) label.textContent = langNames[code] || 'English';
      if (drawerSelect) drawerSelect.value = code;
      document.querySelectorAll('.lang-item').forEach(item => {
        item.classList.toggle('active', item.dataset.lang === code);
      });
      // Update HTML lang attribute
      document.documentElement.setAttribute('lang', code);
    };

    const currentLang = store.state.language || store.getState().language || 'en';
    updateLangUI(currentLang);

    if (langBtn && dropdown) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        dropdown.classList.toggle('open', !isOpen);
        langBtn.setAttribute('aria-expanded', String(!isOpen));
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-lang-wrapper')) {
          dropdown.classList.remove('open');
          langBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    document.querySelectorAll('.lang-item').forEach(item => {
      item.addEventListener('click', () => {
        const selected = item.getAttribute('data-lang');
        if (selected) {
          store.setLanguage(selected);
          updateLangUI(selected);
          dropdown?.classList.remove('open');
          langBtn?.setAttribute('aria-expanded', 'false');
          this.showToast(`Language switched to ${langNames[selected] || selected}`);
          this.render();
        }
      });
    });

    if (drawerSelect) {
      drawerSelect.addEventListener('change', (e) => {
        const selected = e.target.value;
        if (selected) {
          store.setLanguage(selected);
          updateLangUI(selected);
          this.showToast(`Language switched to ${langNames[selected] || selected}`);
          this.render();
          document.getElementById('drawer-backdrop')?.classList.remove('open');
        }
      });
    }
  }

  // --- 3. GOOGLE GEMINI STYLE ☰ DRAWER ---
  initDrawer() {
    const backdrop = document.getElementById('drawer-backdrop');
    const openBtn = document.getElementById('btn-drawer-open');
    const closeBtn = document.getElementById('btn-drawer-close');
    const navLinks = document.querySelectorAll('.drawer-item');

    const openDrawer = () => {
      this.renderDrawerEvents();
      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
      openBtn.setAttribute('aria-expanded', 'true');
    };

    const closeDrawer = () => {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
    };

    if (openBtn) openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    // Clicking on backdrop closes drawer
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeDrawer();
      });
    }

    // Tapping any nav item navigates and automatically slides drawer back into hiding
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });

    // Reset All Data button in drawer
    const clearAllBtn = document.getElementById('btn-drawer-clear-all');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        closeDrawer();
        if (confirm('Reset all celebrations? This will clear all saved event plans on this device.')) {
          store.resetAllData();
          this.showToast('All celebrations cleared. Start fresh anytime!');
          window.location.hash = '#dashboard';
        }
      });
    }

    // Keyboard ESC to close drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('open')) {
        closeDrawer();
      }
    });

    this.updateDrawerStatus();
  }

  renderDrawerEvents() {
    const listEl = document.getElementById('drawer-events-list');
    if (!listEl) return;
    const events = store.state.events || [];
    const activeId = store.state.activeEventId;

    if (events.length === 0) {
      listEl.innerHTML = `
        <div style="font-size:11px; color:var(--color-text-muted); padding:10px 8px; text-align:center;">
          No celebrations saved yet.
        </div>
      `;
      return;
    }

    listEl.innerHTML = events.map(evt => {
      const e = evt.event;
      const isActive = evt.id === activeId;
      const typeIcons = { wedding: '💍', birthday: '🎂', housewarming: '🪔', community: '🎉' };
      const icon = typeIcons[e.type] || '✨';
      return `
        <div class="drawer-event-card ${isActive ? 'active' : ''}" data-event-id="${evt.id}" role="button" tabindex="0">
          <div class="drawer-event-info">
            <div class="drawer-event-title">${icon} ${e.title}</div>
            <div class="drawer-event-sub">${e.city} • ${formatCurrency(e.totalBudget, e.currency)} • ${e.guestCount} guests</div>
          </div>
          <div class="drawer-event-actions">
            ${isActive ? `<span class="active-check-badge" title="Active Celebration">${getIcon('check')}</span>` : ''}
            ${events.length > 1 ? `
              <button type="button" class="icon-btn-sm btn-delete-event" data-delete-id="${evt.id}" title="Delete Celebration" aria-label="Delete Celebration" style="color:var(--color-text-muted);">
                ${getIcon('trash')}
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Event card click switches celebration
    listEl.querySelectorAll('.drawer-event-card').forEach(card => {
      card.addEventListener('click', (ev) => {
        if (ev.target.closest('.btn-delete-event')) return;
        const id = card.getAttribute('data-event-id');
        if (id !== activeId) {
          store.switchEvent(id);
          this.showToast('Switched celebration plan!');
        }
        document.getElementById('drawer-backdrop')?.classList.remove('open');
      });
    });

    // Delete event click
    listEl.querySelectorAll('.btn-delete-event').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const id = btn.getAttribute('data-delete-id');
        const targetEvt = events.find(e => e.id === id);
        const name = targetEvt?.event?.title || 'this celebration';
        if (confirm(`Delete celebration "${name}"?`)) {
          store.deleteEvent(id);
          this.showToast(`Deleted "${name}".`);
        }
      });
    });
  }

  // --- 4. PLAN ANOTHER CELEBRATION MODAL ---
  initAddEventModal() {
    const modal = document.getElementById('add-event-modal-overlay');
    const closeBtn = document.getElementById('btn-close-add-event-modal');
    const form = document.getElementById('add-event-prompt-form');
    const input = document.getElementById('add-event-prompt-input');
    const micBtn = document.getElementById('btn-add-event-mic');

    const openModal = () => {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 80);
      }
      document.getElementById('drawer-backdrop')?.classList.remove('open');
    };

    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    };

    document.getElementById('btn-drawer-add-event')?.addEventListener('click', openModal);
    document.getElementById('btn-drawer-plan-another')?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) {
        this.showToast('Please type your event details or tap a suggestion below!');
        input.focus();
        return;
      }
      closeModal();
      this.parseAndCreatePlan(val);
    });

    document.querySelectorAll('.add-event-suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        closeModal();
        this.parseAndCreatePlan(prompt);
      });
    });

    if (micBtn) {
      micBtn.addEventListener('click', () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          alert('Voice speech recognition not supported in this browser. Please type.');
          return;
        }
        const rec = new SpeechRecognition();
        rec.lang = 'en-IN';
        micBtn.classList.add('pulse-recording');
        rec.onresult = (ev) => {
          const spoken = ev.results[0][0].transcript;
          input.value = spoken;
          micBtn.classList.remove('pulse-recording');
          closeModal();
          this.parseAndCreatePlan(spoken);
        };
        rec.onerror = () => micBtn.classList.remove('pulse-recording');
        rec.onend = () => micBtn.classList.remove('pulse-recording');
        rec.start();
      });
    }
  }

  updateDrawerStatus() {
    const state = store.getState();
    const statusEl = document.getElementById('drawer-plan-status');
    if (statusEl) {
      if (state.hasActivePlan && state.event) {
        statusEl.textContent = `${state.event.type?.toUpperCase()} • ${state.event.city}`;
      } else {
        statusEl.textContent = 'No active plan';
      }
    }
    this.renderDrawerEvents();
  }

  // --- 5. ROUTING ---
  handleRoute() {
    const tab = window.location.hash.replace('#', '') || 'dashboard';
    this.currentTab = tab;

    // Update active state in drawer links
    document.querySelectorAll('.drawer-item').forEach(link => {
      link.classList.toggle('active', link.dataset.tab === tab);
    });

    this.render();
  }

  // --- 5. EVENT SETUP & SETTINGS MODAL (⚙️) ---
  initSettingsModal() {
    const modal = document.getElementById('settings-modal-overlay');
    const headerBtn = document.getElementById('btn-header-settings');
    const closeBtn = document.getElementById('btn-close-settings-modal');
    const cancelBtn = document.getElementById('btn-cancel-settings');
    const form = document.getElementById('event-settings-form');
    const budgetInput = document.getElementById('field-total-budget');

    // Remove any restrictive attributes and disable browser popup validation
    if (form) form.setAttribute('novalidate', 'true');
    if (budgetInput) {
      budgetInput.removeAttribute('min');
      budgetInput.setAttribute('min', '100');
      budgetInput.setAttribute('step', '50');
    }

    const openSettings = () => {
      const state = store.getState();
      if (!state.hasActivePlan || !state.event) {
        this.showToast('Please create a celebration plan first!');
        return;
      }
      const e = state.event;
      document.getElementById('field-event-title').value = e.title || '';
      document.getElementById('field-event-city').value = e.city || '';
      document.getElementById('field-event-date').value = e.date || '';
      document.getElementById('field-guest-count').value = e.guestCount || 4;
      document.getElementById('field-total-budget').value = e.totalBudget || 1000;
      document.getElementById('field-language').value = e.language || 'en';
      document.getElementById('field-currency').value = e.currency || 'INR';

      // Set venue radio option (default to 'no' for small/PG budgets <= 10,000 or <= 10 guests)
      const isSmallOrMicro = (e.totalBudget && e.totalBudget <= 10000) || (e.guestCount && e.guestCount <= 10) || e.isMicro;
      const needsVenue = e.needsVenue !== undefined ? e.needsVenue : !isSmallOrMicro;
      const venueNoRadio = document.getElementById('venue-opt-no');
      const venueYesRadio = document.getElementById('venue-opt-yes');
      if (venueNoRadio && venueYesRadio) {
        venueNoRadio.checked = !needsVenue;
        venueYesRadio.checked = Boolean(needsVenue);
      }

      if (budgetInput) {
        budgetInput.removeAttribute('min');
        budgetInput.setAttribute('min', '100');
        budgetInput.setAttribute('step', '50');
      }

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    };

    const closeSettings = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    };

    if (headerBtn) headerBtn.addEventListener('click', openSettings);
    if (closeBtn) closeBtn.addEventListener('click', closeSettings);
    if (cancelBtn) cancelBtn.addEventListener('click', closeSettings);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const state = store.getState();
        const title = document.getElementById('field-event-title').value.trim();
        const city = document.getElementById('field-event-city').value.trim() || 'India';
        const date = document.getElementById('field-event-date').value;
        const guestCount = Math.max(1, parseInt(document.getElementById('field-guest-count').value, 10) || (state.event?.guestCount || 4));
        const totalBudget = Math.max(100, parseInt(document.getElementById('field-total-budget').value, 10) || (state.event?.totalBudget || 1000));
        const language = document.getElementById('field-language').value;
        const currency = document.getElementById('field-currency').value;
        const selectedVenueVal = document.querySelector('input[name="field-needs-venue"]:checked')?.value;
        const needsVenue = selectedVenueVal === 'yes';
        const isMicro = totalBudget <= 5000 || guestCount <= 10 || Boolean(state.event?.isMicro);

        store.updateActivePlan(prev => {
          // Unconditionally recalculate deterministic amounts based on total budget and venue choice
          const categories = getCategoriesForEvent(prev.event?.type || 'birthday', isMicro, needsVenue);
          const newBudgetItems = computeBudgetSplit(totalBudget, categories);
          const newTasks = computeTimelineTasks(date, prev.event?.type || 'birthday', isMicro, needsVenue);

          return {
            ...prev,
            event: {
              ...prev.event,
              title,
              city,
              date,
              guestCount,
              totalBudget,
              needsVenue,
              isMicro,
              language,
              currency
            },
            budgetItems: newBudgetItems,
            tasks: newTasks
          };
        });

        closeSettings();
        this.showToast('Event settings updated successfully.');
      });
    }
  }

  // --- 6. VOICE CHAT BOARD (Doubt Resolution Assistant) ---
  initVoiceChatBoard() {
    const modal = document.getElementById('chat-sheet-modal');
    const openBtn = document.getElementById('btn-open-voice-board');
    const closeBtn = document.getElementById('btn-close-voice-board');

    this.voiceChatBoard = new VoiceChatBoard(modal, () => {
      this.showToast('Celebration plan updated by AI Assistant!');
      this.render();
    });

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        openBtn.setAttribute('aria-expanded', 'true');
        const input = document.getElementById('chat-input');
        if (input) input.focus();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        openBtn.setAttribute('aria-expanded', 'false');
      });
    }

    // Voice mic button
    const micBtn = document.getElementById('btn-voice-mic');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        this.voiceChatBoard.toggleVoiceInput();
      });
    }

    // Doubt suggestion chips
    document.querySelectorAll('#chat-doubt-chips .quick-suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const doubt = chip.getAttribute('data-doubt');
        this.voiceChatBoard.sendDoubt(doubt);
      });
    });

    // Form submit
    const form = document.getElementById('chat-voice-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        if (input && input.value.trim()) {
          const val = input.value.trim();
          input.value = '';
          this.voiceChatBoard.sendDoubt(val);
        }
      });
    }
  }

  // Toast feedback
  showToast(message) {
    const bar = document.getElementById('toast-bar');
    const txt = document.getElementById('toast-message-text');
    if (!bar || !txt) return;

    txt.textContent = message;
    bar.classList.add('visible');
    setTimeout(() => {
      bar.classList.remove('visible');
    }, 3500);
  }

  // --- 7. MAIN RENDER ROUTE ---
  render() {
    const state = store.getState();
    const lang = state.language || state.event?.language || store.state.language || 'en';

    // Sync Header and Drawer language indicators
    const langNames = { en: 'English', hi: 'हिन्दी', te: 'తెలుగు', kn: 'ಕನ್ನಡ', ta: 'தமிழ்' };
    const label = document.getElementById('header-lang-label');
    if (label) label.textContent = langNames[lang] || 'English';
    const drawerSelect = document.getElementById('drawer-lang-dropdown-select');
    if (drawerSelect) drawerSelect.value = lang;
    document.querySelectorAll('.lang-item').forEach(item => {
      item.classList.toggle('active', item.dataset.lang === lang);
    });

    // Localize static text
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = getTranslation(lang, key);
    });

    // If zero active plan exists, render ChatGPT-style clean welcome screen
    if (!state.hasActivePlan || !state.event) {
      this.renderWelcomeScreen(lang);
      return;
    }

    // Active plan views
    switch (this.currentTab) {
      case 'budget':
        this.renderBudgetView(state, lang);
        break;
      case 'timeline':
        this.renderTimelineView(state, lang);
        break;
      case 'vendors':
        this.renderVendorsView(state, lang);
        break;
      case 'ideas':
        this.renderIdeasView(state, lang);
        break;
      case 'settings':
        this.renderSettingsPageView(state, lang);
        break;
      case 'dashboard':
      default:
        this.renderDashboardView(state, lang);
        break;
    }
  }

  // =========================================================================
  // ZERO-DEFAULT CHATGPT-STYLE ONBOARDING / LANDING SCREEN
  // =========================================================================
  renderWelcomeScreen(lang) {
    this.viewContainer.innerHTML = `
      <section class="welcome-container" aria-label="Welcome and Start Planning">
        <span class="welcome-badge">
          ${getIcon('sparkles')} ${APP_CONFIG.NAME}
        </span>
        <h1 class="welcome-heading">${getTranslation(lang, 'welcomeTitle')}</h1>
        <p class="welcome-subheading">Choose our simple guided setup or describe your event with voice/text.</p>

        <!-- Mode Switcher Tabs: Guided Form vs AI Prompt -->
        <div class="welcome-tabs-bar" role="tablist">
          <button type="button" class="btn btn-sm btn-primary" id="btn-mode-guided" style="border-radius:var(--radius-full); padding:6px 18px; font-size:12px;">
            📋 Step-by-Step Guided Setup
          </button>
          <button type="button" class="btn btn-sm btn-ghost" id="btn-mode-ai" style="border-radius:var(--radius-full); padding:6px 18px; font-size:12px;">
            ✨ AI Prompt & Voice Mic
          </button>
        </div>

        <!-- 1. Guided Setup Form (Default for all users) -->
        <div class="guided-builder-card" id="panel-guided-setup">
          <!-- Step 1: Celebration Type -->
          <span class="guided-step-label">1. Choose Celebration Type</span>
          <div class="guided-type-grid" id="guided-type-selector">
            <button type="button" class="guided-type-btn active" data-type="birthday">
              <span class="emoji">🎂</span>
              <span>Birthday</span>
            </button>
            <button type="button" class="guided-type-btn" data-type="wedding">
              <span class="emoji">💍</span>
              <span>Wedding</span>
            </button>
            <button type="button" class="guided-type-btn" data-type="housewarming">
              <span class="emoji">🪔</span>
              <span>Griha Pravesh</span>
            </button>
            <button type="button" class="guided-type-btn" data-type="community">
              <span class="emoji">🎉</span>
              <span>Community Utsav</span>
            </button>
          </div>

          <!-- Step 2: City / Location -->
          <div style="margin-bottom:16px;">
            <label for="guided-field-city" class="guided-step-label">2. City / Location</label>
            <input type="text" id="guided-field-city" class="form-control" value="Hyderabad" list="indian-cities-list" placeholder="e.g. Hyderabad, Bengaluru, Jaipur..." style="font-size:var(--font-size-sm); padding:10px 12px; width:100%; border-radius:var(--radius-md);" />
            <datalist id="indian-cities-list">
              <option value="Hyderabad"></option>
              <option value="Bengaluru"></option>
              <option value="Mumbai"></option>
              <option value="Delhi"></option>
              <option value="Jaipur"></option>
              <option value="Pune"></option>
              <option value="Chennai"></option>
              <option value="Kolkata"></option>
            </datalist>
          </div>

          <!-- Step 3: Guests & Budget Grid -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:16px;">
            <div>
              <label for="guided-field-guests" class="guided-step-label">3. Number of Guests</label>
              <input type="number" id="guided-field-guests" class="form-control" value="25" min="1" max="5000" style="font-size:var(--font-size-sm); padding:10px 12px; width:100%; border-radius:var(--radius-md);" />
              <div class="guided-quick-pills" id="pills-guests">
                <span class="guided-pill" data-val="4">4 (PG Room)</span>
                <span class="guided-pill active" data-val="25">25</span>
                <span class="guided-pill" data-val="50">50</span>
                <span class="guided-pill" data-val="150">150</span>
                <span class="guided-pill" data-val="300">300</span>
              </div>
            </div>

            <div>
              <label for="guided-field-budget" class="guided-step-label">4. Total Budget (₹)</label>
              <input type="number" id="guided-field-budget" class="form-control" value="15000" min="100" step="50" style="font-size:var(--font-size-sm); padding:10px 12px; width:100%; border-radius:var(--radius-md);" />
              <div class="guided-quick-pills" id="pills-budget">
                <span class="guided-pill" data-val="1000">₹1,000 (PG)</span>
                <span class="guided-pill active" data-val="15000">₹15,000</span>
                <span class="guided-pill" data-val="50000">₹50,000</span>
                <span class="guided-pill" data-val="500000">₹5 Lakh</span>
                <span class="guided-pill" data-val="1500000">₹15 Lakh</span>
              </div>
            </div>
          </div>

          <!-- Step 4: Venue Requirement -->
          <div style="margin-bottom:20px;">
            <span class="guided-step-label">5. Venue Requirement</span>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button type="button" class="btn btn-primary btn-sm" id="guided-venue-no" style="flex:1; border-radius:var(--radius-md); padding:10px; font-weight:600;">
                🏠 No Venue (Home/PG/Own Space)
              </button>
              <button type="button" class="btn btn-outline btn-sm" id="guided-venue-yes" style="flex:1; border-radius:var(--radius-md); padding:10px; font-weight:600;">
                🏢 Rent a Venue (Hall/Mandapam)
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="button" class="btn btn-primary" id="btn-create-guided-plan" style="width:100%; padding:14px; font-size:var(--font-size-sm); font-weight:700; border-radius:var(--radius-md); justify-content:center;">
            🎉 Create Celebration Plan ➔
          </button>
        </div>

        <!-- 2. AI Prompt & Voice Panel (For free-text lovers) -->
        <div id="panel-ai-prompt" style="display:none; width:100%; max-width:640px;">
          <!-- ChatGPT Style Natural Language Prompt Bar -->
          <form class="prompt-bar-card" id="welcome-prompt-form" style="margin-bottom:24px;">
            <input type="text" id="welcome-prompt-input" class="prompt-input-field" placeholder="${getTranslation(lang, 'promptPlaceholder')}" autocomplete="off" />
            <button type="button" class="icon-btn" id="btn-welcome-mic" aria-label="Speak your event" title="Voice Input">
              ${getIcon('mic')}
            </button>
            <button type="submit" class="btn btn-primary btn-sm" style="border-radius:var(--radius-full);">
              ${getTranslation(lang, 'btnCreatePlan')} ${getIcon('arrow_right')}
            </button>
          </form>

          <!-- Inspiration Starter Cards -->
          <div class="inspiration-section">
            <span class="inspiration-label">Or Tap an Inspiration Starter:</span>
            <div class="inspiration-grid">
              ${APP_CONFIG.INSPIRATION_CHIPS.map(chip => `
                <div class="inspiration-chip-card" data-prompt="${chip.prompt}">
                  <div class="chip-title">
                    <span>${chip.icon}</span>
                    <span>${chip.title}</span>
                  </div>
                  <div class="chip-desc">${chip.prompt}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>
    `;

    // Guided vs AI Tab Toggles
    const btnGuided = this.viewContainer.querySelector('#btn-mode-guided');
    const btnAI = this.viewContainer.querySelector('#btn-mode-ai');
    const panelGuided = this.viewContainer.querySelector('#panel-guided-setup');
    const panelAI = this.viewContainer.querySelector('#panel-ai-prompt');

    btnGuided?.addEventListener('click', () => {
      btnGuided.className = 'btn btn-sm btn-primary';
      btnAI.className = 'btn btn-sm btn-ghost';
      panelGuided.style.display = 'block';
      panelAI.style.display = 'none';
    });

    btnAI?.addEventListener('click', () => {
      btnAI.className = 'btn btn-sm btn-primary';
      btnGuided.className = 'btn btn-sm btn-ghost';
      panelAI.style.display = 'block';
      panelGuided.style.display = 'none';
      const aiInput = this.viewContainer.querySelector('#welcome-prompt-input');
      if (aiInput) aiInput.focus();
    });

    // Guided Form State Variables
    let selectedType = 'birthday';
    let needsVenue = false;

    // Type Selector Buttons
    this.viewContainer.querySelectorAll('.guided-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.viewContainer.querySelectorAll('.guided-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedType = btn.dataset.type;

        // Auto-adjust default guests & budget for selected type
        const guestsInput = this.viewContainer.querySelector('#guided-field-guests');
        const budgetInput = this.viewContainer.querySelector('#guided-field-budget');
        const venueNoBtn = this.viewContainer.querySelector('#guided-venue-no');
        const venueYesBtn = this.viewContainer.querySelector('#guided-venue-yes');

        if (selectedType === 'wedding') {
          if (guestsInput) guestsInput.value = 200;
          if (budgetInput) budgetInput.value = 1000000;
          needsVenue = true;
          venueYesBtn?.classList.replace('btn-outline', 'btn-primary');
          venueNoBtn?.classList.replace('btn-primary', 'btn-outline');
        } else if (selectedType === 'birthday') {
          if (guestsInput) guestsInput.value = 25;
          if (budgetInput) budgetInput.value = 15000;
          needsVenue = false;
          venueNoBtn?.classList.replace('btn-outline', 'btn-primary');
          venueYesBtn?.classList.replace('btn-primary', 'btn-outline');
        } else if (selectedType === 'housewarming') {
          if (guestsInput) guestsInput.value = 50;
          if (budgetInput) budgetInput.value = 40000;
          needsVenue = false;
          venueNoBtn?.classList.replace('btn-outline', 'btn-primary');
          venueYesBtn?.classList.replace('btn-primary', 'btn-outline');
        } else if (selectedType === 'community') {
          if (guestsInput) guestsInput.value = 100;
          if (budgetInput) budgetInput.value = 60000;
          needsVenue = false;
          venueNoBtn?.classList.replace('btn-outline', 'btn-primary');
          venueYesBtn?.classList.replace('btn-primary', 'btn-outline');
        }
      });
    });

    // Venue Toggle Buttons in Guided Form
    const venueNoBtn = this.viewContainer.querySelector('#guided-venue-no');
    const venueYesBtn = this.viewContainer.querySelector('#guided-venue-yes');

    venueNoBtn?.addEventListener('click', () => {
      needsVenue = false;
      venueNoBtn.classList.replace('btn-outline', 'btn-primary');
      venueYesBtn.classList.replace('btn-primary', 'btn-outline');
    });

    venueYesBtn?.addEventListener('click', () => {
      needsVenue = true;
      venueYesBtn.classList.replace('btn-outline', 'btn-primary');
      venueNoBtn.classList.replace('btn-primary', 'btn-outline');
    });

    // Quick Pills for Guests
    this.viewContainer.querySelectorAll('#pills-guests .guided-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.viewContainer.querySelectorAll('#pills-guests .guided-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const input = this.viewContainer.querySelector('#guided-field-guests');
        if (input) input.value = pill.dataset.val;
      });
    });

    // Quick Pills for Budget
    this.viewContainer.querySelectorAll('#pills-budget .guided-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.viewContainer.querySelectorAll('#pills-budget .guided-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const input = this.viewContainer.querySelector('#guided-field-budget');
        if (input) input.value = pill.dataset.val;
      });
    });

    // Submit Guided Form Button
    const btnCreateGuided = this.viewContainer.querySelector('#btn-create-guided-plan');
    btnCreateGuided?.addEventListener('click', () => {
      const city = this.viewContainer.querySelector('#guided-field-city')?.value?.trim() || 'Hyderabad';
      const guestCount = parseInt(this.viewContainer.querySelector('#guided-field-guests')?.value || '25', 10);
      const totalBudget = parseInt(this.viewContainer.querySelector('#guided-field-budget')?.value || '15000', 10);

      this.createGuidedPlan({
        type: selectedType,
        city,
        guestCount,
        totalBudget,
        needsVenue
      });
    });

    // Prompt Form Submit & Create Plan Button
    const form = this.viewContainer.querySelector('#welcome-prompt-form');
    const input = this.viewContainer.querySelector('#welcome-prompt-input');
    const submitBtn = this.viewContainer.querySelector('#welcome-prompt-form button[type="submit"]');

    const handleCreate = (e) => {
      if (e) e.preventDefault();
      const val = input ? input.value.trim() : '';
      if (!val) {
        this.showToast('Please type your celebration idea or tap an inspiration card below!');
        if (input) {
          input.focus();
          input.style.borderColor = 'var(--color-primary)';
          input.style.boxShadow = '0 0 0 3px var(--color-primary-subtle)';
        }
        return;
      }
      this.parseAndCreatePlan(val);
    };

    form?.addEventListener('submit', handleCreate);
    submitBtn?.addEventListener('click', handleCreate);

    // Inspiration chip click
    this.viewContainer.querySelectorAll('.inspiration-chip-card').forEach(card => {
      card.addEventListener('click', () => {
        const promptText = card.getAttribute('data-prompt');
        this.parseAndCreatePlan(promptText);
      });
    });

    // Voice mic on welcome screen
    const micBtn = this.viewContainer.querySelector('#btn-welcome-mic');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          alert('Speech recognition is not supported in this browser. Please type your idea.');
          return;
        }
        const rec = new SpeechRecognition();
        rec.lang = 'en-IN';
        micBtn.classList.add('pulse-recording');
        rec.onresult = (ev) => {
          const spoken = ev.results[0][0].transcript;
          input.value = spoken;
          micBtn.classList.remove('pulse-recording');
          this.parseAndCreatePlan(spoken);
        };
        rec.onerror = () => micBtn.classList.remove('pulse-recording');
        rec.onend = () => micBtn.classList.remove('pulse-recording');
        rec.start();
      });
    }
  }

  /**
   * Directly creates celebration plan from guided visual form
   */
  createGuidedPlan({ type, title, city, guestCount, totalBudget, needsVenue }) {
    const isMicro = totalBudget <= 5000 && guestCount <= 10;
    const categories = getCategoriesForEvent(type, isMicro, needsVenue);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + (type === 'wedding' ? 75 : (isMicro ? 14 : 30)));
    const targetDateStr = futureDate.toISOString().split('T')[0];

    const typeTitles = {
      wedding: `${city} Grand Vivaham & Wedding`,
      birthday: isMicro ? `${city} Intimate PG Birthday` : `${city} Milestone Birthday Celebration`,
      housewarming: `${city} Auspicious Griha Pravesh`,
      community: `${city} Festival & Community Utsav`
    };

    const newPlan = {
      event: {
        id: 'evt_' + Date.now(),
        type,
        title: title || typeTitles[type] || `${city} Celebration`,
        date: targetDateStr,
        city,
        guestCount,
        currency: 'INR',
        language: store.state.language || 'en',
        dietary: isMicro ? ['Favorite Snacks', 'Biryani / Pizza'] : ['Traditional Feast', 'Pure Vegetarian'],
        style: isMicro ? ['Cozy PG Room Vibes', 'Warm Fairy Lights'] : ['Traditional & Elegant', 'Warm Lighting'],
        totalBudget,
        isMicro,
        needsVenue,
        createdAt: new Date().toISOString()
      },
      budgetItems: computeBudgetSplit(totalBudget, categories),
      tasks: computeTimelineTasks(targetDateStr, type, isMicro, needsVenue),
      vendors: [],
      ideas: getIdeasForEventType(type, isMicro)
    };

    store.addEvent(newPlan);
    this.showToast(`Celebration plan "${newPlan.event.title}" created for ${city}!`);
    this.currentTab = 'dashboard';
    window.location.hash = '#dashboard';
    this.render();
  }

  /**
   * Intelligently parses user prompt into a complete structured celebration plan
   * Supports all scale of celebrations: from ₹1,000 PG hostel room celebrations to ₹25 Lakh grand weddings!
   */
  parseAndCreatePlan(text) {
    const lower = text.toLowerCase();

    // 1. Detect Celebration Type & PG / Hostel micro context
    let type = 'wedding';
    let title = 'Grand Family Celebration';
    const isPGOrRoom = lower.includes('pg') || lower.includes('hostel') || lower.includes('room') || lower.includes('flat') || lower.includes('apartment');

    if (lower.includes('birthday') || lower.includes('bday') || lower.includes('kid') || isPGOrRoom) {
      type = 'birthday';
      if (lower.includes('cousin')) {
        title = isPGOrRoom ? "Cousin's PG Room Birthday" : "Cousin's Birthday Celebration";
      } else if (isPGOrRoom) {
        title = "Intimate PG Birthday Celebration";
      } else {
        title = "Milestone Birthday Celebration";
      }
    } else if (lower.includes('housewarming') || lower.includes('griha') || lower.includes('pravesh') || lower.includes('home')) {
      type = 'housewarming';
      title = "Auspicious Griha Pravesh Housewarming";
    } else if (lower.includes('ganesh') || lower.includes('diwali') || lower.includes('puja') || lower.includes('festival') || lower.includes('community') || lower.includes('society')) {
      type = 'community';
      title = "Community Festival & Utsav";
    } else {
      type = 'wedding';
      title = "Grand Vivaham & Wedding Celebration";
    }

    // 2. Extract City
    let city = isPGOrRoom ? 'Bengaluru' : 'India';
    const cityMatches = ['jaipur', 'hyderabad', 'bengaluru', 'bangalore', 'mumbai', 'delhi', 'pune', 'chennai', 'kolkata', 'udaipur', 'ahmedabad', 'lucknow', 'goa'];
    for (const c of cityMatches) {
      if (lower.includes(c)) {
        city = c.charAt(0).toUpperCase() + c.slice(1);
        if (city === 'Bangalore') city = 'Bengaluru';
        break;
      }
    }

    // 3. Extract Guest Count (Support intimate PG gatherings like 4 friends)
    let guestCount = isPGOrRoom ? 4 : 150;
    const guestMatch = lower.match(/(\d+)\s*(guests|people|relatives|kids|residents|members|friends|flatmates|roommates)?/);
    if (guestMatch) {
      const g = parseInt(guestMatch[1], 10);
      if (g > 0 && g <= 5000) guestCount = g;
    } else if (type === 'birthday') {
      guestCount = isPGOrRoom ? 4 : 40;
    } else if (type === 'wedding') {
      guestCount = 250;
    }

    // 4. Extract Budget (Supports ₹100 to ₹10 Crore, including 1k, ₹1000, 1000 rs)
    let totalBudget = isPGOrRoom ? 1000 : 500000;
    const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|l)\b/);
    const kMatch = lower.match(/(\d+(?:\.\d+)?)\s*k\b/);
    const rupeeMatch = lower.match(/(?:budget|rs\.?|inr|₹)\s*(\d[\d,]*)/);
    const reverseRupeeMatch = lower.match(/(\d[\d,]*)\s*(?:rs|inr|rupees|bucks)/);

    if (lakhMatch) {
      totalBudget = Math.round(parseFloat(lakhMatch[1]) * 100000);
    } else if (kMatch) {
      totalBudget = Math.round(parseFloat(kMatch[1]) * 1000);
    } else if (rupeeMatch) {
      const cleanNum = parseInt(rupeeMatch[1].replace(/,/g, ''), 10);
      if (cleanNum >= 100) totalBudget = cleanNum;
    } else if (reverseRupeeMatch) {
      const cleanNum = parseInt(reverseRupeeMatch[1].replace(/,/g, ''), 10);
      if (cleanNum >= 100) totalBudget = cleanNum;
    } else {
      if (isPGOrRoom) totalBudget = 1000;
      else if (type === 'birthday') totalBudget = 35000;
      else if (type === 'wedding') totalBudget = 1200000;
      else if (type === 'community') totalBudget = 80000;
      else if (type === 'housewarming') totalBudget = 150000;
    }

    const isMicro = isPGOrRoom || (totalBudget <= 5000 && guestCount <= 10);

    // 5. Detect Venue Requirement (No venue needed for PG, Hostel, Home, Flat, or small gatherings)
    let needsVenue = true;
    if (isPGOrRoom || isMicro || lower.includes('home') || lower.includes('flat') || lower.includes('no venue') || lower.includes('own space') || lower.includes('terrace') || lower.includes('hostel')) {
      needsVenue = false;
    } else if (lower.includes('hall') || lower.includes('banquet') || lower.includes('resort') || lower.includes('lawn') || lower.includes('mandapam')) {
      needsVenue = true;
    }

    // 6. Target Date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + (type === 'wedding' ? 75 : (isMicro ? 14 : 30)));
    const targetDateStr = futureDate.toISOString().split('T')[0];

    // 7. Realistic Category Percentages (Takes venue need into account)
    const categories = getCategoriesForEvent(type, isMicro, needsVenue);

    const newPlan = {
      event: {
        id: 'evt_' + Date.now(),
        type,
        title,
        date: targetDateStr,
        city,
        guestCount,
        currency: 'INR',
        language: store.state.language || 'en',
        dietary: isMicro ? ['Favorite Snacks', 'Biryani / Pizza'] : ['Traditional Feast', 'Pure Vegetarian'],
        style: isMicro ? ['Cozy PG Room Vibes', 'Warm Fairy Lights'] : ['Traditional & Elegant', 'Warm Lighting'],
        totalBudget,
        isMicro,
        needsVenue,
        createdAt: new Date().toISOString()
      },
      budgetItems: computeBudgetSplit(totalBudget, categories),
      tasks: computeTimelineTasks(targetDateStr, type, isMicro, needsVenue),
      vendors: [],
      ideas: getIdeasForEventType(type, isMicro)
    };

    // Save as additional celebration without overwriting previous ones!
    store.addEvent(newPlan);
    this.showToast(`Celebration plan "${title}" created for ${city}!`);
    this.currentTab = 'dashboard';
    window.location.hash = '#dashboard';
    this.render();
  }

  // =========================================================================
  // VIEW 1: ACTIVE DASHBOARD VIEW
  // =========================================================================
  renderDashboardView(state, lang) {
    const { event, budgetItems, tasks, vendors, ideas } = state;
    const stats = calculateBudgetStats(event.totalBudget, budgetItems, event.guestCount);
    const events = store.state.events || [];
    const activeId = store.state.activeEventId;

    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let countdownLabel = getTranslation(lang, 'daysToGo');
    let countdownVal = diffDays;
    if (diffDays < 0) {
      countdownLabel = getTranslation(lang, 'eventPassed');
      countdownVal = '✓';
    } else if (diffDays === 0) {
      countdownLabel = getTranslation(lang, 'today');
      countdownVal = '🎉';
    }

    const tasksDone = tasks.filter(t => t.status === 'done').length;
    const tasksPct = tasks.length > 0 ? Math.round((tasksDone / tasks.length) * 100) : 0;

    this.viewContainer.innerHTML = `
      <section aria-label="Celebration Summary">
        <!-- Multi-Event Switcher Strip -->
        <div class="event-switcher-strip">
          <div class="event-switcher-left">
            <span style="color:var(--color-primary);">${getIcon('switch_event')}</span>
            <span style="font-size:var(--font-size-xs); font-weight:700; color:var(--color-text-muted);">EVENT:</span>
            <select class="event-switcher-select" id="dashboard-event-switcher" aria-label="Switch celebration">
              ${events.map(evt => `
                <option value="${evt.id}" ${evt.id === activeId ? 'selected' : ''}>
                  ${evt.event.title} (${evt.event.city} • ${formatCurrency(evt.event.totalBudget, evt.event.currency)})
                </option>
              `).join('')}
            </select>
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="btn-dashboard-plan-another" style="gap:6px;">
            ${getIcon('add')} + Plan Another Event
          </button>
        </div>

        <!-- Hero Summary Banner -->
        <div class="plan-hero-banner">
          <div>
            <div style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; background:var(--color-primary-light); color:var(--color-primary); border-radius:var(--radius-full); font-size:var(--font-size-xs); font-weight:700; text-transform:uppercase; margin-bottom:8px;">
              ${event.type.toUpperCase()} • ${event.city} • ${event.needsVenue === false ? '🏠 Own Space (PG/Home)' : '🏢 Rented Venue'}
            </div>
            <h1 style="font-size:clamp(1.4rem, 3vw, 1.85rem); margin-bottom:6px;">${event.title}</h1>
            <p style="font-size:var(--font-size-sm); color:var(--color-text-secondary);">
              📅 ${new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} • 👥 ${event.guestCount} Guests
            </p>

            <div style="display:flex; flex-wrap:wrap; gap:16px; margin-top:16px;">
              <div>
                <span style="font-size:var(--font-size-xs); color:var(--color-text-muted); display:block;">${getTranslation(lang, 'totalBudget')}</span>
                <strong style="font-size:1.1rem; color:var(--color-primary);">${formatCurrency(stats.totalBudget, event.currency)}</strong>
              </div>
              <div>
                <span style="font-size:var(--font-size-xs); color:var(--color-text-muted); display:block;">${getTranslation(lang, 'spent')}</span>
                <strong style="font-size:1.1rem;">${formatCurrency(stats.totalActual, event.currency)}</strong>
              </div>
              <div>
                <span style="font-size:var(--font-size-xs); color:var(--color-text-muted); display:block;">${getTranslation(lang, 'perGuestCost')}</span>
                <strong style="font-size:1.1rem;">${formatCurrency(stats.costPerGuest, event.currency)}</strong>
              </div>
            </div>
          </div>

          <div class="hero-countdown-box">
            <div class="countdown-digits">${countdownVal}</div>
            <div class="countdown-sub">${countdownLabel}</div>
          </div>
        </div>

        ${stats.isOverBudget ? `
          <div class="card" style="background-color:var(--color-error-bg); border-color:var(--color-error); color:var(--color-error); margin-bottom:20px; display:flex; align-items:center; gap:12px;">
            ${getIcon('warning')}
            <div>
              <strong>${getTranslation(lang, 'overBudget')} ${formatCurrency(stats.overBudgetAmount, event.currency)}</strong>
              <div style="font-size:var(--font-size-xs);">Review category spends in the Budget section.</div>
            </div>
          </div>
        ` : ''}

        <!-- 4 Pillars Quick Grid -->
        <div class="pillars-summary-grid">
          <!-- Budget -->
          <div class="card pillar-card">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:var(--color-primary);">${getIcon('budget')}</span>
                <span style="font-size:var(--font-size-xs); font-weight:700;">${stats.spentPercent}% Spent</span>
              </div>
              <h2 style="font-size:var(--font-size-base); margin-top:8px;">${getTranslation(lang, 'navBudget')}</h2>
              <div class="progress-bar-track">
                <div class="progress-bar-fill ${stats.isOverBudget ? 'over-limit' : ''}" style="width:${Math.min(100, stats.spentPercent)}%;"></div>
              </div>
              <p style="font-size:var(--font-size-xs); color:var(--color-text-muted); margin-bottom:12px;">
                Remaining: ${formatCurrency(stats.remaining, event.currency)}
              </p>
            </div>
            <a href="#budget" class="btn btn-subtle btn-sm" style="width:100%;">View Budget Split ${getIcon('chevron_right')}</a>
          </div>

          <!-- Timeline -->
          <div class="card pillar-card">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:var(--color-secondary);">${getIcon('timeline')}</span>
                <span style="font-size:var(--font-size-xs); font-weight:700;">${tasksPct}% Done</span>
              </div>
              <h2 style="font-size:var(--font-size-base); margin-top:8px;">${getTranslation(lang, 'navTimeline')}</h2>
              <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width:${tasksPct}%; background-color:var(--color-secondary);"></div>
              </div>
              <p style="font-size:var(--font-size-xs); color:var(--color-text-muted); margin-bottom:12px;">
                ${tasksDone} of ${tasks.length} tasks completed
              </p>
            </div>
            <a href="#timeline" class="btn btn-subtle btn-sm" style="width:100%;">Check Timeline ${getIcon('chevron_right')}</a>
          </div>

          <!-- Vendors -->
          <div class="card pillar-card">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:var(--color-gold);">${getIcon('vendors')}</span>
                <span style="font-size:var(--font-size-xs); font-weight:700;">${vendors.length} Shortlisted</span>
              </div>
              <h2 style="font-size:var(--font-size-base); margin-top:8px;">${getTranslation(lang, 'navVendors')}</h2>
              <p style="font-size:var(--font-size-xs); color:var(--color-text-muted); margin:10px 0;">
                Questions, red flags & direct Google Maps discovery in ${event.city}.
              </p>
            </div>
            <a href="#vendors" class="btn btn-subtle btn-sm" style="width:100%;">Vendor Guides ${getIcon('chevron_right')}</a>
          </div>

          <!-- Ideas -->
          <div class="card pillar-card">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:var(--chart-4);">${getIcon('ideas')}</span>
                <span style="font-size:var(--font-size-xs); font-weight:700;">${ideas.length} Curated</span>
              </div>
              <h2 style="font-size:var(--font-size-base); margin-top:8px;">${getTranslation(lang, 'navIdeas')}</h2>
              <p style="font-size:var(--font-size-xs); color:var(--color-text-muted); margin:10px 0;">
                Curated themes, feast menus, and return favors for ${event.type}.
              </p>
            </div>
            <a href="#ideas" class="btn btn-subtle btn-sm" style="width:100%;">Explore Ideas ${getIcon('chevron_right')}</a>
          </div>
        </div>

        <!-- Export & Share Actions Card -->
        <div class="card" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;">
          <div>
            <h3 style="font-size:var(--font-size-base);">Export & Calendar Integration</h3>
            <p style="font-size:var(--font-size-xs); color:var(--color-text-muted);">Sync with your phone calendar or share details with guests.</p>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            <button class="btn btn-outline btn-sm" id="btn-export-ics">
              ${getIcon('calendar_download')} ${getTranslation(lang, 'exportICS')}
            </button>
            <button class="btn btn-outline btn-sm" id="btn-export-pdf">
              ${getIcon('pdf')} ${getTranslation(lang, 'exportPDF')}
            </button>
            <button class="btn btn-primary btn-sm" id="btn-share-guest">
              ${getIcon('share')} ${getTranslation(lang, 'sharePlan')}
            </button>
          </div>
        </div>
      </section>
    `;

    this.viewContainer.querySelector('#btn-export-ics')?.addEventListener('click', () => exportCalendar(state));
    this.viewContainer.querySelector('#btn-export-pdf')?.addEventListener('click', () => printPDFReport());
    this.viewContainer.querySelector('#btn-share-guest')?.addEventListener('click', () => {
      const summary = generateGuestSummary(state);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(summary);
        this.showToast('Guest invitation summary copied to clipboard!');
      } else {
        alert(summary);
      }
    });

    // Multi-event switcher listeners
    const switcher = this.viewContainer.querySelector('#dashboard-event-switcher');
    switcher?.addEventListener('change', (e) => {
      store.switchEvent(e.target.value);
      this.showToast('Switched celebration!');
    });
    this.viewContainer.querySelector('#btn-dashboard-plan-another')?.addEventListener('click', () => {
      const modal = document.getElementById('add-event-modal-overlay');
      modal?.classList.add('open');
      modal?.setAttribute('aria-hidden', 'false');
    });
  }

  // =========================================================================
  // VIEW 2: BUDGET PLANNER VIEW (Deterministic Math & Donut)
  // =========================================================================
  renderBudgetView(state, lang) {
    const { event, budgetItems } = state;
    const stats = calculateBudgetStats(event.totalBudget, budgetItems, event.guestCount);
    const chartPalette = ['#3730A3', '#BE123C', '#B45309', '#047857', '#6D28D9', '#0369A1', '#4D7C0F', '#9D174D'];

    const effectiveNeedsVenue = event.needsVenue !== undefined 
      ? event.needsVenue 
      : (event.totalBudget > 5000 && event.guestCount > 10 && !event.isMicro);

    const hasVenueCategory = budgetItems.some(i => i.category.toLowerCase().includes('venue') || i.category.toLowerCase().includes('hall rental'));

    // Auto-fix stale items if celebration is in own space/PG but still has venue rental
    if (!effectiveNeedsVenue && hasVenueCategory) {
      const isMicro = event.totalBudget <= 5000 || event.guestCount <= 10 || Boolean(event.isMicro);
      const categories = getCategoriesForEvent(event.type, isMicro, false);
      const rebalanced = computeBudgetSplit(event.totalBudget, categories);
      store.updateActivePlan(prev => ({
        ...prev,
        event: { ...prev.event, needsVenue: false },
        budgetItems: rebalanced
      }));
      return;
    }

    let cumulative = 0;
    const slices = budgetItems.map((item, idx) => {
      const pct = item.plannedPercent || 0;
      const start = cumulative;
      cumulative += pct;
      const color = chartPalette[idx % chartPalette.length];
      return { ...item, pct, start, color };
    });

    this.viewContainer.innerHTML = `
      <section aria-labelledby="budget-view-title">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
          <div>
            <h1 id="budget-view-title" style="font-size:clamp(1.4rem, 3vw, 1.85rem);">${getTranslation(lang, 'navBudget')} Planner</h1>
            <p style="font-size:var(--font-size-xs); color:var(--color-text-muted);">
              Deterministic code allocation • 100% exact single-rupee calculations
            </p>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-recalculate-split">
            ${getIcon('refresh')} Rebalance Proportions
          </button>
        </div>

        <!-- Interactive Venue Switcher Strip on Budget Page -->
        <div class="card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px; border-left:4px solid var(--color-primary); background-color:var(--color-surface);">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:24px;">${effectiveNeedsVenue ? '🏢' : '🏠'}</span>
            <div>
              <strong style="font-size:var(--font-size-sm); display:block;">
                ${effectiveNeedsVenue ? 'Rented Venue / Hall Mode' : 'Own Space (PG Room, Hostel, or Home) Mode'}
              </strong>
              <span style="font-size:var(--font-size-xs); color:var(--color-text-muted);">
                ${effectiveNeedsVenue ? 'Budget includes hall rental costs & security deposits' : '₹0 venue rent • 100% of budget allocated to Cake, Food & Decor'}
              </span>
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn ${!effectiveNeedsVenue ? 'btn-primary' : 'btn-outline'} btn-sm" id="btn-budget-venue-no">
              🏠 No Venue (PG/Home)
            </button>
            <button type="button" class="btn ${effectiveNeedsVenue ? 'btn-primary' : 'btn-outline'} btn-sm" id="btn-budget-venue-yes">
              🏢 Rent a Venue
            </button>
          </div>
        </div>

        <!-- Donut Chart & Category Breakdown -->
        <div class="card" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px; align-items:center; margin-bottom:24px;">
          <div style="text-align:center;">
            <svg viewBox="0 0 100 100" style="max-width:190px; max-height:190px; transform:rotate(-90deg);" role="img" aria-label="Budget Split Chart">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-surface-subtle)" stroke-width="20" />
              ${slices.map(s => {
                const dash = `${s.pct * 2.512} ${251.2 - s.pct * 2.512}`;
                const offset = -(s.start * 2.512);
                return `<circle cx="50" cy="50" r="40" fill="transparent" stroke="${s.color}" stroke-width="20" stroke-dasharray="${dash}" stroke-dashoffset="${offset}" />`;
              }).join('')}
            </svg>
            <p style="font-size:var(--font-size-xs); color:var(--color-text-muted); margin-top:8px;">
              Total Budget: <strong>${formatCurrency(stats.totalBudget, event.currency)}</strong>
            </p>
          </div>

          <div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${slices.map(s => `
                <div style="display:flex; align-items:center; justify-content:space-between; font-size:var(--font-size-xs);">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="display:inline-block; width:10px; height:10px; border-radius:2px; background-color:${s.color};"></span>
                    <span>${s.category}</span>
                  </div>
                  <strong>${s.plannedPercent}% (${formatCurrency(s.plannedAmount, event.currency)})</strong>
                </div>
              `).join('')}
            </div>

            <div style="background-color:var(--color-gold-light); color:var(--color-gold); padding:10px 14px; border-radius:var(--radius-md); font-size:var(--font-size-xs); margin-top:16px;">
              <strong>${getIcon('sparkles')} ${getTranslation(lang, 'contingencyReserve')}:</strong> ${getTranslation(lang, 'contingencyNotice')}
            </div>
          </div>
        </div>

        <!-- Category Actual Spend Table -->
        <div class="card">
          <h2 style="font-size:var(--font-size-base); margin-bottom:12px;">Category Spends & Variance Tracker</h2>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:var(--font-size-sm);" role="table">
              <thead>
                <tr style="border-bottom:2px solid var(--color-border); text-align:left;">
                  <th style="padding:8px 10px;">Category</th>
                  <th style="padding:8px 10px;">Planned (%)</th>
                  <th style="padding:8px 10px;">Planned (₹)</th>
                  <th style="padding:8px 10px;">Actual Spent</th>
                  <th style="padding:8px 10px;">Variance</th>
                </tr>
              </thead>
              <tbody>
                ${budgetItems.map(item => {
                  const variance = item.plannedAmount - item.actualAmount;
                  const isOver = item.actualAmount > item.plannedAmount;
                  return `
                    <tr style="border-bottom:1px solid var(--color-border-subtle);">
                      <td style="padding:10px;">
                        <div style="font-weight:600;">${item.category}</div>
                        <div style="font-size:var(--font-size-xs); color:var(--color-text-muted);">${item.reason || ''}</div>
                      </td>
                      <td style="padding:10px;">${item.plannedPercent}%</td>
                      <td style="padding:10px; font-weight:600;">${formatCurrency(item.plannedAmount, event.currency)}</td>
                      <td style="padding:10px;">
                        <input type="number" class="form-control actual-spend-input" data-id="${item.id}" value="${item.actualAmount || 0}" style="max-width:130px; min-height:34px; padding:4px 8px; font-size:var(--font-size-xs);" aria-label="Actual spend for ${item.category}" />
                      </td>
                      <td style="padding:10px; font-weight:700; color:${isOver ? 'var(--color-error)' : 'var(--color-success)'};">
                        ${isOver ? '▲ Over ' : '▼ Saved '} ${formatCurrency(Math.abs(variance), event.currency)}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;

    // Actual spend change listener
    this.viewContainer.querySelectorAll('.actual-spend-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
        store.setState(prev => {
          const updated = prev.budgetItems.map(it => it.id === id ? { ...it, actualAmount: val } : it);
          return { ...prev, budgetItems: updated };
        });
        this.showToast('Actual spend recorded.');
      });
    });

    // Interactive Venue Toggles on Budget Page
    this.viewContainer.querySelector('#btn-budget-venue-no')?.addEventListener('click', () => {
      const isMicro = event.totalBudget <= 5000 || event.guestCount <= 10 || Boolean(event.isMicro);
      const categories = getCategoriesForEvent(event.type, isMicro, false);
      const newBudgetItems = computeBudgetSplit(event.totalBudget, categories);
      const newTasks = computeTimelineTasks(event.date, event.type, isMicro, false);
      store.updateActivePlan(prev => ({
        ...prev,
        event: { ...prev.event, needsVenue: false },
        budgetItems: newBudgetItems,
        tasks: newTasks
      }));
      this.showToast('Rebalanced for Own Space (₹0 venue cost)!');
    });

    this.viewContainer.querySelector('#btn-budget-venue-yes')?.addEventListener('click', () => {
      const isMicro = event.totalBudget <= 5000 || event.guestCount <= 10 || Boolean(event.isMicro);
      const categories = getCategoriesForEvent(event.type, isMicro, true);
      const newBudgetItems = computeBudgetSplit(event.totalBudget, categories);
      const newTasks = computeTimelineTasks(event.date, event.type, isMicro, true);
      store.updateActivePlan(prev => ({
        ...prev,
        event: { ...prev.event, needsVenue: true },
        budgetItems: newBudgetItems,
        tasks: newTasks
      }));
      this.showToast('Rebalanced for Rented Venue / Hall!');
    });

    this.viewContainer.querySelector('#btn-recalculate-split')?.addEventListener('click', () => {
      const isMicro = event.totalBudget <= 5000 || event.guestCount <= 10 || Boolean(event.isMicro);
      const categories = getCategoriesForEvent(event.type, isMicro, effectiveNeedsVenue);
      const rebalanced = computeBudgetSplit(event.totalBudget, categories);
      store.updateActivePlan(prev => ({
        ...prev,
        budgetItems: rebalanced
      }));
      this.showToast('Budget split rebalanced.');
    });
  }

  // =========================================================================
  // VIEW 3: TIMELINE & DAY-OF RUN-OF-SHOW VIEW
  // =========================================================================
  renderTimelineView(state, lang) {
    const { event, tasks } = state;
    const runOfShow = getDayOfSchedule(event.type);

    this.viewContainer.innerHTML = `
      <section aria-labelledby="timeline-view-title">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
          <div>
            <h1 id="timeline-view-title" style="font-size:clamp(1.4rem, 3vw, 1.85rem);">${getTranslation(lang, 'navTimeline')}</h1>
            <p style="font-size:var(--font-size-xs); color:var(--color-text-muted);">
              Backward-planned checkpoints from celebration day: ${new Date(event.date).toLocaleDateString()}
            </p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-add-custom-task">
            ${getIcon('add')} ${getTranslation(lang, 'addTask')}
          </button>
        </div>

        <!-- Milestone Tasks Checklist -->
        <div class="card" style="margin-bottom:24px;">
          <h2 style="font-size:var(--font-size-base); margin-bottom:14px;">Preparation Milestones</h2>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${tasks.map(t => {
              const isDone = t.status === 'done';
              return `
                <div class="card" style="padding:12px 16px; display:flex; align-items:flex-start; gap:12px; border-left:4px solid ${t.priority === 'high' ? 'var(--color-secondary)' : 'var(--color-primary)'}; background-color:${isDone ? 'var(--color-surface-subtle)' : 'var(--color-surface)'};">
                  <input type="checkbox" class="task-toggle-cb" data-id="${t.id}" ${isDone ? 'checked' : ''} style="width:18px; height:18px; margin-top:2px; cursor:pointer;" aria-label="Mark task done: ${t.title}" />
                  <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                      <strong style="font-size:var(--font-size-sm); text-decoration:${isDone ? 'line-through' : 'none'}; color:${isDone ? 'var(--color-text-muted)' : 'var(--color-text-primary)'};">
                        ${t.title}
                      </strong>
                      <span style="font-size:11px; padding:2px 8px; border-radius:var(--radius-full); background:var(--color-surface-subtle); color:var(--color-text-muted);">
                        📅 Due: ${t.dueDate}
                      </span>
                    </div>
                    ${t.notes ? `<p style="font-size:var(--font-size-xs); color:${t.isRisk ? 'var(--color-error)' : 'var(--color-text-muted)'}; margin-top:4px;">${t.notes}</p>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Minute-by-Minute Run-of-Show -->
        <div class="card">
          <h2 style="font-size:var(--font-size-base); margin-bottom:6px;">Celebration Day Coordinator Run-of-Show</h2>
          <p style="font-size:var(--font-size-xs); color:var(--color-text-muted); margin-bottom:16px;">
            Hour-by-hour schedule for family elders, caterer, decorators, and stage emcee.
          </p>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${runOfShow.map(item => `
              <div style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-bottom:1px solid var(--color-border-subtle); font-size:var(--font-size-sm);">
                <span style="font-weight:700; color:var(--color-primary); min-width:80px; font-size:var(--font-size-xs);">${item.time}</span>
                <span style="flex:1;">${item.activity}</span>
                <span style="font-size:11px; color:var(--color-text-muted); background:var(--color-surface-subtle); padding:3px 8px; border-radius:var(--radius-sm);">${item.owner}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;

    // Task checkbox toggle
    this.viewContainer.querySelectorAll('.task-toggle-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const checked = e.target.checked;
        store.setState(prev => {
          const updated = prev.tasks.map(t => t.id === id ? { ...t, status: checked ? 'done' : 'todo' } : t);
          return { ...prev, tasks: updated };
        });
      });
    });

    this.viewContainer.querySelector('#btn-add-custom-task')?.addEventListener('click', () => {
      const title = prompt('Enter custom task title:');
      if (title && title.trim()) {
        store.setState(prev => ({
          ...prev,
          tasks: [
            ...prev.tasks,
            {
              id: 'tsk_custom_' + Date.now(),
              title: title.trim(),
              dueDate: prev.event.date,
              status: 'todo',
              priority: 'medium',
              category: 'Custom',
              notes: 'Added by user'
            }
          ]
        }));
        this.showToast('Task added to schedule.');
      }
    });
  }

  // =========================================================================
  // VIEW 4: VENDORS EVALUATION & SHORTLIST VIEW
  // =========================================================================
  renderVendorsView(state, lang) {
    const { event, vendors } = state;

    this.viewContainer.innerHTML = `
      <section aria-labelledby="vendors-view-title">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
          <div>
            <h1 id="vendors-view-title" style="font-size:clamp(1.4rem, 3vw, 1.85rem);">${getTranslation(lang, 'navVendors')} Evaluation</h1>
            <p style="font-size:var(--font-size-xs); color:var(--color-text-muted);">
              Cultural interview templates, advance norms & authentic search in ${event.city}
            </p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-add-vendor-quote">
            ${getIcon('add')} ${getTranslation(lang, 'addVendor')}
          </button>
        </div>

        <div style="background-color:var(--color-gold-light); color:var(--color-gold); padding:12px 16px; border-radius:var(--radius-md); font-size:var(--font-size-xs); margin-bottom:20px; display:flex; align-items:center; gap:10px;">
          ${getIcon('check')}
          <div>
            <strong>Authentic Planning Guarantee:</strong> ${getTranslation(lang, 'vendorNoteNoFake')}
          </div>
        </div>

        <!-- Shortlisted Quotes Tracker -->
        <div class="card" style="margin-bottom:24px;">
          <h2 style="font-size:var(--font-size-base); margin-bottom:12px;">Your Shortlisted Quotes (${vendors.length})</h2>
          ${vendors.length === 0 ? `
            <div style="text-align:center; padding:24px 0; color:var(--color-text-muted);">
              <span style="display:inline-block; margin-bottom:8px;">${getIcon('vendors', 'svg-icon-xl')}</span>
              <p style="font-size:var(--font-size-sm);">No vendor quotes added yet.</p>
              <p style="font-size:var(--font-size-xs);">Interview local vendors with our checklists below, then record their quote here.</p>
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${vendors.map(v => `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid var(--color-border-subtle); flex-wrap:wrap; gap:8px;">
                  <div>
                    <strong>${v.name}</strong> <span style="font-size:var(--font-size-xs); color:var(--color-text-muted);">(${v.category})</span>
                    <div style="font-size:11px; color:var(--color-text-muted);">📞 ${v.contact || 'No phone'} • Status: ${v.status}</div>
                  </div>
                  <strong style="color:var(--color-primary);">${formatCurrency(v.quote, event.currency)}</strong>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Category Guides & Interview Checklists -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
          ${Object.entries(VENDOR_GUIDANCE).map(([k, g]) => {
            const mapsUrl = getGoogleMapsSearchUrl(g.category, event.city);
            return `
              <div class="card">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="color:var(--color-primary);">${getIcon(g.iconKey)}</span>
                    <h3 style="font-size:var(--font-size-sm);">${g.category}</h3>
                  </div>
                  <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="padding:0 10px; font-size:11px;">
                    ${getIcon('maps')} Find in ${event.city}
                  </a>
                </div>

                <div style="margin-bottom:12px;">
                  <strong style="font-size:11px; text-transform:uppercase; color:var(--color-primary);">${getTranslation(lang, 'questionsToAsk')}:</strong>
                  <ul style="padding-left:16px; margin-top:4px; font-size:var(--font-size-xs); color:var(--color-text-primary);">
                    ${g.questions.map(q => `<li style="margin-bottom:4px;">${q}</li>`).join('')}
                  </ul>
                </div>

                <div style="margin-bottom:12px;">
                  <strong style="font-size:11px; text-transform:uppercase; color:var(--color-error);">${getTranslation(lang, 'contractRedFlags')}:</strong>
                  <ul style="padding-left:16px; margin-top:4px; font-size:var(--font-size-xs); color:var(--color-text-muted);">
                    ${g.redFlags.map(rf => `<li style="margin-bottom:2px;">${rf}</li>`).join('')}
                  </ul>
                </div>

                <div style="background-color:var(--color-surface-subtle); padding:8px 12px; border-radius:var(--radius-sm); font-size:11px;">
                  <strong>${getTranslation(lang, 'advancePaymentNorms')}:</strong> ${g.advanceNorms}
                </div>

                <div style="display:flex; gap:8px; margin-top:12px;">
                  <button class="btn btn-subtle btn-sm btn-copy-vendor-q" data-q="${encodeURIComponent(g.questions.join('\n• '))}" style="flex:1;">
                    ${getIcon('check')} ${getTranslation(lang, 'copyQuestions')}
                  </button>
                  <a href="https://api.whatsapp.com/send?text=${encodeURIComponent('Hi, inquiring for my celebration: ' + g.questions.join('\n- '))}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="padding:0 12px;" aria-label="Share on WhatsApp">
                    ${getIcon('whatsapp')}
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;

    // Copy questions listener
    this.viewContainer.querySelectorAll('.btn-copy-vendor-q').forEach(b => {
      b.addEventListener('click', () => {
        const q = decodeURIComponent(b.getAttribute('data-q'));
        if (navigator.clipboard) {
          navigator.clipboard.writeText(q);
          this.showToast('Questions copied to clipboard!');
        }
      });
    });

    // Add quote prompt
    this.viewContainer.querySelector('#btn-add-vendor-quote')?.addEventListener('click', () => {
      const name = prompt('Vendor / Business Name:');
      if (!name) return;
      const category = prompt('Category (Venue, Catering, Decor, Photography, Entertainment):') || 'General';
      const quote = parseInt(prompt('Quoted Price in INR (₹):') || '0', 10);
      const contact = prompt('Phone / Contact:') || '';

      store.setState(prev => ({
        ...prev,
        vendors: [
          ...(prev.vendors || []),
          {
            id: 'vnd_' + Date.now(),
            name,
            category,
            quote,
            contact,
            status: 'Shortlisted'
          }
        ]
      }));
      this.showToast('Vendor quote recorded.');
    });
  }

  // =========================================================================
  // VIEW 5: DYNAMIC IDEAS & MOOD BOARD VIEW (Fresh for Every Event)
  // =========================================================================
  renderIdeasView(state, lang) {
    const { ideas, event } = state;
    const filtered = filterIdeas(ideas, this.ideasFilter, false);

    this.viewContainer.innerHTML = `
      <section aria-labelledby="ideas-view-title">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
          <div>
            <h1 id="ideas-view-title" style="font-size:clamp(1.4rem, 3vw, 1.85rem);">${getTranslation(lang, 'navIdeas')}</h1>
            <p style="font-size:var(--font-size-xs); color:var(--color-text-muted);">
              Tailored concepts for ${event.type.toUpperCase()} in ${event.city} • Save favorites to Mood Board
            </p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-fresh-ideas">
            ${getIcon('sparkles')} ${getTranslation(lang, 'generateIdeas')}
          </button>
        </div>

        <!-- Filter Pills -->
        <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:8px; margin-bottom:16px; scrollbar-width:none;">
          <button class="quick-suggestion-chip ${this.ideasFilter === 'all' ? 'active-filter' : ''}" data-filter="all">All Ideas</button>
          <button class="quick-suggestion-chip ${this.ideasFilter === 'Themes & Decor' ? 'active-filter' : ''}" data-filter="Themes & Decor">Themes & Decor</button>
          <button class="quick-suggestion-chip ${this.ideasFilter === 'Culinary Experiences' ? 'active-filter' : ''}" data-filter="Culinary Experiences">Feasts & Food</button>
          <button class="quick-suggestion-chip ${this.ideasFilter === 'Return Gifts & Favors' ? 'active-filter' : ''}" data-filter="Return Gifts & Favors">Return Gifts</button>
          <button class="quick-suggestion-chip ${this.ideasFilter === 'Games & Activities' ? 'active-filter' : ''}" data-filter="Games & Activities">Games & Fun</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px;">
          ${filtered.map(idea => `
            <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="font-size:11px; font-weight:700; color:var(--color-primary); background:var(--color-primary-light); padding:2px 8px; border-radius:var(--radius-full);">
                    ${idea.category}
                  </span>
                  <button class="icon-btn-sm btn-fav-toggle" data-id="${idea.id}" aria-label="Save to Mood Board">
                    ${getIcon(idea.favorite ? 'heart_filled' : 'heart_empty')}
                  </button>
                </div>
                <h3 style="font-size:var(--font-size-sm); margin-bottom:6px;">${idea.title}</h3>
                <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); line-height:1.45;">${idea.description}</p>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; padding-top:8px; border-top:1px solid var(--color-border-subtle); font-size:11px;">
                <span>Cost: <strong>${(idea.estCostLevel || 'medium').toUpperCase()}</strong></span>
                <span style="color:var(--color-text-muted);">${idea.cultureTag || 'Cultural'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;

    // Filter pill click
    this.viewContainer.querySelectorAll('.quick-suggestion-chip[data-filter]').forEach(pill => {
      pill.addEventListener('click', () => {
        this.ideasFilter = pill.getAttribute('data-filter');
        this.renderIdeasView(state, lang);
      });
    });

    // Favorite heart toggle
    this.viewContainer.querySelectorAll('.btn-fav-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        store.setState(prev => {
          const updated = prev.ideas.map(i => i.id === id ? { ...i, favorite: !i.favorite } : i);
          return { ...prev, ideas: updated };
        });
      });
    });

    // "✨ Generate Fresh Ideas" Button
    this.viewContainer.querySelector('#btn-fresh-ideas')?.addEventListener('click', () => {
      const freshSet = generateFreshIdeasForEvent(state.event);
      store.setState(prev => ({
        ...prev,
        ideas: [...freshSet, ...(prev.ideas || [])]
      }));
      this.showToast('4 fresh cultural ideas generated!');
    });
  }

  // =========================================================================
  // VIEW 6: SETTINGS PAGE VIEW
  // =========================================================================
  renderSettingsPageView(state, lang) {
    const { event } = state;
    const events = store.state.events || [];
    const activeId = store.state.activeEventId;

    this.viewContainer.innerHTML = `
      <section aria-labelledby="settings-view-title">
        <h1 id="settings-view-title" style="font-size:clamp(1.4rem, 3vw, 1.85rem); margin-bottom:20px;">${getTranslation(lang, 'navSettings')}</h1>

        <div style="display:grid; grid-template-columns:1fr; gap:16px; max-width:640px;">
          <!-- All My Celebrations Multi-Event Management Card -->
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <div>
                <h2 style="font-size:var(--font-size-base);">My Celebrations (${events.length})</h2>
                <p style="font-size:var(--font-size-xs); color:var(--color-text-muted);">Switch, manage, or add new celebrations without losing progress.</p>
              </div>
              <button class="btn btn-primary btn-sm" id="btn-settings-add-celebration">
                ${getIcon('add')} + Plan Another
              </button>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px;">
              ${events.map(evt => {
                const e = evt.event;
                const isActive = evt.id === activeId;
                const typeIcons = { wedding: '💍', birthday: '🎂', housewarming: '🪔', community: '🎉' };
                const icon = typeIcons[e.type] || '✨';
                return `
                  <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:var(--radius-md); border:1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}; background-color:${isActive ? 'var(--color-primary-light)' : 'var(--color-surface)'};">
                    <div>
                      <strong style="font-size:var(--font-size-sm); display:flex; align-items:center; gap:6px;">
                        <span>${icon}</span> ${e.title} ${isActive ? `<span style="font-size:10px; background:var(--color-primary); color:#FFF; padding:2px 6px; border-radius:var(--radius-full); margin-left:6px;">ACTIVE</span>` : ''}
                      </strong>
                      <div style="font-size:11px; color:var(--color-text-muted); margin-top:2px;">
                        ${e.city} • ${formatCurrency(e.totalBudget, e.currency)} • ${e.guestCount} guests • 📅 ${e.date}
                      </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                      ${!isActive ? `
                        <button class="btn btn-outline btn-sm btn-settings-switch-evt" data-switch-id="${evt.id}" style="padding:4px 10px; font-size:11px;">
                          Switch
                        </button>
                      ` : ''}
                      ${events.length > 1 ? `
                        <button class="icon-btn-sm btn-settings-delete-evt" data-delete-id="${evt.id}" title="Delete Celebration" aria-label="Delete Celebration" style="color:var(--color-text-muted);">
                          ${getIcon('trash')}
                        </button>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Active Celebration Details Card -->
          <div class="card">
            <h2 style="font-size:var(--font-size-base); margin-bottom:12px;">Active Celebration Summary</h2>
            <div style="font-size:var(--font-size-sm); line-height:1.6;">
              <div><strong>Title:</strong> ${event.title}</div>
              <div><strong>Type:</strong> ${event.type.toUpperCase()}</div>
              <div><strong>Location:</strong> ${event.city}</div>
              <div><strong>Target Date:</strong> ${event.date}</div>
              <div><strong>Guests:</strong> ${event.guestCount}</div>
              <div><strong>Venue:</strong> ${event.needsVenue === false ? '🏠 Own Space (PG / Home - ₹0 Rent)' : '🏢 Rented Hall / Banquet'}</div>
              <div><strong>Total Budget:</strong> ${formatCurrency(event.totalBudget, event.currency)}</div>
            </div>
            <button class="btn btn-outline btn-sm" id="btn-open-settings-edit" style="margin-top:14px;">
              ${getIcon('settings')} Edit Parameters
            </button>
          </div>

          <!-- Data Management & Reset -->
          <div class="card">
            <h2 style="font-size:var(--font-size-base); margin-bottom:8px;">Data & Backup</h2>
            <p style="font-size:var(--font-size-xs); color:var(--color-text-muted); margin-bottom:14px;">
              Your event plans are stored privately on your device.
            </p>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <button class="btn btn-outline btn-sm" id="btn-export-backup-json">
                ${getIcon('calendar_download')} Export Full JSON Backup
              </button>
              <button class="btn btn-outline btn-sm" id="btn-reset-current-plan" style="color:var(--color-error); border-color:var(--color-error);">
                ${getIcon('reset')} Reset All Celebrations
              </button>
            </div>
          </div>
        </div>
      </section>
    `;

    // Add celebration button in settings
    this.viewContainer.querySelector('#btn-settings-add-celebration')?.addEventListener('click', () => {
      const modal = document.getElementById('add-event-modal-overlay');
      modal?.classList.add('open');
      modal?.setAttribute('aria-hidden', 'false');
    });

    // Switch buttons
    this.viewContainer.querySelectorAll('.btn-settings-switch-evt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-switch-id');
        store.switchEvent(id);
        this.showToast('Switched celebration plan!');
      });
    });

    // Delete buttons
    this.viewContainer.querySelectorAll('.btn-settings-delete-evt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-id');
        const targetEvt = events.find(e => e.id === id);
        const name = targetEvt?.event?.title || 'this celebration';
        if (confirm(`Delete celebration "${name}"?`)) {
          store.deleteEvent(id);
          this.showToast(`Deleted "${name}".`);
        }
      });
    });

    this.viewContainer.querySelector('#btn-open-settings-edit')?.addEventListener('click', () => {
      document.getElementById('btn-header-settings')?.click();
    });

    this.viewContainer.querySelector('#btn-export-backup-json')?.addEventListener('click', () => {
      exportJSONBackup(state);
    });

    this.viewContainer.querySelector('#btn-reset-current-plan')?.addEventListener('click', () => {
      if (confirm('Reset all celebrations? This will clear all celebration data on this device.')) {
        store.resetAllData();
        this.showToast('All celebrations reset. Ready for a new event!');
        window.location.hash = '#dashboard';
      }
    });
  }
}

// Bootstrap on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
