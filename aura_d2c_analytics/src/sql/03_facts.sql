-- =============================================================================
-- STEP 3C: KIMBALL FACT TABLE (mart_gold.fct_orders)
-- Purpose: Order-level Unit Economics (Gross -> Discount -> Fee -> COGS -> Margin)
-- =============================================================================

CREATE OR REPLACE TABLE mart_gold.fct_orders AS
WITH item_totals AS (
    SELECT
        order_id,
        SUM(quantity) AS total_items_qty,
        SUM(line_cogs_idr) AS total_cogs_idr
    FROM stg_silver.stg_order_items
    GROUP BY order_id
),
order_sequencing AS (
    SELECT
        o.*,
        ROW_NUMBER() OVER (
            PARTITION BY o.customer_id
            ORDER BY o.ordered_at ASC
        ) AS customer_order_seq
    FROM stg_silver.stg_orders o
)
SELECT
    os.order_id,
    os.customer_id,
    c.cohort_month AS customer_cohort_month,
    c.acquisition_channel,
    c.acquisition_campaign,
    os.channel AS sales_channel,
    os.order_status,
    os.ordered_at,
    os.order_date,
    os.order_month,
    os.payment_method,
    os.customer_order_seq,
    CASE WHEN os.customer_order_seq = 1 THEN 'New Customer Order' ELSE 'Repeat Order' END AS buyer_type,
    COALESCE(it.total_items_qty, 0) AS total_items_qty,

    -- Gross Revenue (Reported by Marketing / Dashboard GMV)
    os.gross_amount_idr AS gmv_gross_idr,

    -- Realized Revenue (Only Completed Orders count toward Net Sales)
    CASE WHEN os.order_status = 'completed' THEN os.gross_amount_idr ELSE 0 END AS realized_gross_idr,
    CASE WHEN os.order_status = 'completed' THEN os.discount_amount_idr ELSE 0 END AS discount_idr,
    CASE
        WHEN os.order_status = 'completed'
        THEN (os.gross_amount_idr - os.discount_amount_idr)
        ELSE 0
    END AS net_sales_idr,

    -- Variable Costs (COGS, Platform Commission Fee, Return Shipping Penalty)
    CASE WHEN os.order_status = 'completed' THEN os.channel_fee_idr ELSE 0 END AS marketplace_fee_idr,
    CASE WHEN os.order_status = 'completed' THEN COALESCE(it.total_cogs_idr, 0) ELSE 0 END AS cogs_idr,
    os.return_shipping_loss_idr,

    -- Contribution Margin Before Marketing (CM1)
    CASE
        WHEN os.order_status = 'completed'
        THEN (os.gross_amount_idr - os.discount_amount_idr - os.channel_fee_idr - COALESCE(it.total_cogs_idr, 0))
        ELSE -os.return_shipping_loss_idr
    END AS contribution_margin_before_ads_idr
FROM order_sequencing os
LEFT JOIN item_totals it
    ON os.order_id = it.order_id
LEFT JOIN stg_silver.stg_customers c
    ON os.customer_id = c.customer_id;
