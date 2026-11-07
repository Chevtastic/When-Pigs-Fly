"""Turn the big source art in assets/ into small game sprites in assets/sprites/.

Run from the project root after adding or changing art:  python tools/sprites.py
Needs Pillow (pip install pillow). The game only loads assets/sprites/, so the
big originals are left out of the deploy (see .assetsignore).
"""
from PIL import Image, ImageEnhance
import os

SRC, OUT = 'assets', os.path.join('assets', 'sprites')
os.makedirs(OUT, exist_ok=True)


def load(name):
    return Image.open(os.path.join(SRC, name)).convert('RGBA')


def blob(im, box, seed):
    """Crop `box`, keeping only the solid shape connected to `seed` (drops stray bits)."""
    c = im.crop(box)
    w, h = c.size
    a = c.getchannel('A').load()
    keep, stack = set(), [(seed[0] - box[0], seed[1] - box[1])]
    while stack:
        x, y = stack.pop()
        if (x, y) in keep or not (0 <= x < w and 0 <= y < h) or a[x, y] < 40:
            continue
        keep.add((x, y))
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    out = Image.new('RGBA', (w, h))
    src, dst = c.load(), out.load()
    for p in keep:
        dst[p] = src[p]
    return out


def fronds_only(im, below):
    """Remove the brown trunk (and its outline) under row `below`, leaving the green fronds."""
    im = im.copy(); px = im.load(); w, h = im.size
    green = lambda p: p[3] > 40 and p[1] > p[0] + 15
    for y in range(below, h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a and r > g and r + g + b >= 160:  # bark (not the dark outline)
                px[x, y] = (0, 0, 0, 0)
    for y in range(below, h):  # dark outline left behind with no frond next to it
        for x in range(w):
            r, g, b, a = px[x, y]
            if a and r + g + b < 160 and not any(green(px[i, j]) for i in range(max(0, x - 6), min(w, x + 7)) for j in range(max(0, y - 6), min(h, y + 7))):
                px[x, y] = (0, 0, 0, 0)
    return im


def trim(im):
    # ignore the faint glow some sprites have around them
    a = im.getchannel('A').point(lambda v: 255 if v > 40 else 0)
    return im.crop(a.getbbox())


def save(im, name, width):
    im = trim(im)
    h = round(im.height * width / im.width)
    im.resize((width, h), Image.LANCZOS).save(os.path.join(OUT, name + '.png'), optimize=True)
    print(f'{name}.png  {width}x{h}')


# Whole sprites, used as they are (no cutting up). Sizes are about the biggest they're drawn in game.
castle = load('Ornate Pixel Sandcastle with Shells and Flags.png')
save(castle, 'castle', 600)
save(load('Pixel Art Coconut Sprite.png'), 'coconut', 72)

palm = load('Pixel Art Tropical Palm Tree Sprite.png')
# full-height trees in the level that drop the coconuts. Toned down so the nuts (and the action) stand out
# against them: they're scenery with no hitbox.
tall = ImageEnhance.Contrast(ImageEnhance.Brightness(ImageEnhance.Color(palm).enhance(0.5)).enhance(0.8)).enhance(0.8)
tall.putalpha(palm.getchannel('A'))
save(tall, 'palm_tall', 520)
save(palm, 'palm', 300)       # little palms on the island map
bg = ImageEnhance.Brightness(ImageEnhance.Color(palm).enhance(0.65)).enhance(0.88)
save(bg, 'palm_bg', 240)      # softer copy for the scenery behind the action
night = ImageEnhance.Brightness(ImageEnhance.Color(palm).enhance(0.4)).enhance(0.45)
save(night, 'palm_night', 240)  # moonlit scenery

save(load('Neon Coral Anemone Sprite.png'), 'anemone', 260)
save(load('Determined Pixel Art Seagull.png'), 'gull', 170)

crab = load('Fierce Pixel Crab with Mega Claw.png')
save(crab, 'crab', 800)


def top_profile(im, n):
    """For n columns across the sprite: how far down (0-1) its top edge is. Used as the hitbox."""
    im = trim(im); a = im.getchannel('A').load(); w, h = im.size; out = []
    for i in range(n):
        x0, x1 = i * w // n, (i + 1) * w // n
        top = next((y for y in range(h) if sum(a[x, y] > 120 for x in range(x0, x1)) >= 0.35 * (x1 - x0)), h)
        out.append(round(top / h, 3))
    return out


with open(os.path.join('js', 'sprite-shapes.js'), 'w') as f:
    f.write("'use strict';" + chr(10) + "// Made by tools/sprites.py: the top edge of some sprites, as 0-1 fractions of their height" + chr(10))
    f.write(f"const CRAB_PROFILE = {top_profile(crab, 28)};" + chr(10))
print('js/sprite-shapes.js')
