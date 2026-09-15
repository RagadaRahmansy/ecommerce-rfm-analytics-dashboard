# E-Commerce Sales & Customer Segmentation (RFM Analysis)

[![CI Pipeline](https://github.com/RagadaRahmansy/ecommerce-rfm-analytics-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/RagadaRahmansy/ecommerce-rfm-analytics-dashboard/actions/workflows/ci.yml)
This project is an end-to-end Data Analysis portfolio demonstrating how to process e-commerce transaction data, perform Exploratory Data Analysis (EDA), calculate RFM (Recency, Frequency, Monetary) metrics, and build an interactive Streamlit dashboard.

## Project Structure

```
ecommerce_rfm_analysis/
│
├── data/
│   ├── raw_data.csv          # Generated raw transaction data
│   └── cleaned_data.csv      # Cleaned data ready for analysis
│
├── src/
│   ├── generate_data.py      # Script to generate synthetic e-commerce data
│   └── clean_data.py         # Script to clean data (handle missing values, filter canceled orders)
│
├── notebooks/
│   └── 01_EDA_and_RFM_Analysis.ipynb # Jupyter Notebook for EDA & RFM calculations
│
├── app/
│   └── dashboard.py          # Interactive Streamlit dashboard
│
├── requirements.txt          # Python dependencies
└── README.md                 # Project documentation
```

## Setup & Installation

1. **Install dependencies**:
   Ensure you have Python installed, then run:
   ```bash
   pip install -r requirements.txt
   ```

2. **Generate and Clean Data**:
   The repository doesn't include the raw dataset. You need to generate it using the provided script:
   ```bash
   python src/generate_data.py
   python src/clean_data.py
   ```

3. **Run the Analysis Notebook**:
   Open the Jupyter Notebook to view the step-by-step Exploratory Data Analysis and RFM Customer Segmentation logic:
   ```bash
   jupyter notebook notebooks/01_EDA_and_RFM_Analysis.ipynb
   ```

4. **Run the Dashboard**:
   To view the interactive Streamlit dashboard, run:
   ```bash
   streamlit run app/dashboard.py
   ```

## Insights from RFM Analysis
- **Champions**: Best customers, bought most recently, most often, and spend the most.
- **Loyal Customers**: Buy on a regular basis, responsive to promotions.
- **Potential Loyalist**: Recent customers with average frequency.
- **At Risk**: Spent big money and purchased often but a long time ago. Need to bring them back!
- **Hibernating**: Last purchase was long back and low number of orders.

## Technologies Used
- **Python** (Pandas, Numpy, Faker)
- **Data Visualization** (Matplotlib, Seaborn, Plotly)
- **Web App** (Streamlit)
- **Jupyter Notebook**
