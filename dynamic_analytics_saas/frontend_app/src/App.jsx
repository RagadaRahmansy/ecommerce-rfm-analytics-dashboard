import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

// Common Components
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Views
import AuthView from './components/auth/AuthView';
import OverviewView from './components/overview/OverviewView';
import ClusteringView from './components/clustering/ClusteringView';
import MetricStudioView from './components/metrics/MetricStudioView';
import CopilotView from './components/copilot/CopilotView';

// Modals
import CommandPaletteModal from './components/modals/CommandPaletteModal';
import UploadModal from './components/modals/UploadModal';
import TargetsModal from './components/modals/TargetsModal';
import DrilldownModal from './components/modals/DrilldownModal';
import DocsModal from './components/modals/DocsModal';

const API_BASE = window.location.port === '5174' ? '/api' : (import.meta.env.VITE_API_BASE || 'http://localhost:8001/api');

export default function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [authMode, setAuthMode] = useState('login'); 
  const [authForm, setAuthForm] = useState({ company_name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // App & Data State
  const [hasData, setHasData] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [churnData, setChurnData] = useState(null);
  const [affinityData, setAffinityData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [drilldownModal, setDrilldownModal] = useState({ open: false, category: '', data: [] });
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const [loading, setLoading] = useState(!!token);

  // Upload & Targets State
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [mappingInput, setMappingInput] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTargetsModal, setShowTargetsModal] = useState(false);
  const [targets, setTargets] = useState({ revenue: '', orders: '', aov: '' });

  // UI & Modals State
  const [userProfile, setUserProfile] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Initialize Axios Token Header & Check Status
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkStatus();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token]);

  // Refetch when Date Filter changes
  useEffect(() => {
    if (token && hasData) {
      fetchData();
    }
  }, [dateFilter]);

  // Global Keyboard Shortcuts (⌘K / Ctrl+K and ESC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowNotifications(false);
        setShowProfileModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load Saved Targets
  useEffect(() => {
    const savedTargets = localStorage.getItem('targets');
    if (savedTargets) {
      try {
        setTargets(JSON.parse(savedTargets));
      } catch (e) {
        console.error("Failed to parse saved targets:", e);
      }
    }
  }, []);

  // Theme Sync
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setHasData(false);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        await axios.post(`${API_BASE}/auth/register`, authForm);
        setAuthMode('login');
        setAuthError('Registration successful! Please login.');
      } else {
        const params = new URLSearchParams();
        params.append('username', authForm.email);
        params.append('password', authForm.password);
        const res = await axios.post(`${API_BASE}/auth/login`, params);
        localStorage.setItem('token', res.data.access_token);
        setToken(res.data.access_token);
      }
    } catch (err) {
      setAuthError(err.response?.data?.detail || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const res = await axios.get(API_BASE + '/status');
      if (res.data.user) {
        setUserProfile(res.data.user);
      }
      if (res.data.has_data) {
        setHasData(true);
        fetchData();
      } else {
        setHasData(false);
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401) handleLogout();
      else setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let params = {};
      if (dateFilter) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const end_date = `${yyyy}-${mm}-${dd}`;
        let start_date = '';
        if (dateFilter === '30d') {
          const past = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          start_date = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
        } else if (dateFilter === '90d') {
          const past = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          start_date = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
        } else if (dateFilter === '1y') {
          const past = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
          start_date = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
        } else if (dateFilter === 'ytd') {
          start_date = `${yyyy}-01-01`;
        }
        params = { start_date, end_date };
      }
      
      const results = await Promise.allSettled([
        axios.get(API_BASE + '/overview', { params }),
        axios.get(API_BASE + '/clustering', { params }),
        axios.get(API_BASE + '/forecast', { params }),
        axios.get(API_BASE + '/churn', { params }),
        axios.get(API_BASE + '/affinity', { params }),
        axios.get(API_BASE + '/insights', { params })
      ]);
      if (results[0].status === 'fulfilled' && results[0].value.data) setOverviewData(results[0].value.data);
      if (results[1].status === 'fulfilled' && results[1].value.data) setClusterData(results[1].value.data);
      if (results[2].status === 'fulfilled' && results[2].value.data) setForecastData(results[2].value.data);
      if (results[3].status === 'fulfilled' && results[3].value.data) setChurnData(results[3].value.data);
      if (results[4].status === 'fulfilled' && results[4].value.data) setAffinityData(results[4].value.data);
      if (results[5].status === 'fulfilled' && results[5].value.data) setInsightsData(results[5].value.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleUploadInModal = async (e, mode = 'append') => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) return;
    setUploading(true);
    setUploadMessage("Uploading securely...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    if (mappingInput) formData.append("mapping", mappingInput);
    try {
      const uploadRes = await axios.post(API_BASE + '/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const taskId = uploadRes.data.task_id;
      setUploadMessage("AI is processing your dataset...");
      const interval = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${API_BASE}/upload/status/${taskId}`);
          const status = statusRes.data;
          if (status.task_status === 'SUCCESS') {
            clearInterval(interval);
            setUploadMessage("Processing complete!");
            setTimeout(() => {
              setShowUploadModal(false);
              setUploading(false);
              setUploadMessage("");
              setHasData(true);
              fetchData();
            }, 1000);
          } else if (status.task_status === 'FAILURE') {
            clearInterval(interval);
            setUploadMessage("Processing failed. Please check file format.");
            setUploading(false);
          } else if (status.task_status === 'PROGRESS') {
            setUploadMessage(status.task_result?.status || "Analyzing data...");
          }
        } catch (pollErr) { console.error(pollErr); }
      }, 1000);
    } catch (err) {
      setUploadMessage(err.response?.data?.detail || "Upload failed.");
      setUploading(false);
    }
  };

  const openDrilldown = async (categoryName) => {
    if (!categoryName) return;
    try {
      let params = { category: categoryName };
      if (dateFilter) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const end_date = `${yyyy}-${mm}-${dd}`;
        let start_date = '';
        if (dateFilter === '30d') {
          const past = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          start_date = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
        } else if (dateFilter === '90d') {
          const past = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          start_date = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
        } else if (dateFilter === '1y') {
          const past = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
          start_date = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
        } else if (dateFilter === 'ytd') {
          start_date = `${yyyy}-01-01`;
        }
        params.start_date = start_date;
        params.end_date = end_date;
      }
      
      const res = await axios.get(API_BASE + '/category_drilldown', { params });
      setDrilldownModal({ open: true, category: categoryName, data: res.data.top_customers });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTargets = () => {
    localStorage.setItem('targets', JSON.stringify(targets));
    setShowTargetsModal(false);
  };

  const exportAffinityToCSV = () => {
    if (!affinityData || !affinityData.rules) return;
    const headers = ['Source Category', 'Target Category', 'Confidence (%)', 'Co-occurrences'];
    const rows = affinityData.rules.map(r => 
      `"${r.source}","${r.target}",${r.confidence_percent},${r.support_both}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'basket_analysis_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDashboardCSV = () => {
    if (!overviewData) return;
    let csv = 'Metric,Value\n';
    csv += `Total Revenue,${overviewData.kpi?.total_sales || 0}\n`;
    csv += `Total Transactions,${overviewData.kpi?.total_transactions || 0}\n`;
    csv += `Total Customers,${overviewData.kpi?.total_customers || 0}\n`;
    csv += `AOV,${overviewData.kpi?.aov || 0}\n`;
    csv += '\nCategory,Revenue\n';
    if (overviewData.category_sales) {
      overviewData.category_sales.forEach(c => {
        csv += `${c.Category},${c.TotalPrice}\n`;
      });
    }
    if (churnData && churnData.top_at_risk) {
      csv += '\nCustomerID,RiskPercent,Frequency,Monetary\n';
      churnData.top_at_risk.forEach(c => {
        csv += `${c.CustomerID},${c.RiskPercent},${c.Frequency},${c.Monetary}\n`;
      });
    }
    if (forecastData && forecastData.chart_data) {
      csv += '\nPeriod,Revenue,Type\n';
      forecastData.chart_data.forEach(d => {
        csv += `${d.period},${d.revenue},${d.type}\n`;
      });
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDashboardJSON = () => {
    const payload = { overview: overviewData, forecast: forecastData, churn: churnData, insights: insightsData, affinity: affinityData };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_payload_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      let params = {};
      if (dateFilter) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const end_date = `${yyyy}-${mm}-${dd}`;
        let start_date;
        if (dateFilter === '30d') {
          const past = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          start_date = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
        } else if (dateFilter === '90d') {
          const past = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          start_date = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
        } else if (dateFilter === '1y') {
          const past = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
          start_date = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
        } else if (dateFilter === 'ytd') {
          start_date = `${yyyy}-01-01`;
        }
        params = { start_date, end_date };
      }

      const res = await axios.get(`${API_BASE}/reports/executive_pdf`, {
        params,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const safeName = (userProfile?.company_name || 'Ragada_Analytics').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `Executive_Summary_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF report:", err);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Auth Screen
  if (!token) {
    return (
      <AuthView
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        authError={authError}
        authLoading={authLoading}
        handleAuthSubmit={handleAuthSubmit}
      />
    );
  }

  // Workspace Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300 animate-pulse">
          Orchestrating Ragada Analytics workspace...
        </p>
      </div>
    );
  }

  // Initial Upload Prompt when no dataset is present
  if (!hasData) {
    return (
      <UploadModal
        showUploadModal={true}
        setShowUploadModal={() => {}}
        handleUploadInModal={handleUploadInModal}
        uploading={uploading}
        uploadMessage={uploadMessage}
        mappingInput={mappingInput}
        setMappingInput={setMappingInput}
      />
    );
  }

  // Main Dashboard View
  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container flex">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        setShowUploadModal={setShowUploadModal}
        setShowTargetsModal={setShowTargetsModal}
        setShowNotifications={setShowNotifications}
        setShowDocsModal={setShowDocsModal}
        exportDashboardCSV={exportDashboardCSV}
        exportDashboardJSON={exportDashboardJSON}
        handleDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
      />

      {/* Main Content Area */}
      <div className="ml-72 flex-1 flex flex-col min-h-screen">
        {/* Global Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          isDark={isDark}
          setIsDark={setIsDark}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          userProfile={userProfile}
          showProfileModal={showProfileModal}
          setShowProfileModal={setShowProfileModal}
          setShowCommandPalette={setShowCommandPalette}
          setShowTargetsModal={setShowTargetsModal}
          setShowUploadModal={setShowUploadModal}
          setShowDocsModal={setShowDocsModal}
          handleLogout={handleLogout}
          handleDownloadPdf={handleDownloadPdf}
          isDownloadingPdf={isDownloadingPdf}
        />

        {/* Main Tab View Wrapped in Error Boundaries */}
        <main className="flex-1 mt-16 p-space-xl overflow-y-auto max-w-[1700px] w-full mx-auto">
          {activeTab === 'overview' && (
            <ErrorBoundary name="Executive Overview View">
              <OverviewView
                overviewData={overviewData}
                forecastData={forecastData}
                churnData={churnData}
                insightsData={insightsData}
                targets={targets}
                setShowTargetsModal={setShowTargetsModal}
                exportDashboardCSV={exportDashboardCSV}
                exportDashboardJSON={exportDashboardJSON}
                openDrilldown={openDrilldown}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'clustering' && (
            <ErrorBoundary name="Customer RFM Clustering View">
              <ClusteringView
                clusterData={clusterData}
                exportDashboardCSV={exportDashboardCSV}
                setShowUploadModal={setShowUploadModal}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'metrics' && (
            <ErrorBoundary name="Enterprise Metric Studio View">
              <MetricStudioView
                overviewData={overviewData}
                churnData={churnData}
                insightsData={insightsData}
                affinityData={affinityData}
                exportDashboardCSV={exportDashboardCSV}
                exportDashboardJSON={exportDashboardJSON}
                exportAffinityToCSV={exportAffinityToCSV}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'copilot' && (
            <ErrorBoundary name="AI Data Copilot View">
              <CopilotView API_BASE={API_BASE} />
            </ErrorBoundary>
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <ErrorBoundary name="Command Palette Modal">
        <CommandPaletteModal
          showCommandPalette={showCommandPalette}
          setShowCommandPalette={setShowCommandPalette}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setActiveTab={setActiveTab}
          setShowUploadModal={setShowUploadModal}
          setShowTargetsModal={setShowTargetsModal}
          setShowDocsModal={setShowDocsModal}
          exportDashboardCSV={exportDashboardCSV}
          overviewData={overviewData}
        />
      </ErrorBoundary>

      <ErrorBoundary name="Upload Dataset Modal">
        <UploadModal
          showUploadModal={showUploadModal}
          setShowUploadModal={setShowUploadModal}
          handleUploadInModal={handleUploadInModal}
          uploading={uploading}
          uploadMessage={uploadMessage}
          mappingInput={mappingInput}
          setMappingInput={setMappingInput}
        />
      </ErrorBoundary>

      <ErrorBoundary name="Target Goals Modal">
        <TargetsModal
          showTargetsModal={showTargetsModal}
          setShowTargetsModal={setShowTargetsModal}
          targets={targets}
          setTargets={setTargets}
          handleSaveTargets={handleSaveTargets}
          overviewData={overviewData}
        />
      </ErrorBoundary>

      <ErrorBoundary name="Category Drilldown Modal">
        <DrilldownModal
          drilldownModal={drilldownModal}
          setDrilldownModal={setDrilldownModal}
        />
      </ErrorBoundary>

      <ErrorBoundary name="Documentation Modal">
        <DocsModal
          showDocsModal={showDocsModal}
          setShowDocsModal={setShowDocsModal}
        />
      </ErrorBoundary>
    </div>
  );
}
