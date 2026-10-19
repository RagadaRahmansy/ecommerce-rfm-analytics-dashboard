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
          SECTION 00 // EXECUTIVE CASE STUDY &amp; ARCHITECTURAL BLUEPRINT
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#141413] leading-[1.12] tracking-tight max-w-4xl">
          Ekatunggal Group: Rekonsiliasi Margin Distribusi Bahan Baku Springbed &amp; Sofa melalui Data Warehouse.
        </h1>
        <p className="text-base md:text-lg text-[#3D3C3A] max-w-3xl leading-relaxed">
          Dokumentasi kerja lengkap bagaimana seorang <strong>Senior Data Analyst (5 tahun pengalaman)</strong> membangun
          infrastruktur data dari nol di <strong>PT Ekatunggal Tunas Mandiri</strong>—menganalisis rantai pasok material
          kasur pegas dan mebel antara Gudang Pusat Jabodetabek (Citeureup), Cabang Jawa, dan Cabang Luar Pulau.
        </p>

        <div className="pt-3 flex flex-wrap gap-3 font-mono text-xs">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 bg-[#141413] text-[#FAF9F5] hover:bg-[#333330] font-semibold uppercase tracking-wider transition"
          >
            [05] BUKA EXECUTIVE P&amp;L STATEMENT →
          </button>
          <button
            onClick={() => onNavigate('step1')}
            className="px-5 py-2.5 bg-white text-[#141413] border border-[#141413] hover:bg-[#F2F0E8] font-semibold uppercase tracking-wider transition"
          >
            [01] MULAI DARI ARSITEKTUR DATA →
          </button>
        </div>
      </section>

      {/* Two-Column Case Study Diagnosis */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border border-[#141413] bg-white divide-y lg:divide-y-0 lg:divide-x divide-[#141413]">
        <div className="lg:col-span-6 p-6 md:p-8 space-y-4">
          <div className="flex items-baseline justify-between border-b border-[#D8D6CE] pb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#991B1B]">
              DIAGNOSIS MASALAH BISNIS B2B
            </span>
            <span className="font-mono text-[11px] text-[#6E6D68]">DISTRIBUSI NASIONAL</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#141413]">
            Paradoks Pertumbuhan Semu: Volume Penjualan Grosir Tinggi, Margin Bersih Terkuras
          </h2>
          <blockquote className="border-l-2 border-[#991B1B] pl-4 py-1 text-sm italic text-[#3D3C3A] bg-[#FAF9F5] p-3">
            &ldquo;Laporan penjualan cabang luar pulau (Makassar &amp; Samarinda) mencatat volume pesanan kawat pegas dan busa
            yang sangat besar. Namun setelah dikurangi biaya kargo kontainer antarpulau, klaim retur barang rusak transit,
            dan diskon volume, laba bersih cabang tersebut justru minus!&rdquo;
          </blockquote>
          <div className="space-y-2.5 text-xs md:text-sm text-[#3D3C3A] leading-relaxed pt-1">
            <p>
              <strong>1. Ilusi Omzet Tagihan Kotor (Gross Invoiced):</strong> Penjualan dihitung atas dasar nilai faktur
              sebelum memperhitungkan diskon volume grosir 20–35%, ongkir pelayaran antarpulau 10%, dan penalti klaim
              kerusakan material di perjalanan.
            </p>
            <p>
              <strong>2. Fragmentasi Data Cabang:</strong> Data pesanan (PO) di gudang cabang terpisah dari biaya logistik
              dan data HPP material pabrik, membuat manajemen kesulitan membedakan cabang yang sehat dari cabang yang
              bocor margin.
            </p>
            <p>
              <strong>3. Retensi Pembelian Pabrik Mitra:</strong> Tanpa analisis kohort, tim sales tidak mengetahui
              apakah pabrik mebel mitra rutin memesan ulang kawat dan busa setiap bulan atau hanya memanfaatkan potongan harga
              pembukaan cabang baru.
            </p>
          </div>
        </div>

        <div className="lg:col-span-6 p-6 md:p-8 space-y-4 bg-[#FAF9F5]/50">
          <div className="flex items-baseline justify-between border-b border-[#D8D6CE] pb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#166534]">
              SOLUSI ARSITEKTUR ANALITIK
            </span>
            <span className="font-mono text-[11px] text-[#6E6D68]">MODERN LEAN DATA STACK</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#141413]">
            Rekonsiliasi Transaksional Berbasis DuckDB &amp; Kimball Star Schema
          </h2>
          <p className="text-xs md:text-sm text-[#3D3C3A] leading-relaxed">
            Sebagai analis pertama di perusahaan, membangun infrastruktur cloud mahal sejak hari pertama adalah pemborosan.
            Pendekatan senior adalah merancang pipeline lokal yang cepat, idempotent, dan 100% berbasis standar SQL:
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
