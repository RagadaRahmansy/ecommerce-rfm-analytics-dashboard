import React from 'react';

export default function CommandPaletteModal({
  showCommandPalette,
  setShowCommandPalette,
  searchQuery,
  setSearchQuery,
  setActiveTab,
  setShowUploadModal,
  setShowTargetsModal,
  setShowDocsModal,
  exportDashboardCSV,
  overviewData
}) {
  if (!showCommandPalette) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-start justify-center z-[150] pt-20 p-4" onClick={() => setShowCommandPalette(false)}>
      <div className="bg-surface-container-high rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden border border-surface-variant animate-in fade-in-50 zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-surface-container flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[22px]">search</span>
          <input
            type="text"
            autoFocus
            placeholder="Type a metric, customer ID, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-on-surface font-body-md text-body-md w-full outline-none placeholder:text-outline"
          />
          <kbd className="px-2 py-0.5 rounded bg-surface-container text-outline font-code-md text-[11px]">ESC</kbd>
        </div>
        <div className="p-2 max-h-80 overflow-y-auto flex flex-col gap-1">
          <div className="px-3 py-1 text-[11px] font-semibold text-outline uppercase tracking-wider">Navigation & Views</div>
          <button onClick={() => { setActiveTab('overview'); setShowCommandPalette(false); }} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container text-left text-on-surface font-body-md transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-primary text-[18px]">dashboard</span>
            <span>Executive Overview & KPI Dashboard</span>
          </button>
          <button onClick={() => { setActiveTab('clustering'); setShowCommandPalette(false); }} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container text-left text-on-surface font-body-md transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-tertiary text-[18px]">group_work</span>
            <span>Customer Behavioral RFM Segments</span>
          </button>
          <button onClick={() => { setActiveTab('metrics'); setShowCommandPalette(false); }} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container text-left text-on-surface font-body-md transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-secondary text-[18px]">database</span>
            <span>Enterprise Semantic Catalog & Metric Studio</span>
          </button>

          <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-outline uppercase tracking-wider">Actions & Data</div>
          <button onClick={() => { setShowUploadModal(true); setShowCommandPalette(false); }} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container text-left text-on-surface font-body-md transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-tertiary text-[18px]">cloud_upload</span>
            <span>Upload New Transaction Dataset (CSV)</span>
          </button>
          <button onClick={() => { setShowTargetsModal(true); setShowCommandPalette(false); }} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container text-left text-on-surface font-body-md transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-secondary text-[18px]">tune</span>
            <span>Set Business Targets (Revenue, AOV, Orders)</span>
          </button>
          <button onClick={() => { setShowDocsModal(true); setShowCommandPalette(false); }} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container text-left text-on-surface font-body-md transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-tertiary text-[18px]">menu_book</span>
            <span>Open System Architecture & Formulas</span>
          </button>
          <button onClick={() => { exportDashboardCSV(); setShowCommandPalette(false); }} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container text-left text-on-surface font-body-md transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-primary text-[18px]">download</span>
            <span>Export Consolidated CSV Report</span>
          </button>
          <button onClick={() => { window.print(); setShowCommandPalette(false); }} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container text-left text-on-surface font-body-md transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-error text-[18px]">picture_as_pdf</span>
            <span>Print Executive Snapshot / PDF</span>
          </button>

          {overviewData && overviewData.kpi && (
            <>
              <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-outline uppercase tracking-wider">Verified Business Metrics</div>
              <div className="px-3 py-1.5 rounded-lg bg-surface-container flex items-center justify-between text-xs">
                <span className="text-on-surface">Total Sales (Revenue)</span>
                <span className="font-code-md text-secondary font-bold">${overviewData.kpi?.total_sales?.toLocaleString() || 0}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-surface-container flex items-center justify-between text-xs">
                <span className="text-on-surface">Average Order Value (AOV)</span>
                <span className="font-code-md text-primary font-bold">${overviewData.kpi?.aov?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 0}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-surface-container flex items-center justify-between text-xs">
                <span className="text-on-surface">Unique Active Customers</span>
                <span className="font-code-md text-tertiary font-bold">{overviewData.kpi?.total_customers?.toLocaleString() || 0}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
