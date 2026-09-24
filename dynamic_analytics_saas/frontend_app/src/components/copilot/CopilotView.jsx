import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'];

export default function CopilotView({ API_BASE }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Halo! Saya adalah **Ragada AI Data Copilot**. Anda dapat menanyakan apa saja tentang data penjualan, pelanggan VIP, tren omset, kategori terlaris, hingga prediksi churn dalam bahasa alami. Silakan klik salah satu contoh pertanyaan di bawah atau ketik pertanyaan Anda sendiri!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSql, setExpandedSql] = useState({});
  const messagesEndRef = useRef(null);

  const suggestionPrompts = [
    { label: '🏆 Pelanggan Belanja Tertinggi', query: 'Siapa 5 pelanggan dengan total belanja tertinggi?' },
    { label: '📈 Tren Pendapatan Bulanan', query: 'Tampilkan tren pendapatan dan volume order bulanan' },
    { label: '📦 Kategori Terlaris', query: 'Kategori produk mana yang paling laris dan berapa pendapatannya?' },
    { label: '⚠️ Risiko Pelanggan Churn', query: 'Pelanggan mana yang berisiko churn atau tidak aktif >60 hari?' },
    { label: '🌍 Sebaran Negara', query: 'Tampilkan sebaran transaksi dan pendapatan per negara' },
    { label: '💰 Ringkasan KPI Bisnis', query: 'Berapa ringkasan total pendapatan, transaksi, dan AOV?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendQuery = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsgId = 'user_' + Date.now();
    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: q,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(newMessages);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/copilot/query`, { query: q });
      const copilotResponse = res.data;

      setMessages([
        ...newMessages,
        {
          id: 'copilot_' + Date.now(),
          sender: 'assistant',
          text: copilotResponse.answer,
          sql: copilotResponse.sql,
          visualization: copilotResponse.visualization,
          columns: copilotResponse.columns,
          data: copilotResponse.data,
          summary: copilotResponse.summary,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          isError: true,
          text: 'Maaf, terjadi kendala saat memproses query analisis Anda: ' + (err.response?.data?.detail || err.message),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSql = (msgId) => {
    setExpandedSql(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const exportMsgCsv = (data, columns, filename = 'copilot_export.csv') => {
    if (!data || data.length === 0) return;
    const headers = columns.join(',');
    const rows = data.map(row => 
      columns.map(col => `"${row[col] !== undefined ? row[col] : ''}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderVisualization = (msg) => {
    if (!msg.data || msg.data.length === 0) return null;

    if (msg.visualization === 'line') {
      return (
        <div className="mt-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Visualisasi Tren Deret Waktu</span>
            <span className="text-xs text-secondary font-code-md">Recharts Auto-Scaled</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={msg.data}>
                <defs>
                  <linearGradient id="copilotArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-outline-variant/20" />
                <XAxis dataKey="period" stroke="currentColor" className="text-outline" tick={{fontSize: 11}} />
                <YAxis stroke="currentColor" className="text-outline" tick={{fontSize: 11}} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <RechartsTooltip 
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: 'var(--color-surface-container-high, #1e293b)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#copilotArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (msg.visualization === 'bar') {
      const xKey = msg.columns[0];
      const yKey = msg.columns[1];
      return (
        <div className="mt-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Visualisasi Distribusi Performa</span>
            <span className="text-xs text-primary font-code-md">Bar Analysis</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={msg.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-outline-variant/20" />
                <XAxis dataKey={xKey} stroke="currentColor" className="text-outline" tick={{fontSize: 11}} />
                <YAxis stroke="currentColor" className="text-outline" tick={{fontSize: 11}} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <RechartsTooltip 
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, yKey]}
                  contentStyle={{ backgroundColor: 'var(--color-surface-container-high, #1e293b)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Bar dataKey={yKey} fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (msg.visualization === 'pie') {
      const nameKey = msg.columns[0];
      const valueKey = msg.columns[1];
      return (
        <div className="mt-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col md:flex-row items-center justify-around gap-4">
          <div className="h-56 w-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={msg.data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4}>
                  {msg.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Total']}
                  contentStyle={{ backgroundColor: 'var(--color-surface-container-high, #1e293b)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 max-w-xs w-full">
            {msg.data.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-on-surface truncate">{item[nameKey] || 'N/A'}</span>
                </div>
                <span className="font-code-md text-secondary font-bold">${Number(item[valueKey] || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (msg.visualization === 'metric') {
      const row = msg.data[0] || {};
      return (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(row).map(([k, v], idx) => (
            <div key={idx} className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col">
              <span className="font-label-sm text-label-sm text-outline capitalize truncate">{k.replace(/_/g, ' ')}</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1 font-code-md">
                {typeof v === 'number' && k.includes('revenue') ? `$${v.toLocaleString()}` : v.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Default: Sortable Table
    return (
      <div className="mt-4 rounded-xl border border-outline-variant/30 overflow-hidden bg-surface-container-lowest">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/30 text-outline uppercase font-label-sm">
                {msg.columns.map((col, idx) => (
                  <th key={idx} className="py-2.5 px-4 font-semibold">{col.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {msg.data.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-surface-container/50 transition-colors">
                  {msg.columns.map((col, cIdx) => {
                    const val = row[col];
                    const isCurrency = col.toLowerCase().includes('spent') || col.toLowerCase().includes('revenue') || col.toLowerCase().includes('price') || col.toLowerCase().includes('value');
                    return (
                      <td key={cIdx} className="py-2 px-4 text-on-surface font-code-md">
                        {isCurrency && typeof val === 'number' ? `$${val.toLocaleString()}` : (val !== null && val !== undefined ? String(val) : '-')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-w-6xl mx-auto w-full gap-4">
      {/* Top Banner Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary via-indigo-500 to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/25 border border-white/20">
            <span className="material-symbols-outlined text-[26px] animate-pulse">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Ragada AI Data Copilot</h1>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[11px] font-bold border border-primary/20">NLP ENGINE</span>
            </div>
            <p className="font-body-sm text-body-sm text-outline mt-0.5">
              Ajukan pertanyaan analitik dalam bahasa alami. AI menerjemahkannya ke SQL terisolasi dan menampilkan visualisasi instan.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([messages[0]])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs transition-colors cursor-pointer border border-outline-variant/20"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset Obrolan</span>
          </button>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0 scrollbar-none">
        <span className="text-xs font-semibold text-outline flex items-center gap-1 pl-1 flex-shrink-0">
          <span className="material-symbols-outlined text-[14px] text-primary">lightbulb</span> Saran:
        </span>
        {suggestionPrompts.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(s.query)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-primary/10 hover:border-primary/40 border border-outline-variant/20 text-on-surface text-xs whitespace-nowrap transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 hover:text-primary disabled:opacity-50"
          >
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-surface-container-low border border-outline-variant/20 p-5 space-y-5 shadow-inner">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] font-semibold text-outline">
                {msg.sender === 'user' ? 'Anda' : 'Ragada AI Copilot'}
              </span>
              <span className="text-[10px] text-outline-variant">{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-3xl rounded-2xl p-4.5 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-primary to-indigo-600 text-white rounded-tr-none'
                  : 'bg-surface-container text-on-surface border border-outline-variant/20 rounded-tl-none'
              }`}
            >
              {/* Text Message */}
              <div className="font-body-md text-body-md leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </div>

              {/* Data Visualization if present */}
              {renderVisualization(msg)}

              {/* Collapsible SQL Query & Action Tools */}
              {msg.sql && (
                <div className="mt-4 pt-3 border-t border-outline-variant/20 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => toggleSql(msg.id)}
                      className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {expandedSql[msg.id] ? 'expand_less' : 'code'}
                      </span>
                      <span>{expandedSql[msg.id] ? 'Sembunyikan Query SQL' : 'Lihat Query SQL yang Dijalankan'}</span>
                    </button>

                    <div className="flex items-center gap-3">
                      {msg.summary && (
                        <span className="text-outline font-code-md text-[11px]">
                          ⚡ {msg.summary.latency_ms}ms • {msg.summary.rows_count} baris
                        </span>
                      )}
                      <button
                        onClick={() => exportMsgCsv(msg.data, msg.columns, `query_result_${Date.now()}.csv`)}
                        className="flex items-center gap-1 text-secondary hover:text-secondary/80 font-medium transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">download</span>
                        <span>Ekspor CSV</span>
                      </button>
                    </div>
                  </div>

                  {expandedSql[msg.id] && (
                    <div className="p-3 rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-cyan-900/40 shadow-inner mt-1">
                      <code>{msg.sql}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] font-semibold text-outline">Ragada AI Copilot</span>
              <span className="text-[10px] text-outline-variant">Thinking...</span>
            </div>
            <div className="bg-surface-container rounded-2xl rounded-tl-none p-4 border border-outline-variant/20 flex items-center gap-3 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Menerjemahkan pertanyaan ke SQL & menganalisis data transaksi...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Query Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="flex items-center gap-2.5 p-2 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-lg flex-shrink-0"
      >
        <div className="flex items-center pl-3 text-primary">
          <span className="material-symbols-outlined text-[22px]">chat_bubble_outline</span>
        </div>
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Tanyakan apa saja (contoh: Siapa pelanggan dengan pesanan terbanyak?)..."
          className="flex-1 bg-transparent py-2.5 px-2 outline-none text-on-surface font-body-md text-body-md placeholder:text-outline"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-label-md font-semibold flex items-center gap-2 shadow-md shadow-primary/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Kirim</span>
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>
    </div>
  );
}
