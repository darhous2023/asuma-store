"""
Asuma Store — Gemini Asset Generation
Reads GEMINI_API_KEY from environment variable only.
Do NOT hardcode keys. Do NOT commit keys.
Run: $env:GEMINI_API_KEY="your-key"; python design-lab/generate_assets.py
"""
import os, sys, json
from pathlib import Path

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY environment variable not set.")
    sys.exit(1)

try:
    from google import genai
    from google.genai import types
    client = genai.Client(api_key=api_key)
    print("google-genai client initialized")
except ImportError as e:
    print(f"ERROR: google-genai not installed: {e}")
    sys.exit(1)

DIRECTIONS = {
    "gold-cinema": [
        ("hero-bg", "Cinematic luxury dark scene: obsidian black background with volumetric gold light rays cutting through darkness, subtle gold dust particles floating, deep architectural arches in black marble, warm champagne metallic glow, 16:9 editorial fashion photography, ultra HD, no text"),
        ("perfume-scene", "Crystal perfume bottle with obsidian stopper on black platform, single champagne gold light beam illuminating from above, fine gold dust suspended in air, pure black background, product photography luxury, ultra clean"),
        ("accessories-hero", "Floating gold jewelry pieces — chain necklace, delicate ring, pearl earrings — suspended in darkness with individual golden spotlights, pure black background, luxury jewelry advertisement, ultra HD"),
        ("makeup-scene", "Luxury makeup collection with gold-plated packaging — lipstick, compact, brush — arranged on black marble, champagne gold light, editorial beauty photography"),
        ("texture-gold", "Abstract dark luxury texture: black obsidian surface with fine gold metallic veins and subtle grain, macro photography, high contrast, flat lay"),
    ],
    "burgundy-editorial": [
        ("hero-bg", "Flowing deep burgundy silk fabric with dramatic warm directional lighting, rich velvet texture visible, champagne gold light source from upper right, dark atmospheric photography, luxury fashion editorial, 16:9"),
        ("perfume-scene", "Deep ruby red crystal perfume bottle on burgundy velvet surface, warm candlelight reflection, dark rose petals scattered around, luxury beauty editorial, warm tones"),
        ("fabric-texture", "Close-up of deep burgundy velvet fabric with champagne gold thread woven through, macro photography, luxurious texture, warm lighting, editorial magazine style"),
        ("accessories-scene", "Wine-red gemstone jewelry on dark rosewood surface, champagne gold chain necklace, vintage editorial style photography, warm intimate lighting"),
        ("makeup-editorial", "Rich wine-red makeup: deep burgundy lipstick tube, wine shadow palette, rose-gold powder compact, arranged on dark burgundy velvet, editorial beauty photography"),
    ],
    "pink-future": [
        ("hero-bg", "Dreamy blush pink glass spheres of varying sizes floating in soft powder pink mist, rose-gold metallic surfaces catching soft diffused light, ethereal luxury beauty campaign, 16:9, no text"),
        ("perfume-scene", "Delicate pink crystal perfume bottle floating in soft blush powder clouds, rose-gold atomizer details, dreamy soft-focus photography, feminine luxury"),
        ("glass-element", "Abstract glass sculpture: translucent rose-gold tinted glass orb with soft internal light, bokeh blush background, luxury cosmetics product photography"),
        ("makeup-scene", "Premium blush makeup collection in rose-gold packaging — blush palette, lip gloss, highlighter — on white marble with pink flower petals, dreamy beauty photography"),
        ("texture-pink", "Abstract luxury texture: smooth blush-pink gradient surface with rose-gold metallic sheen and soft powder particles, macro beauty photography"),
    ],
}

base = Path("design-lab")
results = {}

for direction, prompts in DIRECTIONS.items():
    out_dir = base / direction / "assets" / "generated"
    out_dir.mkdir(parents=True, exist_ok=True)
    results[direction] = []
    for name, prompt in prompts:
        out_path = out_dir / f"{name}.png"
        if out_path.exists():
            print(f"  SKIP (exists): {direction}/{name}.png")
            results[direction].append({"name": name, "status": "exists"})
            continue
        print(f"  Generating: {direction}/{name}.png ...")
        try:
            response = client.models.generate_images(
                model="imagen-3.0-generate-001",
                prompt=prompt,
                config=types.GenerateImagesConfig(number_of_images=1, aspect_ratio="16:9" if "hero" in name or "bg" in name else "1:1")
            )
            if response.generated_images:
                img_bytes = response.generated_images[0].image.image_bytes
                out_path.write_bytes(img_bytes)
                print(f"  OK: {out_path} ({len(img_bytes)//1024}KB)")
                results[direction].append({"name": name, "status": "generated", "size_kb": len(img_bytes)//1024})
            else:
                print(f"  WARN: No image returned for {name}")
                results[direction].append({"name": name, "status": "no_output"})
        except Exception as e:
            print(f"  ERROR: {direction}/{name}: {e}")
            results[direction].append({"name": name, "status": "error", "error": str(e)})

# Save results manifest (no keys)
manifest_path = base / "generated_manifest.json"
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
print(f"\nManifest saved: {manifest_path}")
print("Done.")
