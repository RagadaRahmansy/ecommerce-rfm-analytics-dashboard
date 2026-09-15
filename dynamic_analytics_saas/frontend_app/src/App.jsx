import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, BarChart, Bar
} from 'recharts';
import { LayoutDashboard, Users, TrendingUp, BarChart3, ChevronRight, AlertTriangle, UploadCloud } from 'lucide-react';

const API_BASE = 'http://localhost:8001/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function App() {
  const [hasData, setHasData] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [churnData, setChurnData] = useState(null);
  const [affinityData, setAffinityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await axios.get(API_BASE + '/status');
      if (res.data.has_data) {
        setHasData(true);
        fetchData();
      } else {
        setHasData(false);
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    setUploadMessage("Uploading and analyzing your dataset...");
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      await axios.post(API_BASE + '/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadMessage("Success! Generating insights...");
      setTimeout(() => {
        setHasData(true);
        fetchData();
      }, 1500);
    } catch (err) {
      setUploadMessage("Upload failed. Make sure it's a valid CSV.");
      console.error(err);
      setUploading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overview, cluster, forecast, churn, affinity] = await Promise.all([
        axios.get(API_BASE + '/overview'),
        axios.get(API_BASE + '/clustering'),
        axios.get(API_BASE + '/forecast'),
        axios.get(API_BASE + '/churn'),
        axios.get(API_BASE + '/affinity')
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
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-slate-600">Initializing Platform...</div>;
  }

  if (!hasData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <UploadCloud size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome to SaaS Analytics</h1>
          <p className="text-slate-500 mb-8">Your database is completely empty. Upload a CSV transaction file to auto-generate predictive insights.</p>
          
          {uploading ? (
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-blue-600 font-medium">{uploadMessage}</p>
            </div>
          ) : (
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-block w-full">
              Choose CSV File
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
          )}
          
          <p className="text-xs text-slate-400 mt-6">Required columns: InvoiceNo, InvoiceDate, CustomerID, Category, UnitPrice, Quantity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <BarChart3 className="w-6 h-6 text-blue-500 mr-2" />
          <h1 className="text-lg font-bold text-white tracking-tight">SaaS Analytics</h1>
        </div>
        <nav className="flex-1 py-4">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<Users className="w-5 h-5" />} label="RFM Segments" active={activeTab === 'clustering'} onClick={() => setActiveTab('clustering')} />
          <NavItem icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} label="Churn Prediction" active={activeTab === 'churn'} onClick={() => setActiveTab('churn')} />
          <NavItem icon={<TrendingUp className="w-5 h-5" />} label="Revenue Forecast" active={activeTab === 'forecast'} onClick={() => setActiveTab('forecast')} />
          <NavItem icon={<BarChart3 className="w-5 h-5 text-emerald-500" />} label="Cross-Selling" active={activeTab === 'affinity'} onClick={() => setActiveTab('affinity')} />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8">
          <h2 className="text-xl font-semibold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h2>
        </header>
        
        <div className="p-8">
          {activeTab === 'overview' && overviewData && !overviewData.status && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-6">
                <MetricCard title="Total Revenue" value={Number(overviewData.kpi.total_sales).toLocaleString()} />
                <MetricCard title="Total Orders" value={overviewData.kpi.total_transactions.toLocaleString()} />
                <MetricCard title="Active Customers" value={overviewData.kpi.total_customers.toLocaleString()} />
                <MetricCard title="Avg Order Value" value={Number(overviewData.kpi.aov).toLocaleString(undefined, {maximumFractionDigits:0})} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue Trend</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={overviewData.trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="Period" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="TotalPrice" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clustering' && clusterData && !clusterData.status && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">K-Means Customer Segmentation</h3>
                <div className="grid grid-cols-4 gap-4 mt-6">
                  {clusterData.profile && clusterData.profile.map((cluster, idx) => (
                    <div key={idx} className="p-4 border border-slate-100 rounded-lg bg-slate-50">
                      <h4 className="font-semibold text-slate-800 mb-2">Segment {idx + 1}</h4>
                      <p className="text-sm text-slate-600">Population: <span className="font-semibold">{cluster.CustomerCount}</span></p>
                      <p className="text-sm text-slate-600">Avg Spend: <span className="font-semibold">{cluster.Monetary.toLocaleString(undefined, {maximumFractionDigits:0})}</span></p>
                      <p className="text-sm text-slate-600">Freq: <span className="font-semibold">{cluster.Frequency.toFixed(1)}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'churn' && churnData && !churnData.status && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Customer Churn Prediction (Random Forest)</h3>
                <div className="flex space-x-6 mb-8">
                  <div className="flex-1 bg-red-50 border border-red-100 p-4 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Total Active Customers</p>
                    <p className="text-3xl font-bold text-red-600">{churnData.summary?.total_active}</p>
                  </div>
                  <div className="flex-1 bg-amber-50 border border-amber-100 p-4 rounded-lg">
                    <p className="text-sm font-medium text-amber-800">High Risk Customers (&gt;50% Churn Prob)</p>
                    <p className="text-3xl font-bold text-amber-600">{churnData.summary?.high_risk_count}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'forecast' && forecastData && !forecastData.status && (
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Revenue Projection (Holt-Winters)</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData.chart_data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'affinity' && affinityData && !affinityData.status && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Customer Lifetime Category Affinity</h3>
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
                      {affinityData.rules && affinityData.rules.map((rule, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{rule.source}</td>
                          <td className="px-4 py-3 font-medium text-emerald-600">{rule.target}</td>
                          <td className="px-4 py-3">{rule.support_both.toLocaleString()}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600">{rule.confidence_percent.toFixed(1)}%</td>
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
