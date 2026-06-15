/* =========================================================
   main.js — Entry point & orchestrator
   FSM Login System Demo
   ========================================================= */

(function () {
  'use strict';

  // ---------- DOM refs ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const form = $('#login-form');
  const emailInput = $('#email');
  const passwordInput = $('#password');
  const submitBtn = $('#submit-btn');

  const messageEl = $('#form-message');
  const attemptBadge = $('#form-attempt-badge');
  const attemptText = $('#attempt-text');

  const countdownEl = $('#form-countdown');
  const countdownText = $('#countdown-text');
  const countdownSeconds = $('#countdown-seconds');
  const countdownCircle = countdownEl?.querySelector('.countdown-circle');

  // ---------- Init ----------
  const fsm = new FSM('S0');
  const svgEl = $('#fsm-svg');
  const diagram = svgEl ? new Diagram(svgEl, fsm) : null;

  // Init features (cheat sheet, reset, theme, speed, history)
  Features.init(fsm);

  // Populate legend
  _renderLegend();

  // ---------- Form submit handler ----------
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Validasi HTML5 (browser handles required)
      if (!email || !password) return;

      // Basic email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        _showMessage('error', 'Invalid email format. Please check and try again.');
        return;
      }

      // Transition to S1 (VALIDATING)
      fsm.transition('submit');

      // Brief delay so S1 is visible in the diagram
      await _sleep(300);

      // Check credentials
      const result = Auth.checkCredentials(email, password);

      // Dispatch transition based on result
      switch (result.reason) {
        case 'EMAIL_NOT_FOUND':
          fsm.transition('email_not_found');
          _showMessage('error', 'Email not found. Please check your email address.');
          _updateAttemptBadge(0); // wrong email does not increment counter
          break;

        case 'WRONG_PASSWORD':
          fsm.transition('wrong_password');
          _showMessage('error', `Wrong password. Remaining attempts: <strong>${result.remaining}/3</strong>`);
          _updateAttemptBadge(result.attempt);
          break;

        case 'WRONG_PASSWORD_MAX':
          fsm.transition('wrong_password_max');
          _showMessage('error', 'Account temporarily locked after 3 failed attempts.');
          _updateAttemptBadge(result.attempt);
          // Brief pause to show S5 (LOCKED) state
          await _sleep(400);
          // Auto transition S5 → S6 (LOCKED → COOLDOWN)
          fsm.transition('auto');
          _startCooldown();
          break;

        case 'OK':
          fsm.transition('authenticated');
          _showMessage('success', `Login successful! Redirecting to home...`);
          // Save user to sessionStorage
          sessionStorage.setItem('fsm-auth-user', JSON.stringify(result.user));
          // Redirect to home.html
          await _sleep(800);
          window.location.href = 'home.html';
          break;
      }
    });
  }

  // ---------- Input event listeners (clear error & transition to S0) ----------
  function _attachEditListeners() {
    [emailInput, passwordInput].forEach(input => {
      if (!input) return;
      input.addEventListener('input', () => {
        const currentState = fsm.getStateId();
        // If in error/locked/cooldown state, return to S0 on edit
        if (['S2', 'S3', 'S5', 'S6'].includes(currentState)) {
          fsm.transition('edit_input');
        }
      });
    });
  }
  _attachEditListeners();

  // ---------- FSM listener: update UI based on state ----------
  fsm.subscribe((newState, prevState, event) => {
    const sid = newState;

    // Reset attempt counter visual when in S0
    if (sid === 'S0') {
      _hideMessage();
      _updateAttemptBadge(0);
      _hideCountdown();
    }

    // Form disabled state
    if (form) {
      const disable = ['S1', 'S5', 'S6'].includes(sid);
      emailInput.disabled = disable;
      passwordInput.disabled = disable;
      submitBtn.disabled = disable;
    }
  });

  // ---------- Helpers ----------
  function _sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  function _showMessage(kind, text) {
    if (!messageEl) return;
    messageEl.className = `form-message visible ${kind}`;
    messageEl.innerHTML = text;
  }

  function _hideMessage() {
    if (!messageEl) return;
    messageEl.className = 'form-message';
    messageEl.innerHTML = '';
  }

  function _updateAttemptBadge(attempt) {
    if (!attemptBadge || !attemptText) return;
    if (attempt > 0 && attempt <= 3) {
      attemptBadge.hidden = false;
      attemptText.textContent = `${attempt}/3`;
    } else {
      attemptBadge.hidden = true;
    }
  }

  function _hideCountdown() {
    if (!countdownEl) return;
    countdownEl.classList.remove('visible');
  }

  function _startCooldown() {
    const total = 30;
    Cooldown.start(total,
      // onTick
      (remaining) => {
        if (!countdownEl) return;
        countdownEl.classList.add('visible');
        if (countdownText) countdownText.textContent = remaining;
        if (countdownSeconds) countdownSeconds.textContent = remaining;
        if (countdownCircle) {
          const pct = (remaining / total) * 100;
          countdownCircle.style.setProperty('--countdown-pct', pct);
          countdownCircle.classList.remove('tick');
          // Force reflow to restart animation
          void countdownCircle.offsetWidth;
          countdownCircle.classList.add('tick');
        }
      },
      // onEnd
      () => {
        fsm.transition('cooldown_end');
        Auth.resetAttempt();
        _hideCountdown();
        _showMessage('info', 'Cooldown complete. You can try logging in again.');
        // Clear message after a few seconds
        setTimeout(() => _hideMessage(), 3000);
      }
    );
  }

  // ---------- Render legend ----------
  function _renderLegend() {
    const legend = $('#fsm-legend');
    if (!legend) return;
    const states = FSM.getAllStates();
    legend.innerHTML = states.map(s => `
      <div class="fsm-legend-item">
        <span class="fsm-legend-dot" style="background: ${s.color}"></span>
        <span class="fsm-legend-id">${s.id}</span>
        <span>${s.name.replace(/_/g, ' ').toLowerCase()}</span>
      </div>
    `).join('');
  }

  // ---------- Update history count ----------
  // Sub-subscribe to FSM to update the counter in the history panel header
  fsm.subscribe(() => {
    const counter = $('#history-count');
    if (counter) {
      const count = fsm.getHistory().length;
      counter.textContent = `${count} event${count !== 1 ? 's' : ''}`;
    }
  });

  // ---------- Done ----------
  console.info('[FSM Login] Initialized. State:', fsm.getStateId());

})();
