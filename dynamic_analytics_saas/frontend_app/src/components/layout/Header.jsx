import React from 'react';

export default function Header({
  activeTab,
  setActiveTab,
  dateFilter,
  setDateFilter,
  isDark,
  setIsDark,
  unreadCount,
  setUnreadCount,
  showNotifications,
  setShowNotifications,
  userProfile,
  showProfileModal,
  setShowProfileModal,
  setShowCommandPalette,
  setShowTargetsModal,
  setShowUploadModal,
  setShowDocsModal,
  handleLogout
}) {
  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/80 backdrop-blur-xl z-40 flex items-center justify-between px-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Search Input Button (⌘K) & AI Copilot Button */}
      <div className="flex items-center flex-1 max-w-xl gap-2">
        <button
          onClick={() => setShowCommandPalette(true)}
          className="flex-1 flex items-center gap-space-sm px-space-md py-2 rounded-xl bg-surface-container text-outline hover:text-on-surface transition-all cursor-pointer group border border-transparent hover:border-surface-container-high"
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-colors">search</span>
          <span className="font-body-md text-body-md text-on-surface-variant flex-1 text-left select-none">Search datasets, metrics, customers, actions...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-md text-[11px] shadow-sm">⌘ K</kbd>
        </button>
        <button
          onClick={() => setActiveTab && setActiveTab('copilot')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-primary border border-primary/25 transition-all font-label-md cursor-pointer flex-shrink-0 shadow-sm"
          title="Buka AI Data Copilot"
        >
          <span className="material-symbols-outlined text-[17px] text-primary">auto_awesome</span>
          <span className="font-bold text-xs">AI Copilot</span>
        </button>
      </div>

      <div className="flex items-center gap-space-md">
        {/* Date Filter Dropdown */}
        <div className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container text-on-surface cursor-pointer hover:bg-surface-container-high transition-colors relative border border-outline-variant/20">
          <span className="material-symbols-outlined text-[16px] text-secondary">date_range</span>
          <select
            className="appearance-none bg-transparent outline-none font-label-md text-label-md cursor-pointer pr-5 text-on-surface font-medium"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="" className="bg-surface-container text-on-surface">All Time (2024-2026)</option>
            <option value="30d" className="bg-surface-container text-on-surface">Last 30 Days (Daily)</option>
            <option value="90d" className="bg-surface-container text-on-surface">Last 90 Days (Weekly)</option>
            <option value="ytd" className="bg-surface-container text-on-surface">Year to Date (2026)</option>
            <option value="1y" className="bg-surface-container text-on-surface">Last 12 Months</option>
          </select>
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute right-1.5 pointer-events-none">expand_more</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          title="Toggle Theme"
          className="relative p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            className="relative p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface"></span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface-container-high p-3 z-50 shadow-2xl border border-surface-variant flex flex-col gap-2 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span> System Notifications
                </span>
                <button onClick={() => setUnreadCount(0)} className="text-[11px] text-secondary hover:underline cursor-pointer">Mark all read</button>
              </div>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                <div className="p-2.5 rounded-lg bg-surface-container text-xs flex gap-2.5 items-start">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">cloud_done</span>
                  <div>
                    <div className="text-on-surface font-semibold">Dataset Synchronized</div>
                    <div className="text-on-surface-variant text-[11px]">20,702 transaction records ingested & verified.</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container text-xs flex gap-2.5 items-start">
                  <span className="material-symbols-outlined text-secondary text-[18px]">psychology</span>
                  <div>
                    <div className="text-on-surface font-semibold">AI Models Retrained</div>
                    <div className="text-on-surface-variant text-[11px]">RFM segmentation & churn risk matrix refreshed.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <div onClick={() => setShowProfileModal(!showProfileModal)} className="flex items-center gap-space-sm pl-space-xs cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-on-primary font-bold text-xs shadow-md shadow-primary/20">
              {userProfile?.company_name ? userProfile.company_name[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="font-label-md text-label-md text-on-surface leading-tight font-semibold group-hover:text-primary transition-colors">
                {userProfile?.company_name || 'Ragada Analytics'}
              </span>
              <span className="font-label-sm text-label-sm text-outline leading-tight">
                {userProfile?.email || 'admin@ragada-analytics.com'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant hidden xl:inline">keyboard_arrow_down</span>
          </div>
          {showProfileModal && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface-container-high p-3 z-50 shadow-2xl border border-surface-variant flex flex-col gap-2 animate-in fade-in-50 zoom-in-95">
              <div className="p-2.5 bg-surface-container rounded-lg">
                <div className="font-label-md text-label-md text-on-surface font-semibold">{userProfile?.company_name || 'Ragada Analytics'}</div>
                <div className="font-label-sm text-label-sm text-outline truncate">{userProfile?.email || 'admin@ragada-analytics.com'}</div>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-tertiary/10 text-tertiary text-[10px] font-semibold">Tenant #{userProfile?.tenant_id || 13}</div>
              </div>
              <button onClick={() => { setShowTargetsModal(true); setShowProfileModal(false); }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-container text-on-surface text-xs text-left transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-secondary">tune</span>
                Performance Targets
              </button>
              <button onClick={() => { setShowUploadModal(true); setShowProfileModal(false); }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-container text-on-surface text-xs text-left transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-primary">cloud_upload</span>
                Upload New Dataset
              </button>
              <button onClick={() => { setShowDocsModal(true); setShowProfileModal(false); }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-container text-on-surface text-xs text-left transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-tertiary">menu_book</span>
                System Documentation
              </button>
              <div className="border-t border-surface-container my-1"></div>
              <button onClick={handleLogout} className="flex items-center gap-2 p-2 rounded-lg hover:bg-error/10 text-error text-xs text-left transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
