from pathlib import Path

from PIL import Image

from integrate_redesigned_atlas import contain, contact_sheet

ROOT = Path(__file__).resolve().parent
CURRENT = ROOT / "current"
ATLAS = ROOT / "custom-construct-atlas.png"


if __name__ == "__main__":
    atlas = Image.open(ATLAS).convert("RGBA")
    width, height = atlas.size
    cells = {
        "mimic": atlas.crop((0, 0, width // 2, height)),
        "mirror": atlas.crop((width // 2, 0, width, height)),
    }
    for name, cell in cells.items():
        contain(cell, 128).save(CURRENT / f"{name}.png", optimize=True)
    contact_sheet()
    print("Integrated the matched Mimic and Counterforge construct family.")
