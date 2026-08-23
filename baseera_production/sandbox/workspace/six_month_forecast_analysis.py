import pandas as pd
import numpy as np

def generate_six_month_forecast():
    # محاكاة تحميل بيانات المبيعات التاريخية
    data = {
        'Invoice Date': pd.date_range(start='2023-01-01', periods=12, freq='M'),
        'Total Sales': [1200, 1350, 1250, 1400, 1550, 1600, 1700, 1650, 1800, 1900, 1950, 2100],
        'Estimated Waste': [120, 135, 125, 140, 155, 160, 170, 165, 180, 190, 195, 210]
    }
    df = pd.DataFrame(data)
    
    # حساب متوسط النمو الشهري
    df['Sales_Growth'] = df['Total Sales'].pct_change()
    avg_growth = df['Sales_Growth'].mean() if not np.isnan(df['Sales_Growth'].mean()) else 0.05
    
    # التنبؤ للـ 6 أشهر القادمة
    last_sales = df['Total Sales'].iloc[-1]
    future_dates = pd.date_range(start=df['Invoice Date'].iloc[-1] + pd.DateOffset(months=1), periods=6, freq='M')
    
    forecast_sales = []
    forecast_waste = []
    current_sales = last_sales
    
    for _ in range(6):
        current_sales = current_sales * (1 + avg_growth)
        forecast_sales.append(current_sales)
        # تقدير الهدر بنسبة تقريبية 10% من المبيعات المتوقعة
        forecast_waste.append(current_sales * 0.10)
        
    forecast_df = pd.DataFrame({
        'Month': future_dates.strftime('%Y-%m'),
        'Projected Sales': forecast_sales,
        'Estimated Profit Margin': [s * 0.35 for s in forecast_sales], # افترضنا هامش ربح 35%
        'Projected Waste': forecast_waste
    })
    
    print("--- تقرير التنبؤات والتحليل لـ 6 أشهر القادمة ---")
    print(forecast_df.to_string(index=False))

if __name__ == "__main__":
    generate_six_month_forecast()