import os
import pandas as pd
from celery import Celery
from sqlalchemy import create_engine, text
import redis

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6380/0")
redis_client = redis.Redis.from_url(CELERY_BROKER_URL)

def invalidate_tenant_cache(tenant_id: int):
    try:
        prefix = f"tenant:{tenant_id}:*"
        keys = list(redis_client.scan_iter(prefix))
        if keys:
            redis_client.delete(*keys)
    except Exception:
        pass


CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6380/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6380/0")

celery_app = Celery(
    "worker",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND
)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/saas_db")
engine = create_engine(DATABASE_URL)

@celery_app.task(bind=True)
def process_csv_upload(self, temp_path: str, tenant_id: int, mapping: dict = None):
    try:
        self.update_state(state='PROGRESS', meta={'status': 'Deleting old data...'})
        
        with engine.begin() as conn:
            conn.execute(text("DELETE FROM transactions WHERE tenant_id = :t"), {"t": tenant_id})
            
        chunk_size = 10000
        total_rows = 0
        
        for df_chunk in pd.read_csv(temp_path, chunksize=chunk_size):
            # Apply column mapping if provided
            if mapping:
                # mapping is { InternalName : UserCSVName }
                # we need to rename { UserCSVName : InternalName }
                rename_dict = {v: k for k, v in mapping.items()}
                df_chunk.rename(columns=rename_dict, inplace=True)
                
            required_cols = ['InvoiceNo', 'InvoiceDate', 'CustomerID', 'Category']
            for col in required_cols:
                if col not in df_chunk.columns:
                    raise ValueError(f"Missing column: {col}")
                    
            if 'TotalPrice' not in df_chunk.columns:
                if 'Quantity' in df_chunk.columns and 'UnitPrice' in df_chunk.columns:
                    df_chunk['TotalPrice'] = df_chunk['Quantity'] * df_chunk['UnitPrice']
                else:
                    raise ValueError("Missing pricing columns.")
                    
            if 'InvoiceDate' in df_chunk.columns:
                df_chunk['InvoiceDate'] = pd.to_datetime(df_chunk['InvoiceDate'])
                
            df_chunk['tenant_id'] = tenant_id
            df_chunk.to_sql('transactions', engine, if_exists='append', index=False, method='multi', chunksize=1000)
            total_rows += len(df_chunk)
            
            self.update_state(state='PROGRESS', meta={'status': f'Processed {total_rows} rows...', 'rows': total_rows})
            
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        invalidate_tenant_cache(tenant_id)
        return {'status': 'Completed', 'rows': total_rows, 'tenant_id': tenant_id}
        
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise e
