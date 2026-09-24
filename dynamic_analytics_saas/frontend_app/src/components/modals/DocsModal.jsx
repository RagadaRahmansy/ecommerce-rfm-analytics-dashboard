import React from 'react';

export default function DocsModal({ showDocsModal, setShowDocsModal }) {
  if (!showDocsModal) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-surface-container rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-surface-container-high">
        <div className="px-6 py-4 border-b border-surface-container-high flex justify-between items-center bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Semantic Architecture & Formulas</h3>
              <p className="font-body-sm text-body-sm text-outline">Governed business logic reference</p>
            </div>
          </div>
          <button onClick={() => setShowDocsModal(false)} className="p-2 text-on-surface-variant hover:text-on-surface rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
            <h4 className="font-headline-sm text-headline-sm text-secondary font-semibold mb-1">Customer Lifetime Value (CLV)</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">Estimated average total spending per customer account.</p>
            <code className="px-2.5 py-1 rounded bg-surface-container font-code-md text-xs text-primary block">SUM(TotalPrice) / COUNT(DISTINCT CustomerID)</code>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
            <h4 className="font-headline-sm text-headline-sm text-primary font-semibold mb-1">AI Churn Risk Probability</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">Random Forest classifier trained on Recency, Frequency, and Monetary attributes.</p>
            <code className="px-2.5 py-1 rounded bg-surface-container font-code-md text-xs text-secondary block">P(Churn | Recency &gt; 60 days, Frequency, Monetary)</code>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
            <h4 className="font-headline-sm text-headline-sm text-tertiary font-semibold mb-1">Revenue Time-Series Forecast</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">Holt-Winters Exponential Smoothing model projecting future revenue cycles.</p>
            <code className="px-2.5 py-1 rounded bg-surface-container font-code-md text-xs text-tertiary block">ExponentialSmoothing(trend='add', seasonal=None)</code>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
            <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">Market Basket Affinity (Cross-Sell)</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">Association rule mining calculating confidence of co-purchasing across product categories.</p>
            <code className="px-2.5 py-1 rounded bg-surface-container font-code-md text-xs text-on-surface block">Confidence(A -&gt; B) = P(B | A) * 100</code>
          </div>
        </div>
      </div>
    </div>
  );
}
