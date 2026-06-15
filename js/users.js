/* =========================================================
   users.js — Hardcoded demo accounts
   FSM Login System Demo
   ========================================================= */

const USERS = [
  {
    id: 1,
    name: "Budi Santoso",
    email: "budi@demo.com",
    password: "Budi@2024",
    avatar: "BS",
    role: "Administrator",
    lastLogin: "10 Juni 2026, 09:41"
  },
  {
    id: 2,
    name: "Sari Dewi",
    email: "sari@demo.com",
    password: "Sari#Pass1",
    avatar: "SD",
    role: "Editor",
    lastLogin: "12 Juni 2026, 14:22"
  },
  {
    id: 3,
    name: "Andi Wijaya",
    email: "andi@demo.com",
    password: "Andi$2026",
    avatar: "AW",
    role: "Viewer",
    lastLogin: "14 Juni 2026, 08:05"
  }
];

// Expose to window for vanilla JS usage
window.USERS = USERS;
