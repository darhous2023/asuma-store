import json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
d = json.load(open('backups/pre-overhaul/products.json', encoding='utf-8'))
asm = [p for p in d if (p.get('handle') or '').startswith('asm-acc')]
demo = [p for p in d if not (p.get('handle') or '').startswith('asm-acc')]
print(f'ASM products: {len(asm)}')
print(f'Demo/other: {len(demo)}')
for p in demo:
    print(f"  handle={p.get('handle')} status={p.get('status')} id={p.get('id')}")
