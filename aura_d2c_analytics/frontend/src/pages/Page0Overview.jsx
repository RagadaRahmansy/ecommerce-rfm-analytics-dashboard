import React from 'react';

export default function Page0Overview({ onNavigate }) {
  const chapters = [
    {
      id: 'step1',
      num: 'SECTION 01',
      title: 'Relational Schema Design, Grain Definition & Anomaly Injection',
      scope: 'src/01_data_generator.py — 4 CSV Sources (8,249 Total Rows)',
      desc: 'Memetakan perbedaan granularitas antara transaksi order, SKU line-items, atribusi pelanggan, serta biaya iklan harian. Menyisipkan anomali dunia nyata: komisi marketplace (8–10%), diskon flash sale (20–35%), retur COD, dan 15 duplikasi webhook.',
    },
    {
      id: 'step2',
      num: 'SECTION 02',
      title: 'Idempotent ELT Pipeline & DuckDB Columnar Storage',
      scope: 'src/02_ingestion.py — raw_bronze.* & _pipeline_audit_log',
      desc: 'Membangun proses ekstraksi dan pemuatan (Extract & Load) ke dalam engine OLAP kolumnar DuckDB. Menerapkan prinsip Idempotency (full-refresh partition), metadata lineage (_ingested_at, _batch_run_id), serta pengujian kualitas data otomatis.',
    },
    {
      id: 'step3',
      num: 'SECTION 03',
      title: 'Kimball Dimensional Modeling & Medallion SQL Architecture',
      scope: 'src/sql/01_staging.sql .. 04_marts.sql — Silver & Gold Layers',
      desc: 'Menyusun arsitektur transformasi bertingkat menggunakan CTE, Window Functions (ROW_NUMBER), pencegahan Fan-Out Join pada perhitungan HPP (COGS), hingga membentuk tabel fakta mart_gold.fct_orders dan mart_channel_unit_economics.',
    },
    {
      id: 'step4',
      num: 'SECTION 04',
      title: 'Analytical Methodologies: Cohort Retention, LTV:CAC & RFM',
      scope: 'src/03_analytics_deepdive.py — Longitudinal & Behavioral Matrices',
      desc: 'Membedah formulasi matematis dan tabel hasil untuk matriks Cohort Retention (M0–M5), evaluasi rasio LTV terhadap CAC berbasis Contribution Margin, serta segmentasi pelanggan RFM untuk eksekusi CRM.',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Editorial Title Block */}
      <section className="border-b-2 border-[#141413] pb-8 space-y-4">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#991B1B] font-bold">
          SECTION 00 // RINGKASAN EKSEKUTIF &amp; ARSITEKTUR DATA
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#141413] leading-[1.12] tracking-tight max-w-4xl">
          Ekatunggal Group: Evaluasi Laba-Rugi dan Rantai Pasok Bahan Baku Kasur &amp; Sofa.
        </h1>
        <p className="text-base md:text-lg text-[#3D3C3A] max-w-3xl leading-relaxed">
          Laporan terpadu kinerja distribusi material <strong>PT Ekatunggal Tunas Mandiri</strong> selama semester pertama 2026.
          Mengintegrasikan data transaksi order, ongkos kirim kargo antarpulau, dan struktur HPP pabrik untuk mengidentifikasi
          sumber kebocoran profitabilitas antara Gudang Pusat (Citeureup), Cabang Jawa, dan Cabang Luar Pulau.
        </p>

        <div className="pt-3 flex flex-wrap gap-3 font-mono text-xs">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 bg-[#141413] text-[#FAF9F5] hover:bg-[#333330] font-semibold uppercase tracking-wider transition"
          >
            [05] BUKA LAPORAN LABA-RUGI (P&amp;L) →
          </button>
          <button
            onClick={() => onNavigate('step1')}
            className="px-5 py-2.5 bg-white text-[#141413] border border-[#141413] hover:bg-[#F2F0E8] font-semibold uppercase tracking-wider transition"
          >
            [01] LIHAT STRUKTUR DATA &amp; SKEMA →
          </button>
        </div>
      </section>

      {/* Two-Column Case Study Diagnosis */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border border-[#141413] bg-white divide-y lg:divide-y-0 lg:divide-x divide-[#141413]">
        <div className="lg:col-span-6 p-6 md:p-8 space-y-4">
          <div className="flex items-baseline justify-between border-b border-[#D8D6CE] pb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#991B1B]">
              LATAR BELAKANG MASALAH
            </span>
            <span className="font-mono text-[11px] text-[#6E6D68]">OPERASIONAL DISTRIBUSI</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#141413]">
            Volume Pengiriman Tinggi, Namun Margin Bersih Tergerus
          </h2>
          <blockquote className="border-l-2 border-[#991B1B] pl-4 py-1 text-sm italic text-[#3D3C3A] bg-[#FAF9F5] p-3">
            &ldquo;Penjualan cabang luar pulau (Makassar &amp; Samarinda) mencatat volume pesanan kawat pegas dan busa
            yang besar. Namun setelah dikurangi biaya kargo kontainer antarpulau, klaim retur barang rusak transit,
            dan diskon grosir, kontribusi kas bersih cabang tersebut justru berada di zona merah.&rdquo;
          </blockquote>
          <div className="space-y-2.5 text-xs md:text-sm text-[#3D3C3A] leading-relaxed pt-1">
            <p>
              <strong>1. Perbedaan Omzet Faktur vs Realisasi Kas:</strong> Pembukuan awal hanya mengacu pada nilai faktur
              kotor sebelum memperhitungkan diskon volume grosir (20–35%), ongkos ekspedisi kontainer (10%), serta biaya
              penanganan retur akibat kerusakan fisik dalam transit.
            </p>
            <p>
              <strong>2. Data Logistik dan Penjualan Belum Terintegrasi:</strong> Informasi Purchase Order (PO) cabang terpisah
              dari data tagihan ekspedisi dan HPP material pabrik, sehingga manajemen belum memiliki visibilitas atas margin
              riil per lini produk.
            </p>
            <p>
              <strong>3. Pola Pemesanan Berulang Mitra Pabrik:</strong> Belum ada pemetaan riil mengenai pabrik matras dan
              sofa mana yang konsisten melakukan repeat order bulanan dibandingkan klien yang hanya membeli saat ada potongan harga khusus.
            </p>
          </div>
        </div>

        <div className="lg:col-span-6 p-6 md:p-8 space-y-4 bg-[#FAF9F5]/50">
          <div className="flex items-baseline justify-between border-b border-[#D8D6CE] pb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#166534]">
              PENDEKATAN PENGOLAHAN DATA
            </span>
            <span className="font-mono text-[11px] text-[#6E6D68]">DATA WAREHOUSE DUCKDB</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#141413]">
            Konsolidasi Data Penjualan, Logistik, dan HPP
          </h2>
          <p className="text-xs md:text-sm text-[#3D3C3A] leading-relaxed">
            Untuk mendapatkan kepastian angka tanpa beban operasional yang rumit, dibangun data pipeline berbasis DuckDB dan
            pemodelan dimensional Kimball. Seluruh transaksi dari 4 sumber data direkonsiliasi hingga menghasilkan laporan laba-rugi
            yang terverifikasi:
          </p>

          <table className="w-full border-collapse border border-[#141413] text-xs font-mono bg-white">
            <thead>
              <tr className="bg-[#F2F0E8] border-b border-[#141413] text-left">
                <th className="py-2 px-3">KOMPONEN</th>
                <th className="py-2 px-3">SPESIFIKASI TEKNIS</th>
                <th className="py-2 px-3 text-right">METRIK KINERJA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D6CE]">
              <tr>
                <td className="py-2 px-3 font-bold">OLAP Warehouse</td>
                <td className="py-2 px-3">DuckDB Columnar Engine</td>
                <td className="py-2 px-3 text-right">&lt; 250ms full build</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold">Ingestion Pattern</td>
                <td className="py-2 px-3">Idempotent ELT + Lineage Audit</td>
                <td className="py-2 px-3 text-right">8,249 baris / 4 tabel</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold">Modeling Layer</td>
                <td className="py-2 px-3">Medallion (Bronze / Silver / Gold)</td>
                <td className="py-2 px-3 text-right">4 modul SQL berantai</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold">Data Quality Gate</td>
                <td className="py-2 px-3">ROW_NUMBER() Deduplication</td>
                <td className="py-2 px-3 text-right">15 duplikat dibersihkan</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Curriculum Dossier Index */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[#141413] pb-2">
          <h2 className="font-serif text-2xl font-bold text-[#141413]">
            Daftar Isi Dokumentasi Teknis (Langkah 1 s/d Langkah 4)
          </h2>
          <span className="font-mono text-xs text-[#6E6D68]">KLIK BAB UNTUK MEMBACA SPESIFIKASI &amp; KODE</span>
        </div>

        <div className="border border-[#141413] bg-white divide-y divide-[#141413]">
          {chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => onNavigate(ch.id)}
              className="w-full text-left p-6 hover:bg-[#F2F0E8] transition grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline group"
            >
              <div className="md:col-span-2 font-mono text-xs font-bold text-[#991B1B]">
                {ch.num}
              </div>
              <div className="md:col-span-8 space-y-1.5">
                <h3 className="font-serif text-xl font-bold text-[#141413] group-hover:underline">
                  {ch.title}
                </h3>
                <div className="font-mono text-[11px] text-[#6E6D68]">{ch.scope}</div>
                <p className="text-xs md:text-sm text-[#3D3C3A] leading-relaxed pt-1">{ch.desc}</p>
              </div>
              <div className="md:col-span-2 md:text-right font-mono text-xs font-bold text-[#141413] group-hover:translate-x-1 transition">
                BUKA BAB →
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
