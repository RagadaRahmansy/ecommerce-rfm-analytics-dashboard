import pandas as pd
import os

def clean_ecommerce_data(input_path='../data/raw_data.csv', output_path='../data/cleaned_data.csv'):
    print(f"Reading raw data from {input_path}...")
    df = pd.read_csv(input_path)
    
    print(f"Initial shape: {df.shape}")
    
    # 1. Drop missing CustomerID (We can't do RFM without CustomerID)
    missing_cust = df['CustomerID'].isnull().sum()
    print(f"Dropping {missing_cust} rows with missing CustomerID.")
    df.dropna(subset=['CustomerID'], inplace=True)
    
    # 2. Fill missing Category with 'Unknown'
    missing_cat = df['Category'].isnull().sum()
    print(f"Filling {missing_cat} missing Categories with 'Unknown'.")
    df['Category'] = df['Category'].fillna('Unknown')
    
    # 3. Filter out Canceled transactions
    canceled_count = (df['Status'] == 'Canceled').sum()
    print(f"Removing {canceled_count} canceled transactions.")
    df = df[df['Status'] == 'Completed']
    
    # 4. Calculate Total Price
    df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
    
    # 5. Convert InvoiceDate to datetime
    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    
    print(f"Cleaned data shape: {df.shape}")
    
    # Save cleaned data
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Cleaned data saved to {output_path}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(current_dir, '..', 'data', 'raw_data.csv')
    output_file = os.path.join(current_dir, '..', 'data', 'cleaned_data.csv')
    
    if os.path.exists(input_file):
        clean_ecommerce_data(input_path=input_file, output_path=output_file)
    else:
        print(f"Error: Input file {input_file} not found. Please run generate_data.py first.")
