import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function formatMillions(val) {
  const num = Number(val || 0);
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) {
    return `${num < 0 ? '-' : ''}Rp ${(abs / 1_000_000_000).toFixed(2)} M`;
  }
  if (abs >= 1_000_000) {
    return `${num < 0 ? '-' : ''}Rp ${(abs / 1_000_000).toFixed(1)} Jt`;
  }
  return `${num < 0 ? '-' : ''}Rp ${abs.toLocaleString('id-ID')}`;
}

function formatAccountingIDR(val) {
  const num = Math.round(Number(val || 0));
  if (num < 0) {
    return `(Rp ${Math.abs(num).toLocaleString('id-ID')})`;
  }
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export default function Page5Dashboard({ data }) {
  const [selectedChannel, setSelectedChannel] = useState('ALL');

  const channelMonthly = data?.channel_monthly || [];
  const channelSummary = data?.channel_summary || [];
  const retentionCurveRaw = data?.channel_retention_curve || [];
  const products = data?.product_performance || [];

  const kpi = useMemo(() => {
    const rows =
      selectedChannel === 'ALL'
        ? channelSummary
        : channelSummary.filter((r) => r.channel === selectedChannel);

    const sum = (key) => rows.reduce((acc, r) => acc + Number(r[key] || 0), 0);

    const gmv = sum('gmv_gross_idr');
    const realizedGross = sum('realized_gross_idr');
    const unrealizedCancelReturn = gmv - realizedGross;
    const discount = sum('discount_idr');
    const netSales = sum('net_sales_idr');
    const fee = sum('marketplace_fee_idr');
    const cogs = sum('cogs_idr');
    const returnLoss = sum('return_shipping_loss_idr');
    const cmBeforeAds = sum('cm_before_ads_idr');
    const adSpend = sum('ad_spend_idr');
    const netProfit = sum('net_profit_idr');
    const newCust = sum('new_customers');
    const totalOrders = sum('total_orders');
    const completedOrders = sum('completed_orders');
    const failedOrders = sum('returned_orders') + sum('cancelled_orders');

    const vanityRoas = adSpend > 0 ? (gmv / adSpend).toFixed(2) : '0.00';
    const contribRoas = adSpend > 0 ? (cmBeforeAds / adSpend).toFixed(2) : '0.00';
    const cac = newCust > 0 ? Math.round(adSpend / newCust) : 0;
    const netMarginPct = netSales > 0 ? ((netProfit * 100) / netSales).toFixed(1) : '0.0';
    const failRatePct = totalOrders > 0 ? ((failedOrders * 100) / totalOrders).toFixed(1) : '0.0';

    return {
      gmv,
      realizedGross,
      unrealizedCancelReturn,
      discount,
      netSales,
      fee,
      cogs,
      returnLoss,
      cmBeforeAds,
      adSpend,
      netProfit,
      newCust,
      totalOrders,
      completedOrders,
      failedOrders,
      vanityRoas,
      contribRoas,
      cac,
      netMarginPct,
      failRatePct,
    };
  }, [channelSummary, selectedChannel]);

  const waterfallData = useMemo(() => {
    return [
      { name: '1. GMV Gross', value: Math.round(kpi.gmv / 1_000_000), color: '#1E3A8A' },
      { name: '2. Batal/Retur', value: -Math.round(kpi.unrealizedCancelReturn / 1_000_000), color: '#991B1B' },
      { name: '3. Diskon Promo', value: -Math.round(kpi.discount / 1_000_000), color: '#B45309' },
      { name: '4. Net Sales', value: Math.round(kpi.netSales / 1_000_000), color: '#1D4ED8' },
      { name: '5. HPP (COGS)', value: -Math.round(kpi.cogs / 1_000_000), color: '#991B1B' },
      { name: '6. Fee Platform', value: -Math.round(kpi.fee / 1_000_000), color: '#B45309' },
      { name: '7. Biaya Iklan', value: -Math.round(kpi.adSpend / 1_000_000), color: '#7C2D12' },
      {
        name: '8. Net Profit',
        value: Math.round(kpi.netProfit / 1_000_000),
        color: kpi.netProfit >= 0 ? '#166534' : '#991B1B',
      },
    ];
  }, [kpi]);

  const monthlyTrend = useMemo(() => {
    const months = [...new Set(channelMonthly.map((r) => r.year_month))];
    return months.map((ym) => {
      const rows = channelMonthly.filter(
        (r) => r.year_month === ym && (selectedChannel === 'ALL' || r.channel === selectedChannel)
      );
      const sum = (k) => rows.reduce((a, b) => a + Number(b[k] || 0), 0);
      return {
        month: ym,
        GMV_Jt: Math.round(sum('gmv_gross_idr') / 1_000_000),
        Net_Sales_Jt: Math.round(sum('net_sales_idr') / 1_000_000),
        Ad_Spend_Jt: Math.round(sum('ad_spend_idr') / 1_000_000),
        Net_Profit_Jt: Math.round(sum('net_profit_idr') / 1_000_000),
      };
    });
  }, [channelMonthly, selectedChannel]);

  const retentionChartData = useMemo(() => {
    return [0, 1, 2, 3, 4].map((m) => {
      const row = { month: `M+${m}` };
      retentionCurveRaw
        .filter((r) => Number(r.month_number) === m)
        .forEach((r) => {
          row[r.channel] = Number(r.retention_pct);
        });
      return row;
    });
  }, [retentionCurveRaw]);

  const pnlStatementRows = [
    { label: 'Gross Merchandise Value (GMV Reported)', amount: kpi.gmv, pct: 100.0, bold: true },
    {
      label: 'Less: Cancelled & Returned Orders (Unrealized)',
      amount: -kpi.unrealizedCancelReturn,
      pct: kpi.gmv ? (-kpi.unrealizedCancelReturn * 100) / kpi.gmv : 0,
    },
    {
      label: 'Less: Promotional Voucher & Flash Sale Discounts',
      amount: -kpi.discount,
      pct: kpi.gmv ? (-kpi.discount * 100) / kpi.gmv : 0,
    },
    {
      label: 'REALIZED NET SALES (REVENUE BASE)',
      amount: kpi.netSales,
      pct: kpi.gmv ? (kpi.netSales * 100) / kpi.gmv : 0,
      bold: true,
      subtotal: true,
    },
    {
      label: 'Less: Cost of Goods Sold (SKU HPP)',
      amount: -kpi.cogs,
      pct: kpi.netSales ? (-kpi.cogs * 100) / kpi.netSales : 0,
    },
    {
      label: 'Less: Marketplace Commission & Payment Fees',
      amount: -kpi.fee,
      pct: kpi.netSales ? (-kpi.fee * 100) / kpi.netSales : 0,
    },
    {
      label: 'Less: Return Shipping Penalty (RTO Loss)',
      amount: -kpi.returnLoss,
      pct: kpi.netSales ? (-kpi.returnLoss * 100) / kpi.netSales : 0,
    },
    {
      label: 'CONTRIBUTION MARGIN BEFORE ADS (CM1)',
      amount: kpi.cmBeforeAds,
      pct: kpi.netSales ? (kpi.cmBeforeAds * 100) / kpi.netSales : 0,
      bold: true,
      subtotal: true,
    },
    {
      label: 'Less: Performance Marketing Spend (Meta & TikTok Ads)',
      amount: -kpi.adSpend,
      pct: kpi.netSales ? (-kpi.adSpend * 100) / kpi.netSales : 0,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Executive Masthead & Filter */}
      <section className="border-b-2 border-[#141413] pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#991B1B] font-bold">
            SECTION 05 // AUDITED P&amp;L STATEMENT &amp; EXECUTIVE BI REPORT
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#141413] leading-tight">
            Ekatunggal Group — Rekonsiliasi Laba-Rugi &amp; Kinerja Cabang Distribusi (H1 2026)
          </h1>
          <p className="text-xs md:text-sm text-[#3D3C3A]">
            Pilih filter cabang distribusi di sebelah kanan untuk mengisolasi struktur biaya logistik dan profitabilitas bersih.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/EKATUNGGAL_H1_2026_EXECUTIVE_AUDIT_REPORT.pdf"
            download="EKATUNGGAL_H1_2026_EXECUTIVE_AUDIT_REPORT.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#991B1B] text-[#FAF9F5] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#7F1D1D] transition border border-[#991B1B]"
          >
            ↓ DOWNLOAD AUDITED PDF REPORT (A4)
          </a>

          <div className="flex border border-[#141413] bg-white font-mono text-xs shrink-0">
            {[
              { id: 'ALL', label: 'CONSOLIDATED (ALL)' },
              { id: 'Cabang Luar Pulau', label: 'CABANG LUAR PULAU' },
              { id: 'Cabang Jawa', label: 'CABANG JAWA' },
              { id: 'Gudang Pusat', label: 'GUDANG PUSAT' },
            ].map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`px-3.5 py-2 border-r last:border-r-0 border-[#141413] transition ${
                  selectedChannel === ch.id
                    ? 'bg-[#141413] text-[#FAF9F5] font-bold'
                    : 'bg-white text-[#141413] hover:bg-[#F2F0E8]'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* High-Density Accounting KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border border-[#141413] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#141413]">
        <div className="p-4 space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6E6D68]">
            01 // REPORTED GMV (GROSS)
          </div>
          <div className="font-mono text-xl font-bold text-[#141413]">{formatMillions(kpi.gmv)}</div>
          <div className="font-mono text-[11px] text-[#52514E]">
            {kpi.totalOrders.toLocaleString('id-ID')} orders ({kpi.failRatePct}% batal/retur)
          </div>
        </div>

        <div className="p-4 space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6E6D68]">
            02 // REALIZED NET SALES
          </div>
          <div className="font-mono text-xl font-bold text-[#141413]">{formatMillions(kpi.netSales)}</div>
          <div className="font-mono text-[11px] text-[#991B1B]">
            Diskon: ({formatMillions(kpi.discount)})
          </div>
        </div>

        <div className="p-4 space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6E6D68]">
            03 // VANITY VS CONTRIB. ROAS
          </div>
          <div className="font-mono text-xl font-bold text-[#141413]">
            {kpi.vanityRoas}x <span className="text-xs font-normal text-[#6E6D68]">vs</span>{' '}
            <span className={Number(kpi.contribRoas) >= 1.0 ? 'text-[#166534]' : 'text-[#991B1B]'}>
              {kpi.contribRoas}x
            </span>
          </div>
          <div className="font-mono text-[11px] text-[#52514E]">
            Ad Spend: {formatMillions(kpi.adSpend)}
          </div>
        </div>

        <div className="p-4 space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6E6D68]">
            04 // BLENDED CAC
          </div>
          <div className="font-mono text-xl font-bold text-[#141413]">{formatMillions(kpi.cac)}</div>
          <div className="font-mono text-[11px] text-[#52514E]">
            {kpi.newCust.toLocaleString('id-ID')} pelanggan baru
          </div>
        </div>

        <div
          className={`p-4 space-y-1 ${
            kpi.netProfit >= 0 ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]'
          }`}
        >
          <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#141413]">
            05 // REAL NET PROFIT (CASH)
          </div>
          <div
            className={`font-mono text-xl font-bold ${
              kpi.netProfit >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'
            }`}
          >
            {formatMillions(kpi.netProfit)}
          </div>
          <div
            className={`font-mono text-[11px] font-semibold ${
              kpi.netProfit >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'
            }`}
          >
            Net Margin: {kpi.netMarginPct}% of Net Sales
          </div>
        </div>
      </section>

      {/* Row 1: Audited P&L Statement Table + Visual Unit Economics Bridge */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Accounting P&L Table */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#141413] pb-2">
            <h2 className="font-serif text-xl font-bold text-[#141413]">
              5.1. Neraca Laba-Rugi Unit Economics ({selectedChannel})
            </h2>
            <span className="font-mono text-[11px] text-[#6E6D68]">DALAM RUPIAH PENUH</span>
          </div>

          <div className="border border-[#141413] bg-white">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-[#F2F0E8] border-b border-[#141413]">
                  <th className="py-2.5 px-3">KOMPONEN LABA-RUGI (P&amp;L LINE ITEM)</th>
                  <th className="py-2.5 px-3 text-right">NOMINAL (IDR)</th>
                  <th className="py-2.5 px-3 text-right">% PORSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DF]">
                {pnlStatementRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`${row.subtotal ? 'bg-[#FAF9F5] border-t border-b border-[#141413]' : ''}`}
                  >
                    <td className={`py-2 px-3 ${row.bold ? 'font-bold text-[#141413]' : 'text-[#3D3C3A] pl-5'}`}>
                      {row.label}
                    </td>
                    <td
                      className={`py-2 px-3 text-right ${
                        row.amount < 0
                          ? 'text-[#991B1B]'
                          : row.bold
                          ? 'font-bold text-[#141413]'
                          : 'text-[#141413]'
                      }`}
                    >
                      {formatAccountingIDR(row.amount)}
                    </td>
                    <td className="py-2 px-3 text-right text-[#6E6D68]">{row.pct.toFixed(1)}%</td>
                  </tr>
                ))}
                {/* Double-ruled Bottom Line */}
                <tr
                  className={`border-t-2 border-b-4 border-double border-[#141413] ${
                    kpi.netProfit >= 0 ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]'
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-[#141413]">
                    NET CONTRIBUTION PROFIT / (LOSS) AFTER ADS
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-bold ${
                      kpi.netProfit >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'
                    }`}
                  >
                    {formatAccountingIDR(kpi.netProfit)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-bold ${
                      kpi.netProfit >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'
                    }`}
                  >
                    {kpi.netMarginPct}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Waterfall Chart */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#141413] pb-2">
            <h2 className="font-serif text-xl font-bold text-[#141413]">
              5.2. Visualisasi Erosi Margin (Dalam Juta Rupiah)
            </h2>
            <span className="font-mono text-[11px] text-[#6E6D68]">WATERFALL BRIDGE</span>
          </div>

          <div className="border border-[#141413] bg-white p-4 h-[370px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData} margin={{ top: 15, right: 15, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E5E4DF" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#141413', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: '#141413', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  unit=" Jt"
                />
                <ReferenceLine y={0} stroke="#141413" strokeWidth={1.5} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#141413',
                    borderRadius: '0px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                  }}
                  formatter={(value) => [`Rp ${value} Juta`, 'Nominal']}
                />
                <Bar dataKey="value">
                  {waterfallData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Row 2: Channel Head-to-Head Comparison Table */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between border-b border-[#141413] pb-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              5.3. Matriks Audit Komparatif Antar Kanal Penjualan (Bukti Empiris Ilusi ROAS)
            </h2>
            <p className="text-xs text-[#52514E]">
              Perhatikan bagaimana TikTok Shop memimpin dalam volume GMV kotor, namun menjadi satu-satunya kanal yang
              mencetak arus kas bersih negatif setelah seluruh biaya variabel dan iklan diperhitungkan.
            </p>
          </div>
          <span className="font-mono text-xs text-[#991B1B] font-bold">CHANNEL P&amp;L AUDIT</span>
        </div>

        <div className="overflow-x-auto border border-[#141413] bg-white">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#F2F0E8] border-b border-[#141413]">
                <th className="py-2.5 px-3">SALES CHANNEL</th>
                <th className="py-2.5 px-3 text-right">ORDERS</th>
                <th className="py-2.5 px-3 text-right">FAIL %</th>
                <th className="py-2.5 px-3 text-right">REPORTED GMV</th>
                <th className="py-2.5 px-3 text-right">DISCOUNT + FEE</th>
                <th className="py-2.5 px-3 text-right">AD SPEND</th>
                <th className="py-2.5 px-3 text-right">VANITY ROAS</th>
                <th className="py-2.5 px-3 text-right">CONTRIB. ROAS</th>
                <th className="py-2.5 px-3 text-right">REAL NET PROFIT</th>
                <th className="py-2.5 px-3 text-right">NET MARGIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D6CE]">
              {channelSummary.map((row) => {
                const isLoss = Number(row.net_profit_idr) < 0;
                return (
                  <tr
                    key={row.channel}
                    className={`hover:bg-[#FAF9F5] ${
                      selectedChannel === row.channel ? 'bg-[#F2F0E8]' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-[#141413]">{row.channel}</td>
                    <td className="py-3 px-3 text-right">{row.total_orders.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-3 text-right text-[#991B1B]">{row.fail_rate_pct}%</td>
                    <td className="py-3 px-3 text-right">{formatMillions(row.gmv_gross_idr)}</td>
                    <td className="py-3 px-3 text-right text-[#991B1B]">
                      ({formatMillions(Number(row.discount_idr) + Number(row.marketplace_fee_idr))})
                    </td>
                    <td className="py-3 px-3 text-right">{formatMillions(row.ad_spend_idr)}</td>
                    <td className="py-3 px-3 text-right font-semibold">{row.vanity_roas}x</td>
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        Number(row.contribution_roas) >= 1.0 ? 'text-[#166534]' : 'text-[#991B1B]'
                      }`}
                    >
                      {row.contribution_roas}x
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        isLoss ? 'text-[#991B1B]' : 'text-[#166534]'
                      }`}
                    >
                      {formatAccountingIDR(row.net_profit_idr)}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        isLoss ? 'text-[#991B1B]' : 'text-[#166534]'
                      }`}
                    >
                      {row.net_margin_pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Row 3: Monthly Trajectory & Channel Retention Curve */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#141413] pb-2">
            <h2 className="font-serif text-xl font-bold text-[#141413]">
              5.4. Tren Bulanan: GMV vs Net Sales vs Real Net Profit (Juta IDR)
            </h2>
            <span className="font-mono text-[11px] text-[#6E6D68]">JAN–JUN 2026</span>
          </div>
          <div className="border border-[#141413] bg-white p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E5E4DF" />
                <XAxis dataKey="month" tick={{ fill: '#141413', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fill: '#141413', fontSize: 11, fontFamily: 'JetBrains Mono' }} unit=" Jt" />
                <ReferenceLine y={0} stroke="#141413" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#141413',
                    borderRadius: '0px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                  }}
                  formatter={(value) => [`Rp ${value} Juta`]}
                />
                <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }} />
                <Line type="monotone" dataKey="GMV_Jt" name="GMV (Gross)" stroke="#1E3A8A" strokeWidth={2} />
                <Line type="monotone" dataKey="Net_Sales_Jt" name="Net Sales" stroke="#52514E" strokeWidth={2} />
                <Line type="monotone" dataKey="Ad_Spend_Jt" name="Ad Spend" stroke="#B45309" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="Net_Profit_Jt"
                  name="Real Net Profit"
                  stroke="#166534"
                  strokeWidth={2.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#141413] pb-2">
            <h2 className="font-serif text-xl font-bold text-[#141413]">
              5.5. Kurva Retensi Kohort per Kanal (M0–M+4)
            </h2>
            <span className="font-mono text-[11px] text-[#6E6D68]">RETENTION DECAY</span>
          </div>
          <div className="border border-[#141413] bg-white p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionChartData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E5E4DF" />
                <XAxis dataKey="month" tick={{ fill: '#141413', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fill: '#141413', fontSize: 11, fontFamily: 'JetBrains Mono' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#141413',
                    borderRadius: '0px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                  }}
                  formatter={(v) => [`${v}% aktif`]}
                />
                <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }} />
                <Line type="monotone" dataKey="Website" stroke="#166534" strokeWidth={2.5} />
                <Line type="monotone" dataKey="Shopee" stroke="#1E3A8A" strokeWidth={2} />
                <Line type="monotone" dataKey="TikTok Shop" stroke="#991B1B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Formal Boardroom Memorandum */}
      <section className="border-2 border-[#141413] bg-white p-6 md:p-8 space-y-6">
        <div className="border-b-2 border-[#141413] pb-4 grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
          <div>
            <div>
              <strong>KEPADA:</strong> DIREKSI &amp; MANAJEMEN OPERASIONAL
            </div>
            <div>
              <strong>DARI:</strong> TIM ANALISIS DATA &amp; KEUANGAN
            </div>
          </div>
          <div className="md:text-right">
            <div>
              <strong>HAL:</strong> REKOMENDASI EFISIENSI MARGIN &amp; LOGISTIK KUARTAL III 2026
            </div>
            <div>
              <strong>SIFAT:</strong> LAPORAN INTERNAL
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#D8D6CE]">
          <div className="space-y-2 pr-2">
            <div className="font-mono text-xs font-bold text-[#991B1B]">
              ARAHAN 01 // DISKON &amp; LOGISTIK LUAR PULAU
            </div>
            <h3 className="font-serif text-lg font-bold text-[#141413]">
              Batasi Plafon Diskon Grosir Maksimal 15%
            </h3>
            <p className="text-xs text-[#3D3C3A] leading-relaxed">
              Audit data membuktikan bahwa kombinasi diskon grosir 20–35%, biaya kargo kontainer antarpulau, dan retur
              kerusakan transit sebesar 16,4% membuat margin kontribusi Cabang Luar Pulau minus Rp 93,4 juta. Diskon di atas
              15% harus mensyaratkan skema <em>Free On Board (FOB)</em> di mana ongkos angkut ditanggung pembeli.
            </p>
          </div>

          <div className="space-y-2 md:pl-6 pr-2 pt-4 md:pt-0">
            <div className="font-mono text-xs font-bold text-[#166534]">
              ARAHAN 02 // REPLIKASI MODEL GUDANG PUSAT
            </div>
            <h3 className="font-serif text-lg font-bold text-[#141413]">
              Tingkatkan Penetrasi Pabrik Matras Jawa &amp; Jabodetabek
            </h3>
            <p className="text-xs text-[#3D3C3A] leading-relaxed">
              <strong>Gudang Pusat</strong> mencatat rasio repeat order tertinggi (39,6%) dengan tingkat retur sangat rendah
              (2,9%) dan laba bersih positif Rp 107,2 juta. Alihkan sebagian fokus pengiriman ke konsentrasi klaster industri
              mebel di Jabodetabek dan Jawa Tengah yang memiliki perputaran piutang (TOP) lebih lancar.
            </p>
          </div>

          <div className="space-y-2 md:pl-6 pt-4 md:pt-0">
            <div className="font-mono text-xs font-bold text-[#141413]">
              ARAHAN 03 // MONITORING KLIEN AT-RISK
            </div>
            <h3 className="font-serif text-lg font-bold text-[#141413]">
              Kunjungan Penjualan untuk Klien Berulang Pasif
            </h3>
            <p className="text-xs text-[#3D3C3A] leading-relaxed">
              Data RFM mengidentifikasi <strong>159 pabrik mitra (segmen At-Risk)</strong> yang memiliki riwayat transaksi rata-rata
              Rp 4 juta namun belum melakukan pemesanan kembali dalam 100 hari terakhir. Tim sales lapangan disarankan melakukan kunjungan
              langsung untuk memeriksa kebutuhan stok kawat per dan busa mereka.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
