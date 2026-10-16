/**
 * Store — Enterprise State, Curriculum Progress & Commercial Membership Management.
 * Persisted in localStorage under an isolated namespace (`datadojo_enterprise_state_v1`).
 */
window.Store = (() => {
  const STORAGE_KEY = 'datadojo_enterprise_state_v1';
  const ACCOUNT_PREFIX = 'datadojo_ent_acc_';

  const LEVELS = [
    { min: 0, title: 'Associate Analyst I', code: 'L1' },
    { min: 150, title: 'Data Analyst II', code: 'L2' },
    { min: 400, title: 'Senior Data Analyst', code: 'L3' },
    { min: 800, title: 'Lead Analytics Engineer', code: 'L4' },
    { min: 1400, title: 'Principal Data Architect', code: 'L5' },
    { min: 2200, title: 'VP of Data & Analytics', code: 'L6' }
  ];

  const PLANS = {
    free: {
      id: 'free',
      name: 'Starter Free',
      badge: 'FREE TIER',
      priceMonthly: 0,
      priceAnnual: 0,
      desc: 'Akses permanen ke seluruh Materi Dasar (Bab 1) di SQL, Python, Power BI, dan Interview Playbook.'
    },
    pro: {
      id: 'pro',
      name: 'Pro Analyst Membership',
      badge: 'PRO MEMBER',
      priceMonthly: 149000,
      priceAnnual: 99000,
      desc: 'Akses penuh ke Bab 2–4 (Intermediate, Advanced & Enterprise), Solusi Resmi, Timed Assessment Simulator, dan Sertifikat Kompetensi.'
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise Team License',
      badge: 'ENTERPRISE',
      priceMonthly: 499000,
      priceAnnual: 399000,
      desc: 'Lisensi korporat untuk rekrutmen & pelatihan tim analitik dengan akses penuh seluruh modul, benchmark kandidat, dan lisensi multi-seat.'
    }
  };

  const createDefaultState = () => {
    const today = todayKey();
    return {
      name: 'Ragada',
      email: 'ragada@enterprise.id',
      plan: 'free',          // 'free' | 'pro' | 'enterprise'
      billingCycle: 'annual',
      subscribedAt: null,
      licenseKey: null,
      invoices: [],
      xp: 185,
      completed: {},         // id challenge => { at, xp }
      hintsUsed: {},         // id challenge => jumlah hint dibuka
      revealed: {},          // id challenge => true jika melihat solusi
      quiz: {},              // id soal => { correct: bool }
      flashcards: {},        // id kartu => 'known' | 'review'
      mockBest: 0,
      mockRuns: 0,
      streak: { count: 1, last: today },
      badges: { first_blood: today },
      dailyDone: null,
      activity: { [today]: 35 }
    };
  };

  const listeners = new Set();
  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const defaults = createDefaultState();
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        ...defaults,
        ...parsed,
        name: parsed.name || defaults.name,
        plan: parsed.plan || 'free',
        xp: parsed.xp !== undefined && parsed.xp !== 0 ? parsed.xp : defaults.xp,
        streak: (parsed.streak && parsed.streak.count) ? parsed.streak : defaults.streak,
        badges: (parsed.badges && Object.keys(parsed.badges).length > 0) ? parsed.badges : defaults.badges,
        invoices: Array.isArray(parsed.invoices) ? parsed.invoices : []
      };
    } catch (err) {
      console.error('Failed to read enterprise state, initializing defaults.', err);
      return createDefaultState();
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to persist state to localStorage.', err);
    }
    listeners.forEach((fn) => fn(state));
  }

  function todayKey(date = new Date()) {
    const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return d.toISOString().slice(0, 10);
  }

  function touchStreak() {
    const today = todayKey();
    if (state.streak.last === today) return;
    const yesterday = todayKey(new Date(Date.now() - 86400000));
    state.streak = { count: state.streak.last === yesterday ? state.streak.count + 1 : 1, last: today };
  }

  function getLevel(xp = state.xp) {
    let index = 0;
    LEVELS.forEach((lvl, i) => { if (xp >= lvl.min) index = i; });
    const current = LEVELS[index];
    const next = LEVELS[index + 1] || null;
    const progress = next ? (xp - current.min) / (next.min - current.min) : 1;
    return { index, number: index + 1, ...current, next, progress: Math.min(1, progress) };
  }

  function isPro() {
    return state.plan === 'pro' || state.plan === 'enterprise';
  }

  function getPlanInfo(planKey = state.plan) {
    return PLANS[planKey] || PLANS.free;
  }

  function setPlan(plan, { cycle = 'annual', method = 'QRIS Enterprise', amount = 0, licenseKey = null } = {}) {
    if (!PLANS[plan]) return;
    state.plan = plan;
    state.billingCycle = cycle;
    if (plan === 'free') {
      state.subscribedAt = null;
      state.licenseKey = null;
    } else {
      const now = new Date();
      state.subscribedAt = now.toISOString();
      state.licenseKey = licenseKey || `DD-${plan.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${now.getFullYear()}`;
      state.invoices = [
        {
          id: `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`,
          date: todayKey(now),
          planName: PLANS[plan].name,
          cycle: cycle === 'annual' ? 'Tahunan (Annual)' : 'Bulanan (Monthly)',
          method,
          amount: amount || (cycle === 'annual' ? PLANS[plan].priceAnnual * 12 : PLANS[plan].priceMonthly),
          status: 'PAID'
        },
        ...(state.invoices || []).slice(0, 9)
      ];
    }
    saveCurrentAccountProfile();
    persist();
  }

  function addXp(amount) {
    const before = getLevel();
    state.xp = Math.max(0, state.xp + amount);
    const today = todayKey();
    state.activity[today] = (state.activity[today] || 0) + amount;
    touchStreak();
    persist();
    const after = getLevel();
    return { gained: amount, leveledUp: after.index > before.index, level: after };
  }

  function update(mutator) {
    mutator(state);
    persist();
  }

  function saveCurrentAccountProfile() {
    if (!state.name) return;
    try {
      localStorage.setItem(ACCOUNT_PREFIX + state.name.toLowerCase(), JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save account profile', err);
    }
  }

  function getSavedAccounts() {
    const list = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(ACCOUNT_PREFIX)) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const data = JSON.parse(raw);
            const lvl = getLevel(data.xp || 0);
            list.push({
              name: data.name,
              plan: data.plan || 'free',
              xp: data.xp || 0,
              level: lvl.number,
              levelCode: lvl.code,
              levelTitle: lvl.title
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to read saved accounts', err);
    }
    return list;
  }

  function logout({ clearData = false } = {}) {
    if (clearData) {
      try {
        if (state.name) {
          localStorage.removeItem(ACCOUNT_PREFIX + state.name.toLowerCase());
        }
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.error(err);
      }
      state = createDefaultState();
      state.name = '';
    } else {
      saveCurrentAccountProfile();
      state.name = '';
    }
    persist();
  }

  function switchAccount(name, initialPlan = null) {
    if (!name) return;
    saveCurrentAccountProfile();
    try {
      const saved = localStorage.getItem(ACCOUNT_PREFIX + name.toLowerCase());
      if (saved) {
        state = { ...createDefaultState(), ...JSON.parse(saved) };
        if (initialPlan && PLANS[initialPlan]) state.plan = initialPlan;
      } else {
        const def = createDefaultState();
        def.name = name;
        def.email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@enterprise.id`;
        if (initialPlan && PLANS[initialPlan]) def.plan = initialPlan;
        state = def;
      }
    } catch (err) {
      const def = createDefaultState();
      def.name = name;
      state = def;
    }
    saveCurrentAccountProfile();
    persist();
  }

  function reset() {
    state = createDefaultState();
    persist();
  }

  function getActiveStreak() {
    const { last, count } = state.streak;
    if (!last) return 0;
    const yesterday = todayKey(new Date(Date.now() - 86400000));
    return last === todayKey() || last === yesterday ? count : 0;
  }

  return {
    LEVELS,
    PLANS,
    get state() { return state; },
    todayKey,
    getLevel,
    isPro,
    getPlanInfo,
    setPlan,
    getActiveStreak,
    addXp,
    update,
    reset,
    logout,
    switchAccount,
    getSavedAccounts,
    saveCurrentAccountProfile,
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); }
  };
})();
