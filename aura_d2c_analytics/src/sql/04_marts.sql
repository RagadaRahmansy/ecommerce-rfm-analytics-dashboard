-- =============================================================================
-- STEP 3D: EXECUTIVE GOLD MARTS (mart_gold.mart_*)
-- Purpose: Pre-aggregated Business Marts for BI Dashboard & C-Level Reporting
-- =============================================================================

-- 1. Mart Channel & Monthly Unit Economics (Exposing the ROAS Illusion)
CREATE OR REPLACE TABLE mart_gold.mart_channel_unit_economics AS
WITH order_agg AS (
    SELECT
        order_month,
        sales_channel AS channel,
        COUNT(DISTINCT order_id) AS total_orders,
        COUNT(DISTINCT order_id) FILTER (WHERE order_status = 'completed') AS completed_orders,
        COUNT(DISTINCT order_id) FILTER (WHERE order_status = 'returned') AS returned_orders,
        COUNT(DISTINCT order_id) FILTER (WHERE order_status = 'cancelled') AS cancelled_orders,
        COUNT(DISTINCT customer_id) FILTER (WHERE buyer_type = 'New Customer Order' AND order_status = 'completed') AS new_paying_customers,
        COUNT(DISTINCT customer_id) FILTER (WHERE buyer_type = 'Repeat Order' AND order_status = 'completed') AS repeat_customers,
        SUM(gmv_gross_idr) AS gmv_gross_idr,
        SUM(realized_gross_idr) AS realized_gross_idr,
        SUM(discount_idr) AS discount_idr,
        SUM(net_sales_idr) AS net_sales_idr,
        SUM(marketplace_fee_idr) AS marketplace_fee_idr,
        SUM(cogs_idr) AS cogs_idr,
        SUM(return_shipping_loss_idr) AS return_shipping_loss_idr,
        SUM(contribution_margin_before_ads_idr) AS cm_before_ads_idr
    FROM mart_gold.fct_orders
    GROUP BY order_month, sales_channel
),
ad_agg AS (
    SELECT
        spend_month,
        target_channel AS channel,
        SUM(spend_idr) AS ad_spend_idr,
        SUM(impressions) AS impressions,
        SUM(clicks) AS clicks
    FROM stg_silver.stg_ad_spend
    GROUP BY spend_month, target_channel
)
SELECT
    oa.order_month,
    STRFTIME(oa.order_month, '%Y-%m') AS year_month,
    oa.channel,
    oa.total_orders,
    oa.completed_orders,
    oa.returned_orders,
    oa.cancelled_orders,
    oa.new_paying_customers,
    oa.repeat_customers,
    oa.gmv_gross_idr,
    oa.realized_gross_idr,
    oa.discount_idr,
    oa.net_sales_idr,
    oa.marketplace_fee_idr,
    oa.cogs_idr,
    oa.return_shipping_loss_idr,
    oa.cm_before_ads_idr,
    COALESCE(aa.ad_spend_idr, 0) AS ad_spend_idr,
    -- Net Contribution Margin (Real Profit after COGS, Fees, Discounts, and Ads)
    (oa.cm_before_ads_idr - COALESCE(aa.ad_spend_idr, 0)) AS net_profit_idr,
    -- Vanity ROAS (What agency reports: GMV / Ad Spend)
    ROUND(oa.gmv_gross_idr * 1.0 / NULLIF(aa.ad_spend_idr, 0), 2) AS vanity_roas,
    -- Real Profit ROAS (Net Contribution Before Ads / Ad Spend)
    ROUND(oa.cm_before_ads_idr * 1.0 / NULLIF(aa.ad_spend_idr, 0), 2) AS contribution_roas,
    -- Blended CAC (Ad Spend / New Paying Customers)
    ROUND(COALESCE(aa.ad_spend_idr, 0) * 1.0 / NULLIF(oa.new_paying_customers, 0), 0) AS cac_idr,
    -- Net Profit Margin % (of Net Sales)
    ROUND((oa.cm_before_ads_idr - COALESCE(aa.ad_spend_idr, 0)) * 100.0 / NULLIF(oa.net_sales_idr, 0), 2) AS net_margin_pct
FROM order_agg oa
LEFT JOIN ad_agg aa
    ON oa.order_month = aa.spend_month
   AND oa.channel = aa.channel
ORDER BY oa.order_month, oa.channel;

-- 2. Mart Cohort Retention Matrix (M0 to M5)
CREATE OR REPLACE TABLE mart_gold.mart_cohort_retention AS
WITH completed_user_months AS (
    SELECT DISTINCT
        customer_id,
        customer_cohort_month AS cohort_month,
        acquisition_channel,
        order_month,
        DATE_DIFF('month', customer_cohort_month, order_month) AS month_number
    FROM mart_gold.fct_orders
    WHERE order_status = 'completed'
      AND customer_cohort_month IS NOT NULL
),
cohort_sizes AS (
    SELECT
        cohort_month,
        COUNT(DISTINCT customer_id) AS cohort_size
    FROM completed_user_months
    WHERE month_number = 0
    GROUP BY cohort_month
),
retention_counts AS (
    SELECT
        cohort_month,
        month_number,
        COUNT(DISTINCT customer_id) AS active_customers
    FROM completed_user_months
    WHERE month_number BETWEEN 0 AND 5
    GROUP BY cohort_month, month_number
)
SELECT
    STRFTIME(rc.cohort_month, '%Y-%m') AS cohort_month,
    cs.cohort_size,
    rc.month_number,
    rc.active_customers,
    ROUND(rc.active_customers * 100.0 / NULLIF(cs.cohort_size, 0), 1) AS retention_pct
FROM retention_counts rc
JOIN cohort_sizes cs
    ON rc.cohort_month = cs.cohort_month
ORDER BY rc.cohort_month, rc.month_number;

-- 3. Mart RFM Customer Segmentation
CREATE OR REPLACE TABLE mart_gold.mart_rfm_segments AS
WITH rfm_scores AS (
    SELECT
        customer_id,
        full_name,
        acquisition_channel,
        recency_days,
        completed_orders AS frequency,
        ltv_net_sales_idr AS monetary_idr,
        CASE
            WHEN recency_days <= 30 THEN 4
            WHEN recency_days <= 60 THEN 3
            WHEN recency_days <= 90 THEN 2
            ELSE 1
        END AS r_score,
        CASE
            WHEN completed_orders >= 4 THEN 4
            WHEN completed_orders = 3 THEN 3
            WHEN completed_orders = 2 THEN 2
            ELSE 1
        END AS f_score,
        CASE
            WHEN ltv_net_sales_idr >= 800000 THEN 4
            WHEN ltv_net_sales_idr >= 450000 THEN 3
            WHEN ltv_net_sales_idr >= 200000 THEN 2
            ELSE 1
        END AS m_score
    FROM mart_gold.dim_customers
    WHERE completed_orders > 0
)
SELECT
    *,
    CASE
        WHEN r_score >= 3 AND f_score >= 3 THEN 'Champions (Loyalists)'
        WHEN r_score >= 3 AND f_score = 2 THEN 'Potential Loyalists'
        WHEN r_score <= 2 AND f_score >= 2 THEN 'At-Risk Repeat Buyers'
        WHEN r_score >= 3 AND f_score = 1 THEN 'Recent One-Time Buyers'
        ELSE 'Churned Promo Hunters'
    END AS rfm_segment
FROM rfm_scores;
