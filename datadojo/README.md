# 🥋 DataDojo — Platform Latihan Interview & Live Coding Data Analyst

**DataDojo** adalah platform e-learning interaktif modern bergaya *gamified bootcamp* (seperti LeetCode + Duolingo + Vercel vibe) yang dirancang khusus untuk calon **Data Analyst**. Seluruh live coding (SQL & Python) dan kuis (Power BI & interview) berjalan **100% di browser tanpa perlu install database atau backend server**.

---

## 🚀 Fitur Unggulan

### 1. 🗄️ SQL Lab (Live Coding di Browser)
* Ditenagai oleh **SQLite WebAssembly (`sql.js`)** langsung di browser.
* Database nyata (e-commerce & HR analytics) dengan relasi multi-tabel: `customers`, `products`, `orders`, `order_items`, dan `employees`.
* **Sistem Auto-Grader Real-time**: Membandingkan hasil query kamu dengan solusi referensi (jumlah kolom, baris, nilai, toleransi numerik, dan pengurutan).
* Materi mencakup:
  * Filtering (`WHERE`, `ORDER BY`)
  * Agregasi (`COUNT`, `SUM`, `AVG`, `GROUP BY`, `HAVING`)
  * Multi-table JOIN (`INNER JOIN`, `LEFT JOIN` anti-pattern)
  * Window Functions (`ROW_NUMBER`, `DENSE_RANK`, `LAG`, `SUM OVER`)
  * Date Manipulation (`strftime`, Year-over-Year, Month-over-Month)
  * Common Table Expressions (CTE) & Subquery
  * Pertanyaan legendaris interview: *Second Highest Salary*, *Top 3 Products per Category*, dsb.

### 2. 🐍 Python Lab (pandas & Data Cleaning)
* Ditenagai oleh **Pyodide (Python 3.11 + pandas + numpy)** yang berjalan via WebAssembly.
* Dataset terpasang (`df` transaksi, `df_raw` kotor dengan missing value & duplicate, `customers` segmen).
* Soal live coding meliputi:
  * Manipulasi DataFrame & pembuatan kolom kalkulasi (`revenue`)
  * Boolean indexing & filtering multi-kondisi
  * Data cleaning: imputasi median (`fillna`) & penanganan missing value (`dropna`)
  * Deduplikasi data transaksi (`drop_duplicates`)
  * Agregasi waktu (`.dt.strftime`, `.dt.to_period`)
  * Pembuatan Pivot Table multi-dimensi (`pivot_table`)
  * Algoritma & logic test Python murni untuk interview teknis

### 3. 📊 Power BI & DAX Quiz Arena
* Kuis interaktif dengan bank soal konseptual dan kode DAX:
  * Perbedaan mendasar *Measure* vs *Calculated Column*
  * Fungsi inti *Filter Context* & *Context Transition* (`CALCULATE`, `ALL`, `DIVIDE`, `SUMX`)
  * Data Modeling *Star Schema* (*Fact* vs *Dimension*, kardinalitas 1-to-many, bahaya *bi-directional relationship*)
  * Row-Level Security (RLS), DirectQuery vs Import, Time Intelligence
  * Cheat Sheet DAX & Star Schema siap salin di panel samping

### 4. 🎤 Flashcard Interview & Behavioral (STAR Method)
* Dek flashcard pertanyaan teknis, konsep statistik, dan pertanyaan manajerial:
  * Penjelasan *p-value*, *A/B Testing*, *Sample Ratio Mismatch*, dan *Outlier detection*
  * Pertanyaan behavioral dengan framework **STAR (Situation, Task, Action, Result)**: *Tell me about yourself*, *Handling difficult stakeholders*, *Data discrepancy issue*
  * Investigasi business case e-commerce & penurunan metrik (*Root Cause Analysis*)
  * Mode flip kartu interaktif & area draft catatan jawaban pribadi yang tersimpan otomatis

### 5. ⏱️ Timed Mock Interview
* Simulasi interview bertekanan tinggi: **10 soal acak**, **45 detik per soal** dengan *countdown progress bar*.
* Review komprehensif jawaban benar vs jawaban kamu setelah sesi berakhir.
* Dapatkan badge **Mock Ace 🏅** jika mencapai skor minimal 80%!

### 6. 🎮 Sistem Gamifikasi Penuh (Duolingo Style)
* **XP (Experience Points)**: Didapat dari menyelesaikan live coding, kuis, dan flashcard.
* **Level Progression**: Dari *Data Intern* (Lv. 1) hingga *Data Wizard* (Lv. 6).
* **Daily Challenge & Streak Flame (🔥)**: Bonus XP harian dengan timer countdown menuju tengah malam.
* **12 Unlockable Badges**: *First Blood*, *SQL Master*, *Pandas Master*, *Power BI Pro*, *On Fire*, dll.
* **Activity Heatmap**: Grafik kontribusi belajar bergaya GitHub di halaman profil.
* **Simulated Leaderboard**: Liga mingguan untuk memotivasi latihan harian.

---

## 💻 Cara Menjalankan Proyek

Platform ini adalah **Single Page Application (SPA)** murni tanpa perlu langkah `npm build` atau konfigurasi server rumit.

### Opsi 1: Menggunakan Python HTTP Server (Paling Cepat)
Buka terminal di folder proyek (`quirky-hertz/datadojo`) dan jalankan:
```bash
python -m http.server 8080
```
Lalu buka browser di:
```
http://localhost:8080
```

### Opsi 2: Menggunakan Node.js `npx serve`
```bash
npx serve .
```

### Opsi 3: Menggunakan VS Code Live Server
Cukup klik kanan pada file `index.html` lalu pilih **"Open with Live Server"**.

---

## 📂 Struktur Berkas

```
datadojo/
├── index.html                   # Entry point aplikasi & struktur navigasi SPA
├── README.md                    # Dokumentasi lengkap platform
├── css/
│   └── style.css                # Desain UI modern dark mode, responsive & gamified
└── js/
    ├── app.js                   # Main application router & view renderer
    ├── state.js                 # State management (XP, streak, badge, localStorage)
    ├── ui.js                    # UI toolkit (escapers, modal, toast, confetti, ring)
    ├── engines/
    │   ├── sql-engine.js        # Engine SQLite WebAssembly (sql.js) & auto-grader
    │   └── python-engine.js     # Engine Pyodide (Python 3 + pandas) & auto-grader
    └── data/
        ├── sql-challenges.js    # Bank soal SQL 15 tantangan (Easy - Hard)
        ├── python-challenges.js # Bank soal Python 12 tantangan (Easy - Hard)
        ├── quiz-bank.js         # Bank soal pilihan ganda Power BI, DAX & Statistik
        └── interview-cards.js   # 20 flashcard pertanyaan interview (Technical & STAR)
```

---

*Dibuat untuk melatih ketangkasan berpikir, kerapian query, dan kesiapan mental menghadapi interview kerja Data Analyst nyata.* 🚀
