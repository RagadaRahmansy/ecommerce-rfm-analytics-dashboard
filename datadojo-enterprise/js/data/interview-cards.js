/**
 * DataDojo Enterprise — Executive Interview Playbook & Case Studies
 * Structured into 4 progressive chapters (Bab 1 Free Fundamentals, Bab 2–4 Pro Membership).
 */
window.INTERVIEW_CHAPTERS = [
  {
    id: 1,
    code: 'BAB 01',
    title: 'Core Technical & Role Foundations',
    subtitle: 'Materi Dasar · Relational Joins, Missing Value Strategy, Data Role Taxonomy & EDA Methodology',
    tier: 'free',
    badgeLabel: 'MATERI DASAR — GRATIS'
  },
  {
    id: 2,
    code: 'BAB 02',
    title: 'Query Optimization, Windowing & Dimensional Modeling',
    subtitle: 'Materi Menengah · Analytical Window Functions, SQL Execution Plans (EXPLAIN) & Star Schema Architecture',
    tier: 'pro',
    badgeLabel: 'PRO MEMBERSHIP'
  },
  {
    id: 3,
    code: 'BAB 03',
    title: 'Statistical Experimentation & Executive Storytelling',
    subtitle: 'Materi Lanjutan · Non-Technical p-value Communication, A/B Test Design, Outlier Treatment & Stakeholder Alignment',
    tier: 'pro',
    badgeLabel: 'PRO MEMBERSHIP'
  },
  {
    id: 4,
    code: 'BAB 04',
    title: 'STAR Behavioral Mastery & Business Case Diagnostics',
    subtitle: 'Materi Enterprise · Root-Cause Metric Drops, Executive KPI Design, Loyalty ROI & Error Recovery Frameworks',
    tier: 'pro',
    badgeLabel: 'PRO MEMBERSHIP'
  }
];

window.INTERVIEW_CARDS = [
  // =========================================================================
  // BAB 1 — CORE TECHNICAL & ROLE FOUNDATIONS (FREE TIER)
  // =========================================================================
  { id: 'iv-01', chapter: 1, tier: 'free', type: 'technical',
    q: 'Jelaskan perbedaan INNER JOIN, LEFT JOIN, dan FULL OUTER JOIN beserta contoh kasus bisnisnya.',
    answer: 'INNER JOIN hanya mengambil baris yang cocok di kedua tabel — misalnya order yang punya data pelanggan valid. LEFT JOIN mengambil semua baris tabel kiri walaupun tidak ada pasangannya — cocok untuk mencari pelanggan yang belum pernah order (filter kolom kanan IS NULL). FULL OUTER JOIN mengambil semua baris dari kedua sisi — berguna saat rekonsiliasi data dua sistem untuk menemukan data yang hanya ada di salah satu sistem.',
    tips: 'Sertakan contoh nyata dari pengalamanmu. Bonus: sebutkan risiko duplikasi baris jika join key tidak unik.' },
  { id: 'iv-03', chapter: 1, tier: 'free', type: 'technical',
    q: 'Bagaimana kamu menangani missing value dalam dataset?',
    answer: 'Pertama saya cari tahu KENAPA datanya hilang (acak, error sistem, atau memang tidak berlaku) dan seberapa besar proporsinya. Jika sedikit dan acak, baris bisa dihapus. Untuk numerik saya impute dengan median (tahan outlier) atau mean per segmen; untuk kategorikal dengan modus atau kategori "Unknown". Untuk time series bisa forward-fill/interpolasi. Saya juga membuat flag kolom "is_missing" jika pola hilangnya bisa informatif, dan selalu mendokumentasikan keputusan ini ke stakeholder.',
    tips: 'Interviewer menilai alur berpikirmu, bukan sekadar menyebut fillna().' },
  { id: 'iv-06', chapter: 1, tier: 'free', type: 'technical',
    q: 'Apa perbedaan data analyst, data scientist, dan data engineer?',
    answer: 'Data engineer membangun dan merawat pipeline serta infrastruktur data agar data tersedia dan andal. Data analyst mengolah data tersebut untuk menjawab pertanyaan bisnis — melalui SQL, dashboard, dan analisis deskriptif/diagnostik — lalu mengomunikasikan insight. Data scientist berfokus pada pemodelan prediktif dan eksperimen statistik lanjutan/machine learning. Ketiganya saling bergantung, dan di perusahaan kecil perannya sering tumpang tindih.',
    tips: 'Tunjukkan bahwa kamu paham posisi yang kamu lamar dan nilai yang kamu bawa.' },
  { id: 'iv-10', chapter: 1, tier: 'free', type: 'behavioral',
    q: 'Ceritakan tentang dirimu (Tell me about yourself).',
    answer: 'Gunakan formula Present–Past–Future, maksimal 2 menit. Present: "Saat ini saya seorang ... yang fokus pada analisis data penjualan menggunakan SQL, Python, dan Power BI." Past: "Sebelumnya saya ... dan salah satu pencapaian saya adalah membangun dashboard yang memangkas waktu pelaporan dari 2 hari menjadi 2 jam." Future: "Saya tertarik dengan posisi ini karena ingin menerapkan kemampuan analitik untuk ... di perusahaan Anda."',
    tips: 'Jangan membacakan CV. Pilih 1–2 pencapaian dengan angka konkret.' },
  { id: 'iv-20', chapter: 1, tier: 'free', type: 'case',
    q: 'Kamu diberi dataset baru yang belum pernah kamu lihat. Apa yang kamu lakukan pertama kali?',
    answer: 'Saya melakukan Exploratory Data Analysis: memahami konteks bisnis & sumber data, cek ukuran dan tipe data (shape, dtypes), grain tabel (1 baris mewakili apa), primary key dan duplikat, missing value, distribusi & outlier (describe, histogram), nilai kategorikal yang tidak konsisten, rentang tanggal, serta hubungan antar variabel. Semua temuan dan asumsi saya dokumentasikan, lalu saya konfirmasi ke pemilik data sebelum analisis lanjutan.',
    tips: 'Kata kunci: "grain", "data dictionary", "sanity check".' },

  // =========================================================================
  // BAB 2 — QUERY OPTIMIZATION, WINDOWING & DIMENSIONAL MODELING (PRO TIER)
  // =========================================================================
  { id: 'iv-02', chapter: 2, tier: 'pro', type: 'technical',
    q: 'Apa itu window function? Kapan kamu memakainya dibanding GROUP BY?',
    answer: 'Window function melakukan perhitungan atas sekumpulan baris yang terkait dengan baris saat ini TANPA meringkas baris menjadi satu. GROUP BY mengubah banyak baris menjadi satu baris per grup. Saya memakai window function untuk ranking (ROW_NUMBER, DENSE_RANK) misalnya top 3 produk per kategori, running total, moving average, dan perbandingan periode dengan LAG/LEAD seperti growth month-over-month.',
    tips: 'Tulis contoh singkat di papan/kertas: SUM(sales) OVER (PARTITION BY region ORDER BY month).' },
  { id: 'iv-04', chapter: 2, tier: 'pro', type: 'technical',
    q: 'Bagaimana cara kamu mengoptimalkan query SQL yang lambat?',
    answer: 'Saya mulai dengan EXPLAIN / execution plan untuk melihat bottleneck. Lalu: pilih hanya kolom yang dibutuhkan (hindari SELECT *), filter sedini mungkin, pastikan kolom di WHERE/JOIN memiliki index, hindari fungsi pada kolom terindeks di WHERE (mis. YEAR(date) = 2025 → ganti dengan rentang tanggal), ganti subquery berkorelasi dengan JOIN atau CTE, dan gunakan UNION ALL jika tidak butuh deduplikasi. Untuk laporan berulang, saya pertimbangkan tabel agregat atau materialized view.',
    tips: 'Ceritakan satu contoh nyata: "query dari 2 menit menjadi 5 detik karena..."' },
  { id: 'iv-05', chapter: 2, tier: 'pro', type: 'technical',
    q: 'Jelaskan apa itu Star Schema dan mengapa penting untuk Power BI.',
    answer: 'Star schema memisahkan tabel fakta (transaksi berisi angka & foreign key) dari tabel dimensi (atribut deskriptif seperti produk, pelanggan, tanggal), dengan relasi one-to-many dari dimensi ke fakta. Untuk Power BI ini penting karena engine VertiPaq dan DAX dioptimalkan untuk pola ini: filter mengalir jelas dari dimensi ke fakta, model lebih kecil, measure lebih sederhana, dan performa lebih cepat dibanding satu tabel datar besar atau snowflake yang kompleks.',
    tips: 'Gambarkan diagram bintang sederhana jika ada whiteboard.' },

  // =========================================================================
  // BAB 3 — STATISTICAL EXPERIMENTATION & EXECUTIVE STORYTELLING (PRO TIER)
  // =========================================================================
  { id: 'iv-07', chapter: 3, tier: 'pro', type: 'stats',
    q: 'Jelaskan p-value kepada orang non-teknis.',
    answer: 'Bayangkan kita menguji apakah tombol hijau membuat orang lebih banyak membeli. p-value adalah peluang kita melihat perbedaan sebesar ini (atau lebih) HANYA karena kebetulan, seandainya sebenarnya tombol hijau tidak berpengaruh apa-apa. Jika p-value kecil (misalnya di bawah 5%), kemungkinan "cuma kebetulan" itu kecil, sehingga kita cukup yakin efeknya nyata.',
    tips: 'Hindari kesalahan umum: p-value BUKAN peluang hipotesis benar.' },
  { id: 'iv-08', chapter: 3, tier: 'pro', type: 'stats',
    q: 'Bagaimana kamu merancang sebuah A/B test?',
    answer: '1) Tentukan hipotesis dan satu primary metric (mis. conversion rate) plus guardrail metric. 2) Hitung sample size dengan power analysis berdasarkan minimum detectable effect, α (biasanya 5%) dan power (80%). 3) Randomisasi pengguna ke kontrol & treatment di level yang tepat (user, bukan sesi). 4) Jalankan cukup lama untuk mencakup siklus mingguan, tanpa "mengintip" lalu berhenti dini. 5) Analisis dengan uji statistik yang sesuai, cek sample ratio mismatch, lalu interpretasikan signifikansi statistik DAN dampak bisnis.',
    tips: 'Menyebut "sample ratio mismatch" dan "novelty effect" memberi kesan senior.' },
  { id: 'iv-09', chapter: 3, tier: 'pro', type: 'stats',
    q: 'Apa itu outlier dan bagaimana kamu menanganinya?',
    answer: 'Outlier adalah nilai yang jauh berbeda dari mayoritas data. Saya mendeteksinya lewat box plot/IQR, z-score, atau visualisasi. Penanganannya tergantung penyebab: jika error input (umur 250 tahun) saya perbaiki atau hapus; jika nilai asli tapi ekstrem (pelanggan korporat belanja sangat besar) saya pertahankan namun bisa menganalisis terpisah, memakai median, atau melakukan capping/transformasi log. Yang penting tidak menghapus outlier hanya karena "mengganggu" hasil.',
    tips: 'Outlier kadang justru insight utama (fraud, pelanggan VIP).' },
  { id: 'iv-12', chapter: 3, tier: 'pro', type: 'behavioral',
    q: 'Bagaimana kamu menjelaskan insight teknis kepada stakeholder non-teknis?',
    answer: 'Saya mulai dari kesimpulan dan rekomendasi (bottom line up front), baru mendukungnya dengan data seperlunya. Saya memakai bahasa bisnis (revenue, pelanggan, biaya) bukan istilah teknis, visual sederhana dengan satu pesan per grafik, serta analogi. Contohnya, alih-alih "korelasi 0.8", saya katakan "setiap kenaikan diskon 10% diikuti kenaikan order sekitar 15%, tapi margin turun, jadi saya sarankan diskon hanya untuk kategori A."',
    tips: 'Data storytelling: Konteks → Konflik/Insight → Rekomendasi aksi.' },
  { id: 'iv-13', chapter: 3, tier: 'pro', type: 'behavioral',
    q: 'Bagaimana jika stakeholder tidak setuju dengan hasil analisismu?',
    answer: 'Saya mendengarkan dulu alasan mereka — sering kali mereka punya konteks bisnis yang tidak terlihat di data. Lalu saya bersama-sama mengecek asumsi, definisi metrik, dan sumber data. Jika ternyata analisis saya keliru, saya akui dan perbaiki. Jika data tetap mendukung kesimpulan, saya presentasikan buktinya dengan cara berbeda, atau mengusulkan uji kecil (pilot/A/B test) agar keputusan berbasis bukti, bukan opini.',
    tips: 'Tunjukkan sikap kolaboratif dan objektif, bukan defensif.' },

  // =========================================================================
  // BAB 4 — STAR BEHAVIORAL MASTERY & BUSINESS CASE DIAGNOSTICS (PRO TIER)
  // =========================================================================
  { id: 'iv-11', chapter: 4, tier: 'pro', type: 'behavioral',
    q: 'Ceritakan project data paling menantang yang pernah kamu kerjakan.',
    answer: 'Gunakan metode STAR. Situation: konteks singkat (mis. data penjualan tersebar di 5 file Excel dari cabang berbeda). Task: tanggung jawabmu (menyatukan & membuat laporan mingguan otomatis). Action: langkah konkret yang KAMU lakukan (membuat script Python untuk cleaning, standarisasi kode produk, model star schema, dashboard Power BI dengan refresh terjadwal). Result: dampak terukur (waktu laporan turun 80%, menemukan 3 produk slow-moving senilai Rp 200 juta).',
    tips: 'Fokus pada "saya", bukan "kami". Siapkan 3 cerita STAR yang bisa dipakai untuk banyak pertanyaan.' },
  { id: 'iv-14', chapter: 4, tier: 'pro', type: 'behavioral',
    q: 'Ceritakan saat kamu membuat kesalahan dalam analisis.',
    answer: 'STAR: "Saya pernah melaporkan revenue yang lebih tinggi 12% karena join ke tabel promo menghasilkan baris ganda. Begitu menyadarinya, saya segera menginformasikan ke manajer sebelum keputusan diambil, mengirim angka yang sudah dikoreksi, dan menjelaskan penyebabnya. Sejak itu saya selalu melakukan sanity check — membandingkan jumlah baris sebelum/sesudah join dan mencocokkan total dengan sumber resmi — dan membuat checklist validasi untuk tim."',
    tips: 'Pilih kesalahan nyata tapi tidak fatal. Fokus pada pembelajaran & sistem pencegahan.' },
  { id: 'iv-15', chapter: 4, tier: 'pro', type: 'behavioral',
    q: 'Bagaimana kamu memprioritaskan banyak permintaan data sekaligus?',
    answer: 'Saya menilai setiap permintaan dari dampak bisnis dan urgensi (matriks impact vs effort), mengklarifikasi tenggat sebenarnya dan keputusan apa yang bergantung pada data itu. Saya komunikasikan estimasi waktu secara transparan, berdiskusi dengan atasan jika ada konflik prioritas, dan mencari peluang otomasi atau dashboard self-service untuk permintaan yang berulang.',
    tips: 'Sebutkan tools yang kamu pakai: Trello/Jira, kalender, dsb.' },
  { id: 'iv-16', chapter: 4, tier: 'pro', type: 'behavioral',
    q: 'Mengapa kamu ingin menjadi Data Analyst di perusahaan kami?',
    answer: 'Hubungkan tiga hal: (1) ketertarikanmu pada data dan pemecahan masalah, (2) sesuatu yang spesifik tentang perusahaan — produk, industri, atau tantangan datanya (riset sebelum interview!), dan (3) bagaimana skill-mu dapat langsung berkontribusi. Contoh: "Saya melihat perusahaan ini sedang ekspansi ke 10 kota baru; pengalaman saya menganalisis performa cabang dan segmentasi pelanggan bisa membantu menentukan strategi lokasi dan promosi."',
    tips: 'Hindari jawaban generik seperti "perusahaan ini besar dan terkenal".' },
  { id: 'iv-17', chapter: 4, tier: 'pro', type: 'case',
    q: 'Jumlah pengguna aktif harian (DAU) aplikasi turun 15% minggu ini. Bagaimana kamu menginvestigasinya?',
    answer: '1) Validasi data: apakah ada perubahan tracking, bug pipeline, atau definisi DAU? 2) Cek pola waktu: tiba-tiba atau bertahap? Ada hari libur/musiman? 3) Segmentasi: platform (Android/iOS), versi aplikasi, wilayah, channel akuisisi, pengguna baru vs lama — cari segmen penyumbang penurunan terbesar. 4) Faktor internal: rilis fitur baru, perubahan harga, gangguan server, campaign berakhir. 5) Faktor eksternal: kompetitor, berita, regulasi. 6) Susun hipotesis, uji dengan data, lalu rekomendasikan aksi beserta metrik yang akan dipantau.',
    tips: 'Bicarakan pendekatanmu secara terstruktur sambil berpikir keras (think aloud).' },
  { id: 'iv-18', chapter: 4, tier: 'pro', type: 'case',
    q: 'Metrik apa saja yang akan kamu taruh di dashboard eksekutif untuk sebuah e-commerce?',
    answer: 'Saya mulai dengan bertanya tujuan bisnis dan keputusan yang akan diambil. Umumnya: North Star (GMV/revenue), lalu pendorongnya — jumlah order, Average Order Value, conversion rate, jumlah pelanggan aktif & baru, repeat purchase rate/retention, CAC dan margin. Ditampilkan sebagai KPI card dengan perbandingan periode (MoM/YoY) dan target, tren mingguan, serta drill-down per kategori, wilayah, dan channel. Maksimal 5–7 KPI utama agar tidak membingungkan.',
    tips: 'Tunjukkan kamu memikirkan pengguna dashboard, bukan hanya angka.' },
  { id: 'iv-19', chapter: 4, tier: 'pro', type: 'case',
    q: 'Bagaimana kamu mengukur keberhasilan program loyalty/member baru?',
    answer: 'Definisikan tujuan program: meningkatkan retensi dan frekuensi belanja. Primary metric: repeat purchase rate & frekuensi transaksi member. Secondary: AOV, customer lifetime value, churn. Guardrail: margin (biaya poin/diskon), kanibalisasi. Untuk mengisolasi dampak, bandingkan dengan grup kontrol (A/B test atau difference-in-differences antara member dan non-member yang mirip, mengontrol self-selection bias), lalu hitung ROI program.',
    tips: 'Menyebut self-selection bias menunjukkan pemahaman analitis yang matang.' }
];

window.INTERVIEW_TYPES = {
  technical: { label: 'Technical Architecture', icon: 'TECH' },
  stats: { label: 'Statistical Inference', icon: 'STAT' },
  behavioral: { label: 'STAR Behavioral', icon: 'STAR' },
  case: { label: 'Executive Case', icon: 'CASE' }
};
