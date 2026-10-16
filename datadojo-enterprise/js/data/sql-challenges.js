/**
 * DataDojo Enterprise — SQL Assessment Curriculum
 * Structured into 4 progressive chapters (Bab 1 Free Fundamentals, Bab 2–4 Pro Membership).
 * Automatic evaluation compares user query result against `solution` on the same in-memory SQLite instance.
 */
window.SQL_CHAPTERS = [
  {
    id: 1,
    code: 'BAB 01',
    title: 'Fundamental Querying & Scalar Filtering',
    subtitle: 'Materi Dasar · Klausa SELECT, WHERE, GROUP BY, ORDER BY, dan Scalar Subquery',
    tier: 'free',
    badgeLabel: 'MATERI DASAR — GRATIS'
  },
  {
    id: 2,
    code: 'BAB 02',
    title: 'Relational Joins & Multi-Table Aggregation',
    subtitle: 'Materi Menengah · INNER JOIN, Anti-Join (LEFT JOIN + IS NULL), Time-Series Grouping & HAVING',
    tier: 'pro',
    badgeLabel: 'PRO MEMBERSHIP'
  },
  {
    id: 3,
    code: 'BAB 03',
    title: 'Conditional Metrics, Self-Joins & Executive Logic',
    subtitle: 'Materi Lanjutan · CASE WHEN Segmentation, Conditional Rate Aggregation, N-th Value & Hierarchical Self-Join',
    tier: 'pro',
    badgeLabel: 'PRO MEMBERSHIP'
  },
  {
    id: 4,
    code: 'BAB 04',
    title: 'Analytical Window Functions & Cohort Growth',
    subtitle: 'Materi Enterprise · Common Table Expressions (CTE), DENSE_RANK() PARTITION BY, Running Totals & LAG() MoM',
    tier: 'pro',
    badgeLabel: 'PRO MEMBERSHIP'
  }
];

window.SQL_CHALLENGES = [
  // =========================================================================
  // BAB 1 — FUNDAMENTAL QUERYING & SCALAR FILTERING (FREE TIER)
  // =========================================================================
  {
    id: 'sql-01',
    chapter: 1,
    chapterTitle: 'Bab 1: Fundamental Querying & Scalar Filtering',
    tier: 'free',
    title: 'Pelanggan dari Jakarta',
    difficulty: 'easy',
    tag: 'Filtering',
    concept: 'SELECT, WHERE, ORDER BY',
    prompt: 'Tim marketing ingin membuat campaign khusus Jakarta. Tampilkan `name` dan `signup_date` semua pelanggan yang berasal dari kota **Jakarta**, urutkan dari yang paling lama mendaftar.',
    columns: ['name', 'signup_date'],
    ordered: true,
    starter: '-- Tulis query kamu di sini\nSELECT\n  \nFROM customers\n',
    solution: "SELECT name, signup_date\nFROM customers\nWHERE city = 'Jakarta'\nORDER BY signup_date;",
    hints: [
      'Gunakan klausa WHERE untuk memfilter kolom city.',
      'String di SQL ditulis dengan kutip tunggal: \'Jakarta\'.',
      'ORDER BY secara default ascending (terlama → terbaru).'
    ],
    explanation: 'Pola dasar: SELECT kolom → FROM tabel → WHERE filter → ORDER BY urutan. Interviewer biasanya memakai soal ini sebagai pemanasan untuk melihat kerapian penulisan query.'
  },
  {
    id: 'sql-02',
    chapter: 1,
    chapterTitle: 'Bab 1: Fundamental Querying & Scalar Filtering',
    tier: 'free',
    title: 'Jumlah Pelanggan per Kota',
    difficulty: 'easy',
    tag: 'Aggregation',
    concept: 'GROUP BY, COUNT',
    prompt: 'Hitung jumlah pelanggan di setiap kota. Tampilkan `city` dan `total_customers`, urutkan dari jumlah terbanyak. Jika jumlahnya sama, urutkan berdasarkan nama kota (A-Z).',
    columns: ['city', 'total_customers'],
    ordered: true,
    starter: 'SELECT\n  city,\n  -- hitung di sini\nFROM customers\n',
    solution: 'SELECT city, COUNT(*) AS total_customers\nFROM customers\nGROUP BY city\nORDER BY total_customers DESC, city;',
    hints: [
      'Agregasi per kelompok membutuhkan GROUP BY.',
      'COUNT(*) menghitung jumlah baris di tiap grup.',
      'ORDER BY bisa memakai beberapa kolom: ORDER BY a DESC, b.'
    ],
    explanation: 'Setiap kolom di SELECT yang bukan fungsi agregat wajib ada di GROUP BY. Tie-breaker (urutan kedua) membuat hasil deterministik — detail kecil yang disukai interviewer.'
  },
  {
    id: 'sql-03',
    chapter: 1,
    chapterTitle: 'Bab 1: Fundamental Querying & Scalar Filtering',
    tier: 'free',
    title: 'Produk di Atas Rata-rata',
    difficulty: 'easy',
    tag: 'Subquery',
    concept: 'Subquery, AVG',
    prompt: 'Tampilkan `product_name` dan `price` untuk produk yang harganya **lebih tinggi dari rata-rata harga semua produk**. Urutkan dari harga tertinggi.',
    columns: ['product_name', 'price'],
    ordered: true,
    starter: 'SELECT product_name, price\nFROM products\nWHERE price > ( /* subquery */ )\n',
    solution: 'SELECT product_name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products)\nORDER BY price DESC;',
    hints: [
      'Kamu tidak bisa menulis WHERE price > AVG(price) secara langsung.',
      'Hitung rata-rata di subquery: (SELECT AVG(price) FROM products).'
    ],
    explanation: 'Fungsi agregat tidak boleh dipakai langsung di WHERE karena WHERE dievaluasi per baris sebelum agregasi. Scalar subquery adalah solusi paling umum.'
  },

  // =========================================================================
  // BAB 2 — RELATIONAL JOINS & MULTI-TABLE AGGREGATION (PRO TIER)
  // =========================================================================
  {
    id: 'sql-04',
    chapter: 2,
    chapterTitle: 'Bab 2: Relational Joins & Multi-Table Aggregation',
    tier: 'pro',
    title: 'Revenue per Kategori',
    difficulty: 'medium',
    tag: 'JOIN',
    concept: 'INNER JOIN 3 tabel, SUM',
    prompt: 'Hitung total revenue per kategori produk, **hanya untuk order berstatus `completed`**.\n\nRumus revenue per item: `quantity * price * (1 - discount)`.\n\nTampilkan `category` dan `revenue`, urutkan dari revenue terbesar.',
    columns: ['category', 'revenue'],
    ordered: true,
    starter: 'SELECT\n  p.category,\n  -- revenue\nFROM order_items oi\nJOIN orders o ON ...\nJOIN products p ON ...\n',
    solution: "SELECT p.category,\n       ROUND(SUM(oi.quantity * p.price * (1 - oi.discount)), 2) AS revenue\nFROM order_items oi\nJOIN orders o   ON o.order_id = oi.order_id\nJOIN products p ON p.product_id = oi.product_id\nWHERE o.status = 'completed'\nGROUP BY p.category\nORDER BY revenue DESC;",
    hints: [
      'order_items terhubung ke orders lewat order_id, dan ke products lewat product_id.',
      "Filter status di WHERE: o.status = 'completed'.",
      'SUM(oi.quantity * p.price * (1 - oi.discount)) lalu GROUP BY p.category.'
    ],
    explanation: 'Soal JOIN multi-tabel adalah soal paling sering muncul. Kuncinya: pahami grain (tingkat detail) tiap tabel. order_items adalah tabel fakta paling detail, jadi mulai dari sana.'
  },
  {
    id: 'sql-05',
    chapter: 2,
    chapterTitle: 'Bab 2: Relational Joins & Multi-Table Aggregation',
    tier: 'pro',
    title: 'Pelanggan yang Belum Pernah Order',
    difficulty: 'medium',
    tag: 'JOIN',
    concept: 'LEFT JOIN + IS NULL (anti-join)',
    prompt: 'Tim CRM ingin mengirim voucher ke pelanggan yang **belum pernah melakukan order sama sekali**. Tampilkan `customer_id` dan `name` mereka, urutkan berdasarkan `customer_id`.',
    columns: ['customer_id', 'name'],
    ordered: true,
    starter: 'SELECT c.customer_id, c.name\nFROM customers c\n',
    solution: 'SELECT c.customer_id, c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.order_id IS NULL\nORDER BY c.customer_id;',
    hints: [
      'LEFT JOIN mempertahankan semua baris dari tabel kiri walau tidak ada pasangan.',
      'Baris tanpa pasangan akan bernilai NULL di kolom tabel kanan.',
      'Alternatif: WHERE customer_id NOT IN (SELECT customer_id FROM orders).'
    ],
    explanation: 'Pola "anti-join" (LEFT JOIN ... WHERE kanan IS NULL) sangat populer di interview. Sebutkan juga alternatif NOT EXISTS — dan bahwa NOT IN berbahaya jika subquery mengandung NULL.'
  },
  {
    id: 'sql-06',
    chapter: 2,
    chapterTitle: 'Bab 2: Relational Joins & Multi-Table Aggregation',
    tier: 'pro',
    title: 'Revenue Bulanan 2025',
    difficulty: 'medium',
    tag: 'Date',
    concept: 'strftime, GROUP BY tanggal',
    prompt: 'Buat laporan revenue bulanan (order `completed` saja). Tampilkan `month` dengan format `YYYY-MM` dan `revenue`, urutkan dari bulan terlama.\n\nRevenue = `quantity * price * (1 - discount)`.\n\n_Catatan: database ini SQLite, gunakan `strftime(\'%Y-%m\', kolom_tanggal)`._',
    columns: ['month', 'revenue'],
    ordered: true,
    starter: "SELECT\n  strftime('%Y-%m', o.order_date) AS month,\n  -- revenue\nFROM orders o\n",
    solution: "SELECT strftime('%Y-%m', o.order_date) AS month,\n       ROUND(SUM(oi.quantity * p.price * (1 - oi.discount)), 2) AS revenue\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p     ON p.product_id = oi.product_id\nWHERE o.status = 'completed'\nGROUP BY month\nORDER BY month;",
    hints: [
      'Join orders → order_items → products.',
      'GROUP BY bisa memakai alias kolom di SQLite: GROUP BY month.'
    ],
    explanation: 'Di PostgreSQL gunakan DATE_TRUNC(\'month\', order_date), di MySQL DATE_FORMAT(order_date, \'%Y-%m\'). Menyebutkan perbedaan dialek menunjukkan pengalaman nyata.'
  },
  {
    id: 'sql-07',
    chapter: 2,
    chapterTitle: 'Bab 2: Relational Joins & Multi-Table Aggregation',
    tier: 'pro',
    title: 'Top 3 Produk Terlaris',
    difficulty: 'medium',
    tag: 'Aggregation',
    concept: 'GROUP BY, ORDER BY, LIMIT',
    prompt: 'Cari 3 produk dengan total **quantity terjual** terbanyak (order dengan status `completed` saja).\n\nTampilkan kolom `product_name` dan `total_qty`. Jika terdapat nilai quantity yang seri, urutkan berdasarkan `product_name` secara alfabetik A-Z.',
    columns: ['product_name', 'total_qty'],
    ordered: true,
    starter: 'SELECT\n  p.product_name,\n  -- total_qty\nFROM order_items oi\n',
    solution: "SELECT p.product_name, SUM(oi.quantity) AS total_qty\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id\nJOIN products p ON p.product_id = oi.product_id\nWHERE o.status = 'completed'\nGROUP BY p.product_id, p.product_name\nORDER BY total_qty DESC, p.product_name\nLIMIT 3;",
    hints: [
      'Gabungkan tabel order_items dengan orders dan products menggunakan relasi order_id dan product_id.',
      'Filter hanya order dengan status completed (WHERE o.status = "completed"), lalu kelompokkan dengan GROUP BY p.product_id, p.product_name.',
      'Gunakan SUM(oi.quantity) AS total_qty, urutkan ORDER BY total_qty DESC, p.product_name, dan batasi dengan LIMIT 3.'
    ],
    explanation: 'Follow-up yang sering ditanyakan saat live coding: "Bagaimana jika ada produk yang seri di posisi ke-3?" Jawabannya: gunakan DENSE_RANK() OVER (ORDER BY total_qty DESC) agar semua produk yang nilainya sama di posisi ke-3 ikut masuk ke dalam hasil.'
  },
  {
    id: 'sql-08',
    chapter: 2,
    chapterTitle: 'Bab 2: Relational Joins & Multi-Table Aggregation',
    tier: 'pro',
    title: 'Pelanggan Loyal',
    difficulty: 'medium',
    tag: 'Aggregation',
    concept: 'HAVING',
    prompt: 'Tampilkan pelanggan yang memiliki **minimal 8 order berstatus `completed`**. Tampilkan `name` dan `total_orders`, urutkan dari order terbanyak lalu nama A-Z.',
    columns: ['name', 'total_orders'],
    ordered: true,
    starter: 'SELECT c.name, COUNT(*) AS total_orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\n',
    solution: "SELECT c.name, COUNT(*) AS total_orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nWHERE o.status = 'completed'\nGROUP BY c.customer_id, c.name\nHAVING COUNT(*) >= 8\nORDER BY total_orders DESC, c.name;",
    hints: [
      'WHERE memfilter baris SEBELUM agregasi, HAVING memfilter grup SETELAH agregasi.',
      'HAVING COUNT(*) >= 8'
    ],
    explanation: 'Pertanyaan klasik "apa beda WHERE dan HAVING?" sering langsung dites lewat soal seperti ini.'
  },

  // =========================================================================
  // BAB 3 — CONDITIONAL METRICS, SELF-JOINS & EXECUTIVE LOGIC (PRO TIER)
  // =========================================================================
  {
    id: 'sql-14',
    chapter: 3,
    chapterTitle: 'Bab 3: Conditional Metrics, Self-Joins & Executive Logic',
    tier: 'pro',
    title: 'Segmentasi Tier Pelanggan',
    difficulty: 'medium',
    tag: 'CASE WHEN',
    concept: 'CASE WHEN + agregasi',
    prompt: 'Kelompokkan pelanggan berdasarkan total belanja (order `completed`):\n- `Platinum` jika total ≥ 100.000.000\n- `Gold` jika total ≥ 50.000.000\n- selain itu `Silver`\n\nTampilkan `name`, `total_spend`, `tier`, urutkan dari total_spend terbesar. Pelanggan tanpa order tidak perlu ditampilkan.',
    columns: ['name', 'total_spend', 'tier'],
    ordered: true,
    starter: 'SELECT\n  c.name,\n  -- total_spend\n  CASE\n    WHEN ... THEN \'Platinum\'\n  END AS tier\nFROM customers c\n',
    solution: "SELECT c.name,\n       ROUND(SUM(oi.quantity * p.price * (1 - oi.discount)), 2) AS total_spend,\n       CASE\n         WHEN SUM(oi.quantity * p.price * (1 - oi.discount)) >= 100000000 THEN 'Platinum'\n         WHEN SUM(oi.quantity * p.price * (1 - oi.discount)) >= 50000000  THEN 'Gold'\n         ELSE 'Silver'\n       END AS tier\nFROM customers c\nJOIN orders o       ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p     ON p.product_id = oi.product_id\nWHERE o.status = 'completed'\nGROUP BY c.customer_id, c.name\nORDER BY total_spend DESC;",
    hints: [
      'Hitung total belanja per pelanggan dulu dengan SUM + GROUP BY.',
      'CASE WHEN dievaluasi berurutan, jadi letakkan kondisi terbesar (Platinum) paling atas.'
    ],
    explanation: 'CASE WHEN adalah "if-else"-nya SQL. Bisa juga dikerjakan dengan CTE agar ekspresi SUM tidak ditulis berulang.'
  },
  {
    id: 'sql-15',
    chapter: 3,
    chapterTitle: 'Bab 3: Conditional Metrics, Self-Joins & Executive Logic',
    tier: 'pro',
    title: 'Cancellation Rate per Kota',
    difficulty: 'medium',
    tag: 'Metrics',
    concept: 'Conditional aggregation',
    prompt: 'Hitung **persentase order yang dibatalkan** (`status = \'cancelled\'`) per kota pelanggan.\n\nTampilkan `city`, `total_orders`, `cancel_rate_pct` (2 desimal), urutkan dari cancel rate tertinggi lalu kota A-Z.',
    columns: ['city', 'total_orders', 'cancel_rate_pct'],
    ordered: true,
    starter: 'SELECT\n  c.city,\n  COUNT(*) AS total_orders,\n  -- cancel_rate_pct\nFROM orders o\nJOIN customers c ON ...\n',
    solution: "SELECT c.city,\n       COUNT(*) AS total_orders,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 2) AS cancel_rate_pct\nFROM orders o\nJOIN customers c ON c.customer_id = o.customer_id\nGROUP BY c.city\nORDER BY cancel_rate_pct DESC, c.city;",
    hints: [
      "SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) menghitung jumlah order batal.",
      'Bagi dengan COUNT(*) dan kalikan 100.0.'
    ],
    explanation: 'Conditional aggregation (SUM + CASE) adalah cara paling efisien menghitung rate/rasio dalam satu kali scan tabel.'
  },
  {
    id: 'sql-09',
    chapter: 3,
    chapterTitle: 'Bab 3: Conditional Metrics, Self-Joins & Executive Logic',
    tier: 'pro',
    title: 'Gaji Tertinggi Kedua',
    difficulty: 'hard',
    tag: 'Classic',
    concept: 'Subquery / OFFSET',
    prompt: 'Soal legendaris! Dari tabel `employees`, cari **gaji tertinggi kedua** (nilai unik). Tampilkan dalam satu kolom bernama `second_highest_salary`.',
    columns: ['second_highest_salary'],
    ordered: true,
    starter: 'SELECT\n  -- second_highest_salary\nFROM employees\n',
    solution: 'SELECT MAX(salary) AS second_highest_salary\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);',
    hints: [
      'Gaji tertinggi kedua = gaji maksimum dari semua gaji yang lebih kecil dari gaji maksimum.',
      'Alternatif: SELECT DISTINCT salary ... ORDER BY salary DESC LIMIT 1 OFFSET 1.'
    ],
    explanation: 'Versi MAX + subquery aman karena mengembalikan NULL jika tidak ada gaji kedua. Versi umum "N-th highest" biasanya diselesaikan dengan DENSE_RANK().'
  },
  {
    id: 'sql-12',
    chapter: 3,
    chapterTitle: 'Bab 3: Conditional Metrics, Self-Joins & Executive Logic',
    tier: 'pro',
    title: 'Gaji Melebihi Atasan',
    difficulty: 'hard',
    tag: 'Self Join',
    concept: 'SELF JOIN',
    prompt: 'Cari karyawan yang gajinya **lebih besar dari gaji manajernya**. Tampilkan `employee`, `salary`, `manager`, `manager_salary`, urutkan berdasarkan nama karyawan.',
    columns: ['employee', 'salary', 'manager', 'manager_salary'],
    ordered: true,
    starter: 'SELECT\n  e.name AS employee,\n  ...\nFROM employees e\nJOIN employees m ON ...\n',
    solution: 'SELECT e.name AS employee, e.salary,\n       m.name AS manager, m.salary AS manager_salary\nFROM employees e\nJOIN employees m ON e.manager_id = m.employee_id\nWHERE e.salary > m.salary\nORDER BY e.name;',
    hints: [
      'Tabel employees bisa di-join dengan dirinya sendiri menggunakan alias berbeda.',
      'e.manager_id = m.employee_id menghubungkan karyawan ke manajernya.'
    ],
    explanation: 'Self join dipakai untuk data hierarki (karyawan–manajer, kategori–subkategori). Pastikan alias jelas agar query mudah dibaca.'
  },

  // =========================================================================
  // BAB 4 — ANALYTICAL WINDOW FUNCTIONS & COHORT GROWTH (PRO TIER)
  // =========================================================================
  {
    id: 'sql-10',
    chapter: 4,
    chapterTitle: 'Bab 4: Analytical Window Functions & Cohort Growth',
    tier: 'pro',
    title: 'Produk Terbaik per Kategori',
    difficulty: 'hard',
    tag: 'Window Function',
    concept: 'CTE, DENSE_RANK() OVER (PARTITION BY)',
    prompt: 'Untuk setiap kategori, cari produk dengan **revenue tertinggi** (order `completed`). Tampilkan `category`, `product_name`, dan `revenue`, urutkan berdasarkan `category` A-Z.\n\nRevenue = `quantity * price * (1 - discount)`.',
    columns: ['category', 'product_name', 'revenue'],
    ordered: true,
    starter: 'WITH product_revenue AS (\n  -- revenue per produk\n),\nranked AS (\n  -- ranking per kategori\n)\nSELECT ...\n',
    solution: "WITH product_revenue AS (\n  SELECT p.category, p.product_name,\n         SUM(oi.quantity * p.price * (1 - oi.discount)) AS revenue\n  FROM order_items oi\n  JOIN orders o   ON o.order_id = oi.order_id\n  JOIN products p ON p.product_id = oi.product_id\n  WHERE o.status = 'completed'\n  GROUP BY p.product_id, p.category, p.product_name\n),\nranked AS (\n  SELECT *, DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk\n  FROM product_revenue\n)\nSELECT category, product_name, ROUND(revenue, 2) AS revenue\nFROM ranked\nWHERE rnk = 1\nORDER BY category;",
    hints: [
      'Langkah 1: hitung revenue per produk di CTE.',
      'Langkah 2: DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC).',
      'Langkah 3: filter rnk = 1 (tidak bisa langsung di WHERE query yang sama dengan window function).'
    ],
    explanation: '"Top-N per group" adalah soal window function paling favorit. Ingat: window function dievaluasi setelah WHERE, sehingga filter ranking harus dilakukan di query luar / CTE.'
  },
  {
    id: 'sql-11',
    chapter: 4,
    chapterTitle: 'Bab 4: Analytical Window Functions & Cohort Growth',
    tier: 'pro',
    title: 'Running Total Revenue',
    difficulty: 'hard',
    tag: 'Window Function',
    concept: 'SUM() OVER (ORDER BY)',
    prompt: 'Buat laporan revenue bulanan (order `completed`) beserta **akumulasi revenue (running total)** sejak awal tahun.\n\nTampilkan `month` (YYYY-MM), `revenue`, dan `running_total`, urutkan berdasarkan bulan.',
    columns: ['month', 'revenue', 'running_total'],
    ordered: true,
    starter: 'WITH monthly AS (\n  -- revenue per bulan\n)\nSELECT\n  month,\n  revenue,\n  -- running_total\nFROM monthly\n',
    solution: "WITH monthly AS (\n  SELECT strftime('%Y-%m', o.order_date) AS month,\n         SUM(oi.quantity * p.price * (1 - oi.discount)) AS revenue\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  JOIN products p     ON p.product_id = oi.product_id\n  WHERE o.status = 'completed'\n  GROUP BY month\n)\nSELECT month,\n       ROUND(revenue, 2) AS revenue,\n       ROUND(SUM(revenue) OVER (ORDER BY month), 2) AS running_total\nFROM monthly\nORDER BY month;",
    hints: [
      'Gunakan hasil soal Revenue Bulanan sebagai CTE.',
      'SUM(revenue) OVER (ORDER BY month) menghasilkan akumulasi.'
    ],
    explanation: 'Window function dengan ORDER BY secara default memakai frame RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — itulah yang membuat running total.'
  },
  {
    id: 'sql-13',
    chapter: 4,
    chapterTitle: 'Bab 4: Analytical Window Functions & Cohort Growth',
    tier: 'pro',
    title: 'Pertumbuhan Month-over-Month',
    difficulty: 'hard',
    tag: 'Window Function',
    concept: 'LAG()',
    prompt: 'Hitung **pertumbuhan revenue bulanan (MoM %)** untuk order `completed`.\n\n`growth_pct = (revenue_bulan_ini - revenue_bulan_lalu) * 100 / revenue_bulan_lalu`, dibulatkan 2 desimal. Bulan pertama bernilai NULL.\n\nTampilkan `month`, `revenue`, `growth_pct`, urutkan berdasarkan bulan.',
    columns: ['month', 'revenue', 'growth_pct'],
    ordered: true,
    starter: 'WITH monthly AS (\n  -- revenue per bulan\n)\nSELECT ...\n',
    solution: "WITH monthly AS (\n  SELECT strftime('%Y-%m', o.order_date) AS month,\n         SUM(oi.quantity * p.price * (1 - oi.discount)) AS revenue\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  JOIN products p     ON p.product_id = oi.product_id\n  WHERE o.status = 'completed'\n  GROUP BY month\n)\nSELECT month,\n       ROUND(revenue, 2) AS revenue,\n       ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0\n             / LAG(revenue) OVER (ORDER BY month), 2) AS growth_pct\nFROM monthly\nORDER BY month;",
    hints: [
      'LAG(revenue) OVER (ORDER BY month) mengambil revenue bulan sebelumnya.',
      'Kalikan dengan 100.0 (bukan 100) agar tidak terjadi pembagian integer.'
    ],
    explanation: 'LAG/LEAD sangat sering dipakai untuk metrik growth, retention, dan selisih waktu antar event. Sebutkan juga risiko pembagian dengan nol (gunakan NULLIF).'
  }
];
