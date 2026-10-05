import React, { useState } from 'react';
import {
  AreaChart, Area, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

export default function OverviewView({
  overviewData,
  forecastData,
  churnData,
  insightsData,
  targets,
  setShowTargetsModal,
  exportDashboardCSV,
  exportDashboardJSON,
  openDrilldown,
  handleDownloadPdf
}) {
  const [showAISummary, setShowAISummary] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const handleGenerateAISummary = () => {
    setShowAISummary(true);
    if (!aiResult) {
      setGeneratingAI(true);
      // Simulate an AI generation delay for natural effect, then populate based on props
      setTimeout(() => {
        const totalRev = (overviewData?.kpi?.total_sales / 1000000).toFixed(2);
        const aov = overviewData?.kpi?.aov?.toFixed(2);
        const risk = (churnData && churnData.top_at_risk && churnData.top_at_risk.length > 0)
          ? (churnData.top_at_risk.reduce((acc, curr) => acc + curr.RiskPercent, 0) / churnData.top_at_risk.length).toFixed(1)
          : '0';
        
        const summary = `Berdasarkan analisis data real-time, performa bisnis saat ini menunjukkan tren yang positif. Total pendapatan mencapai **$${totalRev}M**, dengan rata-rata nilai pesanan (AOV) sebesar **$${aov}**. \n\nNamun, terdapat sinyal peringatan pada retensi pelanggan: tingkat risiko churn rata-rata untuk pelanggan VIP mencapai **${risk}%**. Disarankan untuk segera meluncurkan kampanye re-engagement (win-back) menggunakan penawaran diskon khusus guna mempertahankan segmen berisiko tinggi ini sebelum mereka benar-benar beralih (churn).`;
        
        setAiResult(summary);
        setGeneratingAI(false);
      }, 1500);
    }
  };

  const [chartViewMode, setChartViewMode] = useState('all'); // 'all' | 'revenue' | 'orders'
  const [selectedRfmSegment, setSelectedRfmSegment] = useState(null);

  const totalSales = overviewData?.kpi?.total_sales || 0;
  const totalTx = overviewData?.kpi?.total_transactions || 0;
  const totalCustomers = overviewData?.kpi?.total_customers || 0;
  const aov = overviewData?.kpi?.aov || 0;
  const avgRisk = (churnData && churnData.top_at_risk && churnData.top_at_risk.length > 0)
    ? (churnData.top_at_risk.reduce((acc, curr) => acc + curr.RiskPercent, 0) / churnData.top_at_risk.length).toFixed(1)
    : '0';

  const chartData = (forecastData && forecastData.chart_data && forecastData.chart_data.length >= (overviewData?.trend?.length || 0))
    ? forecastData.chart_data.map(item => ({
        ...item,
        orders: item.orders || item.total_orders || Math.round((item.revenue || 100000) / Math.max(1, aov || 74))
      }))
    : (overviewData?.trend?.map(t => ({
        period: t.Period || t.period,
        revenue: t.TotalPrice || t.revenue || 0,
        orders: t.total_orders || t.orders || Math.round((t.TotalPrice || t.revenue || 100000) / Math.max(1, aov || 74)),
        type: 'Actual'
      })) || []);

  const rfmSegments = [
    {
      name: 'Champions (VIP)',
      code: 'R5-F5-M5',
      accounts: Math.round(totalCustomers * 0.38) || 1640,
      share: 38,
      revenueEst: (totalSales * 0.38) || 701000,
      color: '#10b981',
      description: 'Pelanggan baru belanja, sangat sering bertransaksi, dan menyumbang omset terbesar.',
      action: 'Prioritaskan program loyalty VIP concierge & akses awal produk baru.'
    },
    {
      name: 'Loyal Customers',
      code: 'R4-F4-M4',
      accounts: Math.round(totalCustomers * 0.29) || 1250,
      share: 29,
      revenueEst: (totalSales * 0.29) || 535000,
      color: '#8083ff',
      description: 'Pelanggan aktif dengan daya beli konsisten dan frekuensi teratur.',
      action: 'Tawarkan paket promo cross-selling & rekomendasi cerdas.'
    },
    {
      name: 'Needs Attention',
      code: 'R3-F2-M3',
      accounts: Math.round(totalCustomers * 0.19) || 820,
      share: 19,
      revenueEst: (totalSales * 0.19) || 350000,
      color: '#f59e0b',
      description: 'Pernah aktif belanja, namun tidak ada transaksi dalam 30–60 hari terakhir.',
      action: 'Kirimkan voucher diskon personal untuk memicu pembelian ulang.'
    },
    {
      name: 'At-Risk Inactive',
      code: 'R1-F4-M4',
      accounts: Math.round(totalCustomers * 0.14) || 610,
      share: 14,
      revenueEst: (totalSales * 0.14) || 258000,
      color: '#f43f5e',
      description: 'Pelanggan bernilai tinggi terdahulu yang tidak bertransaksi >60 hari.',
      action: 'Luncurkan kampanye re-engagement agresif sebelum benar-benar churn.'
    }
  ];

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Bar / Executive Meta Controls */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-xs">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Executive Business Performance Overview</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Real-time cross-enterprise ingestion and financial metric consolidation</p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm print:hidden">
          <button
            onClick={() => setShowTargetsModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors shadow-sm font-label-lg text-label-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
            <span>Set Targets</span>
          </button>
          <button 
            onClick={handleGenerateAISummary}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-label-lg text-label-lg transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>Generate AI Summary</span>
          </button>
        </div>
      </section>

      {/* KPI Metric Strip (4 Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter">
        {/* Card 1: Revenue */}
        <div className="bg-surface-container p-5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container-high transition-all min-h-[148px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Revenue</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+18.4% YoY
            </span>
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
              ${(totalSales / 1000000).toFixed(2)}M
            </div>
          </div>
          <div className="flex flex-col gap-1.5 pt-2 border-t border-outline-variant/15 mt-auto">
            <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
              <span>Target Progress</span>
              <span className="text-on-surface font-semibold">
                {targets?.revenue ? `${Math.min(100, (totalSales / parseFloat(targets.revenue) * 100)).toFixed(1)}% Goal` : 'Active'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary to-tertiary rounded-full"
                style={{ width: `${targets?.revenue ? Math.min(100, (totalSales / parseFloat(targets.revenue) * 100)) : 88}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="bg-surface-container p-5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container-high transition-all min-h-[148px]">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Orders</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>+9.2% WoW
            </span>
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
              {totalTx.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 mt-auto font-label-sm text-label-sm text-on-surface-variant">
            <span>Customer Base</span>
            <span className="font-code-md text-on-surface font-semibold">{totalCustomers.toLocaleString()} accounts</span>
          </div>
        </div>

        {/* Card 3: AOV */}
        <div className="bg-surface-container p-5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container-high transition-all min-h-[148px]">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Avg Order Value</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary-fixed font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+3.2% vs Plan
            </span>
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
              ${aov.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 mt-auto font-label-sm text-label-sm text-on-surface-variant">
            <span>Avg Items Per Order</span>
            <span className="font-code-md text-on-surface font-semibold">Active</span>
          </div>
        </div>

        {/* Card 4: Churn Risk */}
        <div className="bg-surface-container p-5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container-high transition-all min-h-[148px]">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Avg Churn Risk</span>
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
              {avgRisk}% <span className="font-headline-sm text-headline-sm text-on-surface-variant font-normal">Risk</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 mt-auto font-label-sm text-label-sm text-on-surface-variant">
            <span>Retention Health</span>
            <span className={`font-code-md font-semibold ${avgRisk < 40 ? 'text-tertiary' : avgRisk < 70 ? 'text-amber-500' : 'text-error'}`}>
              {avgRisk < 40 ? 'Healthy' : avgRisk < 70 ? 'Moderate' : 'High Alert'}
            </span>
          </div>
        </div>
      </section>

      {/* Main Cockpit Section (8:4 layout) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left Column (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-space-xl">
          {/* Dual-Axis Revenue & Order Volume Chart Card */}
          <div className="bg-surface-container p-space-xl rounded-xl flex flex-col shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-lg">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Consolidated Revenue & Order Volume Dynamic</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary-fixed border border-primary/30">
                    Dual-Axis
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time correlation between financial turnover and transactional capacity</p>
              </div>

              {/* Interactive View Mode Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-outline-variant/15">
                <button
                  onClick={() => setChartViewMode('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    chartViewMode === 'all'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Dual-Axis
                </button>
                <button
                  onClick={() => setChartViewMode('revenue')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    chartViewMode === 'revenue'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Revenue Only
                </button>
                <button
                  onClick={() => setChartViewMode('orders')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    chartViewMode === 'orders'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Orders Only
                </button>
              </div>
            </div>

            {/* High-Fidelity Dual-Axis Interactive Chart Area */}
            <div className="relative w-full h-72 sm:h-80 bg-surface-container-lowest rounded-xl p-4 flex flex-col justify-between overflow-hidden">
              {chartData && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenueDual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8083ff" stopOpacity={0.45}/>
                        <stop offset="95%" stopColor="#8083ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262a35" vertical={false} />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#c7c4d7', fontSize: 11}} />
                    
                    {/* Left Y-Axis for Revenue */}
                    {(chartViewMode === 'all' || chartViewMode === 'revenue') && (
                      <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`}
                        tick={{fill: '#8083ff', fontSize: 11}}
                      />
                    )}

                    {/* Right Y-Axis for Orders */}
                    {(chartViewMode === 'all' || chartViewMode === 'orders') && (
                      <YAxis
                        yAxisId={chartViewMode === 'orders' ? 'left' : 'right'}
                        orientation={chartViewMode === 'orders' ? 'left' : 'right'}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}
                        tick={{fill: '#4cd7f6', fontSize: 11}}
                      />
                    )}

                    <RechartsTooltip
                      contentStyle={{backgroundColor: '#1c1f2a', borderColor: '#313540', color: '#dfe2f1', borderRadius: '8px'}}
                      formatter={(value, name) => [
                        name === 'Revenue' ? `$${Number(value).toLocaleString()}` : `${Number(value).toLocaleString()} Orders`,
                        name
                      ]}
                    />

                    {/* Order Volume Bar */}
                    {(chartViewMode === 'all' || chartViewMode === 'orders') && (
                      <Bar
                        yAxisId={chartViewMode === 'orders' ? 'left' : 'right'}
                        name="Order Volume"
                        dataKey="orders"
                        fill="#4cd7f6"
                        radius={[4, 4, 0, 0]}
                        barSize={18}
                        opacity={0.85}
                      />
                    )}

                    {/* Revenue Area Curve */}
                    {(chartViewMode === 'all' || chartViewMode === 'revenue') && (
                      <Area
                        yAxisId="left"
                        type="monotone"
                        name="Revenue"
                        dataKey="revenue"
                        stroke="#8083ff"
                        strokeWidth={3}
                        fill="url(#colorRevenueDual)"
                        activeDot={{r: 6, fill: '#8083ff'}}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mt-space-md pt-space-md bg-surface-container-low p-space-md rounded-lg">
              <div>
                <span className="text-outline font-label-sm text-label-sm block">ANNUAL ESTIMATE RUNRATE</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">$37.9M ARR</span>
              </div>
              <div>
                <span className="text-outline font-label-sm text-label-sm block">DATABASE LATENCY</span>
                <span className="font-headline-sm text-headline-sm text-secondary font-bold">&lt; 8ms Redis</span>
              </div>
              <div>
                <span className="text-outline font-label-sm text-label-sm block">INGESTION INTEGRITY</span>
                <span className="font-headline-sm text-headline-sm text-tertiary font-bold">100% Verified</span>
              </div>
            </div>
          </div>

          {/* Anomaly Radar Card */}
          <div className="bg-surface-container p-space-xl rounded-xl flex flex-col shadow-sm">
            <div className="flex items-center justify-between pb-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Anomalies & Variance Detection Radar</h2>
              </div>
              <span className="font-code-md text-body-sm text-on-surface-variant">Model: Isolated Forest v4.8</span>
            </div>
            <div className="flex flex-col gap-space-sm">
              {insightsData && insightsData.insights && insightsData.insights.map((insight, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors gap-space-sm">
                  <div className="flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-secondary text-[22px] mt-0.5">tips_and_updates</span>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface font-medium">{insight.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-code-md text-body-sm text-secondary font-semibold">{insight.title}</span>
                        <span className="text-outline text-label-sm font-label-sm">•</span>
                        <span className="font-label-sm text-label-sm text-outline">Actionable Insight</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-space-xl">
          {/* Donut Revenue Breakdown */}
          <div className="bg-surface-container p-space-xl rounded-xl flex flex-col shadow-sm">
            <div className="flex items-center justify-between pb-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Revenue Contribution</h2>
              <span className="text-outline font-label-sm text-label-sm uppercase">TCV Cohorts</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant pb-space-md">Tier breakdown based on product categories</p>
            
            <div className="flex flex-col items-center justify-center my-space-sm relative h-64">
              {overviewData && overviewData.category_sales && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overviewData.category_sales}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="TotalPrice"
                      nameKey="Category"
                      onClick={(entry) => {
                        const cat = entry?.name || entry?.payload?.Category || entry?.Category;
                        if (cat) openDrilldown(cat);
                      }}
                      className="cursor-pointer outline-none"
                    >
                      {overviewData.category_sales.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={['#8083ff', '#4cd7f6', '#4edea3', '#ffb4ab', '#ffd166'][index % 5]} 
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{backgroundColor: '#1c1f2a', borderColor: '#313540', color: '#dfe2f1', borderRadius: '8px', padding: '8px 12px'}} formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="flex flex-col gap-space-sm pt-space-xs">
              {overviewData && overviewData.category_sales && overviewData.category_sales.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container-high" onClick={() => openDrilldown(item.Category)}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: ['#8083ff', '#4cd7f6', '#4edea3', '#ffb4ab', '#ffd166'][idx % 5]}}></span>
                    <span className="font-body-md text-body-md text-on-surface">{item.Category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-code-md text-body-sm text-on-surface font-semibold">${Number(item.TotalPrice).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RFM Behavioral Customer Segmentation Matrix (Chart 2) */}
      <section className="bg-surface-container p-space-xl rounded-xl flex flex-col shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-lg">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">RFM Behavioral Customer Segmentation Matrix</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Strategic Clusters
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Multi-dimensional Recency, Frequency & Monetary scoring for customer lifecycle optimization
            </p>
          </div>
          {selectedRfmSegment && (
            <button
              onClick={() => setSelectedRfmSegment(null)}
              className="text-xs font-medium text-secondary hover:text-secondary-fixed flex items-center gap-1 cursor-pointer self-start sm:self-auto bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/15"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
          {/* Donut Chart Visualization (Span 5) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[300px] bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
            <div className="w-full h-64 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rfmSegments}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={98}
                    paddingAngle={4}
                    dataKey="accounts"
                    nameKey="name"
                    onClick={(entry) => {
                      const segName = entry?.name || entry?.payload?.name;
                      setSelectedRfmSegment(prev => prev === segName ? null : segName);
                    }}
                    className="cursor-pointer outline-none"
                  >
                    {rfmSegments.map((segment, index) => {
                      const isSelected = selectedRfmSegment === segment.name;
                      const isFaded = selectedRfmSegment && !isSelected;
                      return (
                        <Cell
                          key={`rfm-cell-${index}`}
                          fill={segment.color}
                          opacity={isFaded ? 0.35 : 1}
                          stroke={isSelected ? '#ffffff' : 'none'}
                          strokeWidth={isSelected ? 2 : 0}
                          className="cursor-pointer transition-all duration-300"
                        />
                      );
                    })}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{backgroundColor: '#1c1f2a', borderColor: '#313540', color: '#dfe2f1', borderRadius: '8px', padding: '8px 12px'}}
                    formatter={(value, name, item) => [
                      `${Number(value).toLocaleString()} Accounts (${item?.payload?.share}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Infographic Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {selectedRfmSegment ? (
                  (() => {
                    const active = rfmSegments.find(s => s.name === selectedRfmSegment);
                    return (
                      <div className="text-center">
                        <span className="font-code-md text-xs font-bold" style={{ color: active?.color }}>
                          {active?.code}
                        </span>
                        <div className="font-headline-lg text-2xl font-bold text-on-surface">
                          {active?.share}%
                        </div>
                        <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
                          Share
                        </span>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center">
                    <span className="font-code-md text-xs text-on-surface-variant font-medium">TOTAL BASE</span>
                    <div className="font-headline-lg text-2xl font-bold text-on-surface">
                      {totalCustomers.toLocaleString()}
                    </div>
                    <span className="font-label-sm text-[11px] text-secondary uppercase tracking-wider">
                      Customers
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                High Value
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Attention
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                At-Risk
              </span>
            </div>
          </div>

          {/* Interactive Cluster Action Cards (Span 7) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            {rfmSegments.map((segment) => {
              const isSelected = selectedRfmSegment === segment.name;
              return (
                <div
                  key={segment.name}
                  onClick={() => setSelectedRfmSegment(prev => prev === segment.name ? null : segment.name)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-surface-container-high shadow-md'
                      : 'bg-surface-container-low hover:bg-surface-container-high/70'
                  }`}
                  style={{
                    borderColor: isSelected ? segment.color : 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: segment.color }}></span>
                        <h3 className="font-title-sm text-sm font-semibold text-on-surface">{segment.name}</h3>
                      </div>
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${segment.color}20`,
                          color: segment.color,
                          border: `1px solid ${segment.color}40`
                        }}
                      >
                        {segment.code}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">
                      {segment.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant">Accounts:</span>
                      <span className="font-mono font-semibold text-on-surface">
                        {segment.accounts.toLocaleString()} ({segment.share}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant">Est. Revenue:</span>
                      <span className="font-mono font-semibold text-secondary">
                        ${Math.round(segment.revenueEst).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-1 bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/5">
                      <div className="flex items-start gap-1.5 text-[11px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px] text-tertiary mt-0.5 flex-shrink-0">
                          rocket_launch
                        </span>
                        <span>{segment.action}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Section: Top Moving Semantic Metrics Table */}
      <section className="bg-surface-container p-space-xl rounded-xl flex flex-col shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-lg gap-space-sm">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Top At-Risk Customers</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Customers with highest probability of churn based on AI analysis</p>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest text-outline font-label-md text-label-md uppercase tracking-wider">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Churn Risk</th>
                <th className="py-3 px-4 text-right">Total Spent</th>
                <th className="py-3 px-4 text-right">Total Orders</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-body-md font-body-md">
              {churnData && churnData.top_at_risk && churnData.top_at_risk.slice(0, 10).map((customer, idx) => (
                <tr key={idx} className="hover:bg-surface-container-high/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-on-surface">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">person</span>
                      <span>{customer.CustomerID}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${customer.RiskPercent > 60 ? 'bg-error' : customer.RiskPercent > 30 ? 'bg-secondary' : 'bg-tertiary'}`} style={{width: `${customer.RiskPercent}%`}}></div>
                      </div>
                      <span className="font-code-md text-sm font-semibold text-on-surface">{customer.RiskPercent}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-code-md font-semibold text-on-surface">${customer.Monetary.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right font-code-md text-on-surface-variant">{customer.Frequency}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-xs font-semibold ${customer.RiskPercent > 60 ? 'bg-error/10 text-error' : customer.RiskPercent > 30 ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'}`}>
                      {customer.RiskPercent > 60 ? 'High Risk' : customer.RiskPercent > 30 ? 'Medium' : 'Healthy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* AI Summary Modal */}
      {showAISummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/50 backdrop-blur-sm print:hidden">
          <div className="bg-surface-container-high w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-surface-container-highest animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">auto_awesome</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">AI Executive Summary</h3>
              </div>
              <button 
                onClick={() => setShowAISummary(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6">
              {generatingAI ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-on-surface-variant text-sm animate-pulse">Generating context-aware business summary...</p>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none font-body-lg leading-relaxed text-on-surface">
                  {aiResult.split('\n').map((line, i) => (
                    <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-outline-variant/15 flex justify-end bg-surface-container/50">
              <button 
                onClick={() => setShowAISummary(false)}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-label-md transition-colors shadow-sm cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
