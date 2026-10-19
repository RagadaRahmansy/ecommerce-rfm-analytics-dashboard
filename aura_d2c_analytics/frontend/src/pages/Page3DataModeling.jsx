import React, { useState } from 'react';
import CodeViewer from '../components/CodeViewer';

export default function Page3DataModeling({ data, onNavigate }) {
  const [activeSqlTab, setActiveSqlTab] = useState('sql_01_staging');
  const [previewTable, setPreviewTable] = useState('fct_orders');

  const sqlTabs = [
    {
      id: 'sql_01_staging',
      filename: '01_staging.sql',
      layer: 'LAYER 02 // SILVER STAGING',
      desc: 'Membersihkan 15 baris order ganda hasil duplikasi webhook menggunakan Window Function ROW_NUMBER(), normalisasi teks (TRIM/LOWER), dan konversi tipe data eksplisit.',
      annotations: [
        {
          title: 'ROW_NUMBER() Deduplication Pattern',
          desc: 'PARTITION BY TRIM(order_id) ORDER BY _ingested_at DESC memilih 1 rekaman paling mutakhir dan membuang salinan duplikat.',
        },
        {
          title: 'SELECT * EXCLUDE (rn)',
          desc: 'Sintaks SQL analitik modern di DuckDB untuk mengeliminasi kolom penomoran bantu tanpa perlu menulis ulang puluhan nama kolom.',
        },
        {
          title: 'DATE_TRUNC(month, ...) Alignment',
          desc: 'Menetapkan tanggal awal bulan (YYYY-MM-01) pada registrasi pelanggan dan transaksi untuk kunci relasi kohort.',
        },
        {
          title: 'Strict BIGINT Financial Casting',
          desc: 'Menghindari kesalahan pembulatan floating-point dengan menyimpan seluruh nominal Rupiah dalam BIGINT.',
        },
      ],
    },
    {
      id: 'sql_02_dimensions',
      filename: '02_dimensions.sql',
      layer: 'LAYER 03A // KIMBALL DIMENSIONS',
      desc: 'Membentuk tabel dimensi pelanggan (mart_gold.dim_customers) dan katalog produk (mart_gold.dim_products) lengkap dengan atribut LTV, status Repeat Buyer, dan Recency.',
      annotations: [
        {
          title: 'Aggregate FILTER (WHERE ...) Clause',
          desc: 'Memisahkan perhitungan jumlah order berstatus completed dari order gagal (cancelled/returned) secara deklaratif.',
        },
        {
          title: 'SKU Gross Margin Calculation',
          desc: 'Menghitung persentase margin kotor per unit SKU menggunakan pembagian aman NULLIF(MAX(unit_price_idr), 0).',
        },
        {
          title: 'is_repeat_buyer Boolean Flag',
          desc: 'Atribut dimensi bernilai TRUE apabila pelanggan memiliki lebih dari 1 pesanan tuntas (completed_orders > 1).',
        },
        {
          title: 'Recency Days Computation',
          desc: 'DATE_DIFF(day, last_completed_order_date, DATE 2026-06-30) sebagai dasar penilaian skor Recency pada model RFM.',
        },
      ],
    },
    {
      id: 'sql_03_facts',
      filename: '03_facts.sql',
      layer: 'LAYER 03B // KIMBALL FACT TABLE',
      desc: 'Membangun tabel fakta transaksional (mart_gold.fct_orders) yang merekonsiliasi GMV, Diskon, Komisi Marketplace, HPP (COGS), dan Ongkir Retur per nomor pesanan.',
      annotations: [
        {
          title: 'Pre-Aggregated Item Totals CTE',
          desc: 'Menjumlahkan line_cogs_idr di tabel item ke level order_id terlebih dahulu agar proses JOIN ke tabel order bebas dari Fan-Out.',
        },
        {
          title: 'Order Sequencing (1st vs Repeat Order)',
          desc: 'ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY ordered_at ASC) mengidentifikasi apakah transaksi merupakan akuisisi baru atau pembelian ulang.',
        },
        {
          title: 'Return Shipping Penalty Accounting',
          desc: 'Pesanan berstatus returned tidak menghasilkan pendapatan (Net Sales = 0), namun mencatat kerugian biaya kirim retur sebesar -Rp 22.000.',
        },
        {
          title: 'Contribution Margin Before Ads (CM1)',
          desc: 'Rumus per transaksi: Gross Realized - Diskon - Komisi Marketplace - Total HPP (COGS) - Kerugian Ongkir Retur.',
        },
      ],
    },
    {
      id: 'sql_04_marts',
      filename: '04_marts.sql',
      layer: 'LAYER 03C // EXECUTIVE GOLD MARTS',
      desc: 'Menggabungkan tabel fakta order dengan biaya iklan pada granularitas setara (Bulan × Kanal), membangun matriks Cohort Retention, dan klasifikasi segmen RFM.',
      annotations: [
        {
          title: 'Multi-Fact Grain Alignment (order_agg + ad_agg)',
          desc: 'Mengagregasi fct_orders dan stg_ad_spend ke grain (Bulan, Kanal) di masing-masing CTE sebelum digabungkan dengan LEFT JOIN.',
        },
        {
          title: 'Vanity ROAS vs Contribution ROAS',
          desc: 'Membandingkan klaim agensi (GMV / Ad Spend) terhadap rasio profitabilitas riil (Contribution Margin Before Ads / Ad Spend).',
        },
        {
          title: 'Longitudinal Cohort Matrix Query',
          desc: 'Menghitung persentase pelanggan aktif dari M0 hingga M5 berdasarkan selisih bulan transaksi terhadap bulan akuisisi.',
        },
        {
          title: 'Rule-Based RFM Segmentation',
          desc: 'Memetakan skor R, F, M (skala 1–4) menjadi 5 segmen operasional untuk kampanye retensi tim CRM.',
        },
      ],
    },
  ];

  const currentTab = sqlTabs.find((t) => t.id === activeSqlTab) || sqlTabs[0];
  const sampleRows = data?.samples?.[previewTable] || [];
  const sampleCols = sampleRows.length > 0 ? Object.keys(sampleRows[0]) : [];

  return (
    <div className="space-y-10">
      {/* Chapter Header */}
      <section className="border-b-2 border-[#141413] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#991B1B] font-bold">
            SECTION 03 // MEDALLION ARCHITECTURE &amp; KIMBALL SQL MODELING
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#141413] leading-tight">
            Langkah 3: Pemodelan Data Dimensional (Star Schema) &amp; Transformasi SQL
          </h1>
          <p className="text-sm text-[#3D3C3A] leading-relaxed">
            Inti dari pekerjaan seorang Analytics Engineer: menyusun arsitektur transformasi bertahap dari data mentah
            menjadi tabel Fakta dan Dimensi yang mematuhi kaidah akuntansi keuangan.
          </p>
        </div>
        <button
          onClick={() => onNavigate('step4')}
          className="px-4 py-2.5 bg-[#141413] text-[#FAF9F5] font-mono text-xs uppercase tracking-wider hover:bg-[#333330] transition shrink-0"
        >
          LANJUT KE BAB 04: METODOLOGI ANALITIK →
        </button>
      </section>

      {/* Part 1: Medallion Architecture Specification Table */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between border-b border-[#141413] pb-2">
          <h2 className="font-serif text-2xl font-bold text-[#141413]">
            3.1. Spesifikasi Lapisan Medallion Architecture (Bronze → Silver → Gold)
          </h2>
          <span className="font-mono text-xs text-[#6E6D68]">KIMBALL STAR SCHEMA</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border border-[#141413] bg-white divide-y md:divide-y-0 md:divide-x divide-[#141413]">
          <div className="p-5 space-y-2.5">
            <div className="font-mono text-xs font-bold text-[#6E6D68]">STAGE 01 // RAW BRONZE</div>
            <div className="font-serif text-xl font-bold text-[#141413]">Schema: raw_bronze</div>
            <p className="text-xs text-[#3D3C3A] leading-relaxed">
              Menyimpan salinan 1:1 dari data sumber tanpa penyaringan. Berfungsi sebagai <em>landing zone</em> yang
              dapat diputar ulang kapan saja tanpa perlu menarik ulang dari API pihak ketiga.
            </p>
            <div className="pt-2 font-mono text-[11px] text-[#52514E] space-y-1 border-t border-[#E5E4DF]">
              <div>• raw_bronze.raw_customers</div>
              <div>• raw_bronze.raw_orders</div>
              <div>• raw_bronze.raw_order_items</div>
              <div>• raw_bronze.raw_ad_spend</div>
            </div>
          </div>

          <div className="p-5 space-y-2.5">
            <div className="font-mono text-xs font-bold text-[#991B1B]">STAGE 02 // CLEANED SILVER</div>
            <div className="font-serif text-xl font-bold text-[#141413]">Schema: stg_silver</div>
            <p className="text-xs text-[#3D3C3A] leading-relaxed">
              Lapisan higienitas data: menghapus baris ganda (deduplikasi), menyeragamkan penulisan teks/email, dan
              memastikan seluruh kolom tanggal serta mata uang memiliki tipe data yang ketat.
            </p>
            <div className="pt-2 font-mono text-[11px] text-[#52514E] space-y-1 border-t border-[#E5E4DF]">
              <div>• stg_silver.stg_customers</div>
              <div>• stg_silver.stg_orders (Deduplicated)</div>
              <div>• stg_silver.stg_order_items</div>
              <div>• stg_silver.stg_ad_spend</div>
            </div>
          </div>

          <div className="p-5 space-y-2.5">
            <div className="font-mono text-xs font-bold text-[#166534]">STAGE 03 // BUSINESS GOLD</div>
            <div className="font-serif text-xl font-bold text-[#141413]">Schema: mart_gold</div>
            <p className="text-xs text-[#3D3C3A] leading-relaxed">
              Lapisan pemodelan dimensional Kimball (Dimensi &amp; Fakta) serta tabel agregasi eksekutif yang menjadi
              satu-satunya acuan resmi (<em>Single Source of Truth</em>) bagi laporan manajemen.
            </p>
            <div className="pt-2 font-mono text-[11px] text-[#141413] font-semibold space-y-1 border-t border-[#E5E4DF]">
              <div>• mart_gold.dim_customers &amp; dim_products</div>
              <div>• mart_gold.fct_orders</div>
              <div>• mart_gold.mart_channel_unit_economics</div>
              <div>• mart_gold.mart_cohort_retention &amp; rfm</div>
            </div>
          </div>
        </div>
      </section>

      {/* Part 2: Accounting Waterfall Formula Specification */}
      <section className="border border-[#141413] bg-white p-6 space-y-4">
        <div className="flex items-baseline justify-between border-b border-[#D8D6CE] pb-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#141413]">
            3.2. STRUKTUR REKONSILIASI LABA-RUGI TRANSAKSIONAL (UNIT ECONOMICS WATERFALL)
          </span>
          <span className="font-mono text-[11px] text-[#6E6D68]">ACCOUNTING STANDARD</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 border border-[#141413] divide-y md:divide-y-0 md:divide-x divide-[#141413] font-mono text-xs">
          <div className="p-3.5 bg-[#FAF9F5]">
            <div className="text-[10px] text-[#6E6D68]">STEP 01</div>
            <div className="font-bold text-[#141413] mt-0.5">GMV (Gross)</div>
            <div className="text-[11px] text-[#3D3C3A] mt-1">∑ (Harga × Kuantitas)</div>
            <div className="text-[10px] text-[#6E6D68] mt-1">Termasuk order batal/retur</div>
          </div>
          <div className="p-3.5 bg-white">
            <div className="text-[10px] text-[#6E6D68]">STEP 02</div>
            <div className="font-bold text-[#141413] mt-0.5">Realized Net Sales</div>
            <div className="text-[11px] text-[#3D3C3A] mt-1">Gross Completed − Diskon</div>
            <div className="text-[10px] text-[#6E6D68] mt-1">Pendapatan bersih terealisasi</div>
          </div>
          <div className="p-3.5 bg-[#FAF9F5]">
            <div className="text-[10px] text-[#991B1B]">STEP 03</div>
            <div className="font-bold text-[#991B1B] mt-0.5">Direct Variable Cost</div>
            <div className="text-[11px] text-[#3D3C3A] mt-1">COGS + Fee + Ongkir Retur</div>
            <div className="text-[10px] text-[#6E6D68] mt-1">Beban variabel langsung</div>
          </div>
          <div className="p-3.5 bg-white">
            <div className="text-[10px] text-[#141413]">STEP 04</div>
            <div className="font-bold text-[#141413] mt-0.5">CM Before Ads (CM1)</div>
            <div className="text-[11px] text-[#3D3C3A] mt-1">Net Sales − Variable Cost</div>
            <div className="text-[10px] text-[#6E6D68] mt-1">Batas atas anggaran iklan</div>
          </div>
          <div className="p-3.5 bg-[#F2F0E8]">
            <div className="text-[10px] text-[#166534] font-bold">STEP 05 (BOTTOM LINE)</div>
            <div className="font-bold text-[#166534] mt-0.5">Real Net Profit</div>
            <div className="text-[11px] text-[#141413] font-semibold mt-1">CM Before Ads − Ad Spend</div>
            <div className="text-[10px] text-[#52514E] mt-1">Arus kas bersih riil</div>
          </div>
        </div>
      </section>

      {/* Part 3: Interactive 4-File SQL Explorer */}
      <section className="space-y-4">
        <div className="flex items-end justify-between flex-wrap gap-3 border-b border-[#141413] pb-3">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              3.3. Bedah 4 Modul Query SQL Transformasi (Klik Tab untuk Membuka)
            </h2>
            <p className="text-xs text-[#3D3C3A] max-w-2xl">{currentTab.desc}</p>
          </div>
          <div className="flex flex-wrap border border-[#141413] bg-white font-mono text-xs">
            {sqlTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSqlTab(tab.id)}
                className={`px-3.5 py-2 border-r last:border-r-0 border-[#141413] transition ${
                  activeSqlTab === tab.id
                    ? 'bg-[#141413] text-[#FAF9F5] font-bold'
                    : 'bg-white text-[#141413] hover:bg-[#F2F0E8]'
                }`}
              >
                {tab.filename}
              </button>
            ))}
          </div>
        </div>

        <CodeViewer
          title={`src/sql/${currentTab.filename} — ${currentTab.layer}`}
          language="sql"
          code={data?.code_repository?.[activeSqlTab] || ''}
          annotations={currentTab.annotations}
        />
      </section>

      {/* Part 4: Transformed Gold Table Preview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#141413] pb-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              3.4. Inspeksi Hasil Tabel Gold Layer (mart_gold.*)
            </h2>
            <p className="text-xs text-[#52514E]">
              Sampel baris hasil transformasi SQL yang telah memiliki kolom kalkulasi Unit Economics dan LTV.
            </p>
          </div>
          <div className="flex border border-[#141413] bg-white font-mono text-xs">
            {[
              { id: 'fct_orders', label: 'mart_gold.fct_orders' },
              { id: 'dim_customers', label: 'mart_gold.dim_customers' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setPreviewTable(t.id)}
                className={`px-3.5 py-1.5 border-r last:border-r-0 border-[#141413] transition ${
                  previewTable === t.id
                    ? 'bg-[#141413] text-[#FAF9F5] font-bold'
                    : 'bg-white text-[#141413] hover:bg-[#F2F0E8]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto border border-[#141413] bg-white">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#F2F0E8] text-[#141413] border-b border-[#141413]">
                {sampleCols.map((col) => (
                  <th key={col} className="py-2 px-3 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E4DF]">
              {sampleRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#FAF9F5]">
                  {sampleCols.map((col) => (
                    <td key={col} className="py-2 px-3 whitespace-nowrap text-[#262624]">
                      {typeof row[col] === 'number' ? row[col].toLocaleString('id-ID') : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
