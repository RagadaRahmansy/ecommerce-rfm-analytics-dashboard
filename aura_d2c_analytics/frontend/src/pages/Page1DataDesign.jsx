import React, { useState } from 'react';
import CodeViewer from '../components/CodeViewer';

export default function Page1DataDesign({ data, onNavigate }) {
  const [selectedSample, setSelectedSample] = useState('raw_orders');

  const erdTables = [
    {
      code: 'TBL-01',
      name: 'customers.csv',
      rows: '1,820',
      grain: '1 baris = 1 Pelanggan Terdaftar Unik',
      pk: 'customer_id',
      fk: '—',
      cols: 'customer_id, full_name, email, city, province, acquisition_channel, acquisition_campaign, created_at',
      note: 'Menyimpan atribusi kanal pertama (First-Touch Attribution) untuk perhitungan kohort akuisisi.',
    },
    {
      code: 'TBL-02',
      name: 'orders.csv',
      rows: '2,243 (15 dup)',
      grain: '1 baris = 1 Transaksi Checkout',
      pk: 'order_id',
      fk: 'customer_id',
      cols: 'order_id, customer_id, channel, order_status, order_date, gross_amount, discount_amount, channel_fee_amount, return_shipping_loss',
      note: 'Mencatat nilai kotor (GMV), diskon yang ditanggung brand, biaya admin marketplace, dan penalti retur COD.',
    },
    {
      code: 'TBL-03',
      name: 'order_items.csv',
      rows: '3,462',
      grain: '1 baris = 1 SKU Produk dalam Order',
      pk: 'item_id',
      fk: 'order_id',
      cols: 'item_id, order_id, product_sku, product_name, category, quantity, unit_price, unit_cogs, line_gross_amount, line_cogs_amount',
      note: 'Menyimpan HPP (COGS) per unit produk agar perhitungan Gross Margin akurat sesuai isi keranjang belanja.',
    },
    {
      code: 'TBL-04',
      name: 'ad_spend.csv',
      rows: '724',
      grain: '1 baris = 1 Hari × 1 Campaign Iklan',
      pk: 'spend_date + campaign_name',
      fk: 'target_channel (Logical)',
      cols: 'spend_date, platform, target_channel, campaign_name, spend_idr, impressions, clicks',
      note: 'Memiliki granularitas harian/kampanye (berbeda dari order per-detik), sehingga wajib diagregasi sebelum di-JOIN.',
    },
  ];

  const sampleRows = data?.samples?.[selectedSample] || [];
  const sampleCols = sampleRows.length > 0 ? Object.keys(sampleRows[0]) : [];

  return (
    <div className="space-y-10">
      {/* Chapter Header */}
      <section className="border-b-2 border-[#141413] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#991B1B] font-bold">
            SECTION 01 // RELATIONAL DATA DESIGN &amp; SOURCE SIMULATION
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#141413] leading-tight">
            Langkah 1: Definisi Data Grain, Skema Relasional ERD &amp; Simulasi Anomali
          </h1>
          <p className="text-sm text-[#3D3C3A] leading-relaxed">
            Sebelum menulis satu baris query SQL, seorang Senior Data Analyst wajib menetapkan <em>Data Grain</em> (unit
            baris terkecil) di setiap tabel sumber agar terhindar dari kesalahan perhitungan ganda (<em>Fan-Out Join</em>).
          </p>
        </div>
        <button
          onClick={() => onNavigate('step2')}
          className="px-4 py-2.5 bg-[#141413] text-[#FAF9F5] font-mono text-xs uppercase tracking-wider hover:bg-[#333330] transition shrink-0"
        >
          LANJUT KE BAB 02: INGESTION →
        </button>
      </section>

      {/* Part 1: Grain & Fan-Out Theory */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border border-[#141413] bg-white divide-y lg:divide-y-0 lg:divide-x divide-[#141413]">
        <div className="lg:col-span-7 p-6 space-y-4">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#141413] border-b border-[#D8D6CE] pb-2">
            1.1. PRINSIP ARSITEKTUR: MENGAPA DATA DIBAGI MENJADI 4 TABEL?
          </div>
          <div className="space-y-4 text-xs md:text-sm text-[#3D3C3A] leading-relaxed">
            <div>
              <h3 className="font-bold text-[#141413]">
                A. Pemisahan Header PO vs Line Items (Mencegah Fan-Out Trap)
              </h3>
              <p className="mt-1">
                Satu Purchase Order B2B (<code>PO-50001</code>) dapat memuat beberapa material sekaligus (misalnya 5 Roll
                Kawat Bonnell Spring dan 20 Lembar Busa PU Foam D28). Potongan volume rebate tercatat di level <strong>PO Header</strong>
                , sedangkan Harga Pokok Penjualan (COGS) material tercatat di level <strong>Order Items</strong>. Jika keduanya
                digabung tanpa pra-agregasi, nilai potongan rabat akan terduplikasi sebanyak variasi SKU yang dipesan pabrik mitra.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#141413]">
                B. Ketidaksesuaian Granularitas Transaksi vs Biaya Trade Marketing (Chasm Trap)
              </h3>
              <p className="mt-1">
                Tabel <code>orders.csv</code> memiliki granularitas per-faktur pengiriman per-pabrik mitra, sedangkan{' '}
                <code>ad_spend.csv</code> dari B2B Trade Marketing &amp; Pameran Industri memiliki granularitas harian per-wilayah.
                Menggabungkan keduanya secara langsung pada level transaksi akan mengalikan biaya pameran harian dengan
                jumlah faktur di hari tersebut.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 space-y-4 bg-[#FAF9F5]/60">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#991B1B] border-b border-[#D8D6CE] pb-2">
            1.2. PARAMETER ANOMALI CABANG DISTRIBUSI (EKATUNGGAL GROUP)
          </div>
          <table className="w-full border-collapse border border-[#141413] text-xs font-mono bg-white">
            <thead>
              <tr className="bg-[#F2F0E8] border-b border-[#141413] text-left">
                <th className="py-2 px-2.5">CABANG DISTRIBUSI</th>
                <th className="py-2 px-2.5 text-right">RABAT</th>
                <th className="py-2 px-2.5 text-right">ONGKIR</th>
                <th className="py-2 px-2.5 text-right">KLAIM %</th>
                <th className="py-2 px-2.5 text-right">REPEAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D6CE]">
              <tr>
                <td className="py-2 px-2.5 font-bold text-[#991B1B]">Cabang Luar Pulau</td>
                <td className="py-2 px-2.5 text-right">20–35%</td>
                <td className="py-2 px-2.5 text-right">10.0%</td>
                <td className="py-2 px-2.5 text-right">14.0%</td>
                <td className="py-2 px-2.5 text-right">13.0%</td>
              </tr>
              <tr>
                <td className="py-2 px-2.5 font-bold text-[#141413]">Cabang Jawa</td>
                <td className="py-2 px-2.5 text-right">10–22%</td>
                <td className="py-2 px-2.5 text-right">8.0%</td>
                <td className="py-2 px-2.5 text-right">8.0%</td>
                <td className="py-2 px-2.5 text-right">28.0%</td>
              </tr>
              <tr>
                <td className="py-2 px-2.5 font-bold text-[#166534]">Gudang Pusat</td>
                <td className="py-2 px-2.5 text-right">0–10%</td>
                <td className="py-2 px-2.5 text-right">2.5%</td>
                <td className="py-2 px-2.5 text-right">3.0%</td>
                <td className="py-2 px-2.5 text-right">48.0%</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-[#52514E] leading-relaxed">
            <strong>Anomali Rantai Pasok B2B:</strong> Generator juga menyuntikkan <strong>15 baris sinkronisasi ERP duplikat</strong>{' '}
            ke dalam <code>orders.csv</code> serta biaya klaim retur kerusakan material selama pelayaran antarpulau sebesar{' '}
            <strong>Rp 150.000/pallet</strong>.
          </p>
        </div>
      </section>

      {/* Part 2: Relational Data Dictionary & ERD Specification Table */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between border-b border-[#141413] pb-2">
          <h2 className="font-serif text-2xl font-bold text-[#141413]">
            1.3. Spesifikasi Skema Relasional &amp; Kamus Data Sumber (Raw CSV)
          </h2>
          <span className="font-mono text-xs text-[#6E6D68]">4 ENTITAS SUMBER</span>
        </div>

        <div className="overflow-x-auto border border-[#141413] bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F2F0E8] border-b border-[#141413] font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">KODE</th>
                <th className="py-2.5 px-3">NAMA FILE</th>
                <th className="py-2.5 px-3 text-right">POPULASI</th>
                <th className="py-2.5 px-3">DEFINISI GRAIN</th>
                <th className="py-2.5 px-3">PRIMARY / FOREIGN KEY</th>
                <th className="py-2.5 px-3">ATRIBUT &amp; FUNGSI ANALITIK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D6CE]">
              {erdTables.map((t) => (
                <tr key={t.code} className="align-top hover:bg-[#FAF9F5]">
                  <td className="py-3 px-3 font-mono font-bold text-[#991B1B]">{t.code}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#141413] whitespace-nowrap">{t.name}</td>
                  <td className="py-3 px-3 font-mono text-right whitespace-nowrap">{t.rows}</td>
                  <td className="py-3 px-3 font-medium text-[#141413]">{t.grain}</td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div>PK: {t.pk}</div>
                    <div className="text-[#6E6D68]">FK: {t.fk}</div>
                  </td>
                  <td className="py-3 px-3 space-y-1">
                    <div className="font-mono text-[11px] text-[#52514E]">{t.cols}</div>
                    <div className="text-[#141413]">{t.note}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Part 3: Live Raw CSV Data Inspector */}
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#141413] pb-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              1.4. Inspeksi Sampel Data Mentah (Raw Layer Preview)
            </h2>
            <p className="text-xs text-[#52514E]">
              Menampilkan 8 baris pertama dari masing-masing tabel sumber yang dihasilkan oleh skrip generator.
            </p>
          </div>
          <div className="flex border border-[#141413] bg-white font-mono text-xs">
            {[
              { id: 'raw_orders', label: 'orders.csv' },
              { id: 'raw_customers', label: 'customers.csv' },
              { id: 'raw_ad_spend', label: 'ad_spend.csv' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedSample(tab.id)}
                className={`px-3.5 py-1.5 transition border-r last:border-r-0 border-[#141413] ${
                  selectedSample === tab.id
                    ? 'bg-[#141413] text-[#FAF9F5] font-bold'
                    : 'bg-white text-[#141413] hover:bg-[#F2F0E8]'
                }`}
              >
                {tab.label}
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
                      {String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Part 4: Full Source Code */}
      <section className="space-y-3">
        <div className="border-b border-[#141413] pb-2">
          <h2 className="font-serif text-2xl font-bold text-[#141413]">
            1.5. Kode Sumber Lengkap: <code>src/01_data_generator.py</code>
          </h2>
        </div>
        <CodeViewer
          title="src/01_data_generator.py"
          language="python"
          code={data?.code_repository?.py_01_generator || ''}
          annotations={[
            {
              title: 'Reproducible Simulation Seed',
              desc: 'Menggunakan random.seed(42) agar distribusi pelanggan, pesanan, dan metrik keuangan bersifat deterministik saat diuji ulang.',
            },
            {
              title: 'Channel Unit Economics Parameters',
              desc: 'Memodelkan struktur komisi (10% TikTok vs 8% Shopee vs 2.5% Website) dan probabilitas repeat order berbasis kanal akuisisi.',
            },
            {
              title: 'SKU-Level Cost of Goods Sold (COGS)',
              desc: 'Setiap transaksi mengambil 1–3 item produk dari katalog dengan harga jual dan HPP riil per SKU.',
            },
            {
              title: 'Webhook Duplication Injection',
              desc: 'Menyisipkan 15 baris transaksi duplikat pada akhir penulisan orders.csv sebagai kasus uji pembersihan data.',
            },
          ]}
        />
      </section>
    </div>
  );
}
