# Product Requirements Document (PRD)
## FSM Login System — Interactive Demo

**Versi:** 1.0.0
**Tanggal:** 15 Juni 2026
**Status:** Draft
**Author:** Jovan

---

## 1. Overview

### 1.1 Latar Belakang

Proyek ini adalah implementasi demo interaktif dari konsep **Finite State Machine (FSM)** yang diaplikasikan pada sistem autentikasi (login). Sistem ini dibuat untuk keperluan **demonstrasi akademik**, menunjukkan bagaimana konsep FSM bekerja secara nyata dalam skenario sehari-hari.

### 1.2 Tujuan Proyek

- Mendemonstrasikan konsep FSM secara visual dan interaktif
- Mengimplementasikan sistem login yang merepresentasikan state machine secara nyata
- Menampilkan diagram FSM yang **highlight secara real-time** sesuai state user saat ini
- Memberikan tampilan modern dan profesional meski hanya menggunakan HTML/CSS/JS murni

### 1.3 Ruang Lingkup

| Dalam Scope | Luar Scope |
|---|---|
| Sistem login (email + password) | Registrasi akun baru |
| Lockout timer 30 detik setelah 3x gagal | Reset password via email |
| Diagram FSM interaktif | Backend/database nyata |
| Halaman Home setelah login | Fitur manajemen profil |
| Informasi akun yang terautentikasi | Multi-role / permission system |

---

## 2. Tech Stack

### 2.1 Core Technology

| Layer | Teknologi | Alasan |
|---|---|---|
| **Structure** | HTML5 | Ringan, cukup untuk demo, universal |
| **Styling** | CSS3 (custom, no framework) | Kontrol penuh atas desain modern |
| **Logic** | Vanilla JavaScript (ES6+) | Tanpa dependency, mudah dipahami |
| **Storage** | Hardcoded JS Object | Cukup untuk demo, tanpa backend |

### 2.2 Library Eksternal (CDN, opsional)

| Library | Versi | Fungsi |
|---|---|---|
| Google Fonts (Inter) | Latest | Tipografi modern |
| Lucide Icons (SVG inline) | Latest | Icon set ringan dan modern |

> **Catatan:** Tidak ada framework JS (React/Vue/Angular). Seluruh interaktivitas menggunakan DOM manipulation vanilla JS.

---

## 3. Arsitektur FSM

### 3.1 Definisi State

| State ID | Nama State | Deskripsi |
|---|---|---|
| `S0` | **IDLE** | User belum melakukan input apapun |
| `S1` | **VALIDATING** | Sistem sedang memproses input user |
| `S2` | **EMAIL_NOT_FOUND** | Email tidak terdaftar di sistem |
| `S3` | **WRONG_PASSWORD** | Email benar, password salah (attempt 1-2) |
| `S4` | **AUTHENTICATED** | Login berhasil, akses diberikan |
| `S5` | **LOCKED** | Gagal 3x berturut-turut, akun dikunci sementara |
| `S6` | **COOLDOWN** | Timer countdown 30 detik berjalan sebelum bisa coba lagi |

### 3.2 Tabel Transisi State

| State Asal | Input / Event | State Tujuan |
|---|---|---|
| `S0` (IDLE) | User submit form | `S1` (VALIDATING) |
| `S1` (VALIDATING) | Email tidak ditemukan | `S2` (EMAIL_NOT_FOUND) |
| `S1` (VALIDATING) | Email benar, password salah, attempt < 3 | `S3` (WRONG_PASSWORD) |
| `S1` (VALIDATING) | Email benar, password salah, attempt = 3 | `S5` (LOCKED) |
| `S1` (VALIDATING) | Email & password benar | `S4` (AUTHENTICATED) |
| `S2` (EMAIL_NOT_FOUND) | User edit input | `S0` (IDLE) |
| `S3` (WRONG_PASSWORD) | User submit lagi | `S1` (VALIDATING) |
| `S5` (LOCKED) | Otomatis | `S6` (COOLDOWN) |
| `S6` (COOLDOWN) | Timer 30 detik habis | `S0` (IDLE) |
| `S4` (AUTHENTICATED) | User klik logout | `S0` (IDLE) |

### 3.3 Diagram FSM (Visual Reference)

```
                    ┌─────────────────────────────────────────────────────┐
                    │                                                     │
           submit   ▼                                                     │
  [S0: IDLE] ──────► [S1: VALIDATING]                                    │
      ▲                     │                                             │
      │              ┌──────┴──────────────────────┐                     │
      │              │                             │                     │
      │     email    ▼          email ok,          ▼     email ok,       │
      │    not found [S2: EMAIL_NOT_FOUND]  wrong pw < 3  [S3: WRONG_PW] │
      │              │                             │                     │
      │   edit input │              submit again   │                     │
      └──────────────┘                             └──────► [S1] loop    │
      │                                                                  │
      │                    email ok, password ok                         │
      │◄──────────────────────────────────────── [S4: AUTHENTICATED]     │
      │                    logout                                        │
      │                                                                  │
      │              wrong pw = 3                                        │
      │           [S5: LOCKED] ──────► [S6: COOLDOWN] ──30s──────────────┘
```

---

## 4. Data & Akun Demo

### 4.1 Struktur Data Akun

```javascript
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
```

### 4.2 Skenario Test

| Skenario | Input | State yang Dicapai |
|---|---|---|
| Email tidak terdaftar | `unknown@mail.com` | `S2: EMAIL_NOT_FOUND` |
| Password salah (1x) | `budi@demo.com` / `salah123` | `S3: WRONG_PASSWORD` (attempt 1/3) |
| Password salah (3x) | `budi@demo.com` / `salah123` (3x) | `S5: LOCKED` → `S6: COOLDOWN` |
| Login berhasil | `budi@demo.com` / `Budi@2024` | `S4: AUTHENTICATED` |

---

## 5. Spesifikasi Fitur

### 5.1 Halaman Login

#### Form Input
- **Email field:** Input tipe `email`, dengan validasi format dasar
- **Password field:** Input tipe `password`, dengan toggle show/hide
- **Submit button:** Teks "Masuk", dengan loading state saat memproses
- **Attempt counter:** Badge kecil yang muncul setelah attempt pertama gagal, menunjukkan `1/3`, `2/3`

#### Pesan Error per State

| State | Pesan yang Ditampilkan |
|---|---|
| `S2` | "Email tidak ditemukan. Periksa kembali alamat email Anda." |
| `S3` | "Password salah. Sisa percobaan: X/3" |
| `S5` | "Akun dikunci sementara setelah 3x percobaan gagal." |
| `S6` | "Coba lagi dalam: **[countdown]** detik" |

#### Lockout Timer
- Durasi: **30 detik**
- Tampilan: Countdown timer visual (angka berjalan mundur)
- Setelah habis: Form kembali aktif, attempt counter direset ke 0
- State kembali ke: `S0: IDLE`

### 5.2 Halaman Home (Post-Login)

#### Konten Halaman
- **Header:** Greeting personal "Selamat datang, [Nama]!"
- **Kartu Profil:** Menampilkan informasi akun real
  - Nama lengkap
  - Email
  - Role
  - Avatar (inisial nama, berwarna)
  - Waktu login terakhir
- **Tombol Logout:** Mengembalikan ke state `S0: IDLE`

### 5.3 Diagram FSM Interaktif

#### Spesifikasi Visual
- Ditampilkan di **sisi kanan halaman login** (layout dua kolom pada desktop)
- Pada mobile: Diagram tampil di bawah form login
- Menggunakan **SVG inline** yang dirender via JavaScript

#### Interaktivitas
- Setiap **state node** (lingkaran) dapat di-highlight dengan warna berbeda
- Highlight berpindah secara **real-time** sesuai state FSM saat ini
- **Transisi/panah** juga ikut di-highlight untuk menunjukkan jalur yang sedang aktif
- Legenda state ditampilkan di bawah diagram

#### Warna State

| State | Warna Node |
|---|---|
| IDLE (default) | Abu-abu (#94A3B8) |
| VALIDATING | Biru (#3B82F6) |
| EMAIL_NOT_FOUND | Oranye (#F59E0B) |
| WRONG_PASSWORD | Merah muda (#EF4444) |
| AUTHENTICATED | Hijau (#10B981) |
| LOCKED | Merah (#DC2626) |
| COOLDOWN | Ungu (#8B5CF6) |
| State aktif saat ini | Glowing border + fill penuh |

---

## 6. Spesifikasi UI/UX

### 6.1 Design System

| Elemen | Nilai |
|---|---|
| **Font** | Inter (Google Fonts) |
| **Primary Color** | `#6366F1` (Indigo) |
| **Background** | `#0F172A` (Dark Navy) |
| **Surface** | `#1E293B` (Dark Slate) |
| **Border** | `#334155` |
| **Text Primary** | `#F1F5F9` |
| **Text Secondary** | `#94A3B8` |
| **Border Radius** | 12px (card), 8px (input), 6px (badge) |
| **Shadow** | `0 25px 50px rgba(0,0,0,0.4)` |

### 6.2 Layout

```
Desktop (≥ 768px):
┌────────────────────────────────────────────┐
│           Header / Logo                    │
├──────────────────┬─────────────────────────┤
│                  │                         │
│   Login Form     │   FSM Diagram           │
│   (40%)          │   Interaktif (60%)      │
│                  │                         │
└──────────────────┴─────────────────────────┘

Mobile (< 768px):
┌──────────────────┐
│  Header / Logo   │
├──────────────────┤
│  Login Form      │
├──────────────────┤
│  FSM Diagram     │
│  (scrollable)    │
└──────────────────┘
```

### 6.3 Animasi & Transisi

| Elemen | Animasi |
|---|---|
| Pesan error/sukses | Fade in dari bawah (200ms ease) |
| Highlight state FSM | Pulse/glow animation (0.5s) |
| Perpindahan halaman login → home | Fade + slide up (300ms) |
| Countdown timer | Flip/tick setiap detik |
| Loading saat submit | Spinner kecil di dalam button |

---

## 7. Struktur File

```
fsm-login-demo/
│
├── index.html          # Entry point utama (login page + FSM diagram)
├── home.html           # Halaman setelah login (post-auth)
│
├── css/
│   ├── style.css       # Global styles, design tokens, layout
│   ├── login.css       # Styles spesifik form login
│   ├── diagram.css     # Styles untuk FSM diagram
│   └── home.css        # Styles halaman home
│
├── js/
│   ├── fsm.js          # Core FSM logic (state machine engine)
│   ├── auth.js         # Autentikasi, validasi, attempt counter
│   ├── diagram.js      # Render & animasi SVG diagram FSM
│   ├── users.js        # Data akun hardcoded
│   └── main.js         # Entry point, event listeners, orchestration
│
└── README.md           # Petunjuk menjalankan proyek
```

---

## 8. Spesifikasi AI Skill

### 8.1 Overview

Dokumen ini juga berfungsi sebagai **AI Skill PRD** untuk mendefinisikan kapabilitas AI yang relevan dalam membantu pengembangan proyek ini.

### 8.2 Skill yang Relevan

#### Skill 1: `frontend-design`
- **Relevansi:** Tinggi
- **Fungsi:** Panduan desain visual modern, typography, color system, layout responsif
- **Digunakan saat:** Membangun tampilan CSS, mendesain komponen login form dan diagram

#### Skill 2: `fsm-diagram-generator` *(custom)*
- **Relevansi:** Tinggi
- **Fungsi:** Generate SVG/HTML untuk diagram FSM berdasarkan definisi state dan transisi
- **Input:** Array of states, array of transitions, current active state
- **Output:** SVG inline dengan highlight dinamis

#### Skill 3: `vanilla-js-component`
- **Relevansi:** Sedang-Tinggi
- **Fungsi:** Membantu menulis komponen JavaScript modular tanpa framework
- **Digunakan saat:** Membangun FSM engine, timer, form validation

### 8.3 AI Skill PRD: FSM Diagram Generator

```yaml
name: fsm-diagram-generator
version: 1.0.0
description: >
  Skill untuk menghasilkan visualisasi FSM interaktif dalam format SVG/HTML
  berdasarkan definisi state dan transisi yang diberikan.

input_schema:
  states:
    type: array
    items:
      id: string
      label: string
      color: string
      isInitial: boolean
      isFinal: boolean
  transitions:
    type: array
    items:
      from: string
      to: string
      label: string
  activeState:
    type: string
    description: ID state yang sedang aktif saat ini

output:
  type: svg_string
  description: SVG inline dengan node, panah, label, dan highlight aktif

constraints:
  - Node harus terbaca pada layar ≥ 320px
  - Highlight harus berjalan mulus (CSS transition)
  - Tidak boleh ada dependency eksternal (pure SVG + CSS)
  - Mendukung update activeState secara dinamis via JS
```

---

## 9. Edge Cases & Error Handling

| Skenario | Penanganan |
|---|---|
| User submit form kosong | Validasi HTML5 native (`required`), tidak trigger FSM |
| Format email tidak valid | Validasi HTML5 (`type="email"`), tampilkan hint |
| User refresh saat LOCKED | State direset ke IDLE (tidak persistent, ini demo) |
| User klik back dari Home | Redirect ke login, state IDLE |
| Spasi di awal/akhir email | Otomatis di-trim sebelum validasi (`email.trim()`) |
| Caps Lock password | Tidak ada deteksi khusus (intentional untuk kesederhanaan) |

---

## 10. Milestone & Deliverable

| Milestone | Deliverable | Estimasi |
|---|---|---|
| M1 | Struktur file, design system CSS, layout dasar | Hari 1 |
| M2 | FSM engine (fsm.js), data user, logika auth | Hari 1-2 |
| M3 | UI Form login + semua state error/sukses | Hari 2 |
| M4 | Diagram FSM SVG + highlight interaktif | Hari 2-3 |
| M5 | Halaman Home + informasi akun | Hari 3 |
| M6 | Animasi, polish UI, testing semua skenario | Hari 3-4 |

---

## 11. Catatan Tambahan & Saran Fitur (Q&A)

### Q: Mengapa timer 30 detik, bukan permanen?
**A:** Untuk demo akademik, timer lebih baik karena demonstrator bisa langsung menunjukkan state COOLDOWN → IDLE transition tanpa harus refresh halaman. Secara produksi, lockout permanen + notifikasi email lebih aman.

### Q: Apakah perlu menyimpan state di localStorage?
**A:** Tidak untuk demo ini. State reset saat refresh sudah cukup dan justru memudahkan reset antar sesi demo. Jika state persistent dibutuhkan di masa depan, tambahkan `sessionStorage` untuk attempt counter.

### 💡 Saran Fitur Tambahan (untuk dipertimbangkan)

| Fitur | Nilai Tambah | Prioritas |
|---|---|---|
| **"Cheat sheet" kredensial** | Tampilkan hint email/password valid di pojok halaman untuk memudahkan demo | Tinggi |
| **Reset Demo Button** | Tombol untuk mereset seluruh state FSM ke IDLE sekaligus | Tinggi |
| **State history log** | Panel kecil yang mencatat riwayat perpindahan state (S0 → S1 → S3 → ...) | Sedang |
| **Speed mode** | Toggle untuk mempercepat/memperlambat animasi transisi (berguna saat presentasi) | Sedang |
| **Dark/Light mode** | Toggle tema untuk fleksibilitas presentasi | Rendah |

---

*Dokumen ini adalah PRD hidup dan dapat diperbarui seiring perkembangan proyek.*
