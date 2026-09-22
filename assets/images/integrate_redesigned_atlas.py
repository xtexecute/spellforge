from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from collections import deque

ROOT = Path(__file__).resolve().parent
CURRENT = ROOT / "current"
ATLAS = ROOT / "redesigned-sprite-atlas.png"

GRID = [
    ["chaser", "shooter", "charger", "splitter", "swarm"],
    ["tank", "wisp", "golden", "sentinel", "crimson"],
    ["healer", "sniper", "burrower", "shieldbearer", "voidmage"],
    ["frostboss", "splitboss", "splitA", "splitB", "player"],
]


def contain(sprite: Image.Image, size: int) -> Image.Image:
    alpha = sprite.getchannel("A")
    bounds = alpha.getbbox()
    if not bounds:
        return Image.new("RGBA", (size, size))
    sprite = sprite.crop(bounds)
    margin = max(7, round(size * 0.065))
    usable = size - margin * 2
    scale = min(usable / sprite.width, usable / sprite.height)
    resized = sprite.resize(
        (max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale))),
        Image.Resampling.LANCZOS,
    )
    out = Image.new("RGBA", (size, size))
    out.alpha_composite(resized, ((size - resized.width) // 2, (size - resized.height) // 2))
    return remove_specks(out)


def remove_specks(image: Image.Image) -> Image.Image:
    """Remove tiny neighboring-cell fragments while retaining detached equipment."""
    alpha = image.getchannel("A")
    pixels = alpha.load()
    width, height = image.size
    seen: set[tuple[int, int]] = set()
    components: list[list[tuple[int, int]]] = []
    for y in range(height):
        for x in range(width):
            if pixels[x, y] < 12 or (x, y) in seen:
                continue
            queue = deque([(x, y)])
            seen.add((x, y))
            component: list[tuple[int, int]] = []
            while queue:
                px, py = queue.popleft()
                component.append((px, py))
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if (0 <= nx < width and 0 <= ny < height and
                            pixels[nx, ny] >= 12 and (nx, ny) not in seen):
                        seen.add((nx, ny))
                        queue.append((nx, ny))
            components.append(component)
    if not components:
        return image
    largest = max(len(component) for component in components)
    keep = {point for component in components
            if len(component) >= max(10, round(largest * 0.03))
            for point in component}
    cleaned = image.copy()
    cleaned_alpha = cleaned.getchannel("A")
    cleaned_pixels = cleaned_alpha.load()
    for y in range(height):
        for x in range(width):
            if pixels[x, y] >= 12 and (x, y) not in keep:
                cleaned_pixels[x, y] = 0
    cleaned.putalpha(cleaned_alpha)
    return cleaned


def integrate() -> None:
    image = Image.open(ATLAS).convert("RGBA")
    width, height = image.size
    for row, names in enumerate(GRID):
        top = round(row * height / 4)
        bottom = round((row + 1) * height / 4)
        for col, name in enumerate(names):
            left = round(col * width / 5)
            right = round((col + 1) * width / 5)
            crop = image.crop((left, top, right, bottom))
            size = 256 if name in {"frostboss", "splitboss"} else 128
            contain(crop, size).save(CURRENT / f"{name}.png", optimize=True)


def contact_sheet() -> None:
    names = sorted(path.stem for path in CURRENT.glob("*.png"))
    columns, cell_w, cell_h = 5, 188, 178
    rows = (len(names) + columns - 1) // columns
    sheet = Image.new("RGBA", (columns * cell_w, rows * cell_h), "#101827")
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("arial.ttf", 17)
    except OSError:
        font = ImageFont.load_default()
    for index, name in enumerate(names):
        x = (index % columns) * cell_w
        y = (index // columns) * cell_h
        draw.rounded_rectangle((x + 5, y + 5, x + cell_w - 5, y + cell_h - 5), 10,
                               fill="#162237", outline="#324560", width=2)
        sprite = Image.open(CURRENT / f"{name}.png").convert("RGBA")
        preview = contain(sprite, 132)
        sheet.alpha_composite(preview, (x + (cell_w - 132) // 2, y + 8))
        label_box = draw.textbbox((0, 0), name, font=font)
        label_w = label_box[2] - label_box[0]
        draw.text((x + (cell_w - label_w) / 2, y + 145), name, font=font, fill="#f6d58c")
    sheet.convert("RGB").save(ROOT / "current-sprites-contact-sheet.png", quality=94)


if __name__ == "__main__":
    integrate()
    contact_sheet()
    print("Integrated 20 redesigned sprites and rebuilt the contact sheet.")
