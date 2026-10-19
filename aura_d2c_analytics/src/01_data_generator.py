"""
================================================================================
STEP 1: B2B TRADING & DISTRIBUTION DATA DESIGN & REALISTIC SIMULATION
Project: Ekatunggal Group (PT Ekatunggal Tunas Mandiri) - Analytics Pipeline
Role: Senior Data Analyst (5 Years Experience)
================================================================================
Business Context & Embedded Anomalies:
1. B2B Channels & Distribution Centers:
   - Cabang Luar Pulau (Makassar & Samarinda): High wholesale volume driven by
     aggressive volume rebates (20-35%), high inter-island shipping/transit fee (10%),
     higher damage/transit return claim rate (~14%), and LOW repeat rate (~13%).
   - Cabang Jawa (Sidoarjo & Semarang): Moderate volume discounts (10-20%),
     regional distribution fee 8%, moderate customer retention (~28%).
   - Gudang Pusat Jabodetabek (Citeureup, Bogor - Direct Factory B2B): Lower volume
     discounts (0-10%), low logistics overhead (2.5%), low damage claim rate (~3%),
     and HIGH client loyalty/retention (~48%).
2. The "Volume Discount Illusion":
   - Sales management looks at Gross Invoiced Volume -> sees massive top-line figures.
   - Finance discovers inter-island transit damage, aggressive volume rebates, and
     regional distributor allowances cause Makassar & Samarinda shipments to bleed margin!
================================================================================
"""

import csv
import os
import random
from datetime import datetime, timedelta

random.seed(42)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
os.makedirs(RAW_DIR, exist_ok=True)

# 1. Genuine Ekatunggal Group B2B Product Catalog
PRODUCTS = [
    {
        "sku": "EKA-SPR-01",
        "name": "Bonnell Spring Wire Coil (Kawat Per Kasur Pegas)",
        "category": "Material Springbed",
        "price": 1850000,
        "cogs": 1320000
    },
    {
        "sku": "EKA-SPR-02",
        "name": "Knitting Mattress Fabric 300gsm (Kain Rajut Quilting Kasur)",
        "category": "Kain Kasur",
        "price": 1250000,
        "cogs": 860000
    },
    {
        "sku": "EKA-FOM-01",
        "name": "High-Density Polyurethane Foam D28 (Busa Kasur & Sofa)",
        "category": "Busa Industri",
        "price": 950000,
        "cogs": 680000
    },
    {
        "sku": "EKA-SOF-01",
        "name": "Karet Webbing Sofa Elastis Heavy-Duty (Roll 100m)",
        "category": "Material Sofa",
        "price": 420000,
        "cogs": 290000
    },
    {
        "sku": "EKA-SOF-02",
        "name": "Kulit Sintetis Oscar Premium (Upholstery Faux Leather 40m)",
        "category": "Pelapis Sofa",
        "price": 1650000,
        "cogs": 1180000
    },
    {
        "sku": "EKA-ACC-01",
        "name": "Hard Felt Pad / Matras Pad Peredam Suara Per (Pack 10 pcs)",
        "category": "Aksesori Matras",
        "price": 540000,
        "cogs": 380000
    },
]

CITIES = [
    ("Bogor (Citeureup)", "Jawa Barat"),
    ("Jakarta Timur", "DKI Jakarta"),
    ("Sidoarjo", "Jawa Timur"),
    ("Surabaya", "Jawa Timur"),
    ("Semarang", "Jawa Tengah"),
    ("Jepara", "Jawa Tengah"),
    ("Makassar", "Sulawesi Selatan"),
    ("Samarinda", "Kalimantan Timur"),
    ("Balikpapan", "Kalimantan Timur"),
    ("Manado", "Sulawesi Utara"),
]

B2B_COMPANY_PREFIXES = ["PT", "CV", "UD", "Mebel", "Pabrik Kasur"]
B2B_COMPANY_NAMES = [
    "Cipta Mebel Nusantara", "Surya Kasur Abadi", "Kencana Springbed",
    "Prima Busa Mandiri", "Sentosa Furniture", "Jaya Matras Utama",
    "Megah Sofa Perkasa", "Agung Mebel Sejahtera", "Indo Kasur Gemilang",
    "Makmur Sofa Nusantara", "Nusantara Foam Lestari", "Harmoni Mebelindo"
]


def generate_datasets():
    start_date = datetime(2026, 1, 1)
    end_date = datetime(2026, 6, 30)
    total_days = (end_date - start_date).days + 1

    customers = []
    orders = []
    order_items = []
    ad_spend_rows = []

    # -------------------------------------------------------------------------
    # STEP 1A: Generate B2B Clients across 6 monthly cohorts (1,820 accounts)
    # -------------------------------------------------------------------------
    customer_id_counter = 1001
    for month in range(1, 7):
        cohort_start = datetime(2026, month, 1)
        if month == 6:
            cohort_end = datetime(2026, 6, 30)
        else:
            cohort_end = datetime(2026, month + 1, 1) - timedelta(days=1)

        num_new_customers = random.randint(280, 330)
        for _ in range(num_new_customers):
            cid = f"CLIENT-{customer_id_counter}"
            customer_id_counter += 1

            acq_days_offset = random.randint(0, (cohort_end - cohort_start).days)
            reg_date = cohort_start + timedelta(
                days=acq_days_offset,
                hours=random.randint(7, 21),
                minutes=random.randint(0, 59)
            )

            # Channel Distribution: Cabang Luar Pulau (45%), Cabang Jawa (35%), Gudang Pusat (20%)
            r = random.random()
            if r < 0.45:
                acq_channel = "Cabang Luar Pulau"
                acq_campaign = random.choice(["B2B_Makassar_Wholesale", "B2B_Samarinda_Logistics", "B2B_Eastern_Trade"])
            elif r < 0.80:
                acq_channel = "Cabang Jawa"
                acq_campaign = random.choice(["B2B_Sidoarjo_Industrial", "B2B_Semarang_Distributor", "B2B_Jepara_Carpentry"])
            else:
                acq_channel = "Gudang Pusat"
                acq_campaign = random.choice(["B2B_Jabodetabek_Factory", "B2B_Direct_Citeureup", "B2B_KeyAccount_OEM"])

            city, province = random.choice(CITIES)
            prefix = random.choice(B2B_COMPANY_PREFIXES)
            cname = random.choice(B2B_COMPANY_NAMES)
            full_name = f"{prefix} {cname} {city.split()[0]}"
            email = f"purchasing@{cname.lower().replace(' ', '')}{cid[-3:]}.co.id"

            customers.append({
                "customer_id": cid,
                "full_name": full_name,
                "email": email,
                "city": city,
                "province": province,
                "acquisition_channel": acq_channel,
                "acquisition_campaign": acq_campaign,
                "created_at": reg_date.strftime("%Y-%m-%d %H:%M:%S"),
                "_reg_dt": reg_date
            })

    # -------------------------------------------------------------------------
    # STEP 1B: Generate Purchase Orders & Repeat Orders (Cohort Dynamics)
    # -------------------------------------------------------------------------
    order_id_counter = 50001
    item_id_counter = 90001

    for cust in customers:
        cid = cust["customer_id"]
        channel = cust["acquisition_channel"]
        reg_dt = cust["_reg_dt"]

        if channel == "Cabang Luar Pulau":
            repeat_prob = 0.13
            max_repeats = 2
            discount_rate_range = (0.20, 0.35)
            fee_rate = 0.10  # 10% Inter-island maritime shipping & distributor fee
            cancel_return_prob = 0.14
        elif channel == "Cabang Jawa":
            repeat_prob = 0.28
            max_repeats = 3
            discount_rate_range = (0.10, 0.22)
            fee_rate = 0.08  # 8% Regional hub handling fee
            cancel_return_prob = 0.08
        else:  # Gudang Pusat (Direct Citeureup)
            repeat_prob = 0.48
            max_repeats = 5
            discount_rate_range = (0.0, 0.10)
            fee_rate = 0.025  # 2.5% Direct logistics handling fee
            cancel_return_prob = 0.03

        order_dates = [reg_dt]
        curr_dt = reg_dt
        for _ in range(max_repeats):
            if random.random() < repeat_prob:
                curr_dt = curr_dt + timedelta(days=random.randint(18, 55), hours=random.randint(1, 12))
                if curr_dt <= end_date:
                    order_dates.append(curr_dt)
            else:
                break

        for odt in order_dates:
            oid = f"PO-{order_id_counter}"
            order_id_counter += 1

            sr = random.random()
            if sr < cancel_return_prob * 0.55:
                status = "returned"
            elif sr < cancel_return_prob:
                status = "cancelled"
            else:
                status = "completed"

            num_items = random.choices([1, 2, 3], weights=[0.55, 0.32, 0.13])[0]
            chosen_products = random.sample(PRODUCTS, num_items)

            gross_amount = 0
            for prod in chosen_products:
                iid = f"ITM-{item_id_counter}"
                item_id_counter += 1
                qty = random.choices([1, 2], weights=[0.82, 0.18])[0]
                line_gross = prod["price"] * qty
                gross_amount += line_gross

                order_items.append({
                    "item_id": iid,
                    "order_id": oid,
                    "product_sku": prod["sku"],
                    "product_name": prod["name"],
                    "category": prod["category"],
                    "quantity": qty,
                    "unit_price": prod["price"],
                    "unit_cogs": prod["cogs"],
                    "line_gross_amount": line_gross,
                    "line_cogs_amount": prod["cogs"] * qty
                })

            disc_pct = random.uniform(*discount_rate_range)
            discount_amount = round(gross_amount * disc_pct, -2)
            after_discount = gross_amount - discount_amount

            if status == "completed":
                channel_fee = round(after_discount * fee_rate, -1)
                shipping_loss = 0
            elif status == "returned":
                channel_fee = 0
                shipping_loss = 150000  # Return freight penalty per pallet/batch
            else:
                channel_fee = 0
                shipping_loss = 0

            orders.append({
                "order_id": oid,
                "customer_id": cid,
                "channel": channel,
                "order_status": status,
                "order_date": odt.strftime("%Y-%m-%d %H:%M:%S"),
                "gross_amount": int(gross_amount),
                "discount_amount": int(discount_amount),
                "channel_fee_amount": int(channel_fee),
                "return_shipping_loss": int(shipping_loss),
                "payment_method": random.choice(["TOP 30 Hari", "TOP 60 Hari", "Bilyet Giro (BG)", "Bank Transfer", "Cash Before Delivery"])
            })

    # Injected 15 duplicate ERP webhook/sync rows
    duplicate_samples = random.sample(orders, 15)
    orders_with_dups = orders + duplicate_samples

    # -------------------------------------------------------------------------
    # STEP 1C: Generate B2B Trade & Marketing Spend
    # -------------------------------------------------------------------------
    campaigns = [
        {"platform": "B2B Field Marketing", "target_channel": "Cabang Luar Pulau", "campaign_name": "B2B_Makassar_Wholesale", "daily_budget": (1600000, 2600000)},
        {"platform": "B2B Trade Exhibition", "target_channel": "Cabang Luar Pulau", "campaign_name": "B2B_Samarinda_Logistics", "daily_budget": (900000, 1500000)},
        {"platform": "Industry Catalog Ads", "target_channel": "Cabang Jawa", "campaign_name": "B2B_Sidoarjo_Industrial", "daily_budget": (850000, 1450000)},
        {"platform": "Key Account Sales", "target_channel": "Gudang Pusat", "campaign_name": "B2B_Jabodetabek_Factory", "daily_budget": (650000, 1150000)},
    ]

    for day_idx in range(total_days):
        curr_date = (start_date + timedelta(days=day_idx)).strftime("%Y-%m-%d")
        for camp in campaigns:
            spend = round(random.uniform(*camp["daily_budget"]), -3)
            impressions = int(spend / random.uniform(18, 32))
            clicks = int(impressions * random.uniform(0.014, 0.032))
            ad_spend_rows.append({
                "spend_date": curr_date,
                "platform": camp["platform"],
                "target_channel": camp["target_channel"],
                "campaign_name": camp["campaign_name"],
                "spend_idr": int(spend),
                "impressions": impressions,
                "clicks": clicks
            })

    for row in customers:
        row.pop("_reg_dt", None)

    def write_csv(filename, data):
        filepath = os.path.join(RAW_DIR, filename)
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        print(f"[GENERATED] {filename}: {len(data):,} rows -> {filepath}")

    write_csv("customers.csv", customers)
    write_csv("orders.csv", orders_with_dups)
    write_csv("order_items.csv", order_items)
    write_csv("ad_spend.csv", ad_spend_rows)


if __name__ == "__main__":
    generate_datasets()
