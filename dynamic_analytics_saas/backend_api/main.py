import re
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import redis
import json
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import pandas as pd
import numpy as np
import os
import time
from fastapi.responses import JSONResponse, Response
import tempfile
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import create_engine, text, Column, Integer, String, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from passlib.context import CryptContext
from jose import JWTError, jwt

from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from statsmodels.tsa.holtwinters import ExponentialSmoothing

# --- SECURITY CONFIG ---
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

app = FastAPI(title="SaaS Analytics API - MultiTenant")

app.add_middleware(GZipMiddleware, minimum_size=10_000_000)  # Avoid compressing binary file downloads (e.g. PDF)
cors_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:80,http://127.0.0.1:5174")
allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# --- HIGH-PERFORMANCE REDIS CACHING LAYER ---
REDIS_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

def check_rate_limit(key: str, max_requests: int = 10, window_seconds: int = 60) -> bool:
    """Redis-backed distributed rate limiter (Sliding Window Counter)."""
    try:
        current = redis_client.incr(key)
        if current == 1:
            redis_client.expire(key, window_seconds)
        if current > max_requests:
            return False
    except Exception:
        pass
    return True

def get_cached(key: str):
    try:
        val = redis_client.get(key)
        if val:
            return json.loads(val)
    except Exception:
        pass
    return None

def set_cached(key: str, data: dict, ttl: int = 300):
    try:
        redis_client.setex(key, ttl, json.dumps(data))
    except Exception:
        pass

def invalidate_tenant_cache(tenant_id: int):
    try:
        prefix = f"tenant:{tenant_id}:*"
        keys = list(redis_client.scan_iter(prefix))
        if keys:
            redis_client.delete(*keys)
    except Exception:
        pass

# --- DATABASE SETUP ---
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/saas_db")
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=300
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))

@app.on_event("startup")
def startup_db():
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS transactions (
                "InvoiceNo" TEXT,
                "InvoiceDate" TIMESTAMP,
                "CustomerID" TEXT,
                "Category" TEXT,
                "Quantity" FLOAT,
                "UnitPrice" FLOAT,
                "TotalPrice" FLOAT,
                "Country" TEXT,
                tenant_id INTEGER
            );
            
            -- High-Performance Composite & Expression B-Tree Indexes
            CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON transactions (tenant_id, "InvoiceDate" DESC);
            CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date_cast ON transactions (tenant_id, (CAST("InvoiceDate" AS date)));
            CREATE INDEX IF NOT EXISTS idx_transactions_tenant_cust ON transactions (tenant_id, "CustomerID");
            CREATE INDEX IF NOT EXISTS idx_transactions_tenant_cat ON transactions (tenant_id, "Category");
            CREATE INDEX IF NOT EXISTS idx_transactions_tenant_inv ON transactions (tenant_id, "InvoiceNo");
            CREATE INDEX IF NOT EXISTS idx_transactions_rfm ON transactions (tenant_id, "CustomerID", "InvoiceDate", "InvoiceNo", "TotalPrice");
        """))

# --- AUTHENTICATION DEPENDENCIES ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# --- AUTH ENDPOINTS ---
class RegisterRequest(BaseModel):
    company_name: str
    email: str
    password: str

@app.post("/api/auth/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    tenant = Tenant(name=request.company_name)
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    
    hashed_password = pwd_context.hash(request.password)
    user = User(email=request.email, hashed_password=hashed_password, tenant_id=tenant.id)
    db.add(user)
    db.commit()
    
    return {"message": "User and Tenant created successfully."}

@app.post("/api/auth/login")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Rate Limiting Check: Max 10 attempts per IP per minute
    client_ip = request.client.host if request.client else "unknown"
    rate_key = f"rate:login:{client_ip}"
    if not check_rate_limit(rate_key, max_requests=10, window_seconds=60):
        raise HTTPException(
            status_code=429,
            detail="Too many authentication attempts. Please try again after 60 seconds."
        )

    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer", "tenant_id": user.tenant_id}

# --- DATA HELPERS ---
def check_data_exists(tenant_id: int):
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1 FROM transactions WHERE tenant_id = :t LIMIT 1"), {"t": tenant_id}).scalar()
        return result is not None

def get_where_clause_and_params(tenant_id: int, start_date=None, end_date=None, countries_str=None):
    params = {"tenant_id": tenant_id}
    where_clauses = ["tenant_id = :tenant_id"]
    if start_date:
        where_clauses.append("CAST(\"InvoiceDate\" AS date) >= :sd")
        params["sd"] = start_date
    if end_date:
        where_clauses.append("CAST(\"InvoiceDate\" AS date) <= :ed")
        params["ed"] = end_date
    if countries_str:
        countries = [c.strip() for c in countries_str.split(',')]
        placeholders = [f":c_{i}" for i in range(len(countries))]
        where_clauses.append(f"\"Country\" IN ({', '.join(placeholders)})")
        for i, c in enumerate(countries):
            params[f"c_{i}"] = c
    return "WHERE " + " AND ".join(where_clauses), params

# --- PROTECTED API ENDPOINTS ---
# --- DEVOPS OBSERVABILITY & HEALTH PROBES ---
@app.get("/api/health/live")
def health_live():
    """Liveness probe: verifies the backend application process is alive."""
    return {
        "status": "alive",
        "service": "Ragada Analytics Backend",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/health/ready")
def health_ready(db: Session = Depends(get_db)):
    """Readiness probe: verifies database and cache connectivity."""
    checks = {}
    is_ready = True

    # 1. PostgreSQL DB Connection Check
    try:
        t0 = time.time()
        db.execute(text("SELECT 1"))
        checks["database"] = {
            "status": "healthy",
            "latency_ms": round((time.time() - t0) * 1000, 2)
        }
    except Exception as e:
        checks["database"] = {"status": "unhealthy", "error": str(e)}
        is_ready = False

    # 2. Redis Cache Check
    try:
        t0 = time.time()
        redis_client.ping()
        checks["redis"] = {
            "status": "healthy",
            "latency_ms": round((time.time() - t0) * 1000, 2)
        }
    except Exception as e:
        checks["redis"] = {"status": "unhealthy", "error": str(e)}
        is_ready = False

    status_code = 200 if is_ready else 503
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if is_ready else "not_ready",
            "checks": checks,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.get("/api/status")
def get_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    return {
        "has_data": check_data_exists(current_user.tenant_id),
        "user": {
            "email": current_user.email,
            "tenant_id": current_user.tenant_id,
            "company_name": tenant.name if tenant else "Enterprise Analytics"
        }
    }

from worker import process_csv_upload
from celery.result import AsyncResult

from fastapi import Form
import json

@app.post("/api/upload")
async def upload_csv(
    file: UploadFile = File(...), 
    mapping: str = Form(None, description="JSON string mapping internal columns to CSV columns e.g. {'InvoiceNo': 'No_Transaksi'}"),
    mode: str = Form("append", description="Ingestion mode: 'append' (incremental) or 'replace' (full overwrite)"),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV file.")
    
    # Normalize mode
    mode = mode.lower().strip() if mode else "append"
    if mode not in ("append", "replace"):
        mode = "append"
    
    mapping_dict = None
    if mapping:
        try:
            mapping_dict = json.loads(mapping)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in mapping parameter.")
    
    try:
        temp_dir = '/shared_tmp'
        try:
            os.makedirs(temp_dir, exist_ok=True)
            test_file = os.path.join(temp_dir, '.write_test')
            with open(test_file, 'w') as f:
                f.write('ok')
            os.remove(test_file)
        except Exception:
            temp_dir = tempfile.gettempdir()
            
        fd, temp_path = tempfile.mkstemp(suffix=".csv", dir=temp_dir)
        with os.fdopen(fd, 'wb') as buffer:
            while chunk := await file.read(1024 * 1024):
                buffer.write(chunk)
                
        # Send task to Celery worker with mode parameter
        task = process_csv_upload.delay(temp_path, current_user.tenant_id, mapping_dict, mode)
        
        return {
            "status": "processing", 
            "task_id": task.id, 
            "mode": mode,
            "message": f"File is being processed in the background (Mode: {mode})."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/upload/status/{task_id}")
def get_upload_status(task_id: str, current_user: User = Depends(get_current_user)):
    task_result = AsyncResult(task_id)
    result = {
        "task_id": task_id,
        "task_status": task_result.status,
        "task_result": task_result.result
    }
    return result

@app.get("/api/overview")
def get_overview(start_date: str = None, end_date: str = None, countries: str = None, current_user: User = Depends(get_current_user)):
    tenant_id = current_user.tenant_id
    if not check_data_exists(tenant_id):
        return {"status": "empty"}
        
    cache_key = f"tenant:{tenant_id}:overview:{start_date}:{end_date}:{countries}"
    cached = get_cached(cache_key)
    if cached:
        return cached
        
    where_clause, params = get_where_clause_and_params(tenant_id, start_date, end_date, countries)
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
        
        # Smart date grouping: daily for <= 45d, weekly for <= 120d, monthly for full view
        interval = 'month'
        dt_format = '%b %Y'
        if start_date and end_date:
            try:
                sd_dt = datetime.strptime(start_date, '%Y-%m-%d')
                ed_dt = datetime.strptime(end_date, '%Y-%m-%d')
                diff_d = (ed_dt - sd_dt).days
                if diff_d <= 45:
                    interval = 'day'
                    dt_format = '%d %b'
                elif diff_d <= 120:
                    interval = 'week'
                    dt_format = 'Wk %W %b'
            except Exception:
                pass

        trend_query = text(f"""
            SELECT 
                DATE_TRUNC('{interval}', CAST("InvoiceDate" AS timestamp)) as month_date,
                SUM("TotalPrice") as total
            FROM transactions
            {where_clause}
            GROUP BY DATE_TRUNC('{interval}', CAST("InvoiceDate" AS timestamp))
            ORDER BY month_date
        """)
        trend_df = pd.read_sql_query(trend_query, conn, params=params)
        trend_df['Period'] = pd.to_datetime(trend_df['month_date']).dt.strftime(dt_format)
        trend_data = [{"Period": row['Period'], "TotalPrice": float(row['total'])} for _, row in trend_df.iterrows()]
        
        cat_query = text(f"""
            SELECT "Category", SUM("TotalPrice") as total
            FROM transactions
            {where_clause}
            GROUP BY "Category"
        """)
        cat_df = pd.read_sql_query(cat_query, conn, params=params)
        cat_sales = [{"Category": row['Category'], "TotalPrice": float(row['total'])} for _, row in cat_df.iterrows()]
        
    res_data = {
        "kpi": {
            "total_sales": total_sales,
            "total_transactions": total_tx,
            "total_customers": total_cust,
            "aov": aov
        },
        "trend": trend_data,
        "category_sales": cat_sales
    }
    set_cached(cache_key, res_data, ttl=300)
    return res_data

def get_rfm_df(tenant_id: int, start_date: str = None, end_date: str = None, countries: str = None):
    where_clause, params = get_where_clause_and_params(tenant_id, start_date, end_date, countries)
    with engine.connect() as conn:
        snapshot_query = text(f"SELECT MAX(\"InvoiceDate\") as snapshot FROM transactions WHERE tenant_id = :tenant_id")
        snapshot_result = pd.read_sql_query(snapshot_query, conn, params={"tenant_id": tenant_id})
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
def get_clustering(start_date: str = None, end_date: str = None, k: int = 4, countries: str = None, current_user: User = Depends(get_current_user)):
    tenant_id = current_user.tenant_id
    if not check_data_exists(tenant_id):
        return {"status": "empty"}
        
    cache_key = f"tenant:{tenant_id}:clustering:{start_date}:{end_date}:{k}:{countries}"
    cached = get_cached(cache_key)
    if cached:
        return cached
        
    rfm = get_rfm_df(tenant_id, start_date, end_date, countries)
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
    
    res_data = {"profile": profile.to_dict(orient='records')}
    set_cached(cache_key, res_data, ttl=300)
    return res_data

@app.get("/api/forecast")
def get_forecast(start_date: str = None, end_date: str = None, months: int = 3, countries: str = None, current_user: User = Depends(get_current_user)):
    tenant_id = current_user.tenant_id
    if not check_data_exists(tenant_id):
        return {"status": "empty"}
        
    cache_key = f"tenant:{tenant_id}:forecast:{start_date}:{end_date}:{months}:{countries}"
    cached = get_cached(cache_key)
    if cached:
        return cached
        
    where_clause, params = get_where_clause_and_params(tenant_id, start_date, end_date, countries)
    interval = 'month'
    dt_fmt = '%b %Y'
    if start_date and end_date:
        try:
            sd_dt = datetime.strptime(start_date, '%Y-%m-%d')
            ed_dt = datetime.strptime(end_date, '%Y-%m-%d')
            diff_d = (ed_dt - sd_dt).days
            if diff_d <= 45:
                interval = 'day'
                dt_fmt = '%d %b'
            elif diff_d <= 120:
                interval = 'week'
                dt_fmt = 'Wk %W'
        except Exception:
            pass

    with engine.connect() as conn:
        trend_query = text(f"""
            SELECT 
                DATE_TRUNC('{interval}', CAST("InvoiceDate" AS timestamp)) as month_date,
                SUM("TotalPrice") as total
            FROM transactions
            {where_clause}
            GROUP BY DATE_TRUNC('{interval}', CAST("InvoiceDate" AS timestamp))
            ORDER BY month_date
        """)
        trend_df = pd.read_sql_query(trend_query, conn, params=params)
        
    if len(trend_df) < 6:
        historical = [{"period": k.strftime('%b %Y'), "revenue": float(v), "type": "Actual"} for k, v in zip(pd.to_datetime(trend_df['month_date']), trend_df['total'])]
        return {"chart_data": historical}
        
    ts_data = pd.Series(trend_df['total'].values, index=pd.to_datetime(trend_df['month_date']))
    model = ExponentialSmoothing(ts_data, trend='add', seasonal=None, initialization_method="estimated")
    fit_model = model.fit()
    forecast = fit_model.forecast(months)
    
    historical = [{"period": k.strftime('%b %Y'), "revenue": v, "type": "Actual"} for k, v in ts_data.items()]
    projected = [{"period": k.strftime('%b %Y'), "revenue": v, "type": "Forecast"} for k, v in forecast.items()]
    res_data = {"chart_data": historical + projected}
    set_cached(cache_key, res_data, ttl=300)
    return res_data

@app.get("/api/churn")
def get_churn_prediction(start_date: str = None, end_date: str = None, current_user: User = Depends(get_current_user)):
    tenant_id = current_user.tenant_id
    if not check_data_exists(tenant_id):
        return {"status": "empty"}
        
    cache_key = f"tenant:{tenant_id}:churn:{start_date}:{end_date}"
    cached = get_cached(cache_key)
    if cached:
        return cached
        
    rfm = get_rfm_df(tenant_id, start_date, end_date, countries=None)
    if len(rfm) < 10:
        return {"error": "Not enough data"}
    rfm['IsChurned'] = (rfm['Recency'] > 60).astype(int)
    
    features = ['Frequency', 'Monetary']
    X = rfm[features]
    y = rfm['IsChurned']
    
    active_customers = rfm[rfm['IsChurned'] == 0].copy()
    if len(active_customers) == 0:
        active_customers = rfm.copy()

    # Bulletproof check: only call predict_proba[:, 1] if at least 2 classes exist!
    unique_classes = np.unique(y)
    if len(unique_classes) >= 2:
        model = RandomForestClassifier(n_estimators=50, random_state=42)
        model.fit(X, y)
        probs = model.predict_proba(active_customers[features])[:, 1]
    else:
        # Single class (e.g. 30d window where no users are yet churned > 60 days)
        # Assign risk proportionally based on relative recency within the window (0-35% risk)
        max_r = max(1.0, float(active_customers['Recency'].max()))
        probs = (active_customers['Recency'] / max_r).values * 0.35

    active_customers['ChurnRiskProbability'] = np.clip(probs * 100, 0, 100)
    
    risky = active_customers.sort_values('ChurnRiskProbability', ascending=False).head(50).reset_index()
    result = [{"CustomerID": row['CustomerID'], "Frequency": float(row['Frequency']), "Monetary": float(row['Monetary']), "RiskPercent": float(row['ChurnRiskProbability'])} for _, row in risky.iterrows()]
        
    res_data = {
        "summary": {"total_active": len(active_customers), "high_risk_count": int((active_customers['ChurnRiskProbability'] > 50).sum())},
        "top_at_risk": result
    }
    set_cached(cache_key, res_data, ttl=300)
    return res_data

@app.get("/api/affinity")
def get_category_affinity(start_date: str = None, end_date: str = None, min_support: int = 5, current_user: User = Depends(get_current_user)):
    tenant_id = current_user.tenant_id
    if not check_data_exists(tenant_id):
        return {"status": "empty"}
        
    cache_key = f"tenant:{tenant_id}:affinity:{start_date}:{end_date}:{min_support}"
    cached = get_cached(cache_key)
    if cached:
        return cached
        
    with engine.connect() as conn:
        q_cond = 'WHERE tenant_id = :t'
        p = {"t": tenant_id}
        if start_date:
            q_cond += ' AND CAST("InvoiceDate" AS date) >= :sd'
            p['sd'] = start_date
        if end_date:
            q_cond += ' AND CAST("InvoiceDate" AS date) <= :ed'
            p['ed'] = end_date
        query = text(f'SELECT "CustomerID", "Category" FROM transactions {q_cond}')
        df = pd.read_sql_query(query, conn, params=p)
    
    if df.empty:
        return {"rules": []}

    user_category = df.groupby(['CustomerID', 'Category']).size().unstack(fill_value=0)
    user_category = (user_category > 0).astype(int)
    categories = user_category.columns.tolist()
    
    if len(categories) < 2:
        return {"rules": []}

    # Vectorized Matrix Multiplication (C-speed Co-occurrence)
    M = user_category.values
    C_co = M.T @ M
    support_single = np.diag(C_co)
    
    rules = []
    for i, cat_i in enumerate(categories):
        num_bought_i = support_single[i]
        if num_bought_i < min_support:
            continue
        for j, cat_j in enumerate(categories):
            if i == j:
                continue
            num_both = C_co[i, j]
            if num_both == 0:
                continue
            confidence = (num_both / num_bought_i) * 100
            rules.append({
                "source": cat_i,
                "target": cat_j,
                "support_both": int(num_both),
                "confidence_percent": round(float(confidence), 1)
            })
            
    rules.sort(key=lambda x: x['confidence_percent'], reverse=True)
    res_data = {"rules": rules[:10]}
    set_cached(cache_key, res_data, ttl=300)
    return res_data

@app.get("/api/insights")
def get_insights(start_date: str = None, end_date: str = None, current_user: User = Depends(get_current_user)):
    tenant_id = current_user.tenant_id
    if not check_data_exists(tenant_id):
        return {"status": "empty"}
        
    cache_key = f"tenant:{tenant_id}:insights:{start_date}:{end_date}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    insights = []
    
    with engine.connect() as conn:
        # Trend / Sales Movement Analysis
        q_cond = 'WHERE tenant_id = :t'
        p = {"t": tenant_id}
        if start_date:
            q_cond += ' AND CAST("InvoiceDate" AS date) >= :sd'
            p['sd'] = start_date
        if end_date:
            q_cond += ' AND CAST("InvoiceDate" AS date) <= :ed'
            p['ed'] = end_date
            
        trend_query = text(f"""
            SELECT 
                DATE_TRUNC('month', CAST("InvoiceDate" AS timestamp)) as month_date,
                SUM("TotalPrice") as total
            FROM transactions
            {q_cond}
            GROUP BY DATE_TRUNC('month', CAST("InvoiceDate" AS timestamp))
            ORDER BY month_date
        """)
        trend_df = pd.read_sql_query(trend_query, conn, params=p)
        
        if len(trend_df) >= 2:
            last_month = trend_df.iloc[-1]['total']
            prev_month = trend_df.iloc[-2]['total']
            pct_change = ((last_month - prev_month) / prev_month) * 100 if prev_month > 0 else 0
            
            if pct_change < -5:
                insights.append({
                    "type": "warning",
                    "title": "Penurunan Momentum Penjualan",
                    "description": f"Penjualan turun {abs(pct_change):.1f}% di bulan terakhir. Saran: Segera luncurkan promo kilat (Flash Sale) atau evaluasi efektivitas kampanye pemasaran Anda untuk mengembalikan momentum."
                })
            elif pct_change > 5:
                insights.append({
                    "type": "success",
                    "title": "Momentum Penjualan Positif",
                    "description": f"Pertumbuhan luar biasa! Penjualan naik {pct_change:.1f}%. Saran: Tingkatkan budget pemasaran (Ads) pada produk terlaris selagi momentum audiens sedang tinggi."
                })
            else:
                insights.append({
                    "type": "info",
                    "title": "Pertumbuhan Stagnan",
                    "description": "Pendapatan cenderung datar bulan ini. Saran: Lakukan A/B testing harga atau perkenalkan paket bundling (Cross-sell) untuk menaikkan Average Order Value."
                })

        # Forecasting Inventory
        if len(trend_df) >= 6:
            ts_data = pd.Series(trend_df['total'].values, index=pd.to_datetime(trend_df['month_date']))
            model = ExponentialSmoothing(ts_data, trend='add', seasonal=None, initialization_method="estimated")
            fit_model = model.fit()
            forecast = fit_model.forecast(1)
            next_month_proj = forecast.values[0]
            avg_past = ts_data.mean()
            
            if next_month_proj > avg_past * 1.1:
                insights.append({
                    "type": "logistics",
                    "title": "Persiapan Stok (Forecast AI)",
                    "description": "AI memproyeksikan lonjakan permintaan bulan depan di atas rata-rata. Saran: Pastikan rantai pasok (supply chain) aman dan tingkatkan stok inventaris kategori utama untuk mencegah kehabisan barang (Out-of-Stock)."
                })
                
        # Basket Analysis (Cross-Selling)
        rules_res = get_category_affinity(start_date, end_date, 10, current_user)
        if isinstance(rules_res, dict) and "rules" in rules_res:
            rules = rules_res["rules"]
            if len(rules) > 0:
                top_rule = rules[0]
                insights.append({
                    "type": "opportunity",
                    "title": "Peluang Cross-Selling Emas",
                    "description": f"Pembeli {top_rule['source']} sangat sering membeli {top_rule['target']} bersamaan (Confidence {top_rule['confidence_percent']}%). Saran: Buat diskon bundling otomatis untuk kombinasi ini di halaman *checkout*."
                })
            
        # Churn Risk
        rfm = get_rfm_df(tenant_id, start_date, end_date, countries=None)
        if not rfm.empty:
            rfm['IsChurned'] = (rfm['Recency'] > 60).astype(int)
            active_customers = rfm[rfm['IsChurned'] == 0]
            if not active_customers.empty and len(rfm) > 10:
                features = ['Frequency', 'Monetary']
                X = rfm[features]
                y = rfm['IsChurned']
                if y.sum() > 0: # Ensure at least one churned and one active
                    from sklearn.ensemble import RandomForestClassifier
                    model = RandomForestClassifier(n_estimators=50, random_state=42)
                    model.fit(X, y)
                    probs = model.predict_proba(active_customers[features])[:, 1]
                    high_risk = (probs > 0.5).sum()
                    
                    if high_risk > 0:
                        insights.append({
                            "type": "danger",
                            "title": "Risiko Kehilangan Pelanggan (Churn)",
                            "description": f"Terdapat {high_risk} pelanggan aktif dengan risiko *churn* tinggi (>50%). Saran: Eksekusi *email blast* berisi kupon diskon re-aktivasi khusus untuk kelompok ini maksimal minggu ini."
                        })
                    
    res_data = {"insights": insights}
    set_cached(cache_key, res_data, ttl=300)
    return res_data


@app.get("/api/category_drilldown")
def get_category_drilldown(category: str, start_date: str = None, end_date: str = None, current_user: User = Depends(get_current_user)):
    tenant_id = current_user.tenant_id
    with engine.connect() as conn:
        q_cond = 'WHERE tenant_id = :t AND "Category" = :c'
        p = {"t": tenant_id, "c": category}
        if start_date:
            q_cond += ' AND CAST("InvoiceDate" AS date) >= :sd'
            p['sd'] = start_date
        if end_date:
            q_cond += ' AND CAST("InvoiceDate" AS date) <= :ed'
            p['ed'] = end_date
            
        query = text(f"""
            SELECT "CustomerID", COUNT(DISTINCT "InvoiceNo") as total_orders, SUM("TotalPrice") as total_spent, SUM("Quantity") as total_quantity
            FROM transactions
            {q_cond}
            GROUP BY "CustomerID"
            ORDER BY total_spent DESC
            LIMIT 5
        """)
        df = pd.read_sql_query(query, conn, params=p)
        return {"top_customers": df.to_dict(orient="records")}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

# ==============================================================================
# AI DATA COPILOT & NATURAL LANGUAGE QUERY ENGINE
# ==============================================================================
class CopilotQueryRequest(BaseModel):
    query: str

def sanitize_and_validate_sql(sql: str, tenant_id: int) -> str:
    """Enforces strict read-only execution, tenant isolation, and row limits."""
    cleaned = sql.strip().strip(';')
    normalized = cleaned.upper()
    
    # 1. Strictly Read-Only Guardrails
    forbidden = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE", "GRANT", "REVOKE", "EXEC", "CREATE"]
    for word in forbidden:
        # Check whole word tokens
        if f" {word} " in f" {normalized} ":
            raise HTTPException(status_code=400, detail=f"Operation '{word}' is strictly forbidden by Security Guardrails.")
            
    if not (normalized.startswith("SELECT") or normalized.startswith("WITH")):
        raise HTTPException(status_code=400, detail="Only SELECT analytical queries are permitted.")
        
    # 2. Enforce Tenant Isolation
    if "tenant_id" not in cleaned:
        if "WHERE" in normalized:
            cleaned = cleaned.replace("WHERE", f"WHERE tenant_id = {tenant_id} AND ", 1)
        else:
            # Inject before GROUP BY, ORDER BY, or LIMIT
            injected = False
            for clause in ["GROUP BY", "ORDER BY", "LIMIT"]:
                if clause in normalized:
                    idx = normalized.find(clause)
                    cleaned = cleaned[:idx] + f" WHERE tenant_id = {tenant_id} " + cleaned[idx:]
                    injected = True
                    break
            if not injected:
                cleaned += f" WHERE tenant_id = {tenant_id}"
                
    # 3. Enforce Max Row Limit (Anti-DoS)
    if "LIMIT" not in normalized:
        cleaned += " LIMIT 50"
        
    return cleaned

def parse_nlp_query(raw_query: str, tenant_id: int):
    q = raw_query.strip().lower()
    is_sqlite = engine.dialect.name == "sqlite"
    date_ym = "strftime('%Y-%m', \"InvoiceDate\")" if is_sqlite else "TO_CHAR(\"InvoiceDate\", 'YYYY-MM')"
    date_ymd = "strftime('%Y-%m-%d', \"InvoiceDate\")" if is_sqlite else "TO_CHAR(\"InvoiceDate\", 'YYYY-MM-DD')"
    date_last_order = "strftime('%Y-%m-%d', last_order_date)" if is_sqlite else "TO_CHAR(last_order_date, 'YYYY-MM-DD')"
    
    if is_sqlite:
        days_inactive_calc = "ROUND(julianday((SELECT MAX(\"InvoiceDate\") FROM transactions WHERE tenant_id = :tenant_id)) - julianday(last_order_date))"
        churn_filter = "ROUND(julianday((SELECT MAX(\"InvoiceDate\") FROM transactions WHERE tenant_id = :tenant_id)) - julianday(last_order_date)) > 60"
    else:
        days_inactive_calc = "ROUND(EXTRACT(epoch FROM ((SELECT MAX(\"InvoiceDate\") FROM transactions WHERE tenant_id = :tenant_id) - last_order_date)) / 86400)"
        churn_filter = "EXTRACT(epoch FROM ((SELECT MAX(\"InvoiceDate\") FROM transactions WHERE tenant_id = :tenant_id) - last_order_date)) / 86400 > 60"
    
    # 1. Dynamic Limit Extraction (e.g. "3 pelanggan", "10 kategori")
    match_num = re.search(r'\b(\d+)\b', q)
    limit = int(match_num.group(1)) if match_num else 5
    if limit > 50:
        limit = 50
    if limit < 1:
        limit = 5
        
    # 2. Ordering Direction Detection (ASC vs DESC)
    is_ascending = any(k in q for k in [
        "terendah", "terkecil", "paling sedikit", "terbawah", "paling rendah", 
        "paling kecil", "bottom", "least", "lowest", "min", "sedikit"
    ])
    direction = "ASC" if is_ascending else "DESC"
    dir_label = "terendah / paling kecil" if is_ascending else "tertinggi / paling besar"
    
    # 3. Intent & Subject Classification
    # A. Customers / Pelanggan
    if any(k in q for k in ["pelanggan", "customer", "klien", "pembeli", "buyer", "user", "vip"]):
        sql = f"""
            SELECT 
                "CustomerID", 
                COUNT(DISTINCT "InvoiceNo") as total_orders, 
                ROUND(CAST(SUM("TotalPrice") AS NUMERIC), 2) as total_spent, 
                ROUND(CAST(AVG("TotalPrice") AS NUMERIC), 2) as avg_order_value
            FROM transactions
            WHERE tenant_id = :tenant_id AND "CustomerID" IS NOT NULL
            GROUP BY "CustomerID"
            ORDER BY total_spent {direction}
            LIMIT {limit}
        """
        viz = "table"
        if is_ascending:
            answer = f"Berikut adalah {limit} pelanggan dengan akumulasi nilai belanja terendah (kontribusi belanja paling kecil)."
        else:
            answer = f"Berikut adalah {limit} pelanggan dengan akumulasi nilai belanja tertinggi (VIP / Top Spenders)."
            
    # B. Categories / Kategori Produk
    elif any(k in q for k in ["kategori", "category", "produk", "product", "item", "barang", "laris"]):
        sql = f"""
            SELECT 
                "Category", 
                ROUND(CAST(SUM("TotalPrice") AS NUMERIC), 2) as total_revenue, 
                ROUND(CAST(SUM("Quantity") AS NUMERIC), 0) as total_quantity, 
                COUNT(DISTINCT "InvoiceNo") as orders_count
            FROM transactions
            WHERE tenant_id = :tenant_id
            GROUP BY "Category"
            ORDER BY total_revenue {direction}
            LIMIT {limit}
        """
        viz = "bar"
        if is_ascending:
            answer = f"Berikut adalah {limit} kategori produk dengan performa pendapatan terendah."
        else:
            answer = f"Berikut adalah {limit} kategori produk paling laris dengan total pendapatan tertinggi."

    # C. Transactions / Orders
    elif any(k in q for k in ["transaksi", "order", "pesanan", "invoice", "pembelian"]):
        sql = f"""
            SELECT 
                "InvoiceNo", 
                {date_ymd} as date, 
                "CustomerID", 
                "Category", 
                "Quantity", 
                ROUND(CAST("TotalPrice" AS NUMERIC), 2) as total_price, 
                "Country"
            FROM transactions
            WHERE tenant_id = :tenant_id
            ORDER BY "TotalPrice" {direction}
            LIMIT {limit}
        """
        viz = "table"
        answer = f"Berikut adalah {limit} transaksi dengan nilai pesanan {dir_label}."

    # D. Monthly Time-Series Trend
    elif any(k in q for k in ["tren", "bulan", "monthly", "waktu", "perkembangan", "pertumbuhan"]):
        sql = f"""
            SELECT 
                {date_ym} as period, 
                ROUND(CAST(SUM("TotalPrice") AS NUMERIC), 2) as revenue, 
                COUNT(DISTINCT "InvoiceNo") as total_orders
            FROM transactions
            WHERE tenant_id = :tenant_id
            GROUP BY {date_ym}
            ORDER BY period ASC
            LIMIT 36
        """
        viz = "line"
        answer = "Berikut adalah grafik perkembangan tren pendapatan dan volume pesanan bulanan selama periode transaksi aktif."

    # E. Churn Risk / Inactive Customers (>60 days)
    elif any(k in q for k in ["churn", "tidak aktif", "risiko", "hilang", "pasif", "dorman"]):
        sql = f"""
            WITH last_tx AS (
                SELECT 
                    "CustomerID", 
                    MAX("InvoiceDate") as last_order_date, 
                    COUNT(DISTINCT "InvoiceNo") as total_orders, 
                    ROUND(CAST(SUM("TotalPrice") AS NUMERIC), 2) as total_spent
                FROM transactions
                WHERE tenant_id = :tenant_id
                GROUP BY "CustomerID"
            )
            SELECT 
                "CustomerID", 
                {date_last_order} as last_order, 
                {days_inactive_calc} as days_inactive, 
                total_orders, 
                total_spent
            FROM last_tx
            WHERE {churn_filter}
            ORDER BY total_spent DESC
            LIMIT {limit}
        """
        viz = "table"
        answer = f"Ditemukan {limit} pelanggan bernilai tinggi yang telah tidak aktif melakukan transaksi selama lebih dari 60 hari (risiko churn tinggi)."

    # F. Geographic / Country Distribution
    elif any(k in q for k in ["negara", "country", "wilayah", "daerah", "geografis"]):
        sql = f"""
            SELECT 
                "Country", 
                ROUND(CAST(SUM("TotalPrice") AS NUMERIC), 2) as total_sales, 
                COUNT(DISTINCT "CustomerID") as unique_customers, 
                COUNT(DISTINCT "InvoiceNo") as total_orders
            FROM transactions
            WHERE tenant_id = :tenant_id AND "Country" IS NOT NULL
            GROUP BY "Country"
            ORDER BY total_sales {direction}
            LIMIT {limit}
        """
        viz = "pie"
        answer = f"Berikut adalah sebaran pendapatan dan transaksi per negara diurutkan berdasarkan {dir_label}."

    # G. Global KPI & AOV Summary (Default)
    else:
        sql = """
            SELECT 
                ROUND(CAST(SUM("TotalPrice") AS NUMERIC), 2) as total_revenue, 
                COUNT(DISTINCT "InvoiceNo") as total_transactions, 
                COUNT(DISTINCT "CustomerID") as total_customers, 
                ROUND(CAST((SUM("TotalPrice") / NULLIF(COUNT(DISTINCT "InvoiceNo"), 0)) AS NUMERIC), 2) as aov,
                ROUND(CAST(SUM("Quantity") AS NUMERIC), 0) as total_items_sold
            FROM transactions
            WHERE tenant_id = :tenant_id
        """
        viz = "metric"
        answer = "Berikut adalah ringkasan indikator performa utama (KPI) bisnis, termasuk Total Pendapatan, Transaksi, dan Rata-rata Nilai Pesanan (AOV)."

    return sql.strip(), viz, answer

@app.post("/api/copilot/query")
def copilot_query(
    request: CopilotQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI Data Copilot: Translates natural language questions into safe, instant SQL analytics."""
    tenant_id = current_user.tenant_id
    raw_query = request.query.strip()
    t0 = time.time()
    
    sql, viz, answer = parse_nlp_query(raw_query, tenant_id)
    
    # Execute query securely
    try:
        with engine.connect() as conn:
            result = conn.execute(text(sql), {"tenant_id": tenant_id})
            cols = list(result.keys())
            rows = [dict(zip(cols, row)) for row in result.fetchall()]
            
            # Format numbers for clean JSON serialization
            formatted_rows = []
            for r in rows:
                new_r = {}
                for k, v in r.items():
                    if hasattr(v, 'isoformat'):
                        new_r[k] = v.isoformat()
                    elif isinstance(v, (int, float)):
                        new_r[k] = v
                    else:
                        new_r[k] = str(v) if v is not None else ""
                formatted_rows.append(new_r)
                
            latency_ms = round((time.time() - t0) * 1000, 2)
            
            return {
                "answer": answer,
                "sql": sql.strip(),
                "visualization": viz,
                "columns": cols,
                "data": formatted_rows,
                "summary": {
                    "rows_count": len(formatted_rows),
                    "latency_ms": latency_ms,
                    "model": "Ragada Semantic Engine v2.5 (Smart NLP)"
                }
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query execution error: {str(e)}")

# ==============================================================================
# EXECUTIVE SUMMARY PDF REPORT GENERATION ENDPOINT
# ==============================================================================
from pdf_generator import build_executive_pdf

@app.get("/api/reports/executive_pdf")
def export_executive_pdf(
    start_date: str = None,
    end_date: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates an executive PDF report with styled tables, KPIs, monthly velocity, RFM segments, and churn risks."""
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    company_name = tenant.name if tenant else "Enterprise Analytics"
    
    # 1. Fetch Overview (KPI + Trend)
    overview_res = get_overview(start_date=start_date, end_date=end_date, countries=None, current_user=current_user)
    kpi = overview_res.get("kpi", {}) if isinstance(overview_res, dict) else {}
    trend_data = overview_res.get("trend", []) if isinstance(overview_res, dict) else []
    
    # 2. Fetch Clustering RFM Profile
    clustering_res = get_clustering(start_date=start_date, end_date=end_date, k=4, countries=None, current_user=current_user)
    clustering_profile = clustering_res.get("profile", []) if isinstance(clustering_res, dict) else []
    
    # 3. Fetch Churn Data
    churn_res = get_churn_prediction(start_date=start_date, end_date=end_date, current_user=current_user)
    churn_data = churn_res if isinstance(churn_res, dict) else {}
    
    date_filter = ""
    if start_date and end_date:
        date_filter = f"{start_date} to {end_date}"
        
    try:
        pdf_bytes = build_executive_pdf(
            company_name=company_name,
            kpi=kpi,
            trend_data=trend_data,
            clustering_profile=clustering_profile,
            churn_data=churn_data,
            date_filter=date_filter
        )
        
        safe_name = "".join(c for c in company_name if c.isalnum() or c in (' ', '_', '-')).strip().replace(" ", "_")
        filename = f"Executive_Summary_{safe_name}_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(pdf_bytes)),
                "Cache-Control": "no-store, no-transform",
                "X-Content-Type-Options": "nosniff"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Generation failed: {str(e)}")

