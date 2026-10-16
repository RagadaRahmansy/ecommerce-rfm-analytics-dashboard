/**
 * DataDojo Enterprise — SQL Assessment Curriculum (30 Modules: 3 Free + 27 Pro)
 * Structured into 4 progressive chapters (Bab 1 Free Fundamentals, Bab 2–4 Pro Membership).
 * Automatic evaluation compares user query result against `solution` on the same in-memory SQLite instance.
 */
window.SQL_CHAPTERS = [
  {
    id: 1,
    code: 'BAB 01',
    title: 'Fundamental Querying & Scalar Filtering',
    subtitle: 'Materi Dasar (3 Modul) · Klausa SELECT, WHERE, GROUP BY, ORDER BY, dan Scalar Subquery',
    tier: 'free',
    badgeLabel: 'MATERI DASAR — GRATIS'
  },
  {
    id: 2,
    code: 'BAB 02',
    title: 'Relational Joins & Multi-Table Aggregation',
    subtitle: 'Materi Menengah (9 Modul Pro) · INNER JOIN, Anti-Join, Gross Margin, Segment AOV, Payroll & HAVING',
    tier: 'pro',
    badgeLabel: 'PRO MEMBERSHIP'
  },
  {
    id: 3,
    code: 'BAB 03',
    title: 'Conditional Metrics, Self-Joins & Executive Logic',
    subtitle: 'Materi Lanjutan (9 Modul Pro) · CASE WHEN Segmentation, Discount Ratio, Correlated Subquery, Quarterly KPI & Cross-Shopper',
    tier: 'pro',
    badgeLabel: 'PRO MEMBERSHIP'
  },
  {
    id: 4,
    code: 'BAB 04',
    title: 'Analytical Window Functions & Cohort Growth',
    subtitle: 'Materi Enterprise (9 Modul Pro) · CTE, DENSE_RANK, Running Totals, LAG() MoM, Moving Average, Inter-Order Gap & Pareto 80/20',
    tier: 'pro',
    badgeLabel: 'PRO MEMBERSHIP'
  }
];

window.SQL_CHALLENGES = [
  // =========================================================================
  // BAB 1 — FUNDAMENTAL QUERYING & SCALAR FILTERING (FREE TIER · 3 MODULES)
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
  // BAB 2 — RELATIONAL JOINS & MULTI-TABLE AGGREGATION (PRO TIER · 9 MODULES)
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
  {
    id: 'sql-16',
    chapter: 2,
    chapterTitle: 'Bab 2: Relational Joins & Multi-Table Aggregation',
    tier: 'pro',
    title: 'Gross Profit per Produk',
    difficulty: 'medium',
    tag: 'Unit Economics',
    concept: 'Multi-Table JOIN & Net Profit Calculation',
    prompt: 'Tim Finance ingin mengevaluasi profitabilitas tiap produk dari order berstatus `completed`.\n\nRumus:\n- `net_revenue` = `SUM(quantity * price * (1 - discount))`\n- `total_cost` = `SUM(quantity * cost)`\n- `gross_profit` = `net_revenue - total_cost` (bulatkan 2 desimal)\n\nTampilkan `product_name`, `category`, dan `gross_profit`, urutkan dari `gross_profit` terbesar.',
    columns: ['product_name', 'category', 'gross_profit'],
    ordered: true,
    starter: 'SELECT\n  p.product_name,\n  p.category,\n  -- hitung gross_profit di sini\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id\nJOIN products p ON p.product_id = oi.product_id\n',
    solution: "SELECT p.product_name,\n       p.category,\n       ROUND(SUM(oi.quantity * (p.price * (1 - oi.discount) - p.cost)), 2) AS gross_profit\nFROM order_items oi\nJOIN orders o   ON o.order_id = oi.order_id\nJOIN products p ON p.product_id = oi.product_id\nWHERE o.status = 'completed'\nGROUP BY p.product_id, p.product_name, p.category\nORDER BY gross_profit DESC;",
    hints: [
      'Profit per unit adalah (p.price * (1 - oi.discount) - p.cost).',
      'Kalikan dengan oi.quantity lalu bungkus dengan SUM() dan ROUND(..., 2).'
    ],
    explanation: 'Dalam analisis e-commerce nyata, produk dengan revenue tertinggi belum tentu memiliki gross profit tertinggi akibat diskon dan HPP (cost).'
  },
  {
    id: 'sql-17',
    chapter: 2,
    chapterTitle: 'Bab 2: Relational Joins & Multi-Table Aggregation',
    tier: 'pro',
    title: 'Average Order Value (AOV) per Segmen',
    difficulty: 'medium',
    tag: 'Business KPI',
    concept: 'CTE Order Level + JOIN Customers',
    prompt: 'Hitung **Average Order Value (AOV)** untuk setiap `segment` pelanggan (hanya order `completed`).\n\n_Penting:_ AOV adalah **rata-rata nilai per order** (bukan rata-rata per baris item). Hitung nilai total per `order_id` terlebih dahulu, lalu rata-ratakan per `segment` (bulatkan 2 desimal).\n\nTampilkan `segment`, `total_orders`, dan `aov`, urutkan dari `aov` terbesar.',
    columns: ['segment', 'total_orders', 'aov'],
    ordered: true,
    starter: 'WITH order_totals AS (\n  SELECT o.order_id, o.customer_id,\n         SUM(oi.quantity * p.price * (1 - oi.discount)) AS order_value\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  JOIN products p ON p.product_id = oi.product_id\n  WHERE o.status = \'completed\'\n  GROUP BY o.order_id, o.customer_id\n)\nSELECT ...\n',
    solution: "WITH order_totals AS (\n  SELECT o.order_id, o.customer_id,\n         SUM(oi.quantity * p.price * (1 - oi.discount)) AS order_value\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  JOIN products p     ON p.product_id = oi.product_id\n  WHERE o.status = 'completed'\n  GROUP BY o.order_id, o.customer_id\n)\nSELECT c.segment,\n       COUNT(ot.order_id) AS total_orders,\n       ROUND(AVG(ot.order_value), 2) AS aov\nFROM order_totals ot\nJOIN customers c ON c.customer_id = ot.customer_id\nGROUP BY c.segment\nORDER BY aov DESC;",
    hints: [
      'Jika langsung AVG(qty * price) di tabel order_items, itu adalah Average Item Value, bukan Average Order Value (AOV).',
      'Gunakan CTE order_totals untuk menjumlahkan nilai per order_id terlebih dahulu, lalu AVG(order_value) per segmen.'
    ],
    explanation: 'Ini adalah jebakan (trap) paling terkenal di interview Data Analyst: membedakan grain order_items vs grain orders saat menghitung AOV.'
  },
  {
    id: 'sql-18',
    chapter: 2,
    chapterTitle: 'Bab 2: Relational Joins & Multi-Table Aggregation',
    tier: 'pro',
    title: 'Ringkasan Payroll per Departemen',
    difficulty: 'medium',
    tag: 'HR Analytics',
    concept: 'Multi-Metric Aggregation (COUNT, SUM, AVG)',
    prompt: 'Dari tabel `employees`, buat laporan anggaran gaji per `department`. Tampilkan:\n- `department`\n- `headcount` (jumlah karyawan)\n- `total_payroll` (total gaji)\n- `avg_salary` (rata-rata gaji, dibulatkan 2 desimal)\n\nUrutkan dari `total_payroll` terbesar.',
    columns: ['department', 'headcount', 'total_payroll', 'avg_salary'],
    ordered: true,
    starter: 'SELECT\n  department,\n  -- headcount, total_payroll, avg_salary\nFROM employees\n',
    solution: 'SELECT department,\n       COUNT(*) AS headcount,\n       SUM(salary) AS total_payroll,\n       ROUND(AVG(salary), 2) AS avg_salary\nFROM employees\nGROUP BY department\nORDER BY total_payroll DESC;',
    hints: [
      'Gunakan COUNT(*), SUM(salary), dan ROUND(AVG(salary), 2).',
      'Kelompokkan berdasarkan department dan urutkan dari total_payroll DESC.'
    ],
    explanation: 'Menggabungkan beberapa fungsi agregat dalam satu query memungkinkan pembuatan tabel ringkasan eksekutif dalam satu kali pembacaan tabel.'
  },
  {
    id: 'sql-19',
    chapter: 2,
    chapterTitle: 'Bab 2: Relational Joins & Multi-Table Aggregation',
    tier: 'pro',
    title: 'Kota dengan Revenue di Atas 40 Juta',
    difficulty: 'medium',
    tag: 'JOIN & HAVING',
    concept: '4-Table JOIN + HAVING Aggregate Filter',
    prompt: 'Cari kota pelanggan (`city`) yang menghasilkan total revenue (order `completed`) **lebih dari 40.000.000**.\n\nTampilkan `city`, `completed_orders` (jumlah order unik `COUNT(DISTINCT o.order_id)`), dan `total_revenue` (bulatkan 2 desimal). Urutkan dari `total_revenue` terbesar.',
    columns: ['city', 'completed_orders', 'total_revenue'],
    ordered: true,
    starter: 'SELECT\n  c.city,\n  COUNT(DISTINCT o.order_id) AS completed_orders,\n  -- total_revenue\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\n',
    solution: "SELECT c.city,\n       COUNT(DISTINCT o.order_id) AS completed_orders,\n       ROUND(SUM(oi.quantity * p.price * (1 - oi.discount)), 2) AS total_revenue\nFROM customers c\nJOIN orders o       ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p     ON p.product_id = oi.product_id\nWHERE o.status = 'completed'\nGROUP BY c.city\nHAVING SUM(oi.quantity * p.price * (1 - oi.discount)) > 40000000\nORDER BY total_revenue DESC;",
    hints: [
      'Gunakan COUNT(DISTINCT o.order_id) karena satu order bisa memiliki beberapa baris di order_items.',
      'Filter agregat > 40000000 menggunakan klausa HAVING.'
    ],
    explanation: 'Saat melakukan JOIN antara orders (1) dan order_items (many), menghitung jumlah order wajib memakai COUNT(DISTINCT o.order_id) agar tidak terhitung ganda (fan trap).'
  },

  // =========================================================================
  // BAB 3 — CONDITIONAL METRICS, SELF-JOINS & EXECUTIVE LOGIC (PRO TIER · 9 MODULES)
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
  {
    id: 'sql-20',
    chapter: 3,
    chapterTitle: 'Bab 3: Conditional Metrics, Self-Joins & Executive Logic',
    tier: 'pro',
    title: 'Rasio Penjualan Diskon per Kategori',
    difficulty: 'medium',
    tag: 'Promo Analytics',
    concept: 'Conditional SUM Revenue Share',
    prompt: 'Untuk order berstatus `completed`, hitung berapa persen revenue di tiap kategori yang berasal dari **item berdiskon (`discount > 0`)** dibanding total revenue kategori tersebut.\n\nTampilkan `category`, `total_revenue` (2 desimal), dan `discounted_rev_pct` (2 desimal). Urutkan dari `discounted_rev_pct` tertinggi.',
    columns: ['category', 'total_revenue', 'discounted_rev_pct'],
    ordered: true,
    starter: 'SELECT\n  p.category,\n  ROUND(SUM(oi.quantity * p.price * (1 - oi.discount)), 2) AS total_revenue,\n  -- discounted_rev_pct\nFROM order_items oi\n',
    solution: "SELECT p.category,\n       ROUND(SUM(oi.quantity * p.price * (1 - oi.discount)), 2) AS total_revenue,\n       ROUND(100.0 * SUM(CASE WHEN oi.discount > 0 THEN oi.quantity * p.price * (1 - oi.discount) ELSE 0 END)\n             / SUM(oi.quantity * p.price * (1 - oi.discount)), 2) AS discounted_rev_pct\nFROM order_items oi\nJOIN orders o   ON o.order_id = oi.order_id\nJOIN products p ON p.product_id = oi.product_id\nWHERE o.status = 'completed'\nGROUP BY p.category\nORDER BY discounted_rev_pct DESC;",
    hints: [
      'Gunakan SUM(CASE WHEN oi.discount > 0 THEN net_rev ELSE 0 END) sebagai pembilang.',
      'Kalikan 100.0 dan bagi dengan total SUM(net_rev) kategori tersebut.'
    ],
    explanation: 'Metrik promo share sangat krusial bagi tim Commercial untuk mendeteksi kategori produk yang terlalu bergantung pada diskon.'
  },
  {
    id: 'sql-21',
    chapter: 3,
    chapterTitle: 'Bab 3: Conditional Metrics, Self-Joins & Executive Logic',
    tier: 'pro',
    title: 'Manajer & Ukuran Tim Langsung',
    difficulty: 'medium',
    tag: 'Hierarchy',
    concept: 'SELF JOIN + GROUP BY Manager',
    prompt: 'Tampilkan semua **manajer** yang memiliki bawahan langsung (direct reports) di tabel `employees`.\n\nTampilkan `manager_name`, `department` (departemen sang manajer), `direct_reports` (jumlah bawahan langsung), dan `avg_team_salary` (rata-rata gaji bawahan, dibulatkan 2 desimal). Urutkan dari `direct_reports` terbanyak lalu `manager_name` A-Z.',
    columns: ['manager_name', 'department', 'direct_reports', 'avg_team_salary'],
    ordered: true,
    starter: 'SELECT\n  m.name AS manager_name,\n  m.department,\n  -- direct_reports & avg_team_salary\nFROM employees m\nJOIN employees r ON r.manager_id = m.employee_id\n',
    solution: 'SELECT m.name AS manager_name,\n       m.department,\n       COUNT(r.employee_id) AS direct_reports,\n       ROUND(AVG(r.salary), 2) AS avg_team_salary\nFROM employees m\nJOIN employees r ON r.manager_id = m.employee_id\nGROUP BY m.employee_id, m.name, m.department\nORDER BY direct_reports DESC, manager_name;',
    hints: [
      'Hubungkan tabel employees m (sebagai manajer) dengan employees r (sebagai bawahan) melalui r.manager_id = m.employee_id.',
      'Hitung COUNT(r.employee_id) dan ROUND(AVG(r.salary), 2).'
    ],
    explanation: 'Mengagregasi data hierarki lewat self-join sering ditanyakan untuk mengukur span of control manajer.'
  },
  {
    id: 'sql-22',
    chapter: 3,
    chapterTitle: 'Bab 3: Conditional Metrics, Self-Joins & Executive Logic',
    tier: 'pro',
    title: 'Gaji di Atas Rata-rata Departemen',
    difficulty: 'hard',
    tag: 'Correlated Subquery',
    concept: 'Correlated Subquery / CTE Benchmark',
    prompt: 'Cari karyawan yang gajinya **lebih tinggi dari rata-rata gaji di departemennya masing-masing**.\n\nTampilkan `name`, `department`, `salary`, dan `dept_avg_salary` (rata-rata gaji departemennya, dibulatkan 2 desimal). Urutkan berdasarkan `department` A-Z lalu `salary` tertinggi.',
    columns: ['name', 'department', 'salary', 'dept_avg_salary'],
    ordered: true,
    starter: 'WITH dept_avg AS (\n  SELECT department, AVG(salary) AS avg_sal\n  FROM employees\n  GROUP BY department\n)\nSELECT ...\n',
    solution: 'WITH dept_avg AS (\n  SELECT department, AVG(salary) AS avg_sal\n  FROM employees\n  GROUP BY department\n)\nSELECT e.name,\n       e.department,\n       e.salary,\n       ROUND(d.avg_sal, 2) AS dept_avg_salary\nFROM employees e\nJOIN dept_avg d ON d.department = e.department\nWHERE e.salary > d.avg_sal\nORDER BY e.department, e.salary DESC;',
    hints: [
      'Hitung rata-rata gaji per departemen di CTE dept_avg (atau gunakan AVG(salary) OVER (PARTITION BY department)).',
      'Filter hanya baris dengan e.salary > d.avg_sal.'
    ],
    explanation: 'Membandingkan metrik individu terhadap benchmark kelompoknya (departemen/kota/kategori) adalah pola analitik inti di HR dan kompensasi.'
  },
  {
    id: 'sql-23',
    chapter: 3,
    chapterTitle: 'Bab 3: Conditional Metrics, Self-Joins & Executive Logic',
    tier: 'pro',
    title: 'Performa Kuartalan (Q1–Q4) 2025',
    difficulty: 'medium',
    tag: 'Time Bucketing',
    concept: 'CASE WHEN Date Quarter Bucketing',
    prompt: 'Kelompokkan seluruh order berstatus `completed` ke dalam kuartal (`Q1`, `Q2`, `Q3`, `Q4`) berdasarkan bulan `order_date`:\n- Bulan 01–03 → `Q1`\n- Bulan 04–06 → `Q2`\n- Bulan 07–09 → `Q3`\n- Bulan 10–12 → `Q4`\n\nTampilkan `quarter`, `completed_orders` (`COUNT(DISTINCT o.order_id)`), dan `revenue` (bulatkan 2 desimal), urutkan berdasarkan `quarter` (`Q1` s/d `Q4`).',
    columns: ['quarter', 'completed_orders', 'revenue'],
    ordered: true,
    starter: "SELECT\n  CASE\n    WHEN CAST(strftime('%m', o.order_date) AS INTEGER) <= 3 THEN 'Q1'\n    -- lanjutkan Q2, Q3, Q4\n  END AS quarter,\n  ...\n",
    solution: "SELECT CASE\n         WHEN CAST(strftime('%m', o.order_date) AS INTEGER) <= 3 THEN 'Q1'\n         WHEN CAST(strftime('%m', o.order_date) AS INTEGER) <= 6 THEN 'Q2'\n         WHEN CAST(strftime('%m', o.order_date) AS INTEGER) <= 9 THEN 'Q3'\n         ELSE 'Q4'\n       END AS quarter,\n       COUNT(DISTINCT o.order_id) AS completed_orders,\n       ROUND(SUM(oi.quantity * p.price * (1 - oi.discount)), 2) AS revenue\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p     ON p.product_id = oi.product_id\nWHERE o.status = 'completed'\nGROUP BY quarter\nORDER BY quarter;",
    hints: [
      "CAST(strftime('%m', o.order_date) AS INTEGER) mengubah bulan menjadi angka 1..12.",
      'Gunakan CASE WHEN untuk memetakan 1..3 ke Q1, 4..6 ke Q2, 7..9 ke Q3, dan sisanya Q4.'
    ],
    explanation: 'Di SQLite tidak ada fungsi QUARTER() bawaan, sehingga transformasi bulan dengan CASE WHEN atau perhitungan integer ((bulan-1)/3 + 1) menjadi keterampilan penting.'
  },
  {
    id: 'sql-24',
    chapter: 3,
    chapterTitle: 'Bab 3: Conditional Metrics, Self-Joins & Executive Logic',
    tier: 'pro',
    title: 'Omnichannel Cross-Category Shoppers',
    difficulty: 'hard',
    tag: 'Cohort Logic',
    concept: 'HAVING COUNT(DISTINCT category)',
    prompt: 'Tim Retensi ingin memberi apresiasi kepada pelanggan yang pernah membeli produk dari **ketiga kategori berbeda** (`Electronics`, `Furniture`, dan `Books`) pada order berstatus `completed`.\n\nTampilkan `customer_id`, `name`, `distinct_categories` (bernilai 3), dan `total_spend` (bulatkan 2 desimal). Urutkan dari `total_spend` terbesar.',
    columns: ['customer_id', 'name', 'distinct_categories', 'total_spend'],
    ordered: true,
    starter: 'SELECT\n  c.customer_id,\n  c.name,\n  COUNT(DISTINCT p.category) AS distinct_categories,\n  -- total_spend\nFROM customers c\n',
    solution: "SELECT c.customer_id,\n       c.name,\n       COUNT(DISTINCT p.category) AS distinct_categories,\n       ROUND(SUM(oi.quantity * p.price * (1 - oi.discount)), 2) AS total_spend\nFROM customers c\nJOIN orders o       ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p     ON p.product_id = oi.product_id\nWHERE o.status = 'completed'\nGROUP BY c.customer_id, c.name\nHAVING COUNT(DISTINCT p.category) = 3\nORDER BY total_spend DESC;",
    hints: [
      'Gunakan COUNT(DISTINCT p.category) untuk menghitung berapa variasi kategori yang pernah dibeli pelanggan.',
      'Filter dengan HAVING COUNT(DISTINCT p.category) = 3.'
    ],
    explanation: 'Pola relational division ("pelanggan yang membeli semua kategori") diselesaikan secara elegan menggunakan HAVING COUNT(DISTINCT ...).'
  },

  // =========================================================================
  // BAB 4 — ANALYTICAL WINDOW FUNCTIONS & COHORT GROWTH (PRO TIER · 9 MODULES)
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
  },
  {
    id: 'sql-25',
    chapter: 4,
    chapterTitle: 'Bab 4: Analytical Window Functions & Cohort Growth',
    tier: 'pro',
    title: 'Kontribusi Revenue Produk per Kategori (% Share)',
    difficulty: 'hard',
    tag: 'Window Partition',
    concept: 'SUM() OVER (PARTITION BY category)',
    prompt: 'Hitung revenue tiap produk (order `completed`) sekaligus **persentase kontribusinya (`category_share_pct`) terhadap total revenue kategorinya masing-masing** (bulatkan 2 desimal).\n\nTampilkan `category`, `product_name`, `revenue`, dan `category_share_pct`. Urutkan berdasarkan `category` A-Z lalu `revenue` tertinggi.',
    columns: ['category', 'product_name', 'revenue', 'category_share_pct'],
    ordered: true,
    starter: 'WITH prod_rev AS (\n  SELECT p.category, p.product_name,\n         SUM(oi.quantity * p.price * (1 - oi.discount)) AS revenue\n  FROM order_items oi\n  JOIN orders o ON o.order_id = oi.order_id\n  JOIN products p ON p.product_id = oi.product_id\n  WHERE o.status = \'completed\'\n  GROUP BY p.product_id, p.category, p.product_name\n)\nSELECT ...\n',
    solution: "WITH prod_rev AS (\n  SELECT p.category, p.product_name,\n         SUM(oi.quantity * p.price * (1 - oi.discount)) AS revenue\n  FROM order_items oi\n  JOIN orders o   ON o.order_id = oi.order_id\n  JOIN products p ON p.product_id = oi.product_id\n  WHERE o.status = 'completed'\n  GROUP BY p.product_id, p.category, p.product_name\n)\nSELECT category,\n       product_name,\n       ROUND(revenue, 2) AS revenue,\n       ROUND(100.0 * revenue / SUM(revenue) OVER (PARTITION BY category), 2) AS category_share_pct\nFROM prod_rev\nORDER BY category, revenue DESC;",
    hints: [
      'SUM(revenue) OVER (PARTITION BY category) menghitung total revenue satu kategori tanpa meringkas baris produk.',
      'Bagi revenue produk dengan total kategori lalu kalikan 100.0.'
    ],
    explanation: 'SUM() OVER (PARTITION BY ...) adalah padanan SQL untuk CALCULATE([Sales], ALL(Product[Name])) di DAX Power BI.'
  },
  {
    id: 'sql-26',
    chapter: 4,
    chapterTitle: 'Bab 4: Analytical Window Functions & Cohort Growth',
    tier: 'pro',
    title: 'Peringkat Gaji Karyawan per Departemen',
    difficulty: 'hard',
    tag: 'Window Ranking',
    concept: 'DENSE_RANK() OVER (PARTITION BY department)',
    prompt: 'Untuk setiap karyawan di tabel `employees`, berikan peringkat gaji di dalam departemennya (`dept_rank`, urutan gaji terbesar = 1) menggunakan `DENSE_RANK()`.\n\nTampilkan `department`, `name`, `salary`, dan `dept_rank`. Urutkan berdasarkan `department` A-Z, `dept_rank` ASC, lalu `name` A-Z.',
    columns: ['department', 'name', 'salary', 'dept_rank'],
    ordered: true,
    starter: 'SELECT\n  department,\n  name,\n  salary,\n  -- dept_rank\nFROM employees\n',
    solution: 'SELECT department,\n       name,\n       salary,\n       DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank\nFROM employees\nORDER BY department, dept_rank, name;',
    hints: [
      'Gunakan DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC).',
      'Urutkan hasil akhir dengan ORDER BY department, dept_rank, name.'
    ],
    explanation: 'Berbeda dengan GROUP BY, window ranking mempertahankan seluruh baris karyawan sambil menyematkan posisi relatif mereka di departemennya.'
  },
  {
    id: 'sql-27',
    chapter: 4,
    chapterTitle: 'Bab 4: Analytical Window Functions & Cohort Growth',
    tier: 'pro',
    title: '3-Month Moving Average Revenue',
    difficulty: 'hard',
    tag: 'Window Frame',
    concept: 'AVG() OVER (ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)',
    prompt: 'Untuk memperhalus fluktuasi bulanan, hitung **rata-rata bergerak 3 bulan (`moving_avg_3m`)** atas revenue bulanan (order `completed`).\n\nFrame rata-rata bergerak mencakup bulan saat ini dan 2 bulan sebelumnya (`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`). Bulatkan `revenue` dan `moving_avg_3m` ke 2 desimal.\n\nTampilkan `month`, `revenue`, dan `moving_avg_3m`, urutkan berdasarkan `month`.',
    columns: ['month', 'revenue', 'moving_avg_3m'],
    ordered: true,
    starter: 'WITH monthly AS (\n  -- revenue bulanan\n)\nSELECT\n  month,\n  ROUND(revenue, 2) AS revenue,\n  -- moving_avg_3m\nFROM monthly\n',
    solution: "WITH monthly AS (\n  SELECT strftime('%Y-%m', o.order_date) AS month,\n         SUM(oi.quantity * p.price * (1 - oi.discount)) AS revenue\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  JOIN products p     ON p.product_id = oi.product_id\n  WHERE o.status = 'completed'\n  GROUP BY month\n)\nSELECT month,\n       ROUND(revenue, 2) AS revenue,\n       ROUND(AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3m\nFROM monthly\nORDER BY month;",
    hints: [
      'Gunakan klausa frame eksplisit: AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW).',
      'Pada bulan ke-1 dan ke-2, SQLite otomatis merata-ratakan baris yang tersedia.'
    ],
    explanation: 'Klausa ROWS BETWEEN sangat sering diujikan di wawancara Senior Data Analyst untuk menguji pemahaman perbedaan antara ROWS dan RANGE.'
  },
  {
    id: 'sql-28',
    chapter: 4,
    chapterTitle: 'Bab 4: Analytical Window Functions & Cohort Growth',
    tier: 'pro',
    title: 'Rata-rata Jeda Hari Antar Order Pelanggan',
    difficulty: 'hard',
    tag: 'Retention Cohort',
    concept: 'LAG(order_date) + JULIANDAY Diff',
    prompt: 'Untuk pelanggan yang memiliki **minimal 3 order berstatus `completed`**, hitung rata-rata selisih hari antar order berurutan mereka (`avg_days_between_orders`, bulatkan 2 desimal).\n\n_Petunjuk SQLite:_ Gunakan `JULIANDAY(order_date) - JULIANDAY(prev_order_date)` untuk menghitung selisih hari.\n\nTampilkan `customer_id`, `name`, `completed_orders`, dan `avg_days_between_orders`, urutkan dari `avg_days_between_orders` terkecil (paling sering belanja).',
    columns: ['customer_id', 'name', 'completed_orders', 'avg_days_between_orders'],
    ordered: true,
    starter: 'WITH ordered_tx AS (\n  SELECT o.customer_id, o.order_date,\n         LAG(o.order_date) OVER (PARTITION BY o.customer_id ORDER BY o.order_date, o.order_id) AS prev_date\n  FROM orders o\n  WHERE o.status = \'completed\'\n)\nSELECT ...\n',
    solution: "WITH ordered_tx AS (\n  SELECT o.customer_id,\n         o.order_date,\n         LAG(o.order_date) OVER (PARTITION BY o.customer_id ORDER BY o.order_date, o.order_id) AS prev_date\n  FROM orders o\n  WHERE o.status = 'completed'\n)\nSELECT c.customer_id,\n       c.name,\n       COUNT(*) AS completed_orders,\n       ROUND(AVG(JULIANDAY(ot.order_date) - JULIANDAY(ot.prev_date)), 2) AS avg_days_between_orders\nFROM ordered_tx ot\nJOIN customers c ON c.customer_id = ot.customer_id\nGROUP BY c.customer_id, c.name\nHAVING COUNT(*) >= 3\nORDER BY avg_days_between_orders ASC;",
    hints: [
      'Gunakan LAG(o.order_date) OVER (PARTITION BY o.customer_id ORDER BY o.order_date, o.order_id) di CTE.',
      'Fungsi AVG() secara otomatis mengabaikan baris order pertama yang prev_date-nya NULL.'
    ],
    explanation: 'Inter-purchase time (rata-rata hari antar transaksi) adalah indikator prediktif utama untuk mendeteksi risiko churn pelanggan.'
  },
  {
    id: 'sql-29',
    chapter: 4,
    chapterTitle: 'Bab 4: Analytical Window Functions & Cohort Growth',
    tier: 'pro',
    title: 'Order Completed Pertama Tiap Pelanggan',
    difficulty: 'hard',
    tag: 'First Touch Attribution',
    concept: 'ROW_NUMBER() OVER (PARTITION BY customer_id)',
    prompt: 'Untuk setiap pelanggan yang pernah menyelesaikan order (`status = \'completed\'`), temukan **order completed pertama** mereka (urutkan berdasarkan `order_date` ASC, lalu `order_id` ASC).\n\nTampilkan `customer_id`, `name`, `first_order_id`, dan `first_order_date`, urutkan berdasarkan `customer_id` ASC.',
    columns: ['customer_id', 'name', 'first_order_id', 'first_order_date'],
    ordered: true,
    starter: 'WITH ranked_orders AS (\n  SELECT o.customer_id, o.order_id, o.order_date,\n         ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.order_date, o.order_id) AS rn\n  FROM orders o\n  WHERE o.status = \'completed\'\n)\nSELECT ...\n',
    solution: "WITH ranked_orders AS (\n  SELECT o.customer_id,\n         o.order_id,\n         o.order_date,\n         ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.order_date, o.order_id) AS rn\n  FROM orders o\n  WHERE o.status = 'completed'\n)\nSELECT c.customer_id,\n       c.name,\n       ro.order_id AS first_order_id,\n       ro.order_date AS first_order_date\nFROM ranked_orders ro\nJOIN customers c ON c.customer_id = ro.customer_id\nWHERE ro.rn = 1\nORDER BY c.customer_id;",
    hints: [
      'Berikan nomor urut per pelanggan dengan ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.order_date, o.order_id).',
      'Ambil baris dengan rn = 1.'
    ],
    explanation: 'Pola ROW_NUMBER() = 1 adalah teknik standar industri untuk First-Touch Attribution dan deduplikasi event log.'
  },
  {
    id: 'sql-30',
    chapter: 4,
    chapterTitle: 'Bab 4: Analytical Window Functions & Cohort Growth',
    tier: 'pro',
    title: 'Analisis Pareto & Kumulatif Share Produk',
    difficulty: 'hard',
    tag: 'Pareto 80/20',
    concept: 'Cumulative Window SUM / Grand Total Window SUM',
    prompt: 'Urutkan seluruh produk dari revenue tertinggi ke terendah (order `completed`), lalu hitung **persentase kumulatif revenue (`cumulative_share_pct`, 2 desimal)** dari produk peringkat pertama hingga produk baris tersebut terhadap total revenue keseluruhan.\n\nTampilkan `product_name`, `revenue` (2 desimal), dan `cumulative_share_pct` (2 desimal). Urutkan dari `revenue` tertinggi.',
    columns: ['product_name', 'revenue', 'cumulative_share_pct'],
    ordered: true,
    starter: 'WITH prod_rev AS (\n  SELECT p.product_name,\n         SUM(oi.quantity * p.price * (1 - oi.discount)) AS revenue\n  FROM order_items oi\n  JOIN orders o ON o.order_id = oi.order_id\n  JOIN products p ON p.product_id = oi.product_id\n  WHERE o.status = \'completed\'\n  GROUP BY p.product_id, p.product_name\n)\nSELECT ...\n',
    solution: "WITH prod_rev AS (\n  SELECT p.product_name,\n         SUM(oi.quantity * p.price * (1 - oi.discount)) AS revenue\n  FROM order_items oi\n  JOIN orders o   ON o.order_id = oi.order_id\n  JOIN products p ON p.product_id = oi.product_id\n  WHERE o.status = 'completed'\n  GROUP BY p.product_id, p.product_name\n)\nSELECT product_name,\n       ROUND(revenue, 2) AS revenue,\n       ROUND(100.0 * SUM(revenue) OVER (ORDER BY revenue DESC, product_name ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\n             / SUM(revenue) OVER (), 2) AS cumulative_share_pct\nFROM prod_rev\nORDER BY revenue DESC, product_name;",
    hints: [
      'SUM(revenue) OVER (ORDER BY revenue DESC, product_name ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) menghitung kumulatif revenue.',
      'SUM(revenue) OVER () menghitung grand total seluruh produk.'
    ],
    explanation: 'Kurva Pareto (80/20 rule) digunakan oleh tim Supply Chain & Merchandising untuk mengidentifikasi SKU penyumbang 80% omzet perusahaan.'
  }
];
