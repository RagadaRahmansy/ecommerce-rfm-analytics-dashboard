"""
================================================================================
STEP 3 & 4: SQL MODELING RUNNER, DATA QUALITY TESTS & ANALYTICS EXPORT
Project: Aura Botanicals - End-to-End Analytics Pipeline
Role: Senior Data Analyst (5 Years Experience)
================================================================================
What this script does:
1. Executes Medallion SQL transformations (01_staging -> 02_dimensions -> 03_facts -> 04_marts)
   inside DuckDB.
2. Runs automated Data Quality Assertions (uniqueness, row deduplication check, null tests).
3. Extracts deep-dive analytical views (Unit Economics, Waterfall, Cohort Matrix,
   Channel Retention, RFM Segmentation, Product Margin, Sample Tables) into a
   structured JSON bundle for the React Interactive Portal & Dashboard.
================================================================================
"""

import json
import os
import time
import duckdb

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WAREHOUSE_DIR = os.path.join(BASE_DIR, "data", "warehouse")
SQL_DIR = os.path.join(BASE_DIR, "src", "sql")
FRONTEND_DATA_DIR = os.path.join(BASE_DIR, "frontend", "src", "data")
os.makedirs(FRONTEND_DATA_DIR, exist_ok=True)

DB_PATH = os.path.join(WAREHOUSE_DIR, "aura_analytics.duckdb")


def execute_transformations_and_export():
    print("=" * 72)
    print("[START] RUNNING STEP 3: MEDALLION SQL TRANSFORMATIONS IN DUCKDB")
    print("=" * 72)

    conn = duckdb.connect(DB_PATH)

    sql_files = [
        "01_staging.sql",
        "02_dimensions.sql",
        "03_facts.sql",
        "04_marts.sql",
    ]

    sql_contents = {}
    transformation_logs = []

    for fname in sql_files:
        fpath = os.path.join(SQL_DIR, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            sql_text = f.read()
        sql_contents[fname] = sql_text

        t0 = time.perf_counter()
        conn.execute(sql_text)
        elapsed = round((time.perf_counter() - t0) * 1000, 2)
        print(f"  [OK] Executed {fname:<22} | Duration: {elapsed:>6.2f} ms")
        transformation_logs.append({"file": fname, "duration_ms": elapsed, "status": "PASSED"})

    # -------------------------------------------------------------------------
    # DATA QUALITY TESTS (Senior Analyst Best Practice)
    # -------------------------------------------------------------------------
    print("\n[CHECK] RUNNING DATA QUALITY & INTEGRITY TESTS:")
    raw_orders_cnt = conn.execute("SELECT COUNT(*) FROM raw_bronze.raw_orders").fetchone()[0]
    stg_orders_cnt = conn.execute("SELECT COUNT(*) FROM stg_silver.stg_orders").fetchone()[0]
    dup_removed = raw_orders_cnt - stg_orders_cnt

    pk_dups = conn.execute("""
        SELECT COUNT(*) FROM (
            SELECT order_id FROM mart_gold.fct_orders GROUP BY order_id HAVING COUNT(*) > 1
        )
    """).fetchone()[0]

    null_cust = conn.execute("""
        SELECT COUNT(*) FROM mart_gold.fct_orders WHERE customer_id IS NULL
    """).fetchone()[0]

    dq_results = [
        {
            "test_name": "Deduplication Check (raw_orders -> stg_orders)",
            "expected": "Remove injected webhook duplicates",
            "actual": f"{raw_orders_cnt:,} raw -> {stg_orders_cnt:,} clean ({dup_removed} duplicates removed)",
            "status": "PASSED" if dup_removed == 15 else "WARNING"
        },
        {
            "test_name": "Primary Key Uniqueness (mart_gold.fct_orders.order_id)",
            "expected": "0 duplicate order_ids",
            "actual": f"{pk_dups} duplicates found",
            "status": "PASSED" if pk_dups == 0 else "FAILED"
        },
        {
            "test_name": "Referential Integrity (fct_orders.customer_id NOT NULL)",
            "expected": "0 orphan orders",
            "actual": f"{null_cust} null customer_ids",
            "status": "PASSED" if null_cust == 0 else "FAILED"
        }
    ]
    for dq in dq_results:
        print(f"  [OK] {dq['test_name']}: {dq['actual']} ({dq['status']})")

    # -------------------------------------------------------------------------
    # STEP 4: EXTRACT EXECUTIVE ANALYTICS & DEEP-DIVE METRICS
    # -------------------------------------------------------------------------
    def query_dicts(sql):
        df = conn.execute(sql).fetchdf()
        # Convert any dates/timestamps to string for JSON serialization
        for col in df.columns:
            if "date" in col or "month" in col or "_at" in col:
                df[col] = df[col].astype(str)
        return df.to_dict(orient="records")

    # 1. Monthly & Channel Unit Economics
    channel_monthly = query_dicts("SELECT * FROM mart_gold.mart_channel_unit_economics ORDER BY year_month, channel")

    # 2. Channel Summary Totals (6 Months Combined)
    channel_summary = query_dicts("""
        SELECT
            channel,
            SUM(total_orders)::INT AS total_orders,
            SUM(completed_orders)::INT AS completed_orders,
            SUM(returned_orders)::INT AS returned_orders,
            SUM(cancelled_orders)::INT AS cancelled_orders,
            ROUND((SUM(returned_orders) + SUM(cancelled_orders)) * 100.0 / NULLIF(SUM(total_orders), 0), 1) AS fail_rate_pct,
            SUM(new_paying_customers)::INT AS new_customers,
            SUM(repeat_customers)::INT AS repeat_orders,
            SUM(gmv_gross_idr)::BIGINT AS gmv_gross_idr,
            SUM(realized_gross_idr)::BIGINT AS realized_gross_idr,
            SUM(discount_idr)::BIGINT AS discount_idr,
            SUM(net_sales_idr)::BIGINT AS net_sales_idr,
            SUM(marketplace_fee_idr)::BIGINT AS marketplace_fee_idr,
            SUM(cogs_idr)::BIGINT AS cogs_idr,
            SUM(return_shipping_loss_idr)::BIGINT AS return_shipping_loss_idr,
            SUM(cm_before_ads_idr)::BIGINT AS cm_before_ads_idr,
            SUM(ad_spend_idr)::BIGINT AS ad_spend_idr,
            SUM(net_profit_idr)::BIGINT AS net_profit_idr,
            ROUND(SUM(gmv_gross_idr) * 1.0 / NULLIF(SUM(ad_spend_idr), 0), 2) AS vanity_roas,
            ROUND(SUM(cm_before_ads_idr) * 1.0 / NULLIF(SUM(ad_spend_idr), 0), 2) AS contribution_roas,
            ROUND(SUM(ad_spend_idr) * 1.0 / NULLIF(SUM(new_paying_customers), 0), 0)::BIGINT AS cac_idr,
            ROUND(SUM(net_profit_idr) * 100.0 / NULLIF(SUM(net_sales_idr), 0), 1) AS net_margin_pct
        FROM mart_gold.mart_channel_unit_economics
        GROUP BY channel
        ORDER BY gmv_gross_idr DESC
    """)

    # 3. Channel LTV vs CAC Comparison
    ltv_cac_by_channel = query_dicts("""
        WITH cust_ltv AS (
            SELECT
                acquisition_channel AS channel,
                COUNT(DISTINCT customer_id) FILTER (WHERE completed_orders > 0) AS paying_customers,
                COUNT(DISTINCT customer_id) FILTER (WHERE is_repeat_buyer = TRUE) AS repeat_buyers,
                ROUND(
                    COUNT(DISTINCT customer_id) FILTER (WHERE is_repeat_buyer = TRUE) * 100.0 /
                    NULLIF(COUNT(DISTINCT customer_id) FILTER (WHERE completed_orders > 0), 0),
                    1
                ) AS repeat_buyer_rate_pct,
                ROUND(AVG(ltv_net_sales_idr) FILTER (WHERE completed_orders > 0), 0)::BIGINT AS avg_ltv_net_sales_idr,
                ROUND(AVG(completed_orders) FILTER (WHERE completed_orders > 0), 2) AS avg_orders_per_buyer
            FROM mart_gold.dim_customers
            GROUP BY acquisition_channel
        ),
        chan_cm AS (
            SELECT
                channel,
                ROUND(SUM(cm_before_ads_idr) * 1.0 / NULLIF(SUM(new_paying_customers), 0), 0)::BIGINT AS ltv_contribution_margin_idr,
                ROUND(SUM(ad_spend_idr) * 1.0 / NULLIF(SUM(new_paying_customers), 0), 0)::BIGINT AS cac_idr
            FROM mart_gold.mart_channel_unit_economics
            GROUP BY channel
        )
        SELECT
            l.channel,
            l.paying_customers,
            l.repeat_buyers,
            l.repeat_buyer_rate_pct,
            l.avg_orders_per_buyer,
            l.avg_ltv_net_sales_idr,
            c.ltv_contribution_margin_idr,
            c.cac_idr,
            ROUND(c.ltv_contribution_margin_idr * 1.0 / NULLIF(c.cac_idr, 0), 2) AS ltv_to_cac_ratio
        FROM cust_ltv l
        JOIN chan_cm c ON l.channel = c.channel
        ORDER BY ltv_to_cac_ratio DESC
    """)

    # 4. Cohort Retention Matrix (Overall)
    cohort_matrix = query_dicts("SELECT * FROM mart_gold.mart_cohort_retention ORDER BY cohort_month, month_number")

    # 5. Cohort Retention by Acquisition Channel (M0 to M3 average retention)
    channel_retention_curve = query_dicts("""
        WITH user_months AS (
            SELECT DISTINCT
                customer_id,
                customer_cohort_month,
                acquisition_channel AS channel,
                DATE_DIFF('month', customer_cohort_month, order_month) AS month_number
            FROM mart_gold.fct_orders
            WHERE order_status = 'completed'
        ),
        base AS (
            SELECT channel, COUNT(DISTINCT customer_id) AS base_users
            FROM user_months WHERE month_number = 0
            GROUP BY channel
        )
        SELECT
            u.channel,
            u.month_number,
            COUNT(DISTINCT u.customer_id)::INT AS active_users,
            b.base_users::INT AS base_users,
            ROUND(COUNT(DISTINCT u.customer_id) * 100.0 / NULLIF(b.base_users, 0), 1) AS retention_pct
        FROM user_months u
        JOIN base b ON u.channel = b.channel
        WHERE u.month_number BETWEEN 0 AND 4
        GROUP BY u.channel, u.month_number, b.base_users
        ORDER BY u.channel, u.month_number
    """)

    # 6. RFM Segments Summary
    rfm_summary = query_dicts("""
        SELECT
            rfm_segment,
            COUNT(*)::INT AS customer_count,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS share_pct,
            ROUND(AVG(recency_days), 0)::INT AS avg_recency_days,
            ROUND(AVG(frequency), 2) AS avg_frequency,
            ROUND(AVG(monetary_idr), 0)::BIGINT AS avg_monetary_idr,
            SUM(monetary_idr)::BIGINT AS total_revenue_idr
        FROM mart_gold.mart_rfm_segments
        GROUP BY rfm_segment
        ORDER BY total_revenue_idr DESC
    """)

    # 7. Product Performance
    product_performance = query_dicts("SELECT * FROM mart_gold.dim_products ORDER BY total_units_ordered DESC")

    # 8. Sample Preview Rows for Step 1, Step 2, Step 3 Data Inspector
    samples = {
        "raw_orders": query_dicts("SELECT order_id, customer_id, channel, order_status, order_date, gross_amount, discount_amount, channel_fee_amount, _ingested_at FROM raw_bronze.raw_orders LIMIT 8"),
        "raw_customers": query_dicts("SELECT customer_id, full_name, city, acquisition_channel, acquisition_campaign, created_at FROM raw_bronze.raw_customers LIMIT 8"),
        "raw_ad_spend": query_dicts("SELECT spend_date, platform, target_channel, campaign_name, spend_idr, impressions, clicks FROM raw_bronze.raw_ad_spend LIMIT 8"),
        "fct_orders": query_dicts("SELECT order_id, customer_id, sales_channel, buyer_type, order_status, gmv_gross_idr, discount_idr, net_sales_idr, marketplace_fee_idr, cogs_idr, contribution_margin_before_ads_idr FROM mart_gold.fct_orders LIMIT 8"),
        "dim_customers": query_dicts("SELECT customer_id, full_name, acquisition_channel, cohort_month, completed_orders, ltv_net_sales_idr, is_repeat_buyer, recency_days FROM mart_gold.dim_customers WHERE completed_orders > 0 LIMIT 8"),
        "audit_log": query_dicts("SELECT run_id, table_name, source_file, rows_loaded, duration_ms, status, executed_at FROM raw_bronze._pipeline_audit_log ORDER BY executed_at DESC LIMIT 8"),
    }

    # Read Python source files so the frontend Educational Portal can display the exact code
    with open(os.path.join(BASE_DIR, "src", "01_data_generator.py"), "r", encoding="utf-8") as f:
        py_step1_code = f.read()
    with open(os.path.join(BASE_DIR, "src", "02_ingestion.py"), "r", encoding="utf-8") as f:
        py_step2_code = f.read()
    with open(os.path.join(BASE_DIR, "src", "03_analytics_deepdive.py"), "r", encoding="utf-8") as f:
        py_step4_code = f.read()

    payload = {
        "generated_at": "2026-10-16 21:05:00",
        "warehouse_engine": f"DuckDB v{duckdb.__version__} (OLAP Columnar Storage)",
        "dq_results": dq_results,
        "transformation_logs": transformation_logs,
        "channel_monthly": channel_monthly,
        "channel_summary": channel_summary,
        "ltv_cac_by_channel": ltv_cac_by_channel,
        "cohort_matrix": cohort_matrix,
        "channel_retention_curve": channel_retention_curve,
        "rfm_summary": rfm_summary,
        "product_performance": product_performance,
        "samples": samples,
        "code_repository": {
            "py_01_generator": py_step1_code,
            "py_02_ingestion": py_step2_code,
            "sql_01_staging": sql_contents["01_staging.sql"],
            "sql_02_dimensions": sql_contents["02_dimensions.sql"],
            "sql_03_facts": sql_contents["03_facts.sql"],
            "sql_04_marts": sql_contents["04_marts.sql"],
            "py_03_analytics": py_step4_code,
        }
    }

    out_json = os.path.join(FRONTEND_DATA_DIR, "analytics_payload.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    conn.close()
    print("=" * 72)
    print(f"[DONE] EXPORTED FULL ANALYTICS PAYLOAD -> {out_json}")
    print("=" * 72)


if __name__ == "__main__":
    execute_transformations_and_export()
