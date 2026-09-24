import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function MetricStudioView({
  overviewData,
  churnData,
  insightsData,
  affinityData,
  exportDashboardCSV,
  exportDashboardJSON,
  exportAffinityToCSV
}) {
  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* Top Command Ribbon */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Enterprise Semantic Catalog & Metric Studio</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Governed single source of truth for business calculations, dimensions, and automated reporting.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <button onClick={exportDashboardCSV} className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg transition-all shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
            Export Governance Spec
          </button>
          <button onClick={exportDashboardJSON} className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg transition-all shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[18px] text-primary">published_with_changes</span>
            Export JSON Model
          </button>
        </div>
      </section>

      {/* Two Column Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* LEFT: Catalog Repository */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container shadow-sm">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
              <div>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Catalog Repository</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-label-sm text-label-sm text-outline">Standard Business Definitions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Card: Customer Lifetime Value */}
          {overviewData && (
            <div className="p-space-lg rounded-xl bg-surface-container shadow-sm flex flex-col gap-space-sm border-l-2 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Customer Lifetime Value (CLV)</h3>
                </div>
                <div className="text-right">
                  <div className="font-headline-md text-headline-md text-on-surface font-bold">
                    ${overviewData.kpi ? (overviewData.kpi.total_sales / Math.max(1, overviewData.kpi.total_customers)).toFixed(0) : 0}
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-surface-container-low font-code-md text-body-sm text-on-surface-variant">
                SUM(revenue) / COUNT(churned_cohort)
              </div>
            </div>
          )}

          {/* Metric Card: Monthly Recurring Revenue */}
          {overviewData && (
            <div className="p-space-lg rounded-xl bg-surface-container shadow-sm flex flex-col gap-space-sm border-l-2 border-secondary">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Monthly Recurring Revenue (MRR)</h3>
                </div>
                <div className="text-right">
                  <div className="font-headline-md text-headline-md text-on-surface font-bold">
                    ${overviewData.kpi ? (overviewData.kpi.total_sales / 33).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-surface-container-low font-code-md text-body-sm text-on-surface-variant">
                SUM(subscription_price) WHERE status='active'
              </div>
            </div>
          )}

          {/* Metric Card: Active Customers */}
          {overviewData && (
            <div className="p-space-lg rounded-xl bg-surface-container shadow-sm flex flex-col gap-space-sm border-l-2 border-tertiary">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Active Customers (WAU)</h3>
                </div>
                <div className="text-right">
                  <div className="font-headline-md text-headline-md text-on-surface font-bold">
                    {overviewData.kpi ? overviewData.kpi.total_customers.toLocaleString() : 0}
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-surface-container-low font-code-md text-body-sm text-on-surface-variant">
                COUNT(DISTINCT customer_id) WHERE event_count &gt;= 3
              </div>
            </div>
          )}

          {/* Metric Card: Average Order Value */}
          {overviewData && (
            <div className="p-space-lg rounded-xl bg-surface-container shadow-sm flex flex-col gap-space-sm border-l-2 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Average Order Value (AOV)</h3>
                </div>
                <div className="text-right">
                  <div className="font-headline-md text-headline-md text-on-surface font-bold">
                    ${overviewData.kpi ? overviewData.kpi.aov.toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-surface-container-low font-code-md text-body-sm text-on-surface-variant">
                SUM(total_price) / COUNT(DISTINCT invoice_no)
              </div>
            </div>
          )}

          {/* Metric Card: Churn Rate */}
          {churnData && churnData.top_at_risk && (
            <div className="p-space-lg rounded-xl bg-surface-container shadow-sm flex flex-col gap-space-sm border-l-2 border-error">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Churn Rate (Voluntary vs Invol.)</h3>
                </div>
                <div className="text-right">
                  <div className="font-headline-md text-headline-md text-on-surface font-bold">
                    {churnData.top_at_risk.length > 0 ? (churnData.top_at_risk.reduce((a,c) => a + c.RiskPercent, 0) / churnData.top_at_risk.length).toFixed(2) : '0'}%
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-surface-container-low font-code-md text-body-sm text-on-surface-variant">
                churned_accounts_total / total_base_active
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Report Dimensions & Measures */}
        <div className="lg:col-span-7 flex flex-col gap-space-xl">
          <div className="bg-surface-container p-space-xl rounded-xl shadow-sm">
            <div className="flex items-center justify-between pb-space-md">
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Report Dimensions & Measures</h2>
            </div>

            <div className="h-80 rounded-xl bg-surface-container-lowest p-4">
              {overviewData && overviewData.trend && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overviewData.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4cd7f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4cd7f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262a35" vertical={false} />
                    <XAxis dataKey="Period" axisLine={false} tickLine={false} tick={{fill: '#c7c4d7', fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} tick={{fill: '#c7c4d7', fontSize: 11}} />
                    <RechartsTooltip contentStyle={{backgroundColor: '#1c1f2a', borderColor: '#313540', color: '#dfe2f1', borderRadius: '8px'}} formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]} />
                    <Area type="monotone" name="Revenue" dataKey="TotalPrice" stroke="#4cd7f6" strokeWidth={2} fill="url(#colorTrend)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {overviewData && overviewData.kpi && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md mt-space-md pt-space-md border-t border-surface-container-high">
                <div>
                  <span className="text-outline font-label-sm text-label-sm block uppercase">Total Revenue</span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold">${(overviewData.kpi.total_sales / 1000000).toFixed(1)}M</span>
                </div>
                <div>
                  <span className="text-outline font-label-sm text-label-sm block uppercase">Total Customers</span>
                  <span className="font-headline-sm text-headline-sm text-tertiary font-bold">{overviewData.kpi.total_customers.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-outline font-label-sm text-label-sm block uppercase">Avg Order Value</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">${overviewData.kpi.aov.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div>
                  <span className="text-outline font-label-sm text-label-sm block uppercase">Total Orders</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{overviewData.kpi.total_transactions.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* AI Insights Section */}
          {insightsData && insightsData.insights && (
            <div className="bg-surface-container p-space-xl rounded-xl shadow-sm">
              <div className="flex items-center justify-between pb-space-md">
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">AI-Generated Insights</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span> ML Engine Active
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {insightsData.insights.map((insight, idx) => (
                  <div key={idx} className="p-space-md rounded-lg bg-surface-container-low flex items-start gap-3">
                    <span className={`material-symbols-outlined text-[20px] mt-0.5 ${insight.type === 'warning' ? 'text-error' : insight.type === 'success' ? 'text-secondary' : 'text-tertiary'}`}>
                      {insight.type === 'warning' ? 'warning' : insight.type === 'success' ? 'trending_up' : 'lightbulb'}
                    </span>
                    <div>
                      <h4 className="font-label-lg text-label-lg text-on-surface font-semibold">{insight.title}</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Affinity / Cross-Sell Rules */}
          {affinityData && affinityData.rules && (
            <div className="bg-surface-container p-space-xl rounded-xl shadow-sm">
              <div className="flex items-center justify-between pb-space-md">
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Cross-Sell Affinity Rules</h2>
                <button onClick={exportAffinityToCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface-variant font-label-sm text-label-sm transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[14px]">download</span> Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-surface-container-high">
                      <th className="py-2 px-3 font-label-sm text-label-sm text-outline uppercase">Source</th>
                      <th className="py-2 px-3 font-label-sm text-label-sm text-outline uppercase">Target</th>
                      <th className="py-2 px-3 font-label-sm text-label-sm text-outline uppercase text-right">Confidence</th>
                      <th className="py-2 px-3 font-label-sm text-label-sm text-outline uppercase text-right">Co-occur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affinityData.rules.slice(0, 6).map((rule, idx) => (
                      <tr key={idx} className="border-b border-surface-container-low hover:bg-surface-container-low transition-colors">
                        <td className="py-2.5 px-3 font-body-md text-body-md text-on-surface">{rule.source}</td>
                        <td className="py-2.5 px-3 font-body-md text-body-md text-secondary">{rule.target}</td>
                        <td className="py-2.5 px-3 text-right font-code-md text-on-surface font-semibold">{rule.confidence_percent}%</td>
                        <td className="py-2.5 px-3 text-right font-code-md text-on-surface-variant">{rule.support_both}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
