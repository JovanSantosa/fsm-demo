/* =========================================================
   features.js — 5 fitur tambahan:
     1. Cheat sheet (panel kredensial demo)
     2. Reset Demo button
     3. State history log
     4. Speed mode (0.5x / 1x / 2x)
     5. Dark/Light theme toggle
   FSM Login System Demo
   ========================================================= */

(function (global) {
  'use strict';

  // ---------- SVG Icons (inline, no library) ----------
  const ICONS = {
    sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
    moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    help: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    reset: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
    eye: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
  };

  // ---------- Helpers ----------
  function $(sel, root = document) { return root.querySelector(sel); }
  function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  // ---------- Features object ----------
  const Features = {
    fsm: null,

    /**
     * Inisialisasi seluruh fitur. Dipanggil dari main.js.
     * Initializes all features. Called from main.js.
     * @param {FSM} fsm
     */
    init(fsm) {
      this.fsm = fsm;
      this._initIcons();
      this._initTheme();
      this._initSpeed();
      this._initCheatSheet();
      this._initReset();
      this._initStateHistory();
      this._initPasswordToggle();
    },

    // ---------- Inject SVG icons ke tombol ----------
    _initIcons() {
      const themeBtn = $('#theme-toggle');
      if (themeBtn) themeBtn.innerHTML = ICONS.sun;

      const cheatBtn = $('#cheat-toggle');
      if (cheatBtn) cheatBtn.innerHTML = ICONS.help;

      const resetBtn = $('#reset-demo');
      if (resetBtn) resetBtn.innerHTML = `${ICONS.reset}<span>Reset</span>`;

      const eyeBtn = $('#password-toggle');
      if (eyeBtn) eyeBtn.innerHTML = ICONS.eye;
    },

    // ---------- 1) Theme (dark/light) ----------
    _initTheme() {
      const saved = localStorage.getItem('fsm-theme') || 'dark';
      this.setTheme(saved, false);

      const btn = $('#theme-toggle');
      if (btn) {
        btn.addEventListener('click', () => {
          const current = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
          const next = current === 'dark' ? 'light' : 'dark';
          this.setTheme(next, true);
        });
      }
    },

    setTheme(mode, persist = true) {
      if (mode === 'light') {
        document.documentElement.classList.add('light-mode');
      } else {
        document.documentElement.classList.remove('light-mode');
      }
      if (persist) localStorage.setItem('fsm-theme', mode);

      const btn = $('#theme-toggle');
      if (btn) {
        const isLight = mode === 'light';
        btn.innerHTML = isLight ? ICONS.moon : ICONS.sun;
        btn.setAttribute('title', isLight ? 'Light mode · click for dark' : 'Dark mode · click for light');
        btn.setAttribute('aria-label', btn.getAttribute('title'));
      }
    },

    // ---------- 2) Speed mode (0.5x / 1x / 2x) ----------
    _initSpeed() {
      const saved = localStorage.getItem('fsm-speed') || '1x';
      this.setSpeed(saved, false);

      $$('.segmented-btn[data-speed]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.setSpeed(btn.dataset.speed, true);
        });
      });
    },

    setSpeed(speed, persist = true) {
      document.body.classList.remove('speed-fast', 'speed-slow');
      if (speed === '0.5x') document.body.classList.add('speed-slow');
      if (speed === '2x') document.body.classList.add('speed-fast');

      $$('.segmented-btn[data-speed]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.speed === speed);
      });

      if (persist) localStorage.setItem('fsm-speed', speed);
    },

    // ---------- 3) Cheat sheet ----------
    _initCheatSheet() {
      const btn = $('#cheat-toggle');
      const panel = $('#cheat-panel');
      if (!btn || !panel) return;

      // Build account list
      panel.innerHTML = `
        <div class="cheat-header">
          <strong>Demo Accounts</strong>
          <span>Click "Fill" to auto-fill the form</span>
        </div>
        <div class="cheat-list">
          ${USERS.map(u => `
            <div class="cheat-account">
              <div class="cheat-avatar" style="background:${Features._avatarColor(u.id)}">${u.avatar}</div>
              <div class="cheat-info">
                <div class="cheat-name">${u.name} <span class="cheat-role">${u.role}</span></div>
                <div class="cheat-creds">
                  <code>${u.email}</code>
                  <span class="cheat-sep">/</span>
                  <code>${u.password}</code>
                </div>
              </div>
              <button type="button" class="cheat-fill" data-email="${u.email}" data-password="${u.password}">Fill</button>
            </div>
          `).join('')}
        </div>
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('open');
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !btn.contains(e.target)) {
          panel.classList.remove('open');
        }
      });

      // Fill buttons
      panel.addEventListener('click', (e) => {
        const fillBtn = e.target.closest('.cheat-fill');
        if (!fillBtn) return;
        const emailInput = $('#email');
        const pwInput = $('#password');
        if (emailInput) emailInput.value = fillBtn.dataset.email;
        if (pwInput) pwInput.value = fillBtn.dataset.password;
        const original = fillBtn.textContent;
        fillBtn.textContent = '✓ Filled';
        fillBtn.classList.add('filled');
        setTimeout(() => {
          fillBtn.textContent = original;
          fillBtn.classList.remove('filled');
        }, 1200);
      });
    },

    _avatarColor(id) {
      const palette = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];
      return palette[(id - 1) % palette.length];
    },

    // ---------- 4) Reset Demo ----------
    _initReset() {
      const btn = $('#reset-demo');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const ok = confirm(
          'Reset the entire FSM state to IDLE?\n\n' +
          '• Login form will be cleared\n' +
          '• Attempt counter reset to 0\n' +
          '• Cooldown timer (if running) will be stopped\n' +
          '• State history will be cleared'
        );
        if (!ok) return;

        Cooldown.stop();
        Auth.resetAttempt();

        const form = $('#login-form');
        if (form) form.reset();

        this.fsm.reset();
      });
    },

    // ---------- 5) State history log ----------
    _initStateHistory() {
      const list = $('#state-history-list');
      if (!list) return;

      // Subscribe to FSM transitions
      this.fsm.subscribe(() => this._renderHistory());

      // Initial render
      this._renderHistory();
    },

    _renderHistory() {
      const list = $('#state-history-list');
      if (!list || !this.fsm) return;

      const history = this.fsm.getHistory();
      if (history.length === 0) {
        list.innerHTML = '<div class="state-history-empty">No transitions yet.</div>';
        return;
      }

      const fmt = (ts) => {
        const d = new Date(ts);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
      };

      const items = history.map((h, i, arr) => {
        const prev = arr[i - 1];
        const showArrow = prev && prev.state !== h.state;
        const arrowHtml = showArrow
          ? `<span class="state-history-arrow">${prev.state} →</span><span class="state-history-state">${h.state}</span>`
          : `<span class="state-history-state">${h.state}</span>`;
        const eventTag = h.event && h.event !== 'init' && h.event !== 'reset'
          ? `<span class="state-history-event">via ${h.event}</span>`
          : '';
        return `
          <div class="state-history-entry">
            <span class="state-history-time">${fmt(h.at)}</span>
            <span class="state-history-transition">${arrowHtml}</span>
            ${eventTag}
          </div>
        `;
      });

      list.innerHTML = items.join('');
      list.scrollTop = 0;
    },

    // ---------- 6) Password show/hide toggle ----------
    _initPasswordToggle() {
      const btn = $('#password-toggle');
      const input = $('#password');
      if (!btn || !input) return;

      btn.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.innerHTML = isPassword ? ICONS.eyeOff : ICONS.eye;
        btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      });
    }
  };

  global.Features = Features;
  global.FEATURE_ICONS = ICONS;

})(window);
