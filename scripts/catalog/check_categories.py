import json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
cats = json.load(open('backups/pre-overhaul/categories.json', encoding='utf-8'))
for c in cats:
    print(f"id={c.get('id')} handle={c.get('handle')} name={c.get('name')} parent={c.get('parent_category_id')}")
