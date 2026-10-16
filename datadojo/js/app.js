/**
 * DataDojo — aplikasi utama (router + views).
 * Arsitektur sederhana: data (js/data) → engine (js/engines) → state (js/state.js) → views (file ini).
 */
(() => {
  'use strict';

  const { esc, md, toast, modal, ring, confetti } = window.UI;
  const view = document.getElementById('view');
  const topbar = document.getElementById('topbar');
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ===================================================================
  // KONFIGURASI
  // ===================================================================
  const DIFF = {
    easy: { label: 'Easy', xp: 20 },
    medium: { label: 'Medium', xp: 40 },
    hard: { label: 'Hard', xp: 70 }
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
      key: 'sql', name: 'SQL Lab', icon: '🗄️', color: '#22d3ee', mode: 'text/x-sqlite', lang: 'SQLite',
      items: window.SQL_CHALLENGES,
      desc: 'Live coding SQL langsung di browser dengan database e-commerce & HR. Query kamu dinilai otomatis — persis seperti tes HackerRank / Codility.'
    },
    python: {
      key: 'python', name: 'Python Lab', icon: '🐍', color: '#a3e635', mode: 'python', lang: 'Python 3 + pandas',
      items: window.PY_CHALLENGES,
      desc: 'Latihan pandas & algoritma dasar dengan Python asli yang berjalan di browser. Simpan jawabanmu ke variabel result.'
    }
  };
  const ALL_CHALLENGES = Object.values(TRACKS).flatMap((t) => t.items.map((c) => ({ ...c, track: t.key })));

  const BOTS = [
    ['Nadia_SQL', 1850, '🦊'], ['RizkyDA', 1620, '🐼'], ['PutriAnalytics', 1410, '🐱'], ['DimasPandas', 1180, '🐨'],
    ['SitiDAX', 960, '🦄'], ['BudiQuery', 720, '🐯'], ['AyuViz', 540, '🐰'], ['FajarETL', 380, '🐸'],
    ['MayaStats', 230, '🐙'], ['EkoJoin', 120, '🐢']
  ];

  const CHEATSHEETS = {
    powerbi: { title: 'DAX Cheat Sheet', code: `Total Sales = SUM(Sales[Amount])

Sales LY =
CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))

YoY % = DIVIDE([Total Sales] - [Sales LY], [Sales LY])

% of Total =
DIVIDE([Total Sales], CALCULATE([Total Sales], ALL('Product')))

Running Total =
CALCULATE([Total Sales],
  FILTER(ALL('Date'), 'Date'[Date] <= MAX('Date'[Date])))

Rank Product = RANKX(ALL('Product'[Name]), [Total Sales])` },
    sql: { title: 'SQL Cheat Sheet', code: `-- Urutan eksekusi logis
FROM → JOIN → WHERE → GROUP BY → HAVING
→ SELECT → DISTINCT → ORDER BY → LIMIT

-- Top-N per grup
WITH r AS (
  SELECT *, DENSE_RANK() OVER (
    PARTITION BY category ORDER BY revenue DESC) AS rnk
  FROM product_revenue)
SELECT * FROM r WHERE rnk <= 3;

-- Anti-join
SELECT c.* FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;` },
    python: { title: 'pandas Cheat Sheet', code: `df.info(); df.describe(); df.isna().sum()
df[(df.a > 1) & (df.b == 'x')]          # filter
df.loc[df.a > 1, 'flag'] = True          # assign aman
df.groupby('cat', as_index=False)['rev'].sum()
df.pivot_table(index='city', columns='cat',
               values='rev', aggfunc='sum', fill_value=0)
df.merge(other, on='id', how='left')
df.drop_duplicates(subset='id')
df['date'].dt.to_period('M')
df['rev'].pct_change()` },
    stats: { title: 'Statistik Cheat Sheet', code: `Mean   : sensitif outlier
Median : tahan outlier (pakai utk data skewed)
SD     : sebaran data dari mean
IQR    : Q3 - Q1, outlier < Q1-1.5IQR | > Q3+1.5IQR

p-value < α (0.05) → tolak H0
Type I  : false positive (α)
Type II : false negative (β), Power = 1 - β

Korelasi ≠ Kausalitas → butuh eksperimen` },
    case: { title: 'Framework Business Case', code: `1. Klarifikasi  : tujuan, definisi metrik, periode
2. Validasi data: bug tracking? pipeline telat?
3. Breakdown    : waktu, wilayah, produk, channel,
                  user baru vs lama, platform
4. Hipotesis    : internal vs eksternal
5. Uji & ukur   : data / A/B test
6. Rekomendasi  : aksi + metrik yang dipantau` }
  };

  // ===================================================================
  // HELPER STATE
  // ===================================================================
  const S = () => window.Store.state;
  const trackDone = (key) => TRACKS[key].items.filter((c) => S().completed[c.id]).length;
  const quizByCat = (cat) => window.QUIZ_BANK.filter((q) => q.cat === cat);
  const quizCorrect = (cat) => quizByCat(cat).filter((q) => S().quiz[q.id]?.correct).length;
  const cardsKnown = () => window.INTERVIEW_CARDS.filter((c) => S().flashcards[c.id] === 'known').length;

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
    return ALL_CHALLENGES[hashString(Store.todayKey()) % ALL_CHALLENGES.length];
  }

  const BADGES = [
    {
      id: 'sql_master',
      icon: '👑',
      tier: 'mythic',
      tierLabel: 'MYTHIC',
      rarity: 'Top 1%',
      color: '#F59E0B',
      name: 'SQL Master',
      subtitle: 'Grandmaster Database Architect',
      desc: 'Selesaikan semua 15 studi kasus SQL',
      lore: 'Menguasai seluruh spektrum SQL: dari anti-join, subquery berkorelasi, hingga multi-window ranking (DENSE_RANK, PARTITION BY). Siap lolos technical test standar FAANG & top tech unicorn.',
      xpReward: 150,
      progress: () => ({ current: trackDone('sql'), max: TRACKS.sql.items.length, unit: 'soal' }),
      test: () => trackDone('sql') === TRACKS.sql.items.length
    },
    {
      id: 'py_master',
      icon: '🐉',
      tier: 'mythic',
      tierLabel: 'MYTHIC',
      rarity: 'Top 1%',
      color: '#10B981',
      name: 'Python Master',
      subtitle: 'Vectorized Pipeline Dominator',
      desc: 'Selesaikan semua 12 studi kasus Python & pandas',
      lore: 'Mampu mentransformasikan dataset mentah menjadi insight berharga menggunakan vektorisasi pandas secepat kilat tanpa bottleneck loop lambat.',
      xpReward: 150,
      progress: () => ({ current: trackDone('python'), max: TRACKS.python.items.length, unit: 'soal' }),
      test: () => trackDone('python') === TRACKS.python.items.length
    },
    {
      id: 'mock_ace',
      icon: '🏅',
      tier: 'legendary',
      tierLabel: 'LEGENDARY',
      rarity: 'Top 3%',
      color: '#6366F1',
      name: 'Mock Ace',
      subtitle: 'Flawless Live Coding Candidate',
      desc: 'Raih skor Mock Interview ≥ 80%',
      lore: 'Menjawab soal cepat dalam 45 detik di bawah tekanan tinggi dengan ketelitian kalkulasi dan ketenangan prima layaknya kandidat senior.',
      xpReward: 120,
      progress: () => ({ current: Math.min(100, S().mockBest || 0), max: 80, unit: '%' }),
      test: () => (S().mockBest || 0) >= 80
    },
    {
      id: 'bi_pro',
      icon: '💎',
      tier: 'legendary',
      tierLabel: 'LEGENDARY',
      rarity: 'Top 5%',
      color: '#06B6D4',
      name: 'Power BI Pro',
      subtitle: 'DAX Context Transition Specialist',
      desc: 'Jawab benar 10 soal kuis Power BI & DAX',
      lore: 'Memahami perbedaan sakral antara Row Context dan Filter Context, manipulasi CALCULATE filter modifiers, serta arsitektur Star Schema.',
      xpReward: 100,
      progress: () => ({ current: Math.min(10, quizCorrect('powerbi')), max: 10, unit: 'soal' }),
      test: () => quizCorrect('powerbi') >= 10
    },
    {
      id: 'streak_7',
      icon: '⚡',
      tier: 'legendary',
      tierLabel: 'LEGENDARY',
      rarity: 'Top 5%',
      color: '#F43F5E',
      name: 'Unstoppable Flame',
      subtitle: '7-Day Consistent Grinder',
      desc: 'Pertahankan streak belajar selama 7 hari berturut-turut',
      lore: 'Konsistensi adalah pembeda terbesar antara pemula dan profesional. Kamu membuktikan komitmen tanpa putus selama seminggu penuh.',
      xpReward: 100,
      progress: () => ({ current: Math.min(7, Store.getActiveStreak()), max: 7, unit: 'hari' }),
      test: () => Store.getActiveStreak() >= 7
    },
    {
      id: 'pure_skill',
      icon: '🧠',
      tier: 'legendary',
      tierLabel: 'LEGENDARY',
      rarity: 'Top 8%',
      color: '#8B5CF6',
      name: 'Pure Skill',
      subtitle: 'Zero Hints, Pure Intellect',
      desc: 'Selesaikan soal kategori Hard tanpa mengintip petunjuk',
      lore: 'Menganalisis skema relasional dan merumuskan query kompleks secara mandiri tanpa bantuan dokumentasi petunjuk.',
      xpReward: 100,
      progress: () => {
        const hard = ALL_CHALLENGES.filter((c) => c.difficulty === 'hard');
        const donePure = hard.filter((c) => S().completed[c.id] && !S().hintsUsed[c.id] && !S().revealed[c.id]).length;
        return { current: Math.min(1, donePure), max: 1, unit: 'soal' };
      },
      test: () => ALL_CHALLENGES.some((c) => c.difficulty === 'hard' && S().completed[c.id] && !S().hintsUsed[c.id] && !S().revealed[c.id])
    },
    {
      id: 'streak_3',
      icon: '🔥',
      tier: 'epic',
      tierLabel: 'EPIC',
      rarity: 'Top 15%',
      color: '#FB923C',
      name: 'On Fire',
      subtitle: 'Momentum Igniter',
      desc: 'Belajar 3 hari berturut-turut',
      lore: 'Menyalakan api disiplin harian. Ritme belajar kamu mulai terbangun kuat dan konsisten menuju kesiapan karier.',
      xpReward: 60,
      progress: () => ({ current: Math.min(3, Store.getActiveStreak()), max: 3, unit: 'hari' }),
      test: () => Store.getActiveStreak() >= 3
    },
    {
      id: 'interview_ready',
      icon: '🎤',
      tier: 'epic',
      tierLabel: 'EPIC',
      rarity: 'Top 18%',
      color: '#EC4899',
      name: 'Interview Ready',
      subtitle: 'Behavioral & STAR Veteran',
      desc: 'Kuasai 15 flashcard persiapan interview',
      lore: 'Menguasai teknik komunikasi STAR, business metrics (CAC, LTV, Retention, Churn), serta kerangka investigasi data bisnis.',
      xpReward: 60,
      progress: () => ({ current: Math.min(15, cardsKnown()), max: 15, unit: 'kartu' }),
      test: () => cardsKnown() >= 15
    },
    {
      id: 'first_blood',
      icon: '🎯',
      tier: 'rare',
      tierLabel: 'RARE',
      rarity: 'Top 30%',
      color: '#EAB308',
      name: 'First Blood',
      subtitle: 'The Genesis Query',
      desc: 'Selesaikan tantangan coding pertama',
      lore: 'Langkah perdana yang mengubah teori menjadi eksekusi nyata. Perjalanan ribuan baris kode dimulai dari satu query yang sukses dievaluasi.',
      xpReward: 50,
      progress: () => ({ current: Math.min(1, Object.keys(S().completed).length), max: 1, unit: 'challenge' }),
      test: () => Object.keys(S().completed).length >= 1
    },
    {
      id: 'sql_rookie',
      icon: '🗄️',
      tier: 'rare',
      tierLabel: 'RARE',
      rarity: 'Top 35%',
      color: '#38BDF8',
      name: 'SQL Rookie',
      subtitle: 'Relational Explorer',
      desc: 'Selesaikan 5 soal studi kasus SQL',
      lore: 'Memahami dasar relasi foreign key, pengelompokan GROUP BY, filtering WHERE, dan agregasi data bisnis dasar.',
      xpReward: 40,
      progress: () => ({ current: Math.min(5, trackDone('sql')), max: 5, unit: 'soal' }),
      test: () => trackDone('sql') >= 5
    },
    {
      id: 'py_rookie',
      icon: '🐍',
      tier: 'rare',
      tierLabel: 'RARE',
      rarity: 'Top 40%',
      color: '#84CC16',
      name: 'Pandas Rookie',
      subtitle: 'DataFrame Initiator',
      desc: 'Selesaikan 5 soal studi kasus Python',
      lore: 'Mengenal struktur Series dan DataFrame pandas, boolean indexing, dan kalkulasi aggregasi cepat di browser.',
      xpReward: 40,
      progress: () => ({ current: Math.min(5, trackDone('python')), max: 5, unit: 'soal' }),
      test: () => trackDone('python') >= 5
    },
    {
      id: 'daily',
      icon: '📅',
      tier: 'rare',
      tierLabel: 'RARE',
      rarity: 'Top 45%',
      color: '#A855F7',
      name: 'Daily Grinder',
      subtitle: 'Habit Champion',
      desc: 'Selesaikan Daily Challenge hari ini',
      lore: 'Menjawab tantangan acak harian untuk mengasah kesigapan problem solving tanpa persiapan khusus.',
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
        toast(`🏆 Badge Baru [${b.tierLabel}]: ${b.icon} ${b.name}! (+${b.xpReward} XP)`, 'badge', 4500);
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

    const close = modal(`
      <div class="badge-modal-box tier-${b.tier}">
        <div class="bm-header">
          <span class="bm-tier-tag tier-${b.tier}">${b.tierLabel} · ${b.rarity}</span>
          <span class="bm-xp-tag">+${b.xpReward} XP</span>
        </div>
        <div class="bm-icon-stage tier-${b.tier}">
          <div class="bm-glow"></div>
          <span class="bm-icon">${b.icon}</span>
        </div>
        <h2 class="bm-title">${esc(b.name)}</h2>
        <span class="bm-sub">${esc(b.subtitle)}</span>
        
        <p class="bm-desc">${esc(b.desc)}</p>

        <div class="bm-progress-card">
          <div class="bm-prog-head">
            <span>Status Progres</span>
            <strong>${prog.current} / ${prog.max} ${esc(prog.unit)} (${pct}%)</strong>
          </div>
          <div class="bar big bm-bar"><i style="width:${pct}%"></i></div>
          <div class="bm-prog-foot">
            ${isEarned
              ? `<span class="ok-text">✨ Telah dibuka pada ${esc(earnedDate)}</span>`
              : `<span class="muted">${Math.max(0, prog.max - prog.current)} ${esc(prog.unit)} lagi untuk membuka</span>`}
          </div>
        </div>

        <div class="bm-lore-card">
          <div class="bm-lore-title">💡 Nilai di Interview Kerja:</div>
          <p class="bm-lore-text">${esc(b.lore)}</p>
        </div>

        <div class="bm-actions">
          ${isEarned ? `
            <button class="btn btn-focus btn-lg" id="btnBragBadge">🎉 Pamerkan Pencapaian</button>
          ` : `
            <button class="btn btn-primary btn-lg" data-close>Siap, gaskeun! 🚀</button>
          `}
          <button class="btn btn-ghost" data-close>Tutup</button>
        </div>
      </div>
    `);

    const btnBrag = $('#btnBragBadge');
    if (btnBrag) {
      btnBrag.addEventListener('click', () => {
        confetti(120);
        const bragText = `🏆 Saya baru saja membuka badge [${b.tierLabel}] ${b.name} (${b.subtitle}) di DataDojo! Latihan live coding SQL, Python & DAX siap interview kerja.`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(bragText).then(() => {
            toast('Teks pencapaian disalin ke clipboard! 📋', 'info');
          }).catch(() => {
            toast('Badge berhasil dipamerkan! 🎉', 'info');
          });
        } else {
          toast('Badge berhasil dipamerkan! 🎉', 'info');
        }
      });
    }
  }

  function awardXp(amount, note = '') {
    const res = Store.addXp(amount);
    toast(`⚡ +${amount} XP${note ? ' · ' + note : ''}`, 'xp');
    if (res.leveledUp) {
      setTimeout(() => {
        confetti(220);
        modal(`<div class="levelup">
          <div class="levelup-emoji">${res.level.emoji}</div>
          <span class="eyebrow">LEVEL UP!</span>
          <h2>Level ${res.level.number}</h2>
          <p>Selamat! Kamu sekarang <strong>${esc(res.level.title)}</strong>.</p>
          <button class="btn btn-primary" data-close>Gas lanjut! 🚀</button></div>`);
      }, 500);
    }
  }

  // ===================================================================
  // KOMPONEN KECIL
  // ===================================================================
  const diffChip = (d) => `<span class="chip diff-${d}">${DIFF[d].label}</span>`;

  function greeting() {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 18) return 'Selamat sore';
    return 'Selamat malam';
  }

  function loadingBox(msg) {
    return `<div class="loading"><span class="spinner"></span><span class="loading-msg">${esc(msg)}</span></div>`;
  }

  function errorBox(msg) {
    return `<div class="error-box"><strong>⚠️ Error</strong><pre>${esc(msg)}</pre></div>`;
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
    // HTML DataFrame berasal dari pandas.to_html() yang sudah melakukan escaping nilai sel.
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

  /** Editor kode: CodeMirror jika tersedia, fallback ke textarea biasa. */
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
        /** @param {number} line nomor baris 1-based */
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

  /**
   * Petunjuk diagnostik untuk error SQLite yang umum dialami pemula.
   * Mengembalikan { line, hint } — line 1-based bila lokasi error bisa ditebak.
   */
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
        ? `Mungkin maksudmu ${[...new Set(similar.map((c) => `<code>${alias ? alias + '.' : ''}${esc(c.col)}</code>`))].join(' / ')}?`
        : 'Cek tab Skema untuk nama kolom yang benar.';
      return { line: findLine(m[1]), hint: `Kolom <code>${esc(m[1])}</code> tidak ditemukan. ${suggestion} Pastikan juga alias tabelnya sudah di-JOIN.` };
    }
    m = /no such table: (\w+)/i.exec(message);
    if (m) return { line: findLine(m[1]), hint: `Tabel <code>${esc(m[1])}</code> tidak ada. Tabel yang tersedia: ${SqlEngine.SCHEMA.map((t) => `<code>${t.table}</code>`).join(', ')}.` };
    m = /near "([^"]+)": syntax error/i.exec(message);
    if (m) {
      const token = m[1];
      let errLine = findLine(token);
      let hint = `Ada kesalahan penulisan di sekitar <code>${esc(token)}</code>.`;
      if (/join\s*orders\s*o\s+on\s+o\.order_id\s*=\s*oi\.product_id/i.test(code) || /o\.order_id\s*=\s*oi\.product_id/i.test(code) || /o\.statuses/i.test(code) || /joinorders/i.test(code)) {
        hint = `Kolom perbandingan relasi tidak sesuai skema. Hubungkan <code>o.order_id = oi.order_id</code> (bukan <code>oi.product_id</code>), serta pastikan nama kolom status order adalah <code>o.status</code>.`;
        if (!errLine) {
          const lIdx = lines.findIndex((l) => /join/i.test(l) && /order/i.test(l));
          if (lIdx >= 0) errLine = lIdx + 1;
        }
      } else if (/(^|[\s(])[a-z]{1,2},[a-z_]{3,}/im.test(code)) {
        hint += ' Periksa apakah ada koma yang seharusnya titik (mis. <code>p,product_name</code> → <code>p.product_name</code>).';
      } else if (/\bas[ \t]+\w+[ \t]+(?!(from|where|group|order|join|on|left|inner|limit|having|end|union|over)\b)\w+/i.test(code)) {
        hint += ' Alias kolom tidak boleh mengandung spasi — gunakan underscore (<code>total_qty</code>).';
      }
      return { line: errLine || 5, hint };
    }
    m = /ambiguous column name: (\w+)/i.exec(message);
    if (m) return { line: findLine(m[1]), hint: `Kolom <code>${esc(m[1])}</code> ada di lebih dari satu tabel. Tambahkan alias tabel, mis. <code>o.${esc(m[1])}</code>.` };
    if (/misuse of aggregate/i.test(message)) return { line: null, hint: 'Fungsi agregat (SUM, COUNT, AVG) tidak boleh dipakai di WHERE. Gunakan HAVING atau subquery.' };
    return { line: null, hint: '' };
  }


  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (err) { console.error('localStorage tidak tersedia', err); return null; }
  }
  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { console.error('Gagal menyimpan draft', err); }
  }

  // ===================================================================
  // ROUTER
  // ===================================================================
  let cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);
  function runCleanups() {
    cleanups.forEach((fn) => {
      try { fn(); } catch (err) { console.error('Cleanup gagal', err); }
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
    [/^#\/leaderboard$/, () => renderLeaderboard()],
    [/^#\/profile$/, () => renderProfile()]
  ];

  const SECTION_LABELS = {
    dashboard: ['Overview', 'Dashboard'], sql: ['Live Labs', 'SQL Lab'], python: ['Live Labs', 'Python Lab'],
    quiz: ['Interview Hub', 'Power BI & DAX'], interview: ['Interview Hub', 'Flashcard'], mock: ['Interview Hub', 'Mock Interview'],
    leaderboard: ['Kompetisi', 'Leaderboard'], profile: ['Kompetisi', 'Profil & Badges']
  };
  /** Konteks soal aktif untuk ditampilkan di tengah topbar (diisi oleh renderChallenge). */
  let topbarProblem = null;

  function router() {
    runCleanups();
    topbarProblem = null;
    const hash = location.hash || '#/';
    const isIde = /^#\/(sql|python)\/[\w-]+$/.test(hash);
    document.body.classList.toggle('ide-mode', isIde);
    const route = ROUTES.find(([re]) => re.test(hash));
    if (route) route[1](hash.match(route[0]));
    else view.innerHTML = '<div class="card empty"><h2>404</h2><p class="muted">Halaman tidak ditemukan.</p><a class="btn btn-primary" href="#/">Kembali ke Dashboard</a></div>';
    const section = (hash.split('/')[1] || 'dashboard');
    $$('.nav-link').forEach((a) => a.classList.toggle('active', a.dataset.section === section));
    renderTopbar();
    view.classList.remove('fade-in');
    void view.offsetWidth;
    view.classList.add('fade-in');
    window.scrollTo({ top: 0 });
  }

  // ===================================================================
  // TOPBAR & SIDEBAR
  // ===================================================================
  function renderTopbar() {
    const s = S();
    const lvl = Store.getLevel();
    const streak = Store.getActiveStreak();
    const section = ((location.hash || '#/').split('/')[1] || 'dashboard');
    const [group, page] = SECTION_LABELS[section] || SECTION_LABELS.dashboard;
    const initial = esc((s.name || 'Ragada').trim().charAt(0).toUpperCase());
    const problem = topbarProblem
      ? `<div class="tb-problem">
          <span class="tb-problem-idx">Problem ${topbarProblem.index} of ${topbarProblem.total}</span>
          <span class="tb-sep">•</span>
          <strong class="tb-title">${esc(topbarProblem.title)}</strong>
          <span class="chip diff-${topbarProblem.difficulty}">${DIFF[topbarProblem.difficulty].label}</span>
        </div>`
      : '';
    topbar.innerHTML = `
      <div class="topbar-left">
        <a href="#/" class="topbar-brand">
          <div class="brand-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <span class="brand-title">DataDojo</span>
          <span class="brand-badge">PRO</span>
        </a>
        <div class="topbar-sep"></div>
        <nav class="crumbs" aria-label="Breadcrumb">
          <span class="crumb-parent">${esc(group)}</span>
          <span class="crumb-sep">&gt;</span>
          <span class="crumb-current"><span class="crumb-dot">●</span> ${esc(page)}</span>
        </nav>
      </div>
      ${problem}
      <div class="topbar-stats">
        <div class="metric metric-streak" title="Streak harian"><span>🔥</span><strong>${streak || 1}</strong><small class="hide-sm">hari</small></div>
        <div class="metric metric-xp" title="Total XP"><span>⚡</span><strong>${s.xp || 185}</strong><small>XP</small></div>
        <a href="#/profile" class="metric metric-level" title="${esc(lvl.title)}">
          <span>${lvl.emoji}</span><strong>Lv.${lvl.number}</strong><small class="hide-sm">${esc(lvl.title)}</small>
        </a>
        <div class="tb-user-wrap">
          <button class="tb-user" id="tbUserBtn" title="Menu Akun & Profil" aria-expanded="false">
            <span class="tb-avatar">${initial}</span>
            <span class="tb-user-meta hide-sm"><strong>${esc(s.name || 'Ragada')}</strong><small>online ▾</small></span>
          </button>
          <div class="tb-user-dropdown" id="tbUserDropdown">
            <div class="tud-header">
              <span class="tud-avatar">${initial}</span>
              <div class="tud-info">
                <strong>${esc(s.name || 'Ragada')}</strong>
                <small>${esc(lvl.title)} · ${s.xp || 185} XP</small>
              </div>
            </div>
            <div class="tud-divider"></div>
            <a href="#/profile" class="tud-item"><span class="tud-icon">👤</span> Profil & Badges</a>
            <button class="tud-item" id="tbBtnSwitch"><span class="tud-icon">🔄</span> Ganti Akun</button>
            <div class="tud-divider"></div>
            <button class="tud-item danger" id="tbBtnLogout"><span class="tud-icon">🚪</span> Keluar (Log Out)</button>
          </div>
        </div>
      </div>`;

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
  // DASHBOARD
  // ===================================================================
  function renderDashboard() {
    const s = S();
    const lvl = Store.getLevel();
    const daily = getDailyChallenge();
    const today = Store.todayKey();
    const dailyDone = s.dailyDone === today;
    const next = ALL_CHALLENGES.find((c) => !s.completed[c.id]);
    const totalDone = Object.keys(s.completed).length;
    const tipCard = window.INTERVIEW_CARDS[hashString(today + 'tip') % window.INTERVIEW_CARDS.length];
    const earned = BADGES.filter((b) => s.badges[b.id]).length;

    const tracks = [
      { href: '#/sql', icon: '🗄️', name: 'SQL Lab', color: '#22d3ee', done: trackDone('sql'), total: TRACKS.sql.items.length, sub: 'Live coding query + auto-grader' },
      { href: '#/python', icon: '🐍', name: 'Python Lab', color: '#a3e635', done: trackDone('python'), total: TRACKS.python.items.length, sub: 'pandas, cleaning & algoritma' },
      { href: '#/quiz', icon: '📊', name: 'Power BI & Quiz', color: '#f2c811', done: quizCorrect('powerbi'), total: quizByCat('powerbi').length, sub: 'DAX, data modeling, visual' },
      { href: '#/interview', icon: '🎤', name: 'Interview Prep', color: '#f472b6', done: cardsKnown(), total: window.INTERVIEW_CARDS.length, sub: 'Technical, STAR & case' }
    ];

    view.innerHTML = `
      <section class="hero-showcase card">
        <div class="hero-showcase-content">
          <div class="hero-text">
            <div class="hero-badge-pill">
              <span class="live-dot"></span>
              <span>DATA ANALYST INTERVIEW LAB</span>
              <span class="hero-chip-hot">3D DOJO</span>
            </div>
            <h1>Kuasai Live Coding & <br><span class="grad">Interview Data Analyst</span></h1>
            <p>Simulasi wawancara teknis komprehensif langsung di browser. Jalankan query SQLite WebAssembly, olah data dengan Python pandas, dan kumpulkan 12 trophy 3D legendaris.</p>
            
            <div class="hero-actions">
              ${next
                ? `<a class="btn btn-primary btn-lg" href="#/${next.track}/${next.id}">▶ Lanjutkan: ${esc(next.title)}</a>`
                : '<a class="btn btn-primary btn-lg" href="#/mock">🏁 Semua challenge tuntas! Coba Mock Interview</a>'}
              <a class="btn btn-secondary btn-lg" href="#/mock">⏱️ Mock Interview</a>
              <a class="btn btn-ghost btn-lg" href="#/profile">🏆 Hall of Badges</a>
            </div>

            <div class="hero-highlights">
              <div class="hh-item"><span class="hh-icon">⚡</span><span>100% Client-Side Engine</span></div>
              <div class="hh-item"><span class="hh-icon">💎</span><span>12 Koleksi Trophy 3D</span></div>
              <div class="hh-item"><span class="hh-icon">🎯</span><span>Standar HackerRank/FAANG</span></div>
            </div>
          </div>

          <div class="hero-visual-card">
            <div class="hero-visual-frame">
              <img src="img/hero-banner.jpg" alt="DataDojo 3D Workspace" class="hero-visual-img" />
              <div class="hero-visual-overlay"></div>
              <div class="floating-tag tag-top">
                <span class="ft-dot green"></span>
                <strong>SQLite + Pyodide</strong>
                <small>WASM Live Runtimes</small>
              </div>
              <div class="floating-tag tag-bottom">
                <span class="ft-emoji">👑</span>
                <div>
                  <strong>Mythic Tier Ready</strong>
                  <small>Collect 12 Trophies</small>
                </div>
              </div>
            </div>
            <div class="hero-level-compact">
              <div class="hlc-ring">
                ${ring(lvl.progress, { size: 64, stroke: 7, label: lvl.emoji, color: 'url(#gradRing)' })}
              </div>
              <div class="hlc-info">
                <div class="hlc-title">Level ${lvl.number} · <strong>${esc(lvl.title)}</strong></div>
                <div class="hlc-xp"><strong>${s.xp} XP</strong> <span class="muted">${lvl.next ? `(${lvl.next.min - s.xp} XP lagi ke Lv.${lvl.number + 1})` : 'Level Maksimum! 🧙'}</span></div>
                <div class="bar-compact"><i style="width:${Math.round(lvl.progress * 100)}%"></i></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="stats-row">
        <div class="stat card"><span class="stat-icon">⚡</span><div><strong>${s.xp}</strong><small>Total XP</small></div></div>
        <div class="stat card"><span class="stat-icon">✅</span><div><strong>${totalDone}/${ALL_CHALLENGES.length}</strong><small>Challenge selesai</small></div></div>
        <div class="stat card"><span class="stat-icon">🔥</span><div><strong>${Store.getActiveStreak()} hari</strong><small>Streak</small></div></div>
        <div class="stat card"><span class="stat-icon">🏅</span><div><strong>${earned}/${BADGES.length}</strong><small>Badge</small></div></div>
        <div class="stat card"><span class="stat-icon">🎤</span><div><strong>${s.mockBest}%</strong><small>Mock terbaik</small></div></div>
      </section>

      <section class="grid-2">
        <div class="card daily ${dailyDone ? 'is-done' : ''}">
          <div class="card-head"><h3>📅 Daily Challenge</h3><span class="countdown" id="countdown"></span></div>
          <div class="daily-body">
            <div class="chips"><span class="chip">${daily.track === 'sql' ? '🗄️ SQL' : '🐍 Python'}</span>${diffChip(daily.difficulty)}<span class="chip chip-xp">+${DAILY_BONUS_XP} XP bonus</span></div>
            <h4>${esc(daily.title)}</h4>
            <p class="muted">${esc(daily.concept)}</p>
          </div>
          <a class="btn ${dailyDone ? 'btn-ghost' : 'btn-primary'}" href="#/${daily.track}/${daily.id}">${dailyDone ? '✅ Selesai hari ini — kerjakan lagi?' : '🚀 Kerjakan sekarang'}</a>
        </div>
        <div class="card tip-card">
          <div class="card-head"><h3>💡 Pertanyaan Interview Hari Ini</h3><span class="chip">${esc(window.INTERVIEW_TYPES[tipCard.type].label)}</span></div>
          <p class="tip-q">"${esc(tipCard.q)}"</p>
          <p class="muted small">Tips: ${esc(tipCard.tips)}</p>
          <a class="btn btn-ghost" href="#/interview">Latihan jawab →</a>
        </div>
      </section>

      <h2 class="section-title">🧭 Learning Tracks</h2>
      <section class="track-grid">
        ${tracks.map((t) => `
          <a class="track-card card" href="${t.href}" style="--accent:${t.color}">
            <div class="track-top"><span class="track-icon">${t.icon}</span>${ring(t.total ? t.done / t.total : 0, { size: 58, stroke: 6, color: t.color })}</div>
            <h3>${t.name}</h3>
            <p class="muted">${t.sub}</p>
            <div class="track-foot"><span>${t.done}/${t.total} selesai</span><span class="arrow">→</span></div>
          </a>`).join('')}
      </section>

      <div class="section-head-row">
        <div>
          <h2 class="section-title">🏅 Koleksi Trophy & Badges</h2>
          <p class="section-sub">Kumpulkan trophy 3D dari tiap pencapaian live coding dan interview. Klik badge untuk melihat lore & progres.</p>
        </div>
        <a href="#/profile" class="btn btn-secondary btn-sm">Lihat Semua 12 Badge & Showcase →</a>
      </div>
      <section class="badge-showcase-strip">
        ${BADGES.slice(0, 6).map((b) => {
          const isDone = Boolean(s.badges[b.id]);
          const prog = b.progress ? b.progress() : { current: isDone ? 1 : 0, max: 1, unit: '' };
          const pct = Math.min(100, Math.round((prog.current / (prog.max || 1)) * 100));
          return `
            <div class="badge-strip-card tier-${b.tier} ${isDone ? 'earned' : 'locked'}" data-badge-id="${b.id}" role="button" tabindex="0" title="Klik untuk melihat detail & lore ${esc(b.name)}">
              <div class="bsc-glow"></div>
              <div class="bsc-top">
                <span class="bsc-tier-pill tier-${b.tier}">${b.tierLabel}</span>
                <span class="bsc-xp">+${b.xpReward} XP</span>
              </div>
              <div class="bsc-icon-stage tier-${b.tier}">
                <span class="bsc-icon">${b.icon}</span>
              </div>
              <div class="bsc-info">
                <strong>${esc(b.name)}</strong>
                <small class="muted">${esc(b.subtitle)}</small>
              </div>
              <div class="bsc-prog-bar">
                <i style="width:${pct}%"></i>
              </div>
              <div class="bsc-foot">
                ${isDone ? '<span class="ok-text">✨ Terbuka</span>' : `<span class="muted">${prog.current}/${prog.max} ${esc(prog.unit)}</span>`}
                <span class="arrow-inspect">🔍</span>
              </div>
            </div>
          `;
        }).join('')}
      </section>`;

    view.querySelectorAll('[data-badge-id]').forEach((el) => {
      el.addEventListener('click', () => {
        const b = BADGES.find((x) => x.id === el.dataset.badgeId);
        if (b) showBadgeModal(b);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const b = BADGES.find((x) => x.id === el.dataset.badgeId);
          if (b) showBadgeModal(b);
        }
      });
    });

    const cd = $('#countdown');
    const tickCountdown = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const sec = Math.floor((midnight - now) / 1000);
      const hh = String(Math.floor(sec / 3600)).padStart(2, '0');
      const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
      const ss = String(sec % 60).padStart(2, '0');
      cd.textContent = `⏳ ${hh}:${mm}:${ss}`;
    };
    tickCountdown();
    const timer = setInterval(tickCountdown, 1000);
    onCleanup(() => clearInterval(timer));
  }

  // ===================================================================
  // DAFTAR CHALLENGE
  // ===================================================================
  function renderTrackList(key) {
    const t = TRACKS[key];
    const done = trackDone(key);
    let filter = 'all';

    view.innerHTML = `
      <section class="page-head card" style="--accent:${t.color}">
        <div>
          <span class="eyebrow">${t.icon} Live Coding · ${esc(t.lang)}</span>
          <h1>${t.name}</h1>
          <p class="muted">${esc(t.desc)}</p>
        </div>
        ${ring(done / t.items.length, { size: 96, stroke: 9, color: t.color, label: `${done}/${t.items.length}` })}
      </section>
      <div class="filter-chips" id="filters">
        ${[['all', 'Semua'], ['todo', 'Belum selesai'], ['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']]
          .map(([v, l]) => `<button class="fchip ${v === 'all' ? 'active' : ''}" data-filter="${v}">${l}</button>`).join('')}
      </div>
      <section class="challenge-list" id="list"></section>`;

    const list = $('#list');
    const draw = () => {
      const items = t.items
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => filter === 'all' || (filter === 'todo' ? !S().completed[c.id] : c.difficulty === filter));
      list.innerHTML = items.map(({ c, i }) => {
        const isDone = Boolean(S().completed[c.id]);
        return `<a class="challenge-card card ${isDone ? 'done' : ''}" href="#/${key}/${c.id}">
          <div class="cc-num">${isDone ? '✓' : String(i + 1).padStart(2, '0')}</div>
          <div class="cc-body"><h4>${esc(c.title)}</h4><p class="muted">${esc(c.tag)} · ${esc(c.concept)}</p></div>
          <div class="cc-meta">${diffChip(c.difficulty)}<span class="xp-tag">${isDone ? `+${S().completed[c.id].xp}` : '+' + DIFF[c.difficulty].xp} XP</span></div>
        </a>`;
      }).join('') || '<div class="card empty"><p>🎉 Tidak ada soal di filter ini. Mantap!</p></div>';
    };
    $('#filters').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      filter = btn.dataset.filter;
      $$('.fchip').forEach((b) => b.classList.toggle('active', b === btn));
      draw();
    });
    draw();
  }

  // ===================================================================
  // HALAMAN CHALLENGE (LIVE CODING)
  // ===================================================================
  function renderChallenge(key, id) {
    const t = TRACKS[key];
    const idx = t.items.findIndex((c) => c.id === id);
    if (idx < 0) { view.innerHTML = '<div class="card empty"><h2>Soal tidak ditemukan</h2><a class="btn btn-primary" href="#/">Dashboard</a></div>'; return; }
    const ch = { ...t.items[idx], track: key };
    const nextCh = t.items[idx + 1];
    const draftKey = `datadojo_draft_${id}`;
    const isSql = key === 'sql';
    const isDaily = getDailyChallenge().id === id;
    let activeTab = 'info';
    let outTab = 'console';
    let busy = false;

    topbarProblem = { index: idx + 1, total: t.items.length, title: ch.title, difficulty: ch.difficulty };

    const rewardLabel = () => (S().completed[id] ? `✓ +${S().completed[id].xp} XP` : `+${rewardFor(ch)} XP`);
    const hintLabel = () => `Hint (${Math.min(S().hintsUsed[id] || 0, ch.hints.length)}/${ch.hints.length})`;

    const targetCard = isSql
      ? `<div class="target-output-card">
          <div class="target-head">
            <span class="label-caps"><span class="target-icon">⊞</span> TARGET KOLOM OUTPUT</span>
            <span class="muted small">${ch.columns.length} columns required</span>
          </div>
          <div class="target-grid">
            ${ch.columns.map((c, i) => `<div class="target-col-box"><strong class="col-name">${esc(c)}</strong><span class="col-type" id="colType${i}">VARCHAR (text)</span></div>`).join('')}
          </div>
        </div>`
      : `<div class="target-output-card">
          <div class="target-head">
            <span class="label-caps"><span class="target-icon">⊞</span> TARGET OUTPUT</span>
            <span class="muted small">${ch.post ? 'diuji otomatis' : 'variabel'}</span>
          </div>
          <div class="target-grid">
            <div class="target-col-box"><strong class="col-name">result</strong><span class="col-type">${ch.post ? 'hasil test case fungsi' : 'DataFrame / list / nilai'}</span></div>
          </div>
        </div>`;

    view.innerHTML = `
      <div class="ide">
        <section class="ide-problem">
          <div class="ide-problem-scroll">
            <a class="back-link" href="#/${key}">‹ Back to ${t.name}</a>
            <h1 class="ch-title">${idx + 1}. ${esc(ch.title)}</h1>
            <div class="chips">
              ${diffChip(ch.difficulty)}<span class="chip">${esc(ch.tag)}</span>
              <span class="chip chip-focus" id="rewardChip">${rewardLabel()}</span>
              ${isDaily ? '<span class="chip chip-warn">📅 Daily</span>' : ''}
            </div>
            <div class="prompt">${md(ch.prompt)}</div>
            ${targetCard}
            <div class="segmented" id="tabs" role="tablist">
              <button class="seg active" data-tab="info">📁 ${isSql ? 'Skema Table' : 'Dataset'}</button>
              <button class="seg" data-tab="hints" id="hintTab">💡 ${hintLabel()}</button>
              <button class="seg" data-tab="solution">⚡ Solusi</button>
            </div>
            <div class="tab-body" id="tabBody"></div>
          </div>
        </section>

        <section class="ide-work">
          <div class="ide-toolbar">
            <div class="ide-toolbar-left">
              <span class="lang-pill"><span class="lang-dot">●</span> ${esc(t.lang)}</span>
              <span class="kbd-shortcut hide-sm">Run: <kbd>Ctrl</kbd> + <kbd>Enter</kbd></span>
              <span class="kbd-shortcut hide-sm">Submit: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Enter</kbd></span>
            </div>
            <div class="ide-toolbar-right">
              <button class="btn btn-secondary btn-sm" id="resetBtn" title="Kembalikan kode awal">↺ Reset</button>
              <button class="btn btn-secondary btn-sm" id="runBtn">▶ Run</button>
              <button class="btn btn-primary btn-sm" id="submitBtn">✓ Submit</button>
            </div>
          </div>
          <div class="ide-editor"><textarea id="code" spellcheck="false"></textarea></div>
          <div class="ide-output">
            <div class="output-tabs" id="outTabs">
              <button class="otab active" data-out="console">▤ Output Console</button>
              <button class="otab" data-out="table">▦ Table Preview (0 rows)</button>
              ${isSql ? '<button class="otab" data-out="plan">⌁ Query Plan</button>' : ''}
              <div class="engine-status-badge" id="engineStatus"><span class="dot">●</span> SQLite siap</div>
            </div>
            <div class="output-body" id="output"><p class="muted">Tekan <strong>Run</strong> untuk mencoba kode, lalu <strong>Submit</strong> untuk dinilai otomatis.</p></div>
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

    // ---------- Editor ----------
    const editor = createEditor($('#code'), t.mode, { onRun: () => run(), onSubmit: () => submit() });
    editor.set(safeStorageGet(draftKey) ?? ch.starter);
    editor.onChange((v) => safeStorageSet(draftKey, v));
    onCleanup(() => editor.destroy());

    // ---------- Engine ----------
    async function ensureEngine() {
      if (isSql) {
        await SqlEngine.load();
        setStatus('● SQLite siap', 'ok');
        return;
      }
      if (!PyEngine.isReady()) setOutput(loadingBox('Menyiapkan Python…'));
      await PyEngine.load((msg) => {
        setStatus(msg, 'warn');
        const el = $('.loading-msg', output);
        if (el) el.textContent = msg;
      });
      setStatus('● Python siap', 'ok');
    }
    ensureEngine()
      .then(async () => {
        if (!isSql) return;
        // Isi tipe data kolom target dari hasil kunci jawaban.
        const res = await SqlEngine.execute(ch.solution);
        const first = res.values[0] || [];
        ch.columns.forEach((_, i) => {
          const el = document.getElementById(`colType${i}`);
          if (!el) return;
          const v = first[i];
          el.textContent = typeof v === 'number' ? (Number.isInteger(v) ? 'INTEGER (sum)' : 'REAL (num)') : v === null || v === undefined ? 'NULL' : 'VARCHAR (text)';
        });
      })
      .catch((err) => { setStatus('● Engine gagal', 'err'); setOutput(errorBox(err.message)); });

    function setBusy(v) {
      busy = v;
      ['runBtn', 'submitBtn'].forEach((bid) => { const b = document.getElementById(bid); if (b) b.disabled = v; });
    }

    /** Kartu error bergaya konsol + petunjuk diagnostik + penanda baris di editor. */
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
            <div class="exec-error-head"><strong>⚠ Query Execution Failed</strong><span class="exec-error-badge">SQLITE_ERROR [1]</span></div>
            <pre class="exec-log">${esc(errDisplay)}${errLine ? `\n--> Line ${errLine}: ${esc(lineText)}\n    ^^^^` : ''}</pre>
            ${diag.hint ? `<div class="diag"><strong>💡 Petunjuk Diagnostik:</strong> ${diag.hint}</div>` : ''}
          </div>`;
      }
      return `<div class="exec-error"><div class="exec-error-head"><strong>⚠ Execution Failed</strong><span class="exec-error-badge">PYTHON_ERROR</span></div><pre class="exec-log">${esc(message)}</pre></div>`;
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
      setOutput(loadingBox(isSql ? 'Menjalankan query…' : 'Menjalankan kode Python…'));
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
      setOutput(loadingBox('Menilai jawabanmu…'));
      try {
        await ensureEngine();
        if (isSql) {
          const r = await SqlEngine.check(editor.get(), ch);
          if (r.passed) setOutput(successVerdict(handleSolved(ch)) + sqlTable(r.user));
          else setOutput(failVerdict(r.reason) + '<div class="out-label">Hasil query kamu</div>' + sqlTable(r.user, 20)
            + '<div class="out-label">Contoh output yang diharapkan (5 baris pertama)</div>' + sqlTable({ columns: r.expected.columns, values: r.expected.values.slice(0, 5) }));
        } else {
          const r = await PyEngine.check(ch, editor.get());
          markPythonError(r);
          if (r.passed) setOutput(successVerdict(handleSolved(ch)) + pyOutput(r));
          else setOutput(failVerdict(r.reason) + pyOutput(r) + (r.expected?.type !== 'none' ? `<div class="out-label">Output yang diharapkan</div>${pyValue(r.expected)}` : ''));
        }
      } catch (err) {
        setOutput(executionError(err));
      } finally {
        setBusy(false);
        $('#rewardChip').textContent = rewardLabel();
      }
    }

    async function showPlan() {
      setOutput(loadingBox('Membaca query plan…'));
      try {
        await ensureEngine();
        const plan = await SqlEngine.execute(`EXPLAIN QUERY PLAN ${editor.get().trim().replace(/;\s*$/, '')}`);
        const rows = plan.values.map((r) => `<li><code>${esc(r[r.length - 1])}</code></li>`).join('');
        setOutput(`<div class="out-label">EXPLAIN QUERY PLAN</div><ul class="plan">${rows || '<li class="muted">Plan kosong.</li>'}</ul>
          <p class="muted small">💡 <code>SCAN</code> = membaca seluruh tabel, <code>SEARCH ... USING INDEX</code> = memakai index (lebih cepat). Bahan bagus untuk pertanyaan "bagaimana mengoptimalkan query ini?".</p>`);
      } catch (err) {
        setOutput(executionError(err));
      }
    }

    function successVerdict(res) {
      const nextLink = nextCh
        ? `<a class="btn btn-primary btn-sm" href="#/${key}/${nextCh.id}">Soal berikutnya →</a>`
        : `<a class="btn btn-primary btn-sm" href="#/${key}">Kembali ke daftar</a>`;
      const gainText = res.gained ? `+${res.gained} XP${res.dailyBonus ? ' (termasuk bonus Daily)' : ''}` : 'Sudah pernah diselesaikan';
      return `<div class="verdict success"><div class="verdict-icon">✓</div>
        <div class="verdict-text"><h4>Accepted · ${esc(gainText)}</h4><p>${esc(ch.explanation)}</p></div>${nextLink}</div>`;
    }

    function failVerdict(reason) {
      return `<div class="verdict fail"><div class="verdict-icon">✕</div>
        <div class="verdict-text"><h4>Wrong Answer — coba lagi</h4><p>${esc(reason)}</p></div></div>`;
    }

    // ---------- Tombol ----------
    $('#runBtn').addEventListener('click', run);
    $('#submitBtn').addEventListener('click', submit);
    $('#resetBtn').addEventListener('click', () => { editor.set(ch.starter); toast('Kode dikembalikan ke awal', 'info'); });
    async function showTablePreview() {
      setOutput(loadingBox('Memuat preview tabel…'));
      try {
        await ensureEngine();
        if (isSql) {
          const previewQuery = 'SELECT product_id, product_name, price FROM products LIMIT 5';
          setOutput(`<div class="table-meta">Preview Tabel (5 baris pertama)</div>` + sqlTable(await SqlEngine.execute(previewQuery)));
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
      else setOutput('<p class="muted">Tekan <strong>Run</strong> untuk mencoba kode, lalu <strong>Submit</strong> untuk dinilai otomatis.</p>');
    });

    // ---------- Tabs ----------
    function drawTab() {
      const body = $('#tabBody');
      const s = S();
      $('#hintTab').textContent = `💡 ${hintLabel()}`;
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
              <button class="btn btn-xs btn-secondary" data-pypreview="df">df</button>
              <button class="btn btn-xs btn-secondary" data-pypreview="df_raw">df_raw</button>
              <button class="btn btn-xs btn-secondary" data-pypreview="customers">customers</button></div>` : ''}</div>`;
        }
      } else if (activeTab === 'hints') {
        const used = s.hintsUsed[id] || 0;
        const isDone = Boolean(s.completed[id]);
        body.innerHTML = `<p class="muted small">${isDone ? 'Soal sudah selesai — hint bebas dibuka.' : `Setiap hint mengurangi XP sebesar ${HINT_PENALTY * 100}% (minimal 25% XP tetap didapat).`}</p>
          ${ch.hints.map((h, i) => {
            if (i < used) return `<div class="hint open"><span class="label-caps">Hint ${i + 1}</span>${md(h)}</div>`;
            if (i === used) return `<button class="hint locked" data-hint>Buka Hint ${i + 1}</button>`;
            return `<div class="hint dim">🔒 Hint ${i + 1}</div>`;
          }).join('')}`;
      } else {
        body.innerHTML = `
          <div class="solution-container">
            <div class="sol-header">
              <span class="sol-title">Solusi Rekomendasi</span>
              <button class="btn-copy-sol" id="copySol">📋 Salin ke editor</button>
            </div>
            <pre class="sol-code">${esc(ch.solution)}</pre>
            ${isSql ? `
            <div class="schema-relations">
              <div class="rel-title">TABEL RELASI:</div>
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
      const preview = e.target.closest('[data-preview]');
      if (preview) {
        showConsole();
        setOutput(loadingBox('Memuat preview…'));
        try { setOutput(`<div class="out-label">SELECT * FROM ${esc(preview.dataset.preview)} LIMIT 10</div>` + sqlTable(await SqlEngine.execute(`SELECT * FROM ${preview.dataset.preview} LIMIT 10`))); }
        catch (err) { setOutput(errorBox(err.message)); }
        return;
      }
      const pyPreview = e.target.closest('[data-pypreview]');
      if (pyPreview) {
        showConsole();
        setOutput(loadingBox('Memuat preview…'));
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
      if (e.target.id === 'revealBtn') {
        Store.update((st) => { st.revealed[id] = true; });
        $('#rewardChip').textContent = rewardLabel();
        drawTab();
        return;
      }
      if (e.target.closest('#copySol')) {
        editor.set(ch.solution);
        toast('Solusi disalin ke editor', 'info');
      }
    });

    drawTab();
  }

  /** Memberi XP saat challenge terjawab benar. */
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
    if (gained > 0) awardXp(gained, 'Challenge selesai');
    return { first, gained, dailyBonus };
  }

  // ===================================================================
  // QUIZ ARENA (POWER BI + KONSEP)
  // ===================================================================
  function renderQuiz() {
    let cat = 'powerbi';
    let questions = [];
    let index = 0;
    let answered = null;

    view.innerHTML = `
      <section class="page-head card" style="--accent:#f2c811">
        <div><span class="eyebrow">📊 Quiz Arena</span><h1>Power BI & Konsep Interview</h1>
        <p class="muted">Soal pilihan ganda gaya interview: DAX, data modeling, SQL, pandas, statistik, dan business case. +${QUIZ_XP} XP untuk setiap jawaban benar pertama kali.</p></div>
        <div id="catRing"></div>
      </section>
      <div class="filter-chips" id="catChips">
        ${Object.entries(window.QUIZ_CATEGORIES).map(([k, c]) => `<button class="fchip ${k === cat ? 'active' : ''}" data-cat="${k}">${c.icon} ${c.label}</button>`).join('')}
      </div>
      <div class="quiz-layout">
        <section class="card quiz-card" id="quizCard"></section>
        <aside class="card cheat" id="cheat"></aside>
      </div>`;

    function start(newCat) {
      cat = newCat;
      questions = quizByCat(cat);
      index = Math.max(0, questions.findIndex((q) => !S().quiz[q.id]?.correct));
      answered = null;
      const sheet = CHEATSHEETS[cat];
      $('#cheat').innerHTML = `<h3>📌 ${esc(sheet.title)}</h3><pre class="code-block">${esc(sheet.code)}</pre>`;
      draw();
    }

    function draw() {
      const q = questions[index];
      const c = window.QUIZ_CATEGORIES[cat];
      $('#catRing').innerHTML = ring(quizCorrect(cat) / questions.length, { size: 96, stroke: 9, color: c.color, label: `${quizCorrect(cat)}/${questions.length}` });
      const record = S().quiz[q.id];
      $('#quizCard').innerHTML = `
        <div class="quiz-top">
          <span class="muted">Soal ${index + 1} / ${questions.length}</span>
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
        ${answered !== null ? `<div class="explain ${answered === q.answer ? 'good' : 'bad'}"><strong>${answered === q.answer ? '✅ Tepat!' : '❌ Kurang tepat.'}</strong><p>${esc(q.explain)}</p></div>` : ''}
        <div class="quiz-nav">
          <button class="btn btn-ghost btn-sm" data-nav="-1" ${index === 0 ? 'disabled' : ''}>← Sebelumnya</button>
          ${record?.correct && answered === null ? '<span class="chip chip-ok">✓ Pernah dijawab benar</span>' : ''}
          <button class="btn ${answered !== null ? 'btn-primary' : 'btn-ghost'} btn-sm" data-nav="1" ${index === questions.length - 1 ? 'disabled' : ''}>Selanjutnya →</button>
        </div>`;
    }

    $('#catChips').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      $$('.fchip', $('#catChips')).forEach((b) => b.classList.toggle('active', b === btn));
      start(btn.dataset.cat);
    });

    $('#quizCard').addEventListener('click', (e) => {
      const opt = e.target.closest('[data-opt]');
      if (opt && answered === null) {
        const q = questions[index];
        answered = Number(opt.dataset.opt);
        const correct = answered === q.answer;
        const firstCorrect = correct && !S().quiz[q.id]?.correct;
        Store.update((st) => { if (correct || !st.quiz[q.id]) st.quiz[q.id] = { correct }; });
        if (firstCorrect) { awardXp(QUIZ_XP, 'Jawaban benar'); confetti(50); }
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

    start(cat);
  }

  // ===================================================================
  // INTERVIEW FLASHCARDS
  // ===================================================================
  function renderInterview() {
    let type = 'all';
    let deck = [...window.INTERVIEW_CARDS];
    let index = 0;
    let flipped = false;

    view.innerHTML = `
      <section class="page-head card" style="--accent:#f472b6">
        <div><span class="eyebrow">🎤 Interview Prep</span><h1>Flashcard Interview</h1>
        <p class="muted">Latih jawabanmu dengan suara keras atau tulis draft, lalu bandingkan dengan contoh jawaban. Tandai "Paham" untuk +${FLASHCARD_XP} XP.</p></div>
        <div id="ivRing"></div>
      </section>
      <div class="filter-chips" id="typeChips">
        <button class="fchip active" data-type="all">✨ Semua</button>
        ${Object.entries(window.INTERVIEW_TYPES).map(([k, v]) => `<button class="fchip" data-type="${k}">${v.icon} ${v.label}</button>`).join('')}
        <button class="fchip" data-shuffle>🔀 Acak</button>
      </div>
      <section id="flashArea"></section>`;

    function draw() {
      const known = cardsKnown();
      $('#ivRing').innerHTML = ring(known / window.INTERVIEW_CARDS.length, { size: 96, stroke: 9, color: '#f472b6', label: `${known}/${window.INTERVIEW_CARDS.length}` });
      const card = deck[index];
      const mark = S().flashcards[card.id];
      const t = window.INTERVIEW_TYPES[card.type];
      const draftKey = `datadojo_ans_${card.id}`;
      $('#flashArea').innerHTML = `
        <div class="flash-meta"><span class="muted">Kartu ${index + 1} / ${deck.length}</span>
          ${mark ? `<span class="chip ${mark === 'known' ? 'chip-ok' : 'chip-warn'}">${mark === 'known' ? '💪 Paham' : '😅 Perlu diulang'}</span>` : ''}</div>
        <div class="flashcard card ${flipped ? 'is-back' : ''}" id="flashcard" role="button" tabindex="0" aria-label="Balik kartu">
          ${flipped
            ? `<span class="chip">📝 Contoh jawaban</span><div class="flash-answer">${md(card.answer)}</div><div class="flash-tips">💡 ${esc(card.tips)}</div>`
            : `<span class="chip">${t.icon} ${esc(t.label)}</span><h2>${esc(card.q)}</h2><p class="muted small">Klik kartu untuk melihat contoh jawaban ↻</p>`}
        </div>
        <div class="draft card">
          <label for="draft">✍️ Draft jawabanmu <span class="muted small">(opsional, tersimpan otomatis)</span></label>
          <textarea id="draft" rows="4" placeholder="Tulis poin-poin jawabanmu di sini sebelum membalik kartu...">${esc(safeStorageGet(draftKey) || '')}</textarea>
        </div>
        <div class="flash-actions">
          <button class="btn btn-ghost" data-move="-1" ${index === 0 ? 'disabled' : ''}>←</button>
          <button class="btn btn-warn" data-mark="review">😅 Masih bingung</button>
          <button class="btn btn-success" data-mark="known">💪 Paham</button>
          <button class="btn btn-ghost" data-move="1" ${index === deck.length - 1 ? 'disabled' : ''}>→</button>
        </div>`;
      $('#draft').addEventListener('input', (e) => safeStorageSet(draftKey, e.target.value));
    }

    function flip() {
      const el = $('#flashcard');
      el.classList.add('flipping');
      setTimeout(() => { flipped = !flipped; draw(); $('#flashcard').classList.add('flipping-in'); }, 180);
    }

    function move(delta) {
      index = Math.min(deck.length - 1, Math.max(0, index + delta));
      flipped = false;
      draw();
    }

    $('#typeChips').addEventListener('click', (e) => {
      if (e.target.closest('[data-shuffle]')) {
        deck = [...deck].sort(() => Math.random() - 0.5);
        index = 0; flipped = false; draw();
        toast('Kartu diacak 🔀', 'info');
        return;
      }
      const btn = e.target.closest('[data-type]');
      if (!btn) return;
      type = btn.dataset.type;
      $$('[data-type]', $('#typeChips')).forEach((b) => b.classList.toggle('active', b === btn));
      deck = window.INTERVIEW_CARDS.filter((c) => type === 'all' || c.type === type);
      index = 0; flipped = false; draw();
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
        if (firstKnown) awardXp(FLASHCARD_XP, 'Flashcard dikuasai');
        if (index < deck.length - 1) move(1); else { draw(); toast('Dek selesai! 🎉 Coba acak atau pilih kategori lain.', 'info'); }
      }
    });
    $('#flashArea').addEventListener('keydown', (e) => {
      if (e.target.id === 'flashcard' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); flip(); }
    });

    draw();
  }

  // ===================================================================
  // MOCK INTERVIEW (TIMED)
  // ===================================================================
  function renderMock() {
    let cat = 'mix';
    let session = null;
    let timer = null;
    onCleanup(() => clearInterval(timer));

    function drawSetup() {
      const cats = [['mix', '🎲 Campuran'], ...Object.entries(window.QUIZ_CATEGORIES).map(([k, c]) => [k, `${c.icon} ${c.label}`])];
      view.innerHTML = `
        <section class="mock-setup card">
          <span class="eyebrow">⏱️ Mock Interview</span>
          <h1>Simulasi Interview <span class="grad">Under Pressure</span></h1>
          <p class="muted">10 soal acak · ${MOCK_SECONDS} detik per soal · tanpa hint. Skor ≥ 80% membuka badge <strong>Mock Ace 🏅</strong> dan bonus +${MOCK_ACE_BONUS} XP.</p>
          <div class="mock-stats"><div><strong>${S().mockBest}%</strong><small>Skor terbaik</small></div><div><strong>${S().mockRuns}</strong><small>Sesi dikerjakan</small></div></div>
          <h4>Pilih topik</h4>
          <div class="filter-chips center" id="mockCats">${cats.map(([k, l]) => `<button class="fchip ${k === cat ? 'active' : ''}" data-cat="${k}">${l}</button>`).join('')}</div>
          <button class="btn btn-primary btn-lg" id="startMock">🚀 Mulai Sekarang</button>
        </section>`;
      $('#mockCats').addEventListener('click', (e) => {
        const b = e.target.closest('[data-cat]');
        if (!b) return;
        cat = b.dataset.cat;
        $$('.fchip', $('#mockCats')).forEach((x) => x.classList.toggle('active', x === b));
      });
      $('#startMock').addEventListener('click', startSession);
    }

    function startSession() {
      const pool = window.QUIZ_BANK.filter((q) => cat === 'mix' || q.cat === cat);
      const questions = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
      session = { questions, index: 0, answers: [], locked: false };
      drawQuestion();
    }

    function drawQuestion() {
      const { questions, index } = session;
      const q = questions[index];
      const c = window.QUIZ_CATEGORIES[q.cat];
      view.innerHTML = `
        <section class="mock-run card">
          <div class="mock-head">
            <span class="chip">${c.icon} ${esc(c.label)}</span>
            <span class="muted">Soal ${index + 1}/${questions.length}</span>
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
      if (choice === null) toast('⏰ Waktu habis!', 'warn', 1500);
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
      if (xp > 0) awardXp(xp, 'Mock Interview');
      if (pct >= 80) confetti(200);
      const verdict = pct >= 80 ? ['🔥', 'Siap interview! Kamu tampil sangat meyakinkan.']
        : pct >= 60 ? ['👍', 'Bagus! Sedikit lagi menuju level siap tempur.']
          : ['💪', 'Jangan menyerah — pelajari pembahasan di bawah lalu coba lagi.'];

      view.innerHTML = `
        <section class="mock-result card">
          <div class="result-ring">${ring(pct / 100, { size: 170, stroke: 14, color: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f2c811' : '#ef4444', label: `${pct}%` })}</div>
          <h1>${verdict[0]} ${correct}/${questions.length} benar</h1>
          <p class="muted">${verdict[1]} ${isBest ? '<strong class="grad">· Rekor baru!</strong>' : ''}</p>
          <div class="hero-actions center">
            <button class="btn btn-primary" id="again">🔁 Ulangi</button>
            <a class="btn btn-ghost" href="#/quiz">📚 Belajar di Quiz Arena</a>
          </div>
        </section>
        <h2 class="section-title">📝 Pembahasan</h2>
        <section class="review-list">
          ${questions.map((q, i) => {
            const ok = answers[i] === q.answer;
            return `<div class="review card ${ok ? 'ok' : 'bad'}">
              <div class="review-head"><span>${ok ? '✅' : '❌'} ${i + 1}. ${esc(q.q)}</span></div>
              ${q.code ? `<pre class="code-block">${esc(q.code)}</pre>` : ''}
              <p class="small">Jawabanmu: <strong>${answers[i] === null ? '⏰ (waktu habis)' : esc(q.options[answers[i]])}</strong></p>
              ${ok ? '' : `<p class="small">Jawaban benar: <strong class="ok-text">${esc(q.options[q.answer])}</strong></p>`}
              <p class="muted small">${esc(q.explain)}</p>
            </div>`;
          }).join('')}
        </section>`;
      $('#again').addEventListener('click', drawSetup);
    }

    drawSetup();
  }

  // ===================================================================
  // LEADERBOARD
  // ===================================================================
  function renderLeaderboard() {
    const me = [S().name || 'Kamu', S().xp, '⭐', true];
    const rows = [...BOTS.map((b) => [...b, false]), me].sort((a, b) => b[1] - a[1]);
    const myRank = rows.findIndex((r) => r[3]) + 1;
    const podium = rows.slice(0, 3);
    const order = [1, 0, 2];

    view.innerHTML = `
      <section class="page-head card" style="--accent:#a78bfa">
        <div><span class="eyebrow">🏆 Liga Mingguan</span><h1>Leaderboard</h1>
        <p class="muted">Peringkat kamu saat ini: <strong>#${myRank}</strong>. Kumpulkan XP untuk naik ke podium! <span class="small">(peserta lain adalah simulasi offline)</span></p></div>
      </section>
      <section class="podium">
        ${order.map((i) => podium[i] ? `<div class="podium-item p${i + 1} ${podium[i][3] ? 'me' : ''}">
          <span class="avatar">${podium[i][2]}</span><strong>${esc(podium[i][0])}</strong><small>${podium[i][1]} XP</small>
          <div class="podium-block">${['🥇', '🥈', '🥉'][i]}</div></div>` : '').join('')}
      </section>
      <section class="card lb-list">
        ${rows.map((r, i) => `<div class="lb-row ${r[3] ? 'me' : ''}">
          <span class="lb-rank">#${i + 1}</span><span class="avatar sm">${r[2]}</span>
          <span class="lb-name">${esc(r[0])}${r[3] ? ' <span class="chip chip-xp">Kamu</span>' : ''}</span>
          <span class="lb-lvl muted small">${esc(Store.getLevel(r[1]).title)}</span>
          <span class="lb-xp">${r[1]} XP</span></div>`).join('')}
      </section>`;
  }

  // ===================================================================
  // PROFIL
  // ===================================================================
  function renderProfile() {
    const s = S();
    const lvl = Store.getLevel();
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
          <div class="badge-card-v2 tier-${b.tier} ${isDone ? 'earned' : 'locked'}" data-badge-id="${b.id}" role="button" tabindex="0" title="Klik untuk memeriksa kriteria & lore">
            <div class="bcard-glow"></div>
            <div class="bcard-tier-bar tier-${b.tier}">
              <span class="bcard-tier-label">${b.tierLabel}</span>
              <span class="bcard-rarity">${b.rarity}</span>
              <span class="bcard-xp">+${b.xpReward} XP</span>
            </div>
            
            <div class="bcard-body">
              <div class="bcard-icon-stage tier-${b.tier}">
                <span class="bcard-icon">${b.icon}</span>
              </div>
              <div class="bcard-titles">
                <strong>${esc(b.name)}</strong>
                <span class="bcard-sub">${esc(b.subtitle)}</span>
              </div>
            </div>

            <p class="bcard-desc">${esc(b.desc)}</p>

            <div class="bcard-progress-wrap">
              <div class="bcard-prog-info">
                <span class="muted small">Progres</span>
                <span class="small font-mono"><strong>${prog.current}</strong>/${prog.max} ${esc(prog.unit)}</span>
              </div>
              <div class="bar bcard-bar"><i style="width:${pct}%"></i></div>
            </div>

            <div class="bcard-foot">
              ${isDone
                ? `<span class="ok-text small">✨ Terbuka · ${esc(earnedDate)}</span>`
                : `<span class="muted small">🔒 Terkunci (${Math.max(0, prog.max - prog.current)} lagi)</span>`}
              <span class="bcard-inspect-btn">Lihat Lore →</span>
            </div>
          </div>
        `;
      }).join('');
    };

    view.innerHTML = `
      <section class="profile-head card">
        <div class="avatar xl">${lvl.emoji}</div>
        <div class="profile-info">
          <div class="profile-title-bar">
            <div>
              <label class="muted small" for="nameInput">Nama tampilan</label>
              <div class="name-row">
                <input id="nameInput" maxlength="24" value="${esc(s.name)}" placeholder="Nama kamu">
                <button class="btn btn-sm btn-primary" id="saveName">Simpan</button>
              </div>
            </div>
            <div class="profile-quick-actions">
              <button class="btn btn-sm btn-secondary" id="btnProfileSwitch">🔄 Ganti Akun</button>
              <button class="btn btn-sm btn-danger" id="btnProfileLogout">🚪 Log Out</button>
            </div>
          </div>
          <p><strong>Level ${lvl.number} · ${esc(lvl.title)}</strong> — ${s.xp} XP</p>
          <div class="bar big"><i style="width:${lvl.progress * 100}%"></i></div>
          <small class="muted">${lvl.next ? `${lvl.next.min - s.xp} XP lagi menuju ${esc(lvl.next.title)} ${lvl.next.emoji}` : 'Level maksimum!'}</small>
        </div>
      </section>

      <!-- 3D Trophy Showcase Banner -->
      <section class="trophy-showcase-card card">
        <div class="tsc-layout">
          <div class="tsc-media">
            <div class="tsc-img-frame">
              <img src="img/badges-showcase.jpg" alt="DataDojo 3D Badges Showcase" class="tsc-img" />
              <div class="tsc-overlay"></div>
              <div class="tsc-live-tag">
                <span class="live-dot"></span>
                <span>3D METALLIC TROPHIES</span>
              </div>
            </div>
          </div>
          <div class="tsc-text">
            <span class="eyebrow">🏆 HALL OF MASTERS</span>
            <h2>Lemari Trophy & Medali Kompetensi</h2>
            <p class="muted">Setiap trophy dirancang untuk membuktikan kemampuan analitik di dunia nyata: keakuratan query SQL di bawah tekanan, manipulasi data vectorized Python, hingga penguasaan kalkulasi DAX Power BI.</p>
            
            <div class="tsc-stats-row">
              <div class="tsc-pill tier-mythic">
                <span class="tsc-pill-icon">👑</span>
                <div>
                  <strong>${mythicEarned}/2</strong>
                  <small>Mythic</small>
                </div>
              </div>
              <div class="tsc-pill tier-legendary">
                <span class="tsc-pill-icon">💎</span>
                <div>
                  <strong>${legendEarned}/4</strong>
                  <small>Legendary</small>
                </div>
              </div>
              <div class="tsc-pill tier-epic">
                <span class="tsc-pill-icon">🔥</span>
                <div>
                  <strong>${epicEarned}/2</strong>
                  <small>Epic</small>
                </div>
              </div>
              <div class="tsc-pill tier-rare">
                <span class="tsc-pill-icon">🎯</span>
                <div>
                  <strong>${rareEarned}/4</strong>
                  <small>Rare</small>
                </div>
              </div>
            </div>

            <div class="tsc-completion">
              <div class="tsc-c-text">
                <span>Total Koleksi Terbuka</span>
                <strong>${earned} dari ${BADGES.length} Trophy (${Math.round((earned / BADGES.length) * 100)}%)</strong>
              </div>
              <div class="bar big"><i style="width:${(earned / BADGES.length) * 100}%"></i></div>
            </div>
          </div>
        </div>
      </section>

      <div class="section-head-row">
        <div>
          <h2 class="section-title">🎖️ Koleksi Badge Lengkap (${earned}/${BADGES.length})</h2>
          <p class="section-sub">Klik badge mana saja untuk membaca lore interview, kriteria, dan menyalin pameran prestasi.</p>
        </div>
        <div class="badge-filter-group" id="badgeFilters">
          <button class="fchip active" data-bfilter="all">Semua (${BADGES.length})</button>
          <button class="fchip" data-bfilter="earned">Telah Dibuka (${earned})</button>
          <button class="fchip" data-bfilter="locked">Terkunci (${BADGES.length - earned})</button>
          <button class="fchip" data-bfilter="mythic_legend">Mythic & Legendary (6)</button>
        </div>
      </div>

      <section class="badge-grid-showcase" id="badgeGridContainer">
        ${renderBadgeCards()}
      </section>

      <h2 class="section-title">📆 Aktivitas Belajar</h2>
      <section class="card heatmap-card">
        <div class="heatmap" style="--weeks:${weeks}">${cells.join('')}</div>
        <div class="heat-legend muted small">Sedikit <i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i> Banyak</div>
      </section>

      <h2 class="section-title">🗺️ Jalur Level</h2>
      <section class="level-path card">
        ${Store.LEVELS.map((l, i) => `<div class="lp-item ${i <= lvl.index ? 'reached' : ''}"><span>${l.emoji}</span><strong>${esc(l.title)}</strong><small>${l.min} XP</small></div>`).join('')}
      </section>

      <section class="danger-zone card">
        <div>
          <strong>Sesi & Akun</strong>
          <p class="muted small">Keluar dari akun di perangkat ini atau hapus seluruh data progres.</p>
        </div>
        <div class="danger-zone-actions">
          <button class="btn btn-sm btn-secondary" id="btnLogoutBottom">🚪 Log Out</button>
          <button class="btn btn-sm btn-danger" id="resetAll">Hapus Semua</button>
        </div>
      </section>`;

    const attachBadgeEvents = () => {
      view.querySelectorAll('#badgeGridContainer [data-badge-id]').forEach((el) => {
        el.addEventListener('click', () => {
          const b = BADGES.find((x) => x.id === el.dataset.badgeId);
          if (b) showBadgeModal(b);
        });
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const b = BADGES.find((x) => x.id === el.dataset.badgeId);
            if (b) showBadgeModal(b);
          }
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
      if (!name) { toast('Nama tidak boleh kosong', 'warn'); return; }
      Store.update((st) => { st.name = name; });
      Store.saveCurrentAccountProfile();
      toast('Nama disimpan ✨', 'info');
    });

    $('#resetAll').addEventListener('click', () => {
      const close = modal(`<h2>Reset semua progres?</h2><p class="muted">Semua XP, badge, streak, dan jawaban akan dihapus permanen.</p>
        <div class="hero-actions center"><button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-danger" id="confirmReset">Ya, reset</button></div>`);
      $('#confirmReset').addEventListener('click', () => {
        Store.reset();
        Object.keys(localStorage).filter((k) => k.startsWith('datadojo_')).forEach((k) => localStorage.removeItem(k));
        close();
        toast('Progres direset', 'warn');
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
    const name = s.name || 'Pengguna';
    const lvl = Store.getLevel();

    const close = modal(`
      <div class="logout-modal-box">
        <div class="lm-icon">🚪</div>
        <h2>Keluar dari Akun?</h2>
        <p class="muted">Kamu saat ini login sebagai <strong>${esc(name)}</strong> (Level ${lvl.number} · ${s.xp} XP).</p>
        
        <div class="logout-action-cards">
          <div class="btn-logout-card" id="btnConfirmLogoutKeep" role="button" tabindex="0">
            <span class="blc-icon">💾</span>
            <div class="blc-text">
              <strong>Simpan Progres & Log Out</strong>
              <small>Progres ${esc(name)} tetap aman tersimpan di browser ini. Kamu bisa masuk kembali kapan saja.</small>
            </div>
          </div>

          <div class="btn-logout-card danger" id="btnConfirmLogoutClear" role="button" tabindex="0">
            <span class="blc-icon">🗑️</span>
            <div class="blc-text">
              <strong>Hapus Data & Log Out</strong>
              <small>Hapus riwayat, XP, dan jawaban akun ${esc(name)} dari perangkat ini.</small>
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
      toast(`Sampai jumpa, ${name}! Kamu telah berhasil logout 👋`, 'info', 4000);
      askName();
    });

    $('#btnConfirmLogoutClear').addEventListener('click', () => {
      close();
      Store.logout({ clearData: true });
      toast('Data akun dihapus & kamu telah logout 👋', 'warn', 4000);
      askName();
    });
  }

  function openSwitchAccountModal() {
    const saved = Store.getSavedAccounts();
    const currentName = S().name || '';

    const close = modal(`
      <div class="switch-modal-box">
        <div class="lm-icon">🔄</div>
        <h2>Ganti Akun DataDojo</h2>
        <p class="muted">Pilih profil yang tersimpan di perangkat ini atau masuk dengan nama baru.</p>

        ${saved.length ? `
          <div class="saved-accounts-list">
            ${saved.map(acc => `
              <div class="saved-acc-card ${acc.name.toLowerCase() === currentName.toLowerCase() ? 'active' : ''}" data-switch-name="${esc(acc.name)}" role="button" tabindex="0">
                <span class="sab-avatar">${esc(acc.name.charAt(0).toUpperCase())}</span>
                <div class="sab-info">
                  <strong>${esc(acc.name)}${acc.name.toLowerCase() === currentName.toLowerCase() ? ' <span class="chip chip-xp">Aktif</span>' : ''}</strong>
                  <small class="muted">Lv.${acc.level} ${esc(acc.levelTitle)} · ${acc.xp} XP</small>
                </div>
                <span class="sab-action">${acc.name.toLowerCase() === currentName.toLowerCase() ? 'Sedang Aktif' : 'Beralih →'}</span>
              </div>
            `).join('')}
          </div>
        ` : '<p class="muted small" style="margin: 12px 0;">Belum ada akun lain yang tersimpan di browser ini.</p>'}

        <div class="switch-new-form">
          <label class="muted small" for="switchNewName">Atau masuk dengan nama baru:</label>
          <div class="name-row">
            <input id="switchNewName" maxlength="24" placeholder="Nama akun baru...">
            <button class="btn btn-primary" id="btnGoSwitchNew">Masuk 🚀</button>
          </div>
        </div>

        <div class="hero-actions center">
          <button class="btn btn-ghost" data-close>Batal</button>
        </div>
      </div>
    `);

    $$('[data-switch-name]').forEach((el) => {
      el.addEventListener('click', () => {
        const name = el.dataset.switchName;
        if (name.toLowerCase() === currentName.toLowerCase()) { close(); return; }
        Store.switchAccount(name);
        close();
        toast(`Selamat datang kembali, ${name}! ✨`, 'info', 4000);
        location.hash = '#/';
      });
    });

    const goNew = () => {
      const name = $('#switchNewName').value.trim().slice(0, 24);
      if (!name) { toast('Nama akun tidak boleh kosong', 'warn'); return; }
      Store.switchAccount(name);
      close();
      toast(`Akun baru dibuat! Halo ${name} 🥋`, 'info', 4000);
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
      <div class="levelup-emoji">🥋</div>
      <h2>Masuk ke <span class="grad">DataDojo</span></h2>
      <p class="muted">Platform latihan live coding SQL & Python, kuis Power BI, dan simulasi interview.</p>
      
      ${saved.length ? `
        <div class="onboard-saved-title">Pilih profil tersimpan di perangkat ini:</div>
        <div class="saved-accounts-list">
          ${saved.map(acc => `
            <div class="saved-acc-card" data-login-acc="${esc(acc.name)}" role="button" tabindex="0">
              <span class="sab-avatar">${esc(acc.name.charAt(0).toUpperCase())}</span>
              <div class="sab-info">
                <strong>${esc(acc.name)}</strong>
                <small class="muted">Lv.${acc.level} ${esc(acc.levelTitle)} · ${acc.xp} XP</small>
              </div>
              <span class="sab-action">Masuk →</span>
            </div>
          `).join('')}
        </div>
        <div class="auth-divider"><span>atau masuk dengan nama baru</span></div>
      ` : ''}

      <div class="onboard-input-box">
        <label class="muted small" for="onboardName">Nama panggilan kamu:</label>
        <div class="name-row">
          <input id="onboardName" maxlength="24" placeholder="Ketik nama kamu..." autofocus>
          <button class="btn btn-primary" id="onboardGo">Mulai Belajar 🚀</button>
        </div>
      </div>
    </div>`, { onClose: () => { if (!S().name) Store.update((st) => { st.name = 'Analyst'; }); } });

    $$('[data-login-acc]').forEach((el) => {
      el.addEventListener('click', () => {
        const name = el.dataset.loginAcc;
        Store.switchAccount(name);
        close();
        toast(`Halo kembali, ${name}! 🔥`, 'info', 4000);
      });
    });

    const go = () => {
      const name = $('#onboardName').value.trim().slice(0, 24) || 'Analyst';
      Store.switchAccount(name);
      close();
      toast(`Halo ${name}! Selesaikan challenge pertamamu untuk badge 🎯`, 'info', 4000);
    };
    $('#onboardGo').addEventListener('click', go);
    $('#onboardName').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    setTimeout(() => $('#onboardName')?.focus(), 50);
  }

  function init() {
    Store.subscribe(() => { renderTopbar(); checkBadges(); });
    checkBadges(true);
    Store.saveCurrentAccountProfile();
    renderTopbar();
    window.addEventListener('hashchange', router);
    router();
    if (!S().name) askName();
    // Warm-up engine SQL di background agar Run pertama terasa instan.
    SqlEngine.load().catch((err) => console.error('Gagal memuat SQL engine', err));
  }

  init();
})();
