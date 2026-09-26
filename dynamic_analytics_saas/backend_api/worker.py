import os
import uuid
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
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
engine = create_engine(DATABASE_URL)

@celery_app.task(bind=True)
def process_csv_upload(self, temp_path: str, tenant_id: int, mapping: dict = None, mode: str = "append"):
    try:
        mode = mode.lower().strip() if mode else "append"
        if mode == 'replace':
            self.update_state(state='PROGRESS', meta={'status': 'Resetting old data (Replace mode)...'})
            with engine.begin() as conn:
                conn.execute(text("DELETE FROM transactions WHERE tenant_id = :t"), {"t": tenant_id})
        else:
            self.update_state(state='PROGRESS', meta={'status': 'Preparing incremental ingestion (Append mode)...'})
            
        chunk_size = 10000
        total_rows = 0
        new_inserted_rows = 0
        
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
                    
            if 'Quantity' not in df_chunk.columns:
                df_chunk['Quantity'] = 1.0
            if 'UnitPrice' not in df_chunk.columns:
                df_chunk['UnitPrice'] = df_chunk['TotalPrice'] if 'TotalPrice' in df_chunk.columns else 0.0
            if 'TotalPrice' not in df_chunk.columns:
                df_chunk['TotalPrice'] = df_chunk['Quantity'] * df_chunk['UnitPrice']
                    
            if 'Country' not in df_chunk.columns:
                df_chunk['Country'] = 'Indonesia'
                    
            if 'InvoiceDate' in df_chunk.columns:
                df_chunk['InvoiceDate'] = pd.to_datetime(df_chunk['InvoiceDate'])
                
            df_chunk['tenant_id'] = tenant_id
            
            # Select target columns
            cols = ['InvoiceNo', 'InvoiceDate', 'CustomerID', 'Category', 'Quantity', 'UnitPrice', 'TotalPrice', 'Country', 'tenant_id']
            save_cols = [c for c in cols if c in df_chunk.columns]
            df_to_save = df_chunk[save_cols].copy()
            
            if mode == 'replace':
                df_to_save.to_sql('transactions', engine, if_exists='append', index=False, method='multi', chunksize=1000)
                new_inserted_rows += len(df_to_save)
            else:
                # Incremental append with deduplication via temporary staging table
                stage_table = f"staging_{tenant_id}_{uuid.uuid4().hex[:8]}"
                df_to_save.to_sql(stage_table, engine, if_exists='replace', index=False)
                with engine.begin() as conn:
                    res = conn.execute(text(f"""
                        INSERT INTO transactions ("InvoiceNo", "InvoiceDate", "CustomerID", "Category", "Quantity", "UnitPrice", "TotalPrice", "Country", tenant_id)
                        SELECT s."InvoiceNo", s."InvoiceDate", s."CustomerID", s."Category", s."Quantity", s."UnitPrice", s."TotalPrice", s."Country", s.tenant_id
                        FROM {stage_table} s
                        WHERE NOT EXISTS (
                            SELECT 1 FROM transactions t
                            WHERE t.tenant_id = s.tenant_id
                              AND t."InvoiceNo" = s."InvoiceNo"
                              AND t."CustomerID" = s."CustomerID"
                              AND t."InvoiceDate" = s."InvoiceDate"
                              AND t."Category" = s."Category"
                        )
                    """))
                    new_inserted_rows += res.rowcount if res.rowcount is not None and res.rowcount >= 0 else len(df_to_save)
                    conn.execute(text(f"DROP TABLE IF EXISTS {stage_table}"))
                    
            total_rows += len(df_chunk)
            self.update_state(state='PROGRESS', meta={'status': f'Processed {total_rows} rows (Added {new_inserted_rows})...', 'rows': total_rows})
            
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        invalidate_tenant_cache(tenant_id)
        return {
            'status': 'Completed', 
            'rows_processed': total_rows, 
            'new_rows_added': new_inserted_rows,
            'mode': mode,
            'tenant_id': tenant_id
        }
        
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise e
