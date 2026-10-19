-- =============================================================================
-- STEP 3B: KIMBALL DIMENSION TABLES (mart_gold.dim_*)
-- Purpose: Enrich Customer & Product Attributes for Slicing & Segmentation
-- =============================================================================

-- 1. Dimension Products: Catalog with Gross Margin Profile
CREATE OR REPLACE TABLE mart_gold.dim_products AS
SELECT
    product_sku,
    ANY_VALUE(product_name) AS product_name,
    ANY_VALUE(category) AS category,
    MAX(unit_price_idr) AS unit_price_idr,
    MAX(unit_cogs_idr) AS unit_cogs_idr,
    MAX(unit_price_idr) - MAX(unit_cogs_idr) AS unit_gross_margin_idr,
    ROUND(
        (MAX(unit_price_idr) - MAX(unit_cogs_idr)) * 100.0 / NULLIF(MAX(unit_price_idr), 0),
        2
    ) AS product_gross_margin_pct,
    SUM(quantity) AS total_units_ordered
FROM stg_silver.stg_order_items
GROUP BY product_sku
ORDER BY product_sku;

-- 2. Dimension Customers: Enriched with Order History & RFM Attributes
CREATE OR REPLACE TABLE mart_gold.dim_customers AS
WITH customer_orders AS (
    SELECT
        customer_id,
        COUNT(DISTINCT order_id) FILTER (WHERE order_status = 'completed') AS completed_orders_count,
        COUNT(DISTINCT order_id) FILTER (WHERE order_status IN ('cancelled', 'returned')) AS failed_orders_count,
        MIN(order_date) FILTER (WHERE order_status = 'completed') AS first_completed_order_date,
        MAX(order_date) FILTER (WHERE order_status = 'completed') AS last_completed_order_date,
        COALESCE(
            SUM(gross_amount_idr - discount_amount_idr) FILTER (WHERE order_status = 'completed'),
            0
        ) AS lifetime_net_sales_idr,
        COALESCE(
            SUM(gross_amount_idr) FILTER (WHERE order_status = 'completed'),
            0
        ) AS lifetime_gross_sales_idr
    FROM stg_silver.stg_orders
    GROUP BY customer_id
)
SELECT
    c.customer_id,
    c.full_name,
    c.email,
    c.city,
    c.province,
    c.acquisition_channel,
    c.acquisition_campaign,
    c.registered_at,
    c.cohort_month,
    COALESCE(co.completed_orders_count, 0) AS completed_orders,
    COALESCE(co.failed_orders_count, 0) AS failed_orders,
    co.first_completed_order_date,
    co.last_completed_order_date,
    COALESCE(co.lifetime_net_sales_idr, 0) AS ltv_net_sales_idr,
    CASE
        WHEN COALESCE(co.completed_orders_count, 0) > 1 THEN TRUE
        ELSE FALSE
    END AS is_repeat_buyer,
    DATE_DIFF('day', co.last_completed_order_date, DATE '2026-06-30') AS recency_days
FROM stg_silver.stg_customers c
LEFT JOIN customer_orders co
    ON c.customer_id = co.customer_id;
