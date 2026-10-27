"""
Batch converts raw image sources (Pinterest pins, Archive.org plates)
into high-contrast, black-clamped archival collage elements and updates
the asset manifest for the composer.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance, ImageFilter, ImageDraw

PROCESSED_DIR = Path("assets/processed")
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

SOURCE_DIRS = [
    (Path("assets/pinterest/_god-with-guts-and-nuts"), "pin_guts"),
    (Path("assets/pinterest/_flesh-flawed"),           "pin_flesh"),
    (Path("assets/pinterest/_yea"),                    "pin_yea"),
    (Path("assets/archive_org"),                       "archive"),
]

IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tif', '.tiff'}


def make_photocopy_lut(black_floor=8, white_ceil=240, gamma=1.25):
    # Clamps deepest shadows to #080808 and pulls highlights up to warm paper
    lut = []
    for i in range(256):
        if i < 35:
            lut.append(black_floor)
        elif i > 225:
            lut.append(white_ceil)
        else:
            norm = (i - 35) / 190.0
            val = int(black_floor + (norm ** gamma) * (white_ceil - black_floor))
            lut.append(max(black_floor, min(white_ceil, val)))
    return lut

PHOTOCOPY_LUT = make_photocopy_lut()


def process_to_archival(img, high_contrast=True):
    # Flatten alpha to aged paper background if present
    if img.mode == 'RGBA':
        bg = Image.new('RGB', img.size, (232, 227, 215))
        bg.paste(img, mask=img.split()[3])
        img = bg
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    gray = ImageOps.grayscale(img)
    if high_contrast:
        gray = ImageEnhance.Contrast(gray).enhance(1.45)

    # Crisp photolitho edge definition
    gray = gray.filter(ImageFilter.UnsharpMask(radius=2, percent=140, threshold=3))
    return gray.point(PHOTOCOPY_LUT)


def add_paper_border(img, border_px=4, paper_color=232):
    bordered = ImageOps.expand(img, border=border_px, fill=paper_color)
    draw = ImageDraw.Draw(bordered)
    w, h = bordered.size
    draw.rectangle([0, 0, w - 1, h - 1], outline=60, width=1)
    return bordered


def process_single_image(src_path, prefix, index):
    results = []
    try:
        with Image.open(src_path) as img:
            ow, oh = img.size
            if ow < 50 or oh < 50:
                return results

            # Full image (capped at 900px max edge for smooth canvas rendering)
            full = process_to_archival(img)
            full.thumbnail((900, 900), Image.Resampling.LANCZOS)
            fname_full = f"{prefix}_{index:03d}_full.png"
            full.save(PROCESSED_DIR / fname_full, "PNG", optimize=True)
            results.append({
                "id": fname_full,
                "cropType": "full",
                "width": full.width,
                "height": full.height,
                "aspectRatio": round(full.width / full.height, 3)
            })

            min_dim = min(ow, oh)
            if min_dim >= 200:
                cx = (ow - min_dim) // 2
                cy = (oh - min_dim) // 2

                # Square crop
                sq = img.crop((cx, cy, cx + min_dim, cy + min_dim))
                sq_proc = process_to_archival(sq)
                sq_proc.thumbnail((550, 550), Image.Resampling.LANCZOS)
                fname_sq = f"{prefix}_{index:03d}_square.png"
                sq_proc.save(PROCESSED_DIR / fname_sq, "PNG", optimize=True)
                results.append({
                    "id": fname_sq,
                    "cropType": "square",
                    "width": sq_proc.width,
                    "height": sq_proc.height,
                    "aspectRatio": round(sq_proc.width / sq_proc.height, 3)
                })

                # Panoramic horizontal strip
                strip_h = int(min_dim * 0.33)
                strip = img.crop((cx, cy + (min_dim - strip_h) // 2,
                                  cx + min_dim, cy + (min_dim + strip_h) // 2))
                strip_proc = process_to_archival(strip)
                strip_proc.thumbnail((650, 260), Image.Resampling.LANCZOS)
                fname_strip = f"{prefix}_{index:03d}_strip_h.png"
                strip_proc.save(PROCESSED_DIR / fname_strip, "PNG", optimize=True)
                results.append({
                    "id": fname_strip,
                    "cropType": "strip_h",
                    "width": strip_proc.width,
                    "height": strip_proc.height,
                    "aspectRatio": round(strip_proc.width / strip_proc.height, 3)
                })

                # Architectural vertical pillar
                pillar_w = int(min_dim * 0.42)
                pillar = img.crop(((ow - pillar_w) // 2, cy,
                                   (ow + pillar_w) // 2, cy + min_dim))
                pillar_proc = process_to_archival(pillar)
                pillar_proc.thumbnail((320, 700), Image.Resampling.LANCZOS)
                fname_pil = f"{prefix}_{index:03d}_pillar_v.png"
                pillar_proc.save(PROCESSED_DIR / fname_pil, "PNG", optimize=True)
                results.append({
                    "id": fname_pil,
                    "cropType": "pillar_v",
                    "width": pillar_proc.width,
                    "height": pillar_proc.height,
                    "aspectRatio": round(pillar_proc.width / pillar_proc.height, 3)
                })

    except Exception as err:
        print(f"  failed processing {src_path.name}: {err}")

    return results


def categorize_asset(item_id):
    lid = item_id.lower()
    if any(k in lid for k in ['statue', 'ruins', 'durer', 'vitruvian', 'melencolia',
                              'apollo', 'laocoon', 'pieta', 'venus', 'torso']):
        return 'dominant'
    if any(k in lid for k in ['diagram', 'harmonia', 'haeckel', 'moon', 'nebula',
                              'celestial', 'waveform', 'astronomy']):
        return 'diagram'
    if any(k in lid for k in ['typography', 'newspaper', 'ledger', 'text']):
        return 'document'

    if 'full' in lid or 'pillar' in lid:
        return 'dominant'
    return 'supporting'


def rebuild_manifest():
    items = []
    for fpath in sorted(PROCESSED_DIR.iterdir()):
        if fpath.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.webp'}:
            continue
        try:
            with Image.open(fpath) as im:
                w, h = im.size
                name = fpath.name
                items.append({
                    "id": name,
                    "path": f"assets/processed/{name}",
                    "width": w,
                    "height": h,
                    "aspectRatio": round(w / h, 3),
                    "category": categorize_asset(name),
                    "isReference": name.startswith("ref_"),
                    "isUserAsset": any(name.startswith(p) for p in
                                       ['pin_guts', 'pin_flesh', 'pin_yea', 'archive'])
                })
        except Exception:
            continue

    manifest = {
        "total": len(items),
        "dominant":   [it for it in items if it["category"] == "dominant"],
        "supporting": [it for it in items if it["category"] == "supporting"],
        "diagrams":   [it for it in items if it["category"] == "diagram"],
        "documents":  [it for it in items if it["category"] == "document"],
        "reference":  [it for it in items if it["isReference"]],
        "userAssets": [it for it in items if it.get("isUserAsset")],
        "all": items
    }

    manifest_path = Path("assets/manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    return manifest


def main():
    print("=== Processing archival assets ===")
    total = 0

    for src_dir, prefix in SOURCE_DIRS:
        if not src_dir.is_dir():
            print(f"Skipping {src_dir} (not found)")
            continue

        files = sorted({
            p for ext in IMAGE_EXTS for p in src_dir.glob(f"*{ext}")
        } | {
            p for ext in IMAGE_EXTS for p in src_dir.glob(f"*{ext.upper()}")
        })

        print(f"[{prefix}] {len(files)} files found in {src_dir}")
        for i, fpath in enumerate(files):
            if fpath.name.startswith('_'):
                continue
            variants = process_single_image(fpath, prefix, i)
            total += len(variants)

    print(f"\nGenerated {total} variants. Rebuilding manifest...")
    m = rebuild_manifest()
    print(f"Manifest written: {m['total']} total assets indexed.")


if __name__ == "__main__":
    main()
