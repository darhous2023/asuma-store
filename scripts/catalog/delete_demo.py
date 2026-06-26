"""
Phase E — Delete demo products, old placeholder products, and demo categories.
Only runs AFTER full D pipeline is verified successful.
"""
import sys, os, json, time
sys.stdout.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)

BASE = 'https://asuma-backend-production.up.railway.app'
JWT_PATH = r'C:\Users\ahmed\AppData\Local\Temp\jwt.txt'

# Medusa demo product IDs (confirmed from backup — draft status)
MEDUSA_DEMO_IDS = [
    'prod_01KVQAJ1TKS0KX196M3VGD549Z',  # t-shirt
    'prod_01KVQAJ1TM4CYSPB1MSFP66APB',  # sweatpants
    'prod_01KVQAJ1TMA51VH5NQ9RWA4GXZ',  # sweatshirt
    'prod_01KVQAJ1TMTHCQPAYFXZQYVBNC',  # shorts
]

# Old placeholder asuma-* products from previous session (published, no real orders)
OLD_PLACEHOLDER_HANDLES = [
    'asuma-earrings-pearl-gold', 'asuma-necklace-thin-gold', 'asuma-bracelet-crystal',
    'asuma-ring-moonstone-silver', 'asuma-brooch-rose-gold', 'asuma-scrunchie-velvet',
    'asuma-hairclip-pearl-gold', 'asuma-headband-satin-bow', 'asuma-hairtie-crystal-clear',
    'asuma-hairpin-gold-star', 'asuma-lipstick-velvet-rosie', 'asuma-lip-balm-strawberry',
    'asuma-eyeliner-silky-dark', 'asuma-brush-set-pro-5', 'asuma-pressed-powder-glow-violet',
    'asuma-perfume-rose-oud', 'asuma-perfume-jasmine-night', 'asuma-body-splash-vanilla',
    'asuma-body-splash-cherry', 'asuma-mini-perfume-gold', 'asuma-giftbox-accessories-gold',
    'asuma-giftbox-perfumes-luxury', 'asuma-set-accessories-complete',
    'asuma-set-perfumes-trio', 'asuma-giftbox-woman-premium',
]

# Demo category IDs (confirmed from backup — Shirts/Sweatshirts/Pants/Merch)
DEMO_CAT_IDS = [
    'pcat_01KVQAJ198R5DNBVQCG4V3PEFY',  # Shirts
    'pcat_01KVQAJ1BGQ7ED9T9A902JSEQ2',  # Sweatshirts
    'pcat_01KVQAJ1DSEG9KEM1NE9M5GJAR',  # Pants
    'pcat_01KVQAJ1G71A3QKH46G8BRBGFZ',  # Merch
]

try:
    import requests
except ImportError:
    import subprocess; subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'requests', '-q'])
    import requests

import argparse
parser = argparse.ArgumentParser()
parser.add_argument('--dry-run', action='store_true')
parser.add_argument('--skip-placeholders', action='store_true', help='Skip old placeholder product deletion')
args = parser.parse_args()

jwt = open(JWT_PATH).read().strip()
s = requests.Session()
s.headers.update({'Authorization': f'Bearer {jwt}'})

def safe_delete(url, label, dry_run=False):
    if dry_run:
        print(f"  [DRY] DELETE {url} ({label})")
        return True
    r = s.delete(url, timeout=30)
    if r.status_code in (200, 202, 204):
        print(f"  ✓ Deleted {label}")
        return True
    elif r.status_code == 404:
        print(f"  ~ Not found {label} (already deleted?)")
        return True
    else:
        print(f"  ✗ DELETE {label}: {r.status_code} {r.text[:200]}")
        return False

print(f"=== PHASE E — Demo Cleanup {'[DRY RUN]' if args.dry_run else '[LIVE]'} ===\n")

# ── 1. Delete Medusa demos ──
print("[1/3] Medusa demo products (4)...")
for pid in MEDUSA_DEMO_IDS:
    safe_delete(f'{BASE}/admin/products/{pid}', f'product {pid[:20]}', args.dry_run)
    time.sleep(0.3)

# ── 2. Delete old placeholder products ──
if not args.skip_placeholders:
    print(f"\n[2/3] Old placeholder products ({len(OLD_PLACEHOLDER_HANDLES)})...")
    for handle in OLD_PLACEHOLDER_HANDLES:
        r = s.get(f'{BASE}/admin/products?handle={handle}', timeout=20)
        products = r.json().get('products', [])
        if not products:
            print(f"  ~ {handle}: not found")
            continue
        pid = products[0]['id']
        safe_delete(f'{BASE}/admin/products/{pid}', handle, args.dry_run)
        time.sleep(0.3)
else:
    print("\n[2/3] Skipping old placeholder products (--skip-placeholders)")

# ── 3. Delete demo categories ──
print(f"\n[3/3] Demo categories (4: Shirts/Sweatshirts/Pants/Merch)...")
for cid in DEMO_CAT_IDS:
    safe_delete(f'{BASE}/admin/product-categories/{cid}', f'category {cid[:20]}', args.dry_run)
    time.sleep(0.3)

print(f"\n=== PHASE E DONE ===")
print("DEMO_CLEANUP_DONE")
