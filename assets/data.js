// KreditLens Glassbox Dataset & Automated Reconciliation Assertions
// All totals, ratios, and ledger tie-outs are computed directly from raw bucket & cohort records.

window.KREDITLENS_DATA = (() => {
  const snapshotDate = '15 Okt 2026';
  const priorMonthDate = '30 Sep 2026';

  // 1. Rincian Bucket DPD (Snapshot: 15 Okt 2026, nilai dalam Rp Miliar)
  const buckets = [
    { id: 'dpd0', bucket: 'Lancar (DPD 0)', dpdRange: '0 hari', contracts: 15910, principalB: 131.65, ckpnRate: 0.01 },
    { id: 'dpd30', bucket: 'DPD 1–30 (DPK)', dpdRange: '1–30 hari', contracts: 1180, principalB: 8.14, ckpnRate: 0.05 },
    { id: 'dpd60', bucket: 'DPD 31–60 (Kurang Lancar)', dpdRange: '31–60 hari', contracts: 490, principalB: 2.86, ckpnRate: 0.15 },
    { id: 'dpd90', bucket: 'DPD 61–90 (Diragukan)', dpdRange: '61–90 hari', contracts: 315, principalB: 1.70, ckpnRate: 0.50 },
    { id: 'npl', bucket: 'Macet / NPL (DPD > 90)', dpdRange: '> 90 hari', contracts: 525, principalB: 4.07, ckpnRate: 1.00 }
  ];

  // Total terhitung dari bucket
  const totalContracts = buckets.reduce((acc, r) => acc + r.contracts, 0);
  const totalAumB = +(buckets.reduce((acc, r) => acc + r.principalB, 0)).toFixed(2);
  const par30B = +(buckets.filter(r => ['dpd60', 'dpd90', 'npl'].includes(r.id)).reduce((acc, r) => acc + r.principalB, 0)).toFixed(2);
  const par30Contracts = buckets.filter(r => ['dpd60', 'dpd90', 'npl'].includes(r.id)).reduce((acc, r) => acc + r.contracts, 0);
  const nplB = buckets.find(r => r.id === 'npl').principalB;
  const nplContracts = buckets.find(r => r.id === 'npl').contracts;

  const par30Pct = +((par30B / totalAumB) * 100).toFixed(2);
  const nplPct = +((nplB / totalAumB) * 100).toFixed(2);

  // 2. Ringkasan Jurnal Buku Besar Immutable (Append-Only Double-Entry Tie-Out)
  const ledgerSummary = {
    journalLinesCount: 1482904,
    cumulativeDisbursedDebitB: 412.80,
    cumulativeRepaidCreditB: 264.38,
    get netLedgerOutstandingB() {
      return +(this.cumulativeDisbursedDebitB - this.cumulativeRepaidCreditB).toFixed(2);
    },
    get varianceRp() {
      return +(totalAumB - this.netLedgerOutstandingB).toFixed(2);
    }
  };

  // Asersi integritas matematis runtime
  console.assert(totalContracts === 18420, 'Total kontrak harus berjumlah 18.420');
  console.assert(totalAumB === 148.42, 'Total AUM harus berjumlah Rp 148.42 M');
  console.assert(par30B === 8.63, 'Saldo PAR-30 harus berjumlah Rp 8.63 M');
  console.assert(ledgerSummary.varianceRp === 0, 'Selisih Buku Besar vs Snapshot harus Rp 0.00');

  // 3. Kurva Analisis Vintage (Gagal Bayar Kumulatif % DPD > 90 per Bulan berjalan / MOB)
  const mobLabels = ['MOB 0', 'MOB 1', 'MOB 2', 'MOB 3', 'MOB 4', 'MOB 5', 'MOB 6'];
  const vintageCohorts = [
    {
      cohort: '2026-01 (Jan)',
      scoreCutoff: 640,
      disbursedB: 24.50,
      contracts: 3120,
      mob: [0.00, 0.12, 0.45, 1.10, 1.52, 1.88, 2.18],
      status: 'Acuan Dasar',
      statusClass: 'pos'
    },
    {
      cohort: '2026-03 (Mar)',
      scoreCutoff: 640,
      disbursedB: 28.10,
      contracts: 3490,
      mob: [0.00, 0.15, 0.52, 1.22, 1.68, 2.04, 2.35],
      status: 'Aman (<1.5%)',
      statusClass: 'pos'
    },
    {
      cohort: '2026-06 (Jun)',
      scoreCutoff: 580,
      disbursedB: 39.80,
      contracts: 5140,
      mob: [0.00, 0.38, 1.25, 2.85, 3.90, 4.45, 4.82],
      status: 'Lewat +163 bps',
      statusClass: 'neg'
    },
    {
      cohort: '2026-08 (Agu)',
      scoreCutoff: 625,
      disbursedB: 31.20,
      contracts: 3890,
      mob: [0.00, 0.14, 0.58, 1.34, null, null, null],
      status: 'Diperketat 625',
      statusClass: 'warn'
    }
  ];

  // 4. Matriks Transisi Roll-Rate Markov (Sep 2026 -> Okt 2026, % dari saldo awal bucket)
  const rollRateMatrix = [
    {
      fromBucket: 'Lancar (DPD 0)',
      startBalanceB: 129.40,
      toCurrent: 92.4,
      toDpd30: 5.1,
      toDpd60: 0.0,
      toDpd90: 0.0,
      toDefault: 0.0,
      toPaidOff: 2.5,
      note: 'Aliran masuk normal bulanan ke DPD 1–30 (5.1%)'
    },
    {
      fromBucket: 'DPD 1–30',
      startBalanceB: 7.45,
      toCurrent: 44.8,
      toDpd30: 14.6,
      toDpd60: 38.4,
      toDpd90: 0.0,
      toDefault: 0.0,
      toPaidOff: 2.2,
      note: 'Hambatan Desk Collection: 38.4% memburuk ke DPD 31–60'
    },
    {
      fromBucket: 'DPD 31–60',
      startBalanceB: 2.90,
      toCurrent: 11.5,
      toDpd30: 7.2,
      toDpd60: 19.8,
      toDpd90: 59.6,
      toDefault: 0.0,
      toPaidOff: 1.9,
      note: 'Wajib eskalasi penagihan lapangan di atas 50% roll'
    },
    {
      fromBucket: 'DPD 61–90',
      startBalanceB: 1.85,
      toCurrent: 2.8,
      toDpd30: 1.9,
      toDpd60: 4.5,
      toDpd90: 15.2,
      toDefault: 74.6,
      toPaidOff: 1.0,
      note: 'Degradasi terminal: 74.6% bermigrasi menjadi NPL > 90'
    }
  ];

  rollRateMatrix.forEach(row => {
    const sum = +(row.toCurrent + row.toDpd30 + row.toDpd60 + row.toDpd90 + row.toDefault + row.toPaidOff).toFixed(1);
    console.assert(sum === 100.0, `Baris Markov ${row.fromBucket} harus berjumlah 100.0%, tercatat ${sum}%`);
  });

  // 5. Spesifikasi Metrik Glassbox
  const glassboxSpecs = {
    aum: {
      id: 'aum',
      title: 'Baki Debet Aktif (AUM)',
      valueFormatted: `Rp ${totalAumB.toFixed(2)} M`,
      numeratorLabel: 'Debit Pencairan − Kredit Pelunasan',
      numeratorValue: `Rp 412.80 M − Rp 264.38 M = Rp ${totalAumB.toFixed(2)} M`,
      denominatorLabel: 'Kontrak Terverifikasi di Buku Besar',
      denominatorValue: `${totalContracts.toLocaleString('en-US')} pinjaman (Δ = Rp 0.00)`,
      formula: 'AUM_t = SUM(debit_disbursement) - SUM(credit_repayment) WHERE tx_ts <= t',
      lineage: 'raw_core.repayment_ledger -> marts_risk.fct_loan_daily_snapshot',
      sql: `-- models/marts/risk/fct_loan_daily_snapshot.sql
SELECT
  COUNT(DISTINCT loan_key) AS active_contracts,
  ROUND(
    SUM(debit_disbursed - credit_repaid) / 1e9, 2
  ) AS total_aum_b
FROM {{ ref('int_loan_ledger_balances') }}
WHERE snapshot_date = DATE '2026-10-15'
  AND (debit_disbursed - credit_repaid) > 0;`
    },
    par30: {
      id: 'par30',
      title: 'Portofolio Berisiko (PAR-30)',
      valueFormatted: `${par30Pct.toFixed(2)}%`,
      numeratorLabel: 'Pokok Pinjaman dengan DPD > 30 Hari',
      numeratorValue: `Rp ${par30B.toFixed(2)} M (${par30Contracts.toLocaleString('en-US')} pinjaman)`,
      denominatorLabel: 'Total Baki Debet Aktif (AUM)',
      denominatorValue: `Rp ${totalAumB.toFixed(2)} M (${totalContracts.toLocaleString('en-US')} pinjaman)`,
      formula: 'PAR30_% = SUM(principal WHERE dpd > 30) / SUM(principal) * 100',
      lineage: 'raw_core.repayment_schedule -> marts_risk.fct_loan_daily_snapshot',
      sql: `-- models/marts/risk/kpi_par30_daily.sql
SELECT
    snapshot_date,
    ROUND(SUM(CASE WHEN dpd_days > 30 THEN outstanding_principal ELSE 0 END) / 1e9, 2) AS par30_b,
    ROUND(SUM(CASE WHEN dpd_days > 30 THEN outstanding_principal ELSE 0 END) * 100.0
      / NULLIF(SUM(outstanding_principal), 0), 2) AS par30_pct
FROM {{ ref('fct_loan_daily_snapshot') }}
WHERE snapshot_date = DATE '2026-10-15' AND is_written_off = FALSE
GROUP BY snapshot_date;`
    },
    npl: {
      id: 'npl',
      title: 'Rasio NPL Gross (DPD > 90)',
      valueFormatted: `${nplPct.toFixed(2)}%`,
      numeratorLabel: 'Pokok Pinjaman Macet (DPD > 90)',
      numeratorValue: `Rp ${nplB.toFixed(2)} M (${nplContracts.toLocaleString('en-US')} pinjaman)`,
      denominatorLabel: 'Total Baki Debet Aktif (AUM)',
      denominatorValue: `Rp ${totalAumB.toFixed(2)} M (Batas OJK: 5.00%)`,
      formula: 'Gross_NPL_% = SUM(principal WHERE dpd > 90) / SUM(principal) * 100',
      lineage: 'raw_core.repayment_ledger -> marts_risk.fct_loan_daily_snapshot',
      sql: `-- models/marts/risk/kpi_gross_npl_ojk.sql
SELECT
    snapshot_date,
    COUNT(DISTINCT CASE WHEN dpd_days > 90 THEN loan_key END) AS npl_loans,
    ROUND(SUM(CASE WHEN dpd_days > 90 THEN outstanding_principal ELSE 0 END) * 100.0
      / NULLIF(SUM(outstanding_principal), 0), 2) AS gross_npl_pct
FROM {{ ref('fct_loan_daily_snapshot') }}
WHERE snapshot_date = DATE '2026-10-15' AND is_written_off = FALSE
GROUP BY snapshot_date;`
    },
    rollrate: {
      id: 'rollrate',
      title: 'Roll-Rate Markov (1–30 → 31–60)',
      valueFormatted: '38.4%',
      numeratorLabel: 'Saldo DPD 1–30 Sep Memburuk ke 31–60 Okt',
      numeratorValue: 'Rp 2.86 M (490 kontrak bermigrasi)',
      denominatorLabel: 'Saldo Awal DPD 1–30 (30 Sep)',
      denominatorValue: 'Rp 7.45 M (Pulih ke Lancar: 44.8%)',
      formula: 'P(i -> j) = SUM(bal_t WHERE b_t1=i AND b_t=j) / SUM(bal_t1 WHERE b_t1=i)',
      lineage: 'marts_risk.fct_loan_daily_snapshot (t-1) -> fct_roll_rate_matrix (t)',
      sql: `-- models/marts/risk/fct_roll_rate_matrix.sql
SELECT
    prev.dpd_bucket AS from_bucket,
    curr.dpd_bucket AS to_bucket,
    ROUND(SUM(curr.outstanding_principal) * 100.0 / NULLIF(
      SUM(SUM(prev.outstanding_principal)) OVER (PARTITION BY prev.dpd_bucket), 0), 1) AS roll_pct
FROM {{ ref('fct_loan_daily_snapshot') }} prev
JOIN {{ ref('fct_loan_daily_snapshot') }} curr ON prev.loan_key = curr.loan_key
WHERE prev.snapshot_date = DATE '2026-09-30' AND curr.snapshot_date = DATE '2026-10-15'
GROUP BY 1, 2;`
    }
  };

  // 6. Titik Pemeriksaan Rekonsiliasi Buku Besar Immutable
  const auditChecks = [
    {
      checkId: 'CHK-01',
      name: 'Kesamaan Buku Besar Berpasangan (Debit − Kredit = Snapshot AUM)',
      assertion: 'SUM(debit_disbursement) - SUM(credit_repayment) == SUM(snapshot.outstanding_principal)',
      expected: 'Rp 148.42 M',
      actual: 'Rp 148.42 M',
      variance: 'Rp 0.00',
      status: 'LULUS'
    },
    {
      checkId: 'CHK-02',
      name: 'Invarian Penuaan Kalender DPD Monotonik',
      assertion: 'WHERE payment_received = 0, dpd_days(t) == dpd_days(t-1) + 1',
      expected: '0 pelanggaran',
      actual: '0 pelanggaran (18,420 pinjaman)',
      variance: '0 baris',
      status: 'LULUS'
    },
    {
      checkId: 'CHK-03',
      name: 'Kekekalan Probabilitas Baris Matriks Markov',
      assertion: 'FOR ALL bucket_i: SUM(P(i -> j)) == 100.0%',
      expected: '100.0% per baris',
      actual: '100.0% pada 4 bucket',
      variance: '0.0%',
      status: 'LULUS'
    },
    {
      checkId: 'CHK-04',
      name: 'Batas Ambang Underwriting Kohort (Gagal Bayar MOB-3 <= 1.50%)',
      assertion: 'vintage_default_pct(cohort, mob=3) <= 1.50%',
      expected: '<= 1.50%',
      actual: 'Jun 2026 sebesar 2.85%',
      variance: '+1.35% lewat batas',
      status: 'LEWAT BATAS'
    }
  ];

  return {
    snapshotDate,
    priorMonthDate,
    buckets,
    totalContracts,
    totalAumB,
    par30B,
    par30Contracts,
    par30Pct,
    nplB,
    nplContracts,
    nplPct,
    ledgerSummary,
    mobLabels,
    vintageCohorts,
    rollRateMatrix,
    glassboxSpecs,
    auditChecks
  };
})();
