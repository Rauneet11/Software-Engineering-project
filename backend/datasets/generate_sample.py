"""
Generate synthetic sales dataset for the AI Sales Forecasting Platform.
Produces 500 rows of realistic sales data across multiple products, categories, and regions.
"""
import csv
import random
from datetime import date, timedelta

random.seed(42)

PRODUCTS = [
    ('Laptop Pro 15',   'Electronics',  55000),
    ('Smartphone X12',  'Electronics',  35000),
    ('Tablet Ultra',    'Electronics',  22000),
    ('Wireless Earbuds','Accessories',   4500),
    ('Smartwatch Pro',  'Wearables',    18000),
    ('DSLR Camera',     'Electronics',  45000),
    ('Laser Printer',   'Computing',    12000),
    ('4K Monitor',      'Computing',    28000),
    ('Mechanical Keyboard', 'Accessories', 3500),
    ('Gaming Mouse',    'Accessories',   2500),
    ('USB-C Hub',       'Accessories',   1800),
    ('Portable SSD',    'Computing',     6500),
    ('Noise Cancelling Headphones', 'Accessories', 8000),
    ('Webcam HD',       'Computing',     3200),
    ('Graphics Tablet', 'Electronics',  15000),
    ('Smart Speaker',   'Electronics',   5500),
    ('Wi-Fi Router',    'Networking',    4000),
    ('Network Switch',  'Networking',    8500),
    ('LED Desk Lamp',   'Accessories',   1200),
    ('Power Bank 20000mAh', 'Accessories', 2200),
]

REGIONS = ['North', 'South', 'East', 'West', 'Central']
SALESPERSON = ['Rahul Sharma', 'Priya Singh', 'Amit Patel', 'Sneha Gupta', 'Vijay Kumar']

start_date = date(2023, 1, 1)
end_date   = date(2024, 6, 30)
delta_days = (end_date - start_date).days

rows = []
for i in range(500):
    product_name, category, base_price = random.choice(PRODUCTS)
    sale_date  = start_date + timedelta(days=random.randint(0, delta_days))
    quantity   = random.randint(1, 25)
    # Price variation ±15%
    price      = round(base_price * random.uniform(0.85, 1.15), 2)
    discount   = round(random.uniform(0, 30), 1)
    revenue    = round(price * quantity * (1 - discount / 100), 2)
    region     = random.choice(REGIONS)
    salesperson= random.choice(SALESPERSON)

    rows.append({
        'date':        sale_date.strftime('%Y-%m-%d'),
        'product':     product_name,
        'category':    category,
        'quantity':    quantity,
        'price':       price,
        'discount':    discount,
        'revenue':     revenue,
        'region':      region,
        'salesperson': salesperson,
    })

# Sort by date
rows.sort(key=lambda x: x['date'])

output_file = 'sample_sales_data.csv'
with open(output_file, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

print(f"Generated {len(rows)} rows -> {output_file}")
