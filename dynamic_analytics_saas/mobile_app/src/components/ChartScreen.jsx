import React, { useState } from 'react';
import { BarChart3, LineChart, Calendar, TrendingUp, Award, AlertCircle } from 'lucide-react';

export default function ChartScreen({ data }) {
  const trend = data?.trend || [];
  const [selectedPoint, setSelectedPoint] = useState(trend[trend.length - 1] || null);
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'

  const maxRevenue = Math.max(...trend.map(t => t.revenue), 1);
  const minRevenue = Math.min(...trend.map(t => t.revenue), 0);
  const avgRevenue = Math.round(trend.reduce((acc, t) => acc + t.revenue, 0) / Math.max(1, trend.length));

  const highestMonth = trend.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current, trend[0] || {});
  const lowestMonth = trend.reduce((prev, current) => (prev.revenue < current.revenue) ? prev : current, trend[0] || {});

  // Generate SVG path for area/line
  const width = 340;
  const height = 180;
  const paddingX = 20;
  const paddingY = 25;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const points = trend.map((t, idx) => {
    const x = paddingX + (idx / Math.max(1, trend.length - 1)) * innerWidth;
    const y = height - paddingY - (t.revenue / maxRevenue) * innerHeight;
    return { x, y, ...t };
  });

  const linePath = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Chart Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Tren Pendapatan Bulanan</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pola fluktuasi omset tahun berjalan</p>
          </div>
          {/* Toggle Type */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg transition-all ${chartType === 'area' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-400'}`}
              title="Grafik Garis Area"
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg transition-all ${chartType === 'bar' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-400'}`}
              title="Grafik Batang"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Data Badge */}
        {selectedPoint && (
          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {selectedPoint.period}
              </span>
              <div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  ${selectedPoint.revenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedPoint.orders.toLocaleString()} Pesanan Masuk
                </div>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              AOV ${(selectedPoint.revenue / Math.max(1, selectedPoint.orders)).toFixed(0)}
            </span>
          </div>
        )}

        {/* Interactive SVG Chart */}
        <div className="w-full flex justify-center py-2 select-none">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
            <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />

            {/* Area & Line */}
            {chartType === 'area' ? (
              <>
                <path d={areaPath} fill="url(#areaGradient)" />
                <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={selectedPoint?.period === p.period ? "5" : "3"}
                    className={`cursor-pointer transition-all ${selectedPoint?.period === p.period ? 'fill-indigo-600 stroke-white dark:stroke-slate-900 stroke-2' : 'fill-indigo-400 hover:fill-indigo-600'}`}
                    onClick={() => setSelectedPoint(p)}
                  />
                ))}
              </>
            ) : (
              /* Bar Chart View */
              points.map((p, idx) => {
                const barWidth = 14;
                const barHeight = (p.revenue / maxRevenue) * innerHeight;
                const isSelected = selectedPoint?.period === p.period;
                return (
                  <rect
                    key={idx}
                    x={p.x - barWidth / 2}
                    y={height - paddingY - barHeight}
                    width={barWidth}
                    height={barHeight}
                    rx="4"
                    className={`cursor-pointer transition-all ${isSelected ? 'fill-indigo-600' : 'fill-indigo-300 dark:fill-indigo-800/80 hover:fill-indigo-400'}`}
                    onClick={() => setSelectedPoint(p)}
                  />
                );
              })
            )}

            {/* Month Labels */}
            {points.map((p, idx) => (
              (idx % 2 === 0 || idx === points.length - 1) && (
                <text
                  key={idx}
                  x={p.x}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 dark:fill-slate-500 font-semibold"
                >
                  {p.period}
                </text>
              )
            ))}
          </svg>
        </div>
        <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-1">
          Sentuh titik grafik untuk melihat rincian bulan tertentu
        </div>
      </div>

      {/* Benchmarks & Insights */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <Award className="w-4 h-4" /> Bulan Tertinggi
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {highestMonth.period} ({((highestMonth.revenue || 0) / 1000).toFixed(0)}k)
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Puncak performa kuartal</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <TrendingUp className="w-4 h-4" /> Rata-Rata Bulanan
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            ${(avgRevenue / 1000).toFixed(0)}k/bln
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Benchmark konsisten</div>
        </div>
      </div>
    </div>
  );
}
