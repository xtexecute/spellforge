from pathlib import Path

from PIL import Image, ImageDraw

from integrate_redesigned_atlas import contain, contact_sheet

ROOT = Path(__file__).resolve().parent
CURRENT = ROOT / "current"


def flatten(source_name, output_name, palette):
    image = contain(Image.open(ROOT / source_name).convert("RGBA"), 256)
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a < 8:
                pixels[x, y] = (0, 0, 0, 0)
                continue
            luminance = .2126 * r + .7152 * g + .0722 * b
            index = 0 if luminance < 48 else 1 if luminance < 102 else 2 if luminance < 175 else 3
            pr, pg, pb = palette[index]
            pixels[x, y] = (pr, pg, pb, a)
    if output_name == "tempestboss":
        draw = ImageDraw.Draw(image)
        def hexagon(radius):
            import math
            return [(128 + math.cos(i * math.pi / 3) * radius,
                     128 + math.sin(i * math.pi / 3) * radius) for i in range(6)]
        draw.polygon(hexagon(38), fill="#35205b", outline="#070b1f", width=8)
        draw.polygon(hexagon(26), fill="#743fb3", outline="#070b1f", width=6)
        draw.polygon(hexagon(12), fill="#d197ff", outline="#070b1f", width=4)
    image.save(CURRENT / f"{output_name}.png", optimize=True)


def flatten_vector_scribe():
    image = Image.open(ROOT / "vector-scribe-source.png").convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a < 145:
                pixels[x, y] = (0, 0, 0, 0)
                continue
            if g > r * .9 and b > r * 1.05:
                color = (91, 226, 238)
            else:
                luminance = .2126 * r + .7152 * g + .0722 * b
                color = (8, 11, 31) if luminance < 45 else (57, 31, 104) if luminance < 105 else (116, 61, 199) if luminance < 190 else (221, 201, 255)
            pixels[x, y] = (*color, 255)
    contain(image, 128).save(CURRENT / "vectorscribe.png", optimize=True)


if __name__ == "__main__":
    flatten("tempest-flat-source.png", "tempestboss",
            [(7, 11, 31), (52, 31, 91), (116, 63, 179), (209, 151, 255)])
    flatten("brood-flat-source.png", "broodboss",
            [(5, 20, 25), (20, 73, 47), (56, 143, 73), (205, 255, 113)])
    flatten_vector_scribe()
    contact_sheet()
    print("Flattened Tempest Crown and Brood Cathedral to the four-color sprite style.")
