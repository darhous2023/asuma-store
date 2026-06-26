import sys, requests, json
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

PUB = 'pk_25df426e3380017abcab81726bf6cccdfb6288b75803fac08d81fe6ba31244c6'
BASE = 'https://asuma-backend-production.up.railway.app'
EG_REGION = 'reg_01KVR04F83AG96VAKHB2A3DZ9H'

CANARY_SKUS = ['ASM-ACC-1056', 'ASM-ACC-6791', 'ASM-ACC-2602', 'ASM-ACC-7113', 'ASM-ACC-9671']
CANARY_HANDLES = ['asm-acc-1056', 'asm-acc-6791', 'asm-acc-2602', 'asm-acc-7113', 'asm-acc-9671']

headers = {'x-publishable-api-key': PUB}

print("=== Canary Verification ===")
ok = 0
for handle in CANARY_HANDLES:
    r = requests.get(
        f'{BASE}/store/products?handle={handle}&region_id={EG_REGION}&fields=*variants.calculated_price,thumbnail',
        headers=headers, timeout=20
    )
    products = r.json().get('products', [])
    if not products:
        print(f"  ✗ {handle}: NOT FOUND")
        continue
    p = products[0]
    thumb = p.get('thumbnail')
    variants = p.get('variants', [])
    price = None
    if variants:
        calc_price = variants[0].get('calculated_price')
        if calc_price:
            price = calc_price.get('calculated_amount')

    thumb_ok = thumb and 'supabase.co' in thumb
    price_ok = price is not None

    status = '✓' if (thumb_ok and price_ok) else '✗'
    print(f"  {status} {handle}")
    print(f"    thumbnail: {thumb[:70] if thumb else 'NONE'}")
    print(f"    price: {price} EGP")

    # Verify image URL is accessible
    if thumb:
        try:
            r2 = requests.head(thumb, timeout=10)
            print(f"    image HTTP: {r2.status_code} ({r2.headers.get('content-type', '?')})")
        except:
            print(f"    image HTTP: FAILED")

    if thumb_ok and price_ok:
        ok += 1

print(f"\n=== {ok}/5 canary products verified ===")
if ok == 5:
    print("CANARY_VERIFIED ✓")
else:
    print("CANARY_PARTIAL — check issues above")
