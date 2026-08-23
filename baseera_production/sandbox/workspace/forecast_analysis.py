import pandas as pd
import numpy as np

def analyze_future_forecast(file_path):
    # قراءة بيانات المبيعات التاريخية
    df = pd.read_csv(file_path)
    
    # تحويل تاريخ الفاتورة إلى صيغة زمنيّة
    df['Invoice Date'] = pd.to_datetime(df['Invoice Date'])
    
    # حساب إجمالي المبيعات والأرباح التقريبية
    total_sales = df['Total Sales'].sum()
    avg_monthly_sales = total_sales / df['Invoice Date'].dt.to_period('M').nunique()
    
    # تقدير المبيعات لشهرين قادمين
    forecast_sales_2_months = avg_monthly_sales * 2
    
    # تقدير هامش الربح التقريبي (بافتراض 25% كمعدل عام)
    estimated_profit_margin = 0.25
    estimated_profit = forecast_sales_2_months * estimated_profit_margin
    
    # تقدير الهدر التقريبي (بافتراض 5% من حجم الكميات المباعة أو المخزون)
    total_quantity = df['Quantity Sold'].sum()
    avg_monthly_quantity = total_quantity / df['Invoice Date'].dt.to_period('M').nunique()
    estimated_waste = avg_monthly_quantity * 2 * 0.05
    
    print(f"المبيعات المتوقعة للشهرين القادمين: {forecast_sales_2_months:.2f} ر.ع.")
    print(f"الربح التقريبي المتوقع: {estimated_profit:.2f} ر.ع.")
    print(f"مؤشر الهدر التقريبي المتوقع: {estimated_waste:.2f} وحدة")

if __name__ == "__main__":
    analyze_future_forecast("cumulative_data.csv")