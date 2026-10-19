import React from 'react';
import CodeViewer from '../components/CodeViewer';

export default function Page2Ingestion({ data, onNavigate }) {
  const auditLogs = data?.samples?.audit_log || [];
  const dqResults = data?.dq_results || [];

  const duckdbSqlSnippet = `-- Pola Ekstraksi & Pemuatan Idempotent (DuckDB Native CSV Reader):
CREATE SCHEMA IF NOT EXISTS raw_bronze;
CREATE SCHEMA IF NOT EXISTS stg_silver;
CREATE SCHEMA IF NOT EXISTS mart_gold;

CREATE OR REPLACE TABLE raw_bronze.raw_orders AS
SELECT 
    *,
    CURRENT_TIMESTAMP AS _ingested_at,
    'orders.csv'      AS _source_file,
    'RUN-20261016'    AS _batch_run_id
FROM read_csv_auto('data/raw/orders.csv', header=True);`;

  return (
    <div className="space-y-10">
      {/* Chapter Header */}
      <section className="border-b-2 border-[#141413] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#991B1B] font-bold">
            SECTION 02 // IDEMPOTENT ELT INGESTION &amp; OLAP WAREHOUSE
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#141413] leading-tight">
            Langkah 2: Arsitektur ELT Idempotent, Lineage Metadata &amp; DuckDB Storage
          </h1>
          <p className="text-sm text-[#3D3C3A] leading-relaxed">
            Bagaimana merancang pipeline pemasukan data yang tahan terhadap kegagalan berulang (<em>retry-safe</em>),
            menyimpan jejak audit lengkap, dan memisahkan data mentah dari lapisan transformasi.
          </p>
        </div>
        <button
          onClick={() => onNavigate('step3')}
          className="px-4 py-2.5 bg-[#141413] text-[#FAF9F5] font-mono text-xs uppercase tracking-wider hover:bg-[#333330] transition shrink-0"
        >
          LANJUT KE BAB 03: KIMBALL SQL →
        </button>
      </section>

      {/* Part 1: Three Architectural Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 border border-[#141413] bg-white divide-y md:divide-y-0 md:divide-x divide-[#141413]">
        <div className="p-6 space-y-3">
          <div className="font-mono text-xs font-bold text-[#991B1B] uppercase tracking-wider">
            PRINSIP 01 // IDEMPOTENCY
          </div>
          <h2 className="font-serif text-xl font-bold text-[#141413]">
            Jaminan Konsistensi Eksekusi Berulang
          </h2>
          <p className="text-xs md:text-sm text-[#3D3C3A] leading-relaxed">
            Operasi pipeline bersifat <strong>Idempotent</strong> apabila dieksekusi satu kali maupun sepuluh kali
            berturut-turut menghasilkan kondisi tabel akhir yang sama persis tanpa menggandakan baris data.
          </p>
          <div className="p-2.5 bg-[#F2F0E8] border border-[#141413] font-mono text-[11px] text-[#141413]">
            f(x) = f(f(x)) → CREATE OR REPLACE / Partition Overwrite
          </div>
        </div>

        <div className="p-6 space-y-3">
          <div className="font-mono text-xs font-bold text-[#141413] uppercase tracking-wider">
            PRINSIP 02 // ELT PARADIGM
          </div>
          <h2 className="font-serif text-xl font-bold text-[#141413]">
            Imutabilitas Lapisan Raw Bronze
          </h2>
          <p className="text-xs md:text-sm text-[#3D3C3A] leading-relaxed">
            Berbeda dengan ETL lama yang memodifikasi data sebelum masuk ke database, paradigma <strong>ELT</strong>{' '}
            memuat data mentah apa adanya ke skema <code>raw_bronze</code> agar kita selalu memiliki bukti asli apabila
            ditemukan bug pada logika bisnis di kemudian hari.
          </p>
          <div className="p-2.5 bg-[#F2F0E8] border border-[#141413] font-mono text-[11px] text-[#141413]">
            Lineage: _ingested_at, _source_file, _batch_run_id
          </div>
        </div>

        <div className="p-6 space-y-3">
          <div className="font-mono text-xs font-bold text-[#166534] uppercase tracking-wider">
            PRINSIP 03 // COLUMNAR OLAP
          </div>
          <h2 className="font-serif text-xl font-bold text-[#141413]">
            Penyimpanan Kolumnar vs Baris
          </h2>
          <p className="text-xs md:text-sm text-[#3D3C3A] leading-relaxed">
            Database aplikasi (PostgreSQL/MySQL) membaca seluruh baris saat melakukan agregasi. <strong>DuckDB</strong>{' '}
            menyimpan data per-kolom dan memproses vektor CPU secara paralel, mengeksekusi ribuan baris transaksi hanya
            dalam ~45–210 milidetik.
          </p>
          <div className="p-2.5 bg-[#F2F0E8] border border-[#141413] font-mono text-[11px] text-[#141413]">
            {data?.warehouse_engine}
          </div>
        </div>
      </section>

      {/* Part 2: Pipeline Telemetry & Automated Data Quality Assertions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#141413] pb-2">
            <h2 className="font-serif text-xl font-bold text-[#141413]">
              2.1. Log Telemetri Eksekusi (raw_bronze._pipeline_audit_log)
            </h2>
            <span className="font-mono text-[11px] text-[#166534] font-bold">STATUS: RECORDED</span>
          </div>
          <div className="overflow-x-auto border border-[#141413] bg-white">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-[#F2F0E8] border-b border-[#141413]">
                  <th className="py-2.5 px-3">TARGET TABLE</th>
                  <th className="py-2.5 px-3">SOURCE</th>
                  <th className="py-2.5 px-3 text-right">ROWS</th>
                  <th className="py-2.5 px-3 text-right">LATENCY</th>
                  <th className="py-2.5 px-3 text-center">STATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D6CE]">
                {auditLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-[#FAF9F5]">
                    <td className="py-2 px-3 font-bold text-[#141413]">{log.table_name}</td>
                    <td className="py-2 px-3 text-[#52514E]">{log.source_file}</td>
                    <td className="py-2 px-3 text-right">{Number(log.rows_loaded).toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{log.duration_ms} ms</td>
                    <td className="py-2 px-3 text-center font-bold text-[#166534]">{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#141413] pb-2">
            <h2 className="font-serif text-xl font-bold text-[#141413]">
              2.2. Pengujian Integritas &amp; Data Quality Gate Otomatis
            </h2>
            <span className="font-mono text-[11px] text-[#166534] font-bold">3/3 PASSED</span>
          </div>
          <div className="border border-[#141413] bg-white divide-y divide-[#141413]">
            {dqResults.map((dq, i) => (
              <div key={i} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-mono text-xs font-bold text-[#141413]">
                    TEST #{i + 1}: {dq.test_name}
                  </div>
                  <div className="text-xs text-[#52514E]">Kriteria: {dq.expected}</div>
                  <div className="font-mono text-xs text-[#166534] font-semibold">Aktual: {dq.actual}</div>
                </div>
                <span className="px-2 py-0.5 border border-[#166534] bg-[#F0FDF4] text-[#166534] font-mono text-[11px] font-bold shrink-0">
                  {dq.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Part 3: DuckDB Native SQL Pattern */}
      <section className="space-y-3">
        <div className="border-b border-[#141413] pb-2">
          <h2 className="font-serif text-2xl font-bold text-[#141413]">
            2.3. Pola Query SQL Ingestion DuckDB &amp; Injeksi Kolom Lineage
          </h2>
        </div>
        <CodeViewer
          title="DuckDB Native Ingestion Pattern"
          language="sql"
          code={duckdbSqlSnippet}
          annotations={[
            {
              title: 'Namespace Isolation (Schemas)',
              desc: 'Memisahkan skema raw_bronze, stg_silver, dan mart_gold dalam satu database file agar tata kelola akses tetap terstruktur.',
            },
            {
              title: 'read_csv_auto() Vectorized Reader',
              desc: 'Membaca file CSV secara paralel langsung ke struktur kolumnar beserta penambahan metadata _ingested_at.',
            },
          ]}
        />
      </section>

      {/* Part 4: Python Ingestion Code */}
      <section className="space-y-3">
        <div className="border-b border-[#141413] pb-2">
          <h2 className="font-serif text-2xl font-bold text-[#141413]">
            2.4. Kode Sumber Lengkap: <code>src/02_ingestion.py</code>
          </h2>
        </div>
        <CodeViewer
          title="src/02_ingestion.py"
          language="python"
          code={data?.code_repository?.py_02_ingestion || ''}
          annotations={[
            {
              title: 'Pre-Flight File Verification',
              desc: 'Mengecek keberadaan fisik file CSV sebelum membuka transaksi pemuatan ke DuckDB.',
            },
            {
              title: 'Execution Telemetry Logging',
              desc: 'Menghitung waktu eksekusi presisi tinggi (time.perf_counter) dan menyimpan riwayatnya ke tabel _pipeline_audit_log.',
            },
          ]}
        />
      </section>
    </div>
  );
}
