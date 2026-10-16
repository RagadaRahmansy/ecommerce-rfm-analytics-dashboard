/**
 * DataDojo Enterprise — Commercial Curriculum, Live Coding IDE & Membership Platform.
 * Architecture: Data (js/data) → Runtime Engines (js/engines) → Store (js/state.js) → Views (this file).
 */
(() => {
  'use strict';

  const { esc, md, toast, modal, ring, confetti } = window.UI;
  const view = document.getElementById('view');
  const topbar = document.getElementById('topbar');
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ===================================================================
  // PRECISION SVG ICON REGISTRY (ZERO EMOJI / ZERO AI SLOP)
  // ===================================================================
  const SVG = {
    lock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    unlock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>',
    check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    shield: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    zap: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
    flame: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>',
    award: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',
    terminal: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',
    code: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    chart: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
    clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    layers: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
    key: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>',
    user: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    switchUser: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>',
    logout: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
    creditCard: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
    play: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'
  };

  // ===================================================================
  // KONFIGURASI ENTERPRISE
  // ===================================================================
  const DIFF = {
    easy: { label: 'Fundamental', xp: 20 },
    medium: { label: 'Intermediate', xp: 40 },
    hard: { label: 'Advanced', xp: 70 }
  };
  const HINT_PENALTY = 0.25;
  const REVEALED_XP = 5;
  const DAILY_BONUS_XP = 30;
  const QUIZ_XP = 10;
  const FLASHCARD_XP = 5;
  const MOCK_XP_PER_CORRECT = 5;
  const MOCK_ACE_BONUS = 30;
  const MOCK_SECONDS = 45;

  const TRACKS = {
    sql: {
      key: 'sql',
      name: 'SQL Curriculum Lab',
      code: 'SQL-345',
      color: '#18181B',
      mode: 'text/x-sqlite',
      lang: 'SQLite 3.45 WASM',
      chapters: window.SQL_CHAPTERS,
      items: window.SQL_CHALLENGES,
      desc: 'Kurikulum SQL terstruktur dalam 4 Bab: dari seleksi skalar dasar (Bab 1 Gratis) hingga relational join multi-tabel, metrik kondisional, dan fungsi window analitik (Bab 2–4 Pro).'
    },
    python: {
      key: 'python',
      name: 'Python & pandas Lab',
      code: 'PY-311',
      color: '#4F46E5',
      mode: 'python',
      lang: 'Python 3 + pandas',
      chapters: window.PY_CHAPTERS,
      items: window.PY_CHALLENGES,
      desc: 'Kurikulum manipulasi data terstruktur dalam 4 Bab: operasi DataFrame vectorized dasar (Bab 1 Gratis), sanitasi missing value, agregasi deret waktu, hingga matrix pivoting (Bab 2–4 Pro).'
    }
  };
  const ALL_CHALLENGES = Object.values(TRACKS).flatMap((t) => t.items.map((c) => ({ ...c, track: t.key })));

  const BOTS = [
    ['Nadia Kusuma', 1850, 'NK', 'pro'],
    ['Rizky Pratama', 1620, 'RP', 'enterprise'],
    ['Putri Wijaya', 1410, 'PW', 'pro'],
    ['Dimas Saputra', 1180, 'DS', 'pro'],
    ['Siti Rahmawati', 960, 'SR', 'pro'],
    ['Budi Santoso', 720, 'BS', 'free'],
    ['Ayu Lestari', 540, 'AL', 'free'],
    ['Fajar Nugroho', 380, 'FN', 'free'],
    ['Maya Anggraini', 230, 'MA', 'free'],
    ['Eko Prasetyo', 120, 'EP', 'free']
  ];

  const CHEATSHEETS = {
    powerbi: { title: 'DAX Architecture Reference', code: `Total Sales = SUM(Sales[Amount])

Sales LY =
CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))

YoY % = DIVIDE([Total Sales] - [Sales LY], [Sales LY])

% of Total =
DIVIDE([Total Sales], CALCULATE([Total Sales], ALL('Product')))

Running Total =
CALCULATE([Total Sales],
  FILTER(ALL('Date'), 'Date'[Date] <= MAX('Date'[Date])))

Rank Product = RANKX(ALL('Product'[Name]), [Total Sales])` },
    sql: { title: 'SQL Execution Reference', code: `-- Logical Execution Order
FROM -> JOIN -> WHERE -> GROUP BY -> HAVING
-> SELECT -> DISTINCT -> ORDER BY -> LIMIT

-- Partitioned Ranking (Bab 4 Pro)
WITH r AS (
  SELECT *, DENSE_RANK() OVER (
    PARTITION BY category ORDER BY revenue DESC) AS rnk
  FROM product_revenue)
SELECT * FROM r WHERE rnk <= 3;

-- Anti-Join Pattern (Bab 2 Pro)
SELECT c.* FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;` },
    python: { title: 'pandas Vectorization Reference', code: `df.info(); df.describe(); df.isna().sum()
df[(df.a > 1) & (df.b == 'x')]          # boolean filter
df.loc[df.a > 1, 'flag'] = True          # safe assignment
df.groupby('cat', as_index=False)['rev'].sum()
df.pivot_table(index='city', columns='cat',
               values='rev', aggfunc='sum', fill_value=0)
df.merge(other, on='id', how='left')
df.drop_duplicates(subset='id')
df['date'].dt.to_period('M')
df['rev'].pct_change()` },
    stats: { title: 'Statistical Inference Reference', code: `Mean   : sensitive to extreme values
Median : robust against skewed distributions
SD     : dispersion around arithmetic mean
IQR    : Q3 - Q1, outlier < Q1-1.5IQR | > Q3+1.5IQR

p-value < alpha (0.05) -> Reject H0
Type I  : False Positive (alpha)
Type II : False Negative (beta), Power = 1 - beta

Correlation != Causation -> Controlled Experiment` },
    case: { title: 'Executive Case Diagnostic Framework', code: `1. Clarify   : Objective, metric formula, time window
2. Validate  : Pipeline latency, instrumentation bugs
3. Segment   : Time, geography, category, acquisition,
               new vs returning cohort, client platform
4. Hypothesize: Internal product/pricing vs external market
5. Quantify  : Cohort validation / A/B experiment
6. Recommend : Actionable intervention + guardrail KPI` }
  };

  // ===================================================================
  // HELPER STATE & ACCESS CONTROL
  // ===================================================================
  const S = () => window.Store.state;
  const isUnlocked = (tier) => tier === 'free' || window.Store.isPro();
  const trackDone = (key) => TRACKS[key].items.filter((c) => S().completed[c.id]).length;
  const chapterDone = (key, chapId) => TRACKS[key].items.filter((c) => c.chapter === chapId && S().completed[c.id]).length;
  const chapterTotal = (key, chapId) => TRACKS[key].items.filter((c) => c.chapter === chapId).length;
  const quizByCat = (cat) => window.QUIZ_BANK.filter((q) => q.cat === cat);
  const quizCorrect = (cat) => quizByCat(cat).filter((q) => S().quiz[q.id]?.correct).length;
  const cardsKnown = () => window.INTERVIEW_CARDS.filter((c) => S().flashcards[c.id] === 'known').length;

  function formatIdr(num) {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  }

  function rewardFor(ch) {
    const base = DIFF[ch.difficulty].xp;
    if (S().revealed[ch.id]) return REVEALED_XP;
    const hints = S().hintsUsed[ch.id] || 0;
    return Math.max(Math.round(base * 0.25), Math.round(base * (1 - HINT_PENALTY * hints)));
  }

  function hashString(str) {
    let h = 0;
    for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h;
  }

  function getDailyChallenge() {
    // Daily challenge prioritizes free challenges if user is on free plan so they can always participate
    const pool = Store.isPro() ? ALL_CHALLENGES : ALL_CHALLENGES.filter((c) => c.tier === 'free');
    return pool[hashString(Store.todayKey()) % pool.length];
  }

  // ===================================================================
  // ENTERPRISE CREDENTIAL BADGES (ZERO EMOJI)
  // ===================================================================
  const BADGES = [
    {
      id: 'sql_master',
      icon: 'SQL-IV',
      tier: 'mythic',
      tierLabel: 'PRINCIPAL CREDENTIAL',
      rarity: 'Top 1%',
      color: '#D97706',
      name: 'SQL Principal Architect',
      subtitle: 'Full 4-Chapter SQL Mastery',
      desc: 'Selesaikan seluruh 30 studi kasus SQL dari Bab 1 hingga Bab 4',
      lore: 'Menguasai seluruh spektrum SQL: dari seleksi skalar, anti-join, subquery berkorelasi, hingga fungsi window analitik (DENSE_RANK, PARTITION BY, LAG).',
      xpReward: 150,
      progress: () => ({ current: trackDone('sql'), max: TRACKS.sql.items.length, unit: 'modul' }),
      test: () => trackDone('sql') === TRACKS.sql.items.length
    },
    {
      id: 'py_master',
      icon: 'PY-IV',
      tier: 'mythic',
      tierLabel: 'PRINCIPAL CREDENTIAL',
      rarity: 'Top 1%',
      color: '#059669',
      name: 'Python Data Engineer',
      subtitle: 'Vectorized Pipeline Specialist',
      desc: 'Selesaikan seluruh 26 studi kasus Python & pandas (Bab 1–4)',
      lore: 'Mampu mentransformasikan dataset transaksi mentah menjadi matriks analitik menggunakan vektorisasi pandas tanpa bottleneck iterasi manual.',
      xpReward: 150,
      progress: () => ({ current: trackDone('python'), max: TRACKS.python.items.length, unit: 'modul' }),
      test: () => trackDone('python') === TRACKS.python.items.length
    },
    {
      id: 'mock_ace',
      icon: 'ACE-80',
      tier: 'legendary',
      tierLabel: 'EXECUTIVE CREDENTIAL',
      rarity: 'Top 3%',
      color: '#4F46E5',
      name: 'Timed Assessment Ace',
      subtitle: 'High-Pressure Evaluation Pass',
      desc: 'Raih skor Timed Assessment Simulator >= 80%',
      lore: 'Menjawab soal teknis di bawah batas waktu 45 detik per soal dengan akurasi tinggi sesuai standar asesmen korporat.',
      xpReward: 120,
      progress: () => ({ current: Math.min(100, S().mockBest || 0), max: 80, unit: '%' }),
      test: () => (S().mockBest || 0) >= 80
    },
    {
      id: 'bi_pro',
      icon: 'DAX-10',
      tier: 'legendary',
      tierLabel: 'EXECUTIVE CREDENTIAL',
      rarity: 'Top 5%',
      color: '#0284C7',
      name: 'Power BI & DAX Specialist',
      subtitle: 'Context Transition Architect',
      desc: 'Jawab benar 10 soal asesmen Power BI & DAX',
      lore: 'Memahami perbedaan antara Row Context dan Filter Context, evaluasi CALCULATE, serta optimasi kompresi VertiPaq Star Schema.',
      xpReward: 100,
      progress: () => ({ current: Math.min(10, quizCorrect('powerbi')), max: 10, unit: 'soal' }),
      test: () => quizCorrect('powerbi') >= 10
    },
    {
      id: 'streak_7',
      icon: 'SLA-07',
      tier: 'legendary',
      tierLabel: 'EXECUTIVE CREDENTIAL',
      rarity: 'Top 5%',
      color: '#E11D48',
      name: '7-Day Operational Discipline',
      subtitle: 'Consistent Analytical Cadence',
      desc: 'Pertahankan aktivitas latihan 7 hari berturut-turut',
      lore: 'Disiplin eksekusi harian yang konsisten selama satu minggu penuh tanpa terputus.',
      xpReward: 100,
      progress: () => ({ current: Math.min(7, Store.getActiveStreak()), max: 7, unit: 'hari' }),
      test: () => Store.getActiveStreak() >= 7
    },
    {
      id: 'pure_skill',
      icon: 'RAW-01',
      tier: 'legendary',
      tierLabel: 'EXECUTIVE CREDENTIAL',
      rarity: 'Top 8%',
      color: '#7C3AED',
      name: 'Zero-Assistance Execution',
      subtitle: 'Autonomous Problem Solver',
      desc: 'Selesaikan modul tingkat Advanced tanpa membuka Hint atau Solusi',
      lore: 'Menganalisis skema relasional dan merumuskan query kompleks secara mandiri tanpa bantuan dokumentasi petunjuk.',
      xpReward: 100,
      progress: () => {
        const hard = ALL_CHALLENGES.filter((c) => c.difficulty === 'hard');
        const donePure = hard.filter((c) => S().completed[c.id] && !S().hintsUsed[c.id] && !S().revealed[c.id]).length;
        return { current: Math.min(1, donePure), max: 1, unit: 'modul' };
      },
      test: () => ALL_CHALLENGES.some((c) => c.difficulty === 'hard' && S().completed[c.id] && !S().hintsUsed[c.id] && !S().revealed[c.id])
    },
    {
      id: 'streak_3',
      icon: 'SLA-03',
      tier: 'epic',
      tierLabel: 'SENIOR CREDENTIAL',
      rarity: 'Top 15%',
      color: '#EA580C',
      name: '3-Day Active Cadence',
      subtitle: 'Momentum Builder',
      desc: 'Selesaikan latihan 3 hari berturut-turut',
      lore: 'Membangun ritme latihan teknis secara konsisten.',
      xpReward: 60,
      progress: () => ({ current: Math.min(3, Store.getActiveStreak()), max: 3, unit: 'hari' }),
      test: () => Store.getActiveStreak() >= 3
    },
    {
      id: 'interview_ready',
      icon: 'STAR-15',
      tier: 'epic',
      tierLabel: 'SENIOR CREDENTIAL',
      rarity: 'Top 18%',
      color: '#DB2777',
      name: 'Executive Communication',
      subtitle: 'STAR & Business Case Mastery',
      desc: 'Kuasai 15 skenario Interview Playbook',
      lore: 'Menguasai kerangka komunikasi STAR, metrik unit economics (CAC, LTV, Churn), serta investigasi anomali metrik.',
      xpReward: 60,
      progress: () => ({ current: Math.min(15, cardsKnown()), max: 15, unit: 'kartu' }),
      test: () => cardsKnown() >= 15
    },
    {
      id: 'first_blood',
      icon: 'INIT-01',
      tier: 'rare',
      tierLabel: 'ASSOCIATE CREDENTIAL',
      rarity: 'Top 30%',
      color: '#CA8A04',
      name: 'First Verified Execution',
      subtitle: 'Runtime Verification Pass',
      desc: 'Selesaikan modul live coding pertama',
      lore: 'Validasi pertama kode analitik terhadap test case otomatis.',
      xpReward: 50,
      progress: () => ({ current: Math.min(1, Object.keys(S().completed).length), max: 1, unit: 'modul' }),
      test: () => Object.keys(S().completed).length >= 1
    },
    {
      id: 'sql_rookie',
      icon: 'SQL-I',
      tier: 'rare',
      tierLabel: 'ASSOCIATE CREDENTIAL',
      rarity: 'Top 35%',
      color: '#0284C7',
      name: 'SQL Foundation Certified',
      subtitle: 'Bab 1–2 Relational Competence',
      desc: 'Selesaikan 3 modul studi kasus SQL',
      lore: 'Memahami seleksi dasar, pemfilteran skalar, pengelompokan GROUP BY, dan agregasi data.',
      xpReward: 40,
      progress: () => ({ current: Math.min(3, trackDone('sql')), max: 3, unit: 'modul' }),
      test: () => trackDone('sql') >= 3
    },
    {
      id: 'py_rookie',
      icon: 'PY-I',
      tier: 'rare',
      tierLabel: 'ASSOCIATE CREDENTIAL',
      rarity: 'Top 40%',
      color: '#16A34A',
      name: 'pandas Foundation Certified',
      subtitle: 'Bab 1 DataFrame Competence',
      desc: 'Selesaikan 3 modul studi kasus Python',
      lore: 'Menguasai struktur DataFrame pandas, boolean indexing, dan kalkulasi kolom vectorized.',
      xpReward: 40,
      progress: () => ({ current: Math.min(3, trackDone('python')), max: 3, unit: 'modul' }),
      test: () => trackDone('python') >= 3
    },
    {
      id: 'daily',
      icon: 'DLY-01',
      tier: 'rare',
      tierLabel: 'ASSOCIATE CREDENTIAL',
      rarity: 'Top 45%',
      color: '#7C3AED',
      name: 'Daily Assessment Completed',
      subtitle: 'Scheduled Problem Verification',
      desc: 'Selesaikan Daily Assessment hari ini',
      lore: 'Menyelesaikan tantangan harian terjadwal tepat waktu.',
      xpReward: 40,
      progress: () => ({ current: S().dailyDone === Store.todayKey() ? 1 : 0, max: 1, unit: 'hari' }),
      test: () => Boolean(S().dailyDone)
    }
  ];

  function checkBadges(silent = false) {
    const fresh = BADGES.filter((b) => !S().badges[b.id] && b.test());
    if (!fresh.length) return;
    Store.update((st) => {
      fresh.forEach((b) => {
        st.badges[b.id] = Store.todayKey();
      });
    });
    if (!silent) {
      fresh.forEach((b, i) => setTimeout(() => {
        toast(`Kredensial Terverifikasi [${b.tierLabel}]: ${b.name} (+${b.xpReward} XP)`, 'badge', 4500);
        confetti(90);
      }, 500 + i * 800));
    }
  }

  function showBadgeModal(b) {
    const s = S();
    const isEarned = Boolean(s.badges[b.id]);
    const earnedDate = s.badges[b.id];
    const prog = b.progress ? b.progress() : { current: isEarned ? 1 : 0, max: 1, unit: '' };
    const pct = Math.min(100, Math.round((prog.current / (prog.max || 1)) * 100));

    if (isEarned) confetti(50);

    modal(`
      <div class="badge-modal-box tier-${b.tier}">
        <div class="bm-header">
          <span class="bm-tier-tag tier-${b.tier}">${b.tierLabel} · ${b.rarity}</span>
          <span class="bm-xp-tag">+${b.xpReward} XP</span>
        </div>
        <div class="bm-icon-stage tier-${b.tier}">
          <div class="bm-glow"></div>
          <span class="bm-icon font-mono" style="font-size:18px;font-weight:800;letter-spacing:0.04em">${esc(b.icon)}</span>
        </div>
        <h2 class="bm-title">${esc(b.name)}</h2>
        <span class="bm-sub">${esc(b.subtitle)}</span>
        
        <p class="bm-desc">${esc(b.desc)}</p>

        <div class="bm-progress-card">
          <div class="bm-prog-head">
            <span>Status Verifikasi</span>
            <strong>${prog.current} / ${prog.max} ${esc(prog.unit)} (${pct}%)</strong>
          </div>
          <div class="bar big bm-bar"><i style="width:${pct}%"></i></div>
          <div class="bm-prog-foot">
            ${isEarned
              ? `<span class="ok-text">Terverifikasi pada ${esc(earnedDate)}</span>`
              : `<span class="muted">Selesaikan ${Math.max(0, prog.max - prog.current)} ${esc(prog.unit)} lagi untuk membuka kredensial</span>`}
          </div>
        </div>

        <div class="bm-lore-card">
          <div class="bm-lore-title">Kompetensi Teknis yang Diuji:</div>
          <p class="bm-lore-text">${esc(b.lore)}</p>
        </div>

        <div class="bm-actions">
          ${isEarned ? `
            <button class="btn btn-focus btn-lg" id="btnBragBadge">Salin Tautan Kredensial</button>
          ` : `
            <button class="btn btn-primary btn-lg" data-close>Lanjutkan Kurikulum</button>
          `}
          <button class="btn btn-ghost" data-close>Tutup</button>
        </div>
      </div>
    `);

    const btnBrag = $('#btnBragBadge');
    if (btnBrag) {
      btnBrag.addEventListener('click', () => {
        const bragText = `Verified Credential [${b.tierLabel}]: ${b.name} (${b.subtitle}) — DataDojo Enterprise Analytics Assessment Platform.`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(bragText).then(() => {
            toast('Kredensial disalin ke clipboard.', 'info');
          }).catch(() => {
            toast('Kredensial siap dibagikan.', 'info');
          });
        } else {
          toast('Kredensial siap dibagikan.', 'info');
        }
      });
    }
  }

  function awardXp(amount, note = '') {
    const res = Store.addXp(amount);
    toast(`+${amount} XP${note ? ' · ' + note : ''}`, 'xp');
    if (res.leveledUp) {
      setTimeout(() => {
        confetti(160);
        modal(`<div class="levelup">
          <div class="levelup-code-badge">${esc(res.level.code)}</div>
          <span class="eyebrow">PROMOSI TINGKAT KOMPETENSI</span>
          <h2>Level ${res.level.number} · ${esc(res.level.code)}</h2>
          <p>Kualifikasi akun Anda naik menjadi <strong>${esc(res.level.title)}</strong>.</p>
          <button class="btn btn-primary" data-close>Lanjutkan Eksekusi</button></div>`);
      }, 500);
    }
  }

  // ===================================================================
  // COMMERCIAL PAYWALL & CHECKOUT MODALS
  // ===================================================================
  function openPaywallModal({ title = 'Modul Lanjutan (Bab 2–4)', chapterCode = 'BAB 02–04', feature = 'Materi Lanjutan & Enterprise', returnHash = null } = {}) {
    const close = modal(`
      <div class="paywall-modal">
        <div class="pwm-top-bar">
          <span class="pwm-lock-badge">${SVG.lock} PRO MEMBERSHIP REQUIRED</span>
          <span class="pwm-chap-code">${esc(chapterCode)}</span>
        </div>
        <h2 class="pwm-title">Buka Akses ke ${esc(title)}</h2>
        <p class="pwm-sub">Akun Anda saat ini berada pada paket <strong>Starter Free</strong> (khusus <strong>Bab 1: Materi Dasar</strong>). Tingkatkan ke <strong>Pro Analyst Membership</strong> untuk membuka seluruh kurikulum lanjutan.</p>

        <div class="pwm-comparison-box">
          <div class="pwm-col free">
            <div class="pwm-col-head">
              <span class="label-caps">PAKET SAAT INI</span>
              <strong>Starter Free</strong>
            </div>
            <ul class="pwm-list">
              <li class="included">${SVG.check} <span>Bab 1: Materi Dasar (SQL, Python, BI, Interview)</span></li>
              <li class="included">${SVG.check} <span>SQLite &amp; Pyodide In-Browser IDE</span></li>
              <li class="excluded"><span>✕</span> <span>Bab 2: Relational Joins &amp; Data Sanitization</span></li>
              <li class="excluded"><span>✕</span> <span>Bab 3: Conditional Metrics &amp; Time-Series</span></li>
              <li class="excluded"><span>✕</span> <span>Bab 4: Window Functions &amp; Matrix Pivoting</span></li>
              <li class="excluded"><span>✕</span> <span>Kunci Solusi Resmi &amp; Full Timed Simulator</span></li>
            </ul>
          </div>

          <div class="pwm-col pro">
            <div class="pwm-col-head">
              <span class="label-caps" style="color:#4F46E5">DIREKOMENDASIKAN</span>
              <strong>Pro Analyst Membership</strong>
              <div class="pwm-price-tag">Rp 99.000<small>/bulan (ditagih tahunan)</small></div>
            </div>
            <ul class="pwm-list">
              <li class="included pro-check">${SVG.check} <span><strong>Akses Penuh Bab 1, Bab 2, Bab 3 &amp; Bab 4</strong> (Semua Track)</span></li>
              <li class="included pro-check">${SVG.check} <span><strong>56 Modul Live Coding</strong> (30 SQL &amp; 26 Python) + Auto-Grader</span></li>
              <li class="included pro-check">${SVG.check} <span><strong>40 Skenario Interview Playbook</strong> &amp; 65 Soal Asesmen BI/DAX</span></li>
              <li class="included pro-check">${SVG.check} <span><strong>Official Reference Solutions</strong> &amp; Query Plan Analysis</span></li>
              <li class="included pro-check">${SVG.check} <span><strong>Full Timed Assessment Simulator</strong> &amp; Kredensial Terverifikasi</span></li>
            </ul>
          </div>
        </div>

        <div class="pwm-promo-bar">
          <div class="pwm-promo-left">
            <span class="label-caps">PUNYA KODE LISENSI / VOUCHER KORPORAT?</span>
            <small class="muted">Gunakan kode demo <code>PRO2026</code> atau <code>ENTERPRISE2026</code> untuk aktivasi instan.</small>
          </div>
          <div class="pwm-promo-input-group">
            <input id="pwmLicenseInput" placeholder="Masukkan kode lisensi (mis. PRO2026)" value="PRO2026" />
            <button class="btn btn-secondary btn-sm" id="btnRedeemLicense">Aktifkan Kode</button>
          </div>
        </div>

        <div class="pwm-actions">
          <button class="btn btn-focus btn-lg" id="btnPaywallCheckout">${SVG.creditCard} Upgrade ke Pro Membership — Rp 99.000/bln</button>
          <a href="#/pricing" class="btn btn-secondary btn-lg" id="btnViewFullPricing">Lihat Tabel Harga &amp; Paket Tim</a>
          <button class="btn btn-ghost" data-close>Kembali ke Materi Dasar</button>
        </div>
      </div>
    `);

    $('#btnPaywallCheckout')?.addEventListener('click', () => {
      close();
      openCheckoutModal('pro', 'annual', returnHash);
    });

    $('#btnViewFullPricing')?.addEventListener('click', () => {
      close();
    });

    $('#btnRedeemLicense')?.addEventListener('click', () => {
      const code = ($('#pwmLicenseInput')?.value || '').trim().toUpperCase();
      if (!code) {
        toast('Masukkan kode lisensi terlebih dahulu.', 'warn');
        return;
      }
      const targetPlan = code.includes('ENT') ? 'enterprise' : 'pro';
      Store.setPlan(targetPlan, {
        cycle: 'annual',
        method: `License Key (${code})`,
        amount: targetPlan === 'enterprise' ? 4788000 : 1188000,
        licenseKey: code
      });
      close();
      confetti(160);
      toast(`Lisensi ${targetPlan.toUpperCase()} berhasil diaktifkan! Seluruh Bab 2–4 kini terbuka.`, 'badge', 4500);
      if (returnHash) location.hash = returnHash;
      else router();
    });
  }

  function openCheckoutModal(planKey = 'pro', cycle = 'annual', returnHash = null) {
    const plan = Store.getPlanInfo(planKey);
    const monthlyRate = cycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
    const totalAmount = cycle === 'annual' ? plan.priceAnnual * 12 : plan.priceMonthly;
    const ppn = Math.round(totalAmount * 0.11);
    const grandTotal = totalAmount + ppn;

    let selectedMethod = 'QRIS Enterprise Instant';

    const close = modal(`
      <div class="checkout-modal">
        <div class="cm-header">
          <div>
            <span class="label-caps">COMMERCIAL LICENSE CHECKOUT</span>
            <h2>Aktivasi ${esc(plan.name)}</h2>
          </div>
          <span class="chip chip-focus">${cycle === 'annual' ? 'ANNUAL BILLING (-33%)' : 'MONTHLY BILLING'}</span>
        </div>

        <div class="cm-summary-card">
          <div class="cm-row">
            <span>Paket Langganan</span>
            <strong>${esc(plan.name)} (${cycle === 'annual' ? '12 Bulan' : '1 Bulan'})</strong>
          </div>
          <div class="cm-row">
            <span>Harga Dasar (${formatIdr(monthlyRate)} × ${cycle === 'annual' ? '12 bln' : '1 bln'})</span>
            <span>${formatIdr(totalAmount)}</span>
          </div>
          <div class="cm-row">
            <span>PPN (11%)</span>
            <span>${formatIdr(ppn)}</span>
          </div>
          <div class="cm-divider"></div>
          <div class="cm-row total">
            <span>Total Tagihan</span>
            <strong>${formatIdr(grandTotal)}</strong>
          </div>
        </div>

        <div class="cm-methods">
          <span class="label-caps">PILIH METODE PEMBAYARAN</span>
          <div class="cm-method-grid" id="cmMethodGrid">
            <button type="button" class="cm-method-btn active" data-method="QRIS Enterprise Instant">
              <strong>QRIS Instant</strong>
              <small>BCA, Mandiri, GoPay, OVO</small>
            </button>
            <button type="button" class="cm-method-btn" data-method="BCA Virtual Account">
              <strong>BCA Virtual Account</strong>
              <small>Verifikasi Otomatis</small>
            </button>
            <button type="button" class="cm-method-btn" data-method="Mandiri Virtual Account">
              <strong>Mandiri Bill Payment</strong>
              <small>Livin' / Corporate</small>
            </button>
            <button type="button" class="cm-method-btn" data-method="Corporate Visa / Mastercard">
              <strong>Corporate Card</strong>
              <small>Visa / Mastercard / JCB</small>
            </button>
          </div>
        </div>

        <div class="cm-actions">
          <button class="btn btn-focus btn-lg" id="btnConfirmPayment">${SVG.shield} Bayar &amp; Aktifkan Sekarang (${formatIdr(grandTotal)})</button>
          <button class="btn btn-ghost" data-close>Batal</button>
        </div>
      </div>
    `);

    $('#cmMethodGrid')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-method]');
      if (!btn) return;
      selectedMethod = btn.dataset.method;
      $$('.cm-method-btn', $('#cmMethodGrid')).forEach((b) => b.classList.toggle('active', b === btn));
    });

    $('#btnConfirmPayment')?.addEventListener('click', () => {
      Store.setPlan(planKey, {
        cycle,
        method: selectedMethod,
        amount: grandTotal
      });
      close();
      confetti(180);
      toast(`Pembayaran terverifikasi! Paket ${plan.name} aktif. Seluruh Bab 1–4 terbuka.`, 'badge', 4800);
      if (returnHash) location.hash = returnHash;
      else router();
    });
  }

  // ===================================================================
  // KOMPONEN KECIL
  // ===================================================================
  const diffChip = (d) => `<span class="chip diff-${d}">${DIFF[d].label}</span>`;
  const tierBadge = (tier) => {
    if (tier === 'free') {
      return `<span class="tier-pill tier-free">${SVG.check} MATERI DASAR · GRATIS</span>`;
    }
    if (Store.isPro()) {
      return `<span class="tier-pill tier-pro-unlocked">${SVG.unlock} PRO · TERBUKA</span>`;
    }
    return `<span class="tier-pill tier-pro-locked">${SVG.lock} PRO MEMBERSHIP</span>`;
  };

  function loadingBox(msg) {
    return `<div class="loading"><span class="spinner"></span><span class="loading-msg">${esc(msg)}</span></div>`;
  }

  function errorBox(msg) {
    return `<div class="error-box"><strong>Execution Error</strong><pre>${esc(msg)}</pre></div>`;
  }

  function sqlTable(res, limit = window.SqlEngine.MAX_DISPLAY_ROWS) {
    if (!res.columns.length) return '<p class="muted">Query berhasil dijalankan, tetapi tidak mengembalikan baris.</p>';
    const rows = res.values.slice(0, limit);
    const fmt = window.SqlEngine.formatCell;
    return `<div class="table-meta">${res.values.length} baris × ${res.columns.length} kolom${res.values.length > limit ? ` (menampilkan ${limit})` : ''}</div>
      <div class="table-wrap"><table class="df-table"><thead><tr>${res.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((v) => `<td class="${v === null ? 'null' : typeof v === 'number' ? 'num' : ''}">${esc(fmt(v))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function pyValue(v) {
    if (!v || v.type === 'none') return '';
    if (v.type === 'html') return `<div class="table-wrap">${v.html}</div>`;
    return `<pre class="stdout">${esc(v.text)}</pre>`;
  }

  function pyOutput(r) {
    let html = '';
    if (r.stdout) html += `<div class="out-label">stdout</div><pre class="stdout">${esc(r.stdout)}</pre>`;
    if (r.error) html += errorBox(r.error);
    if (r.result && r.result.type !== 'none') {
      const shape = r.result.shape ? ` · ${r.result.shape[0]} baris × ${r.result.shape[1]} kolom` : '';
      html += `<div class="out-label">result${shape}</div>${pyValue(r.result)}`;
    }
    return html || '<p class="muted">Kode berjalan tanpa output. Gunakan <code>print()</code> atau simpan jawaban ke <code>result</code>.</p>';
  }

  function createEditor(textarea, mode, { onRun, onSubmit }) {
    const indent = mode === 'python' ? 4 : 2;
    if (window.CodeMirror) {
      const cm = window.CodeMirror.fromTextArea(textarea, {
        mode, theme: 'dojo', lineNumbers: true, matchBrackets: true, autoCloseBrackets: true,
        indentUnit: indent, tabSize: indent, lineWrapping: false, cursorBlinkRate: 530,
        extraKeys: {
          'Ctrl-Enter': onRun, 'Cmd-Enter': onRun, 'Shift-Ctrl-Enter': onSubmit, 'Shift-Cmd-Enter': onSubmit,
          Tab: (ed) => (ed.somethingSelected() ? ed.indentSelection('add') : ed.replaceSelection(' '.repeat(indent)))
        }
      });
      let marked = null;
      const clearMarks = () => {
        if (marked === null) return;
        cm.removeLineClass(marked, 'wrap', 'cm-error-line');
        cm.setGutterMarker(marked, 'CodeMirror-linenumbers', null);
        marked = null;
      };
      cm.on('change', clearMarks);
      setTimeout(() => cm.refresh(), 50);
      return {
        get: () => cm.getValue(),
        set: (v) => cm.setValue(v),
        onChange: (fn) => cm.on('change', () => fn(cm.getValue())),
        markErrorLine: (line) => {
          clearMarks();
          if (!line || line < 1 || line > cm.lineCount()) return;
          marked = line - 1;
          cm.addLineClass(marked, 'wrap', 'cm-error-line');
          cm.scrollIntoView({ line: marked, ch: 0 }, 60);
        },
        clearMarks,
        refresh: () => cm.refresh(),
        destroy: () => cm.toTextArea()
      };
    }
    textarea.classList.add('plain-editor');
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        textarea.setRangeText(' '.repeat(indent), textarea.selectionStart, textarea.selectionEnd, 'end');
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        (e.shiftKey ? onSubmit : onRun)();
      }
    });
    return {
      get: () => textarea.value,
      set: (v) => { textarea.value = v; },
      onChange: (fn) => textarea.addEventListener('input', () => fn(textarea.value)),
      markErrorLine: () => {},
      clearMarks: () => {},
      refresh: () => {},
      destroy: () => {}
    };
  }

  function diagnoseSqlError(message, code) {
    const lines = code.split('\n');
    const escapeRegex = (s) => s.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&');
    const findLine = (token) => {
      if (!token) return null;
      const re = new RegExp('(^|\\W)' + escapeRegex(token) + '(\\W|$)', 'i');
      const idx = lines.findIndex((l) => !l.trim().startsWith('--') && re.test(l));
      return idx >= 0 ? idx + 1 : null;
    };
    const allColumns = SqlEngine.SCHEMA.flatMap((t) => t.columns.map(([c]) => ({ table: t.table, col: c })));

    let m = /no such column: ([\w.]+)/i.exec(message);
    if (m) {
      const [alias, col] = m[1].includes('.') ? m[1].split('.') : [null, m[1]];
      const similar = allColumns.filter((c) => c.col.startsWith(col.slice(0, 4)) || col.startsWith(c.col.slice(0, 4)));
      const suggestion = similar.length
        ? `Mungkin maksud Anda ${[...new Set(similar.map((c) => `<code>${alias ? alias + '.' : ''}${esc(c.col)}</code>`))].join(' / ')}?`
        : 'Periksa tab Skema untuk nama kolom yang valid.';
      return { line: findLine(m[1]), hint: `Kolom <code>${esc(m[1])}</code> tidak ditemukan. ${suggestion} Pastikan juga alias tabel sudah di-JOIN.` };
    }
    m = /no such table: (\w+)/i.exec(message);
    if (m) return { line: findLine(m[1]), hint: `Tabel <code>${esc(m[1])}</code> tidak ditemukan. Tabel tersedia: ${SqlEngine.SCHEMA.map((t) => `<code>${t.table}</code>`).join(', ')}.` };
    m = /near "([^"]+)": syntax error/i.exec(message);
    if (m) {
      const token = m[1];
      let errLine = findLine(token);
      let hint = `Kesalahan sintaks di sekitar token <code>${esc(token)}</code>.`;
      if (/join\s*orders\s*o\s+on\s+o\.order_id\s*=\s*oi\.product_id/i.test(code) || /o\.order_id\s*=\s*oi\.product_id/i.test(code) || /o\.statuses/i.test(code) || /joinorders/i.test(code)) {
        hint = `Kolom perbandingan relasi tidak sesuai skema. Hubungkan <code>o.order_id = oi.order_id</code> (bukan <code>oi.product_id</code>), serta pastikan nama kolom status order adalah <code>o.status</code>.`;
        if (!errLine) {
          const lIdx = lines.findIndex((l) => /join/i.test(l) && /order/i.test(l));
          if (lIdx >= 0) errLine = lIdx + 1;
        }
      } else if (/(^|[\s(])[a-z]{1,2},[a-z_]{3,}/im.test(code)) {
        hint += ' Periksa apakah ada tanda koma yang seharusnya titik (mis. <code>p,product_name</code> → <code>p.product_name</code>).';
      } else if (/\bas[ \t]+\w+[ \t]+(?!(from|where|group|order|join|on|left|inner|limit|having|end|union|over)\b)\w+/i.test(code)) {
        hint += ' Alias kolom tidak boleh mengandung spasi — gunakan underscore (<code>total_qty</code>).';
      }
      return { line: errLine || 5, hint };
    }
    m = /ambiguous column name: (\w+)/i.exec(message);
    if (m) return { line: findLine(m[1]), hint: `Kolom <code>${esc(m[1])}</code> ambigu karena ada di beberapa tabel. Tambahkan prefix alias tabel, mis. <code>o.${esc(m[1])}</code>.` };
    if (/misuse of aggregate/i.test(message)) return { line: null, hint: 'Fungsi agregat (SUM, COUNT, AVG) tidak dapat dievaluasi di dalam klausa WHERE. Gunakan HAVING atau Subquery.' };
    return { line: null, hint: '' };
  }

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
  }
  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { /* ignore */ }
  }

  // ===================================================================
  // ROUTER
  // ===================================================================
  let cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);
  function runCleanups() {
    cleanups.forEach((fn) => {
      try { fn(); } catch (err) { console.error('Cleanup error', err); }
    });
    cleanups = [];
  }

  const ROUTES = [
    [/^#?\/?$/, () => renderDashboard()],
    [/^#\/dashboard$/, () => renderDashboard()],
    [/^#\/(sql|python)$/, (m) => renderTrackList(m[1])],
    [/^#\/(sql|python)\/([\w-]+)$/, (m) => renderChallenge(m[1], m[2])],
    [/^#\/quiz$/, () => renderQuiz()],
    [/^#\/interview$/, () => renderInterview()],
    [/^#\/mock$/, () => renderMock()],
    [/^#\/pricing$/, () => renderPricing()],
    [/^#\/leaderboard$/, () => renderLeaderboard()],
    [/^#\/profile$/, () => renderProfile()]
  ];

  const SECTION_LABELS = {
    dashboard: ['Workspace', 'Executive Overview'],
    sql: ['Curriculum Labs', 'SQL Curriculum (4 Bab)'],
    python: ['Curriculum Labs', 'Python & pandas (4 Bab)'],
    quiz: ['Assessment Suite', 'Power BI & DAX (4 Bab)'],
    interview: ['Assessment Suite', 'Interview Playbook (4 Bab)'],
    mock: ['Assessment Suite', 'Timed Assessment Simulator'],
    pricing: ['Credentials & Licensing', 'Membership & Plans'],
    leaderboard: ['Credentials & Licensing', 'Global Benchmark'],
    profile: ['Credentials & Licensing', 'Account & Credentials']
  };

  let topbarProblem = null;

  function router() {
    runCleanups();
    topbarProblem = null;
    const hash = location.hash || '#/';
    const isIde = /^#\/(sql|python)\/[\w-]+$/.test(hash);
    document.body.classList.toggle('ide-mode', isIde);
    const route = ROUTES.find(([re]) => re.test(hash));
    if (route) route[1](hash.match(route[0]));
    else view.innerHTML = '<div class="card empty"><h2>404 — Halaman Tidak Ditemukan</h2><p class="muted">Rute yang Anda tuju tidak tersedia dalam kurikulum.</p><a class="btn btn-primary" href="#/">Kembali ke Executive Overview</a></div>';
    const section = (hash.split('/')[1] || 'dashboard');
    $$('.nav-link').forEach((a) => a.classList.toggle('active', a.dataset.section === section));
    renderTopbar();
    renderSidebarFooter();
    view.classList.remove('fade-in');
    void view.offsetWidth;
    view.classList.add('fade-in');
    window.scrollTo({ top: 0 });
  }

  // ===================================================================
  // TOPBAR & SIDEBAR PLAN WIDGET
  // ===================================================================
  function renderSidebarFooter() {
    const box = document.getElementById('sidebarPlanBox');
    const mockTag = document.getElementById('navMockTag');
    const pro = Store.isPro();
    const planInfo = Store.getPlanInfo();
    if (mockTag) {
      mockTag.textContent = pro ? 'OPEN' : 'PRO';
      mockTag.className = `nav-pro-tag ${pro ? 'unlocked' : ''}`;
    }
    if (!box) return;
    if (pro) {
      box.innerHTML = `
        <div class="spb-card is-pro">
          <div class="spb-head">
            <span class="spb-badge pro">${SVG.shield} ${esc(planInfo.badge)}</span>
            <span class="spb-status">ACTIVE</span>
          </div>
          <strong>Seluruh Bab 1–4 Terbuka</strong>
          <small>Lisensi: <code>${esc(S().licenseKey || 'PRO-ACTIVE')}</code></small>
          <a href="#/pricing" class="btn btn-secondary btn-xs" style="margin-top:6px;width:100%">Kelola Lisensi</a>
        </div>
      `;
    } else {
      box.innerHTML = `
        <div class="spb-card is-free">
          <div class="spb-head">
            <span class="spb-badge free">STARTER FREE</span>
            <span class="spb-status">BAB 1 ONLY</span>
          </div>
          <strong>Buka Materi Lanjutan (Bab 2–4)</strong>
          <small>Akses penuh SQL Window, pandas Pivot, DAX &amp; Simulator.</small>
          <a href="#/pricing" class="btn btn-focus btn-xs" style="margin-top:8px;width:100%">Upgrade ke Pro →</a>
        </div>
      `;
    }
  }

  function renderTopbar() {
    const s = S();
    const lvl = Store.getLevel();
    const streak = Store.getActiveStreak();
    const pro = Store.isPro();
    const planInfo = Store.getPlanInfo();
    const section = ((location.hash || '#/').split('/')[1] || 'dashboard');
    const [group, page] = SECTION_LABELS[section] || SECTION_LABELS.dashboard;
    const initial = esc((s.name || 'Ragada').trim().charAt(0).toUpperCase());

    const problem = topbarProblem
      ? `<div class="tb-problem">
          <span class="tb-problem-idx">BAB 0${topbarProblem.chapter} · ${topbarProblem.index}/${topbarProblem.total}</span>
          <span class="tb-sep">•</span>
          <strong class="tb-title">${esc(topbarProblem.title)}</strong>
          <span class="chip diff-${topbarProblem.difficulty}">${DIFF[topbarProblem.difficulty].label}</span>
        </div>`
      : '';

    topbar.innerHTML = `
      <div class="topbar-left">
        <a href="#/" class="topbar-brand">
          <div class="brand-icon">
            ${SVG.layers}
          </div>
          <span class="brand-title">DataDojo</span>
          <span class="brand-badge ${pro ? 'brand-badge-pro' : ''}">ENTERPRISE</span>
        </a>
        ${!topbarProblem ? `
        <div class="topbar-sep"></div>
        <nav class="crumbs" aria-label="Breadcrumb">
          <span class="crumb-parent">${esc(group)}</span>
          <span class="crumb-sep">/</span>
          <span class="crumb-current"><span class="crumb-dot">●</span> ${esc(page)}</span>
        </nav>` : ''}
      </div>
      ${problem}
      <div class="topbar-stats">
        <!-- Quick Commercial Plan Switcher Pill -->
        <div class="plan-switcher-pill" title="Simulasi Mode Lisensi (Klik untuk beralih Free vs Pro)">
          <button type="button" class="psp-btn ${!pro ? 'active' : ''}" data-setplan="free">FREE · Bab 1</button>
          <button type="button" class="psp-btn ${pro ? 'active pro' : ''}" data-setplan="pro">${SVG.shield} PRO · Bab 1–4</button>
        </div>

        <div class="metric metric-streak hide-sm" title="Konsistensi Harian">${SVG.flame}<strong>${streak || 1}d</strong></div>
        <div class="metric metric-xp" title="Total Experience Points">${SVG.zap}<strong>${s.xp || 185}</strong><small>XP</small></div>
        <a href="#/profile" class="metric metric-level hide-md" title="${esc(lvl.title)}">
          <strong>${esc(lvl.code)}</strong><small class="hide-xl">${esc(lvl.title)}</small>
        </a>

        <div class="tb-user-wrap">
          <button class="tb-user" id="tbUserBtn" title="Menu Akun & Lisensi" aria-expanded="false">
            <span class="tb-avatar">${initial}</span>
            <span class="tb-user-meta hide-sm">
              <strong>${esc(s.name || 'Ragada')}</strong>
              <small class="${pro ? 'pro-label' : 'free-label'}">${esc(planInfo.badge)} ▾</small>
            </span>
          </button>
          <div class="tb-user-dropdown" id="tbUserDropdown">
            <div class="tud-header">
              <span class="tud-avatar">${initial}</span>
              <div class="tud-info">
                <strong>${esc(s.name || 'Ragada')}</strong>
                <small>${esc(lvl.code)} · ${esc(planInfo.name)}</small>
              </div>
            </div>
            <div class="tud-divider"></div>
            <a href="#/pricing" class="tud-item"><span class="tud-icon">${SVG.creditCard}</span> Membership &amp; Lisensi</a>
            <a href="#/profile" class="tud-item"><span class="tud-icon">${SVG.user}</span> Profil &amp; Kredensial</a>
            <button class="tud-item" id="tbBtnSwitch"><span class="tud-icon">${SVG.switchUser}</span> Ganti Akun</button>
            <div class="tud-divider"></div>
            <button class="tud-item danger" id="tbBtnLogout"><span class="tud-icon">${SVG.logout}</span> Keluar (Log Out)</button>
          </div>
        </div>
      </div>`;

    // Plan switcher buttons in topbar for instant testing
    $$('[data-setplan]', topbar).forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.setplan;
        if (target === 'pro' && !Store.isPro()) {
          Store.setPlan('pro', { cycle: 'annual', method: 'Instant Demo Switch', amount: 1188000, licenseKey: 'DD-PRO-DEMO-2026' });
          toast('Mode PRO MEMBER aktif — Seluruh Bab 2, 3 & 4 kini terbuka.', 'badge', 3200);
          router();
        } else if (target === 'free' && Store.isPro()) {
          Store.setPlan('free');
          toast('Mode STARTER FREE aktif — Hanya Bab 1 (Materi Dasar) yang terbuka.', 'info', 3200);
          router();
        }
      });
    });

    const userBtn = $('#tbUserBtn', topbar);
    const dropdown = $('#tbUserDropdown', topbar);
    if (userBtn && dropdown) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('show');
        userBtn.setAttribute('aria-expanded', String(isOpen));
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.tb-user-wrap')) {
          dropdown.classList.remove('show');
          userBtn.setAttribute('aria-expanded', 'false');
        }
      });
      $('#tbBtnLogout', dropdown)?.addEventListener('click', () => {
        dropdown.classList.remove('show');
        openLogoutModal();
      });
      $('#tbBtnSwitch', dropdown)?.addEventListener('click', () => {
        dropdown.classList.remove('show');
        openSwitchAccountModal();
      });
    }
  }

  // ===================================================================
  // EXECUTIVE OVERVIEW (DASHBOARD)
  // ===================================================================
  function renderDashboard() {
    const s = S();
    const lvl = Store.getLevel();
    const pro = Store.isPro();
    const planInfo = Store.getPlanInfo();
    const daily = getDailyChallenge();
    const today = Store.todayKey();
    const dailyDone = s.dailyDone === today;
    const availablePool = pro ? ALL_CHALLENGES : ALL_CHALLENGES.filter((c) => c.tier === 'free');
    const next = availablePool.find((c) => !s.completed[c.id]) || ALL_CHALLENGES.find((c) => !s.completed[c.id]);
    const totalDone = Object.keys(s.completed).length;
    const tipCard = window.INTERVIEW_CARDS[hashString(today + 'tip') % window.INTERVIEW_CARDS.length];
    const earned = BADGES.filter((b) => s.badges[b.id]).length;

    const tracks = [
      { href: '#/sql', code: 'SQL-345', name: 'SQL Curriculum', color: '#18181B', done: trackDone('sql'), total: TRACKS.sql.items.length, chapters: '4 Bab (Bab 1 Gratis · Bab 2–4 Pro)', sub: 'Query skalar, multi-table join, metrik kondisional & window functions.' },
      { href: '#/python', code: 'PY-311', name: 'Python & pandas', color: '#4F46E5', done: trackDone('python'), total: TRACKS.python.items.length, chapters: '4 Bab (Bab 1 Gratis · Bab 2–4 Pro)', sub: 'DataFrame vectorized, data cleaning, time-series & pivot matrix.' },
      { href: '#/quiz', code: 'BI-DAX', name: 'Power BI & Analytical Quiz', color: '#D97706', done: quizCorrect('powerbi'), total: quizByCat('powerbi').length, chapters: '4 Bab (Bab 1 Gratis · Bab 2–4 Pro)', sub: 'Star schema, filter context CALCULATE, time intelligence & VertiPaq.' },
      { href: '#/interview', code: 'STAR-IV', name: 'Executive Interview Playbook', color: '#059669', done: cardsKnown(), total: window.INTERVIEW_CARDS.length, chapters: '4 Bab (Bab 1 Gratis · Bab 2–4 Pro)', sub: 'Arsitektur teknis, eksperimen A/B testing, STAR & studi kasus bisnis.' }
    ];

    view.innerHTML = `
      <!-- Commercial Membership Banner -->
      <section class="enterprise-status-banner ${pro ? 'is-pro' : 'is-free'}">
        <div class="esb-left">
          <span class="esb-pill">${pro ? `${SVG.shield} ${esc(planInfo.badge)}` : 'STARTER FREE EDITION'}</span>
          <div class="esb-text">
            <strong>${pro ? 'Akses Penuh Kurikulum Enterprise (Bab 1 – Bab 4) Aktif' : 'Akses Gratis: Bab 1 (Materi Dasar) Terbuka · Bab 2–4 Membutuhkan Pro Membership'}</strong>
            <span>${pro
              ? `Lisensi aktif (${esc(s.licenseKey || 'PRO-2026')}). Anda memiliki akses penuh ke seluruh 56 modul coding (30 SQL + 26 Python), 65 soal asesmen, dan 40 skenario interview.`
              : 'Pelajari fondasi SQL, Python, Power BI, dan Interview di Bab 1 secara gratis. Upgrade ke Pro untuk membuka 49 modul coding lanjutan, 50 soal asesmen Pro, dan 35 skenario interview di Bab 2–4.'}</span>
          </div>
        </div>
        <div class="esb-right">
          ${pro
            ? `<a href="#/pricing" class="btn btn-secondary btn-sm">Detail Lisensi &amp; Invoice</a>`
            : `<a href="#/pricing" class="btn btn-focus btn-sm">${SVG.creditCard} Upgrade ke Pro — Rp 99rb/bln</a>`}
        </div>
      </section>

      <section class="hero-showcase card">
        <div class="hero-showcase-content">
          <div class="hero-text">
            <div class="hero-badge-pill">
              <span class="live-dot"></span>
              <span>ENTERPRISE DATA ANALYST CURRICULUM &amp; ASSESSMENT</span>
              <span class="hero-chip-hot">4-CHAPTER SYSTEM</span>
            </div>
            <h1>Platform Asesmen &amp; Kurikulum <br><span>Data Analyst Standar Industri</span></h1>
            <p>Kurikulum terstruktur dari <strong>Bab 1 (Materi Dasar — Gratis)</strong> hingga <strong>Bab 4 (Materi Enterprise — Pro Membership)</strong>. Eksekusi query SQLite WebAssembly dan Python pandas secara langsung di browser dengan evaluasi otomatis presisi tinggi.</p>
            
            <div class="hero-actions">
              ${next
                ? `<a class="btn btn-primary btn-lg" href="#/${next.track}/${next.id}">${SVG.play} Lanjutkan: ${esc(next.title)}</a>`
                : `<a class="btn btn-primary btn-lg" href="#/mock">Mulai Timed Assessment Simulator</a>`}
              <a class="btn btn-secondary btn-lg" href="#/sql">Jelajahi Kurikulum per Bab</a>
              ${!pro ? `<a class="btn btn-focus btn-lg" href="#/pricing">${SVG.lock} Buka Bab 2–4 (Pro)</a>` : `<a class="btn btn-ghost btn-lg" href="#/profile">Lihat Kredensial</a>`}
            </div>

            <div class="hero-highlights">
              <div class="hh-item"><span class="hh-icon">${SVG.layers}</span><span>Kurikulum Terkelompok (Bab 1–4)</span></div>
              <div class="hh-item"><span class="hh-icon">${SVG.terminal}</span><span>SQLite 3.45 &amp; Pyodide WASM Runtime</span></div>
              <div class="hh-item"><span class="hh-icon">${SVG.shield}</span><span>Standar Asesmen Teknis Korporat</span></div>
            </div>
          </div>

          <div class="hero-visual-card">
            <div class="hero-visual-frame">
              <img src="img/hero-banner.jpg" alt="DataDojo Enterprise Workspace" class="hero-visual-img" />
              <div class="hero-visual-overlay"></div>
              <div class="floating-tag tag-top">
                <span class="ft-dot green"></span>
                <strong>SQLite + Pyodide</strong>
                <small>Client-Side Execution Engine</small>
              </div>
              <div class="floating-tag tag-bottom">
                <span class="ft-code-badge">${esc(lvl.code)}</span>
                <div>
                  <strong>${esc(planInfo.name)}</strong>
                  <small>${pro ? 'All 4 Chapters Unlocked' : 'Bab 1 Free · Bab 2–4 Pro'}</small>
                </div>
              </div>
            </div>
            <div class="hero-level-compact">
              <div class="hlc-ring">
                ${ring(lvl.progress, { size: 64, stroke: 6, label: lvl.code, color: '#18181B' })}
              </div>
              <div class="hlc-info">
                <div class="hlc-title">Tingkat ${lvl.number} · <strong>${esc(lvl.title)}</strong></div>
                <div class="hlc-xp"><strong>${s.xp} XP</strong> <span class="muted">${lvl.next ? `(${lvl.next.min - s.xp} XP menuju ${esc(lvl.next.code)})` : 'Tingkat Tertinggi Tercapai'}</span></div>
                <div class="bar-compact"><i style="width:${Math.round(lvl.progress * 100)}%"></i></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="stats-row">
        <div class="stat card"><span class="stat-code">XP</span><div><strong>${s.xp}</strong><small>Total Poin Kompetensi</small></div></div>
        <div class="stat card"><span class="stat-code">MOD</span><div><strong>${totalDone}/${ALL_CHALLENGES.length}</strong><small>Modul Coding Selesai</small></div></div>
        <div class="stat card"><span class="stat-code">SLA</span><div><strong>${Store.getActiveStreak()} hari</strong><small>Konsistensi Harian</small></div></div>
        <div class="stat card"><span class="stat-code">CRD</span><div><strong>${earned}/${BADGES.length}</strong><small>Kredensial Terbuka</small></div></div>
        <div class="stat card"><span class="stat-code">SIM</span><div><strong>${s.mockBest}%</strong><small>Skor Simulator Terbaik</small></div></div>
      </section>

      <!-- Structured Curriculum Architecture Overview (Bab 1 to Bab 4) -->
      <div class="section-head-row">
        <div>
          <h2 class="section-title">Struktur Kurikulum &amp; Pengelompokan Bab</h2>
          <p class="section-sub">Materi disusun sistematis dalam 4 Bab. Bab 1 dapat diakses gratis selamanya; Bab 2 hingga Bab 4 dirancang untuk kesiapan rekrutmen tingkat menengah dan senior.</p>
        </div>
        <a href="#/pricing" class="btn btn-secondary btn-sm">Bandingkan Paket Free vs Pro →</a>
      </div>

      <section class="chapter-roadmap-grid">
        ${window.SQL_CHAPTERS.map((ch) => {
          const sqlDone = chapterDone('sql', ch.id);
          const sqlTot = chapterTotal('sql', ch.id);
          const pyDone = chapterDone('python', ch.id);
          const pyTot = chapterTotal('python', ch.id);
          const unlocked = isUnlocked(ch.tier);
          return `
            <div class="crm-card card ${unlocked ? 'unlocked' : 'locked'}">
              <div class="crm-head">
                <span class="crm-code">${esc(ch.code)}</span>
                ${tierBadge(ch.tier)}
              </div>
              <h3>${esc(ch.title)}</h3>
              <p class="muted small">${esc(ch.subtitle)}</p>
              <div class="crm-metrics">
                <div class="crm-metric-row">
                  <span>SQL Lab (${sqlDone}/${sqlTot})</span>
                  <div class="bar"><i style="width:${Math.round((sqlDone / (sqlTot || 1)) * 100)}%"></i></div>
                </div>
                <div class="crm-metric-row">
                  <span>Python Lab (${pyDone}/${pyTot})</span>
                  <div class="bar"><i style="width:${Math.round((pyDone / (pyTot || 1)) * 100)}%"></i></div>
                </div>
              </div>
              <div class="crm-foot">
                <a href="#/sql" class="btn ${unlocked ? 'btn-secondary' : 'btn-focus'} btn-xs">
                  ${unlocked ? 'Buka Modul Bab 0' + ch.id + ' →' : `${SVG.lock} Buka dengan Pro`}
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </section>

      <h2 class="section-title" style="margin-top:28px">Modul Kurikulum &amp; Laboratorium</h2>
      <section class="track-grid">
        ${tracks.map((t) => `
          <a class="track-card card" href="${t.href}">
            <div class="track-top">
              <span class="track-code-pill">${esc(t.code)}</span>
              ${ring(t.total ? t.done / t.total : 0, { size: 54, stroke: 5, color: t.color })}
            </div>
            <h3>${esc(t.name)}</h3>
            <div class="track-chap-tag">${esc(t.chapters)}</div>
            <p class="muted">${esc(t.sub)}</p>
            <div class="track-foot"><span>${t.done}/${t.total} modul selesai</span><span class="arrow">→</span></div>
          </a>`).join('')}
      </section>

      <section class="grid-2" style="margin-top:24px">
        <div class="card daily ${dailyDone ? 'is-done' : ''}">
          <div class="card-head">
            <span class="label-caps">JADWAL ASESMEN HARIAN</span>
            <span class="countdown" id="countdown"></span>
          </div>
          <div class="daily-body">
            <div class="chips">
              <span class="chip">${daily.track === 'sql' ? 'SQLite' : 'Python'} · BAB 0${daily.chapter}</span>
              ${diffChip(daily.difficulty)}
              <span class="chip chip-focus">+${DAILY_BONUS_XP} XP Bonus</span>
            </div>
            <h4>${esc(daily.title)}</h4>
            <p class="muted">${esc(daily.concept)}</p>
          </div>
          <a class="btn ${dailyDone ? 'btn-secondary' : 'btn-primary'}" href="#/${daily.track}/${daily.id}">
            ${dailyDone ? 'Tuntas Hari Ini — Tinjau Kembali' : 'Kerjakan Modul Harian →'}
          </a>
        </div>
        <div class="card tip-card">
          <div class="card-head">
            <span class="label-caps">SKENARIO INTERVIEW HARI INI</span>
            <span class="chip">BAB 0${tipCard.chapter} · ${esc(window.INTERVIEW_TYPES[tipCard.type].label)}</span>
          </div>
          <p class="tip-q">"${esc(tipCard.q)}"</p>
          <p class="muted small">Catatan Evaluator: ${esc(tipCard.tips)}</p>
          <a class="btn btn-secondary" href="#/interview">Buka Interview Playbook →</a>
        </div>
      </section>
    `;

    const cd = $('#countdown');
    const tickCountdown = () => {
      if (!cd) return;
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const sec = Math.floor((midnight - now) / 1000);
      const hh = String(Math.floor(sec / 3600)).padStart(2, '0');
      const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
      const ss = String(sec % 60).padStart(2, '0');
      cd.textContent = `Reset dalam ${hh}:${mm}:${ss}`;
    };
    tickCountdown();
    const timer = setInterval(tickCountdown, 1000);
    onCleanup(() => clearInterval(timer));
  }

  // ===================================================================
  // DAFTAR CHALLENGE DENGAN PENGELOMPOKAN BAB (CHAPTER GROUPING)
  // ===================================================================
  function renderTrackList(key) {
    const t = TRACKS[key];
    const done = trackDone(key);
    const pro = Store.isPro();
    let activeChapter = 'all';
    let accessFilter = 'all';

    view.innerHTML = `
      <section class="page-head card">
        <div>
          <span class="eyebrow">${esc(t.code)} · ${esc(t.lang)} · 4 BAB TERSTRUKTUR</span>
          <h1>${esc(t.name)}</h1>
          <p class="muted">${esc(t.desc)}</p>
        </div>
        <div class="page-head-right">
          ${ring(done / t.items.length, { size: 88, stroke: 8, color: t.color, label: `${done}/${t.items.length}` })}
        </div>
      </section>

      <!-- Filter Bar: By Chapter (Bab 1-4) & Access Tier -->
      <div class="curriculum-toolbar">
        <div class="filter-chips" id="chapterFilters" style="margin-bottom:0">
          <button class="fchip active" data-chap="all">Semua Bab (4)</button>
          ${t.chapters.map((ch) => `
            <button class="fchip" data-chap="${ch.id}">
              ${esc(ch.code)}: ${ch.tier === 'free' ? 'Dasar (Gratis)' : 'Pro'}
            </button>
          `).join('')}
        </div>
        <div class="filter-chips" id="tierFilters" style="margin-bottom:0">
          <button class="fchip active" data-tier="all">Semua Status</button>
          <button class="fchip" data-tier="free">Materi Gratis (Bab 1)</button>
          <button class="fchip" data-tier="pro">Materi Pro (Bab 2–4)</button>
          <button class="fchip" data-tier="todo">Belum Selesai</button>
        </div>
      </div>

      <div id="chapterSectionsContainer" class="chapter-sections-container"></div>
    `;

    const container = $('#chapterSectionsContainer');

    function drawChapters() {
      const chaptersToShow = t.chapters.filter((ch) => {
        if (activeChapter !== 'all' && String(ch.id) !== String(activeChapter)) return false;
        if (accessFilter === 'free' && ch.tier !== 'free') return false;
        if (accessFilter === 'pro' && ch.tier !== 'pro') return false;
        return true;
      });

      container.innerHTML = chaptersToShow.map((ch) => {
        const chapItems = t.items
          .map((item, globalIdx) => ({ item, globalIdx }))
          .filter(({ item }) => item.chapter === ch.id)
          .filter(({ item }) => (accessFilter === 'todo' ? !S().completed[item.id] : true));

        const unlocked = isUnlocked(ch.tier);
        const doneCount = chapItems.filter(({ item }) => S().completed[item.id]).length;
        const totalInChap = t.items.filter((x) => x.chapter === ch.id).length;

        return `
          <section class="chapter-block card ${unlocked ? 'chapter-unlocked' : 'chapter-locked'}">
            <div class="chapter-block-header">
              <div class="cbh-left">
                <div class="cbh-meta-row">
                  <span class="chapter-code-badge">${esc(ch.code)}</span>
                  ${tierBadge(ch.tier)}
                  <span class="chapter-count-pill">${doneCount}/${totalInChap} Modul Selesai</span>
                </div>
                <h2 class="chapter-title">${esc(ch.title)}</h2>
                <p class="chapter-subtitle">${esc(ch.subtitle)}</p>
              </div>
              <div class="cbh-right">
                ${!unlocked ? `
                  <button class="btn btn-focus btn-sm" data-unlock-chap="${ch.id}" data-chap-title="${esc(ch.code + ': ' + ch.title)}">
                    ${SVG.lock} Buka Bab Ini (Pro)
                  </button>
                ` : `
                  <div class="chapter-prog-mini">
                    <span>Progres Bab</span>
                    <strong>${Math.round((doneCount / (totalInChap || 1)) * 100)}%</strong>
                  </div>
                `}
              </div>
            </div>

            <div class="challenge-list chapter-challenge-list">
              ${chapItems.length ? chapItems.map(({ item, globalIdx }) => {
                const isDone = Boolean(S().completed[item.id]);
                const itemUnlocked = isUnlocked(item.tier);
                return `
                  <a class="challenge-card ${isDone ? 'done' : ''} ${!itemUnlocked ? 'is-locked-card' : ''}"
                     href="${itemUnlocked ? `#/${key}/${item.id}` : 'javascript:void(0)'}"
                     data-ch-id="${item.id}"
                     data-ch-tier="${item.tier}"
                     data-ch-title="${esc(item.title)}"
                     data-ch-chap="${esc(ch.code)}">
                    <div class="cc-num ${!itemUnlocked ? 'locked-num' : ''}">
                      ${isDone ? SVG.check : !itemUnlocked ? SVG.lock : String(globalIdx + 1).padStart(2, '0')}
                    </div>
                    <div class="cc-body">
                      <div class="cc-title-row">
                        <h4>${esc(item.title)}</h4>
                        ${item.tier === 'free'
                          ? '<span class="mini-tier-tag free">GRATIS</span>'
                          : itemUnlocked
                            ? '<span class="mini-tier-tag pro-open">PRO</span>'
                            : '<span class="mini-tier-tag pro-locked">PRO LOCKED</span>'}
                      </div>
                      <p class="muted">${esc(item.tag)} · ${esc(item.concept)}</p>
                    </div>
                    <div class="cc-meta">
                      ${diffChip(item.difficulty)}
                      <span class="xp-tag">${isDone ? `+${S().completed[item.id].xp}` : '+' + DIFF[item.difficulty].xp} XP</span>
                      <span class="cc-action-label">${!itemUnlocked ? 'Upgrade →' : isDone ? 'Tinjau →' : 'Mulai →'}</span>
                    </div>
                  </a>
                `;
              }).join('') : '<div class="muted small" style="padding:12px 4px">Seluruh modul pada filter ini telah diselesaikan.</div>'}
            </div>
          </section>
        `;
      }).join('');

      // Attach click handlers for locked chapters and locked challenge items
      $$('[data-unlock-chap]', container).forEach((btn) => {
        btn.addEventListener('click', () => {
          openPaywallModal({
            title: btn.dataset.chapTitle,
            chapterCode: `BAB 0${btn.dataset.unlockChap}`,
            returnHash: `#/${key}`
          });
        });
      });

      $$('.challenge-card.is-locked-card', container).forEach((card) => {
        card.addEventListener('click', (e) => {
          e.preventDefault();
          openPaywallModal({
            title: card.dataset.chTitle,
            chapterCode: card.dataset.chChap,
            returnHash: `#/${key}/${card.dataset.chId}`
          });
        });
      });
    }

    $('#chapterFilters').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-chap]');
      if (!btn) return;
      activeChapter = btn.dataset.chap;
      $$('.fchip', $('#chapterFilters')).forEach((b) => b.classList.toggle('active', b === btn));
      drawChapters();
    });

    $('#tierFilters').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tier]');
      if (!btn) return;
      accessFilter = btn.dataset.tier;
      $$('.fchip', $('#tierFilters')).forEach((b) => b.classList.toggle('active', b === btn));
      drawChapters();
    });

    drawChapters();
  }

  // ===================================================================
  // HALAMAN CHALLENGE (LIVE CODING IDE + STRICT PAYWALL GUARD)
  // ===================================================================
  function renderChallenge(key, id) {
    const t = TRACKS[key];
    const idx = t.items.findIndex((c) => c.id === id);
    if (idx < 0) {
      view.innerHTML = '<div class="card empty"><h2>Modul Tidak Ditemukan</h2><a class="btn btn-primary" href="#/">Kembali ke Executive Overview</a></div>';
      return;
    }
    const ch = { ...t.items[idx], track: key };
    const nextCh = t.items[idx + 1];

    topbarProblem = {
      chapter: ch.chapter || 1,
      index: idx + 1,
      total: t.items.length,
      title: ch.title,
      difficulty: ch.difficulty
    };

    // STRICT ENTERPRISE PAYWALL GUARD FOR BAB 2-4
    if (!isUnlocked(ch.tier)) {
      document.body.classList.remove('ide-mode');
      view.innerHTML = `
        <section class="locked-challenge-gate card">
          <div class="lcg-top">
            <span class="tier-pill tier-pro-locked">${SVG.lock} PRO MEMBERSHIP REQUIRED · BAB 0${ch.chapter}</span>
            ${diffChip(ch.difficulty)}
          </div>
          <h1>${idx + 1}. ${esc(ch.title)}</h1>
          <p class="lcg-chapter-name">${esc(ch.chapterTitle || `Bab ${ch.chapter}`)} · Konsep: <strong>${esc(ch.concept)}</strong></p>
          
          <div class="lcg-preview-box">
            <span class="label-caps">DESKRIPSI STUDI KASUS (PREVIEW)</span>
            <div class="prompt">${md(ch.prompt)}</div>
          </div>

          <div class="lcg-paywall-callout">
            <div class="lcg-pw-info">
              <h3>Modul ini merupakan bagian dari Kurikulum Lanjutan (Bab ${ch.chapter})</h3>
              <p class="muted">Akun <strong>Starter Free</strong> hanya mencakup akses ke <strong>Bab 1 (Materi Dasar)</strong>. Tingkatkan ke <strong>Pro Analyst Membership</strong> untuk membuka editor live coding, auto-grader, dan kunci solusi pada Bab 2, Bab 3, dan Bab 4.</p>
            </div>
            <div class="lcg-pw-actions">
              <button class="btn btn-focus btn-lg" id="btnGateUnlock">${SVG.creditCard} Buka Akses Pro Sekarang</button>
              <a class="btn btn-secondary btn-lg" href="#/${key}">← Kembali ke Daftar Bab</a>
            </div>
          </div>
        </section>
      `;
      $('#btnGateUnlock')?.addEventListener('click', () => {
        openPaywallModal({
          title: ch.title,
          chapterCode: `BAB 0${ch.chapter}`,
          returnHash: `#/${key}/${ch.id}`
        });
      });
      return;
    }

    const draftKey = `datadojo_ent_draft_${id}`;
    const isSql = key === 'sql';
    const isDaily = getDailyChallenge().id === id;
    let activeTab = 'info';
    let outTab = 'console';
    let busy = false;

    const rewardLabel = () => (S().completed[id] ? `Terverifikasi (+${S().completed[id].xp} XP)` : `+${rewardFor(ch)} XP`);
    const hintLabel = () => `Petunjuk (${Math.min(S().hintsUsed[id] || 0, ch.hints.length)}/${ch.hints.length})`;

    const targetCard = isSql
      ? `<div class="target-output-card">
          <div class="target-head">
            <span class="label-caps"><span class="target-icon">⊞</span> TARGET SKEMA OUTPUT</span>
            <span class="muted small">${ch.columns.length} kolom wajib</span>
          </div>
          <div class="target-grid">
            ${ch.columns.map((c, i) => `<div class="target-col-box"><strong class="col-name">${esc(c)}</strong><span class="col-type" id="colType${i}">VARCHAR (text)</span></div>`).join('')}
          </div>
        </div>`
      : `<div class="target-output-card">
          <div class="target-head">
            <span class="label-caps"><span class="target-icon">⊞</span> TARGET VARIABEL EVALUASI</span>
            <span class="muted small">${ch.post ? 'unit test fungsi' : 'variabel output'}</span>
          </div>
          <div class="target-grid">
            <div class="target-col-box"><strong class="col-name">result</strong><span class="col-type">${ch.post ? 'hasil komparasi test case' : 'DataFrame / Series / List'}</span></div>
          </div>
        </div>`;

    view.innerHTML = `
      <div class="ide">
        <section class="ide-problem">
          <div class="ide-problem-scroll">
            <div class="ide-nav-row">
              <a class="back-link" href="#/${key}">← Kurikulum ${esc(t.name)}</a>
              <span class="ide-chap-pill">BAB 0${ch.chapter}</span>
            </div>
            <h1 class="ch-title">${idx + 1}. ${esc(ch.title)}</h1>
            <div class="chips">
              ${tierBadge(ch.tier)}
              ${diffChip(ch.difficulty)}
              <span class="chip">${esc(ch.tag)}</span>
              <span class="chip chip-focus" id="rewardChip">${rewardLabel()}</span>
              ${isDaily ? '<span class="chip chip-warn">Daily Module</span>' : ''}
            </div>
            <div class="prompt">${md(ch.prompt)}</div>
            ${targetCard}
            <div class="segmented" id="tabs" role="tablist">
              <button class="seg active" data-tab="info">${isSql ? 'Skema Tabel' : 'Struktur Dataset'}</button>
              <button class="seg" data-tab="hints" id="hintTab">${hintLabel()}</button>
              <button class="seg" data-tab="solution">Solusi Referensi ${!Store.isPro() ? SVG.lock : ''}</button>
            </div>
            <div class="tab-body" id="tabBody"></div>
          </div>
        </section>

        <section class="ide-work">
          <div class="ide-editor-card">
            <div class="ide-toolbar">
              <div class="ide-toolbar-left">
                <span class="lang-pill"><span class="lang-dot">●</span> ${esc(t.lang)}</span>
                <span class="kbd-shortcut hide-xl" title="Tekan Ctrl+Enter untuk Run, atau Ctrl+Shift+Enter untuk Verify"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> Run</span>
              </div>
              <div class="ide-toolbar-right">
                <button class="btn btn-secondary btn-sm" id="resetBtn" title="Kembalikan starter code">Reset</button>
                <button class="btn btn-secondary btn-sm" id="runBtn" title="Jalankan kode (Ctrl + Enter)">${SVG.play} Run Code</button>
                <button class="btn btn-focus btn-sm" id="submitBtn" title="Verifikasi jawaban (Ctrl + Shift + Enter)">${SVG.check} Submit &amp; Verify</button>
              </div>
            </div>
            <div class="ide-editor"><textarea id="code" spellcheck="false"></textarea></div>
          </div>
          <div class="ide-output">
            <div class="output-tabs" id="outTabs">
              <button class="otab active" data-out="console">Output Console</button>
              <button class="otab" data-out="table">Table Preview</button>
              ${isSql ? '<button class="otab" data-out="plan">Execution Plan</button>' : ''}
              <div class="engine-status-badge" id="engineStatus"><span class="dot">●</span> Runtime Ready</div>
            </div>
            <div class="output-body" id="output"><p class="muted">Tekan <strong>Run Code</strong> untuk menguji output, atau <strong>Submit &amp; Verify</strong> untuk penilaian otomatis.</p></div>
          </div>
        </section>
      </div>`;

    const output = $('#output');
    const status = $('#engineStatus');
    const setOutput = (html) => { output.innerHTML = html; };
    const setStatus = (text, kind) => {
      if (!status) return;
      status.innerHTML = `<span class="dot">●</span> ${esc(text.replace(/^●\s*/, ''))}`;
      status.className = `engine-status-badge ${kind === 'err' ? 'badge-err' : ''}`;
    };
    const showConsole = () => {
      outTab = 'console';
      $$('.otab', $('#outTabs')).forEach((b) => b.classList.toggle('active', b.dataset.out === 'console'));
    };

    const editor = createEditor($('#code'), t.mode, { onRun: () => run(), onSubmit: () => submit() });
    editor.set(safeStorageGet(draftKey) ?? ch.starter);
    editor.onChange((v) => safeStorageSet(draftKey, v));
    onCleanup(() => editor.destroy());

    async function ensureEngine() {
      if (isSql) {
        await SqlEngine.load();
        setStatus('SQLite 3.45 Ready', 'ok');
        return;
      }
      if (!PyEngine.isReady()) setOutput(loadingBox('Menginisialisasi runtime Python & pandas…'));
      await PyEngine.load((msg) => {
        setStatus(msg, 'warn');
        const el = $('.loading-msg', output);
        if (el) el.textContent = msg;
      });
      setStatus('Python 3.11 Ready', 'ok');
    }

    ensureEngine()
      .then(async () => {
        if (!isSql) return;
        const res = await SqlEngine.execute(ch.solution);
        const first = res.values[0] || [];
        ch.columns.forEach((_, i) => {
          const el = document.getElementById(`colType${i}`);
          if (!el) return;
          const v = first[i];
          el.textContent = typeof v === 'number' ? (Number.isInteger(v) ? 'INTEGER' : 'REAL (numeric)') : v === null || v === undefined ? 'NULLABLE' : 'VARCHAR (text)';
        });
      })
      .catch((err) => { setStatus('Runtime Error', 'err'); setOutput(errorBox(err.message)); });

    function setBusy(v) {
      busy = v;
      ['runBtn', 'submitBtn'].forEach((bid) => { const b = document.getElementById(bid); if (b) b.disabled = v; });
    }

    function executionError(err) {
      const message = err.message || String(err);
      if (isSql) {
        const diag = diagnoseSqlError(message, editor.get());
        const errLine = diag.line || 5;
        editor.markErrorLine(errLine);
        const lines = editor.get().split('\n');
        const lineText = (errLine && lines[errLine - 1]) ? lines[errLine - 1].trim() : '';
        let errDisplay = message;
        if (!/at line \d+/i.test(errDisplay) && errLine) {
          errDisplay = `${errDisplay} at line ${errLine}`;
        }
        return `<div class="exec-error">
            <div class="exec-error-head"><strong>Query Execution Failed</strong><span class="exec-error-badge">SQLITE_ERROR [1]</span></div>
            <pre class="exec-log">${esc(errDisplay)}${errLine ? `\n--> Line ${errLine}: ${esc(lineText)}\n    ^^^^` : ''}</pre>
            ${diag.hint ? `<div class="diag"><strong>Diagnostik Skema:</strong> ${diag.hint}</div>` : ''}
          </div>`;
      }
      return `<div class="exec-error"><div class="exec-error-head"><strong>Execution Failed</strong><span class="exec-error-badge">PYTHON_EXCEPTION</span></div><pre class="exec-log">${esc(message)}</pre></div>`;
    }

    function markPythonError(r) {
      const m = r && r.error ? /^Baris (\d+):/.exec(r.error) : null;
      editor.markErrorLine(m ? Number(m[1]) : null);
    }

    async function run() {
      if (busy) return;
      showConsole();
      setBusy(true);
      editor.clearMarks();
      setOutput(loadingBox(isSql ? 'Mengeksekusi query SQL…' : 'Mengeksekusi script Python…'));
      try {
        await ensureEngine();
        if (isSql) setOutput(sqlTable(await SqlEngine.execute(editor.get())));
        else {
          const r = await PyEngine.execute(ch, editor.get());
          markPythonError(r);
          setOutput(pyOutput(r));
        }
      } catch (err) {
        setOutput(executionError(err));
      } finally {
        setBusy(false);
      }
    }

    async function submit() {
      if (busy) return;
      showConsole();
      setBusy(true);
      editor.clearMarks();
      setOutput(loadingBox('Memverifikasi output terhadap test suite…'));
      try {
        await ensureEngine();
        if (isSql) {
          const r = await SqlEngine.check(editor.get(), ch);
          if (r.passed) setOutput(successVerdict(handleSolved(ch)) + sqlTable(r.user));
          else setOutput(failVerdict(r.reason) + '<div class="out-label">Output Query Anda</div>' + sqlTable(r.user, 20)
            + '<div class="out-label">Ekspektasi Output (5 baris pertama)</div>' + sqlTable({ columns: r.expected.columns, values: r.expected.values.slice(0, 5) }));
        } else {
          const r = await PyEngine.check(ch, editor.get());
          markPythonError(r);
          if (r.passed) setOutput(successVerdict(handleSolved(ch)) + pyOutput(r));
          else setOutput(failVerdict(r.reason) + pyOutput(r) + (r.expected?.type !== 'none' ? `<div class="out-label">Ekspektasi Output</div>${pyValue(r.expected)}` : ''));
        }
      } catch (err) {
        setOutput(executionError(err));
      } finally {
        setBusy(false);
        $('#rewardChip').textContent = rewardLabel();
      }
    }

    async function showPlan() {
      setOutput(loadingBox('Menganalisis EXPLAIN QUERY PLAN…'));
      try {
        await ensureEngine();
        const plan = await SqlEngine.execute(`EXPLAIN QUERY PLAN ${editor.get().trim().replace(/;\s*$/, '')}`);
        const rows = plan.values.map((r) => `<li><code>${esc(r[r.length - 1])}</code></li>`).join('');
        setOutput(`<div class="out-label">EXPLAIN QUERY PLAN</div><ul class="plan">${rows || '<li class="muted">Plan kosong.</li>'}</ul>
          <p class="muted small">Catatan Arsitektur: <code>SCAN</code> menandakan full table scan, sedangkan <code>SEARCH ... USING INDEX</code> memanfaatkan B-Tree index.</p>`);
      } catch (err) {
        setOutput(executionError(err));
      }
    }

    function successVerdict(res) {
      let nextBtn = `<a class="btn btn-primary btn-sm" href="#/${key}">Kembali ke Kurikulum</a>`;
      if (nextCh) {
        if (isUnlocked(nextCh.tier)) {
          nextBtn = `<a class="btn btn-primary btn-sm" href="#/${key}/${nextCh.id}">Modul Berikutnya →</a>`;
        } else {
          nextBtn = `<button class="btn btn-focus btn-sm" id="btnNextLocked">${SVG.lock} Buka Bab 0${nextCh.chapter}: ${esc(nextCh.title)}</button>`;
        }
      }
      const gainText = res.gained ? `+${res.gained} XP${res.dailyBonus ? ' (Termasuk Daily Bonus)' : ''}` : 'Telah Terverifikasi';
      return `<div class="verdict success"><div class="verdict-icon">✓</div>
        <div class="verdict-text"><h4>Verification Passed · ${esc(gainText)}</h4><p>${esc(ch.explanation)}</p></div>${nextBtn}</div>`;
    }

    function failVerdict(reason) {
      return `<div class="verdict fail"><div class="verdict-icon">✕</div>
        <div class="verdict-text"><h4>Verification Failed — Output Belum Sesuai</h4><p>${esc(reason)}</p></div></div>`;
    }

    $('#runBtn').addEventListener('click', run);
    $('#submitBtn').addEventListener('click', submit);
    $('#resetBtn').addEventListener('click', () => { editor.set(ch.starter); toast('Kode dikembalikan ke starter template.', 'info'); });

    output.addEventListener('click', (e) => {
      if (e.target.closest('#btnNextLocked') && nextCh) {
        openPaywallModal({
          title: nextCh.title,
          chapterCode: `BAB 0${nextCh.chapter}`,
          returnHash: `#/${key}/${nextCh.id}`
        });
      }
    });

    async function showTablePreview() {
      setOutput(loadingBox('Memuat sampel tabel…'));
      try {
        await ensureEngine();
        if (isSql) {
          const previewQuery = 'SELECT product_id, product_name, price FROM products LIMIT 5';
          setOutput(`<div class="table-meta">Sampel Tabel products (5 baris pertama)</div>` + sqlTable(await SqlEngine.execute(previewQuery)));
        } else {
          setOutput(pyOutput(await PyEngine.execute({ setup: ch.setup }, 'result = df.head(5)')));
        }
      } catch (err) {
        setOutput(executionError(err));
      }
    }

    $('#outTabs').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-out]');
      if (!btn || busy) return;
      outTab = btn.dataset.out;
      $$('.otab', $('#outTabs')).forEach((b) => b.classList.toggle('active', b === btn));
      if (outTab === 'plan') showPlan();
      else if (outTab === 'table') showTablePreview();
      else setOutput('<p class="muted">Tekan <strong>Run Code</strong> untuk menguji output, atau <strong>Submit &amp; Verify</strong> untuk penilaian otomatis.</p>');
    });

    function drawTab() {
      const body = $('#tabBody');
      const s = S();
      $('#hintTab').textContent = hintLabel();
      if (activeTab === 'info') {
        if (isSql) {
          body.innerHTML = `<div class="schema">${SqlEngine.SCHEMA.map((tb) => `
            <div class="schema-table">
              <div class="schema-head"><span class="label-caps">${tb.table}</span><button class="btn btn-xs btn-secondary" data-preview="${tb.table}">Preview</button></div>
              <ul>${tb.columns.map(([c, type]) => `<li><span>${c}</span><em>${type}</em></li>`).join('')}</ul>
            </div>`).join('')}</div>`;
        } else {
          const ds = window.PY_DATASETS[ch.dataset];
          body.innerHTML = `<div class="dataset-info card-inset"><span class="label-caps">${esc(ds.label)}</span>${md(ds.description)}
            ${ch.dataset === 'sales' ? `<div class="preview-btns">
              <button class="btn btn-xs btn-secondary" data-pypreview="df">Preview df</button>
              <button class="btn btn-xs btn-secondary" data-pypreview="df_raw">Preview df_raw</button>
              <button class="btn btn-xs btn-secondary" data-pypreview="customers">Preview customers</button></div>` : ''}</div>`;
        }
      } else if (activeTab === 'hints') {
        const used = s.hintsUsed[id] || 0;
        const isDone = Boolean(s.completed[id]);
        body.innerHTML = `<p class="muted small">${isDone ? 'Modul telah selesai — seluruh petunjuk terbuka.' : `Membuka petunjuk mengurangi perolehan XP sebesar ${HINT_PENALTY * 100}% (minimal 25% XP tetap diberikan).`}</p>
          ${ch.hints.map((h, i) => {
            if (i < used) return `<div class="hint open"><span class="label-caps">Petunjuk ${i + 1}</span>${md(h)}</div>`;
            if (i === used) return `<button class="hint locked" data-hint>Buka Petunjuk ${i + 1}</button>`;
            return `<div class="hint dim">Petunjuk ${i + 1} (Terkunci)</div>`;
          }).join('')}`;
      } else {
        // Official Reference Solution requires Pro Membership or completed status
        if (!Store.isPro() && !s.completed[id]) {
          body.innerHTML = `
            <div class="card-inset" style="text-align:center;padding:20px 16px">
              <div style="margin-bottom:8px;color:#4F46E5">${SVG.lock} <strong>SOLUSI REFERENSI KHUSUS PRO MEMBER</strong></div>
              <p class="muted small" style="margin-bottom:14px">Selesaikan modul ini secara mandiri untuk membuka kunci jawaban, atau tingkatkan ke Pro Membership untuk akses instan ke seluruh solusi referensi dan penjelasan arsitektur.</p>
              <button class="btn btn-focus btn-sm" id="btnUnlockSolution">Upgrade ke Pro Membership</button>
            </div>
          `;
          return;
        }
        body.innerHTML = `
          <div class="solution-container">
            <div class="sol-header">
              <span class="sol-title">Solusi Referensi Terverifikasi</span>
              <button class="btn-copy-sol" id="copySol">Salin ke Editor</button>
            </div>
            <pre class="sol-code">${esc(ch.solution)}</pre>
            ${isSql ? `
            <div class="schema-relations">
              <div class="rel-title">RELASI SKEMA UTAMA:</div>
              <div class="rel-item"><span class="rel-tbl">orders</span><span class="rel-def">(order_id, status, customer_id)</span></div>
              <div class="rel-item"><span class="rel-tbl">order_items</span><span class="rel-def">(order_id, product_id, quantity)</span></div>
              <div class="rel-item"><span class="rel-tbl">products</span><span class="rel-def">(product_id, product_name, price)</span></div>
            </div>` : ''}
          </div>`;
      }
    }

    $('#tabs').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      activeTab = btn.dataset.tab;
      $$('.seg', $('#tabs')).forEach((b) => b.classList.toggle('active', b === btn));
      drawTab();
    });

    $('#tabBody').addEventListener('click', async (e) => {
      if (e.target.closest('#btnUnlockSolution')) {
        openPaywallModal({
          title: `Solusi Referensi: ${ch.title}`,
          chapterCode: `BAB 0${ch.chapter}`,
          returnHash: `#/${key}/${ch.id}`
        });
        return;
      }
      const preview = e.target.closest('[data-preview]');
      if (preview) {
        showConsole();
        setOutput(loadingBox('Memuat sampel tabel…'));
        try { setOutput(`<div class="out-label">SELECT * FROM ${esc(preview.dataset.preview)} LIMIT 10</div>` + sqlTable(await SqlEngine.execute(`SELECT * FROM ${preview.dataset.preview} LIMIT 10`))); }
        catch (err) { setOutput(errorBox(err.message)); }
        return;
      }
      const pyPreview = e.target.closest('[data-pypreview]');
      if (pyPreview) {
        showConsole();
        setOutput(loadingBox('Memuat sampel DataFrame…'));
        try {
          await ensureEngine();
          setOutput(pyOutput(await PyEngine.execute({ setup: ch.setup }, `result = ${pyPreview.dataset.pypreview}`)));
        } catch (err) { setOutput(errorBox(err.message)); }
        return;
      }
      if (e.target.closest('[data-hint]')) {
        Store.update((st) => { st.hintsUsed[id] = (st.hintsUsed[id] || 0) + 1; });
        $('#rewardChip').textContent = rewardLabel();
        drawTab();
        return;
      }
      if (e.target.closest('#copySol')) {
        editor.set(ch.solution);
        toast('Solusi referensi disalin ke editor.', 'info');
      }
    });

    drawTab();
  }

  function handleSolved(ch) {
    const s = S();
    const today = Store.todayKey();
    const first = !s.completed[ch.id];
    const base = first ? rewardFor(ch) : 0;
    const dailyBonus = getDailyChallenge().id === ch.id && s.dailyDone !== today;
    Store.update((st) => {
      if (first) st.completed[ch.id] = { at: Date.now(), xp: base };
      if (dailyBonus) st.dailyDone = today;
    });
    const gained = base + (dailyBonus ? DAILY_BONUS_XP : 0);
    confetti();
    if (gained > 0) awardXp(gained, 'Modul Terverifikasi');
    return { first, gained, dailyBonus };
  }

  // ===================================================================
  // QUIZ ARENA (DENGAN PENGELOMPOKAN BAB 1 GRATIS VS BAB 2-4 PRO)
  // ===================================================================
  function renderQuiz() {
    let cat = 'powerbi';
    let selectedChapter = 1; // Default to Bab 1 (Free) so free users can immediately practice
    let questions = [];
    let index = 0;
    let answered = null;

    view.innerHTML = `
      <section class="page-head card">
        <div>
          <span class="eyebrow">ANALYTICAL KNOWLEDGE ASSESSMENT · 4 BAB TERSTRUKTUR</span>
          <h1>Power BI, DAX &amp; Analytical Concepts</h1>
          <p class="muted">Evaluasi pemahaman arsitektur DAX, Star Schema, SQL, pandas, statistik inferensial, dan diagnostik kasus bisnis. Bab 1 terbuka gratis; Bab 2–4 khusus anggota Pro.</p>
        </div>
        <div id="catRing"></div>
      </section>

      <div class="curriculum-toolbar">
        <div class="filter-chips" id="catChips" style="margin-bottom:0">
          ${Object.entries(window.QUIZ_CATEGORIES).map(([k, c]) => `
            <button class="fchip ${k === cat ? 'active' : ''}" data-cat="${k}">
              <span class="chip-code-prefix">${esc(c.icon)}</span> ${esc(c.label)}
            </button>`).join('')}
        </div>

        <div class="filter-chips" id="quizChapChips" style="margin-bottom:0">
          <button class="fchip ${selectedChapter === 'all' ? 'active' : ''}" data-qchap="all">Semua Bab</button>
          ${window.QUIZ_CHAPTERS.map((ch) => `
            <button class="fchip ${selectedChapter === ch.id ? 'active' : ''}" data-qchap="${ch.id}">
              ${esc(ch.code)} ${ch.tier === 'free' ? '(Gratis)' : Store.isPro() ? '(Pro)' : '🔒'}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="quiz-layout">
        <section class="card quiz-card" id="quizCard"></section>
        <aside class="card cheat" id="cheat"></aside>
      </div>`;

    function updatePool() {
      const byCat = quizByCat(cat);
      const filtered = selectedChapter === 'all'
        ? byCat
        : byCat.filter((q) => q.chapter === Number(selectedChapter));
      questions = filtered.length ? filtered : byCat;
      index = 0;
      answered = null;
      const sheet = CHEATSHEETS[cat];
      $('#cheat').innerHTML = `<h3>${esc(sheet.title)}</h3><pre class="code-block">${esc(sheet.code)}</pre>`;
      draw();
    }

    function draw() {
      const allCatQuestions = quizByCat(cat);
      const c = window.QUIZ_CATEGORIES[cat];
      $('#catRing').innerHTML = ring(quizCorrect(cat) / allCatQuestions.length, {
        size: 88, stroke: 8, color: c.color, label: `${quizCorrect(cat)}/${allCatQuestions.length}`
      });

      const q = questions[index];
      if (!q) return;
      const chapMeta = window.QUIZ_CHAPTERS.find((x) => x.id === q.chapter) || window.QUIZ_CHAPTERS[0];
      const unlocked = isUnlocked(q.tier);

      if (!unlocked) {
        $('#quizCard').innerHTML = `
          <div class="quiz-top">
            <span class="chip">${esc(chapMeta.code)}: ${esc(chapMeta.title)}</span>
            ${tierBadge(q.tier)}
          </div>
          <div class="locked-inline-panel">
            <h3>${SVG.lock} Soal Asesmen Bab 0${q.chapter} Membutuhkan Pro Membership</h3>
            <p class="muted">Pertanyaan pada <strong>${esc(chapMeta.code)} (${esc(chapMeta.title)})</strong> menguji skenario tingkat menengah hingga enterprise. Tingkatkan ke Pro Membership untuk mengakses seluruh bank soal Bab 2–4.</p>
            <div class="hero-actions" style="margin-top:16px">
              <button class="btn btn-focus" id="btnUnlockQuizChap">${SVG.creditCard} Upgrade ke Pro Membership</button>
              <button class="btn btn-secondary" id="btnBackQuizBab1">Kembali ke Bab 1 (Gratis)</button>
            </div>
          </div>
        `;
        $('#btnUnlockQuizChap')?.addEventListener('click', () => {
          openPaywallModal({
            title: `${chapMeta.code}: ${chapMeta.title}`,
            chapterCode: chapMeta.code,
            returnHash: '#/quiz'
          });
        });
        $('#btnBackQuizBab1')?.addEventListener('click', () => {
          selectedChapter = 1;
          $$('.fchip', $('#quizChapChips')).forEach((b) => b.classList.toggle('active', b.dataset.qchap === '1'));
          updatePool();
        });
        return;
      }

      const record = S().quiz[q.id];
      $('#quizCard').innerHTML = `
        <div class="quiz-top">
          <div class="chips">
            <span class="chip">${esc(chapMeta.code)}</span>
            ${tierBadge(q.tier)}
            <span class="muted small">Soal ${index + 1} dari ${questions.length}</span>
          </div>
          <div class="dots">${questions.map((qq, i) => `<i class="${S().quiz[qq.id]?.correct ? 'ok' : S().quiz[qq.id] ? 'bad' : ''} ${i === index ? 'cur' : ''}"></i>`).join('')}</div>
        </div>
        <h2 class="quiz-q">${esc(q.q)}</h2>
        ${q.code ? `<pre class="code-block">${esc(q.code)}</pre>` : ''}
        <div class="options">
          ${q.options.map((o, i) => {
            let cls = '';
            if (answered !== null) cls = i === q.answer ? 'correct' : i === answered ? 'wrong' : 'faded';
            return `<button class="option ${cls}" data-opt="${i}" ${answered !== null ? 'disabled' : ''}><span class="opt-key">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`;
          }).join('')}
        </div>
        ${answered !== null ? `<div class="explain ${answered === q.answer ? 'good' : 'bad'}"><strong>${answered === q.answer ? 'Jawaban Tepat' : 'Kurang Tepat'}</strong><p>${esc(q.explain)}</p></div>` : ''}
        <div class="quiz-nav">
          <button class="btn btn-secondary btn-sm" data-nav="-1" ${index === 0 ? 'disabled' : ''}>← Sebelumnya</button>
          ${record?.correct && answered === null ? '<span class="chip chip-ok">✓ Terverifikasi Benar</span>' : ''}
          <button class="btn ${answered !== null ? 'btn-primary' : 'btn-secondary'} btn-sm" data-nav="1" ${index === questions.length - 1 ? 'disabled' : ''}>Selanjutnya →</button>
        </div>`;
    }

    $('#catChips').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      cat = btn.dataset.cat;
      $$('.fchip', $('#catChips')).forEach((b) => b.classList.toggle('active', b === btn));
      updatePool();
    });

    $('#quizChapChips').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-qchap]');
      if (!btn) return;
      const val = btn.dataset.qchap;
      if (val !== 'all' && Number(val) > 1 && !Store.isPro()) {
        const chMeta = window.QUIZ_CHAPTERS.find((x) => x.id === Number(val));
        openPaywallModal({
          title: chMeta ? `${chMeta.code}: ${chMeta.title}` : `Bab ${val}`,
          chapterCode: `BAB 0${val}`,
          returnHash: '#/quiz'
        });
        return;
      }
      selectedChapter = val === 'all' ? 'all' : Number(val);
      $$('.fchip', $('#quizChapChips')).forEach((b) => b.classList.toggle('active', b === btn));
      updatePool();
    });

    $('#quizCard').addEventListener('click', (e) => {
      const opt = e.target.closest('[data-opt]');
      if (opt && answered === null) {
        const q = questions[index];
        answered = Number(opt.dataset.opt);
        const correct = answered === q.answer;
        const firstCorrect = correct && !S().quiz[q.id]?.correct;
        Store.update((st) => { if (correct || !st.quiz[q.id]) st.quiz[q.id] = { correct }; });
        if (firstCorrect) { awardXp(QUIZ_XP, 'Asesmen Konsep'); confetti(50); }
        draw();
        return;
      }
      const nav = e.target.closest('[data-nav]');
      if (nav) {
        index = Math.min(questions.length - 1, Math.max(0, index + Number(nav.dataset.nav)));
        answered = null;
        draw();
      }
    });

    updatePool();
  }

  // ===================================================================
  // INTERVIEW PLAYBOOK (DENGAN PENGELOMPOKAN BAB 1 GRATIS VS BAB 2-4 PRO)
  // ===================================================================
  function renderInterview() {
    let selectedChapter = 1;
    let deck = window.INTERVIEW_CARDS.filter((c) => c.chapter === 1);
    let index = 0;
    let flipped = false;

    view.innerHTML = `
      <section class="page-head card">
        <div>
          <span class="eyebrow">EXECUTIVE INTERVIEW PLAYBOOK · 4 BAB TERSTRUKTUR</span>
          <h1>Structured Interview &amp; Case Study Playbook</h1>
          <p class="muted">Latih kerangka jawaban teknis, desain eksperimen statistik, metode behavioral STAR, dan investigasi metrik bisnis. Bab 1 terbuka gratis; Bab 2–4 khusus anggota Pro.</p>
        </div>
        <div id="ivRing"></div>
      </section>

      <div class="curriculum-toolbar">
        <div class="filter-chips" id="ivChapChips" style="margin-bottom:0">
          ${window.INTERVIEW_CHAPTERS.map((ch) => `
            <button class="fchip ${ch.id === selectedChapter ? 'active' : ''}" data-ivchap="${ch.id}">
              ${esc(ch.code)}: ${esc(ch.title.split('&')[0].trim())} ${ch.tier === 'free' ? '(Gratis)' : Store.isPro() ? '(Pro)' : '🔒'}
            </button>
          `).join('')}
          <button class="fchip" data-ivchap="all">Semua Bab (${window.INTERVIEW_CARDS.length})</button>
        </div>
      </div>

      <section id="flashArea"></section>`;

    function draw() {
      const known = cardsKnown();
      $('#ivRing').innerHTML = ring(known / window.INTERVIEW_CARDS.length, {
        size: 88, stroke: 8, color: '#059669', label: `${known}/${window.INTERVIEW_CARDS.length}`
      });

      const card = deck[index];
      if (!card) return;
      const chapMeta = window.INTERVIEW_CHAPTERS.find((x) => x.id === card.chapter) || window.INTERVIEW_CHAPTERS[0];
      const unlocked = isUnlocked(card.tier);

      if (!unlocked) {
        $('#flashArea').innerHTML = `
          <div class="card locked-inline-panel">
            <div class="chips" style="margin-bottom:10px">
              <span class="chip">${esc(chapMeta.code)}</span>
              ${tierBadge(card.tier)}
            </div>
            <h3>${SVG.lock} Skenario Interview Bab 0${card.chapter} Membutuhkan Pro Membership</h3>
            <p class="muted">${esc(chapMeta.subtitle)}</p>
            <div class="hero-actions" style="margin-top:16px">
              <button class="btn btn-focus" id="btnUnlockIv">${SVG.creditCard} Buka Seluruh 4 Bab Interview Playbook</button>
            </div>
          </div>
        `;
        $('#btnUnlockIv')?.addEventListener('click', () => {
          openPaywallModal({
            title: `${chapMeta.code}: ${chapMeta.title}`,
            chapterCode: chapMeta.code,
            returnHash: '#/interview'
          });
        });
        return;
      }

      const mark = S().flashcards[card.id];
      const t = window.INTERVIEW_TYPES[card.type];
      const draftKey = `datadojo_ent_ans_${card.id}`;

      $('#flashArea').innerHTML = `
        <div class="flash-meta">
          <div class="chips">
            <span class="chip">${esc(chapMeta.code)}: ${esc(chapMeta.title)}</span>
            ${tierBadge(card.tier)}
            <span class="muted small">Skenario ${index + 1} / ${deck.length}</span>
          </div>
          ${mark ? `<span class="chip ${mark === 'known' ? 'chip-ok' : 'chip-warn'}">${mark === 'known' ? '✓ Dikuasai' : 'Perlu Evaluasi Ulang'}</span>` : ''}
        </div>
        <div class="flashcard card ${flipped ? 'is-back' : ''}" id="flashcard" role="button" tabindex="0" aria-label="Balik kartu">
          ${flipped
            ? `<span class="chip chip-focus">KERANGKA JAWABAN EKSEKUTIF</span><div class="flash-answer">${md(card.answer)}</div><div class="flash-tips"><strong>Indikator Penilaian Rekruter:</strong> ${esc(card.tips)}</div>`
            : `<span class="chip">${esc(t.icon)} · ${esc(t.label)}</span><h2>${esc(card.q)}</h2><p class="muted small">Klik kartu untuk membuka kerangka jawaban standar industri ↻</p>`}
        </div>
        <div class="draft card">
          <label for="draft">Draft Poin Jawaban Anda <span class="muted small">(tersimpan otomatis di browser)</span></label>
          <textarea id="draft" rows="4" placeholder="Susun struktur jawaban Anda (mis. Situation, Task, Action, Result) sebelum membandingkan dengan kunci jawaban...">${esc(safeStorageGet(draftKey) || '')}</textarea>
        </div>
        <div class="flash-actions">
          <button class="btn btn-secondary" data-move="-1" ${index === 0 ? 'disabled' : ''}>← Sebelumnya</button>
          <button class="btn btn-secondary" data-mark="review">Tandai Perlu Evaluasi</button>
          <button class="btn btn-primary" data-mark="known">${SVG.check} Tandai Dikuasai (+${FLASHCARD_XP} XP)</button>
          <button class="btn btn-secondary" data-move="1" ${index === deck.length - 1 ? 'disabled' : ''}>Selanjutnya →</button>
        </div>`;

      $('#draft').addEventListener('input', (e) => safeStorageSet(draftKey, e.target.value));
    }

    function flip() {
      const el = $('#flashcard');
      if (!el) return;
      el.classList.add('flipping');
      setTimeout(() => { flipped = !flipped; draw(); $('#flashcard')?.classList.add('flipping-in'); }, 180);
    }

    function move(delta) {
      index = Math.min(deck.length - 1, Math.max(0, index + delta));
      flipped = false;
      draw();
    }

    $('#ivChapChips').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-ivchap]');
      if (!btn) return;
      const val = btn.dataset.ivchap;
      if (val !== 'all' && Number(val) > 1 && !Store.isPro()) {
        const chMeta = window.INTERVIEW_CHAPTERS.find((x) => x.id === Number(val));
        openPaywallModal({
          title: chMeta ? `${chMeta.code}: ${chMeta.title}` : `Bab ${val}`,
          chapterCode: `BAB 0${val}`,
          returnHash: '#/interview'
        });
        return;
      }
      selectedChapter = val === 'all' ? 'all' : Number(val);
      $$('.fchip', $('#ivChapChips')).forEach((b) => b.classList.toggle('active', b === btn));
      deck = selectedChapter === 'all'
        ? [...window.INTERVIEW_CARDS]
        : window.INTERVIEW_CARDS.filter((c) => c.chapter === selectedChapter);
      index = 0;
      flipped = false;
      draw();
    });

    $('#flashArea').addEventListener('click', (e) => {
      if (e.target.closest('#flashcard')) { flip(); return; }
      const m = e.target.closest('[data-move]');
      if (m) { move(Number(m.dataset.move)); return; }
      const mk = e.target.closest('[data-mark]');
      if (mk) {
        const card = deck[index];
        const value = mk.dataset.mark;
        const firstKnown = value === 'known' && S().flashcards[card.id] !== 'known' && !S().flashcards[`${card.id}_rewarded`];
        Store.update((st) => {
          st.flashcards[card.id] = value;
          if (firstKnown) st.flashcards[`${card.id}_rewarded`] = true;
        });
        if (firstKnown) awardXp(FLASHCARD_XP, 'Interview Playbook');
        if (index < deck.length - 1) move(1);
        else { draw(); toast('Seluruh skenario pada bab ini telah ditinjau.', 'info'); }
      }
    });

    $('#flashArea').addEventListener('keydown', (e) => {
      if (e.target.id === 'flashcard' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); flip(); }
    });

    draw();
  }

  // ===================================================================
  // TIMED ASSESSMENT SIMULATOR (MOCK INTERVIEW)
  // ===================================================================
  function renderMock() {
    let cat = 'mix';
    let session = null;
    let timer = null;
    onCleanup(() => clearInterval(timer));

    function drawSetup() {
      const pro = Store.isPro();
      const cats = [['mix', 'ALL · Lintas Topik'], ...Object.entries(window.QUIZ_CATEGORIES).map(([k, c]) => [k, `${c.icon} · ${c.label}`])];
      view.innerHTML = `
        <section class="mock-setup card">
          <span class="eyebrow">TIMED TECHNICAL ASSESSMENT SIMULATOR</span>
          <h1>Simulasi Asesmen Rekrutmen Terjadwal</h1>
          <p class="muted">${MOCK_SECONDS} detik per soal · Tanpa petunjuk · Evaluasi komprehensif standar teknis korporat. Skor >= 80% membuka kredensial <strong>Timed Assessment Ace</strong> (+${MOCK_ACE_BONUS} XP).</p>
          <div class="mock-stats">
            <div><strong>${S().mockBest}%</strong><small>Skor Terbaik</small></div>
            <div><strong>${S().mockRuns}</strong><small>Asesmen Selesai</small></div>
          </div>
          <h4>Pilih Cakupan Topik</h4>
          <div class="filter-chips center" id="mockCats">
            ${cats.map(([k, l]) => `<button class="fchip ${k === cat ? 'active' : ''}" data-cat="${k}">${esc(l)}</button>`).join('')}
          </div>

          <div class="mock-mode-cards">
            <div class="mock-mode-card">
              <span class="tier-pill tier-free">${SVG.check} STARTER FREE SAMPLE</span>
              <h3>Simulasi Dasar (Bab 1)</h3>
              <p class="muted small">5 soal pilihan dari Materi Dasar (Bab 1) untuk menguji kesiapan fondasi analitik.</p>
              <button class="btn btn-secondary" id="startMockFree">Mulai Simulasi Dasar (5 Soal)</button>
            </div>
            <div class="mock-mode-card pro-mode">
              <span class="tier-pill ${pro ? 'tier-pro-unlocked' : 'tier-pro-locked'}">${pro ? SVG.unlock : SVG.lock} PRO FULL SIMULATOR</span>
              <h3>Full Enterprise Assessment (Bab 1–4)</h3>
              <p class="muted small">10 soal acak lintas Bab 1 hingga Bab 4 + laporan diagnostik lengkap &amp; kelayakan kredensial.</p>
              <button class="btn ${pro ? 'btn-primary' : 'btn-focus'}" id="startMockPro">
                ${pro ? 'Mulai Full Assessment (10 Soal)' : `${SVG.lock} Buka Full Simulator dengan Pro`}
              </button>
            </div>
          </div>
        </section>`;

      $('#mockCats').addEventListener('click', (e) => {
        const b = e.target.closest('[data-cat]');
        if (!b) return;
        cat = b.dataset.cat;
        $$('.fchip', $('#mockCats')).forEach((x) => x.classList.toggle('active', x === b));
      });

      $('#startMockFree').addEventListener('click', () => startSession(false));
      $('#startMockPro').addEventListener('click', () => {
        if (!Store.isPro()) {
          openPaywallModal({
            title: 'Full Timed Assessment Simulator (Bab 1–4)',
            chapterCode: 'SIMULATOR PRO',
            returnHash: '#/mock'
          });
          return;
        }
        startSession(true);
      });
    }

    function startSession(isFullPro) {
      const pool = window.QUIZ_BANK.filter((q) => {
        const matchCat = cat === 'mix' || q.cat === cat;
        const matchTier = isFullPro ? true : q.tier === 'free';
        return matchCat && matchTier;
      });
      const count = isFullPro ? 10 : Math.min(5, pool.length);
      const questions = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
      session = { questions, index: 0, answers: [], locked: false, isFullPro };
      drawQuestion();
    }

    function drawQuestion() {
      const { questions, index } = session;
      const q = questions[index];
      const c = window.QUIZ_CATEGORIES[q.cat];
      view.innerHTML = `
        <section class="mock-run card">
          <div class="mock-head">
            <span class="chip">${esc(c.icon)} · ${esc(c.label)} · BAB 0${q.chapter}</span>
            <span class="muted">Soal ${index + 1} dari ${questions.length}</span>
            <span class="mock-time" id="mockTime">${MOCK_SECONDS}s</span>
          </div>
          <div class="timebar"><i id="timeFill"></i></div>
          <h2 class="quiz-q">${esc(q.q)}</h2>
          ${q.code ? `<pre class="code-block">${esc(q.code)}</pre>` : ''}
          <div class="options" id="mockOpts">
            ${q.options.map((o, i) => `<button class="option" data-opt="${i}"><span class="opt-key">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`).join('')}
          </div>
        </section>`;
      session.locked = false;
      const started = Date.now();
      clearInterval(timer);
      timer = setInterval(() => {
        const left = Math.max(0, MOCK_SECONDS - (Date.now() - started) / 1000);
        const fill = $('#timeFill');
        if (!fill) return;
        fill.style.width = `${(left / MOCK_SECONDS) * 100}%`;
        fill.classList.toggle('danger', left < 10);
        $('#mockTime').textContent = `${Math.ceil(left)}s`;
        if (left <= 0) answer(null);
      }, 100);
      $('#mockOpts').addEventListener('click', (e) => {
        const b = e.target.closest('[data-opt]');
        if (b) answer(Number(b.dataset.opt));
      });
    }

    function answer(choice) {
      if (session.locked) return;
      session.locked = true;
      clearInterval(timer);
      const q = session.questions[session.index];
      session.answers.push(choice);
      $$('.option', $('#mockOpts')).forEach((b, i) => {
        b.disabled = true;
        if (i === q.answer) b.classList.add('correct');
        else if (i === choice) b.classList.add('wrong');
        else b.classList.add('faded');
      });
      if (choice === null) toast('Batas waktu soal habis.', 'warn', 1500);
      setTimeout(() => {
        session.index++;
        if (session.index < session.questions.length) drawQuestion();
        else drawResult();
      }, 900);
    }

    function drawResult() {
      const { questions, answers } = session;
      const correct = questions.filter((q, i) => answers[i] === q.answer).length;
      const pct = Math.round((correct / questions.length) * 100);
      const xp = correct * MOCK_XP_PER_CORRECT + (pct >= 80 ? MOCK_ACE_BONUS : 0);
      const isBest = pct > S().mockBest;
      Store.update((st) => { st.mockRuns += 1; st.mockBest = Math.max(st.mockBest, pct); });
      if (xp > 0) awardXp(xp, 'Timed Assessment');
      if (pct >= 80) confetti(180);
      const verdict = pct >= 80
        ? ['QUALIFIED — PASSED', 'Performa sangat solid dan memenuhi ambang batas kesiapan wawancara teknis senior.']
        : pct >= 60
          ? ['BORDERLINE — REVIEW NEEDED', 'Fondasi cukup baik, namun beberapa konsep lanjutan perlu diperkuat.']
          : ['BELOW THRESHOLD', 'Tinjau kembali pembahasan setiap soal di bawah dan ulangi kurikulum terkait.'];

      view.innerHTML = `
        <section class="mock-result card">
          <div class="result-ring">${ring(pct / 100, { size: 160, stroke: 12, color: pct >= 80 ? '#059669' : pct >= 60 ? '#D97706' : '#DC2626', label: `${pct}%` })}</div>
          <span class="eyebrow">${verdict[0]}</span>
          <h1>${correct} dari ${questions.length} Soal Terjawab Benar</h1>
          <p class="muted">${verdict[1]} ${isBest ? '<strong>· Rekor Skor Tertinggi Baru!</strong>' : ''}</p>
          <div class="hero-actions center">
            <button class="btn btn-primary" id="again">Ulangi Simulasi</button>
            <a class="btn btn-secondary" href="#/quiz">Buka Modul Power BI &amp; Konsep</a>
          </div>
        </section>
        <h2 class="section-title">Laporan Audit Jawaban</h2>
        <section class="review-list">
          ${questions.map((q, i) => {
            const ok = answers[i] === q.answer;
            return `<div class="review card ${ok ? 'ok' : 'bad'}">
              <div class="review-head"><span><strong>[${ok ? 'PASS' : 'FAIL'}]</strong> Soal ${i + 1} (Bab 0${q.chapter}): ${esc(q.q)}</span></div>
              ${q.code ? `<pre class="code-block">${esc(q.code)}</pre>` : ''}
              <p class="small">Jawaban Anda: <strong>${answers[i] === null ? '(Waktu Habis)' : esc(q.options[answers[i]])}</strong></p>
              ${ok ? '' : `<p class="small">Kunci Jawaban: <strong class="ok-text">${esc(q.options[q.answer])}</strong></p>`}
              <p class="muted small">${esc(q.explain)}</p>
            </div>`;
          }).join('')}
        </section>`;
      $('#again').addEventListener('click', drawSetup);
    }

    drawSetup();
  }

  // ===================================================================
  // COMMERCIAL MEMBERSHIP & PRICING PAGE (#/pricing)
  // ===================================================================
  function renderPricing() {
    let cycle = S().billingCycle || 'annual';
    const currentPlan = S().plan || 'free';

    function draw() {
      const isAnnual = cycle === 'annual';
      const proPrice = isAnnual ? Store.PLANS.pro.priceAnnual : Store.PLANS.pro.priceMonthly;
      const entPrice = isAnnual ? Store.PLANS.enterprise.priceAnnual : Store.PLANS.enterprise.priceMonthly;

      view.innerHTML = `
        <section class="pricing-hero card">
          <div class="ph-top">
            <span class="eyebrow">COMMERCIAL LICENSING &amp; MEMBERSHIP PLANS</span>
            <h1>Investasi Kompetensi Data Analyst Standar Enterprise</h1>
            <p class="muted">Mulai gratis dengan seluruh <strong>Materi Dasar (Bab 1)</strong>. Tingkatkan ke <strong>Pro Membership</strong> atau <strong>Enterprise License</strong> untuk membuka seluruh studi kasus lanjutan (Bab 2–4), solusi referensi, dan sertifikasi.</p>
          </div>

          <div class="billing-toggle-bar">
            <button type="button" class="bt-btn ${!isAnnual ? 'active' : ''}" data-cycle="monthly">Tagihan Bulanan</button>
            <button type="button" class="bt-btn ${isAnnual ? 'active' : ''}" data-cycle="annual">
              Tagihan Tahunan <span class="bt-save-pill">HEMAT 33%</span>
            </button>
          </div>

          <div class="pricing-cards-grid">
            <!-- STARTER FREE -->
            <div class="pricing-tier-card ${currentPlan === 'free' ? 'current-plan' : ''}">
              <div class="ptc-head">
                <span class="label-caps">STARTER TIER</span>
                <h3>Starter Free</h3>
                <div class="ptc-price">
                  <strong>Rp 0</strong>
                  <small>selamanya · tanpa kartu kredit</small>
                </div>
                <p class="muted small">Dirancang untuk mempelajari fondasi dasar query SQL, dasar DataFrame pandas, dan konsep pengantar BI.</p>
              </div>
              <div class="ptc-action">
                ${currentPlan === 'free'
                  ? `<button class="btn btn-secondary" disabled style="width:100%">Paket Aktif Saat Ini</button>`
                  : `<button class="btn btn-secondary" data-switch-free style="width:100%">Beralih ke Starter Free</button>`}
              </div>
              <div class="ptc-features">
                <span class="label-caps">CAKUPAN MATERI GRATIS:</span>
                <ul>
                  <li class="inc">${SVG.check} <span><strong>Bab 1 SQL</strong>: Filtering, Aggregation &amp; Scalar Subquery (3 Modul)</span></li>
                  <li class="inc">${SVG.check} <span><strong>Bab 1 Python</strong>: Vectorized Column, Boolean Filter &amp; GroupBy (4 Modul)</span></li>
                  <li class="inc">${SVG.check} <span><strong>Bab 1 Power BI &amp; Quiz</strong>: Dasar Star Schema &amp; DAX (15 Soal Dasar)</span></li>
                  <li class="inc">${SVG.check} <span><strong>Bab 1 Interview Playbook</strong>: 5 Skenario Fondasi Peran &amp; EDA</span></li>
                  <li class="inc">${SVG.check} <span>Akses SQLite 3.45 &amp; Pyodide In-Browser Runtime</span></li>
                  <li class="exc"><span>✕</span> <span>Bab 2, Bab 3 &amp; Bab 4 (49 Modul Coding Pro, 50 Quiz &amp; 35 Interview)</span></li>
                  <li class="exc"><span>✕</span> <span>Kunci Jawaban &amp; Solusi Referensi Resmi</span></li>
                  <li class="exc"><span>✕</span> <span>Full Timed Assessment Simulator (10 Soal Lintas Bab)</span></li>
                </ul>
              </div>
            </div>

            <!-- PRO ANALYST MEMBERSHIP -->
            <div class="pricing-tier-card featured ${currentPlan === 'pro' ? 'current-plan' : ''}">
              <div class="ptc-popular-ribbon">PALING POPULER UNTUK KARIER ANALYST</div>
              <div class="ptc-head">
                <span class="label-caps" style="color:#4F46E5">INDIVIDUAL PRO LICENSE</span>
                <h3>Pro Analyst Membership</h3>
                <div class="ptc-price">
                  <strong>${formatIdr(proPrice)}</strong>
                  <small>/ bulan ${isAnnual ? '(ditagih Rp 1.188.000 / tahun)' : '(ditagih bulanan)'}</small>
                </div>
                <p class="muted small">Kurikulum komprehensif untuk menembus tes live coding &amp; wawancara teknis Data Analyst tingkat Junior hingga Senior.</p>
              </div>
              <div class="ptc-action">
                ${currentPlan === 'pro'
                  ? `<button class="btn btn-primary" disabled style="width:100%">${SVG.check} Paket Pro Aktif</button>`
                  : `<button class="btn btn-focus" data-checkout="pro" style="width:100%">${SVG.creditCard} Aktifkan Pro Membership</button>`}
              </div>
              <div class="ptc-features">
                <span class="label-caps">SEMUA FITUR FREE, DITAMBAH:</span>
                <ul>
                  <li class="inc pro">${SVG.check} <span><strong>Akses Penuh Bab 2, Bab 3 &amp; Bab 4</strong> (Total 161 Item Kurikulum)</span></li>
                  <li class="inc pro">${SVG.check} <span><strong>30 Modul SQL (27 Pro)</strong>: Multi-Join, CTE, CASE WHEN, Window &amp; Pareto</span></li>
                  <li class="inc pro">${SVG.check} <span><strong>26 Modul Python (22 Pro)</strong>: Sanitasi, IQR Outlier, Rolling &amp; Pivot Matrix</span></li>
                  <li class="inc pro">${SVG.check} <span><strong>65 Soal Asesmen &amp; 40 Skenario Interview</strong> (A/B Testing, STAR &amp; Executive Case)</span></li>
                  <li class="inc pro">${SVG.check} <span><strong>Official Reference Solutions</strong> &amp; EXPLAIN QUERY PLAN Diagnostics</span></li>
                  <li class="inc pro">${SVG.check} <span><strong>Full Timed Assessment Simulator</strong> &amp; Kredensial Kompetensi</span></li>
                </ul>
              </div>
            </div>

            <!-- ENTERPRISE TEAM -->
            <div class="pricing-tier-card ${currentPlan === 'enterprise' ? 'current-plan' : ''}">
              <div class="ptc-head">
                <span class="label-caps">CORPORATE &amp; B2B</span>
                <h3>Enterprise Team License</h3>
                <div class="ptc-price">
                  <strong>${formatIdr(entPrice)}</strong>
                  <small>/ bulan per 5 kursi ${isAnnual ? '(ditagih tahunan)' : '(ditagih bulanan)'}</small>
                </div>
                <p class="muted small">Solusi rekrutmen teknis &amp; upskilling divisi Business Intelligence untuk perusahaan, bootcamp, dan universitas.</p>
              </div>
              <div class="ptc-action">
                ${currentPlan === 'enterprise'
                  ? `<button class="btn btn-primary" disabled style="width:100%">${SVG.check} Lisensi Enterprise Aktif</button>`
                  : `<button class="btn btn-primary" data-checkout="enterprise" style="width:100%">Aktifkan Enterprise License</button>`}
              </div>
              <div class="ptc-features">
                <span class="label-caps">SEMUA FITUR PRO, DITAMBAH:</span>
                <ul>
                  <li class="inc">${SVG.check} <span><strong>Lisensi Multi-Seat</strong> untuk Tim Analitik &amp; Kandidat Rekrutmen</span></li>
                  <li class="inc">${SVG.check} <span><strong>Bab 4 Executive Case Studies</strong> &amp; Root-Cause Diagnostics</span></li>
                  <li class="inc">${SVG.check} <span><strong>Global Benchmark &amp; Skor Persentil</strong> Kandidat</span></li>
                  <li class="inc">${SVG.check} <span><strong>Faktur Pajak / Commercial Invoice</strong> Resmi Otomatis</span></li>
                  <li class="inc">${SVG.check} <span>Dukungan Integrasi Kurikulum Internal Perusahaan</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Full Chapter Matrix Table -->
        <section class="card matrix-section" style="margin-top:24px">
          <div class="matrix-head">
            <div>
              <span class="label-caps">CURRICULUM ACCESS MATRIX</span>
              <h2>Rincian Hak Akses Materi per Bab (Free vs Pro)</h2>
            </div>
          </div>
          <div class="table-wrap" style="max-height:none">
            <table class="df-table matrix-table">
              <thead>
                <tr>
                  <th>Bab Kurikulum</th>
                  <th>Cakupan Kompetensi Utama</th>
                  <th>Jumlah Modul</th>
                  <th>Starter Free</th>
                  <th>Pro / Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>BAB 01 · Materi Dasar</strong></td>
                  <td>SQL Filtering &amp; Aggregation, Python Vectorized &amp; GroupBy, Dasar Star Schema, EDA</td>
                  <td>3 SQL · 4 Python · 15 Quiz · 5 Playbook</td>
                  <td><span class="chip chip-ok">TERBUKA GRATIS</span></td>
                  <td><span class="chip chip-ok">TERBUKA PENUH</span></td>
                </tr>
                <tr>
                  <td><strong>BAB 02 · Materi Menengah</strong></td>
                  <td>Multi-Table Joins, Gross Profit, Payroll, Pipeline Sanitasi, IQR Outlier, Z-Score &amp; DAX Iterators</td>
                  <td>9 SQL · 7 Python · 18 Quiz · 12 Playbook</td>
                  <td><span class="chip">Terkunci</span></td>
                  <td><span class="chip chip-focus">TERBUKA PENUH</span></td>
                </tr>
                <tr>
                  <td><strong>BAB 03 · Materi Lanjutan</strong></td>
                  <td>CASE WHEN, Self-Join, Omnichannel, Quarterly Trend, Rolling Window, np.select &amp; A/B Testing</td>
                  <td>9 SQL · 8 Python · 16 Quiz · 11 Playbook</td>
                  <td><span class="chip">Terkunci</span></td>
                  <td><span class="chip chip-focus">TERBUKA PENUH</span></td>
                </tr>
                <tr>
                  <td><strong>BAB 04 · Materi Enterprise</strong></td>
                  <td>Window Functions (DENSE_RANK, LAG, Moving Avg, Pareto), Matrix Pivot, Melt, Two-Sum &amp; Executive Cases</td>
                  <td>9 SQL · 7 Python · 16 Quiz · 12 Playbook</td>
                  <td><span class="chip">Terkunci</span></td>
                  <td><span class="chip chip-focus">TERBUKA PENUH</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        ${S().invoices && S().invoices.length ? `
          <section class="card" style="margin-top:24px">
            <span class="label-caps">BILLING &amp; INVOICE HISTORY</span>
            <h3 style="margin:4px 0 12px">Riwayat Faktur Lisensi</h3>
            <div class="table-wrap" style="max-height:none">
              <table class="df-table">
                <thead>
                  <tr><th>No. Invoice</th><th>Tanggal</th><th>Paket Lisensi</th><th>Siklus</th><th>Metode Pembayaran</th><th>Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                  ${S().invoices.map((inv) => `
                    <tr>
                      <td><code>${esc(inv.id)}</code></td>
                      <td>${esc(inv.date)}</td>
                      <td><strong>${esc(inv.planName)}</strong></td>
                      <td>${esc(inv.cycle)}</td>
                      <td>${esc(inv.method)}</td>
                      <td class="num"><strong>${formatIdr(inv.amount)}</strong></td>
                      <td><span class="chip chip-ok">${esc(inv.status)}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </section>
        ` : ''}
      `;

      $$('[data-cycle]', view).forEach((btn) => {
        btn.addEventListener('click', () => {
          cycle = btn.dataset.cycle;
          draw();
        });
      });

      $$('[data-checkout]', view).forEach((btn) => {
        btn.addEventListener('click', () => {
          openCheckoutModal(btn.dataset.checkout, cycle, '#/pricing');
        });
      });

      $('[data-switch-free]', view)?.addEventListener('click', () => {
        Store.setPlan('free');
        toast('Paket diubah ke Starter Free (Bab 1 Gratis).', 'info');
        draw();
      });
    }

    draw();
  }

  // ===================================================================
  // GLOBAL BENCHMARK (LEADERBOARD)
  // ===================================================================
  function renderLeaderboard() {
    const me = [S().name || 'Analyst', S().xp, (S().name || 'A').slice(0, 2).toUpperCase(), S().plan || 'free', true];
    const rows = [...BOTS.map((b) => [...b, false]), me].sort((a, b) => b[1] - a[1]);
    const myRank = rows.findIndex((r) => r[4]) + 1;
    const podium = rows.slice(0, 3);
    const order = [1, 0, 2];

    view.innerHTML = `
      <section class="page-head card">
        <div>
          <span class="eyebrow">GLOBAL ANALYST BENCHMARK</span>
          <h1>Peringkat Kompetensi &amp; Persentil Kandidat</h1>
          <p class="muted">Posisi Anda saat ini: <strong>Peringkat #${myRank}</strong>. Skor dihitung berdasarkan penyelesaian modul terverifikasi lintas Bab 1 hingga Bab 4.</p>
        </div>
      </section>
      <section class="podium">
        ${order.map((i) => podium[i] ? `<div class="podium-item p${i + 1} ${podium[i][4] ? 'me' : ''}">
          <span class="avatar font-mono" style="font-size:14px;font-weight:700">${esc(podium[i][2])}</span>
          <strong>${esc(podium[i][0])}</strong>
          <small>${podium[i][1]} XP · ${esc(podium[i][3].toUpperCase())}</small>
          <div class="podium-block">#${i + 1}</div></div>` : '').join('')}
      </section>
      <section class="card lb-list">
        ${rows.map((r, i) => `<div class="lb-row ${r[4] ? 'me' : ''}">
          <span class="lb-rank">#${i + 1}</span>
          <span class="avatar sm font-mono" style="font-size:11px;font-weight:700">${esc(r[2])}</span>
          <span class="lb-name">
            ${esc(r[0])}
            ${r[4] ? ' <span class="chip chip-focus">Anda</span>' : ''}
            <span class="mini-tier-tag ${r[3] === 'free' ? 'free' : 'pro-open'}" style="margin-left:6px">${esc(r[3].toUpperCase())}</span>
          </span>
          <span class="lb-lvl muted small">${esc(Store.getLevel(r[1]).code)} · ${esc(Store.getLevel(r[1]).title)}</span>
          <span class="lb-xp">${r[1]} XP</span></div>`).join('')}
      </section>`;
  }

  // ===================================================================
  // ACCOUNT, CREDENTIALS & LICENSING (PROFILE)
  // ===================================================================
  function renderProfile() {
    const s = S();
    const lvl = Store.getLevel();
    const pro = Store.isPro();
    const planInfo = Store.getPlanInfo();
    const weeks = 15;
    const cells = [];
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - (weeks * 7 - 1) - ((today.getDay() + 6) % 7 - 6 + 7) % 7);
    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = Store.todayKey(d);
      const xp = s.activity[key] || 0;
      const lvlCell = xp === 0 ? 0 : xp < 20 ? 1 : xp < 50 ? 2 : xp < 100 ? 3 : 4;
      cells.push(`<i class="h${lvlCell} ${d > today ? 'future' : ''}" title="${key}: ${xp} XP"></i>`);
    }

    const earned = BADGES.filter((b) => s.badges[b.id]).length;
    const mythicEarned = BADGES.filter((b) => b.tier === 'mythic' && s.badges[b.id]).length;
    const legendEarned = BADGES.filter((b) => b.tier === 'legendary' && s.badges[b.id]).length;
    const epicEarned = BADGES.filter((b) => b.tier === 'epic' && s.badges[b.id]).length;
    const rareEarned = BADGES.filter((b) => b.tier === 'rare' && s.badges[b.id]).length;

    let activeFilter = 'all';

    const renderBadgeCards = () => {
      const list = BADGES.filter((b) => {
        const isDone = Boolean(s.badges[b.id]);
        if (activeFilter === 'earned') return isDone;
        if (activeFilter === 'locked') return !isDone;
        if (activeFilter === 'mythic_legend') return b.tier === 'mythic' || b.tier === 'legendary';
        return true;
      });

      return list.map((b) => {
        const isDone = Boolean(s.badges[b.id]);
        const earnedDate = s.badges[b.id];
        const prog = b.progress ? b.progress() : { current: isDone ? 1 : 0, max: 1, unit: '' };
        const pct = Math.min(100, Math.round((prog.current / (prog.max || 1)) * 100));

        return `
          <div class="badge-card-v2 tier-${b.tier} ${isDone ? 'earned' : 'locked'}" data-badge-id="${b.id}" role="button" tabindex="0">
            <div class="bcard-glow"></div>
            <div class="bcard-tier-bar tier-${b.tier}">
              <span class="bcard-tier-label">${b.tierLabel}</span>
              <span class="bcard-rarity">${b.rarity}</span>
              <span class="bcard-xp">+${b.xpReward} XP</span>
            </div>
            
            <div class="bcard-body">
              <div class="bcard-icon-stage tier-${b.tier}">
                <span class="bcard-icon font-mono" style="font-size:13px;font-weight:800">${esc(b.icon)}</span>
              </div>
              <div class="bcard-titles">
                <strong>${esc(b.name)}</strong>
                <span class="bcard-sub">${esc(b.subtitle)}</span>
              </div>
            </div>

            <p class="bcard-desc">${esc(b.desc)}</p>

            <div class="bcard-progress-wrap">
              <div class="bcard-prog-info">
                <span class="muted small">Verifikasi</span>
                <span class="small font-mono"><strong>${prog.current}</strong>/${prog.max} ${esc(prog.unit)}</span>
              </div>
              <div class="bar bcard-bar"><i style="width:${pct}%"></i></div>
            </div>

            <div class="bcard-foot">
              ${isDone
                ? `<span class="ok-text small">✓ Terverifikasi · ${esc(earnedDate)}</span>`
                : `<span class="muted small">Terkunci (${Math.max(0, prog.max - prog.current)} lagi)</span>`}
              <span class="bcard-inspect-btn">Detail →</span>
            </div>
          </div>
        `;
      }).join('');
    };

    view.innerHTML = `
      <section class="profile-head card">
        <div class="avatar xl font-mono" style="font-size:20px;font-weight:800">${esc(lvl.code)}</div>
        <div class="profile-info">
          <div class="profile-title-bar">
            <div>
              <label class="muted small" for="nameInput">Identitas Kandidat / Pemegang Lisensi</label>
              <div class="name-row">
                <input id="nameInput" maxlength="24" value="${esc(s.name)}" placeholder="Nama lengkap">
                <button class="btn btn-sm btn-primary" id="saveName">Simpan</button>
              </div>
            </div>
            <div class="profile-quick-actions">
              <a href="#/pricing" class="btn btn-sm ${pro ? 'btn-secondary' : 'btn-focus'}">${SVG.creditCard} ${pro ? 'Kelola Lisensi Pro' : 'Upgrade ke Pro'}</a>
              <button class="btn btn-sm btn-secondary" id="btnProfileSwitch">${SVG.switchUser} Ganti Akun</button>
              <button class="btn btn-sm btn-danger" id="btnProfileLogout">${SVG.logout} Log Out</button>
            </div>
          </div>
          <div class="chips" style="margin:6px 0">
            <span class="chip ${pro ? 'chip-focus' : ''}">${esc(planInfo.name)} (${esc(planInfo.badge)})</span>
            ${s.licenseKey ? `<span class="chip">Key: <code>${esc(s.licenseKey)}</code></span>` : ''}
            <span class="chip">Tingkat ${lvl.number}: ${esc(lvl.title)} (${s.xp} XP)</span>
          </div>
          <div class="bar big"><i style="width:${lvl.progress * 100}%"></i></div>
          <small class="muted">${lvl.next ? `${lvl.next.min - s.xp} XP lagi menuju kualifikasi ${esc(lvl.next.title)} (${esc(lvl.next.code)})` : 'Kualifikasi Tertinggi Tercapai'}</small>
        </div>
      </section>

      <section class="trophy-showcase-card card">
        <div class="tsc-layout">
          <div class="tsc-media">
            <div class="tsc-img-frame">
              <img src="img/badges-showcase.jpg" alt="DataDojo Credentials Showcase" class="tsc-img" />
              <div class="tsc-overlay"></div>
              <div class="tsc-live-tag">
                <span class="live-dot"></span>
                <span>VERIFIED ANALYTICS CREDENTIALS</span>
              </div>
            </div>
          </div>
          <div class="tsc-text">
            <span class="eyebrow">CREDENTIAL &amp; CERTIFICATION VAULT</span>
            <h2>Portofolio Kredensial Kompetensi</h2>
            <p class="muted">Setiap kredensial diterbitkan berdasarkan verifikasi kode otomatis terhadap dataset transaksi, akurasi kalkulasi DAX, dan ketepatan waktu penyelesaian simulator.</p>
            
            <div class="tsc-stats-row">
              <div class="tsc-pill tier-mythic">
                <span class="tsc-pill-icon font-mono">L4</span>
                <div><strong>${mythicEarned}/2</strong><small>Principal</small></div>
              </div>
              <div class="tsc-pill tier-legendary">
                <span class="tsc-pill-icon font-mono">L3</span>
                <div><strong>${legendEarned}/4</strong><small>Executive</small></div>
              </div>
              <div class="tsc-pill tier-epic">
                <span class="tsc-pill-icon font-mono">L2</span>
                <div><strong>${epicEarned}/2</strong><small>Senior</small></div>
              </div>
              <div class="tsc-pill tier-rare">
                <span class="tsc-pill-icon font-mono">L1</span>
                <div><strong>${rareEarned}/4</strong><small>Associate</small></div>
              </div>
            </div>

            <div class="tsc-completion">
              <div class="tsc-c-text">
                <span>Total Kredensial Terverifikasi</span>
                <strong>${earned} dari ${BADGES.length} Kredensial (${Math.round((earned / BADGES.length) * 100)}%)</strong>
              </div>
              <div class="bar big"><i style="width:${(earned / BADGES.length) * 100}%"></i></div>
            </div>
          </div>
        </div>
      </section>

      <div class="section-head-row">
        <div>
          <h2 class="section-title">Daftar Kredensial (${earned}/${BADGES.length})</h2>
          <p class="section-sub">Klik kartu kredensial untuk melihat metrik verifikasi dan menyalin bukti kelulusan.</p>
        </div>
        <div class="badge-filter-group" id="badgeFilters">
          <button class="fchip active" data-bfilter="all">Semua (${BADGES.length})</button>
          <button class="fchip" data-bfilter="earned">Terverifikasi (${earned})</button>
          <button class="fchip" data-bfilter="locked">Belum Terbuka (${BADGES.length - earned})</button>
          <button class="fchip" data-bfilter="mythic_legend">Principal &amp; Executive (6)</button>
        </div>
      </div>

      <section class="badge-grid-showcase" id="badgeGridContainer">
        ${renderBadgeCards()}
      </section>

      <h2 class="section-title">Log Aktivitas Eksekusi (15 Minggu Terakhir)</h2>
      <section class="card heatmap-card">
        <div class="heatmap" style="--weeks:${weeks}">${cells.join('')}</div>
        <div class="heat-legend muted small">Rendah <i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i> Tinggi</div>
      </section>

      <h2 class="section-title">Jenjang Kualifikasi Analis</h2>
      <section class="level-path card">
        ${Store.LEVELS.map((l, i) => `<div class="lp-item ${i <= lvl.index ? 'reached' : ''}"><span class="font-mono" style="font-weight:800">${esc(l.code)}</span><strong>${esc(l.title)}</strong><small>${l.min} XP</small></div>`).join('')}
      </section>

      <section class="danger-zone card">
        <div>
          <strong>Manajemen Sesi &amp; Reset Data</strong>
          <p class="muted small">Keluar dari akun aktif atau hapus seluruh riwayat progres lokal pada perangkat ini.</p>
        </div>
        <div class="danger-zone-actions">
          <button class="btn btn-sm btn-secondary" id="btnLogoutBottom">${SVG.logout} Log Out</button>
          <button class="btn btn-sm btn-danger" id="resetAll">Reset Seluruh Data</button>
        </div>
      </section>`;

    const attachBadgeEvents = () => {
      view.querySelectorAll('#badgeGridContainer [data-badge-id]').forEach((el) => {
        el.addEventListener('click', () => {
          const b = BADGES.find((x) => x.id === el.dataset.badgeId);
          if (b) showBadgeModal(b);
        });
      });
    };
    attachBadgeEvents();

    const filterBox = $('#badgeFilters');
    if (filterBox) {
      filterBox.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-bfilter]');
        if (!btn) return;
        $$('.fchip', filterBox).forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.bfilter;
        $('#badgeGridContainer').innerHTML = renderBadgeCards();
        attachBadgeEvents();
      });
    }

    $('#btnProfileSwitch')?.addEventListener('click', openSwitchAccountModal);
    $('#btnProfileLogout')?.addEventListener('click', openLogoutModal);
    $('#btnLogoutBottom')?.addEventListener('click', openLogoutModal);

    $('#saveName').addEventListener('click', () => {
      const name = $('#nameInput').value.trim().slice(0, 24);
      if (!name) { toast('Nama akun tidak boleh kosong.', 'warn'); return; }
      Store.update((st) => { st.name = name; });
      Store.saveCurrentAccountProfile();
      toast('Identitas akun berhasil diperbarui.', 'info');
    });

    $('#resetAll').addEventListener('click', () => {
      const close = modal(`<h2>Reset Seluruh Data Progres?</h2><p class="muted">Seluruh XP, riwayat penyelesaian bab, dan kredensial pada akun ini akan dihapus permanen.</p>
        <div class="hero-actions center"><button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-danger" id="confirmReset">Konfirmasi Reset</button></div>`);
      $('#confirmReset').addEventListener('click', () => {
        Store.reset();
        Object.keys(localStorage).filter((k) => k.startsWith('datadojo_ent_')).forEach((k) => localStorage.removeItem(k));
        close();
        toast('Data progres telah direset.', 'warn');
        location.hash = '#/';
        askName();
      });
    });
  }

  // ===================================================================
  // LOGOUT & ACCOUNT SWITCHER MODALS
  // ===================================================================
  function openLogoutModal() {
    const s = S();
    const name = s.name || 'Analyst';
    const lvl = Store.getLevel();
    const planInfo = Store.getPlanInfo();

    const close = modal(`
      <div class="logout-modal-box">
        <div class="lm-icon">${SVG.logout}</div>
        <h2>Keluar dari Sesi Akun?</h2>
        <p class="muted">Anda sedang masuk sebagai <strong>${esc(name)}</strong> (${esc(lvl.code)} · ${esc(planInfo.name)} · ${s.xp} XP).</p>
        
        <div class="logout-action-cards">
          <div class="btn-logout-card" id="btnConfirmLogoutKeep" role="button" tabindex="0">
            <span class="blc-icon">${SVG.shield}</span>
            <div class="blc-text">
              <strong>Simpan Profil &amp; Log Out</strong>
              <small>Progres dan status lisensi ${esc(name)} tetap tersimpan di perangkat ini untuk sesi berikutnya.</small>
            </div>
          </div>

          <div class="btn-logout-card danger" id="btnConfirmLogoutClear" role="button" tabindex="0">
            <span class="blc-icon">✕</span>
            <div class="blc-text">
              <strong>Hapus Data Akun &amp; Log Out</strong>
              <small>Hapus seluruh progres dan riwayat akun ${esc(name)} dari penyimpanan browser ini.</small>
            </div>
          </div>
        </div>

        <div class="hero-actions center">
          <button class="btn btn-ghost" data-close>Batal</button>
        </div>
      </div>
    `);

    $('#btnConfirmLogoutKeep').addEventListener('click', () => {
      close();
      Store.logout({ clearData: false });
      toast(`Sesi ${name} telah ditutup.`, 'info', 3500);
      askName();
    });

    $('#btnConfirmLogoutClear').addEventListener('click', () => {
      close();
      Store.logout({ clearData: true });
      toast('Data akun dihapus dan sesi ditutup.', 'warn', 3500);
      askName();
    });
  }

  function openSwitchAccountModal() {
    const saved = Store.getSavedAccounts();
    const currentName = S().name || '';

    const close = modal(`
      <div class="switch-modal-box">
        <div class="lm-icon">${SVG.switchUser}</div>
        <h2>Manajemen Profil &amp; Lisensi Akun</h2>
        <p class="muted">Pilih akun yang tersimpan di perangkat ini atau buat profil kandidat baru.</p>

        ${saved.length ? `
          <div class="saved-accounts-list">
            ${saved.map((acc) => `
              <div class="saved-acc-card ${acc.name.toLowerCase() === currentName.toLowerCase() ? 'active' : ''}" data-switch-name="${esc(acc.name)}" role="button" tabindex="0">
                <span class="sab-avatar">${esc(acc.name.charAt(0).toUpperCase())}</span>
                <div class="sab-info">
                  <strong>
                    ${esc(acc.name)}
                    <span class="mini-tier-tag ${acc.plan === 'free' ? 'free' : 'pro-open'}">${esc((acc.plan || 'free').toUpperCase())}</span>
                  </strong>
                  <small class="muted">${esc(acc.levelCode || 'L1')} ${esc(acc.levelTitle)} · ${acc.xp} XP</small>
                </div>
                <span class="sab-action">${acc.name.toLowerCase() === currentName.toLowerCase() ? 'Aktif' : 'Gunakan →'}</span>
              </div>
            `).join('')}
          </div>
        ` : '<p class="muted small" style="margin: 12px 0;">Belum ada profil lain yang tersimpan.</p>'}

        <div class="switch-new-form">
          <label class="muted small" for="switchNewName">Buat profil baru:</label>
          <div class="name-row">
            <input id="switchNewName" maxlength="24" placeholder="Nama pengguna / kandidat...">
            <button class="btn btn-primary" id="btnGoSwitchNew">Masuk</button>
          </div>
        </div>

        <div class="hero-actions center">
          <button class="btn btn-ghost" data-close>Tutup</button>
        </div>
      </div>
    `);

    $$('[data-switch-name]').forEach((el) => {
      el.addEventListener('click', () => {
        const name = el.dataset.switchName;
        if (name.toLowerCase() === currentName.toLowerCase()) { close(); return; }
        Store.switchAccount(name);
        close();
        toast(`Beralih ke akun ${name}.`, 'info', 3200);
        location.hash = '#/';
      });
    });

    const goNew = () => {
      const name = $('#switchNewName').value.trim().slice(0, 24);
      if (!name) { toast('Nama akun tidak boleh kosong.', 'warn'); return; }
      Store.switchAccount(name);
      close();
      toast(`Profil baru ${name} berhasil dibuat.`, 'info', 3200);
      location.hash = '#/';
    };
    $('#btnGoSwitchNew').addEventListener('click', goNew);
    $('#switchNewName').addEventListener('keydown', (e) => { if (e.key === 'Enter') goNew(); });
  }

  // ===================================================================
  // ONBOARDING & INIT
  // ===================================================================
  function askName() {
    const saved = Store.getSavedAccounts();
    const close = modal(`<div class="onboard">
      <div class="levelup-code-badge">DD</div>
      <h2>DataDojo Enterprise</h2>
      <p class="muted">Platform Kurikulum &amp; Asesmen Teknis Data Analyst. Masuk ke akun Anda dan pilih paket akses.</p>
      
      ${saved.length ? `
        <div class="onboard-saved-title">Profil Tersimpan di Perangkat Ini:</div>
        <div class="saved-accounts-list">
          ${saved.map((acc) => `
            <div class="saved-acc-card" data-login-acc="${esc(acc.name)}" role="button" tabindex="0">
              <span class="sab-avatar">${esc(acc.name.charAt(0).toUpperCase())}</span>
              <div class="sab-info">
                <strong>${esc(acc.name)} <span class="mini-tier-tag ${acc.plan === 'free' ? 'free' : 'pro-open'}">${esc((acc.plan || 'free').toUpperCase())}</span></strong>
                <small class="muted">${esc(acc.levelCode || 'L1')} ${esc(acc.levelTitle)} · ${acc.xp} XP</small>
              </div>
              <span class="sab-action">Masuk →</span>
            </div>
          `).join('')}
        </div>
        <div class="auth-divider"><span>atau buat sesi baru</span></div>
      ` : ''}

      <div class="onboard-input-box">
        <label class="muted small" for="onboardName">Nama Lengkap / Kandidat:</label>
        <div class="name-row">
          <input id="onboardName" maxlength="24" placeholder="Ketik nama Anda..." autofocus>
          <button class="btn btn-primary" id="onboardGo">Masuk (Free Tier)</button>
        </div>
      </div>
    </div>`, { onClose: () => { if (!S().name) Store.update((st) => { st.name = 'Analyst'; }); } });

    $$('[data-login-acc]').forEach((el) => {
      el.addEventListener('click', () => {
        const name = el.dataset.loginAcc;
        Store.switchAccount(name);
        close();
        toast(`Selamat datang kembali, ${name}.`, 'info', 3200);
        router();
      });
    });

    const go = () => {
      const name = $('#onboardName').value.trim().slice(0, 24) || 'Analyst';
      Store.switchAccount(name, 'free');
      close();
      toast(`Selamat datang, ${name}. Bab 1 (Materi Dasar) terbuka gratis untuk Anda.`, 'info', 4000);
      router();
    };
    $('#onboardGo').addEventListener('click', go);
    $('#onboardName').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    setTimeout(() => $('#onboardName')?.focus(), 50);
  }

  function init() {
    Store.subscribe(() => { renderTopbar(); renderSidebarFooter(); checkBadges(); });
    checkBadges(true);
    Store.saveCurrentAccountProfile();
    renderTopbar();
    renderSidebarFooter();
    window.addEventListener('hashchange', router);
    router();
    if (!S().name) askName();
    SqlEngine.load().catch((err) => console.error('Failed to warm up SQL engine', err));
  }

  init();
})();
