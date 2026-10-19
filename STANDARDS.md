# 🛡️ PANDUAN STANDAR REKAYASA PERANGKAT LUNAK & ARSITEKTUR SISTEM
### *Engineering Manifesto, Architecture Standards, Security Protocols & Code Conventions*
**Author:** Ragada Rahmansyah  
**Role:** System Analyst | Data Analyst | Full-Stack Software Engineer  
**Version:** 1.0 (Production-Grade Standard)

---

## DAFTAR ISI
1. [Filosofi & Prinsip Dasar Rekayasa (Core Philosophy)](#1-filosofi--prinsip-dasar-rekayasa-core-philosophy)
2. [Standar Keamanan Mutlak (Zero-Leak Security Protocols)](#2-standar-keamanan-mutlak-zero-leak-security-protocols)
3. [Arsitektur Sistem & Pola Desain (System Architecture & Patterns)](#3-arsitektur-sistem--pola-desain-system-architecture--patterns)
4. [Pedoman Penulisan Kode (Clean Code & Style Conventions)](#4-pedoman-penulisan-kode-clean-code--style-conventions)
5. [Standar Basis Data & Integritas Transaksi (Database & Data Integrity)](#5-standar-basis-data--integritas-transaksi-database--data-integrity)
6. [Pedoman Analitik & Business Intelligence (Data Analytics Standards)](#6-pedoman-analitik--business-intelligence-data-analytics-standards)
7. [Protokol Pengembangan Berbantuan AI (AI-Augmented Engineering)](#7-protokol-pengembangan-berbantuan-ai-ai-augmented-engineering)
8. [DevOps, Kontainerisasi & Kontrol Versi (DevOps & Git Discipline)](#8-devops-kontainerisasi--kontrol-versi-devops--git-discipline)
9. [Daftar Periksa Kualitas Sebelum Produksi (Pre-Release QA Checklist)](#9-daftar-periksa-kualitas-sebelum-produksi-pre-release-qa-checklist)

---

## 1. FILOSOFI & PRINSIP DASAR REKAYASA (CORE PHILOSOPHY)

> *"Kode yang baik bukan hanya kode yang berjalan, melainkan kode yang memodelkan realitas bisnis secara akurat, aman dari celah, dan mudah dirawat oleh orang lain."*

### 1.1. Analisis Sistem Sebelum Menulis Kode (System Analysis First)
1. **Tidak Ada Fitur Tanpa Spesifikasi:** Sebelum baris kode pertama ditulis, pahami dan dokumentasikan alur bisnis, aktor, hak akses, serta batasan sistem dalam bentuk **BRD / SRS**, **User Flow**, dan **Wireframe**.
2. **Kesesuaian Domain Nyata:** Setiap variabel, relasi tabel, dan fungsi harus mencerminkan entitas dunia nyata secara intuitif (contoh: konversi kemasan multi-level grosir *Karton -> Bal -> Slop -> Pack*, penentuan termin piutang *TOP*, atau pencatatan jurnal berpasangan/akuntansi).

### 1.2. Sederhana, Modular & Teruji (Pragmatic Engineering)
* **KISS (Keep It Simple, Stupid):** Hindari over-engineering atau abstraksi prematur.
* **YAGNI (You Aren't Gonna Need It):** Jangan membuat fitur spekulatif yang belum menjadi kebutuhan bisnis saat ini.
* **DRY (Don't Repeat Yourself):** Ekstraksi logika yang berulang ke dalam helper/service, namun prioritaskan keterbacaan kode (*clarity over cleverness*).
* **Single Responsibility Principle (SRP):** Satu modul/kelas/fungsi hanya boleh memiliki satu alasan untuk berubah.

---

## 2. STANDAR KEAMANAN MUTLAK (ZERO-LEAK SECURITY PROTOCOLS)

Keamanan bukan fitur tambahan di akhir proyek, melainkan fondasi awal sejak arsitektur pertama dirancang.

```
┌────────────────────────────────────────────────────────┐
│               ZERO-LEAK SECURITY PYRAMID               │
├────────────────────────────────────────────────────────┤
│  Layer 4: Runtime Container Hardening & Resource Limit │
│  Layer 3: Network Isolation (Zero Public DB Exposure)  │
│  Layer 2: Auth, RBAC & Parameterized Input Validation  │
│  Layer 1: Strict Secrets Management (No .env in Git)   │
└────────────────────────────────────────────────────────┘
```

### 2.1. Manajemen Secrets & Zero Environment Leak
* **Pantangan Keras:** **DILARANG KERAS** melakukan commit file `.env`, API keys, password database, private keys, atau token ke dalam Git repository.
* **Prosedur Wajib:**
  1. File `.env` wajib selalu didaftarkan di dalam `.gitignore`.
  2. Sediakan selalu file template `.env.example` yang berisi daftar variabel konfigurasi dengan nilai dummy/kosong tanpa kredensial sensitif.
  3. Lakukan audit otomatis dengan tool scan secrets (`git-secrets`, `trufflehog`) sebelum push ke remote repository.

### 2.2. Autentikasi, Password Hashing & Sesi
* **Password Hashing:** Wajib menggunakan algoritma kriptografi yang lambat dan tahan terhadap serangan brute-force: **Bcrypt** (work factor minimal 10-12) atau **Argon2id**. Jangan pernah menggunakan MD5, SHA-1, atau SHA-256 polos tanpa salt untuk password.
* **Token Autentikasi (JWT / Sanctum):**
  - Token harus memiliki masa berlaku (*expiry time*) yang wajar.
  - Gunakan algoritma signature yang kuat (contoh: `HS256` dengan secret minimal 256-bit atau `RS256`).
  - Jangan menyimpan data sensitif (password, PIN, info kartu) di dalam payload JWT.
* **Role-Based Access Control (RBAC):** Setiap endpoint dan aksi wajib divalidasi otorisasinya berdasarkan role/izin pengguna (*Admin, Supervisor, Kasir, Field Sales, Viewer*).

### 2.3. Pencegahan Celah Web OWASP Top 10
* **SQL Injection (SQLi):**
  - **Aturan Mutlak:** Selalu gunakan **Parameterized Queries** atau **ORM Terpercaya** (SQLAlchemy, Eloquent).
  - Dilarang keras menggabungkan string (*raw string concatenation*) secara langsung ke dalam query database.
* **Cross-Site Scripting (XSS):**
  - Selalu lakukan escaping pada output data yang dikirim ke antarmuka pengguna.
  - Manfaatkan sanitasi bawaan framework (React JSX auto-escaping, Blade `{{ }}`).
* **Cross-Site Request Forgery (CSRF):**
  - Aktifkan perlindungan token CSRF untuk seluruh endpoint yang melakukan mutasi data (`POST`, `PUT`, `DELETE`).
  - Gunakan atribut cookie `SameSite=Strict` atau `SameSite=Lax` dengan flag `HttpOnly` dan `Secure`.
* **Broken Object Level Authorization (BOLA / IDOR):**
  - Jangan hanya memvalidasi `WHERE id = :id`.
  - Selalu validasi kepemilikan tenant/user: `WHERE id = :id AND tenant_id = :current_tenant_id` atau `user_id = :current_user_id`.

---

## 3. ARSITEKTUR SISTEM & POLA DESAIN (SYSTEM ARCHITECTURE & PATTERNS)

### 3.1. Pola Clean Architecture / Layered Separation
Struktur kode aplikasi harus memisahkan tanggung jawab secara tegas ke dalam 4 lapisan:

```
[ HTTP / Presentation Layer ]   --> Router / Controller / Endpoints
             │
             ▼
[ Business / Domain Logic ]     --> Service Layer / Use Cases / Rules
             │
             ▼
[ Data Access / Persistence ]   --> Repository / Eloquent / SQLAlchemy Models
             │
             ▼
[ Infrastructure & DB ]         --> PostgreSQL / MySQL / Redis / External APIs
```

1. **Controller / Router:** Hanya bertugas memvalidasi request HTTP, meneruskan data ke Service Layer, dan mengembalikan response JSON/View. Tidak boleh ada logika bisnis kalkulasi uang/stok di controller!
2. **Service Layer:** Tempat seluruh aturan bisnis diimplementasikan (misal: kalkulasi cicilan layaway, konversi satuan bal ke pack, atau pemotongan stok otomatis).
3. **Repository / Model Layer:** Bertanggung jawab murni untuk komunikasi query dengan database.

### 3.2. Pola Multi-Tenant & Isolasi Data
* Untuk aplikasi SaaS, isolasi data antar organisasi/perusahaan adalah harga mati.
* Setiap tabel data transaksi wajib memiliki kolom foreign key `tenant_id` terindeks.
* Gunakan global scope query (pada Eloquent atau SQLAlchemy) untuk menjamin data tenant A tidak akan pernah bocor ke tenant B (*Zero Cross-Tenant Leak*).

### 3.3. Pola Immutable Audit Ledger (Buku Besar Mutasi Abadi)
* Khusus data transaksi finansial, persediaan barang, dan mutasi saldo, **JANGAN PERNAH** hanya meng-update kolom angka secara langsung (misal: `UPDATE products SET stock = stock - 5`).
* **Wajib Gunakan Ledger Pattern:**
  - Setiap perubahan saldo/stok dicatat sebagai baris mutasi baru (*ledger entry*) yang bersifat *append-only* (hanya boleh ditambah, tidak boleh diedit/dihapus).
  - Catat timestamp, ID referensi transaksi, tipe mutasi (debet/kredit atau masuk/keluar), saldo sebelum, dan saldo sesudah.
  - Menjamin integritas audit finansial dan memudahkan pelacakan jika terjadi selisih stok.

---

## 4. PEDOMAN PENULISAN KODE (CLEAN CODE & STYLE CONVENTIONS)

### 4.1. Konvensi Bahasa & Penamaan (Naming Conventions)

| Bahasa / Komponen | Variabel & Fungsi | Kelas / Komponen | File / Folder | Konstanta |
|:---|:---|:---|:---|:---|
| **Python (FastAPI)** | `snake_case` | `PascalCase` | `snake_case.py` | `UPPER_SNAKE_CASE` |
| **PHP (Laravel)** | `camelCase` | `PascalCase` | `PascalCase.php` | `UPPER_SNAKE_CASE` |
| **JavaScript / React** | `camelCase` | `PascalCase.jsx` | `kebab-case` / `PascalCase` | `UPPER_SNAKE_CASE` |
| **SQL Database** | `snake_case` | `snake_case` (tabel jamak) | `snake_case.sql` | `UPPERCASE (Keywords)` |

### 4.2. Prinsip Penamaan yang Deskriptif
* Nama fungsi harus berupa **kata kerja + objek**:
  - ✅ `calculate_installments_schedule()`, `getUserByEmail()`, `verify_stock_availability()`
  - ❌ `data()`, `process()`, `calc()`, `doThings()`
* Nama variabel boolean harus mencerminkan pertanyaan ya/tidak:
  - ✅ `is_active`, `has_settled`, `can_edit_invoice`
  - ❌ `active_flag`, `status_check`, `valid`

### 4.3. Penanganan Error & Defensive Programming
1. **Tidak Ada Silent Failures:** Jangan pernah membuat blok `try-catch` kosong yang menelan error tanpa logging!
   ```python
   # ❌ BURUK
   try:
       save_transaction(data)
   except:
       pass

   # ✅ BENAR
   try:
       save_transaction(data)
   except DatabaseIntegrityError as err:
       logger.error(f"Gagal mencatat transaksi: {err}", exc_info=True)
       raise HTTPException(status_code=500, detail="Gagal menyimpan transaksi keuangan.")
   ```
2. **Validasi Input di Pintu Masuk:**
   - Gunakan schema validator ketat seperti **Pydantic** di FastAPI atau **Form Request Validation** di Laravel.
   - Tolak input yang tidak sesuai tipe data sebelum mencapai lapisan logika bisnis.

### 4.4. Struktur Response API Standar (RESTful Standard)
Seluruh endpoint API harus mengembalikan format respons JSON yang konsisten:

```json
// Respons Berhasil (Success)
{
  "success": true,
  "message": "Transaksi berhasil diverifikasi.",
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-13T04:59:00Z",
    "version": "1.0"
  }
}

// Respons Gagal (Error)
{
  "success": false,
  "message": "Validasi gagal: Stok tidak mencukupi.",
  "errors": [
    {
      "field": "quantity",
      "detail": "Kuantitas permintaan (10) melebihi stok tersedia (4)."
    }
  ]
}
```

---

## 5. STANDAR BASIS DATA & INTEGRITAS TRANSAKSI (DATABASE & DATA INTEGRITY)

### 5.1. Integritas Relasional
1. **Foreign Keys Wajib Diaktifkan:** Setiap hubungan antar tabel harus dideklarasikan secara eksplisit dengan relasi Foreign Key untuk mencegah timbulnya *orphan records*.
2. **Aturan On Delete:**
   - Gunakan `ON DELETE RESTRICT` untuk entitas finansial/master (misal: dilarang menghapus akun nasabah jika masih memiliki riwayat transaksi/piutang).
   - Gunakan `ON DELETE CASCADE` hanya untuk relasi data induk-detail murni (misal: baris item pesanan pada satu faktur).
   - Gunakan `Soft Deletes` (`deleted_at`) untuk data operasional penting sehingga riwayat audit tetap dapat direkonstruksi.

### 5.2. Manajemen Transaksi Database (ACID Compliance)
* Untuk setiap operasi yang melibatkan lebih dari satu mutasi tabel yang saling bergantung (contoh: pembuatan invoice + pemotongan stok + penambahan jurnal piutang), **WAJIB** dibungkus dalam blok **Database Transaction**:
  ```php
  // Contoh di Laravel
  DB::transaction(function () use ($orderData) {
      $order = Order::create($orderData);
      $this->deductInventoryStock($order);
      $this->recordAccountsReceivableLedger($order);
  });
  ```
* Jika terjadi satu kegagalan di tengah jalan, seluruh operasi harus di-*rollback* seketika untuk mencegah data tidak seimbang (*inconsistent state*).

### 5.3. Disiplin Migrasi & Seeder
* Seluruh perubahan struktur tabel harus dilakukan melalui **Migration Scripts** (`php artisan make:migration` atau Alembic).
* **Dilarang keras** mengedit tabel langsung di database produksi secara manual tanpa berkas migrasi yang terdokumentasi di repositori.

---

## 6. PEDOMAN ANALITIK & BUSINESS INTELLIGENCE (DATA ANALYTICS STANDARDS)

### 6.1. Pemodelan Data Analitik (OLAP Star-Schema)
* Pisahkan tabel analitik menjadi **Fact Tables** (tabel transaksi berbobot numerik: jumlah penjualan, margin laba, waktu) dan **Dimension Tables** (dimensi deskriptif: pelanggan, produk, cabang, tanggal).
* Hindari relasi *Many-to-Many* langsung pada dashboard Power BI; gunakan *Bridge Table* jika diperlukan untuk menjaga akurasi kalkulasi.

### 6.2. Aturan Penulisan Formula DAX (Power BI)
1. **Explicit Measures:** Selalu buat ukuran eksplisit (*Explicit Measures*) menggunakan DAX, hindari menggunakan kolom agregasi implisit otomatis dari Power BI.
2. **Format Penamaan Measure:**
   - Gunakan format nama yang jelas: `[Total Sales Amount]`, `[YoY Sales Growth %]`, `[Inventory Turnover Ratio]`.
3. **Optimasi Performa:**
   - Manfaatkan fungsi `DIVIDE(numerator, denominator, alternative_result)` alih-alih operator pembagi biasa `/` untuk mencegah error pembagian nol (*divide-by-zero*).

---

## 7. PROTOKOL PENGEMBANGAN BERBANTUAN AI (AI-AUGMENTED ENGINEERING)

Sebagai engineer modern yang mahir memanfaatkan Autonomous Coding Agents (Google Antigravity, Cursor, LLMs), terapkan aturan disiplin berikut:

```
[ Spesifikasi & Aturan Bisnis ]  ──> Dibuat oleh Manusia (System Analyst)
               │
               ▼
[ Akselerasi Prototyping AI ]   ──> Dikerjakan oleh Coding Agent
               │
               ▼
[ Verifikasi & Audit Keamanan ]  ──> Diverifikasi Kritis oleh Manusia
```

### 7.1. Aturan Penggunaan Coding Agent
1. **Spec-Driven Prompts:** Berikan AI instruksi berbasis spesifikasi fungsional (input, proses, output, skema database, skenario *edge case*) bukan instruksi umum yang kabur.
2. **Verifikasi Kritis (Human-in-the-Loop):** Jangan pernah menerima kode yang digenerate oleh AI tanpa membaca, memahami, dan memverifikasi alur logikanya secara manual.
3. **Audit Dependensi yang Dihasilkan AI:** Pastikan AI tidak menyarankan pustaka fiktif (*hallucinated packages*) atau dependensi yang telah usang/memiliki celah keamanan.
4. **AI sebagai Simulator Edge-Case:** Gunakan kemampuan agent untuk membuat skenario uji ekstrim (misal: simulasi transaksi jutaan baris data, pengujian input karakter tak lazim, atau verifikasi *race condition*).
5. **Protokol Pra-Eksekusi Wajib (Pre-Execution Explanation / PRD):** Sebelum mengeksekusi kode apa pun atau meminta persetujuan untuk eksekusi, Coding Agent **wajib** menjelaskan rencana teknisnya secara transparan:
   - Menggunakan **teks biasa** untuk perubahan ringkas (tujuan, komponen terdampak, alur logika, dan action plan).
   - Menggunakan **dokumen PRD / Spesifikasi Teknis** untuk fitur arsitektur besar (alur bisnis, skema data, mitigasi keamanan, penanganan edge cases, dan tahapan rilis).

---

## 8. DEVOPS, KONTAINERISASI & KONTROL VERSI (DEVOPS & GIT DISCIPLINE)

### 8.1. Pengerasan Kontainer Docker (Hardened Docker Containers)
* **Keamanan Kontainer:**
  - Aktifkan `security_opt: ["no-new-privileges:true"]` pada `docker-compose.yml` untuk mencegah eskalasi hak akses sistem operasi host.
  - Hindari menjalankan aplikasi menggunakan akun `root` di dalam kontainer; buat user non-root khusus aplikasi.
* **Isolasi Jaringan (Zero Public Port Exposure):**
  - Database (PostgreSQL/MySQL) dan Cache (Redis) **DILARANG** dipetakan ke port publik host (`ports: - "5432:5432"`) pada lingkungan produksi.
  - Gunakan `expose: ["5432"]` agar port hanya dapat diakses di dalam internal bridge network Docker oleh backend.
* **Resource Quota:** Selalu deklarasikan batas penggunaan CPU dan Memory (`limits.memory`, `limits.cpus`) agar satu container tidak mematikan server secara keseluruhan jika terjadi memory leak.

### 8.2. Standar Pesan Commit Git (Conventional Commits)
Gunakan format commit standar yang mencerminkan aksi secara presisi:

* `feat: tambah modul rekonsiliasi kas harian pada sistem akunting`
* `fix: perbaiki kalkulasi konversi bal ke slop pada modul supply chain`
* `sec: tambahkan enkripsi bcrypt dan isolasi tenant scope`
* `refactor: pisahkan logika kalkulasi piutang ke Service Layer`
* `docs: perbarui spesifikasi fungsional SRS pada dokumentasi API`
* `test: tambahkan unit test untuk pengujian edge-case stok minus`

---

## 9. DAFTAR PERIKSA KUALITAS SEBELUM PRODUKSI (PRE-RELEASE QA CHECKLIST)

Sebelum merilis fitur atau mempublikasikan kode ke lingkungan staging/produksi, lakukan verifikasi mandiri berikut:

### 🔒 Keamanan (Security Audit)
- [ ] Tidak ada file `.env`, password, atau API key yang masuk ke riwayat commit Git.
- [ ] Seluruh password pengguna telah di-hash menggunakan Bcrypt/Argon2id.
- [ ] Seluruh query database bebas dari string concatenation (100% ORM / Parameterized).
- [ ] Endpoint yang sensitif telah diproteksi dengan otorisasi RBAC dan validasi kepemilikan tenant.
- [ ] Port database dan Redis terisolasi dari akses publik.

### 🏛️ Arsitektur & Logika (Architecture Audit)
- [ ] Logika bisnis berada di Service Layer, bukan menumpuk di Controller.
- [ ] Mutasi saldo/stok menggunakan Ledger Pattern yang bersifat *append-only*.
- [ ] Transaksi multi-tabel dibungkus di dalam blok Database Transaction ACID.
- [ ] Skema database memiliki foreign keys dan indeks yang sesuai.

### 🧪 Kualitas & Kestabilan (Quality Audit)
- [ ] Input request telah divalidasi dengan skema ketat (Pydantic / Form Request).
- [ ] Tidak ada blok `try-catch` kosong (*silent failure*).
- [ ] Seluruh pesan error pengguna informatif tanpa mengekspos stack trace sensitif database.
- [ ] Kode telah melalui pengujian skenario fungsional dan *edge cases*.

---

*Dokumen ini merupakan panduan standar resmi yang mengikat seluruh alur kerja perancangan, pengembangan, dan pemeliharaan sistem perangkat lunak yang saya bangun.*
