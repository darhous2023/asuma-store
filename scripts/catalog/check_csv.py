import csv, sys, os
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
rows = list(csv.DictReader(open(r'C:\Users\ahmed\Desktop\products\products.csv', encoding='utf-8-sig', newline='')))
print(f'Total rows: {len(rows)}')
print(f'Columns: {list(rows[0].keys())}')
for r in rows[:5]:
    img = r.get('image_file','')
    sku = r.get('sku','')
    name = r.get('name_ar','')
    exists = os.path.exists(os.path.join(r'C:\Users\ahmed\Desktop\products', img))
    print(f"  SKU={sku} image_file={img} name={name[:25]} exists={exists}")
