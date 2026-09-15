import pandas as pd
import numpy as np
from faker import Faker
import random
from datetime import datetime, timedelta
import os

def generate_ecommerce_data(num_customers=5000, num_transactions=20000, output_path='../data/raw_data.csv'):
    fake = Faker('id_ID')
    Faker.seed(42)
    np.random.seed(42)
    random.seed(42)

    print(f"Generating data for {num_customers} customers and {num_transactions} transactions...")

    # Generate Customers
    customer_ids = [f'CUST-{str(i).zfill(5)}' for i in range(1, num_customers + 1)]
    customer_countries = np.random.choice(['Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Vietnam'], num_customers, p=[0.7, 0.1, 0.1, 0.05, 0.05])
    
    # Generate Products
    product_categories = ['Electronics', 'Clothing', 'Home & Garden', 'Beauty', 'Sports']
    products = []
    for i in range(100):
        cat = random.choice(product_categories)
        if cat == 'Electronics':
            price = round(random.uniform(500000, 15000000), -4)
        elif cat == 'Clothing':
            price = round(random.uniform(50000, 500000), -3)
        elif cat == 'Home & Garden':
            price = round(random.uniform(100000, 2000000), -4)
        elif cat == 'Beauty':
            price = round(random.uniform(30000, 300000), -3)
        else:
            price = round(random.uniform(100000, 1000000), -4)
            
        products.append({
            'ProductID': f'PROD-{str(i+1).zfill(4)}',
            'Category': cat,
            'Price': price
        })

    # Generate Transactions
    start_date = datetime(2023, 1, 1)
    end_date = datetime(2023, 12, 31)
    
    transactions = []
    for i in range(num_transactions):
        cust_id = random.choice(customer_ids)
        prod = random.choice(products)
        
        # Random date within the year
        days_between = (end_date - start_date).days
        random_number_of_days = random.randrange(days_between)
        trans_date = start_date + timedelta(days=random_number_of_days)
        
        # Quantities (most buy 1, some buy more)
        qty = np.random.choice([1, 2, 3, 4, 5], p=[0.7, 0.15, 0.08, 0.04, 0.03])
        
        # Introduce some anomalies / missing values
        is_canceled = random.random() < 0.05
        status = 'Canceled' if is_canceled else 'Completed'
        
        # Canceled transactions often have negative quantities in real datasets, but let's just mark them canceled
        
        # Let's introduce some missing Customer IDs (simulate guests or tracking issues)
        if random.random() < 0.02:
            cust_id = np.nan
            
        transactions.append({
            'InvoiceNo': f'INV-{str(i+1).zfill(6)}',
            'InvoiceDate': trans_date.strftime('%Y-%m-%d %H:%M:%S'),
            'CustomerID': cust_id,
            'ProductID': prod['ProductID'],
            'Category': prod['Category'],
            'UnitPrice': prod['Price'],
            'Quantity': qty,
            'Status': status,
            'Country': random.choice(customer_countries) # slightly wrong logic: country should tie to customer, let's fix
        })

    # Fix Country mapping
    cust_country_map = dict(zip(customer_ids, customer_countries))
    for t in transactions:
        if pd.notna(t['CustomerID']):
            t['Country'] = cust_country_map[t['CustomerID']]
        else:
            t['Country'] = np.random.choice(['Indonesia', 'Malaysia'])

    df = pd.DataFrame(transactions)
    
    # Introduce random missing values in Category
    df.loc[df.sample(frac=0.01).index, 'Category'] = np.nan
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    df.to_csv(output_path, index=False)
    print(f"Data successfully generated and saved to {output_path}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(current_dir, '..', 'data', 'raw_data.csv')
    generate_ecommerce_data(output_path=output_file)
