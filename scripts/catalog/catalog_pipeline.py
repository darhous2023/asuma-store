"""
C/D — Catalog pipeline: compress → upload → link thumbnail → price → classify
Supports --dry-run, --limit N, --skip N, --resume, --canary (5 products)
Writes progress to .runtime/catalog-import/progress.json
"""
import sys, os, json, csv, hashlib, time, argparse, io, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)

BASE = 'https://asuma-backend-production.up.railway.app'
PRODUCTS_CSV = r'C:\Users\ahmed\Desktop\products\products.csv'
IMAGES_DIR   = r'C:\Users\ahmed\Desktop\products'
JWT_PATH     = r'C:\Users\ahmed\AppData\Local\Temp\jwt.txt'
RUNTIME_DIR  = os.path.join(os.path.dirname(__file__), '..', '..', '.runtime', 'catalog-import')
PRODUCT_INDEX = os.path.join(os.path.dirname(__file__), '..', '..', '.runtime', 'catalog-import', 'product_index.json')

EGYPT_REGION   = 'reg_01KVR04F83AG96VAKHB2A3DZ9H'
SALES_CHANNEL  = 'sc_01KVQAHT4AHWP7NH0RG64FY6QW'
PRICE_EGP      = 19900   # 199 EGP in cents

CAT_ACCESSORIES = 'pcat_01KVRHK0DSG04NZCQA5F25YVF2'
CAT_MAP = {
    'earrings':  'pcat_01KVRHKR56SSNEHSQTBPGZZYZJ',
    'necklaces': 'pcat_01KVRHKT7BDNG2MRW75M6YS95A',
    'bracelets': 'pcat_01KVRHKW97V41MAZC3WQW7079A',
    'rings':     'pcat_01KVRHKYAV38STFZNAVN4YMH95',
    'brooches':  'pcat_01KVRHM0DH2T7VGVK3BMMQV6AQ',
}

CLASSIFY_RULES = [
    # (keywords, category_key)  — first match wins
    (['حلق', 'أقراط', 'قرط', 'كف أذن', 'كف اذن', 'ايرينج', 'حلقة'], 'earrings'),
    (['سلسلة', 'سلاسل', 'قلادة', 'قلادات', 'نيكلس', 'جردان'], 'necklaces'),
    (['إنسيال', 'انسيال', 'خلخال', 'خلاخيل', 'كاحل', 'أنكليت'], 'bracelets'),
    (['أسورة', 'اسورة', 'إسورة', 'سوار', 'أساور', 'اساور', 'براسليت', 'بريسليت', 'باند', 'حزام معصم'], 'bracelets'),
    (['خاتم', 'خواتم', 'رينج', 'دبلة'], 'rings'),
    (['بروش', 'بروچ', 'دبوس', 'شبكة', 'بروتش'], 'brooches'),
]

try:
    import requests
    from PIL import Image, ExifTags
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'requests', 'Pillow', '-q'])
    import requests
    from PIL import Image, ExifTags

# Import Supabase S3 uploader (same directory)
sys.path.insert(0, os.path.dirname(__file__))
from supabase_upload import upload_to_supabase, verify_upload, SUPABASE_PUBLIC_BASE

def get_jwt():
    t = open(JWT_PATH).read().strip()
    if len(t) < 100:
        raise RuntimeError("JWT too short — refresh token")
    return t

def load_progress():
    path = os.path.join(RUNTIME_DIR, 'progress.json')
    if os.path.exists(path):
        return json.load(open(path, encoding='utf-8'))
    return {}

def save_progress(prog):
    os.makedirs(RUNTIME_DIR, exist_ok=True)
    path = os.path.join(RUNTIME_DIR, 'progress.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(prog, f, ensure_ascii=False, indent=2)

def file_sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''): h.update(chunk)
    return h.hexdigest()

def fix_exif_orientation(img):
    try:
        exif = img._getexif()
        if exif:
            for tag, val in exif.items():
                if ExifTags.TAGS.get(tag) == 'Orientation':
                    ops = {3: Image.ROTATE_180, 6: Image.ROTATE_270, 8: Image.ROTATE_90}
                    if val in ops:
                        img = img.transpose(ops[val])
    except Exception:
        pass
    return img

def compress_image(src_path, dst_path, max_dim=1400, quality=82):
    img = Image.open(src_path)
    img = fix_exif_orientation(img)
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGB')
    w, h = img.size
    if max(w, h) > max_dim:
        ratio = max_dim / max(w, h)
        img = img.resize((int(w*ratio), int(h*ratio)), Image.LANCZOS)
    img.save(dst_path, 'JPEG', quality=quality, optimize=True, progressive=True)
    return os.path.getsize(dst_path)


def classify(name_ar):
    name = name_ar or ''
    for keywords, cat_key in CLASSIFY_RULES:
        for kw in keywords:
            if kw in name:
                return cat_key, kw
    return None, None  # unmatched → keep parent only

def load_csv():
    rows = []
    with open(PRODUCTS_CSV, encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

def load_product_index():
    if not os.path.exists(PRODUCT_INDEX):
        raise RuntimeError(f"Product index not found: {PRODUCT_INDEX}\nRun build_product_index.py first.")
    return json.load(open(PRODUCT_INDEX, encoding='utf-8'))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--canary', action='store_true', help='Process only 5 products')
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--skip', type=int, default=0)
    parser.add_argument('--resume', action='store_true', help='Skip already completed SKUs')
    parser.add_argument('--step', choices=['compress','upload','thumbnail','price','classify','all'], default='all')
    args = parser.parse_args()

    jwt = get_jwt()
    session = requests.Session()
    # Remove Content-Type for multipart uploads (requests sets it automatically)
    session.headers.update({'Authorization': f'Bearer {jwt}'})

    csv_rows = load_csv()
    backup_idx = load_product_index()
    progress = load_progress() if args.resume else {}

    # Build work list
    work = []
    for row in csv_rows:
        sku = (row.get('sku') or '').strip()
        image_file = (row.get('image_file') or '').strip()
        name_ar = (row.get('name_ar') or '').strip()
        if not sku or not image_file:
            continue
        work.append({'sku': sku, 'image_file': image_file, 'name_ar': name_ar})

    if args.canary:
        work = work[:5]
    elif args.limit:
        work = work[args.skip:args.skip + args.limit]
    elif args.skip:
        work = work[args.skip:]

    total = len(work)
    print(f"=== CATALOG PIPELINE {'[DRY RUN]' if args.dry_run else ''} ===")
    print(f"  Mode: {'canary(5)' if args.canary else f'{total} products'}")
    print(f"  Resume: {args.resume}")

    os.makedirs(RUNTIME_DIR, exist_ok=True)
    compressed_dir = os.path.join(RUNTIME_DIR, 'compressed')
    os.makedirs(compressed_dir, exist_ok=True)

    stats = {'ok': 0, 'fail': 0, 'skip': 0, 'no_cat': 0, 'compress_saved_mb': 0}
    failed_skus = []
    manual_review = []

    for i, item in enumerate(work):
        sku = item['sku']
        image_file = item['image_file']
        name_ar = item['name_ar']
        print(f"\n[{i+1}/{total}] {sku} — {name_ar[:30]}")

        if args.resume and progress.get(sku, {}).get('done'):
            print(f"  ⏭ already done, skipping")
            stats['skip'] += 1
            continue

        # Find product in index
        entry = backup_idx.get(sku)
        if not entry:
            print(f"  ✗ SKU not found in product index")
            failed_skus.append({'sku': sku, 'error': 'not in product index'})
            stats['fail'] += 1
            continue

        prod_id = entry['product_id']
        var_id = entry.get('variant_id')
        if not var_id:
            print(f"  ✗ no variant_id in index")
            failed_skus.append({'sku': sku, 'error': 'no variant_id'})
            stats['fail'] += 1
            continue

        item_prog = {}
        try:
            # ── COMPRESS ──
            src = os.path.join(IMAGES_DIR, image_file)
            if not os.path.exists(src):
                raise FileNotFoundError(f"Image not found: {src}")
            dst = os.path.join(compressed_dir, f'{sku.lower()}.jpg')
            src_size = os.path.getsize(src)
            if args.dry_run:
                print(f"  [DRY] compress {image_file} → {sku.lower()}.jpg")
                dst_size = src_size
            elif os.path.exists(dst) and args.resume and progress.get(sku, {}).get('compressed'):
                dst_size = os.path.getsize(dst)
                print(f"  ✓ compress: cached ({dst_size//1024}KB)")
            else:
                dst_size = compress_image(src, dst)
                saved = (src_size - dst_size) / 1024 / 1024
                stats['compress_saved_mb'] += saved
                print(f"  ✓ compress: {src_size//1024}KB → {dst_size//1024}KB (saved {saved:.1f}MB)")
            item_prog['compressed'] = True

            # ── UPLOAD to Supabase S3 ──
            if not args.dry_run:
                sha = file_sha256(dst)
                filename = f'{sku.lower()}.jpg'
                supabase_url = f'{SUPABASE_PUBLIC_BASE}/asuma-products/{filename}'
                cached_url = progress.get(sku, {}).get('url', '')
                cached_sha = progress.get(sku, {}).get('sha', '')
                # Re-upload if URL is not Supabase or SHA changed
                if (args.resume and cached_sha == sha
                        and cached_url.startswith('https://atmbrocqpjzemfpazzax.supabase.co')):
                    img_url = cached_url
                    print(f"  ✓ upload: cached (Supabase)")
                else:
                    img_url = upload_to_supabase(dst, filename)
                    print(f"  ✓ upload: {img_url[:80]}")
                item_prog['url'] = img_url
                item_prog['sha'] = sha
            else:
                img_url = f'https://atmbrocqpjzemfpazzax.supabase.co/storage/v1/object/public/asuma-products/{sku.lower()}.jpg'
                print(f"  [DRY] upload → {img_url[:80]}")

            # ── LINK THUMBNAIL ──
            if args.step in ('all', 'thumbnail', 'upload'):
                if not args.dry_run:
                    # Read current state
                    pr = session.get(f'{BASE}/admin/products/{prod_id}?fields=images,thumbnail', timeout=20)
                    cur = pr.json().get('product', {}) if pr.status_code == 200 else {}
                    existing_images = [x for x in (cur.get('images') or []) if x.get('url') != img_url]
                    payload = {
                        'thumbnail': img_url,
                        'images': [{'url': img_url}] + [{'url': x['url']} for x in existing_images],
                    }
                    tr = session.post(f'{BASE}/admin/products/{prod_id}', json=payload, timeout=30)
                    if tr.status_code == 200:
                        print(f"  ✓ thumbnail linked")
                        item_prog['thumbnail'] = True
                    else:
                        raise RuntimeError(f"thumbnail link failed: {tr.status_code} {tr.text[:200]}")
                else:
                    print(f"  [DRY] PATCH thumbnail → {prod_id}")

            # ── PRICE ──
            if args.step in ('all', 'price'):
                if not args.dry_run:
                    # Get current variant prices
                    vr = session.get(f'{BASE}/admin/products/{prod_id}/variants/{var_id}', timeout=20)
                    cur_prices = []
                    if vr.status_code == 200:
                        cur_prices = vr.json().get('variant', {}).get('prices', [])
                    egp_price = next((p for p in cur_prices if p.get('currency_code') == 'egp'), None)
                    if egp_price:
                        print(f"  ~ price exists: {egp_price.get('amount')} EGP — skipping")
                        item_prog['price'] = True
                    else:
                        new_prices = [p for p in cur_prices if p.get('currency_code') != 'egp']
                        new_prices.append({'currency_code': 'egp', 'amount': PRICE_EGP})
                        price_r = session.post(
                            f'{BASE}/admin/products/{prod_id}/variants/{var_id}',
                            json={'prices': new_prices},
                            timeout=30
                        )
                        if price_r.status_code == 200:
                            print(f"  ✓ price set: {PRICE_EGP} EGP cents (199 EGP)")
                            item_prog['price'] = True
                        else:
                            raise RuntimeError(f"price failed: {price_r.status_code} {price_r.text[:200]}")
                else:
                    print(f"  [DRY] set price 199 EGP on variant {var_id}")

            # ── CLASSIFY ──
            if args.step in ('all', 'classify'):
                cat_key, matched_kw = classify(name_ar)
                if cat_key:
                    sub_cat_id = CAT_MAP[cat_key]
                    categories = [{'id': sub_cat_id}, {'id': CAT_ACCESSORIES}]
                    print(f"  ✓ classify → {cat_key} (matched: '{matched_kw}')")
                    if not args.dry_run:
                        cat_r = session.post(
                            f'{BASE}/admin/products/{prod_id}',
                            json={'categories': categories},
                            timeout=30
                        )
                        if cat_r.status_code == 200:
                            print(f"  ✓ categories assigned")
                            item_prog['category'] = cat_key
                        else:
                            raise RuntimeError(f"classify failed: {cat_r.status_code} {cat_r.text[:200]}")
                    else:
                        print(f"  [DRY] assign categories: {categories}")
                else:
                    print(f"  ⚠ classify: no match for '{name_ar[:40]}' → keeping parent only")
                    manual_review.append({'sku': sku, 'name_ar': name_ar})
                    stats['no_cat'] += 1
                    item_prog['category'] = 'parent_only'

            item_prog['done'] = True
            progress[sku] = item_prog
            save_progress(progress)
            stats['ok'] += 1

        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            failed_skus.append({'sku': sku, 'error': str(e)})
            stats['fail'] += 1
            progress[sku] = {'error': str(e)}
            save_progress(progress)

        time.sleep(0.2)

    # ── REPORT ──
    print(f"\n{'='*50}")
    print(f"=== PIPELINE COMPLETE ===")
    print(f"  OK:          {stats['ok']}")
    print(f"  Failed:      {stats['fail']}")
    print(f"  Skipped:     {stats['skip']}")
    print(f"  No category: {stats['no_cat']}")
    if not args.dry_run:
        print(f"  Compress saved: {stats['compress_saved_mb']:.1f} MB")

    if failed_skus:
        fail_path = os.path.join(RUNTIME_DIR, 'failed.json')
        with open(fail_path, 'w', encoding='utf-8') as f:
            json.dump(failed_skus, f, ensure_ascii=False, indent=2)
        print(f"\n  Failed list → {fail_path}")

    if manual_review:
        review_path = os.path.join(RUNTIME_DIR, 'manual_review.json')
        with open(review_path, 'w', encoding='utf-8') as f:
            json.dump(manual_review, f, ensure_ascii=False, indent=2)
        print(f"  Manual review → {review_path}")

    if stats['fail'] == 0:
        print("\nPIPELINE_SUCCESS")
    else:
        print(f"\nPIPELINE_PARTIAL — {stats['fail']} failed")

if __name__ == '__main__':
    main()
