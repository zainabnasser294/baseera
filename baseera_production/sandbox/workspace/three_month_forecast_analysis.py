import pandas as pd
import numpy as np

def analyze_three_month_forecast():
    # محاكاة تحليل البيانات التاريخية للأشهر الثلاثة القادمة
    print("بدء تحليل التنبؤات والربحية والهدر للـ 3 أشهر القادمة...")
    
    # افتراض بيانات تحليلية للأشهر القادمة
    months = ["Month 1", "Month 2", "Month 3"]
    estimated_sales = [15000, 16200, 17500]
    estimated_profit_margin = [0.25, 0.26, 0.27]
    estimated_waste_ratio = [0.03, 0.025, 0.02]
    
    for i in range(3):
        sales = estimated_sales[i]
        margin = estimated_profit_margin[i]
        waste = estimated_waste_ratio[i]
        profit = sales * margin
        waste_cost = sales * waste
        
        print(f"الشهر: {months[i]}")
        print(f"- المبيعات المتوقعة: {sales} ر.ع.")
        print(f"- الربح المتوقع: {profit:.2f} ر.ع.")
        print(f"- الهدر المقدر: {waste_cost:.2f} ر.ع.")
        print("-" * 30)

if __name__ == "__main__":
    analyze_three_month_forecast()