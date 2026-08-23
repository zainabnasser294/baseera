
def calculate_vat(amount: float, vat_rate: float = 0.05) -> float:
    """
    دالة لحساب ضريبة القيمة المضافة بناءً على المبلغ والنسبة المئوية المحددة.
    النسبة الافتراضية هي 5%.
    """
    if amount < 0 or vat_rate < 0:
        raise ValueError("المبلغ أو نسبة الضريبة لا يمكن أن تكون سالبة.")
    
    vat_amount = amount * vat_rate
    return round(vat_amount, 3)

def calculate_total_with_vat(amount: float, vat_rate: float = 0.05) -> float:
    """
    دالة لحساب المبلغ الإجمالي متضمنًا ضريبة القيمة المضافة.
    """
    return round(amount + calculate_vat(amount, vat_rate), 3)
  