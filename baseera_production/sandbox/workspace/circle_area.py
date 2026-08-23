import math

def calculate_circle_area(radius):
    """
    حساب مساحة الدائرة بناءً على نصف القطر
    """
    area = math.pi * (radius ** 2)
    return area

if __name__ == "__main__":
    r = 5
    print(f"مساحة الدائرة بنصف قطر {r} هي: {calculate_circle_area(r):.2f}")