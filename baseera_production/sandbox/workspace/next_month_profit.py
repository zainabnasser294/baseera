import pandas as pd

def calculate_projected_profit():
    # Load historical sales data
    data = pd.read_csv('pharmacy_sales_en.csv')
    
    # Calculate average monthly sales and estimate next month with a conservative 5% growth factor
    total_sales = data['Total Sales'].sum()
    estimated_next_month_sales = (total_sales / 12) * 1.05
    
    # Assume an average net profit margin of 22% for the pharmacy sector
    profit_margin = 0.22
    projected_profit = estimated_next_month_sales * profit_margin
    
    print(f"Projected Sales for Next Month: {estimated_next_month_sales:.2f}")
    print(f"Projected Net Profit for Next Month: {projected_profit:.2f}")
    
    return projected_profit

if __name__ == "__main__":
    calculate_projected_profit()