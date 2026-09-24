import React from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  unreadCount,
  setShowUploadModal,
  setShowTargetsModal,
  setShowNotifications,
  setShowDocsModal,
  exportDashboardCSV,
  exportDashboardJSON
}) {
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col">
        <div className="p-space-lg">
          <div className="flex items-center gap-space-sm mb-space-sm">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-indigo-500 to-secondary flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/30 border border-white/20 select-none">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight leading-tight">
                Ragada <span className="text-secondary">Analytics</span>
              </span>
              <span className="text-[10px] text-outline font-code-md tracking-wider">INTELLIGENCE PLATFORM</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center px-space-xs py-0.5 rounded-lg bg-surface-container-high text-secondary font-label-sm text-label-sm tracking-wider uppercase">PROD-EU-WEST-1</span>
            <div className="flex items-center gap-1.5 px-space-xs py-0.5 rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-code-md text-[10px] text-tertiary">WH_XL (RUNNING)</span>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-space-md mt-space-xs">
          <div className="px-space-sm pb-1 font-label-sm text-label-sm text-outline uppercase tracking-wider">Operational Studio</div>
          <a
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-space-sm px-space-sm py-2 transition-colors cursor-pointer rounded-lg ${activeTab === 'overview' ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span className="font-label-lg text-label-lg">Executive Overview</span>
          </a>
          <a
            onClick={() => setActiveTab('clustering')}
            className={`flex items-center gap-space-sm px-space-sm py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'clustering' ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[18px]">group_work</span>
            <span className="font-label-lg text-label-lg">Customer RFM Segments</span>
          </a>
          <a
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-space-sm px-space-sm py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'metrics' ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[18px]">database</span>
            <span className="font-label-lg text-label-lg">Metric Catalog & Reports</span>
          </a>
          <a
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-space-sm px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            <span className="font-label-lg text-label-lg">Upload New Dataset</span>
          </a>

          <div className="px-space-sm pt-space-md pb-1 font-label-sm text-label-sm text-outline uppercase tracking-wider">Workspace</div>
          <a
            className="flex items-center gap-space-sm px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            onClick={() => setShowTargetsModal(true)}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span className="font-label-lg text-label-lg">Set Targets</span>
          </a>
          <a
            className="flex items-center gap-space-sm px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            onClick={() => setShowNotifications(true)}
          >
            <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            <span className="font-label-lg text-label-lg">Alert Center</span>
            <span className="ml-auto px-1.5 py-0.5 rounded-full bg-error/20 text-error font-code-md text-[10px]">{unreadCount}</span>
          </a>
          <a
            className="flex items-center gap-space-sm px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            onClick={() => setShowDocsModal(true)}
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span className="font-label-lg text-label-lg">Documentation</span>
          </a>
          <a
            className="flex items-center gap-space-sm px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            onClick={exportDashboardCSV}
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="font-label-lg text-label-lg">Export CSV</span>
          </a>
          <a
            className="flex items-center justify-between px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            onClick={exportDashboardJSON}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px]">code</span>
              <span className="font-label-lg text-label-lg">Export JSON</span>
            </div>
          </a>
        </nav>
      </div>

      <div className="p-space-md m-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>Live Streaming
          </span>
          <span className="font-code-md text-body-sm text-tertiary font-medium">2.4k evt/s</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="font-label-sm text-label-sm text-outline">Cluster Health</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg bg-surface-container-high text-secondary font-label-sm text-[10px]">99.98% OK</span>
        </div>
      </div>
    </aside>
  );
}
