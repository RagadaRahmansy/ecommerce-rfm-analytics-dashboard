import React from 'react';
import CodeViewer from '../components/CodeViewer';

function formatIDR(val) {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
}

export default function Page4AnalyticsMethod({ data, onNavigate }) {
  const cohortRaw = data?.cohort_matrix || [];
  const ltvCac = data?.ltv_cac_by_channel || [];
  const rfmSummary = data?.rfm_summary || [];

  // Pivot cohort_matrix by cohort_month
  const cohortMonths = [...new Set(cohortRaw.map((r) => r.cohort_month))];
  const cohortTable = cohortMonths.map((cm) => {
    const rows = cohortRaw.filter((r) => r.cohort_month === cm);
    const size = rows[0]?.cohort_size || 0;
    const months = {};
    rows.forEach((r) => {
      months[`M${r.month_number}`] = r.retention_pct;
    });
    return { cohort_month: cm, cohort_size: size, ...months };
  });

  const getCellTone = (pct, idx) => {
    if (pct === undefined || pct === null) return 'bg-[#FAF9F5] text-[#A8A69E]';
    if (idx === 0) return 'bg-[#141413] text-[#FAF9F5] font-bold';
    if (pct >= 18) return 'bg-[#166534] text-white font-bold';
    if (pct >= 13) return 'bg-[#DCFCE7] text-[#14532D] font-semibold';
    if (pct >= 9) return 'bg-[#E7E5DC] text-[#141413]';
    return 'bg-white text-[#52514E]';
  };

  return (
    <div className="space-y-10">
      {/* Chapter Header */}
      <section className="border-b-2 border-[#141413] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#991B1B] font-bold">
            SECTION 04 // ANALYTICAL FRAMEWORKS &amp; MATHEMATICAL FORMULATION
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#141413] leading-tight">
            Langkah 4: Metodologi Cohort Retention, Evaluasi LTV:CAC &amp; Matriks RFM
          </h1>
          <p className="text-sm text-[#3D3C3A] leading-relaxed">
            Bagaimana seorang Senior Data Analyst mengukur kesehatan jangka panjang perusahaan menggunakan 3 kerangka
            kuantitatif utama sebelum memberikan rekomendasi strategis.
          </p>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2.5 bg-[#141413] text-[#FAF9F5] font-mono text-xs uppercase tracking-wider hover:bg-[#333330] transition shrink-0"
        >
          BUKA BAB 05: EXECUTIVE P&amp;L STATEMENT →
        </button>
      </section>

      {/* Framework 1: Cohort Retention Matrix */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between flex-wrap gap-3 border-b border-[#141413] pb-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              4.1. Longitudinal Cohort Retention Matrix (Bulan 0 s/d Bulan +5)
            </h2>
            <p className="text-xs text-[#3D3C3A] mt-0.5 max-w-3xl">
              Mengelompokkan pelanggan berdasarkan bulan transaksi pertama (<code>M0</code>) dan mengukur proporsi yang
              kembali berbelanja pada bulan-bulan berikutnya tanpa bias pertumbuhan akuisisi baru.
            </p>
          </div>
          <div className="font-mono text-xs px-3 py-1 bg-[#F2F0E8] border border-[#141413]">
            R(c, m) = Active_Users(c, m) / Cohort_Size(c, 0) × 100%
          </div>
        </div>

        <div className="overflow-x-auto border border-[#141413] bg-white">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[#F2F0E8] text-[#141413] border-b border-[#141413]">
                <th className="py-2.5 px-4 text-left border-r border-[#D8D6CE]">ACQUISITION COHORT</th>
                <th className="py-2.5 px-4 text-right border-r border-[#141413]">BASE USERS (M0)</th>
                {['M0 (Initial)', 'M+1', 'M+2', 'M+3', 'M+4', 'M+5'].map((m) => (
                  <th key={m} className="py-2.5 px-4 text-center border-r last:border-r-0 border-[#D8D6CE]">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D6CE]">
              {cohortTable.map((row) => (
                <tr key={row.cohort_month}>
                  <td className="py-2.5 px-4 font-bold text-[#141413] border-r border-[#D8D6CE] bg-[#FAF9F5]">
                    {row.cohort_month}
                  </td>
                  <td className="py-2.5 px-4 text-right text-[#141413] border-r border-[#141413] bg-[#FAF9F5]">
                    {row.cohort_size}
                  </td>
                  {['M0', 'M1', 'M2', 'M3', 'M4', 'M5'].map((m, idx) => {
                    const val = row[m];
                    return (
                      <td
                        key={m}
                        className={`py-2.5 px-4 text-center border-r last:border-r-0 border-[#D8D6CE] ${getCellTone(
                          val,
                          idx
                        )}`}
                      >
                        {val !== undefined ? `${val.toFixed(1)}%` : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Framework 2: True LTV to CAC Ratio */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between flex-wrap gap-3 border-b border-[#141413] pb-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              4.2. Evaluasi LTV-to-CAC Ratio Berbasis Contribution Margin
            </h2>
            <p className="text-xs text-[#3D3C3A] mt-0.5 max-w-3xl">
              Menghitung <em>Lifetime Value (LTV)</em> tidak boleh menggunakan Omzet Kotor, melainkan wajib menggunakan{' '}
              <strong>Contribution Margin sebelum Iklan (CM1)</strong> per pelanggan dibagi dengan{' '}
              <strong>Customer Acquisition Cost (CAC)</strong>.
            </p>
          </div>
          <div className="font-mono text-xs px-3 py-1 bg-[#F2F0E8] border border-[#141413]">
            LTV:CAC = (LTV_Contribution_Margin_IDR) / (Blended_CAC_IDR)
          </div>
        </div>

        <div className="overflow-x-auto border border-[#141413] bg-white">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#F2F0E8] text-[#141413] border-b border-[#141413]">
                <th className="py-2.5 px-3">ACQUISITION CHANNEL</th>
                <th className="py-2.5 px-3 text-right">PAYING USERS</th>
                <th className="py-2.5 px-3 text-right">REPEAT BUYER %</th>
                <th className="py-2.5 px-3 text-right">AVG FREQ</th>
                <th className="py-2.5 px-3 text-right">LTV (NET SALES)</th>
                <th className="py-2.5 px-3 text-right">LTV (CONTRIB. MARGIN)</th>
                <th className="py-2.5 px-3 text-right">BLENDED CAC</th>
                <th className="py-2.5 px-3 text-right">LTV:CAC RATIO</th>
                <th className="py-2.5 px-3">AUDIT VERDICT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D6CE]">
              {ltvCac.map((row) => {
                const ratio = Number(row.ltv_to_cac_ratio);
                const verdict =
                  ratio >= 2.0
                    ? { label: 'HEALTHY / SCALE', cls: 'text-[#166534] font-bold' }
                    : ratio >= 1.1
                    ? { label: 'MARGINAL / OPTIMIZE', cls: 'text-[#B45309] font-bold' }
                    : { label: 'DEFICIT / RESTRUCTURE', cls: 'text-[#991B1B] font-bold' };

                return (
                  <tr key={row.channel} className="hover:bg-[#FAF9F5]">
                    <td className="py-3 px-3 font-bold text-[#141413]">{row.channel}</td>
                    <td className="py-3 px-3 text-right">{row.paying_customers.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-3 text-right font-bold">{row.repeat_buyer_rate_pct}%</td>
                    <td className="py-3 px-3 text-right">{row.avg_orders_per_buyer}x</td>
                    <td className="py-3 px-3 text-right">{formatIDR(row.avg_ltv_net_sales_idr)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-[#141413]">
                      {formatIDR(row.ltv_contribution_margin_idr)}
                    </td>
                    <td className="py-3 px-3 text-right text-[#991B1B]">{formatIDR(row.cac_idr)}</td>
                    <td className="py-3 px-3 text-right font-bold text-[#141413]">{ratio.toFixed(2)}x</td>
                    <td className={`py-3 px-3 ${verdict.cls}`}>{verdict.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Framework 3: RFM Customer Segmentation */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between flex-wrap gap-3 border-b border-[#141413] pb-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              4.3. Distribusi Segmentasi Pelanggan RFM (Recency, Frequency, Monetary)
            </h2>
            <p className="text-xs text-[#3D3C3A] mt-0.5">
              Mengklasifikasikan basis pelanggan aktif ke dalam 5 segmen taktis agar perlakuan promosi CRM tepat sasaran.
            </p>
          </div>
          <span className="font-mono text-xs text-[#6E6D68]">QUARTILE SCORING (1–4)</span>
        </div>

        <div className="overflow-x-auto border border-[#141413] bg-white">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#F2F0E8] text-[#141413] border-b border-[#141413]">
                <th className="py-2.5 px-3">SEGMEN RFM</th>
                <th className="py-2.5 px-3 text-right">PELANGGAN</th>
                <th className="py-2.5 px-3 text-right">PORSI (%)</th>
                <th className="py-2.5 px-3 text-right">AVG RECENCY</th>
                <th className="py-2.5 px-3 text-right">AVG ORDERS</th>
                <th className="py-2.5 px-3 text-right">AVG MONETARY (LTV)</th>
                <th className="py-2.5 px-3 text-right">TOTAL NET SALES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D6CE]">
              {rfmSummary.map((seg) => (
                <tr key={seg.rfm_segment} className="hover:bg-[#FAF9F5]">
                  <td className="py-2.5 px-3 font-bold text-[#141413]">{seg.rfm_segment}</td>
                  <td className="py-2.5 px-3 text-right">{seg.customer_count.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right">{seg.share_pct}%</td>
                  <td className="py-2.5 px-3 text-right">{seg.avg_recency_days} hari</td>
                  <td className="py-2.5 px-3 text-right">{seg.avg_frequency}x</td>
                  <td className="py-2.5 px-3 text-right">{formatIDR(seg.avg_monetary_idr)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#141413]">
                    {formatIDR(seg.total_revenue_idr)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Part 4: Python Analytics Runner Source */}
      <section className="space-y-3">
        <div className="border-b border-[#141413] pb-2">
          <h2 className="font-serif text-2xl font-bold text-[#141413]">
            4.4. Kode Sumber Eksekutor SQL &amp; JSON Exporter: <code>src/03_analytics_deepdive.py</code>
          </h2>
        </div>
        <CodeViewer
          title="src/03_analytics_deepdive.py"
          language="python"
          code={data?.code_repository?.py_03_analytics || ''}
          annotations={[
            {
              title: 'Sequential DAG Execution',
              desc: 'Menjalankan ke-4 skrip SQL (01_staging s/d 04_marts) secara deterministik dan mencatat latensi per modul.',
            },
            {
              title: 'Automated Data Quality Assertions',
              desc: 'Memverifikasi bahwa selisih baris raw_orders vs stg_orders tepat sama dengan 15 duplikat yang dihapus.',
            },
          ]}
        />
      </section>
    </div>
  );
}
