import React, { useState, useEffect } from 'react';
import { LayoutDashboard, LineChart, Database, RefreshCw, Moon, Sun, Sparkles } from 'lucide-react';
import { fetchMobileData, DEFAULT_ANALYTICS_DATA } from './services/data.js';
import KpiScreen from './components/KpiScreen.jsx';
import ChartScreen from './components/ChartScreen.jsx';
import SemanticScreen from './components/SemanticScreen.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('kpi'); // 'kpi' | 'chart' | 'semantic'
  const [data, setData] = useState(DEFAULT_ANALYTICS_DATA);
  const [refreshing, setRefreshing] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const loadData = async () => {
    setRefreshing(true);
    const result = await fetchMobileData();
    setData(result);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none">
      {/* Top Mobile App Bar (Fixed Header) */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 flex items-center justify-between pt-safe">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/30 border border-white/20">
            R
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                Ragada <span className="text-indigo-600 dark:text-indigo-400">Mobile</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Enterprise Intelligence</span>
          </div>
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center gap-1.5">
          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={refreshing}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(prev => !prev)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Ganti Tema"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* Screen Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'kpi' && <KpiScreen data={data} onRefresh={loadData} refreshing={refreshing} />}
        {activeTab === 'chart' && <ChartScreen data={data} />}
        {activeTab === 'semantic' && <SemanticScreen data={data} />}
      </main>

      {/* Native Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-6 py-2 pb-safe flex items-center justify-around shadow-lg">
        {/* Tab 1: KPI */}
        <button
          onClick={() => setActiveTab('kpi')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${activeTab === 'kpi' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'kpi' ? 'bg-indigo-50 dark:bg-indigo-950/70 scale-105' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">KPI</span>
        </button>

        {/* Tab 2: Grafik */}
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${activeTab === 'chart' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'chart' ? 'bg-indigo-50 dark:bg-indigo-950/70 scale-105' : ''}`}>
            <LineChart className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">Grafik</span>
        </button>

        {/* Tab 3: Semantic Metric */}
        <button
          onClick={() => setActiveTab('semantic')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${activeTab === 'semantic' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'semantic' ? 'bg-indigo-50 dark:bg-indigo-950/70 scale-105' : ''}`}>
            <Database className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">Semantic</span>
        </button>
      </nav>
    </div>
  );
}
