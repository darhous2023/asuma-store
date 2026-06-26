import json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
products = json.load(open('backups/pre-overhaul/products.json', encoding='utf-8'))
asm = [p for p in products if (p.get('handle') or '').startswith('asm-acc')]
print(f'Total ASM: {len(asm)}')
# Show first product structure
p = asm[0]
print(f'Handle: {p.get("handle")}')
print(f'ID: {p.get("id")}')
print(f'Variants: {p.get("variants")}')
print(f'Keys: {list(p.keys())}')
# Check SKU format
print(f'\nFirst 5 handles:')
for pp in asm[:5]:
    print(f"  handle={pp.get('handle')} variants={len(pp.get('variants',[]))} id={pp.get('id')}")
