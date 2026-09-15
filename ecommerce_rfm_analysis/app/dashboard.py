import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import os
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from statsmodels.tsa.holtwinters import ExponentialSmoothing

# ==========================================
# PAGE CONFIGURATION & CUSTOM CSS
# ==========================================
st.set_page_config(
    page_title="Corporate Analytics Portal",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for a professional "Corporate SaaS" look
# Removes default Streamlit header/footer and styles metrics beautifully
st.markdown("""
<style>
    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Adjust top padding */
    .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }
    
    /* Professional Metric Cards */
    div[data-testid="metric-container"] {
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    div[data-testid="metric-container"] label {
        color: #616161;
        font-weight: 500;
        font-size: 0.9rem;
    }
    div[data-testid="metric-container"] div[data-testid="stMetricValue"] {
        color: #1e3a8a; /* Deep corporate blue */
        font-weight: 600;
        font-size: 1.8rem;
    }
    
    /* Section Headers */
    h1, h2, h3 {
        color: #1f2937;
        font-family: 'Inter', sans-serif;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 2rem;
    }
    .stTabs [data-baseweb="tab"] {
        height: 3rem;
        white-space: pre-wrap;
        background-color: transparent;
        border-radius: 4px 4px 0 0;
        padding-top: 1rem;
        padding-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# ==========================================
# DATA LOADING & PROCESSING
# ==========================================
@st.cache_data
def load_data():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, '..', 'data', 'cleaned_data.csv')
    if os.path.exists(data_path):
        df = pd.read_csv(data_path)
        df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
        return df
    return None

def calculate_rfm(df):
    snapshot_date = df['InvoiceDate'].max() + pd.Timedelta(days=1)
    rfm = df.groupby('CustomerID').agg({
        'InvoiceDate': lambda x: (snapshot_date - x.max()).days,
        'InvoiceNo': 'nunique',
        'TotalPrice': 'sum'
    }).rename(columns={
        'InvoiceDate': 'Recency',
        'InvoiceNo': 'Frequency',
        'TotalPrice': 'Monetary'
    })
    return rfm

# ==========================================
# MAIN APP
# ==========================================
df = load_data()

if df is None:
    st.error("System Error: Dataset not found. Please initialize the data pipeline prior to launching the dashboard.")
    st.stop()

# Sidebar
with st.sidebar:
    st.markdown("### Control Panel")
    st.markdown("Filter enterprise data below:")
    countries = df['Country'].unique().tolist()
    selected_countries = st.multiselect("Select Regions", countries, default=countries)
    filtered_df = df[df['Country'].isin(selected_countries)]
    
    st.markdown("---")
    st.caption("Data is updated daily. All financial figures are represented in IDR.")

st.title("E-Commerce Intelligence Portal")
st.markdown("Advanced analytics platform combining descriptive statistics, machine learning segmentation, and time-series forecasting.")
st.markdown("---")

tab1, tab2, tab3 = st.tabs(["Business Overview", "Customer Segmentation (K-Means)", "Revenue Forecasting"])

# ------------------------------------------
# TAB 1: Business Overview
# ------------------------------------------
with tab1:
    # High-level KPIs
    kpi1, kpi2, kpi3, kpi4 = st.columns(4)
    
    total_sales = filtered_df['TotalPrice'].sum()
    total_tx = filtered_df['InvoiceNo'].nunique()
    total_cust = filtered_df['CustomerID'].nunique()
    aov = total_sales / total_tx if total_tx > 0 else 0
    
    # Format to Billions/Millions for cleaner look
    def format_idr(value):
        if value >= 1e9:
            return f"Rp {value/1e9:.2f} B"
        elif value >= 1e6:
            return f"Rp {value/1e6:.2f} M"
        return f"Rp {value:,.0f}"
        
    kpi1.metric("Total Gross Revenue", format_idr(total_sales))
    kpi2.metric("Total Order Volume", f"{total_tx:,}")
    kpi3.metric("Active Customer Base", f"{total_cust:,}")
    kpi4.metric("Average Order Value", format_idr(aov))
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Trend Analysis
    monthly_sales = filtered_df.resample('M', on='InvoiceDate')['TotalPrice'].sum().reset_index()
    monthly_sales['Period'] = monthly_sales['InvoiceDate'].dt.strftime('%b %Y')
    
    fig_trend = px.area(
        monthly_sales, 
        x='Period', 
        y='TotalPrice',
        title="Revenue Trajectory (Monthly)",
        color_discrete_sequence=['#1e3a8a'],
        template="plotly_white"
    )
    fig_trend.update_layout(xaxis_title="", yaxis_title="Revenue (IDR)", margin=dict(l=0, r=0, t=40, b=0))
    fig_trend.update_yaxes(showgrid=True, gridcolor='#f0f0f0')
    st.plotly_chart(fig_trend, use_container_width=True)
    
    # Categorical Analysis
    col_pie, col_bar = st.columns(2)
    with col_pie:
        cat_sales = filtered_df.groupby('Category')['TotalPrice'].sum().reset_index()
        fig_cat = px.pie(
            cat_sales, 
            values='TotalPrice', 
            names='Category', 
            hole=0.5,
            title="Revenue Contribution by Category",
            color_discrete_sequence=px.colors.sequential.Blues_r,
            template="plotly_white"
        )
        st.plotly_chart(fig_cat, use_container_width=True)
        
    with col_bar:
        country_sales = filtered_df.groupby('Country')['TotalPrice'].sum().reset_index().sort_values(by='TotalPrice', ascending=True)
        fig_country = px.bar(
            country_sales, 
            x='TotalPrice', 
            y='Country', 
            orientation='h',
            title="Revenue Distribution by Region",
            color_discrete_sequence=['#3b82f6'],
            template="plotly_white"
        )
        fig_country.update_layout(xaxis_title="Revenue (IDR)", yaxis_title="")
        st.plotly_chart(fig_country, use_container_width=True)

# ------------------------------------------
# TAB 2: Machine Learning Clustering
# ------------------------------------------
with tab2:
    st.markdown("#### K-Means Customer Clustering")
    st.write("Utilizing unsupervised machine learning to autonomously segment the customer base based on RFM (Recency, Frequency, Monetary) behaviors.")
    
    rfm = calculate_rfm(filtered_df)
    
    if len(rfm) > 10:
        c1, c2 = st.columns([1, 3])
        with c1:
            st.markdown("<br><br>", unsafe_allow_html=True)
            k = st.slider("Select Number of Clusters (K)", min_value=2, max_value=6, value=4, help="Determine how many distinct segments to generate.")
            st.info("The algorithm scales the dimensions to zero mean and unit variance prior to convergence.")
            
        scaler = StandardScaler()
        rfm_scaled = scaler.fit_transform(rfm)
        
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        rfm['Cluster'] = kmeans.fit_predict(rfm_scaled)
        
        # Mapping clusters to string labels for categorical coloring
        rfm['Cluster Label'] = rfm['Cluster'].apply(lambda x: f"Segment {x+1}")
        
        with c2:
            fig_cluster = px.scatter_3d(
                rfm, x='Recency', y='Frequency', z='Monetary',
                color='Cluster Label',
                color_discrete_sequence=px.colors.qualitative.Safe,
                opacity=0.7,
                template="plotly_white",
                title="3D Representation of RFM Segments"
            )
            fig_cluster.update_layout(margin=dict(l=0, r=0, t=30, b=0))
            st.plotly_chart(fig_cluster, use_container_width=True)
            
        st.markdown("#### Cluster Behavioral Profiles")
        cluster_profile = rfm.groupby('Cluster Label').agg({
            'Recency': 'mean',
            'Frequency': 'mean',
            'Monetary': 'mean'
        }).reset_index()
        cluster_profile['Customer Count'] = rfm.groupby('Cluster Label').size().values
        
        # Format display dataframe
        display_df = cluster_profile.copy()
        display_df['Monetary'] = display_df['Monetary'].apply(lambda x: f"Rp {x:,.0f}")
        display_df['Recency'] = display_df['Recency'].apply(lambda x: f"{x:.1f} days")
        display_df['Frequency'] = display_df['Frequency'].apply(lambda x: f"{x:.1f} orders")
        
        st.dataframe(display_df, use_container_width=True, hide_index=True)
    else:
        st.warning("Insufficient data points for robust clustering.")

# ------------------------------------------
# TAB 3: Revenue Forecasting
# ------------------------------------------
with tab3:
    st.markdown("#### Time-Series Revenue Forecasting")
    st.write("Projecting future revenue streams utilizing Holt-Winters Exponential Smoothing, accounting for historical trends and moving averages.")
    
    ts_data = filtered_df.resample('M', on='InvoiceDate')['TotalPrice'].sum()
    
    if len(ts_data) >= 6:
        control_col, chart_col = st.columns([1, 4])
        
        with control_col:
            st.markdown("<br><br>", unsafe_allow_html=True)
            forecast_months = st.number_input("Projection Horizon (Months)", min_value=1, max_value=12, value=3)
            st.caption("Adjust the horizon to forecast upcoming quarterly or annual performance.")
            
        model = ExponentialSmoothing(ts_data, trend='add', seasonal=None, initialization_method="estimated")
        fit_model = model.fit()
        forecast = fit_model.forecast(forecast_months)
        
        history_df = pd.DataFrame({'Period': ts_data.index, 'Revenue': ts_data.values, 'Status': 'Historical Data'})
        forecast_df = pd.DataFrame({'Period': forecast.index, 'Revenue': forecast.values, 'Status': 'Projected Forecast'})
        combined_df = pd.concat([history_df, forecast_df])
        
        with chart_col:
            fig_forecast = px.line(
                combined_df, 
                x='Period', 
                y='Revenue', 
                color='Status', 
                markers=True,
                color_discrete_map={'Historical Data': '#1e3a8a', 'Projected Forecast': '#d97706'},
                template="plotly_white"
            )
            
            # Add subtle fill below forecast line
            fig_forecast.update_traces(fill='tozeroy', selector=dict(name="Projected Forecast"), fillcolor='rgba(217, 119, 6, 0.1)')
            
            # Vertical line denoting present day
            last_historical_date = ts_data.index[-1].timestamp() * 1000
            fig_forecast.add_vline(x=last_historical_date, line_dash="dash", line_color="#9ca3af", annotation_text="Present")
            
            fig_forecast.update_layout(xaxis_title="", yaxis_title="Revenue (IDR)", margin=dict(l=0, r=0, t=30, b=0))
            st.plotly_chart(fig_forecast, use_container_width=True)
            
        # Raw Data Table for Forecast
        st.markdown("#### Projected Financials")
        forecast_table = forecast_df.copy()
        forecast_table['Period'] = forecast_table['Period'].dt.strftime('%B %Y')
        forecast_table['Revenue'] = forecast_table['Revenue'].apply(lambda x: f"Rp {x:,.0f}")
        st.dataframe(forecast_table[['Period', 'Revenue']], use_container_width=True, hide_index=True)
    else:
        st.warning("Insufficient historical periods (minimum 6 months required) to construct a reliable forecast.")
