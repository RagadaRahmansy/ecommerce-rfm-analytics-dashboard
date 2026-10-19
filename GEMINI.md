# AGENT INSTRUCTIONS & GLOBAL WORKSPACE RULES
**Author:** Ragada Rahmansyah  
**Role:** System Analyst | Data Analyst | Full-Stack Software Engineer  
**Scope:** Universal across all projects and sub-directories in this workspace.

---

## 🚨 PROTOKOL PRA-EKSEKUSI MUTLAK (MANDATORY PRE-EXECUTION SPECIFICATION)

Sebelum melakukan eksekusi apa pun (menulis kode, memodifikasi file, menjalankan command yang mengubah state sistem) ATAU sebelum meminta persetujuan eksekusi, Agent **WAJIB** menjelaskan terlebih dahulu rencana teknis yang akan dibuat:

1. **Untuk Perubahan Ringkas / Moderat (Penjelasan Teks Biasa):**
   - **Tujuan & Masalah:** Apa yang hendak diselesaikan dan dasar alasannya.
   - **Komponen Terdampak:** File, router, service, model, atau modul mana saja yang akan dibuat atau diubah.
   - **Alur Teknis & Logika:** Gambaran alur data (input -> validasi -> business logic -> database/ledger).
   - **Action Plan:** Langkah-langkah eksekusi yang akan dijalankan setelah disetujui.

2. **Untuk Fitur Baru / Perubahan Arsitektur Kompleks (Dokumen PRD / Spesifikasi Teknis):**
   - **Business Requirements & User Flow:** Aktor, alur proses, dan aturan bisnis.
   - **Skema Data & Validasi:** Schema Pydantic, Model ORM, dan DDL relasional.
   - **Keamanan & Otorisasi:** RBAC, isolasi multi-tenant (`tenant_id`), dan pencegahan OWASP Top 10.
   - **Edge Cases & Error Handling:** Antisipasi kegagalan sistem, race condition, dan integritas data.
   - **Tahapan Implementasi:** Rencana rilis per fase.

---

## 🛡️ STANDAR REKAYASA & KODING (ENGINEERING STANDARDS)
Agent wajib selalu mematuhi seluruh panduan yang tertulis di [STANDARDS.md](./STANDARDS.md):
- **Clean Architecture:** Pisahkan Controller/Router, Service Layer (logika bisnis), dan Repository/Model.
- **Zero-Leak Security:** Tidak ada commit file `.env` atau hardcoded secrets. Password wajib Bcrypt/Argon2id. Seluruh query wajib parameterized/ORM.
- **Append-Only Ledger Pattern:** Mutasi finansial dan stok barang dilarang direct UPDATE; wajib mencatat baris mutasi baru (ledger).
- **ACID Transactions:** Mutasi multi-tabel wajib dibungkus dalam Database Transaction.
- **Clean Code & Defensive Programming:** Tidak ada silent failure (`try-except: pass`). Input divalidasi ketat dengan schema validator (Pydantic / Request Validation).
- **Conventional Commits:** Gunakan standar prefix `feat:`, `fix:`, `sec:`, `refactor:`, `docs:`, `test:`.
