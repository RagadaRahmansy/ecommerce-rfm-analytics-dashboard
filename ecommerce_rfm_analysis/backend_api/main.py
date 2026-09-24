from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import os
from sqlalchemy import create_engine, inspect, text
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from statsmodels.tsa.holtwinters import ExponentialSmoothing

app = FastAPI(title="E-Commerce API with PostgreSQL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"], 
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Database Setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/ecommerce_db")
engine = create_engine(DATABASE_URL)

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'cleaned_data.csv')

@app.on_event("startup")
def startup_db():
    inspector = inspect(engine)
    if not inspector.has_table("transactions"):
        print("Database is empty. Ingesting data from CSV...")
        if os.path.exists(DATA_PATH):
            df_init = pd.read_csv(DATA_PATH)
            df_init['InvoiceDate'] = pd.to_datetime(df_init['InvoiceDate'])
            df_init.to_sql('transactions', engine, if_exists='replace', index=False)
            print("Data successfully ingested into PostgreSQL.")
        else:
            print(f"Error: {DATA_PATH} not found.")
    else:
        print("Table 'transactions' already exists. Skipping ingestion.")

def get_where_clause_and_params(countries_str=None):
    if not countries_str:
        return "", {}
    countries = [c.strip() for c in countries_str.split(',')]
    placeholders = [f":c_{i}" for i in range(len(countries))]
    where_clause = f"WHERE \"Country\" IN ({', '.join(placeholders)})"
    params = {f"c_{i}": c for i, c in enumerate(countries)}
    return where_clause, params

@app.get("/api/overview")
def get_overview(countries: str = None):
    where_clause, params = get_where_clause_and_params(countries)
    
    with engine.connect() as conn:
        kpi_query = text(f"""
            SELECT 
                SUM("TotalPrice") as total_sales,
                COUNT(DISTINCT "InvoiceNo") as total_transactions,
                COUNT(DISTINCT "CustomerID") as total_customers
            FROM transactions
            {where_clause}
        """)
        kpi_result = pd.read_sql_query(kpi_query, conn, params=params).iloc[0]
        total_sales = float(kpi_result['total_sales'] or 0)
        total_tx = int(kpi_result['total_transactions'] or 0)
        total_cust = int(kpi_result['total_customers'] or 0)
        aov = total_sales / total_tx if total_tx > 0 else 0
        
        trend_query = text(f"""
            SELECT 
                DATE_TRUNC('month', CAST("InvoiceDate" AS timestamp)) as month_date,
                SUM("TotalPrice") as total
            FROM transactions
            {where_clause}
            GROUP BY DATE_TRUNC('month', CAST("InvoiceDate" AS timestamp))
            ORDER BY month_date
        """)
        trend_df = pd.read_sql_query(trend_query, conn, params=params)
        trend_df['Period'] = pd.to_datetime(trend_df['month_date']).dt.strftime('%b %Y')
        trend_data = [{"Period": row['Period'], "TotalPrice": float(row['total'])} for _, row in trend_df.iterrows()]
        
        cat_query = text(f"""
            SELECT "Category", SUM("TotalPrice") as total
            FROM transactions
            {where_clause}
            GROUP BY "Category"
        """)
        cat_df = pd.read_sql_query(cat_query, conn, params=params)
        cat_sales = [{"Category": row['Category'], "TotalPrice": float(row['total'])} for _, row in cat_df.iterrows()]
        
        country_query = text(f"""
            SELECT "Country", SUM("TotalPrice") as total
            FROM transactions
            {where_clause}
            GROUP BY "Country"
            ORDER BY total DESC
            LIMIT 5
        """)
        country_df = pd.read_sql_query(country_query, conn, params=params)
        top_countries = [{"Country": row['Country'], "TotalPrice": float(row['total'])} for _, row in country_df.iterrows()]
        
    return {
        "kpi": {
            "total_sales": total_sales,
            "total_transactions": total_tx,
            "total_customers": total_cust,
            "aov": aov
        },
        "trend": trend_data,
        "category_sales": cat_sales,
        "top_countries": top_countries
    }

def get_rfm_df(countries: str = None):
    where_clause, params = get_where_clause_and_params(countries)
    with engine.connect() as conn:
        snapshot_query = text("SELECT MAX(\"InvoiceDate\") as snapshot FROM transactions")
        snapshot_result = pd.read_sql_query(snapshot_query, conn)
        snapshot_date = pd.to_datetime(snapshot_result['snapshot'].iloc[0]) + pd.Timedelta(days=1)
        
        rfm_query = text(f"""
            SELECT 
                "CustomerID",
                MAX("InvoiceDate") as max_date,
                COUNT(DISTINCT "InvoiceNo") as "Frequency",
                SUM("TotalPrice") as "Monetary"
            FROM transactions
            {where_clause}
            GROUP BY "CustomerID"
        """)
        rfm = pd.read_sql_query(rfm_query, conn, params=params)
        rfm['max_date'] = pd.to_datetime(rfm['max_date'])
        rfm['Recency'] = (snapshot_date - rfm['max_date']).dt.days
        rfm = rfm.set_index('CustomerID')
        return rfm[['Recency', 'Frequency', 'Monetary']]

@app.get("/api/clustering")
def get_clustering(k: int = 4, countries: str = None):
    rfm = get_rfm_df(countries)
    
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
    where_clause, params = get_where_clause_and_params(countries)
    with engine.connect() as conn:
        trend_query = text(f"""
            SELECT 
                DATE_TRUNC('month', CAST("InvoiceDate" AS timestamp)) as month_date,
                SUM("TotalPrice") as total
            FROM transactions
            {where_clause}
            GROUP BY DATE_TRUNC('month', CAST("InvoiceDate" AS timestamp))
            ORDER BY month_date
        """)
        trend_df = pd.read_sql_query(trend_query, conn, params=params)
        
    if len(trend_df) < 6:
        return {"error": "Not enough data for forecasting"}
        
    ts_data = pd.Series(trend_df['total'].values, index=pd.to_datetime(trend_df['month_date']))
        
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
    rfm = get_rfm_df()
    rfm['IsChurned'] = (rfm['Recency'] > 60).astype(int)
    
    features = ['Frequency', 'Monetary']
    X = rfm[features]
    y = rfm['IsChurned']
    
    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    active_customers = rfm[rfm['IsChurned'] == 0].copy()
    
    if len(active_customers) == 0:
        return {"error": "No active customers found"}
        
    probs = model.predict_proba(active_customers[features])[:, 1]
    active_customers['ChurnRiskProbability'] = probs * 100
    
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

@app.get("/api/affinity")
def get_category_affinity(min_support: int = 10):
    with engine.connect() as conn:
        query = text('SELECT "CustomerID", "Category" FROM transactions')
        df = pd.read_sql_query(query, conn)
    
    user_category = df.groupby(['CustomerID', 'Category']).size().unstack(fill_value=0)
    user_category = (user_category > 0).astype(int)
    
    categories = user_category.columns.tolist()
    rules = []
    
    for i in categories:
        for j in categories:
            if i == j:
                continue
            bought_i = user_category[i] == 1
            num_bought_i = bought_i.sum()
            if num_bought_i < min_support:
                continue
                
            bought_both = (user_category[i] == 1) & (user_category[j] == 1)
            num_bought_both = bought_both.sum()
            confidence = (num_bought_both / num_bought_i) * 100
            rules.append({
                "source": i,
                "target": j,
                "support_both": int(num_bought_both),
                "confidence_percent": round(confidence, 1)
            })
            
    rules.sort(key=lambda x: x['confidence_percent'], reverse=True)
    return {"rules": rules[:10]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
