# Aura Botanicals — D2C End-to-End Analytics & Engineering Portal

Proyek portofolio & modul pembelajaran **Senior Data Analyst (5+ Tahun Pengalaman)** yang mendemonstrasikan pembangunan *Data Warehouse* dan *Analytics Pipeline* dari nol menggunakan **Python + DuckDB + Kimball SQL Modeling + React Interactive Portal**.

## 🏗️ Struktur Proyek
```text
aura_d2c_analytics/
├── data/
│   ├── raw/                        # CSV Sumber (customers, orders, order_items, ad_spend)
│   └── warehouse/                  # Database OLAP Kolumnar (aura_analytics.duckdb)
├── src/
│   ├── 01_data_generator.py        # Langkah 1: Generator data D2C dengan anomali nyata
│   ├── 02_ingestion.py             # Langkah 2: Idempotent ELT Ingestion ke DuckDB
│   ├── sql/
│   │   ├── 01_staging.sql          # Langkah 3A: Deduplikasi & Normalisasi (Silver)
│   │   ├── 02_dimensions.sql       # Langkah 3B: Tabel Dimensi (dim_customers, dim_products)
│   │   ├── 03_facts.sql            # Langkah 3C: Tabel Fakta Unit Economics (fct_orders)
│   │   └── 04_marts.sql            # Langkah 3D: Tabel Mart Eksekutif, Cohort & RFM (Gold)
│   └── 03_analytics_deepdive.py    # Langkah 4: Eksekutor SQL, Data Quality Gate & JSON Exporter
└── frontend/                       # Aplikasi Web Interaktif (React + Vite + Tailwind + Recharts)
    └── src/
        ├── pages/
        │   ├── Page0Overview.jsx        # Halaman 0: Ringkasan Masalah Bisnis & Arsitektur
        │   ├── Page1DataDesign.jsx      # Halaman 1: Desain Skema, ERD, Anomali & Kode Python
        │   ├── Page2Ingestion.jsx       # Halaman 2: Arsitektur ELT DuckDB, Idempotency & Audit Log
        │   ├── Page3DataModeling.jsx    # Halaman 3: Medallion Architecture & 4 Query SQL Lengkap
        │   ├── Page4AnalyticsMethod.jsx # Halaman 4: Metodologi Cohort, LTV:CAC & Segmentasi RFM
        │   └── Page5Dashboard.jsx       # Halaman 5: Interactive Executive BI Dashboard & CEO Memo
        └── data/analytics_payload.json  # Data hasil olahan DuckDB Warehouse
```

## 🚀 Cara Menjalankan Pipeline & Portal Web

### 1. Menjalankan Ulang Pipeline Data (Python + DuckDB)
```bash
cd aura_d2c_analytics
python src/01_data_generator.py
python src/02_ingestion.py
python src/03_analytics_deepdive.py
```

### 2. Menjalankan Aplikasi Web Interaktif (React + Vite)
```bash
cd aura_d2c_analytics/frontend
npm install
npm run dev
```
