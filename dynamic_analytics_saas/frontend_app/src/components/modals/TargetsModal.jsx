import React from 'react';

export default function TargetsModal({
  showTargetsModal,
  setShowTargetsModal,
  targets,
  setTargets,
  handleSaveTargets,
  overviewData
}) {
  if (!showTargetsModal) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
      <div className="bg-surface-container rounded-2xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden border border-surface-container-high animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-surface-container-high flex justify-between items-center bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">tune</span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Set Target Goals</h3>
          </div>
          <button onClick={() => setShowTargetsModal(false)} className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface-variant">Revenue Target ($)</label>
            <input
              type="number"
              value={targets.revenue}
              onChange={(e) => setTargets({ ...targets, revenue: e.target.value })}
              placeholder="e.g. 50000000"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-surface-container-high font-body-md text-on-surface outline-none focus:border-secondary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface-variant">Orders Target</label>
            <input
              type="number"
              value={targets.orders}
              onChange={(e) => setTargets({ ...targets, orders: e.target.value })}
              placeholder="e.g. 25000"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-surface-container-high font-body-md text-on-surface outline-none focus:border-secondary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface-variant">AOV Target ($)</label>
            <input
              type="number"
              value={targets.aov}
              onChange={(e) => setTargets({ ...targets, aov: e.target.value })}
              placeholder="e.g. 2000000"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-surface-container-high font-body-md text-on-surface outline-none focus:border-secondary"
            />
          </div>
          {overviewData && targets.revenue && (
            <div className="p-3 rounded-lg bg-surface-container-low">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Progress: <span className="text-secondary font-semibold">{Math.min(100, ((overviewData.kpi?.total_sales || 0) / parseFloat(targets.revenue) * 100)).toFixed(1)}%</span> of revenue target reached</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowTargetsModal(false)} className="px-4 py-2 rounded-lg hover:bg-surface-container text-on-surface font-label-md">Cancel</button>
            <button onClick={handleSaveTargets} className="px-5 py-2 rounded-lg bg-secondary text-on-secondary font-label-md font-semibold hover:brightness-110 transition-all">Save Goals</button>
          </div>
        </div>
      </div>
    </div>
  );
}
