import React, { useState } from 'react';
import payload from './data/analytics_payload.json';
import Page0Overview from './pages/Page0Overview';
import Page1DataDesign from './pages/Page1DataDesign';
import Page2Ingestion from './pages/Page2Ingestion';
import Page3DataModeling from './pages/Page3DataModeling';
import Page4AnalyticsMethod from './pages/Page4AnalyticsMethod';
import Page5Dashboard from './pages/Page5Dashboard';

export default function App() {
  const [activePage, setActivePage] = useState('overview');

  const navItems = [
    {
      id: 'overview',
      num: '00',
      label: 'Executive Case & Blueprint',
      subtitle: 'Business Context & Architecture',
    },
    {
      id: 'step1',
      num: '01',
      label: 'Data Design & Schema',
      subtitle: 'OLTP Grain, ERD & Anomalies',
    },
    {
      id: 'step2',
      num: '02',
      label: 'Idempotent ELT Ingestion',
      subtitle: 'DuckDB Columnar & Audit Log',
    },
    {
      id: 'step3',
      num: '03',
      label: 'Kimball SQL Modeling',
      subtitle: 'Bronze, Silver & Gold Marts',
    },
    {
      id: 'step4',
      num: '04',
      label: 'Analytical Frameworks',
      subtitle: 'Cohort, LTV:CAC & RFM Matrix',
    },
    {
      id: 'dashboard',
      num: '05',
      label: 'Executive P&L Statement',
      subtitle: 'Live Unit Economics & Memo',
    },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <Page0Overview onNavigate={setActivePage} />;
      case 'step1':
        return <Page1DataDesign data={payload} onNavigate={setActivePage} />;
      case 'step2':
        return <Page2Ingestion data={payload} onNavigate={setActivePage} />;
      case 'step3':
        return <Page3DataModeling data={payload} onNavigate={setActivePage} />;
      case 'step4':
        return <Page4AnalyticsMethod data={payload} onNavigate={setActivePage} />;
      case 'dashboard':
        return <Page5Dashboard data={payload} />;
      default:
        return <Page0Overview onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#141413] flex flex-col lg:flex-row">
      {/* Left Monograph Index Sidebar */}
      <aside className="w-full lg:w-72 bg-[#F2F0E8] border-b lg:border-b-0 lg:border-r border-[#141413] shrink-0 flex flex-col justify-between lg:sticky lg:top-0 lg:h-screen">
        <div>
          {/* Publication Masthead */}
          <div className="p-5 border-b border-[#141413]">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6E6D68]">
              TECHNICAL DOSSIER // B2B-2026
            </div>
            <div className="font-serif text-2xl font-bold tracking-tight text-[#141413] mt-1">
              Ekatunggal Group
            </div>
            <div className="text-xs text-[#52514E] mt-0.5">
              PT Ekatunggal Tunas Mandiri — Springbed &amp; Sofa Material Distribution
            </div>
          </div>

          {/* Section Index */}
          <div className="divide-y divide-[#D8D6CE] border-b border-[#141413]">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-5 py-3.5 transition flex items-baseline gap-3.5 ${
                    isActive
                      ? 'bg-[#141413] text-[#FAF9F5]'
                      : 'hover:bg-[#E8E5DC] text-[#141413]'
                  }`}
                >
                  <span
                    className={`font-mono text-xs font-bold ${
                      isActive ? 'text-[#D4A373]' : 'text-[#787670]'
                    }`}
                  >
                    {item.num}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold tracking-tight truncate">
                      {item.label}
                    </div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isActive ? 'text-[#B8B6AE]' : 'text-[#6E6D68]'
                      }`}
                    >
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Warehouse Telemetry Specification Block */}
        <div className="p-5 border-t border-[#141413] bg-[#EAE7DF] hidden lg:block space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between border-b border-[#C9C6BC] pb-1.5">
            <span className="text-[#52514E] uppercase">STATUS DATA WAREHOUSE</span>
            <span className="font-bold text-[#166534]">ONLINE</span>
          </div>
          <div className="text-[#3D3C3A] space-y-0.5">
            <div>DB: aura_analytics.duckdb</div>
            <div>LAYER: Bronze / Silver / Gold</div>
            <div>VALIDASI INTEGRITAS: 3/3 LOLOS</div>
            <div>TOTAL DATA: 8.249 BARIS</div>
          </div>
        </div>
      </aside>

      {/* Main Editorial Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Specification Strip */}
        <header className="sticky top-0 z-20 bg-[#FAF9F5]/95 backdrop-blur-sm border-b border-[#141413] px-6 py-2.5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-[11px] font-mono text-[#52514E]">
            <span className="uppercase font-bold text-[#141413]">PT EKATUNGGAL TUNAS MANDIRI</span>
            <span>/</span>
            <span>AUDIT DISTRIBUSI H1 2026</span>
            <span className="hidden md:inline">/</span>
            <span className="hidden md:inline">{payload.warehouse_engine}</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px]">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => setActivePage(n.id)}
                className={`px-2 py-0.5 border transition ${
                  activePage === n.id
                    ? 'bg-[#141413] text-[#FAF9F5] border-[#141413] font-bold'
                    : 'bg-white text-[#52514E] border-[#C9C6BC] hover:border-[#141413]'
                }`}
              >
                §{n.num}
              </button>
            ))}
          </div>
        </header>

        {/* Page Container */}
        <main className="p-6 md:p-10 max-w-6xl w-full mx-auto flex-1">{renderPage()}</main>
      </div>
    </div>
  );
}
