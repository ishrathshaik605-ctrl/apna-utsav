/**
 * chat.js - Interactive Voice Chat Board for Doubts & Advice
 * Features:
 * - Native Web Speech API speech recognition with live transcription
 * - Speech synthesis read-aloud TTS
 * - Simple, culturally aware advice
 * - Safe structured action application (with user approval)
 */

import { store } from './state.js';
import { getIcon } from './icons.js';
import { computeBudgetSplit } from './math.js';

export class VoiceChatBoard {
  constructor(containerEl, onActionApplied) {
    this.container = containerEl;
    this.onActionApplied = onActionApplied;
    this.isRecognizing = false;
    this.recognition = null;
    this.synth = window.speechSynthesis || null;
    this.pendingAction = null;
    this.initSpeech();
  }

  initSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }
        const inputEl = this.container.querySelector('#chat-input');
        if (inputEl) {
          inputEl.value = final || interim;
        }
      };

      this.recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        this.isRecognizing = false;
        this.updateMicState();
      };

      this.recognition.onend = () => {
        this.isRecognizing = false;
        this.updateMicState();
        // If user finished speaking and has text, auto-focus send
        const inputEl = this.container.querySelector('#chat-input');
        if (inputEl && inputEl.value.trim()) {
          inputEl.focus();
        }
      };
    }
  }

  toggleVoiceInput() {
    if (!this.recognition) {
      alert('Speech recognition is not supported in this browser. Please type your doubt in the box.');
      return;
    }

    if (this.isRecognizing) {
      this.recognition.stop();
      this.isRecognizing = false;
    } else {
      const state = store.getState();
      const lang = state.event?.language || 'en';
      const langMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', kn: 'kn-IN', ta: 'ta-IN' };
      this.recognition.lang = langMap[lang] || 'en-IN';
      try {
        this.recognition.start();
        this.isRecognizing = true;
      } catch (err) {
        console.warn('Recognition start error:', err);
        this.isRecognizing = false;
      }
    }
    this.updateMicState();
  }

  updateMicState() {
    const micBtn = this.container.querySelector('#btn-voice-mic');
    const statusText = this.container.querySelector('#voice-status-indicator');
    if (micBtn) {
      micBtn.classList.toggle('pulse-recording', this.isRecognizing);
      micBtn.innerHTML = getIcon(this.isRecognizing ? 'mic_off' : 'mic');
    }
    if (statusText) {
      statusText.style.display = this.isRecognizing ? 'block' : 'none';
    }
  }

  speak(text) {
    if (!this.synth) return;
    this.synth.cancel();
    const cleanText = text.replace(/[*#_~`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const state = store.getState();
    const lang = state.event?.language || 'en';
    const langMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', kn: 'kn-IN', ta: 'ta-IN' };
    utterance.lang = langMap[lang] || 'en-IN';
    this.synth.speak(utterance);
  }

  async sendDoubt(rawText) {
    if (!rawText || !rawText.trim()) return;
    const text = rawText.trim();

    this.appendMessage('user', text);
    const typingId = this.showTypingIndicator();

    const state = store.getState();
    const context = {
      event: state.event,
      budgetStats: {
        totalBudget: state.event?.totalBudget || 0,
        categoriesCount: state.budgetItems?.length || 0,
        tasksCount: state.tasks?.length || 0,
        vendorsCount: state.vendors?.length || 0
      },
      language: state.event?.language || 'en'
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context })
      });

      this.removeTypingIndicator(typingId);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      this.renderAIResponse(data);
    } catch (err) {
      this.removeTypingIndicator(typingId);
      console.warn('Network chat error, using local fallback:', err);
      this.appendMessage(
        'assistant',
        'I am here to guide you with your celebration planning. What questions do you have regarding catering, venue contracts, budget optimization, or rituals?'
      );
    }
  }

  renderAIResponse(data) {
    const msg = data.message || 'I have analyzed your request.';
    const assumptions = data.assumptions || [];
    const warnings = data.warnings || [];
    const actions = data.actions || [];

    let formatted = msg;
    if (assumptions.length > 0) {
      formatted += `\n\n📌 **Assumptions:**\n` + assumptions.map(a => `• ${a}`).join('\n');
    }
    if (warnings.length > 0) {
      formatted += `\n\n⚠️ **Helpful Note:**\n` + warnings.map(w => `• ${w}`).join('\n');
    }

    this.appendMessage('assistant', formatted, actions);
  }

  appendMessage(role, text, actions = []) {
    const messagesList = this.container.querySelector('#chat-messages-list');
    if (!messagesList) return;

    const el = document.createElement('div');
    el.className = `chat-bubble chat-bubble-${role}`;
    el.setAttribute('role', 'article');

    const cleanFormatted = this.formatMarkdown(text);

    let actionsHtml = '';
    if (actions && actions.length > 0) {
      actionsHtml = `
        <div class="chat-action-prompt">
          <p style="font-size:var(--font-size-xs); font-weight:600; margin-bottom:var(--space-2);">
            The assistant proposed updates for your celebration plan:
          </p>
          <button class="btn btn-primary btn-sm btn-apply-action" style="padding:6px 14px; font-size:var(--font-size-xs);">
            ${getIcon('check')} Apply Updates to Plan
          </button>
        </div>
      `;
    }

    el.innerHTML = `
      <div class="chat-sender-header">
        <span class="chat-sender-name">${role === 'user' ? 'You' : 'Apna Utsav AI'}</span>
        ${role === 'assistant' ? `
          <button class="icon-btn-sm btn-speak" aria-label="Read aloud" title="Read aloud">
            ${getIcon('speaker')}
          </button>
        ` : ''}
      </div>
      <div class="chat-bubble-body">${cleanFormatted}</div>
      ${actionsHtml}
    `;

    if (role === 'assistant') {
      const speakBtn = el.querySelector('.btn-speak');
      if (speakBtn) {
        speakBtn.addEventListener('click', () => this.speak(text));
      }

      const applyBtn = el.querySelector('.btn-apply-action');
      if (applyBtn && actions.length > 0) {
        applyBtn.addEventListener('click', () => {
          this.applyActions(actions);
          applyBtn.textContent = '✓ Applied to Plan';
          applyBtn.disabled = true;
          applyBtn.style.opacity = '0.7';
        });
      }
    }

    messagesList.appendChild(el);
    messagesList.scrollTop = messagesList.scrollHeight;
  }

  applyActions(actions) {
    let state = store.getState();
    let changed = false;

    actions.forEach(act => {
      if (act.type === 'SET_BUDGET_SPLIT' && act.payload?.categories && state.event) {
        state.budgetItems = computeBudgetSplit(state.event.totalBudget, act.payload.categories);
        changed = true;
      } else if (act.type === 'ADD_TASKS' && act.payload?.tasks && state.event) {
        const newTasks = act.payload.tasks.map(t => {
          const d = new Date(state.event.date || Date.now());
          d.setDate(d.getDate() + (t.dueOffsetDays || 0));
          return {
            id: 'tsk_' + Math.random().toString(36).substr(2, 7),
            title: t.title,
            dueDate: d.toISOString().split('T')[0],
            status: 'todo',
            priority: t.priority || 'medium',
            category: t.category || 'General',
            notes: ''
          };
        });
        state.tasks = [...(state.tasks || []), ...newTasks];
        changed = true;
      } else if (act.type === 'ADD_IDEAS' && act.payload?.ideas) {
        const newIdeas = act.payload.ideas.map(i => ({
          id: 'idea_' + Math.random().toString(36).substr(2, 7),
          category: 'Personalized Ideas',
          title: i.title,
          description: i.description,
          estCostLevel: i.estCostLevel || 'low',
          favorite: false
        }));
        state.ideas = [...(state.ideas || []), ...newIdeas];
        changed = true;
      }
    });

    if (changed) {
      store.setState(() => state);
      if (this.onActionApplied) this.onActionApplied();
    }
  }

  showTypingIndicator() {
    const list = this.container.querySelector('#chat-messages-list');
    if (!list) return null;
    const id = 'typing_' + Date.now();
    const el = document.createElement('div');
    el.id = id;
    el.className = 'chat-bubble chat-bubble-assistant typing-bubble';
    el.innerHTML = `
      <div class="chat-sender-header"><span class="chat-sender-name">Apna Utsav AI</span></div>
      <div class="typing-dots"><span></span><span></span><span></span></div>
    `;
    list.appendChild(el);
    list.scrollTop = list.scrollHeight;
    return id;
  }

  removeTypingIndicator(id) {
    if (!id) return;
    const el = this.container.querySelector(`#${id}`);
    if (el) el.remove();
  }

  formatMarkdown(str) {
    if (!str) return '';
    let esc = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold
    esc = esc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    esc = esc.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Lists
    esc = esc.replace(/^\s*•\s*(.*)$/gm, '<li>$1</li>');
    esc = esc.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    // Line breaks
    esc = esc.replace(/\n/g, '<br/>');
    return esc;
  }
}
