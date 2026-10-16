/**
 * DataDojo Enterprise — Python & pandas Assessment Curriculum (26 Modules: 4 Free + 22 Pro)
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
    none: { label: 'Pure Python', description: 'Soal algoritma & struktur data Python murni tanpa dataset eksternal.' }
  };

  window.PY_CHAPTERS = [
    {
      id: 1,
      code: 'BAB 01',
      title: 'Vectorized DataFrame Fundamentals & Indexing',
      subtitle: 'Materi Dasar (4 Modul) · Kolom Vectorized, Boolean Indexing, GroupBy Aggregation & Control Flow Edge Cases',
      tier: 'free',
      badgeLabel: 'MATERI DASAR — GRATIS'
    },
    {
      id: 2,
      code: 'BAB 02',
      title: 'Data Sanitization, Imputation & Algorithmic Logic',
      subtitle: 'Materi Menengah (7 Modul Pro) · Imputasi Median/Grup, Deduplikasi, Deteksi Outlier IQR, Z-Score & Algoritma Python',
      tier: 'pro',
      badgeLabel: 'PRO MEMBERSHIP'
    },
    {
      id: 3,
      code: 'BAB 03',
      title: 'Time-Series Aggregation, Cohort & Customer Ranking',
      subtitle: 'Materi Lanjutan (8 Modul Pro) · Datetime Accessor (.dt), pct_change(), Running Total, Rolling Window, RFM Tiering & Cohort',
      tier: 'pro',
      badgeLabel: 'PRO MEMBERSHIP'
    },
    {
      id: 4,
      code: 'BAB 04',
      title: 'Multi-Table Relational Merging, Reshaping & Feature Engineering',
      subtitle: 'Materi Enterprise (7 Modul Pro) · Pivot Table, Segment AOV Merge, Category Share Transform, Multi-Agg, Melt & Hash Map O(n)',
      tier: 'pro',
      badgeLabel: 'PRO MEMBERSHIP'
    }
  ];

  window.PY_CHALLENGES = [
    // =========================================================================
    // BAB 1 — VECTORIZED DATAFRAME FUNDAMENTALS & INDEXING (FREE TIER · 4 MODULES)
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
    // BAB 2 — DATA SANITIZATION, IMPUTATION & ALGORITHMIC LOGIC (PRO TIER · 7 MODULES)
    // =========================================================================
    {
      id: 'py-04',
      chapter: 2,
      chapterTitle: 'Bab 2: Data Sanitization, Imputation & Algorithmic Logic',
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
      chapterTitle: 'Bab 2: Data Sanitization, Imputation & Algorithmic Logic',
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
      chapterTitle: 'Bab 2: Data Sanitization, Imputation & Algorithmic Logic',
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
    {
      id: 'py-13',
      chapter: 2,
      chapterTitle: 'Bab 2: Data Sanitization, Imputation & Algorithmic Logic',
      tier: 'pro',
      title: 'Pipeline Sanitasi End-to-End df_raw',
      difficulty: 'medium',
      tag: 'Data Hygiene',
      concept: 'drop_duplicates + fillna dict',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Bersihkan `df_raw` secara berurutan:\n1. Hapus duplikat berdasarkan `order_id` (`keep=\'first\'`).\n2. Isi nilai kosong pada `customer` dengan string `\'Guest\'`.\n3. Isi nilai kosong pada `city` dengan string `\'Unknown\'`.\n4. Isi nilai kosong pada `price` dengan nilai **mean** dari kolom `price` (setelah deduplikasi).\n\nSimpan DataFrame hasilnya ke `result`.',
      starter: 'clean = df_raw.copy()\n# tulis pipeline pembersihan di sini\nresult = ...\n',
      solution: "clean = df_raw.drop_duplicates(subset='order_id', keep='first').copy()\nclean['customer'] = clean['customer'].fillna('Guest')\nclean['city'] = clean['city'].fillna('Unknown')\nclean['price'] = clean['price'].fillna(clean['price'].mean())\nresult = clean",
      hints: [
        'Lakukan drop_duplicates terlebih dahulu agar baris ganda tidak membiaskan perhitungan mean(price).',
        "Gunakan fillna({'customer': 'Guest', 'city': 'Unknown', 'price': clean['price'].mean()})."
      ],
      explanation: 'Urutan pembersihan data sangat krusial: deduplikasi wajib dilakukan SEBELUM menghitung statistik imputasi (mean/median) agar nilai duplikat tidak mendistorsi distribusi.'
    },
    {
      id: 'py-14',
      chapter: 2,
      chapterTitle: 'Bab 2: Data Sanitization, Imputation & Algorithmic Logic',
      tier: 'pro',
      title: 'Deteksi Outlier Harga dengan Metode IQR',
      difficulty: 'medium',
      tag: 'Outlier Detection',
      concept: 'quantile(0.25), quantile(0.75), IQR Filter',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Dari DataFrame `df`, cari semua baris transaksi yang memiliki `price` tergolong **outlier** menurut metode Interquartile Range (IQR):\n- `Q1 = df[\'price\'].quantile(0.25)`\n- `Q3 = df[\'price\'].quantile(0.75)`\n- `IQR = Q3 - Q1`\n- Outlier adalah baris dengan `price < (Q1 - 1.5 * IQR)` ATAU `price > (Q3 + 1.5 * IQR)`.\n\nSimpan DataFrame baris-baris outlier tersebut ke `result`.',
      starter: "q1 = df['price'].quantile(0.25)\nq3 = df['price'].quantile(0.75)\niqr = q3 - q1\n\nresult = ...\n",
      solution: "q1 = df['price'].quantile(0.25)\nq3 = df['price'].quantile(0.75)\niqr = q3 - q1\nresult = df[(df['price'] < q1 - 1.5 * iqr) | (df['price'] > q3 + 1.5 * iqr)]",
      hints: [
        'Gunakan operator bitwise OR (|) untuk menggabungkan batas bawah dan batas atas.',
        'Bungkus masing-masing kondisi perbandingan di dalam tanda kurung.'
      ],
      explanation: 'Metode Tukey IQR adalah standar non-parametrik untuk mendeteksi outlier pada distribusi harga atau pendapatan yang miring (skewed).'
    },
    {
      id: 'py-15',
      chapter: 2,
      chapterTitle: 'Bab 2: Data Sanitization, Imputation & Algorithmic Logic',
      tier: 'pro',
      title: 'Normalisasi Z-Score Kolom Price',
      difficulty: 'medium',
      tag: 'Feature Scaling',
      concept: 'Vectorized Standardization (Z-Score)',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Buat DataFrame baru dari `df` yang hanya berisi kolom `order_id`, `price`, dan kolom baru `price_zscore`.\n\nRumus `price_zscore`: `((price - mean(price)) / std(price)).round(4)` (gunakan `.std()` default pandas `ddof=1`).\n\nSimpan ke `result`.',
      starter: "result = df[['order_id', 'price']].copy()\nresult['price_zscore'] = ...\n",
      solution: "result = df[['order_id', 'price']].copy()\nresult['price_zscore'] = ((df['price'] - df['price'].mean()) / df['price'].std()).round(4)",
      hints: [
        "(df['price'] - df['price'].mean()) / df['price'].std()",
        'Akhiri dengan .round(4).'
      ],
      explanation: 'Z-score mengukur berapa standar deviasi suatu nilai berada di atas atau di bawah rata-rata. Nilai |Z| > 3 sering diperlakukan sebagai outlier ekstrem.'
    },
    {
      id: 'py-16',
      chapter: 2,
      chapterTitle: 'Bab 2: Data Sanitization, Imputation & Algorithmic Logic',
      tier: 'pro',
      title: 'Frekuensi Kata Teratas (Text Tokenization)',
      difficulty: 'medium',
      tag: 'Pure Python',
      concept: 'Dictionary Counting & Custom Sorting',
      dataset: 'none',
      setup: PURE_SETUP,
      post: "result = top_words('Data analyst butuh SQL dan Python untuk analisis data dan laporan data', 3)",
      prompt: 'Buat fungsi `top_words(text, n)` yang:\n1. Mengubah seluruh teks menjadi huruf kecil (`lowercase`) dan memecahnya berdasarkan spasi (`.split()`).\n2. Menghitung frekuensi kemunculan tiap kata.\n3. Mengembalikan `n` kata teratas sebagai list of tuples `(word, count)`, diurutkan dari `count` terbesar lalu `word` secara alfabetis A-Z jika jumlahnya seri.\n\nContoh: `top_words("data sql data python sql data", 2)` → `[(\'data\', 3), (\'sql\', 2)]`.',
      starter: 'def top_words(text, n):\n    # tulis kode kamu di sini\n    pass\n',
      solution: 'def top_words(text, n):\n    counts = {}\n    for w in text.lower().split():\n        counts[w] = counts.get(w, 0) + 1\n    return sorted(counts.items(), key=lambda x: (-x[1], x[0]))[:n]',
      hints: [
        'Gunakan text.lower().split() untuk mendapatkan list kata.',
        'sorted(counts.items(), key=lambda x: (-x[1], x[0])) mengurutkan frekuensi menurun lalu abjad naik.'
      ],
      explanation: 'Mengurutkan dictionary dengan multi-key tuple (-count, word) adalah pola Python klasik yang hampir selalu ditanyakan pada sesi algoritma Data Analyst.'
    },

    // =========================================================================
    // BAB 3 — TIME-SERIES AGGREGATION, COHORT & CUSTOMER RANKING (PRO TIER · 8 MODULES)
    // =========================================================================
    {
      id: 'py-06',
      chapter: 3,
      chapterTitle: 'Bab 3: Time-Series Aggregation, Cohort & Customer Ranking',
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
      chapterTitle: 'Bab 3: Time-Series Aggregation, Cohort & Customer Ranking',
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
      chapterTitle: 'Bab 3: Time-Series Aggregation, Cohort & Customer Ranking',
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
    {
      id: 'py-17',
      chapter: 3,
      chapterTitle: 'Bab 3: Time-Series Aggregation, Cohort & Customer Ranking',
      tier: 'pro',
      title: 'Running Total & Kontribusi Revenue Bulanan',
      difficulty: 'medium',
      tag: 'Time Series',
      concept: 'cumsum() + Share of Total',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Buat rekap bulanan dari `df` dengan kolom:\n- `month` (format `YYYY-MM`)\n- `revenue` (total `quantity * price` bulan tersebut)\n- `running_total` (akumulasi revenue dari bulan pertama hingga bulan tersebut)\n- `rev_share_pct` (persentase revenue bulan tersebut terhadap total revenue keseluruhan, dibulatkan 2 desimal)\n\nUrutkan berdasarkan `month` dari yang terlama. Simpan ke `result`.',
      starter: 'd = df.assign(revenue=df[\'quantity\'] * df[\'price\'], month=df[\'order_date\'].dt.strftime(\'%Y-%m\'))\nmonthly = ...\n',
      solution: "d = df.assign(revenue=df['quantity'] * df['price'], month=df['order_date'].dt.strftime('%Y-%m'))\nmonthly = d.groupby('month', as_index=False)['revenue'].sum().sort_values('month')\nmonthly['running_total'] = monthly['revenue'].cumsum()\nmonthly['rev_share_pct'] = (monthly['revenue'] / monthly['revenue'].sum() * 100).round(2)\nresult = monthly",
      hints: [
        "Gunakan .cumsum() pada kolom 'revenue' untuk menghitung running total.",
        "Bagi monthly['revenue'] dengan monthly['revenue'].sum() * 100 lalu .round(2)."
      ],
      explanation: '.cumsum() di pandas adalah padanan langsung dari SUM(revenue) OVER (ORDER BY month) pada SQL.'
    },
    {
      id: 'py-18',
      chapter: 3,
      chapterTitle: 'Bab 3: Time-Series Aggregation, Cohort & Customer Ranking',
      tier: 'pro',
      title: 'Analisis Hari Transaksi (Day of Week)',
      difficulty: 'medium',
      tag: 'Time Series',
      concept: 'dt.day_name() + groupby agg',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Tim operasional ingin mengetahui hari apa transaksi paling banyak menghasilkan uang. Dari `df`, ekstrak nama hari dalam bahasa Inggris (`df[\'order_date\'].dt.day_name()`) sebagai kolom `day_name`.\n\nHitung `total_orders` (jumlah baris transaksi) dan `total_revenue` (`SUM(quantity * price)`) per `day_name`.\n\nUrutkan dari `total_revenue` terbesar, lalu `day_name` A-Z. Simpan DataFrame hasilnya ke `result`.',
      starter: "d = df.assign(day_name=df['order_date'].dt.day_name(), revenue=df['quantity'] * df['price'])\nresult = ...\n",
      solution: "d = df.assign(day_name=df['order_date'].dt.day_name(), revenue=df['quantity'] * df['price'])\nresult = (d.groupby('day_name', as_index=False)\n           .agg(total_orders=('order_id', 'count'), total_revenue=('revenue', 'sum'))\n           .sort_values(['total_revenue', 'day_name'], ascending=[False, True]))",
      hints: [
        "Gunakan .groupby('day_name', as_index=False).agg(total_orders=('order_id', 'count'), total_revenue=('revenue', 'sum')).",
        "Urutkan dengan .sort_values(['total_revenue', 'day_name'], ascending=[False, True])."
      ],
      explanation: 'Named aggregation di dalam .agg() membuat penamaan kolom output sangat bersih tanpa perlu .rename() tambahan.'
    },
    {
      id: 'py-19',
      chapter: 3,
      chapterTitle: 'Bab 3: Time-Series Aggregation, Cohort & Customer Ranking',
      tier: 'pro',
      title: 'Moving Average 3 Bulan dengan .rolling()',
      difficulty: 'hard',
      tag: 'Rolling Window',
      concept: 'rolling(3, min_periods=1).mean()',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Buat DataFrame revenue bulanan (`month` format `YYYY-MM` dan `revenue`), urutkan berdasarkan `month`.\n\nTambahkan kolom `rolling_avg_3m` yaitu rata-rata bergerak 3 bulan menggunakan `.rolling(3, min_periods=1).mean().round(2)`.\n\nSimpan ke `result`.',
      starter: 'd = df.assign(revenue=df[\'quantity\'] * df[\'price\'], month=df[\'order_date\'].dt.strftime(\'%Y-%m\'))\nmonthly = ...\n',
      solution: "d = df.assign(revenue=df['quantity'] * df['price'], month=df['order_date'].dt.strftime('%Y-%m'))\nmonthly = d.groupby('month', as_index=False)['revenue'].sum().sort_values('month')\nmonthly['rolling_avg_3m'] = monthly['revenue'].rolling(3, min_periods=1).mean().round(2)\nresult = monthly",
      hints: [
        'Parameter min_periods=1 memastikan bulan ke-1 dan ke-2 tidak bernilai NaN (sama seperti perilaku ROWS BETWEEN 2 PRECEDING di SQL).',
        'Jangan lupa .round(2).'
      ],
      explanation: 'Method .rolling() adalah fondasi peramalan deret waktu (time-series smoothing) di pandas.'
    },
    {
      id: 'py-20',
      chapter: 3,
      chapterTitle: 'Bab 3: Time-Series Aggregation, Cohort & Customer Ranking',
      tier: 'pro',
      title: 'Segmentasi Nilai Pelanggan (Customer Tiering)',
      difficulty: 'medium',
      tag: 'Customer Analytics',
      concept: 'np.select / Conditional Tiering',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Hitung total belanja (`total_spend` = `SUM(quantity * price)`) untuk setiap `customer` di `df`, lalu tambahkan kolom `tier` dengan aturan:\n- `\'VIP\'` jika `total_spend >= 10000000`\n- `\'Regular\'` jika `total_spend >= 2000000` dan `< 10000000`\n- `\'Starter\'` jika `< 2000000`\n\nUrutkan DataFrame hasil berdasarkan `total_spend` menurun, lalu `customer` A-Z. Simpan ke `result`.',
      starter: "d = df.assign(revenue=df['quantity'] * df['price'])\ncust = d.groupby('customer', as_index=False).agg(total_spend=('revenue', 'sum'))\n# tambahkan kolom tier\n",
      solution: "d = df.assign(revenue=df['quantity'] * df['price'])\ncust = d.groupby('customer', as_index=False).agg(total_spend=('revenue', 'sum'))\ncust['tier'] = np.select([cust['total_spend'] >= 10000000, cust['total_spend'] >= 2000000], ['VIP', 'Regular'], default='Starter')\nresult = cust.sort_values(['total_spend', 'customer'], ascending=[False, True])",
      hints: [
        "np.select([kondisi1, kondisi2], ['VIP', 'Regular'], default='Starter') adalah padanan vectorized dari CASE WHEN di SQL.",
        'Urutkan dengan sort_values([\'total_spend\', \'customer\'], ascending=[False, True]).'
      ],
      explanation: 'np.select() jauh lebih bersih dan cepat dibanding .apply(lambda ...) saat membuat kolom kondisional dengan banyak cabang.'
    },
    {
      id: 'py-21',
      chapter: 3,
      chapterTitle: 'Bab 3: Time-Series Aggregation, Cohort & Customer Ranking',
      tier: 'pro',
      title: 'Retensi Multi-Bulan (Active Months per Customer)',
      difficulty: 'hard',
      tag: 'Cohort Retention',
      concept: 'nunique() Bulan Transaksi Aktif',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Cari pelanggan yang bertransaksi di **minimal 2 bulan berbeda** pada `df`.\n\nHasil berupa DataFrame dengan kolom:\n- `customer`\n- `active_months` (jumlah bulan unik `YYYY-MM` tempat pelanggan bertransaksi)\n- `total_orders` (jumlah transaksi pelanggan tersebut)\n\nUrutkan dari `active_months` terbesar, `total_orders` terbesar, lalu `customer` A-Z. Simpan ke `result`.',
      starter: "d = df.assign(month=df['order_date'].dt.strftime('%Y-%m'))\nresult = ...\n",
      solution: "d = df.assign(month=df['order_date'].dt.strftime('%Y-%m'))\ng = d.groupby('customer', as_index=False).agg(active_months=('month', 'nunique'), total_orders=('order_id', 'count'))\nresult = g[g['active_months'] >= 2].sort_values(['active_months', 'total_orders', 'customer'], ascending=[False, False, True])",
      hints: [
        "Gunakan agg(active_months=('month', 'nunique'), total_orders=('order_id', 'count')).",
        "Filter g[g['active_months'] >= 2]."
      ],
      explanation: 'Fungsi agregasi nunique() di pandas setara dengan COUNT(DISTINCT ...) di SQL.'
    },

    // =========================================================================
    // BAB 4 — MULTI-TABLE MERGING, RESHAPING & FEATURE ENGINEERING (PRO TIER · 7 MODULES)
    // =========================================================================
    {
      id: 'py-08',
      chapter: 4,
      chapterTitle: 'Bab 4: Multi-Table Relational Merging, Reshaping & Feature Engineering',
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
      chapterTitle: 'Bab 4: Multi-Table Relational Merging, Reshaping & Feature Engineering',
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
    },
    {
      id: 'py-22',
      chapter: 4,
      chapterTitle: 'Bab 4: Multi-Table Relational Merging, Reshaping & Feature Engineering',
      tier: 'pro',
      title: 'Proporsi Revenue Kategori di Dalam Segmen (Window Transform)',
      difficulty: 'hard',
      tag: 'Window Transform',
      concept: 'merge + groupby + transform("sum")',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Gabungkan `df` dengan `customers` pada kolom `customer`. Hitung total `revenue` (`quantity * price`) untuk setiap kombinasi `(segment, category)`.\n\nTambahkan kolom `segment_share_pct` yaitu persentase revenue kategori tersebut terhadap total revenue di `segment`-nya masing-masing (dibulatkan 2 desimal).\n\nUrutkan berdasarkan `segment` A-Z lalu `revenue` menurun. Simpan DataFrame (`segment`, `category`, `revenue`, `segment_share_pct`) ke `result`.',
      starter: "m = df.merge(customers, on='customer', how='left')\nm['revenue'] = m['quantity'] * m['price']\n",
      solution: "m = df.merge(customers, on='customer', how='left')\nm['revenue'] = m['quantity'] * m['price']\ng = m.groupby(['segment', 'category'], as_index=False)['revenue'].sum()\ng['segment_share_pct'] = (g['revenue'] / g.groupby('segment')['revenue'].transform('sum') * 100).round(2)\nresult = g.sort_values(['segment', 'revenue'], ascending=[True, False])",
      hints: [
        "Setelah groupby(['segment', 'category']), gunakan g.groupby('segment')['revenue'].transform('sum') untuk mendapatkan pembagi per segmen.",
        '.transform() di pandas setara dengan SUM() OVER (PARTITION BY segment) di SQL!'
      ],
      explanation: 'Method .transform() adalah senjata rahasia pandas: ia mengembalikan Series dengan ukuran persis sama seperti DataFrame asal, mirip Window Function di SQL.'
    },
    {
      id: 'py-23',
      chapter: 4,
      chapterTitle: 'Bab 4: Multi-Table Relational Merging, Reshaping & Feature Engineering',
      tier: 'pro',
      title: 'Kategori Terlaris di Setiap Kota (Top-1 per Group)',
      difficulty: 'hard',
      tag: 'Group Ranking',
      concept: 'groupby + sort_values + drop_duplicates',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Untuk setiap `city` di `df`, cari **1 `category` dengan total `revenue` (`quantity * price`) tertinggi**.\n\nHasil berupa DataFrame dengan kolom `city`, `category`, dan `revenue`, diurutkan berdasarkan `city` A-Z. Simpan ke `result`.',
      starter: "d = df.assign(revenue=df['quantity'] * df['price'])\n# cari kategori dengan revenue tertinggi di tiap kota\n",
      solution: "d = df.assign(revenue=df['quantity'] * df['price'])\ng = d.groupby(['city', 'category'], as_index=False)['revenue'].sum()\nresult = (g.sort_values(['city', 'revenue', 'category'], ascending=[True, False, True])\n           .drop_duplicates(subset='city', keep='first')\n           .sort_values('city'))",
      hints: [
        "Hitung revenue per (city, category) terlebih dahulu.",
        "Urutkan berdasarkan revenue descending lalu panggil .drop_duplicates(subset='city', keep='first')."
      ],
      explanation: 'Kombinasi sort_values() + drop_duplicates(subset=group_col, keep="first") adalah pola idiomatik pandas yang paling cepat untuk mengambil Top-1 per grup.'
    },
    {
      id: 'py-24',
      chapter: 4,
      chapterTitle: 'Bab 4: Multi-Table Relational Merging, Reshaping & Feature Engineering',
      tier: 'pro',
      title: 'Executive Summary Table per Kota',
      difficulty: 'medium',
      tag: 'Multi-Metric Agg',
      concept: 'Named Aggregation (.agg)',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Buat tabel ringkasan performa per `city` dari `df` yang menampilkan:\n- `city`\n- `total_orders`: jumlah transaksi (`count` dari `order_id`)\n- `unique_customers`: jumlah pelanggan unik (`nunique` dari `customer`)\n- `total_qty`: total `quantity` terjual (`sum`)\n- `total_revenue`: total `quantity * price` (`sum`)\n\nUrutkan dari `total_revenue` terbesar. Simpan ke `result`.',
      starter: "d = df.assign(revenue=df['quantity'] * df['price'])\nresult = ...\n",
      solution: "d = df.assign(revenue=df['quantity'] * df['price'])\nresult = (d.groupby('city', as_index=False)\n           .agg(total_orders=('order_id', 'count'),\n                unique_customers=('customer', 'nunique'),\n                total_qty=('quantity', 'sum'),\n                total_revenue=('revenue', 'sum'))\n           .sort_values('total_revenue', ascending=False))",
      hints: [
        "Gunakan .agg(total_orders=('order_id', 'count'), unique_customers=('customer', 'nunique'), ...).",
        "Urutkan dengan .sort_values('total_revenue', ascending=False)."
      ],
      explanation: 'Kemampuan menyusun satu tabel ringkasan multi-metrik dalam satu langkah .agg() menunjukkan kefasihan pandas tingkat mahir.'
    },
    {
      id: 'py-25',
      chapter: 4,
      chapterTitle: 'Bab 4: Multi-Table Relational Merging, Reshaping & Feature Engineering',
      tier: 'pro',
      title: 'Reshaping Wide ke Long dengan .melt()',
      difficulty: 'hard',
      tag: 'Reshaping',
      concept: 'pivot_table + reset_index + melt',
      dataset: 'sales',
      setup: SALES_SETUP,
      prompt: 'Sering kali kita menerima laporan berbentuk matriks (wide) dari klien dan harus mengubahnya kembali ke format tabel relasional (long) agar siap masuk ke database.\n\n1. Buat pivot table jumlah `quantity` (`aggfunc=\'sum\'`, `fill_value=0`) dengan index `city` dan kolom `category`, lalu `.reset_index()`.\n2. Ubah kembali tabel wide tersebut menjadi format long menggunakan `.melt(id_vars=\'city\', var_name=\'category\', value_name=\'total_qty\')`.\n3. Urutkan berdasarkan `city` A-Z lalu `category` A-Z. Simpan ke `result`.',
      starter: "wide = df.pivot_table(index='city', columns='category', values='quantity', aggfunc='sum', fill_value=0).reset_index()\nresult = ...\n",
      solution: "wide = df.pivot_table(index='city', columns='category', values='quantity', aggfunc='sum', fill_value=0).reset_index()\nresult = (wide.melt(id_vars='city', var_name='category', value_name='total_qty')\n              .sort_values(['city', 'category']))",
      hints: [
        "Gunakan wide.melt(id_vars='city', var_name='category', value_name='total_qty').",
        "Urutkan dengan .sort_values(['city', 'category'])."
      ],
      explanation: 'Unpivot (.melt di pandas, atau Unpivot Columns di Power Query) wajib dikuasai untuk menormalisasi laporan spreadsheet menjadi tabel fakta.'
    },
    {
      id: 'py-26',
      chapter: 4,
      chapterTitle: 'Bab 4: Multi-Table Relational Merging, Reshaping & Feature Engineering',
      tier: 'pro',
      title: 'Algoritma Two-Sum untuk Rekonsiliasi Invoice',
      difficulty: 'hard',
      tag: 'Pure Python',
      concept: 'Hash Map Lookup O(n)',
      dataset: 'none',
      setup: PURE_SETUP,
      post: 'result = [find_invoice_pair([120, 350, 480, 150, 90], 500), find_invoice_pair([10, 20, 30], 100), find_invoice_pair([250, 250, 100], 500)]',
      prompt: 'Tim Finance sedang mencocokkan dua invoice yang jumlah nilainya persis sama dengan nominal transfer `target`.\n\nBuat fungsi `find_invoice_pair(amounts, target)` yang mengembalikan tuple indeks `(i, j)` (dengan `i < j`) dari dua elemen yang jumlahnya `== target`. Jika tidak ada pasangan yang cocok, kembalikan `None`.\n\nContoh:\n- `find_invoice_pair([120, 350, 480, 150, 90], 500)` → `(1, 3)` (karena `350 + 150 = 500`).',
      starter: 'def find_invoice_pair(amounts, target):\n    # gunakan dictionary (hash map) untuk solusi O(n)\n    pass\n',
      solution: 'def find_invoice_pair(amounts, target):\n    seen = {}\n    for i, val in enumerate(amounts):\n        diff = target - val\n        if diff in seen:\n            return (seen[diff], i)\n        seen[val] = i\n    return None',
      hints: [
        'Simpan nilai yang sudah lewat ke dalam dictionary: seen[val] = i.',
        'Pada setiap langkah, cek apakah (target - val) sudah ada di dalam seen.'
      ],
      explanation: 'Menggunakan dictionary menurunkan kompleksitas waktu dari O(n²) (nested loop) menjadi O(n) single pass.'
    }
  ];
})();
