import React from 'react';

export default function ClusteringView({
  clusterData,
  exportDashboardCSV,
  setShowUploadModal
}) {
  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* Top Command Ribbon */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-surface-container-high text-tertiary font-label-sm text-label-sm uppercase tracking-wider">UNSUPERVISED ML • K-MEANS</span>
            <span className="flex items-center gap-1 text-secondary font-label-sm text-label-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              RFM Vector Space Scaled
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Customer RFM Segmentation</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Algorithmic customer behavioral clustering based on Recency (last order days), Frequency (order count), and Monetary (total spend).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <button onClick={exportDashboardCSV} className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg transition-all shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[18px] text-secondary">download</span>
            Export Segments CSV
          </button>
          <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-md hover:brightness-110 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            Upload Dataset
          </button>
        </div>
      </section>

      {/* Top Metric Strip */}
      {clusterData && clusterData.profile && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <div className="bg-surface-container p-space-lg rounded-xl flex flex-col justify-between shadow-sm border border-outline-variant/10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Identified Segments</span>
            <div className="my-2 font-headline-xl text-headline-xl text-primary font-bold">{clusterData.profile.length} Clusters</div>
            <span className="text-outline font-label-sm text-label-sm">Optimized via Silhouette metric</span>
          </div>
          <div className="bg-surface-container p-space-lg rounded-xl flex flex-col justify-between shadow-sm border border-outline-variant/10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Analyzed Customer Base</span>
            <div className="my-2 font-headline-xl text-headline-xl text-secondary font-bold">
              {clusterData.profile.reduce((acc, c) => acc + c.CustomerCount, 0).toLocaleString()} Users
            </div>
            <span className="text-outline font-label-sm text-label-sm">100% Active in window</span>
          </div>
          <div className="bg-surface-container p-space-lg rounded-xl flex flex-col justify-between shadow-sm border border-outline-variant/10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Highest Value Cluster</span>
            <div className="my-2 font-headline-xl text-headline-xl text-tertiary font-bold">
              ${Math.max(...clusterData.profile.map(c => c.Monetary)).toLocaleString(undefined, {maximumFractionDigits: 0})}
            </div>
            <span className="text-outline font-label-sm text-label-sm">Peak average account spend</span>
          </div>
          <div className="bg-surface-container p-space-lg rounded-xl flex flex-col justify-between shadow-sm border border-outline-variant/10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Average Re-Order Cycle</span>
            <div className="my-2 font-headline-xl text-headline-xl text-on-surface font-bold">
              {(clusterData.profile.reduce((acc, c) => acc + c.Recency * c.CustomerCount, 0) / Math.max(1, clusterData.profile.reduce((acc, c) => acc + c.CustomerCount, 0))).toFixed(0)} Days
            </div>
            <span className="text-outline font-label-sm text-label-sm">Cross-cohort mean recency</span>
          </div>
        </section>
      )}

      {/* Cluster Cards Grid */}
      {clusterData && clusterData.profile ? (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
          {clusterData.profile.map((cluster, i) => {
            const totalUsers = clusterData.profile.reduce((acc, c) => acc + c.CustomerCount, 0);
            const percent = totalUsers > 0 ? ((cluster.CustomerCount / totalUsers) * 100).toFixed(1) : 0;
            const colorPalette = ['#8083ff', '#4cd7f6', '#4edea3', '#ffb4ab', '#ffd166'];
            const cardColor = colorPalette[i % colorPalette.length];

            let archetype = `Cluster #${cluster.Cluster}`;
            let strategy = "Maintain regular communication and nurture.";
            if (cluster.Monetary > 1000000 && cluster.Recency < 30) {
              archetype = "Champions & VIPs";
              strategy = "Provide priority support, early product access, and dedicated account manager.";
            } else if (cluster.Recency > 60) {
              archetype = "At-Risk / Lapsed";
              strategy = "Deploy targeted win-back campaigns and special reactivation discounts.";
            } else if (cluster.Frequency > 10) {
              archetype = "High-Frequency Regulars";
              strategy = "Upsell cross-category products and loyalty point rewards.";
            } else {
              archetype = `Core Segment ${cluster.Cluster + 1}`;
              strategy = "Standard product marketing and monthly newsletters.";
            }

            return (
              <div key={i} className="bg-surface-container p-space-xl rounded-xl flex flex-col justify-between shadow-sm border border-outline-variant/20 hover:border-primary/40 transition-all hover:bg-surface-container-high relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5" style={{backgroundColor: cardColor}}></div>
                <div>
                  <div className="flex items-start justify-between gap-2 pb-space-md">
                    <div>
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-code-md font-semibold mb-1" style={{backgroundColor: `${cardColor}20`, color: cardColor}}>
                        SEGMENT #{cluster.Cluster}
                      </span>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold">{archetype}</h3>
                    </div>
                    <div className="text-right">
                      <span className="font-code-md text-headline-sm font-bold text-on-surface">{cluster.CustomerCount}</span>
                      <span className="text-[11px] text-outline block">{percent}% of users</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden mb-space-lg">
                    <div className="h-full rounded-full transition-all duration-500" style={{width: `${percent}%`, backgroundColor: cardColor}}></div>
                  </div>

                  <div className="space-y-3 p-3 rounded-lg bg-surface-container-low">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                        Avg Recency
                      </span>
                      <span className="font-code-md text-on-surface font-semibold">{cluster.Recency.toFixed(1)} days</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-outline">shopping_bag</span>
                        Avg Frequency
                      </span>
                      <span className="font-code-md text-on-surface font-semibold">{cluster.Frequency.toFixed(1)} orders</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-surface-container pt-2">
                      <span className="text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">payments</span>
                        Avg Spend
                      </span>
                      <span className="font-code-md text-tertiary font-bold text-sm">${Number(cluster.Monetary.toFixed(0)).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-space-md pt-space-sm border-t border-outline-variant/10">
                    <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">Recommended Action</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{strategy}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <div className="p-12 text-center bg-surface-container rounded-xl">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface font-body-md">Computing RFM K-Means clusters...</p>
        </div>
      )}
    </div>
  );
}
