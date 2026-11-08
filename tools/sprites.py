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


def bottom_profile(im, n, cover=0.4):
    """Like top_profile, for hanging things: how far down (0-1) each column's solid part reaches."""
    flipped = trim(im).transpose(Image.FLIP_TOP_BOTTOM)
    return [round(1 - t, 3) for t in top_profile(flipped, n, cover)]


def top_profile(im, n, cover=0.35):
    """For n columns across the sprite: how far down (0-1) its top edge is. Used as the hitbox."""
    im = trim(im); a = im.getchannel('A').load(); w, h = im.size; out = []
    for i in range(n):
        x0, x1 = i * w // n, (i + 1) * w // n
        top = next((y for y in range(h) if sum(a[x, y] > 120 for x in range(x0, x1)) >= cover * (x1 - x0)), h)
        out.append(round(top / h, 3))
    return out


# ---------- Pork-topia ----------
def key_black(im, tol=28):
    """Make the black backdrop transparent (flood fill from the edges, so dark pixels inside the art stay)."""
    im = im.copy(); px = im.load(); w, h = im.size
    dark = lambda p: p[0] < tol and p[1] < tol and p[2] < tol
    stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    seen = set()
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
            continue
        seen.add((x, y))
        if not dark(px[x, y]):
            continue
        px[x, y] = (0, 0, 0, 0)
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return im


def key_checker(im):
    """Remove a baked-in 'transparency' checkerboard (white + light grey squares): flood fill from the edges
    through pale, colourless pixels, so the art itself is left alone."""
    im = im.copy(); px = im.load(); w, h = im.size
    pale = lambda p: min(p[:3]) > 200 and max(p[:3]) - min(p[:3]) < 14
    stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    seen = set()
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
            continue
        seen.add((x, y))
        if not pale(px[x, y]):
            continue
        px[x, y] = (0, 0, 0, 0)
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return im


# Buildings are obstacles: their hitbox comes from their top edge (CITY_PROFILES below), measured where a column
# is at least 60% filled so thin antennas and spires don't count.
# Saved at about half the source size; the game sets each building's size (BUILDINGS in js/hazards/city.js).
CITY = {
    'b_ramen': 'Neon Ramen Cyberpunk Building.png',
    'b_nexus': 'Neon Tech Nexus Building.png',
    'b_arcology': 'Neon Arcology Biodome Complex.png',
    'b_dome': 'Neon Pig CEO Dome Headquarters.png',
    'b_megacorp': 'Cyberpunk Pig Megacorp Headquarters.png',
    'b_orion': 'Orion Technologies Neon Megatower.png',
    'b_corptower': 'Cyberpunk Corp Tower with Neon Ads.png',
    'b_fox': 'Neon Cyberpunk Fox Billboard Skyscraper.png',
    'b_skyscraper': 'Neon Cyberpunk Skyscraper Pixel Art.png',
    'b_pigcorp': 'Cyberpunk Pig Corporation Tower.png',
    'u_market': 'Cyberpunk Underground Market Entrance.png',
    'u_facade': 'Neon Undercity Pixel Art Facade.png',
    # these hang from the undercity ceiling: their hitbox comes from their bottom edge instead
    'h_industrial': 'Cyberpunk Hanging Industrial Platform.png',
    'h_market': 'Neon Undercity Hanging Market.png',
    'h_platform': 'Rusty Neon Undercity Platform.png',
}
HANGING = {'h_industrial', 'h_market', 'h_platform'}
city_imgs = {}
for name, file in CITY.items():
    im = load(file)
    if name == 'b_nexus':
        im = key_black(im)
    im.putalpha(im.getchannel('A').point(lambda v: 0 if v < 40 else v))  # drop faint haze around the art
    im = trim(im)
    city_imgs[name] = im
    save(im, name, round(im.width * 0.5))
save(load('Neon Pig Cop Hoverbike Chase.png'), 'cop', 560)
save(key_black(load('Cyberpunk Robopig Hover Patrol.png')), 'copcar', 600)    # the hovercar Enforcer (black backdrop removed)
save(load('Cyberpunk Drone with Neon Thrusters.png').transpose(Image.FLIP_LEFT_RIGHT), 'drone', 320)  # flipped to face left, at you
save(load('Sky Living Neon Billboard.png'), 'ad_sky', 1080)         # hangs on its chains from the top of the sky
save(load('Cortexa Industries Neon Hover Billboard.png'), 'ad_cortexa', 960)  # floats on thrusters
save(key_checker(load('HogFuel Neon Pig Airship Billboard.png')), 'ad_hogfuel', 960)  # floats (fake checkerboard backdrop removed)
save(load('Pixel-Art Cyberpunk Gunship Drone.png'), 'gunship', 380)   # sky robot with a laser (already faces left)
save(load('Undercity Cyberpunk Pig Metro.png').transpose(Image.FLIP_LEFT_RIGHT), 'metro', 1300)  # flipped: it comes at you
save(load('Cyberpunk Neon Pig Entrance Sign.png'), 'sign_gate', 640)  # gate over every hole into the undercity
save(load('Neon Undercity Pig Skull Sign.png'), 'sign_under', 560)   # above every hole, on the street
save(load('Neon Street Level Pig Sign.png'), 'sign_street', 560)     # under every hole, in the undercity


with open(os.path.join('js', 'sprite-shapes.js'), 'w') as f:
    f.write("'use strict';" + chr(10) + "// Made by tools/sprites.py: the top edge of some sprites (bottom edge for hanging h_ ones), as 0-1 fractions of their height" + chr(10))
    f.write(f"const CRAB_PROFILE = {top_profile(crab, 28)};" + chr(10))
    f.write("const CITY_PROFILES = {" + chr(10))
    for name, im in city_imgs.items():
        prof = bottom_profile(im, 16) if name in HANGING else top_profile(im, 16, 0.6)
        f.write(f"  {name}: {prof}," + chr(10))
    f.write("};" + chr(10))
print('js/sprite-shapes.js')
