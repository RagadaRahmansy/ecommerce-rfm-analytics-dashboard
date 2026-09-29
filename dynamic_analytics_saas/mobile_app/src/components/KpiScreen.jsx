import React from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, Target, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function KpiScreen({ data, onRefresh, refreshing }) {
  const kpi = data?.kpi || {};
  const totalRevMillions = (kpi.total_sales / 1000000).toFixed(2);
  const revProgress = Math.min(100, Math.round((kpi.total_sales / (kpi.revenue_target || 2000000)) * 100));
  const ordersProgress = Math.min(100, Math.round((kpi.total_transactions / (kpi.orders_target || 28000)) * 100));

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/15 backdrop-blur-md rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-100">Live Enterprise Hub</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
            <ArrowUpRight className="w-3 h-3" /> +{kpi.yoy_growth || 18.4}% YoY
          </span>
        </div>
        <div className="text-xs text-indigo-200 mt-1">Konsolidasi Omset Usaha</div>
        <div className="text-3xl font-extrabold tracking-tight mt-0.5">
          ${totalRevMillions}M
        </div>
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-indigo-100">
          <span>Target Tahunan: ${( (kpi.revenue_target || 2000000) / 1000000).toFixed(1)}M</span>
          <span className="font-bold text-white">{revProgress}% Tercapai</span>
        </div>
        <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden mt-1.5">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full" style={{ width: `${revProgress}%` }}></div>
        </div>
      </div>

      {/* Grid KPI 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Total Orders */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-md">
              Order
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {(kpi.total_transactions || 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Pesanan</div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Goal</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{ordersProgress}%</span>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${ordersProgress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Customers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold bg-cyan-50 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300 px-1.5 py-0.5 rounded-md">
              Active
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {(kpi.total_customers || 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pelanggan Aktif</div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Verified User</span>
            <span>100% Data</span>
          </div>
        </div>

        {/* Card 3: Average Order Value (AOV) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 px-1.5 py-0.5 rounded-md">
              AOV
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${(kpi.aov || 0).toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rata-rata Order</div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Margin Sehat</span>
            <span className="font-semibold text-emerald-600">Optimal</span>
          </div>
        </div>

        {/* Card 4: YoY Performance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded-md">
              YoY
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              +{kpi.yoy_growth || 18.4}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pertumbuhan Tahunan</div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-300 font-semibold">
            <span>Vs Last Year</span>
            <span>Ekspansif</span>
          </div>
        </div>
      </div>

      {/* Operational Highlights Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fokus Eksekutif Kuartal Ini</h3>
        </div>
        <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></span>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Monetisasi VIP Stabil:</span> 20% pelanggan teratas berkontribusi terhadap 68% dari total pendapatan kotor tahun berjalan.
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 flex-shrink-0"></span>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Mitigasi Churn Berjalan:</span> Rekomendasi program win-back otomatis dialokasikan untuk 320 akun dorman.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
