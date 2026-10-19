-- =============================================================================
-- STEP 3A: STAGING LAYER (stg_silver)
-- Purpose: Deduplication, Data Type Casting, String Normalization, Null Handling
-- =============================================================================

-- 1. Staging Customers: Normalize email & trim strings
CREATE OR REPLACE TABLE stg_silver.stg_customers AS
WITH deduplicated AS (
    SELECT
        TRIM(customer_id) AS customer_id,
        TRIM(full_name) AS full_name,
        LOWER(TRIM(email)) AS email,
        TRIM(city) AS city,
        TRIM(province) AS province,
        TRIM(acquisition_channel) AS acquisition_channel,
        TRIM(acquisition_campaign) AS acquisition_campaign,
        CAST(created_at AS TIMESTAMP) AS registered_at,
        DATE_TRUNC('month', CAST(created_at AS TIMESTAMP))::DATE AS cohort_month,
        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at ASC) AS rn
    FROM raw_bronze.raw_customers
)
SELECT * EXCLUDE (rn)
FROM deduplicated
WHERE rn = 1;

-- 2. Staging Orders: Remove duplicate webhook/ingestion records (15 duplicates injected)
CREATE OR REPLACE TABLE stg_silver.stg_orders AS
WITH ranked_orders AS (
    SELECT
        TRIM(order_id) AS order_id,
        TRIM(customer_id) AS customer_id,
        TRIM(channel) AS channel,
        LOWER(TRIM(order_status)) AS order_status,
        CAST(order_date AS TIMESTAMP) AS ordered_at,
        CAST(order_date AS DATE) AS order_date,
        DATE_TRUNC('month', CAST(order_date AS DATE))::DATE AS order_month,
        CAST(gross_amount AS BIGINT) AS gross_amount_idr,
        CAST(discount_amount AS BIGINT) AS discount_amount_idr,
        CAST(channel_fee_amount AS BIGINT) AS channel_fee_idr,
        CAST(return_shipping_loss AS BIGINT) AS return_shipping_loss_idr,
        TRIM(payment_method) AS payment_method,
        ROW_NUMBER() OVER (
            PARTITION BY TRIM(order_id)
            ORDER BY _ingested_at DESC
        ) AS rn
    FROM raw_bronze.raw_orders
)
SELECT * EXCLUDE (rn)
FROM ranked_orders
WHERE rn = 1;

-- 3. Staging Order Items: Clean SKU & line financials
CREATE OR REPLACE TABLE stg_silver.stg_order_items AS
SELECT
    TRIM(item_id) AS item_id,
    TRIM(order_id) AS order_id,
    TRIM(product_sku) AS product_sku,
    TRIM(product_name) AS product_name,
    TRIM(category) AS category,
    CAST(quantity AS INTEGER) AS quantity,
    CAST(unit_price AS BIGINT) AS unit_price_idr,
    CAST(unit_cogs AS BIGINT) AS unit_cogs_idr,
    CAST(line_gross_amount AS BIGINT) AS line_gross_idr,
    CAST(line_cogs_amount AS BIGINT) AS line_cogs_idr
FROM raw_bronze.raw_order_items;

-- 4. Staging Ad Spend: Daily marketing spend per channel & campaign
CREATE OR REPLACE TABLE stg_silver.stg_ad_spend AS
SELECT
    CAST(spend_date AS DATE) AS spend_date,
    DATE_TRUNC('month', CAST(spend_date AS DATE))::DATE AS spend_month,
    TRIM(platform) AS ad_platform,
    TRIM(target_channel) AS target_channel,
    TRIM(campaign_name) AS campaign_name,
    CAST(spend_idr AS BIGINT) AS spend_idr,
    CAST(impressions AS INTEGER) AS impressions,
    CAST(clicks AS INTEGER) AS clicks
FROM raw_bronze.raw_ad_spend;
