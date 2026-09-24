import React from 'react';

export default function DrilldownModal({ drilldownModal, setDrilldownModal }) {
  if (!drilldownModal.open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-surface-container rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-surface-container-high">
        <div className="px-6 py-4 border-b border-surface-container-high flex justify-between items-center bg-surface-container-low">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Category Cohort: {drilldownModal.category}</h3>
            <p className="font-body-sm text-body-sm text-outline">Top transacting customers in this product segment</p>
          </div>
          <button onClick={() => setDrilldownModal({ open: false, category: '', data: [] })} className="p-2 text-on-surface-variant hover:text-on-surface rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {drilldownModal.data && drilldownModal.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-surface-container-high text-outline font-label-sm text-label-sm uppercase">
                    <th className="py-2.5 px-3">Customer ID</th>
                    <th className="py-2.5 px-3 text-right">Orders</th>
                    <th className="py-2.5 px-3 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {drilldownModal.data.map((c, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-3 font-semibold text-on-surface font-code-md text-body-sm">{c.CustomerID}</td>
                      <td className="py-3 px-3 text-right text-on-surface font-code-md text-body-sm">{c.OrderCount}</td>
                      <td className="py-3 px-3 text-right font-code-md text-body-sm text-primary font-bold">${c.TotalSpend.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-on-surface-variant py-10 font-body-md">No customer data available for this category.</p>
          )}
        </div>
      </div>
    </div>
  );
}
