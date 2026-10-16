/**
 * DataDojo Enterprise — Python & pandas Assessment Curriculum
 * Structured into 4 progressive chapters (Bab 1 Free Fundamentals, Bab 2–4 Pro Membership).
 * Automatic evaluation executes user code and `solution` against identical `setup` state in Pyodide.
 */
(() => {
  const SALES_SETUP = `import pandas as pd
import numpy as np

df = pd.DataFrame({
    'order_id':  list(range(1001, 1021)),
    'customer':  ['Andi','Siti','Budi','Dewi','Andi','Rizky','Siti','Putri','Budi','Andi',
                  'Maya','Dewi','Rizky','Siti','Agus','Putri','Andi','Maya','Budi','Dewi'],
    'city':      ['Jakarta','Bandung','Surabaya','Jakarta','Jakarta','Medan','Bandung','Yogyakarta','Surabaya','Jakarta',
                  'Semarang','Jakarta','Medan','Bandung','Makassar','Yogyakarta','Jakarta','Semarang','Surabaya','Jakarta'],
    'category':  ['Electronics','Books','Furniture','Electronics','Books','Electronics','Furniture','Books','Electronics','Furniture',
                  'Books','Electronics','Furniture','Electronics','Books','Furniture','Electronics','Electronics','Books','Furniture'],
    'quantity':  [1,3,2,1,5,2,1,4,3,2,2,1,1,2,6,1,3,1,2,2],
    'price':     [12500000,180000,2100000,3200000,210000,850000,1750000,195000,250000,320000,
                  180000,1450000,680000,3200000,210000,2100000,250000,12500000,195000,1750000],
    'order_date': pd.to_datetime(['2025-01-05','2025-01-12','2025-01-20','2025-02-03','2025-02-14',
                                  '2025-02-25','2025-03-02','2025-03-15','2025-03-28','2025-04-04',
                                  '2025-04-18','2025-04-30','2025-05-06','2025-05-19','2025-05-27',
                                  '2025-06-03','2025-06-14','2025-06-21','2025-06-28','2025-06-30']),
})

df_raw = pd.DataFrame({
    'order_id': [1, 2, 3, 3, 4, 5, 6, 6, 7, 8],
    'customer': ['Andi', 'Siti', None, None, 'Dewi', 'Rizky', 'Putri', 'Putri', 'Maya', 'Agus'],
    'city':     ['Jakarta', 'Bandung', 'Surabaya', 'Surabaya', None, 'Medan', 'Yogyakarta', 'Yogyakarta', 'Semarang', None],
    'price':    [150000, np.nan, 200000, 200000, 175000, np.nan, 90000, 90000, 120000, 300000],
})

customers = pd.DataFrame({
    'customer': ['Andi', 'Siti', 'Budi', 'Dewi', 'Rizky', 'Putri', 'Maya', 'Agus'],
    'segment':  ['Consumer', 'Corporate', 'Consumer', 'Corporate', 'Consumer', 'Consumer', 'Small Business', 'Corporate'],
})
`;

  const PURE_SETUP = '# Tidak ada dataset untuk soal ini\n';

  window.PY_DATASETS = {
    sales: {
      label: 'Dataset: df, df_raw, customers',
      description: '`df` = 20 transaksi penjualan (order_id, customer, city, category, quantity, price, order_date). `df_raw` = data kotor dengan NaN & duplikat. `customers` = segmen pelanggan.'
    },
    none: { label: 'Pure Python', description: 'Soal algoritma dasar tanpa dataset.' }
  };

  window.PY_CHAPTERS = [
    {
      id: 1,
      code: 'BAB 01',
      title: 'Vectorized DataFrame Fundamentals & Indexing',
      subtitle: 'Materi Dasar · Kolom Vectorized, Boolean Indexing, GroupBy Aggregation & Control Flow Edge Cases',
      tier: 'free',
      badgeLabel: 'MATERI DASAR — GRATIS'
    },
    {
      id: 2,
      code: 'BAB 02',
      title: 'Data Sanitization, Imputation & Deduplication',
      subtitle: 'Materi Menengah · Imputasi Median, Dropna Subset, Deduplikasi Primary Key & Kompleksitas Algoritma',
      tier: 'pro',
      badgeLabel: 'PRO MEMBERSHIP'
    },
    {
      id: 3,
      code: 'BAB 03',
      title: 'Time-Series Aggregation & Customer Ranking',
      subtitle: 'Materi Lanjutan · Datetime Accessor (.dt), N-Largest Customer Ranking & Month-over-Month pct_change()',
      tier: 'pro',
      badgeLabel: 'PRO MEMBERSHIP'
    },
    {
      id: 4,
      code: 'BAB 04',
      title: 'Multi-Table Relational Merging & Matrix Reshaping',
      subtitle: 'Materi Enterprise · Cross-Tabulation Pivot Table & Relational Merge untuk Segment Average Order Value',
      tier: 'pro',
      badgeLabel: 'PRO MEMBERSHIP'
    }
  ];

  window.PY_CHALLENGES = [
    // =========================================================================
    // BAB 1 — VECTORIZED DATAFRAME FUNDAMENTALS & INDEXING (FREE TIER)
    // =========================================================================
    {
      id: 'py-01',
      chapter: 1,
      chapterTitle: 'Bab 1: Vectorized DataFrame Fundamentals & Indexing',
      tier: 'free',
      title: 'Kolom Revenue',
      difficulty: 'easy',
      tag: 'pandas',
      concept: 'Membuat kolom baru (Vectorized)',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Tambahkan kolom baru `revenue` = `quantity * price` ke DataFrame `df`.\n\nSimpan DataFrame hasilnya ke variabel `result`.',
      starter: "# df sudah tersedia\nprint(df.head())\n\nresult = ...\n",
      solution: "result = df.copy()\nresult['revenue'] = result['quantity'] * result['price']",
      hints: ["Operasi kolom di pandas bersifat vectorized: df['a'] * df['b'].", "Bisa juga pakai df.assign(revenue=...)."],
      explanation: 'Operasi vectorized jauh lebih cepat daripada loop atau apply. Interviewer suka bertanya: "kenapa tidak pakai for loop?"'
    },
    {
      id: 'py-02',
      chapter: 1,
      chapterTitle: 'Bab 1: Vectorized DataFrame Fundamentals & Indexing',
      tier: 'free',
      title: 'Filter Order Besar Jakarta',
      difficulty: 'easy',
      tag: 'pandas',
      concept: 'Boolean indexing',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Ambil semua baris di `df` yang `city`-nya **Jakarta** DAN `quantity` **≥ 3**.\n\nSimpan ke `result`.',
      starter: 'result = ...\n',
      solution: "result = df[(df['city'] == 'Jakarta') & (df['quantity'] >= 3)]",
      hints: ['Gabungkan kondisi dengan & (bukan "and").', 'Setiap kondisi wajib dibungkus tanda kurung: (kondisi1) & (kondisi2).'],
      explanation: 'Kesalahan umum: memakai "and" atau lupa kurung sehingga muncul error "truth value of a Series is ambiguous". Alternatif yang rapi: df.query("city == \'Jakarta\' and quantity >= 3").'
    },
    {
      id: 'py-03',
      chapter: 1,
      chapterTitle: 'Bab 1: Vectorized DataFrame Fundamentals & Indexing',
      tier: 'free',
      title: 'Revenue per Kategori',
      difficulty: 'easy',
      tag: 'pandas',
      concept: 'groupby + sort',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Hitung total revenue (`quantity * price`) per `category`.\n\nHasil berupa DataFrame dengan kolom `category` dan `revenue`, urut dari revenue terbesar. Simpan ke `result`.',
      starter: 'result = ...\n',
      solution: "d = df.assign(revenue=df['quantity'] * df['price'])\nresult = (d.groupby('category', as_index=False)['revenue'].sum()\n           .sort_values('revenue', ascending=False))",
      hints: ['Buat kolom revenue terlebih dahulu.', "groupby('category', as_index=False)['revenue'].sum() menghasilkan DataFrame.", "sort_values('revenue', ascending=False)"],
      explanation: 'as_index=False (atau .reset_index()) menjaga hasil tetap berbentuk tabel rapi, siap untuk divisualisasikan atau diekspor.'
    },
    {
      id: 'py-11',
      chapter: 1,
      chapterTitle: 'Bab 1: Vectorized DataFrame Fundamentals & Indexing',
      tier: 'free',
      title: 'Kategori Usia',
      difficulty: 'easy',
      tag: 'Pure Python',
      concept: 'if / elif / else & Edge Cases',
      dataset: 'none',
      setup: PURE_SETUP,
      post: 'result = [categorize_age(a) for a in [10, 17, 18, 35, 36, 55, 56, 80]]',
      prompt: 'Buat fungsi `categorize_age(age)` yang mengembalikan:\n- `Remaja` jika usia < 18\n- `Dewasa Muda` jika 18–35\n- `Dewasa` jika 36–55\n- `Senior` jika > 55\n\n_Fungsi akan diuji dengan nilai batas (edge case)._',
      starter: 'def categorize_age(age):\n    pass\n\nprint(categorize_age(25))\n',
      solution: "def categorize_age(age):\n    if age < 18:\n        return 'Remaja'\n    elif age <= 35:\n        return 'Dewasa Muda'\n    elif age <= 55:\n        return 'Dewasa'\n    return 'Senior'",
      hints: ['Perhatikan nilai batas: 18 termasuk Dewasa Muda, 35 juga.', 'Di pandas, versi vectorized-nya bisa memakai pd.cut().'],
      explanation: 'Interviewer sengaja menguji nilai batas (18, 35, 36, 55). Selalu tanyakan "inklusif atau eksklusif?" saat requirement ambigu.'
    },

    // =========================================================================
    // BAB 2 — DATA SANITIZATION, IMPUTATION & DEDUPLICATION (PRO TIER)
    // =========================================================================
    {
      id: 'py-04',
      chapter: 2,
      chapterTitle: 'Bab 2: Data Sanitization, Imputation & Deduplication',
      tier: 'pro',
      title: 'Bersihkan Missing Value',
      difficulty: 'medium',
      tag: 'Data Cleaning',
      concept: 'fillna, dropna',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Gunakan `df_raw`:\n1. Isi nilai `price` yang kosong dengan **median** kolom `price` (dihitung dari seluruh data `df_raw`).\n2. Hapus baris yang `city`-nya kosong.\n\nSimpan DataFrame hasilnya ke `result`.',
      starter: 'print(df_raw.isna().sum())\n\nresult = ...\n',
      solution: "result = df_raw.copy()\nresult['price'] = result['price'].fillna(result['price'].median())\nresult = result.dropna(subset=['city'])",
      hints: ['df_raw.isna().sum() untuk melihat jumlah missing per kolom.', "fillna(df_raw['price'].median())", "dropna(subset=['city'])"],
      explanation: 'Median lebih tahan terhadap outlier dibanding mean. Saat interview, jelaskan ALASAN pemilihan metode imputasi — itu yang dinilai, bukan hanya kodenya.'
    },
    {
      id: 'py-05',
      chapter: 2,
      chapterTitle: 'Bab 2: Data Sanitization, Imputation & Deduplication',
      tier: 'pro',
      title: 'Hapus Duplikat',
      difficulty: 'medium',
      tag: 'Data Cleaning',
      concept: 'drop_duplicates',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Di `df_raw` ada `order_id` yang tercatat dua kali. Hapus duplikat berdasarkan `order_id` dan **pertahankan kemunculan pertama**.\n\nSimpan ke `result`.',
      starter: "print(df_raw[df_raw.duplicated('order_id', keep=False)])\n\nresult = ...\n",
      solution: "result = df_raw.drop_duplicates(subset='order_id', keep='first')",
      hints: ["drop_duplicates(subset='order_id')", "Parameter keep='first' adalah default."],
      explanation: 'Selalu cek duplikat pada primary key sebelum agregasi — duplikat membuat revenue terhitung ganda (double counting).'
    },
    {
      id: 'py-09',
      chapter: 2,
      chapterTitle: 'Bab 2: Data Sanitization, Imputation & Deduplication',
      tier: 'pro',
      title: 'Angka Terbesar Kedua',
      difficulty: 'medium',
      tag: 'Pure Python',
      concept: 'Algoritma dasar & deduplikasi',
      dataset: 'none',
      setup: PURE_SETUP,
      post: 'result = [second_largest(x) for x in [[3, 1, 4, 1, 5], [7, 7, 7], [10, 20], [5], [-1, -5, -3]]]',
      prompt: 'Buat fungsi `second_largest(nums)` yang mengembalikan **nilai unik terbesar kedua** dari list angka. Jika tidak ada, kembalikan `None`.\n\nContoh:\n- `[3,1,4,1,5]` → `4`\n- `[7,7,7]` → `None`\n- `[5]` → `None`\n\n_Fungsi akan otomatis diuji dengan beberapa test case._',
      starter: 'def second_largest(nums):\n    # tulis logika di sini\n    pass\n\nprint(second_largest([3, 1, 4, 1, 5]))\n',
      solution: 'def second_largest(nums):\n    unique = sorted(set(nums), reverse=True)\n    return unique[1] if len(unique) >= 2 else None',
      hints: ['set() menghapus duplikat.', 'Urutkan descending lalu ambil indeks ke-1 jika panjangnya ≥ 2.'],
      explanation: 'Solusi O(n) tanpa sorting: simpan dua variabel (first, second) sambil iterasi satu kali. Sebutkan trade-off ini untuk nilai plus.'
    },

    // =========================================================================
    // BAB 3 — TIME-SERIES AGGREGATION & CUSTOMER RANKING (PRO TIER)
    // =========================================================================
    {
      id: 'py-06',
      chapter: 3,
      chapterTitle: 'Bab 3: Time-Series Aggregation & Customer Ranking',
      tier: 'pro',
      title: 'Revenue Bulanan',
      difficulty: 'medium',
      tag: 'Time Series',
      concept: 'dt accessor + groupby',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Hitung total revenue (`quantity * price`) per bulan.\n\nHasil berupa DataFrame dengan kolom `month` (string format `YYYY-MM`) dan `revenue`, urut dari bulan terlama. Simpan ke `result`.',
      starter: 'result = ...\n',
      solution: "d = df.assign(revenue=df['quantity'] * df['price'],\n             month=df['order_date'].dt.strftime('%Y-%m'))\nresult = d.groupby('month', as_index=False)['revenue'].sum().sort_values('month')",
      hints: ["df['order_date'].dt.strftime('%Y-%m') menghasilkan string bulan.", "Alternatif: dt.to_period('M').astype(str)."],
      explanation: 'Accessor .dt membuka banyak fungsi tanggal: .dt.month, .dt.day_name(), .dt.to_period(). Untuk resampling bisa juga df.resample("MS", on="order_date").'
    },
    {
      id: 'py-07',
      chapter: 3,
      chapterTitle: 'Bab 3: Time-Series Aggregation & Customer Ranking',
      tier: 'pro',
      title: 'Top 3 Pelanggan',
      difficulty: 'medium',
      tag: 'pandas',
      concept: 'nlargest / sort + head',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Cari **3 nama pelanggan** dengan total revenue (`quantity * price`) terbesar.\n\nSimpan sebagai **list** nama (urut dari terbesar) ke `result`. Contoh bentuk: `[\'A\', \'B\', \'C\']`.',
      starter: 'result = ...\n',
      solution: "rev = (df['quantity'] * df['price']).groupby(df['customer']).sum()\nresult = rev.sort_values(ascending=False).head(3).index.tolist()",
      hints: ['Group revenue per customer, lalu urutkan.', '.nlargest(3) adalah shortcut untuk sort_values + head.', '.index.tolist() mengubah index menjadi list.'],
      explanation: 'nlargest() lebih efisien daripada sort penuh untuk data besar karena tidak perlu mengurutkan semuanya.'
    },
    {
      id: 'py-10',
      chapter: 3,
      chapterTitle: 'Bab 3: Time-Series Aggregation & Customer Ranking',
      tier: 'pro',
      title: 'Growth MoM dengan pandas',
      difficulty: 'hard',
      tag: 'Time Series',
      concept: 'pct_change',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Lanjutan soal Revenue Bulanan: buat DataFrame dengan kolom `month` (YYYY-MM), `revenue`, dan `growth_pct`.\n\n`growth_pct` = persentase perubahan revenue dibanding bulan sebelumnya (×100, dibulatkan 2 desimal). Bulan pertama bernilai NaN.\n\nSimpan ke `result`.',
      starter: 'result = ...\n',
      solution: "d = df.assign(revenue=df['quantity'] * df['price'],\n             month=df['order_date'].dt.strftime('%Y-%m'))\nmonthly = d.groupby('month', as_index=False)['revenue'].sum().sort_values('month')\nmonthly['growth_pct'] = (monthly['revenue'].pct_change() * 100).round(2)\nresult = monthly",
      hints: ['Gunakan kode soal Revenue Bulanan.', ".pct_change() menghitung perubahan relatif terhadap baris sebelumnya.", 'Kalikan 100 lalu .round(2).'],
      explanation: 'pct_change() setara dengan LAG() di SQL. Pastikan data sudah terurut berdasarkan waktu sebelum memakainya!'
    },

    // =========================================================================
    // BAB 4 — MULTI-TABLE RELATIONAL MERGING & MATRIX RESHAPING (PRO TIER)
    // =========================================================================
    {
      id: 'py-08',
      chapter: 4,
      chapterTitle: 'Bab 4: Multi-Table Relational Merging & Matrix Reshaping',
      tier: 'pro',
      title: 'Pivot Kota × Kategori',
      difficulty: 'hard',
      tag: 'Reshaping',
      concept: 'pivot_table',
      dataset: 'sales',
      setup: SALES_SETUP,
      keepIndex: true,
      prompt: 'Buat pivot table total revenue (`quantity * price`) dengan:\n- index: `city`\n- columns: `category`\n- nilai kosong diisi `0`\n\nSimpan ke `result`.',
      starter: 'result = ...\n',
      solution: "d = df.assign(revenue=df['quantity'] * df['price'])\nresult = d.pivot_table(index='city', columns='category', values='revenue',\n                       aggfunc='sum', fill_value=0)",
      hints: ["pivot_table(index=..., columns=..., values=..., aggfunc='sum')", 'fill_value=0 untuk mengganti NaN.'],
      explanation: 'pivot_table = PivotTable Excel versi kode. Bedanya dengan pivot(): pivot_table bisa agregasi data duplikat, pivot() akan error.'
    },
    {
      id: 'py-12',
      chapter: 4,
      chapterTitle: 'Bab 4: Multi-Table Relational Merging & Matrix Reshaping',
      tier: 'pro',
      title: 'Average Order Value per Segmen',
      difficulty: 'hard',
      tag: 'pandas',
      concept: 'merge + groupby',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Gabungkan `df` dengan `customers` (kolom kunci: `customer`), lalu hitung **Average Order Value (AOV)** per `segment`, yaitu rata-rata revenue (`quantity * price`) per order.\n\nHasil: DataFrame kolom `segment` dan `avg_order_value`, urut dari AOV terbesar. Simpan ke `result`.',
      starter: 'merged = ...\nresult = ...\n',
      solution: "merged = df.merge(customers, on='customer', how='left')\nmerged['revenue'] = merged['quantity'] * merged['price']\nresult = (merged.groupby('segment', as_index=False)['revenue'].mean()\n                .rename(columns={'revenue': 'avg_order_value'})\n                .sort_values('avg_order_value', ascending=False))",
      hints: ["df.merge(customers, on='customer', how='left')", 'AOV = mean revenue per order (setiap baris df adalah 1 order).', ".rename(columns={'revenue': 'avg_order_value'})"],
      explanation: 'merge = JOIN di SQL. Selalu cek jumlah baris sebelum & sesudah merge untuk mendeteksi duplikasi akibat key yang tidak unik.'
    }
  ];
})();
