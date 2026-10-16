/**
 * SqlEngine — MySQL 8.0 Compatible In-Browser Engine.
 * Mendukung fungsi standar MySQL 8.0 (DATE_FORMAT, DATEDIFF, TIMESTAMPDIFF,
 * YEAR, MONTH, DAY, QUARTER, DAYNAME, MONTHNAME, CONCAT, CONCAT_WS, IF, IFNULL,
 * LEFT, RIGHT, LPAD, RPAD, LOCATE, SUBSTRING, CEIL, FLOOR, MOD, TRUNCATE, NOW, CURDATE)
 * serta Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, SUM/AVG OVER).
 */
window.SqlEngine = (() => {
  const SQLJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
  const MAX_DISPLAY_ROWS = 200;
  const NUMERIC_TOLERANCE = 0.05;

  const SCHEMA = [
    { table: 'customers', columns: [['customer_id', 'INT PK'], ['name', 'VARCHAR(100)'], ['city', 'VARCHAR(60)'], ['segment', 'VARCHAR(40)'], ['signup_date', 'DATE']] },
    { table: 'products', columns: [['product_id', 'INT PK'], ['product_name', 'VARCHAR(120)'], ['category', 'VARCHAR(50)'], ['price', 'DECIMAL(12,2)'], ['cost', 'DECIMAL(12,2)']] },
    { table: 'orders', columns: [['order_id', 'INT PK'], ['customer_id', 'INT FK'], ['order_date', 'DATE'], ['status', 'ENUM(status)']] },
    { table: 'order_items', columns: [['order_item_id', 'INT PK'], ['order_id', 'INT FK'], ['product_id', 'INT FK'], ['quantity', 'INT'], ['discount', 'DECIMAL(4,2)']] },
    { table: 'employees', columns: [['employee_id', 'INT PK'], ['name', 'VARCHAR(100)'], ['department', 'VARCHAR(50)'], ['salary', 'BIGINT'], ['manager_id', 'INT FK'], ['hire_date', 'DATE']] }
  ];

  const CUSTOMERS = [
    [1, 'Andi Pratama', 'Jakarta', 'Consumer', '2024-01-15'], [2, 'Siti Nurhaliza', 'Bandung', 'Corporate', '2024-02-03'],
    [3, 'Budi Santoso', 'Surabaya', 'Consumer', '2024-02-20'], [4, 'Dewi Lestari', 'Jakarta', 'Corporate', '2024-03-11'],
    [5, 'Rizky Ramadhan', 'Medan', 'Consumer', '2024-03-28'], [6, 'Putri Ayu', 'Yogyakarta', 'Consumer', '2024-04-09'],
    [7, 'Fajar Nugroho', 'Jakarta', 'Small Business', '2024-04-22'], [8, 'Maya Sari', 'Semarang', 'Consumer', '2024-05-05'],
    [9, 'Agus Setiawan', 'Makassar', 'Corporate', '2024-05-19'], [10, 'Rina Wati', 'Bandung', 'Consumer', '2024-06-02'],
    [11, 'Dimas Saputra', 'Surabaya', 'Small Business', '2024-06-17'], [12, 'Nadia Putri', 'Denpasar', 'Consumer', '2024-07-01'],
    [13, 'Hendra Gunawan', 'Jakarta', 'Consumer', '2024-07-14'], [14, 'Lina Marlina', 'Medan', 'Corporate', '2024-08-08'],
    [15, 'Yoga Pratama', 'Yogyakarta', 'Small Business', '2024-08-25'], [16, 'Citra Kirana', 'Bandung', 'Consumer', '2024-09-10'],
    [17, 'Eko Prasetyo', 'Semarang', 'Consumer', '2024-10-01'], [18, 'Sari Indah', 'Jakarta', 'Corporate', '2024-11-12'],
    [19, 'Bayu Aji', 'Surabaya', 'Consumer', '2024-12-03'], [20, 'Wulan Dari', 'Denpasar', 'Small Business', '2024-12-20']
  ];
  const ACTIVE_CUSTOMER_COUNT = 17; // pelanggan 18–20 sengaja tidak punya order (soal anti-join)

  const PRODUCTS = [
    [1, 'Laptop Pro 14', 'Electronics', 12500000, 9800000], [2, 'Wireless Mouse', 'Electronics', 250000, 140000],
    [3, 'Mechanical Keyboard', 'Electronics', 850000, 520000], [4, 'Monitor 27 inch', 'Electronics', 3200000, 2450000],
    [5, 'Kursi Ergonomis', 'Furniture', 2100000, 1500000], [6, 'Meja Kerja', 'Furniture', 1750000, 1200000],
    [7, 'Lampu Meja LED', 'Furniture', 320000, 180000], [8, 'Buku SQL Mastery', 'Books', 180000, 90000],
    [9, 'Buku Python for Data', 'Books', 210000, 110000], [10, 'Buku Storytelling with Data', 'Books', 195000, 100000],
    [11, 'Headset Noise Cancel', 'Electronics', 1450000, 980000], [12, 'Rak Buku Minimalis', 'Furniture', 680000, 420000]
  ];

  const EMPLOYEES = [
    [1, 'Ratna Dewi', 'Executive', 45000000, null, '2018-01-10'], [2, 'Bambang Hartono', 'Data', 32000000, 1, '2019-03-01'],
    [3, 'Indra Wijaya', 'Sales', 28000000, 1, '2019-06-15'], [4, 'Sinta Maharani', 'Data', 18000000, 2, '2021-02-01'],
    [5, 'Arif Hidayat', 'Data', 21000000, 2, '2020-08-20'], [6, 'Melati Suryani', 'Data', 15000000, 5, '2023-01-09'],
    [7, 'Joko Susilo', 'Sales', 14000000, 3, '2022-04-11'], [8, 'Kartika Sari', 'Sales', 16500000, 3, '2021-11-01'],
    [9, 'Rudi Hermawan', 'Sales', 29500000, 3, '2020-01-15'], [10, 'Anisa Rahma', 'Marketing', 19000000, 1, '2021-05-05'],
    [11, 'Gilang Ramadhan', 'Marketing', 12500000, 10, '2023-07-01'], [12, 'Tari Oktaviani', 'Data', 22000000, 5, '2022-09-12']
  ];

  /** PRNG deterministik agar data identik di setiap perangkat. */
  function createRandom(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function generateOrders() {
    const rand = createRandom(42);
    const pick = (arr) => arr[Math.floor(rand() * arr.length)];
    const orders = [];
    const items = [];
    const discounts = [0, 0, 0, 0, 0.05, 0.1, 0.15];
    const start = Date.UTC(2025, 0, 1);
    let itemId = 1;

    for (let orderId = 1; orderId <= 140; orderId++) {
      const customerId = 1 + Math.floor(rand() * ACTIVE_CUSTOMER_COUNT);
      const date = new Date(start + Math.floor(rand() * 365) * 86400000).toISOString().slice(0, 10);
      const r = rand();
      const status = r < 0.8 ? 'completed' : r < 0.92 ? 'cancelled' : 'returned';
      orders.push([orderId, customerId, date, status]);

      const itemCount = 1 + Math.floor(rand() * 3);
      const used = new Set();
      while (used.size < itemCount) {
        // produk murah lebih sering dibeli
        const product = rand() < 0.15 ? pick(PRODUCTS) : pick(PRODUCTS.filter((p) => p[3] < 4000000));
        if (used.has(product[0])) continue;
        used.add(product[0]);
        const maxQty = product[2] === 'Books' ? 5 : product[3] > 3000000 ? 1 : 3;
        items.push([itemId++, orderId, product[0], 1 + Math.floor(rand() * maxQty), pick(discounts)]);
      }
    }
    return { orders, items };
  }

  function seedDatabase(db) {
    db.run(`
      CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT, city TEXT, segment TEXT, signup_date DATE);
      CREATE TABLE products (product_id INTEGER PRIMARY KEY, product_name TEXT, category TEXT, price REAL, cost REAL);
      CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id), order_date DATE, status TEXT);
      CREATE TABLE order_items (order_item_id INTEGER PRIMARY KEY, order_id INTEGER REFERENCES orders(order_id),
                                product_id INTEGER REFERENCES products(product_id), quantity INTEGER, discount REAL);
      CREATE TABLE employees (employee_id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER,
                              manager_id INTEGER REFERENCES employees(employee_id), hire_date DATE);
    `);
    const insertAll = (sql, rows) => {
      const stmt = db.prepare(sql);
      rows.forEach((row) => stmt.run(row));
      stmt.free();
    };
    const { orders, items } = generateOrders();
    insertAll('INSERT INTO customers VALUES (?,?,?,?,?)', CUSTOMERS);
    insertAll('INSERT INTO products VALUES (?,?,?,?,?)', PRODUCTS);
    insertAll('INSERT INTO employees VALUES (?,?,?,?,?,?)', EMPLOYEES);
    insertAll('INSERT INTO orders VALUES (?,?,?,?)', orders);
    insertAll('INSERT INTO order_items VALUES (?,?,?,?,?)', items);
  }

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function parseIsoDate(d) {
    if (d === null || d === undefined || d === '') return null;
    const str = String(d).trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/.exec(str);
    if (m) {
      return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] || 0), Number(m[5] || 0), Number(m[6] || 0)));
    }
    const dt = new Date(str);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  function registerMySqlFunctions(db) {
    if (typeof db.create_function !== 'function') return;
    const pad2 = (n) => String(n).padStart(2, '0');

    // Date extraction functions (MySQL 8.0)
    db.create_function('YEAR', (d) => {
      const dt = parseIsoDate(d);
      return dt ? dt.getUTCFullYear() : null;
    });
    db.create_function('MONTH', (d) => {
      const dt = parseIsoDate(d);
      return dt ? dt.getUTCMonth() + 1 : null;
    });
    db.create_function('DAY', (d) => {
      const dt = parseIsoDate(d);
      return dt ? dt.getUTCDate() : null;
    });
    db.create_function('DAYOFMONTH', (d) => {
      const dt = parseIsoDate(d);
      return dt ? dt.getUTCDate() : null;
    });
    db.create_function('QUARTER', (d) => {
      const dt = parseIsoDate(d);
      return dt ? Math.floor(dt.getUTCMonth() / 3) + 1 : null;
    });
    db.create_function('MONTHNAME', (d) => {
      const dt = parseIsoDate(d);
      return dt ? MONTH_NAMES[dt.getUTCMonth()] : null;
    });
    db.create_function('DAYNAME', (d) => {
      const dt = parseIsoDate(d);
      return dt ? DAY_NAMES[dt.getUTCDay()] : null;
    });
    db.create_function('DAYOFWEEK', (d) => {
      const dt = parseIsoDate(d);
      return dt ? dt.getUTCDay() + 1 : null; // MySQL: 1=Sunday..7=Saturday
    });
    db.create_function('WEEKDAY', (d) => {
      const dt = parseIsoDate(d);
      return dt ? (dt.getUTCDay() + 6) % 7 : null; // MySQL: 0=Monday..6=Sunday
    });

    // DATE_FORMAT(date, format)
    db.create_function('DATE_FORMAT', (d, fmt) => {
      const dt = parseIsoDate(d);
      if (!dt || fmt === null || fmt === undefined) return null;
      const Y = dt.getUTCFullYear();
      const M = dt.getUTCMonth();
      const D = dt.getUTCDate();
      const W = dt.getUTCDay();
      const H = dt.getUTCHours();
      const I = dt.getUTCMinutes();
      const S = dt.getUTCSeconds();
      return String(fmt).replace(/%[YymcdDeMbaWQHhis%]/g, (tok) => {
        switch (tok) {
          case '%Y': return String(Y);
          case '%y': return String(Y).slice(-2);
          case '%m': return pad2(M + 1);
          case '%c': return String(M + 1);
          case '%d': return pad2(D);
          case '%e': return String(D);
          case '%M': return MONTH_NAMES[M];
          case '%b': return MONTH_SHORT[M];
          case '%W': return DAY_NAMES[W];
          case '%a': return DAY_SHORT[W];
          case '%Q': return String(Math.floor(M / 3) + 1);
          case '%H':
          case '%h': return pad2(H);
          case '%i': return pad2(I);
          case '%s': return pad2(S);
          case '%%': return '%';
          default: return tok;
        }
      });
    });

    // DATEDIFF(expr1, expr2) -> expr1 - expr2 in days (MySQL standard)
    db.create_function('DATEDIFF', (d1, d2) => {
      const dt1 = parseIsoDate(d1);
      const dt2 = parseIsoDate(d2);
      if (!dt1 || !dt2) return null;
      return Math.round((dt1.getTime() - dt2.getTime()) / 86400000);
    });

    // TIMESTAMPDIFF_MYSQL(unit, d1, d2) -> d2 - d1 in unit
    db.create_function('TIMESTAMPDIFF_MYSQL', (unit, d1, d2) => {
      const dt1 = parseIsoDate(d1);
      const dt2 = parseIsoDate(d2);
      if (!dt1 || !dt2 || !unit) return null;
      const u = String(unit).toUpperCase();
      const diffMs = dt2.getTime() - dt1.getTime();
      if (u === 'DAY' || u === 'DAYS') return Math.trunc(diffMs / 86400000);
      if (u === 'MONTH' || u === 'MONTHS') {
        return (dt2.getUTCFullYear() - dt1.getUTCFullYear()) * 12 + (dt2.getUTCMonth() - dt1.getUTCMonth());
      }
      if (u === 'YEAR' || u === 'YEARS') {
        return dt2.getUTCFullYear() - dt1.getUTCFullYear();
      }
      if (u === 'HOUR' || u === 'HOURS') return Math.trunc(diffMs / 3600000);
      if (u === 'MINUTE' || u === 'MINUTES') return Math.trunc(diffMs / 60000);
      return Math.trunc(diffMs / 1000);
    });

    // Conditional & Null functions (MySQL 8.0)
    db.create_function('IF', (cond, vTrue, vFalse) => (cond ? vTrue : vFalse));
    db.create_function('ISNULL', (v) => (v === null || v === undefined ? 1 : 0));

    // String functions (MySQL 8.0)
    db.create_function('LEFT', (s, len) => (s === null || s === undefined ? null : String(s).slice(0, Math.max(0, Number(len) || 0))));
    db.create_function('RIGHT', (s, len) => {
      if (s === null || s === undefined) return null;
      const str = String(s);
      const n = Math.max(0, Number(len) || 0);
      return n === 0 ? '' : str.slice(-n);
    });
    db.create_function('REVERSE', (s) => (s === null || s === undefined ? null : String(s).split('').reverse().join('')));
    db.create_function('REPEAT', (s, count) => (s === null || s === undefined ? null : String(s).repeat(Math.max(0, Number(count) || 0))));
    db.create_function('LOCATE', (sub, s) => {
      if (sub === null || sub === undefined || s === null || s === undefined) return null;
      return String(s).indexOf(String(sub)) + 1;
    });
    db.create_function('LPAD', (s, len, pad) => (s === null || s === undefined ? null : String(s).padStart(Number(len) || 0, String(pad ?? ' '))));
    db.create_function('RPAD', (s, len, pad) => (s === null || s === undefined ? null : String(s).padEnd(Number(len) || 0, String(pad ?? ' '))));

    // String concatenation (MySQL 8.0 CONCAT & CONCAT_WS)
    const makeConcat = (n) => {
      const fn = (...args) => {
        for (let i = 0; i < n; i++) {
          if (args[i] === null || args[i] === undefined) return null;
        }
        return args.slice(0, n).map(String).join('');
      };
      Object.defineProperty(fn, 'length', { value: n });
      return fn;
    };
    for (let n = 1; n <= 8; n++) {
      db.create_function('CONCAT', makeConcat(n));
    }

    const makeConcatWs = (n) => {
      const fn = (sep, ...args) => {
        if (sep === null || sep === undefined) return null;
        const valid = [];
        for (let i = 0; i < n - 1; i++) {
          if (args[i] !== null && args[i] !== undefined) valid.push(String(args[i]));
        }
        return valid.join(String(sep));
      };
      Object.defineProperty(fn, 'length', { value: n });
      return fn;
    };
    for (let n = 2; n <= 8; n++) {
      db.create_function('CONCAT_WS', makeConcatWs(n));
    }

    // Math functions (MySQL 8.0)
    db.create_function('CEIL', (x) => (x === null || x === undefined ? null : Math.ceil(Number(x))));
    db.create_function('CEILING', (x) => (x === null || x === undefined ? null : Math.ceil(Number(x))));
    db.create_function('FLOOR', (x) => (x === null || x === undefined ? null : Math.floor(Number(x))));
    db.create_function('MOD', (x, y) => (x === null || y === null || Number(y) === 0 ? null : Number(x) % Number(y)));
    db.create_function('POW', (x, y) => (x === null || y === null ? null : Math.pow(Number(x), Number(y))));
    db.create_function('POWER', (x, y) => (x === null || y === null ? null : Math.pow(Number(x), Number(y))));
    db.create_function('TRUNCATE', (x, d) => {
      if (x === null || x === undefined) return null;
      const factor = Math.pow(10, Number(d) || 0);
      return Math.trunc(Number(x) * factor) / factor;
    });
    db.create_function('CURDATE', () => '2025-12-31');
    db.create_function('NOW', () => '2025-12-31 23:59:59');
  }

  function transpileMySql(sql) {
    let q = sql;
    // Support EXTRACT(unit FROM expr) -> UNIT(expr)
    q = q.replace(/\bEXTRACT\s*\(\s*(YEAR|MONTH|DAY|QUARTER)\s+FROM\s+([^)]+)\)/gi, (_, unit, expr) => `${unit.toUpperCase()}(${expr})`);
    // Support TIMESTAMPDIFF(unit, d1, d2) -> TIMESTAMPDIFF_MYSQL('unit', d1, d2)
    q = q.replace(/\bTIMESTAMPDIFF\s*\(\s*(DAY|DAYS|MONTH|MONTHS|YEAR|YEARS|HOUR|MINUTE|SECOND)\s*,/gi, (_, unit) => `TIMESTAMPDIFF_MYSQL('${unit.toUpperCase()}',`);
    // Support SUBSTRING(str, pos, len) -> SUBSTR(str, pos, len)
    q = q.replace(/\bSUBSTRING\s*\(/gi, 'SUBSTR(');
    return q;
  }

  let enginePromise = null;

  /** Memuat runtime database sekali, lalu menyimpan snapshot bersih. */
  function load() {
    if (!enginePromise) {
      enginePromise = (async () => {
        if (typeof window.initSqlJs !== 'function') {
          throw new Error('Runtime database MySQL gagal dimuat. Periksa koneksi internet lalu refresh halaman.');
        }
        const SQL = await window.initSqlJs({ locateFile: (file) => SQLJS_CDN + file });
        const db = new SQL.Database();
        seedDatabase(db);
        const snapshot = db.export();
        db.close();
        return { SQL, snapshot };
      })();
      enginePromise.catch(() => { enginePromise = null; });
    }
    return enginePromise;
  }

  async function withFreshDb(fn) {
    const { SQL, snapshot } = await load();
    const db = new SQL.Database(snapshot);
    registerMySqlFunctions(db);
    try {
      return fn(db);
    } finally {
      db.close();
    }
  }

  /** Menjalankan query MySQL 8.0 dan mengembalikan hasil statement terakhir. */
  async function execute(query) {
    if (!query || !query.trim()) throw new Error('Query masih kosong.');
    return withFreshDb((db) => {
      const results = db.exec(transpileMySql(query));
      const last = results[results.length - 1];
      return last ? { columns: last.columns, values: last.values } : { columns: [], values: [] };
    });
  }

  function normalizeValue(v) {
    if (typeof v === 'string') {
      const trimmed = v.trim();
      return trimmed;
    }
    return v;
  }

  function valuesEqual(a, b) {
    a = normalizeValue(a);
    b = normalizeValue(b);
    if (a === null || b === null) return a === b;
    const na = typeof a === 'number' ? a : Number(a);
    const nb = typeof b === 'number' ? b : Number(b);
    if ((typeof a === 'number' || typeof b === 'number') && !Number.isNaN(na) && !Number.isNaN(nb)) {
      return Math.abs(na - nb) <= Math.max(NUMERIC_TOLERANCE, Math.abs(nb) * 1e-9);
    }
    return String(a) === String(b);
  }

  function rowSortKey(row) {
    return JSON.stringify(row.map((v) => (typeof v === 'number' ? Math.round(v) : normalizeValue(v))));
  }

  /** Membandingkan hasil query user dengan solusi. */
  function compareResults(user, expected, ordered) {
    if (user.columns.length !== expected.columns.length) {
      return { passed: false, reason: `Jumlah kolom berbeda: hasilmu ${user.columns.length} kolom, seharusnya ${expected.columns.length} kolom (${expected.columns.join(', ')}).` };
    }
    if (user.values.length !== expected.values.length) {
      return { passed: false, reason: `Jumlah baris berbeda: hasilmu ${user.values.length} baris, seharusnya ${expected.values.length} baris.` };
    }
    let u = user.values;
    let e = expected.values;
    if (!ordered) {
      u = [...u].sort((x, y) => rowSortKey(x).localeCompare(rowSortKey(y)));
      e = [...e].sort((x, y) => rowSortKey(x).localeCompare(rowSortKey(y)));
    }
    for (let i = 0; i < e.length; i++) {
      for (let j = 0; j < e[i].length; j++) {
        if (!valuesEqual(u[i][j], e[i][j])) {
          const hint = ordered ? ' Periksa juga urutan (ORDER BY).' : '';
          return { passed: false, reason: `Nilai berbeda di baris ${i + 1}, kolom "${expected.columns[j]}": hasilmu ${formatCell(u[i][j])}, seharusnya ${formatCell(e[i][j])}.${hint}` };
        }
      }
    }
    return { passed: true, reason: '' };
  }

  function formatCell(v) {
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'number' && !Number.isInteger(v)) return v.toLocaleString('id-ID', { maximumFractionDigits: 2 });
    return String(v);
  }

  async function check(userQuery, challenge) {
    const user = await execute(userQuery);
    const expected = await execute(challenge.solution);
    return { user, expected, ...compareResults(user, expected, challenge.ordered !== false) };
  }

  return { SCHEMA, MAX_DISPLAY_ROWS, load, execute, check, formatCell };
})();
