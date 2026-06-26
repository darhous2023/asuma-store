"""
A4 — Rollback catalog to pre-overhaul state from backups/pre-overhaul/
USE ONLY IF MIGRATION FAILED AND YOU NEED TO RESTORE.
Reads: products.json, categories.json from backup
Restores: thumbnail, images, category assignments, prices for changed products.
"""
import sys, os, json, time, argparse
sys.stdout.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)

BASE = 'https://asuma-backend-production.up.railway.app'
BACKUP_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'backups', 'pre-overhaul')
JWT_PATH = 'C:/Users/ahmed/AppData/Local/Temp/jwt.txt'

try:
    import requests
except ImportError:
    import subprocess; subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'requests', '-q'])
    import requests

def get_jwt():
    token = open(JWT_PATH).read().strip()
    if len(token) < 100:
        raise RuntimeError(f"JWT too short at {JWT_PATH}")
    return token

def patch(session, url, data, dry_run=False):
    if dry_run:
        print(f"  [DRY] PATCH {url}: {list(data.keys())}")
        return {'ok': True}
    r = session.post(url, json=data, timeout=30)
    if r.status_code not in (200, 201):
        print(f"  WARN: {r.status_code} {r.text[:200]}")
    return r.json()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--limit', type=int, default=0)
    args = parser.parse_args()

    jwt = get_jwt()
    s = requests.Session()
    s.headers.update({'Authorization': f'Bearer {jwt}', 'Content-Type': 'application/json'})

    products = json.load(open(os.path.join(BACKUP_DIR, 'products.json'), encoding='utf-8'))
    asm_products = [p for p in products if (p.get('handle') or '').startswith('asm-acc')]
    if args.limit:
        asm_products = asm_products[:args.limit]

    print(f"=== ROLLBACK: {'DRY RUN' if args.dry_run else 'LIVE'} — {len(asm_products)} products ===")

    ok, fail = 0, 0
    for i, p in enumerate(asm_products):
        pid = p['id']
        print(f"[{i+1}/{len(asm_products)}] {p.get('handle')} ({pid})")

        payload = {}
        if p.get('thumbnail'):
            payload['thumbnail'] = p['thumbnail']
        if p.get('images'):
            payload['images'] = [{'url': img['url']} for img in p['images']]
        if p.get('category_ids'):
            payload['categories'] = [{'id': cid} for cid in p['category_ids']]

        if payload:
            r = s.post(f'{BASE}/admin/products/{pid}', json=payload, timeout=30)
            if r.status_code == 200:
                ok += 1
                print(f"  ✓ restored thumbnail/images/categories")
            else:
                fail += 1
                print(f"  ✗ {r.status_code}: {r.text[:200]}")
        else:
            print(f"  ~ nothing to restore")
            ok += 1

        # Restore prices for each variant
        for v in p.get('variants', []):
            if v.get('prices'):
                for price_obj in v['prices']:
                    if price_obj.get('currency_code') == 'egp':
                        pr = s.post(
                            f'{BASE}/admin/products/{pid}/variants/{v["id"]}',
                            json={'prices': v['prices']},
                            timeout=30
                        )
                        print(f"  {'✓' if pr.status_code==200 else '✗'} variant price restored")

        time.sleep(0.1)

    print(f"\n=== ROLLBACK DONE: {ok} ok / {fail} failed ===")

if __name__ == '__main__':
    main()
