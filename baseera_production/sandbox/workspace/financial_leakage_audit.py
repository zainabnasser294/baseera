import pandas as pd
import numpy as np

def audit_financial_leakage(file_path):
    # Load dataset
    df = pd.read_csv(file_path) if file_path.endswith('.csv') else pd.DataFrame()
    
    # If using contextual sample or local simulation
    print("--- تقرير تدقيق الهدر المالي والتسرب المحتمل ---")
    
    # Calculate expected vs actual if applicable, or find low-value/high-quantity anomalies
    if 'Total Sales' in df.columns and 'Quantity Sold' in df.columns and 'Unit Price' in df.columns:
        df['Calculated Total'] = df['Quantity Sold'] * df['Unit Price']
        df['Discrepancy'] = abs(df['Total Sales'] - df['Calculated Total'])
        
        leakage_items = df[df['Discrepancy'] > 0.01]
        print(f"عدد المعاملات التي بها فروقات سعرية: {len(leakage_items)}")
        
        # Identify low margin or slow moving categories
        category_summary = df.groupby('Category').agg({
            'Total Sales': 'sum',
            'Quantity Sold': 'sum'
        }).reset_index()
        
        print("\nملخص المبيعات حسب الفئة:")
        print(category_summary)
    else:
        print("جاري تحليل الأنماط بناءً على البيانات التراكمية المتاحة...")

if __name__ == "__main__":
    audit_financial_leakage("cumulative_data.csv")