from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import os
import io
from sqlalchemy import create_engine, inspect
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from statsmodels.tsa.holtwinters import ExponentialSmoothing

app = FastAPI(title="SaaS Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/ecommerce_db")
engine = create_engine(DATABASE_URL)

def check_data_exists():
    inspector = inspect(engine)
    return inspector.has_table("transactions")

def get_filtered_data(country_list=None):
    if not check_data_exists():
        return None
        
    df = pd.read_sql_table('transactions', engine)
    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    
    if country_list and len(country_list) > 0:
        return df[df['Country'].isin(country_list)]
    return df

@app.get("/api/status")
def get_status():
    return {"has_data": check_data_exists()}

@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV file.")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        required_cols = ['InvoiceNo', 'InvoiceDate', 'CustomerID', 'Category']
        for col in required_cols:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Missing required column: {col}")
                
        if 'TotalPrice' not in df.columns:
            if 'Quantity' in df.columns and 'UnitPrice' in df.columns:
                df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
            else:
                raise HTTPException(status_code=400, detail="Missing pricing columns.")
                
        if 'InvoiceDate' in df.columns:
            df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
            
        df.to_sql('transactions', engine, if_exists='replace', index=False)
        return {"status": "success", "message": f"Successfully ingested {len(df)} rows."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/overview")
def get_overview(countries: str = None):
    country_list = countries.split(',') if countries else None
    data = get_filtered_data(country_list)
    if data is None:
        return {"status": "empty"}
        
    total_sales = float(data['TotalPrice'].sum())
    total_tx = int(data['InvoiceNo'].nunique())
    total_cust = int(data['CustomerID'].nunique())
    aov = total_sales / total_tx if total_tx > 0 else 0
    
    monthly_sales = data.resample('ME', on='InvoiceDate')['TotalPrice'].sum().reset_index()
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
    country_list = countries.split(',') if countries else None
    data = get_filtered_data(country_list)
    if data is None:
        return {"status": "empty"}
        
    snapshot_date = data['InvoiceDate'].max() + pd.Timedelta(days=1)
    rfm = data.groupby('CustomerID').agg({
        'InvoiceDate': lambda x: (snapshot_date - x.max()).days,
        'InvoiceNo': 'nunique',
        'TotalPrice': 'sum'
    }).rename(columns={'InvoiceDate': 'Recency', 'InvoiceNo': 'Frequency', 'TotalPrice': 'Monetary'})
    
    if len(rfm) < 10:
        return {"error": "Not enough data"}
        
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
    
    return {"profile": profile.to_dict(orient='records')}

@app.get("/api/forecast")
def get_forecast(months: int = 3, countries: str = None):
    country_list = countries.split(',') if countries else None
    data = get_filtered_data(country_list)
    if data is None:
        return {"status": "empty"}
        
    ts_data = data.resample('ME', on='InvoiceDate')['TotalPrice'].sum()
    if len(ts_data) < 6:
        return {"error": "Not enough data"}
        
    model = ExponentialSmoothing(ts_data, trend='add', seasonal=None, initialization_method="estimated")
    fit_model = model.fit()
    forecast = fit_model.forecast(months)
    
    historical = [{"period": k.strftime('%b %Y'), "revenue": v, "type": "Actual"} for k, v in ts_data.items()]
    projected = [{"period": k.strftime('%b %Y'), "revenue": v, "type": "Forecast"} for k, v in forecast.items()]
    return {"chart_data": historical + projected}

@app.get("/api/churn")
def get_churn_prediction():
    df = get_filtered_data()
    if df is None:
        return {"status": "empty"}
        
    snapshot_date = df['InvoiceDate'].max() + pd.Timedelta(days=1)
    rfm = df.groupby('CustomerID').agg({
        'InvoiceDate': lambda x: (snapshot_date - x.max()).days, 
        'InvoiceNo': 'nunique', 
        'TotalPrice': 'sum' 
    }).rename(columns={'InvoiceDate': 'Recency', 'InvoiceNo': 'Frequency', 'TotalPrice': 'Monetary'})
    
    rfm['IsChurned'] = (rfm['Recency'] > 60).astype(int)
    features = ['Frequency', 'Monetary']
    X = rfm[features]
    y = rfm['IsChurned']
    
    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    active_customers = rfm[rfm['IsChurned'] == 0].copy()
    if len(active_customers) == 0:
        return {"error": "No active"}
        
    probs = model.predict_proba(active_customers[features])[:, 1]
    active_customers['ChurnRiskProbability'] = probs * 100
    
    risky = active_customers.sort_values('ChurnRiskProbability', ascending=False).head(50).reset_index()
    result = [{"CustomerID": row['CustomerID'], "Frequency": float(row['Frequency']), "Monetary": float(row['Monetary']), "RiskPercent": float(row['ChurnRiskProbability'])} for _, row in risky.iterrows()]
        
    return {
        "summary": {"total_active": len(active_customers), "high_risk_count": int((active_customers['ChurnRiskProbability'] > 50).sum())},
        "top_at_risk": result
    }

@app.get("/api/affinity")
def get_category_affinity(min_support: int = 10):
    df = get_filtered_data()
    if df is None:
        return {"status": "empty"}
        
    user_category = df.groupby(['CustomerID', 'Category']).size().unstack(fill_value=0)
    user_category = (user_category > 0).astype(int)
    categories = user_category.columns.tolist()
    rules = []
    
    for i in categories:
        for j in categories:
            if i == j: continue
            bought_i = user_category[i] == 1
            num_bought_i = bought_i.sum()
            if num_bought_i < min_support: continue
            
            bought_both = (user_category[i] == 1) & (user_category[j] == 1)
            num_bought_both = bought_both.sum()
            confidence = (num_bought_both / num_bought_i) * 100
            
            rules.append({
                "source": i, "target": j,
                "support_both": int(num_bought_both),
                "confidence_percent": round(confidence, 1)
            })
            
    rules.sort(key=lambda x: x['confidence_percent'], reverse=True)
    return {"rules": rules[:10]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
