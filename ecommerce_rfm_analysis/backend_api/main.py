from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from statsmodels.tsa.holtwinters import ExponentialSmoothing

app = FastAPI(title="E-Commerce API")

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data at startup
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'cleaned_data.csv')
df = pd.DataFrame()

@app.on_event("startup")
def load_data():
    global df
    if os.path.exists(DATA_PATH):
        df = pd.read_csv(DATA_PATH)
        df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
        
def get_filtered_data(country_list=None):
    if country_list and len(country_list) > 0:
        return df[df['Country'].isin(country_list)]
    return df

@app.get("/api/overview")
def get_overview(countries: str = None):
    """Returns general KPIs and trend data"""
    country_list = countries.split(',') if countries else None
    data = get_filtered_data(country_list)
    
    total_sales = float(data['TotalPrice'].sum())
    total_tx = int(data['InvoiceNo'].nunique())
    total_cust = int(data['CustomerID'].nunique())
    aov = total_sales / total_tx if total_tx > 0 else 0
    
    monthly_sales = data.resample('M', on='InvoiceDate')['TotalPrice'].sum().reset_index()
    monthly_sales['Period'] = monthly_sales['InvoiceDate'].dt.strftime('%b %Y')
    trend_data = monthly_sales[['Period', 'TotalPrice']].to_dict(orient='records')
    
    cat_sales = data.groupby('Category')['TotalPrice'].sum().reset_index().to_dict(orient='records')
    
    return {
        "kpi": {
            "total_sales": total_sales,
            "total_transactions": total_tx,
            "total_customers": total_cust,
            "aov": aov
        },
        "trend": trend_data,
        "category_sales": cat_sales
    }

@app.get("/api/clustering")
def get_clustering(k: int = 4, countries: str = None):
    """Returns K-Means clustering results based on RFM"""
    country_list = countries.split(',') if countries else None
    data = get_filtered_data(country_list)
    
    snapshot_date = data['InvoiceDate'].max() + pd.Timedelta(days=1)
    rfm = data.groupby('CustomerID').agg({
        'InvoiceDate': lambda x: (snapshot_date - x.max()).days,
        'InvoiceNo': 'nunique',
        'TotalPrice': 'sum'
    }).rename(columns={'InvoiceDate': 'Recency', 'InvoiceNo': 'Frequency', 'TotalPrice': 'Monetary'})
    
    if len(rfm) < 10:
        return {"error": "Not enough data for clustering"}
        
    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(rfm)
    
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    rfm['Cluster'] = kmeans.fit_predict(rfm_scaled)
    
    profile = rfm.groupby('Cluster').agg({
        'Recency': 'mean',
        'Frequency': 'mean',
        'Monetary': 'mean'
    }).reset_index()
    profile['CustomerCount'] = rfm.groupby('Cluster').size().values
    
    return {
        "profile": profile.to_dict(orient='records')
    }

@app.get("/api/forecast")
def get_forecast(months: int = 3, countries: str = None):
    """Returns time series forecasting using Holt-Winters"""
    country_list = countries.split(',') if countries else None
    data = get_filtered_data(country_list)
    
    ts_data = data.resample('M', on='InvoiceDate')['TotalPrice'].sum()
    
    if len(ts_data) < 6:
        return {"error": "Not enough data for forecasting"}
        
    model = ExponentialSmoothing(ts_data, trend='add', seasonal=None, initialization_method="estimated")
    fit_model = model.fit()
    forecast = fit_model.forecast(months)
    
    historical = [{"period": k.strftime('%b %Y'), "revenue": v, "type": "Actual"} for k, v in ts_data.items()]
    projected = [{"period": k.strftime('%b %Y'), "revenue": v, "type": "Forecast"} for k, v in forecast.items()]
    
    return {
        "chart_data": historical + projected
    }

@app.get("/api/churn")
def get_churn_prediction():
    """Predicts churn probability using Random Forest based on RFM logic."""
    # This acts globally, no country filter to ensure enough training data
    snapshot_date = df['InvoiceDate'].max() + pd.Timedelta(days=1)
    
    # Feature extraction
    rfm = df.groupby('CustomerID').agg({
        'InvoiceDate': lambda x: (snapshot_date - x.max()).days, # Recency
        'InvoiceNo': 'nunique', # Frequency
        'TotalPrice': 'sum' # Monetary
    }).rename(columns={'InvoiceDate': 'Recency', 'InvoiceNo': 'Frequency', 'TotalPrice': 'Monetary'})
    
    # Define Churn: If a customer hasn't purchased in the last 60 days, they are considered churned (1) else (0)
    # This is a basic definition for the model to train on.
    rfm['IsChurned'] = (rfm['Recency'] > 60).astype(int)
    
    # To predict future churn, we shift the window or just build a quick classification model.
    # In a real scenario, we'd use features from (T-90 to T-30) to predict churn at T.
    # For this portfolio, we'll train on Recency, Frequency, Monetary to classify Churn, 
    # then fetch active customers (Recency <= 60) and see their probability of falling into churn class.
    
    features = ['Frequency', 'Monetary']
    X = rfm[features]
    y = rfm['IsChurned']
    
    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    # Now predict on ACTIVE customers to see who is at risk
    active_customers = rfm[rfm['IsChurned'] == 0].copy()
    
    if len(active_customers) == 0:
        return {"error": "No active customers found"}
        
    probs = model.predict_proba(active_customers[features])[:, 1]
    active_customers['ChurnRiskProbability'] = probs * 100
    
    # Sort by risk and return top 50
    risky = active_customers.sort_values('ChurnRiskProbability', ascending=False).head(50)
    risky.reset_index(inplace=True)
    
    result = []
    for _, row in risky.iterrows():
        result.append({
            "CustomerID": row['CustomerID'],
            "Frequency": float(row['Frequency']),
            "Monetary": float(row['Monetary']),
            "RiskPercent": float(row['ChurnRiskProbability'])
        })
        
    return {
        "summary": {
            "total_active": len(active_customers),
            "high_risk_count": int((active_customers['ChurnRiskProbability'] > 50).sum())
        },
        "top_at_risk": result
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
