"""
Build a product index: sku → {product_id, variant_id}
Fetches all ASM products with their variants from the live API.
Saves to .runtime/catalog-import/product_index.json
"""
import sys, os, json, time
sys.stdout.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)

BASE = 'https://asuma-backend-production.up.railway.app'
JWT_PATH = r'C:\Users\ahmed\AppData\Local\Temp\jwt.txt'
RUNTIME_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '.runtime', 'catalog-import')

try:
    import requests
except ImportError:
    import subprocess; subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'requests', '-q'])
    import requests

def main():
    jwt = open(JWT_PATH).read().strip()
    s = requests.Session()
    s.headers.update({'Authorization': f'Bearer {jwt}'})

    os.makedirs(RUNTIME_DIR, exist_ok=True)

    print("Building product index from live API...")
    idx = {}
    offset = 0
    limit = 50
    total_fetched = 0

    while True:
        url = f'{BASE}/admin/products?limit={limit}&offset={offset}'
        r = s.get(url, timeout=60)
        if r.status_code != 200:
            raise RuntimeError(f"API error {r.status_code}: {r.text[:200]}")
        data = r.json()
        products = data.get('products', [])
        if not products:
            break
        total = data.get('count', 0)

        for p in products:
            handle = p.get('handle', '')
            if not handle.startswith('asm-acc-'):
                continue
            prod_id = p['id']
            variants = p.get('variants', [])
            # SKU from handle: asm-acc-1056 → ASM-ACC-1056
            sku = 'ASM-ACC-' + handle[len('asm-acc-'):].upper()
            if variants:
                var_id = variants[0]['id']
                var_sku = variants[0].get('sku', '')
                idx[sku] = {'product_id': prod_id, 'variant_id': var_id, 'variant_sku': var_sku}
            else:
                idx[sku] = {'product_id': prod_id, 'variant_id': None, 'variant_sku': None}

        total_fetched += len(products)
        print(f"  Fetched {total_fetched}/{total} (ASM in index: {len(idx)})", end='\r')
        if total_fetched >= total or not products:
            break
        offset += limit
        time.sleep(0.1)

    print(f"\nTotal ASM products indexed: {len(idx)}")

    out_path = os.path.join(RUNTIME_DIR, 'product_index.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(idx, f, ensure_ascii=False, indent=2)
    print(f"Index saved → {out_path}")

    # Sample
    sample = list(idx.items())[:3]
    for sku, info in sample:
        print(f"  {sku}: prod={info['product_id']} var={info['variant_id']}")

    # Check for missing variant_ids
    missing = [sku for sku, info in idx.items() if not info.get('variant_id')]
    if missing:
        print(f"\nWARN: {len(missing)} products have no variant_id!")
        print(f"  Sample: {missing[:5]}")
    else:
        print(f"\nAll {len(idx)} products have variant_ids ✓")
    print("INDEX_DONE")

if __name__ == '__main__':
    main()
