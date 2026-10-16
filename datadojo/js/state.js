/**
 * Store — state progres belajar & gamifikasi (XP, level, streak, badge).
 * Disimpan di localStorage, tidak ada data yang dikirim ke server.
 */
window.Store = (() => {
  const STORAGE_KEY = 'datadojo_state_v1';

  const LEVELS = [
    { min: 0, title: 'Data Intern', emoji: '🐣' },
    { min: 150, title: 'Junior Analyst', emoji: '🌱' },
    { min: 400, title: 'Data Analyst', emoji: '📈' },
    { min: 800, title: 'Senior Analyst', emoji: '🚀' },
    { min: 1400, title: 'Analytics Lead', emoji: '🏆' },
    { min: 2200, title: 'Data Wizard', emoji: '🧙' }
  ];

  const createDefaultState = () => {
    const today = todayKey();
    return {
      name: 'Ragada',
      xp: 185,
      completed: {},   // id challenge => { at, xp }
      hintsUsed: {},   // id challenge => jumlah hint dibuka
      revealed: {},    // id challenge => true jika melihat solusi
      quiz: {},        // id soal => { correct: bool }
      flashcards: {},  // id kartu => 'known' | 'review'
      mockBest: 0,
      mockRuns: 0,
      streak: { count: 1, last: today },
      badges: { first_blood: today }, // id badge => tanggal didapat
      dailyDone: null, // tanggal daily challenge terakhir diselesaikan
      activity: { [today]: 35 }     // 'YYYY-MM-DD' => xp
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
        xp: parsed.xp !== undefined && parsed.xp !== 0 ? parsed.xp : defaults.xp,
        streak: (parsed.streak && parsed.streak.count) ? parsed.streak : defaults.streak,
        badges: (parsed.badges && Object.keys(parsed.badges).length > 0) ? parsed.badges : defaults.badges
      };
    } catch (err) {
      console.error('Gagal membaca progres, memulai dari awal.', err);
      return createDefaultState();
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Gagal menyimpan progres ke localStorage.', err);
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

  /** Menambah XP dan mengembalikan info level-up (jika ada). */
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

  function reset() {
    state = createDefaultState();
    persist();
  }

  /** Streak yang ditampilkan: 0 jika user melewatkan lebih dari 1 hari. */
  function getActiveStreak() {
    const { last, count } = state.streak;
    if (!last) return 0;
    const yesterday = todayKey(new Date(Date.now() - 86400000));
    return last === todayKey() || last === yesterday ? count : 0;
  }

  return {
    LEVELS,
    get state() { return state; },
    todayKey,
    getLevel,
    getActiveStreak,
    addXp,
    update,
    reset,
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); }
  };
})();
