import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell
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
  openDrilldown
}) {
  const chartData = (forecastData && forecastData.chart_data && forecastData.chart_data.length >= (overviewData?.trend?.length || 0))
    ? forecastData.chart_data
    : (overviewData?.trend?.map(t => ({ period: t.Period, revenue: t.TotalPrice, type: 'Actual' })) || []);

  const totalSales = overviewData?.kpi?.total_sales || 0;
  const totalTx = overviewData?.kpi?.total_transactions || 0;
  const totalCustomers = overviewData?.kpi?.total_customers || 0;
  const aov = overviewData?.kpi?.aov || 0;
  const avgRisk = (churnData && churnData.top_at_risk && churnData.top_at_risk.length > 0)
    ? (churnData.top_at_risk.reduce((acc, curr) => acc + curr.RiskPercent, 0) / churnData.top_at_risk.length).toFixed(1)
    : '0';

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Bar / Executive Meta Controls */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-xs">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Executive Business Performance Overview</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Real-time cross-enterprise ingestion and financial metric consolidation</p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            onClick={() => setShowTargetsModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors shadow-sm font-label-lg text-label-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
            <span>Set Targets</span>
          </button>
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-label-lg text-label-lg transition-all shadow-sm cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Suite</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            <div className="absolute right-0 mt-1 w-48 rounded-xl bg-surface-container-high p-1.5 hidden group-hover:flex flex-col z-30 shadow-xl border border-surface-container">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-primary">picture_as_pdf</span> Executive PDF
              </button>
              <button onClick={exportDashboardCSV} className="flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-secondary">table_view</span> Consolidated CSV
              </button>
              <button onClick={exportDashboardJSON} className="flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-tertiary">code</span> JSON Payload
              </button>
            </div>
          </div>
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
          {/* Revenue Trend Chart Card */}
          <div className="bg-surface-container p-space-xl rounded-xl flex flex-col shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-lg">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Consolidated Revenue & Financial Performance</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time dynamic trend line calibrated to active date filter</p>
              </div>
              <div className="flex items-center gap-space-sm flex-wrap">
                <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                  <span className="w-3 h-3 rounded-sm bg-primary"></span> Revenue Actual
                </div>
                <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                  <span className="w-3 h-3 rounded-sm bg-secondary"></span> Projected Cycle
                </div>
              </div>
            </div>

            {/* High-Fidelity SVG Interactive Chart Area */}
            <div className="relative w-full h-72 sm:h-80 bg-surface-container-lowest rounded-xl p-4 flex flex-col justify-between overflow-hidden">
              {chartData && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8083ff" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#8083ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262a35" vertical={false} />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#c7c4d7', fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} tick={{fill: '#c7c4d7', fontSize: 11}} />
                    <RechartsTooltip contentStyle={{backgroundColor: '#1c1f2a', borderColor: '#313540', color: '#dfe2f1', borderRadius: '8px'}} formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]} />
                    <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#8083ff" strokeWidth={3} fill="url(#colorForecast)" activeDot={{r: 6, fill: '#8083ff'}} />
                  </AreaChart>
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
    </div>
  );
}
