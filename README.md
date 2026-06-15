# FSM Login System — Interactive Demo

An interactive implementation of a **Finite State Machine (FSM)** applied to an authentication (login) system, built for academic demonstration. Pure HTML/CSS/JS with no framework, featuring an SVG FSM diagram that highlights the active state in real-time.

> 📄 Full requirements: see [PRD-FSM-Login-System.md](./PRD-FSM-Login-System.md)

---

## 🚀 How to Run

This project is **static** — no build, no install, no server needed. Just:

1. **Quickest way:** Double-click `index.html` in your file explorer.
2. **Recommended (Python):** Open a terminal in the project folder, then:
   ```bash
   python -m http.server 8000
   ```
   Open `http://localhost:8000` in your browser.
3. **Alternative (Node.js):**
   ```bash
   npx serve
   ```
   It will open automatically in your browser.

> ⚠️ **Note:** Some browsers restrict `sessionStorage`/`localStorage` features when opening from the `file://` protocol. If theme/history doesn't persist, use option 2 or 3.

---

## 🔑 Demo Accounts

Three hardcoded accounts live in `js/users.js`. Click the **"?"** icon in the header to open the cheat sheet and auto-fill the form.

| Name | Email | Password | Role |
|---|---|---|---|
| Budi Santoso | `budi@demo.com` | `Budi@2024` | Administrator |
| Sari Dewi | `sari@demo.com` | `Sari#Pass1` | Editor |
| Andi Wijaya | `andi@demo.com` | `Andi$2026` | Viewer |

---

## 🧠 State Machine

There are **7 states** as defined in the PRD:

| ID | Name | Description |
|---|---|---|
| **S0** | IDLE | User hasn't entered anything yet |
| **S1** | VALIDATING | System is processing input |
| **S2** | EMAIL_NOT_FOUND | Email not registered |
| **S3** | WRONG_PASSWORD | Wrong password (attempt 1–2) |
| **S4** | AUTHENTICATED | Login successful |
| **S5** | LOCKED | 3 failed attempts, account locked |
| **S6** | COOLDOWN | 30-second timer running |

See the full transition table in the interactive diagram on the right side of the login page.

---

## 🧪 Test Scenarios

| # | Scenario | Input | Expected State |
|---|---|---|---|
| 1 | Email not registered | `unknown@mail.com` / anything | S2 |
| 2 | Wrong password (1st) | `budi@demo.com` / `wrong123` | S3 (attempt 1/3) |
| 3 | Wrong password (2nd) | retry | S3 (attempt 2/3) |
| 4 | Wrong password (3rd) | retry | S5 → S6 (30s lockout) |
| 5 | Successful login | `budi@demo.com` / `Budi@2024` | S4 → redirect to Home |
| 6 | Logout from Home | click Logout button | return to S0 |
| 7 | Cooldown finishes | wait 30 seconds | return to S0, form active again |

---

## ✨ Additional Features

Five extra features to support the demo:

| Feature | Location | Function |
|---|---|---|
| **Cheat sheet** | `?` button in header | Panel with 3 demo accounts + auto-fill button |
| **Reset Demo** | `Reset` button in header | Reset FSM to IDLE, clear form & history |
| **State history** | Panel below the diagram | Log of state transitions with timestamps |
| **Speed mode** | `0.5x / 1x / 2x` toggle in header | Speed up / slow down animations |
| **Dark/Light mode** | Sun/moon icon in header | Toggle theme, persisted in `localStorage` |

---

## 📁 File Structure

```
.
├── PRD-FSM-Login-System.md   # Requirements reference
├── README.md                 # This file
├── index.html                # Login page + diagram
├── home.html                 # Post-login page
│
├── css/
│   ├── style.css             # Design tokens, layout, header
│   ├── login.css             # Login form + cheat sheet
│   ├── diagram.css           # SVG diagram + history
│   └── home.css              # Home page styles
│
└── js/
    ├── users.js              # 3 hardcoded accounts
    ├── fsm.js                # FSM engine (state machine)
    ├── auth.js               # Validation + cooldown timer
    ├── diagram.js            # Render SVG + highlight
    ├── features.js           # 5 additional features
    └── main.js               # Entry point & orchestrator
```

### Dependencies

- **Google Fonts** (Inter, JetBrains Mono) — via CDN
- **No JS libraries** — pure vanilla JS
- **No build step** — edit & refresh

---

## 🛠️ Development

- **Edit states/transitions:** open `js/fsm.js`, modify `STATES` or `TRANSITIONS` constants.
- **Edit demo accounts:** open `js/users.js`.
- **Edit styling:** change design tokens in `:root` of `css/style.css` (colors, spacing, etc.).
- **Edit diagram layout:** open `js/diagram.js`, change `NODE_POS` or `TRANSITIONS` (path data).
- **Edit error messages:** open `js/main.js`, look for `_showMessage(...)` calls.

---

## 📋 Implementation Notes

- **No backend** — authentication is simulated with hardcoded data.
- **State is not persistent** — refreshing the page resets to S0 (per PRD; makes resetting between demos easy).
- **Theme & speed mode are persistent** — stored in `localStorage` (UI preferences only, not FSM state).
- **Auto lockout** — after 3 wrong passwords, the system locks for 30 seconds (great for demos without manual reset).

---

## 📜 License

Built for academic demonstration. Free to use and modify for educational purposes.
