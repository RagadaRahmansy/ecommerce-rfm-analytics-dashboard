import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, BarChart, Bar
} from 'recharts';
import { LayoutDashboard, Users, TrendingUp, BarChart3, ChevronRight, AlertTriangle } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [churnData, setChurnData] = useState(null);
  const [affinityData, setAffinityData] = useState(null);
  const [trendFilter, setTrendFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overview, cluster, forecast, churn, affinity] = await Promise.all([
        axios.get(`${API_BASE}/overview`),
        axios.get(`${API_BASE}/clustering`),
        axios.get(`${API_BASE}/forecast`),
        axios.get(`${API_BASE}/churn`),
        axios.get(`${API_BASE}/affinity`)
      ]);
      setOverviewData(overview.data);
      setClusterData(cluster.data);
      setForecastData(forecast.data);
      setChurnData(churn.data);
      setAffinityData(affinity.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-slate-600">Loading Enterprise Analytics...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <BarChart3 className="w-6 h-6 text-blue-500 mr-2" />
          <h1 className="text-lg font-bold text-white tracking-tight">CorpAnalytics</h1>
        </div>
        <nav className="flex-1 py-4">
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          <NavItem 
            icon={<Users className="w-5 h-5" />} 
            label="RFM Segments" 
            active={activeTab === 'clustering'} 
            onClick={() => setActiveTab('clustering')} 
          />
          <NavItem 
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} 
            label="Churn Prediction" 
            active={activeTab === 'churn'} 
            onClick={() => setActiveTab('churn')} 
          />
          <NavItem 
            icon={<TrendingUp className="w-5 h-5" />} 
            label="Revenue Forecast" 
            active={activeTab === 'forecast'} 
            onClick={() => setActiveTab('forecast')} 
          />
          <NavItem 
            icon={<BarChart3 className="w-5 h-5 text-emerald-500" />} 
            label="Cross-Selling" 
            active={activeTab === 'affinity'} 
            onClick={() => setActiveTab('affinity')} 
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8">
          <h2 className="text-xl font-semibold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h2>
        </header>
        
        <div className="p-8">
          {activeTab === 'overview' && overviewData && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-6">
                <MetricCard title="Total Revenue (IDR)" value={`Rp ${(overviewData.kpi.total_sales/1e9).toFixed(2)}B`} />
                <MetricCard title="Total Orders" value={overviewData.kpi.total_transactions.toLocaleString()} />
                <MetricCard title="Active Customers" value={overviewData.kpi.total_customers.toLocaleString()} />
                <MetricCard title="Avg Order Value" value={`Rp ${(overviewData.kpi.aov/1e6).toFixed(2)}M`} />
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Revenue Trend</h3>
                    <select 
                      className="border border-slate-300 rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                      value={trendFilter}
                      onChange={(e) => setTrendFilter(e.target.value)}
                    >
                      <option value="All">All Time</option>
                      <option value="6">Last 6 Months</option>
                      <option value="3">Last 3 Months</option>
                    </select>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendFilter === 'All' ? overviewData.trend : overviewData.trend.slice(-parseInt(trendFilter))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="Period" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `${(val/1e9).toFixed(0)}B`} />
                        <RechartsTooltip formatter={(value) => `Rp ${(value/1e6).toFixed(2)}M`} />
                        <Line type="monotone" dataKey="TotalPrice" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue by Category</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={overviewData.category_sales}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="TotalPrice"
                          nameKey="Category"
                        >
                          {overviewData.category_sales.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => `Rp ${(value/1e9).toFixed(1)}B`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    {overviewData.category_sales.map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                        <span className="truncate">{entry.Category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clustering' && clusterData && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">K-Means Customer Segmentation</h3>
                <p className="text-slate-500 mb-6 text-sm">Customers automatically categorized into distinct cohorts based on RFM behaviors.</p>
                
                <div className="grid grid-cols-4 gap-4">
                  {clusterData.profile.map((cluster, idx) => (
                    <div key={idx} className="p-4 border border-slate-100 rounded-lg bg-slate-50">
                      <h4 className="font-semibold text-slate-800 mb-2">Segment {idx + 1}</h4>
                      <p className="text-sm text-slate-600">Population: <span className="font-semibold">{cluster.CustomerCount}</span></p>
                      <p className="text-sm text-slate-600">Avg Spend: <span className="font-semibold">Rp {(cluster.Monetary/1e6).toFixed(1)}M</span></p>
                      <p className="text-sm text-slate-600">Freq: <span className="font-semibold">{cluster.Frequency.toFixed(1)}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'churn' && churnData && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Customer Churn Prediction (Random Forest)</h3>
                <p className="text-slate-500 mb-6 text-sm">Identifying active customers who have a high probability of stopping their purchases based on predictive modeling.</p>
                
                <div className="flex space-x-6 mb-8">
                  <div className="flex-1 bg-red-50 border border-red-100 p-4 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Total Active Customers</p>
                    <p className="text-3xl font-bold text-red-600">{churnData.summary.total_active}</p>
                  </div>
                  <div className="flex-1 bg-amber-50 border border-amber-100 p-4 rounded-lg">
                    <p className="text-sm font-medium text-amber-800">High Risk Customers (&gt;50% Churn Prob)</p>
                    <p className="text-3xl font-bold text-amber-600">{churnData.summary.high_risk_count}</p>
                  </div>
                </div>

                <h4 className="font-semibold text-slate-800 mb-4">Top 50 Customers At Risk</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-medium">
                      <tr>
                        <th className="px-4 py-3 border-b">Customer ID</th>
                        <th className="px-4 py-3 border-b">Frequency</th>
                        <th className="px-4 py-3 border-b">Monetary (Rp)</th>
                        <th className="px-4 py-3 border-b">Churn Probability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {churnData.top_at_risk.map((cust, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{cust.CustomerID}</td>
                          <td className="px-4 py-3">{cust.Frequency}</td>
                          <td className="px-4 py-3">{cust.Monetary.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-full bg-slate-200 rounded-full h-2.5 mr-2">
                                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${cust.RiskPercent}%` }}></div>
                              </div>
                              <span className="text-xs font-semibold">{cust.RiskPercent.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'forecast' && forecastData && (
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Revenue Projection</h3>
                <p className="text-slate-500 mb-6 text-sm">Holt-Winters Exponential Smoothing model projecting future business outcomes.</p>
                
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData.chart_data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `${(val/1e9).toFixed(0)}B`} />
                      <RechartsTooltip formatter={(value) => `Rp ${(value/1e6).toFixed(2)}M`} />
                      <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'affinity' && affinityData && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Customer Lifetime Category Affinity</h3>
                <p className="text-slate-500 mb-6 text-sm">Cross-Selling recommendations based on historical customer purchase combinations.</p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-medium">
                      <tr>
                        <th className="px-4 py-3 border-b">Primary Category</th>
                        <th className="px-4 py-3 border-b">Cross-Sell Opportunity</th>
                        <th className="px-4 py-3 border-b">Joint Customers</th>
                        <th className="px-4 py-3 border-b">Conversion Probability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affinityData.rules.map((rule, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{rule.source}</td>
                          <td className="px-4 py-3 font-medium text-emerald-600">{rule.target}</td>
                          <td className="px-4 py-3">{rule.support_both.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-full bg-slate-200 rounded-full h-2.5 mr-2">
                                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${rule.confidence_percent}%` }}></div>
                              </div>
                              <span className="text-xs font-semibold">{rule.confidence_percent.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center px-6 py-3 transition-colors ${active ? 'bg-slate-800 text-white border-r-4 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
    >
      {icon}
      <span className="ml-3 font-medium">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto" />}
    </button>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-medium text-slate-500 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
