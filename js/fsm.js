/* =========================================================
   fsm.js — Finite State Machine engine
   FSM Login System Demo

   States:
     S0 IDLE              — user belum input
     S1 VALIDATING        — sistem sedang proses input
     S2 EMAIL_NOT_FOUND   — email tidak terdaftar
     S3 WRONG_PASSWORD    — password salah (attempt < 3)
     S4 AUTHENTICATED     — login berhasil
     S5 LOCKED            — gagal 3x, akun dikunci
     S6 COOLDOWN          — timer 30s berjalan
   ========================================================= */

(function (global) {
  'use strict';

  // ----- State definitions (sesuai PRD section 3.1 + 5.3) -----
  const STATES = {
    S0: { id: 'S0', name: 'IDLE',              color: '#94A3B8', cssVar: '--state-idle' },
    S1: { id: 'S1', name: 'VALIDATING',        color: '#3B82F6', cssVar: '--state-validating' },
    S2: { id: 'S2', name: 'EMAIL_NOT_FOUND',   color: '#F59E0B', cssVar: '--state-email-not-found' },
    S3: { id: 'S3', name: 'WRONG_PASSWORD',    color: '#EF4444', cssVar: '--state-wrong-password' },
    S4: { id: 'S4', name: 'AUTHENTICATED',     color: '#10B981', cssVar: '--state-authenticated' },
    S5: { id: 'S5', name: 'LOCKED',            color: '#DC2626', cssVar: '--state-locked' },
    S6: { id: 'S6', name: 'COOLDOWN',          color: '#8B5CF6', cssVar: '--state-cooldown' }
  };

  // ----- Transition table (sesuai PRD section 3.2) -----
  // Key: current state. Value: { event: nextState }
  const TRANSITIONS = {
    S0: { submit: 'S1' },
    S1: {
      email_not_found:     'S2',
      wrong_password:      'S3',  // attempt < 3
      wrong_password_max:  'S5',  // attempt = 3
      authenticated:       'S4'
    },
    S2: { edit_input: 'S0', submit: 'S1' },
    S3: { submit: 'S1', edit_input: 'S0' },
    S4: { logout: 'S0' },
    S5: { auto: 'S6' },
    S6: { cooldown_end: 'S0' }
  };

  // ----- Class FSM -----
  class FSM {
    constructor(initial = 'S0') {
      if (!STATES[initial]) {
        throw new Error(`[FSM] Invalid initial state: ${initial}`);
      }
      this.current = initial;
      this.previous = null;
      this.history = [{ state: initial, event: 'init', at: Date.now() }];
      this.listeners = [];
    }

    /** Mendapatkan state object yang sedang aktif */
    getState() {
      return STATES[this.current];
    }

    /** Mendapatkan state ID saat ini */
    getStateId() {
      return this.current;
    }

    /** Apakah transisi `event` valid dari state saat ini
     *  Is the `event` transition valid from the current state */
    can(event) {
      const t = TRANSITIONS[this.current];
      return !!(t && t[event]);
    }

    /**
     * Transisi ke state berikutnya.
     * @param {string} event - nama event (mis. 'submit', 'wrong_password')
     * @returns {boolean} sukses atau tidak
     */
    transition(event) {
      const t = TRANSITIONS[this.current];
      if (!t || !t[event]) {
        console.warn(`[FSM] Invalid transition: ${this.current} --${event}-->`);
        return false;
      }

      const next = t[event];
      const prev = this.current;

      this.previous = prev;
      this.current = next;
      this.history.push({ state: next, event, at: Date.now(), from: prev });

      // Notify listeners
      this._notify(next, prev, event);

      return true;
    }

    /**
     * Subscribe ke perubahan state.
     * @param {function} fn - callback (newState, prevState, event) => void
     * @returns {function} unsubscribe
     */
    subscribe(fn) {
      this.listeners.push(fn);
      return () => {
        this.listeners = this.listeners.filter(f => f !== fn);
      };
    }

    /** Reset ke S0 dan bersihkan history */
    reset() {
      const prev = this.current;
      this.previous = prev;
      this.current = 'S0';
      this.history = [{ state: 'S0', event: 'reset', at: Date.now(), from: prev }];
      this._notify('S0', prev, 'reset');
    }

    /** Mendapatkan salinan history */
    getHistory() {
      return [...this.history];
    }

    _notify(newState, prevState, event) {
      this.listeners.forEach(fn => {
        try {
          fn(newState, prevState, event);
        } catch (err) {
          console.error('[FSM] Listener error:', err);
        }
      });
    }

    // ----- Static helpers -----
    static get STATES() { return STATES; }
    static get TRANSITIONS() { return TRANSITIONS; }
    static getStateById(id) { return STATES[id]; }
    static getAllStates() { return Object.values(STATES); }
  }

  // Expose to global
  global.FSM = FSM;
  global.FSM_STATES = STATES;
  global.FSM_TRANSITIONS = TRANSITIONS;

})(window);
