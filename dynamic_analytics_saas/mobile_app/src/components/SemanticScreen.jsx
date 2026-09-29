import React, { useState } from 'react';
import { Database, Code2, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';

export default function SemanticScreen({ data }) {
  const metrics = data?.semantic_metrics || [];
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [expandedId, setExpandedId] = useState(metrics[0]?.id || null);

  const categories = ['Semua', 'Financial Health', 'Retention Intelligence', 'Customer Engagement'];

  const filteredMetrics = selectedCategory === 'Semua' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Title & Governance Badge */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Database className="w-4 h-4" />
          </span>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Semantic Metric Studio</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Kamus metrik bisnis tersentralisasi dengan formula standar (Single Source of Truth) untuk eksekutif.
        </p>
      </div>

      {/* Category Pills (Horizontal Scrollable) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Metrics List */}
      <div className="space-y-3">
        {filteredMetrics.map((metric) => {
          const isExpanded = expandedId === metric.id;
          return (
            <div 
              key={metric.id}
              className={`bg-white dark:bg-slate-900 border transition-all rounded-2xl p-4 shadow-sm ${isExpanded ? 'border-indigo-500/60 ring-2 ring-indigo-500/10' : 'border-slate-200 dark:border-slate-800'}`}
            >
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => toggleExpand(metric.id)}
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {metric.category}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${metric.status === 'healthy' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'}`}>
                      {metric.status === 'healthy' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                      {metric.status === 'healthy' ? 'Verified' : 'Perhatian'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {metric.name}
                  </h3>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">
                    {metric.value}
                  </div>
                  <span className={`text-[10px] font-semibold ${metric.trend.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {metric.trend} MoM
                  </span>
                </div>
              </div>

              {/* Expandable Formula & Governance Detail */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {metric.description}
                  </p>

                  {/* Formula Code Block */}
                  <div className="bg-slate-900 text-slate-200 rounded-xl p-3 border border-slate-800 font-mono text-[11px] overflow-x-auto">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-sans">
                      <span className="flex items-center gap-1 font-semibold text-indigo-300">
                        <Code2 className="w-3 h-3" /> Formula Kalkulasi
                      </span>
                      <span>SQL Logic</span>
                    </div>
                    <code>{metric.formula}</code>
                  </div>

                  {/* Meta Tags & Governance */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{metric.governance_tier}</span>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{metric.owner}</span>
                  </div>
                </div>
              )}

              <div 
                className="mt-2 text-center text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold flex items-center justify-center gap-1 cursor-pointer pt-1"
                onClick={() => toggleExpand(metric.id)}
              >
                {isExpanded ? (
                  <>Tutup Formula <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Lihat Formula Bisnis <ChevronDown className="w-3 h-3" /></>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
