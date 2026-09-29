// Mobile Data Service: Supports offline standalone mode and live sync with FastAPI
export const DEFAULT_ANALYTICS_DATA = {
  kpi: {
    total_sales: 1845230,
    total_transactions: 24890,
    total_customers: 4320,
    aov: 74.13,
    yoy_growth: 18.4,
    revenue_target: 2000000,
    orders_target: 28000,
  },
  trend: [
    { period: 'Jan', revenue: 112000, orders: 1540 },
    { period: 'Feb', revenue: 128000, orders: 1720 },
    { period: 'Mar', revenue: 145000, orders: 1950 },
    { period: 'Apr', revenue: 139000, orders: 1880 },
    { period: 'May', revenue: 162000, orders: 2190 },
    { period: 'Jun', revenue: 178000, orders: 2410 },
    { period: 'Jul', revenue: 195000, orders: 2630 },
    { period: 'Aug', revenue: 210000, orders: 2840 },
    { period: 'Sep', revenue: 204000, orders: 2750 },
    { period: 'Oct', revenue: 228000, orders: 3080 },
    { period: 'Nov', revenue: 251000, orders: 3390 },
    { period: 'Dec', revenue: 275000, orders: 3710 }
  ],
  semantic_metrics: [
    {
      id: 'clv',
      name: 'Customer Lifetime Value (CLV)',
      category: 'Financial Health',
      value: '$427.13',
      raw_value: 427.13,
      trend: '+12.5%',
      status: 'healthy',
      formula: 'SUM(revenue) / COUNT(DISTINCT CustomerID)',
      description: 'Prediksi rata-rata total margin pendapatan yang dihasilkan dari satu akun pelanggan selama masa aktif belanjanya.',
      governance_tier: 'Tier 1 (Certified Executive Metric)',
      owner: 'Finance & BI Team',
      tags: ['Executive', 'Revenue', 'Customer Value']
    },
    {
      id: 'mrr',
      name: 'Monthly Recurring Revenue (MRR)',
      category: 'Revenue Predictability',
      value: '$55,916',
      raw_value: 55916,
      trend: '+8.3%',
      status: 'healthy',
      formula: 'SUM(active_subscription_fee) + AVG(30d_repurchases)',
      description: 'Normalisasi pendapatan berulang yang dapat diproyeksikan secara konsisten setiap siklus 30 hari.',
      governance_tier: 'Tier 1 (Certified Executive Metric)',
      owner: 'Revenue Operations',
      tags: ['Sales', 'Subscriptions', 'Forecasting']
    },
    {
      id: 'wau',
      name: 'Weekly Active Users (WAU)',
      category: 'Customer Engagement',
      value: '2,890 Users',
      raw_value: 2890,
      trend: '+15.2%',
      status: 'healthy',
      formula: 'COUNT(DISTINCT CustomerID) WHERE last_event_date >= NOW() - INTERVAL 7 DAY',
      description: 'Jumlah akun pelanggan unik yang melakukan transaksi atau interaksi checkout dalam periode 7 hari terakhir.',
      governance_tier: 'Tier 2 (Operational Metric)',
      owner: 'Product & Growth',
      tags: ['Product', 'Active Base', 'Engagement']
    },
    {
      id: 'churn_risk',
      name: 'Churn Risk Index (CRI)',
      category: 'Retention Intelligence',
      value: '14.8%',
      raw_value: 14.8,
      trend: '-2.1%',
      status: 'warning',
      formula: 'COUNT(customers WHERE days_since_last_order > 60) / COUNT(total_customers) * 100',
      description: 'Persentase pelanggan dengan riwayat belanja tinggi yang tidak melakukan pemesanan ulang selama lebih dari 60 hari.',
      governance_tier: 'Tier 1 (Risk Monitoring)',
      owner: 'CRM & Retention',
      tags: ['Retention', 'Risk', 'AI Early Warning']
    },
    {
      id: 'rpr',
      name: 'Repeat Purchase Rate (RPR)',
      category: 'Loyalty & Stickiness',
      value: '38.4%',
      raw_value: 38.4,
      trend: '+4.7%',
      status: 'healthy',
      formula: 'COUNT(customers with order_count > 1) / COUNT(total_customers) * 100',
      description: 'Rasio pelanggan yang kembali melakukan transaksi setidaknya dua kali dalam satu siklus kuartal.',
      governance_tier: 'Tier 2 (Growth Metric)',
      owner: 'Marketing Team',
      tags: ['Retention', 'Repeat Customers']
    }
  ]
};

export async function fetchMobileData() {
  // Attempt to fetch from local API if available, otherwise return cached enterprise data
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('http://10.0.2.2:8001/api/overview', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return {
        kpi: data.kpi || DEFAULT_ANALYTICS_DATA.kpi,
        trend: (data.trend && data.trend.length > 0) ? data.trend.map(t => ({
          period: t.Period || t.period,
          revenue: t.TotalPrice || t.revenue || 0,
          orders: t.total_orders || t.orders || 0
        })) : DEFAULT_ANALYTICS_DATA.trend,
        semantic_metrics: DEFAULT_ANALYTICS_DATA.semantic_metrics
      };
    }
  } catch (e) {
    // Network unavailable or running standalone
  }
  return DEFAULT_ANALYTICS_DATA;
}
