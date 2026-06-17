"""Background-remove + tight-crop the venue prop photos into transparent PNGs.

Run with the cutout venv:
    .venv-cutout/bin/python scripts/cutout_props.py
"""
from pathlib import Path
from rembg import remove, new_session
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PROPS = ROOT / "public" / "props"
OUT = PROPS / "cutouts"
OUT.mkdir(exist_ok=True)

# source photo -> output cutout name
JOBS = {
    "banner-fifa.jpg": "banner.png",
    "cardboard boxes.jpeg": "cardboard.png",
    "cups.jpeg": "cups.png",
    "pallete.jpeg": "pallet.png",
    "compost.jpeg": "compost.png",
    "bottles.jpeg": "bottles.png",
}

session = new_session("u2net")


def autocrop(img: Image.Image, pad_ratio: float = 0.04) -> Image.Image:
    """Crop to the alpha bounding box with a little padding."""
    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return img
    w, h = img.size
    px = int(w * pad_ratio)
    py = int(h * pad_ratio)
    left = max(0, bbox[0] - px)
    top = max(0, bbox[1] - py)
    right = min(w, bbox[2] + px)
    bottom = min(h, bbox[3] + py)
    return img.crop((left, top, right, bottom))


for src_name, out_name in JOBS.items():
    src = PROPS / src_name
    if not src.exists():
        print(f"skip (missing): {src_name}")
        continue
    with Image.open(src) as im:
        im = im.convert("RGBA")
        cut = remove(im, session=session, post_process_mask=True)
        cut = autocrop(cut)
        dest = OUT / out_name
        cut.save(dest)
        print(f"{src_name} -> cutouts/{out_name}  {cut.size[0]}x{cut.size[1]}")

print("DONE")
