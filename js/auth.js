/* =========================================================
   auth.js — Authentication, validation, attempt counter,
              cooldown timer
   FSM Login System Demo
   ========================================================= */

(function (global) {
  'use strict';

  // ----- Auth: validasi kredensial & attempt counter -----
  const Auth = {
    _attempt: 0,
    _MAX_ATTEMPTS: 3,

    /**
     * Mencari user berdasarkan email (case-insensitive, trim)
     * @param {string} email
     * @returns {object|null}
     */
    findUserByEmail(email) {
      if (!email) return null;
      const normalized = email.trim().toLowerCase();
      return USERS.find(u => u.email.toLowerCase() === normalized) || null;
    },

    /**
     * Cek kredensial. Menaikkan attempt counter kalau password salah.
     * @param {string} email
     * @param {string} password
     * @returns {{reason: string, user?: object, attempt?: number, remaining?: number}}
     *   reason: 'OK' | 'EMAIL_NOT_FOUND' | 'WRONG_PASSWORD' | 'WRONG_PASSWORD_MAX'
     */
    checkCredentials(email, password) {
      const user = this.findUserByEmail(email);

      if (!user) {
        return { reason: 'EMAIL_NOT_FOUND' };
      }

      if (user.password !== password) {
        this._attempt += 1;
        const remaining = Math.max(0, this._MAX_ATTEMPTS - this._attempt);
        if (this._attempt >= this._MAX_ATTEMPTS) {
          return { reason: 'WRONG_PASSWORD_MAX', attempt: this._attempt, remaining };
        }
        return { reason: 'WRONG_PASSWORD', attempt: this._attempt, remaining };
      }

      // Sukses — reset attempt
      this.resetAttempt();
      return { reason: 'OK', user };
    },

    getAttempt() {
      return this._attempt;
    },

    getMaxAttempts() {
      return this._MAX_ATTEMPTS;
    },

    resetAttempt() {
      this._attempt = 0;
    }
  };

  // ----- Cooldown: 30-second countdown timer -----
  const Cooldown = {
    _intervalId: null,
    _remaining: 0,
    _totalSeconds: 0,

    /**
     * Mulai countdown.
     * @param {number} seconds - durasi total (mis. 30)
     * @param {function} onTick - (remaining) => void, called every second
     * @param {function} onEnd - () => void, dipanggil saat selesai
     */
    start(seconds, onTick, onEnd) {
      this.stop(); // bersihkan interval lama jika ada
      this._remaining = seconds;
      this._totalSeconds = seconds;

      // Panggil onTick langsung dengan nilai awal supaya UI update segera
      if (typeof onTick === 'function') onTick(this._remaining);

      this._intervalId = setInterval(() => {
        this._remaining -= 1;
        if (typeof onTick === 'function') onTick(this._remaining);

        if (this._remaining <= 0) {
          this.stop();
          if (typeof onEnd === 'function') onEnd();
        }
      }, 1000);
    },

    stop() {
      if (this._intervalId !== null) {
        clearInterval(this._intervalId);
        this._intervalId = null;
      }
    },

    getRemaining() {
      return this._remaining;
    },

    isRunning() {
      return this._intervalId !== null;
    }
  };

  // Expose
  global.Auth = Auth;
  global.Cooldown = Cooldown;

})(window);
