import json, sys, requests
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
jwt = open(r'C:\Users\ahmed\AppData\Local\Temp\jwt.txt').read().strip()
BASE = 'https://asuma-backend-production.up.railway.app'
h = {'Authorization': f'Bearer {jwt}'}

# Fetch one product by handle
r = requests.get(f'{BASE}/admin/products?handle=asm-acc-1056', headers=h, timeout=20)
print(f'Status: {r.status_code}')
data = r.json()
p = data.get('products', [None])[0]
if p:
    print(f'Product id: {p.get("id")}')
    print(f'Status: {p.get("status")}')
    print(f'Variants: {p.get("variants")}')
    print(f'Keys: {list(p.keys())}')
    print(f'Full JSON (trimmed):')
    print(json.dumps(p, ensure_ascii=False, indent=2)[:2000])

# Also try fetching by ID directly
pid = p.get('id') if p else 'prod_01KW0QRAGC4VBAA75W8KF1DHPG'
r2 = requests.get(f'{BASE}/admin/products/{pid}', headers=h, timeout=20)
print(f'\nDirect GET /admin/products/{pid}: {r2.status_code}')
p2 = r2.json().get('product', {})
print(f'Variants in direct: {len(p2.get("variants", []))}')
if p2.get('variants'):
    v = p2['variants'][0]
    print(f'First variant: id={v.get("id")} sku={v.get("sku")} prices={v.get("prices")}')
