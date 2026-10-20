import os
import io
import csv
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2 import extras

load_dotenv()

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"
HOST = os.getenv("SUPABASE_HOST", "aws-0-ap-south-1.pooler.supabase.com")
PORT = int(os.getenv("SUPABASE_PORT", 6543))
DBNAME = os.getenv("SUPABASE_DB", "postgres")
USER = os.getenv("SUPABASE_USER", "postgres.ldxuhvcbprqtzonmejak")
PASSWORD = os.getenv("SUPABASE_PASSWORD")

def main():
    print("Connecting to Supabase Cloud...")
    conn = psycopg2.connect(
        host=HOST,
        port=PORT,
        dbname=DBNAME,
        user=USER,
        password=PASSWORD,
        sslmode="require"
    )
    conn.autocommit = True
    cur = conn.cursor()

    print("Creating raw_bronze schema and tables...")
    cur.execute("CREATE SCHEMA IF NOT EXISTS raw_bronze;")
    
    cur.execute("""
    DROP TABLE IF EXISTS raw_bronze.raw_customers CASCADE;
    CREATE TABLE raw_bronze.raw_customers (
        customer_id VARCHAR(64),
        full_name VARCHAR(255),
        email VARCHAR(255),
        city VARCHAR(100),
        province VARCHAR(100),
        acquisition_channel VARCHAR(100),
        acquisition_campaign VARCHAR(150),
        created_at TIMESTAMP
    );

    DROP TABLE IF EXISTS raw_bronze.raw_orders CASCADE;
    CREATE TABLE raw_bronze.raw_orders (
        order_id VARCHAR(64),
        customer_id VARCHAR(64),
        channel VARCHAR(100),
        order_status VARCHAR(50),
        order_date TIMESTAMP,
        gross_amount NUMERIC(18,2),
        discount_amount NUMERIC(18,2),
        channel_fee_amount NUMERIC(18,2),
        return_shipping_loss NUMERIC(18,2),
        payment_method VARCHAR(100)
    );

    DROP TABLE IF EXISTS raw_bronze.raw_order_items CASCADE;
    CREATE TABLE raw_bronze.raw_order_items (
        item_id VARCHAR(64),
        order_id VARCHAR(64),
        product_sku VARCHAR(64),
        product_name VARCHAR(255),
        category VARCHAR(100),
        quantity NUMERIC(18,2),
        unit_price NUMERIC(18,2),
        unit_cogs NUMERIC(18,2),
        line_gross_amount NUMERIC(18,2),
        line_cogs_amount NUMERIC(18,2)
    );

    DROP TABLE IF EXISTS raw_bronze.raw_ad_spend CASCADE;
    CREATE TABLE raw_bronze.raw_ad_spend (
        spend_date DATE,
        platform VARCHAR(100),
        target_channel VARCHAR(100),
        campaign_name VARCHAR(150),
        spend_idr NUMERIC(18,2),
        impressions BIGINT,
        clicks BIGINT
    );
    """)

    datasets = [
        ("raw_customers", "customers.csv", ["customer_id", "full_name", "email", "city", "province", "acquisition_channel", "acquisition_campaign", "created_at"]),
        ("raw_orders", "orders.csv", ["order_id", "customer_id", "channel", "order_status", "order_date", "gross_amount", "discount_amount", "channel_fee_amount", "return_shipping_loss", "payment_method"]),
        ("raw_order_items", "order_items.csv", ["item_id", "order_id", "product_sku", "product_name", "category", "quantity", "unit_price", "unit_cogs", "line_gross_amount", "line_cogs_amount"]),
        ("raw_ad_spend", "ad_spend.csv", ["spend_date", "platform", "target_channel", "campaign_name", "spend_idr", "impressions", "clicks"])
    ]

    for table_name, csv_file, cols in datasets:
        file_path = DATA_DIR / csv_file
        print(f"Reading {csv_file}...")
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.reader(f)
            header = next(reader)
            rows = [tuple(r) for r in reader]

        cols_str = ",".join(cols)
        query = f"INSERT INTO raw_bronze.{table_name} ({cols_str}) VALUES %s"
        print(f"Uploading {len(rows)} rows to raw_bronze.{table_name} via execute_values...")
        extras.execute_values(cur, query, rows, page_size=1000)
        print(f"-> raw_bronze.{table_name} upload done!")

    cur.close()
    conn.close()
    print("[SUCCESS] All 4 tables loaded to Supabase raw_bronze schema.")

if __name__ == "__main__":
    main()
