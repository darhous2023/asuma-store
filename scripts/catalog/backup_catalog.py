"""
A3 — Backup Medusa catalog to backups/pre-overhaul/
Read-only: products, categories, collections, sales channels.
Generates manifest.json with hash for integrity verification.
"""
import sys, os, json, hashlib, datetime, time
sys.stdout.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)

BASE = 'https://asuma-backend-production.up.railway.app'
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'backups', 'pre-overhaul')
JWT_PATH = 'C:/Users/ahmed/AppData/Local/Temp/jwt.txt'

try:
    import requests
except ImportError:
    print("Installing requests..."); import subprocess; subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'requests', '-q'])
    import requests

def get_jwt():
    if os.path.exists(JWT_PATH):
        token = open(JWT_PATH).read().strip()
        if len(token) > 100:
            return token
    raise RuntimeError(f"JWT not found or too short at {JWT_PATH}. Get fresh JWT first.")

def paginate(endpoint, key, headers, limit=100):
    items, offset = [], 0
    while True:
        r = requests.get(f'{BASE}{endpoint}?limit={limit}&offset={offset}', headers=headers, timeout=30)
        if r.status_code != 200:
            raise RuntimeError(f"GET {endpoint} offset={offset} → {r.status_code}: {r.text[:300]}")
        data = r.json()
        batch = data.get(key, [])
        items.extend(batch)
        total = data.get('count', len(items))
        print(f"  {endpoint}: {len(items)}/{total}", end='\r')
        if len(items) >= total or not batch:
            break
        offset += limit
        time.sleep(0.1)
    print(f"  {endpoint}: {len(items)} items fetched     ")
    return items

def slim_product(p):
    return {
        'id': p.get('id'),
        'handle': p.get('handle'),
        'title': p.get('title'),
        'status': p.get('status'),
        'thumbnail': p.get('thumbnail'),
        'images': [{'id': i.get('id'), 'url': i.get('url')} for i in (p.get('images') or [])],
        'category_ids': [c.get('id') for c in (p.get('categories') or [])],
        'collection_id': (p.get('collection') or {}).get('id'),
        'variants': [
            {
                'id': v.get('id'),
                'sku': v.get('sku'),
                'manage_inventory': v.get('manage_inventory'),
                'prices': v.get('prices', []),
            }
            for v in (p.get('variants') or [])
        ],
    }

def main():
    jwt = get_jwt()
    h = {'Authorization': f'Bearer {jwt}', 'Content-Type': 'application/json'}
    os.makedirs(OUT_DIR, exist_ok=True)

    print("=== A3: Medusa Catalog Backup ===")
    print(f"Output: {os.path.abspath(OUT_DIR)}")

    # Products — need extra fields
    print("\n[1/4] Products...")
    products_raw = []
    offset = 0
    limit = 50
    while True:
        fields = 'id,handle,title,status,thumbnail,images,categories,collection,variants'
        url = f'{BASE}/admin/products?limit={limit}&offset={offset}&fields={fields}'
        r = requests.get(url, headers=h, timeout=60)
        if r.status_code != 200:
            raise RuntimeError(f"Products fetch failed: {r.status_code}: {r.text[:300]}")
        data = r.json()
        batch = data.get('products', [])
        products_raw.extend(batch)
        total = data.get('count', len(products_raw))
        print(f"  Products: {len(products_raw)}/{total}", end='\r')
        if len(products_raw) >= total or not batch:
            break
        offset += limit
        time.sleep(0.15)
    print(f"  Products: {len(products_raw)} total     ")

    products = [slim_product(p) for p in products_raw]
    with open(os.path.join(OUT_DIR, 'products.json'), 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print(f"  → products.json saved ({len(products)} items)")

    # Categories
    print("\n[2/4] Categories...")
    categories = paginate('/admin/product-categories', 'product_categories', h)
    with open(os.path.join(OUT_DIR, 'categories.json'), 'w', encoding='utf-8') as f:
        json.dump(categories, f, ensure_ascii=False, indent=2)
    print(f"  → categories.json saved ({len(categories)} items)")

    # Collections
    print("\n[3/4] Collections...")
    collections = paginate('/admin/collections', 'collections', h)
    with open(os.path.join(OUT_DIR, 'collections.json'), 'w', encoding='utf-8') as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print(f"  → collections.json saved ({len(collections)} items)")

    # Manifest
    print("\n[4/4] Manifest...")
    def file_hash(path):
        h = hashlib.sha256()
        with open(path, 'rb') as f:
            for chunk in iter(lambda: f.read(65536), b''):
                h.update(chunk)
        return h.hexdigest()

    manifest = {
        'created_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'products_count': len(products),
        'categories_count': len(categories),
        'collections_count': len(collections),
        'files': {
            'products.json': file_hash(os.path.join(OUT_DIR, 'products.json')),
            'categories.json': file_hash(os.path.join(OUT_DIR, 'categories.json')),
            'collections.json': file_hash(os.path.join(OUT_DIR, 'collections.json')),
        }
    }
    with open(os.path.join(OUT_DIR, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"\n=== BACKUP COMPLETE ===")
    print(f"  Products:    {manifest['products_count']}")
    print(f"  Categories:  {manifest['categories_count']}")
    print(f"  Collections: {manifest['collections_count']}")
    print(f"  Created at:  {manifest['created_at']}")
    print(f"  Output dir:  {os.path.abspath(OUT_DIR)}")
    print("BACKUP_SUCCESS")

if __name__ == '__main__':
    main()
