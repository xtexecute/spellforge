from pathlib import Path
import json

from PIL import Image

from integrate_redesigned_atlas import contain, contact_sheet

ROOT = Path(__file__).resolve().parent
CURRENT = ROOT / "current"
ATLAS = ROOT / "elemental-sprite-atlas.png"
GRID = [
    ["cinderhound", "rimeweaver", "thunderhead", "sporebrute"],
    ["sunlancer", "riftstalker", "shardsmith", "graviton"],
    ["tempestboss", "broodboss", "sunboss", "prismboss"],
]
BOSSES = {"tempestboss", "broodboss", "sunboss", "prismboss"}


if __name__ == "__main__":
    atlas = Image.open(ATLAS).convert("RGBA")
    width, height = atlas.size
    for row, names in enumerate(GRID):
        for col, name in enumerate(names):
            cell = atlas.crop((round(col * width / 4), round(row * height / 3),
                               round((col + 1) * width / 4), round((row + 1) * height / 3)))
            contain(cell, 256 if name in BOSSES else 128).save(CURRENT / f"{name}.png", optimize=True)
    manifest_path = ROOT / "sprite-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    radii = {"cinderhound":19,"rimeweaver":18,"thunderhead":18,"sporebrute":24,
             "sunlancer":19,"riftstalker":18,"shardsmith":22,"graviton":20,
             "tempestboss":45,"broodboss":48,"sunboss":45,"prismboss":47}
    for name, radius in radii.items():
        manifest[name] = {"file":f"current/{name}.png","canvas":[256,256] if name in BOSSES else [128,128],
                          "anchor":[.5,.5],"faces":"right","displayRadius":radius}
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    contact_sheet()
    print("Integrated eight realm enemies and four elemental bosses.")
