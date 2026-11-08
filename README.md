# When Pigs Fly 🐷

A browser game where you play a flying pig. Dodge spikes, flying frying pans and farmers with pitchforks, and reach the big mud pile where the other pigs are waiting. Get hit and you turn into bacon.

**Play it:** https://whenpigsfly.chubkingdom.cc (also on [GitHub Pages](https://chevtastic.github.io/When-Pigs-Fly/))

## Controls

| Keyboard | Touch | Action |
| --- | --- | --- |
| Hold **Space** (or click) | Hold anywhere | Fly up. Let go to fall |
| Hold **Shift** | Hold the ⚡ button | Go faster |
| **P** / **Esc** | Pause button | Pause |
| **R** | Pause → Restart | Restart level |
| **M** | Volume slider (menu or pause) | Mute, or drag the slider to set the volume |
| **F** | Full screen button | Full screen |

On phones the game goes full screen and locks to landscape when you start a level (Android/Chrome). iPhone browsers don't allow web pages to go full screen, so on iPhone the full screen button explains how to use Share → **Add to Home Screen** and launch it from there (it then opens full screen, like an app).

## Snout Island

**Continue** on the title screen jumps straight into your next unplayed level. **Snout Island** opens the island, which is shaped like a pig's face: tap an area to zoom in and see its levels as big cards, then tap a level to play. Clearing a level opens the next one. An area opens once you've cleared the area before it and found two thirds of that area's golden eggs (12 of 18). Locked areas show a lock, a golden egg and how many eggs they need (with your progress) on their island label, and each area screen shows what its eggs unlock next. The arrows on the sides of an area screen (or ←/→) jump straight to the area before or after it, if it's open. Once an area is open it stays open.

Each area is a set of about 6 levels with its own theme, so new areas can be added one at a time.

| Area | Where on the island | Status |
| --- | --- | --- |
| 🐷 **Hamlet Farms** | Left cheek | 6 levels (the originals) |
| 🏖️ **Bacon Bay** | The chin | 6 levels. Needs Hamlet Farms cleared and 12 of its golden eggs |
| 🌃 **Pork-topia 2099** | Right cheek | 6 levels. Needs Bacon Bay cleared and 12 of its golden eggs |
| 🏔️ **Mount Snoutmore** | The ears | Coming soon |
| ☁️ **Hog Heaven** | Floating in the sky | Coming soon |

### Hamlet Farms

1. **Muddy Meadow**: daytime warm-up
2. **Barnyard Bash**: sunset, faster farmers and more pans
3. **Midnight Pork Panic**: night, jumping farmers and zigzag towers
4. **Hogwash Downpour**: thunderstorm, introduces swinging meat cleavers
5. **Frost-Bitten Bacon**: snow, cleaver gauntlets and long tunnels
6. **The Grand Hamyon**: canyon finale, everything at once

### Bacon Bay

The first area where **boost** matters. Watch for the "HOLD SHIFT / HOLD ⚡" sign.

- 🦀 **Giant crabs** sit half buried in the sand, claw raised at you. Every crab has the same tell: when it spots you it shimmies four times (*clack, clack, clack, clack*), digging itself up a little each time, then rears up on the next beat with its claw towering to the top of the screen. Boost over it before then.
- 🌊 **Tidal waves** chase you along the beach a little faster than normal speed. Boost to stay ahead. You hear it roll in, its roar grows as it gains on you, and it crashes when it's right on your tail.
- 🥥 **Coconuts** drop on a loop from tall palm trees. Every drop has the same tell: the nut rocks three times (*tock, tock, tock*), cracks loose and falls.
- Also: stinging anemones, sandcastles (always the same size), piers and very rude seagulls.
- Its own music: *Bacon Bay* and *Coconut Cannonballs* play on its level cards and in its levels.
- Its mud spa is a beach spa: surfboard sign, tiki torches, a palm, a beach umbrella and pigs lounging in rubber rings.

1. **Sun-Burnt Bacon**: meet the beach, then your first giant crab
2. **Pinch Me, I'm Bacon**: giant crabs, including back-to-back ones
3. **Coconut Cannonball** (sunset): coconut barrages
4. **Low Tide, High Swine**: your first two tidal waves
5. **Shell-fish Behavior** (sunset): a bit of everything
6. **The Big Kahuna** (moonlit): long tidal waves with giant crabs inside them

### Pork-topia 2099

A neon city with **three planes**: the **skytops** above the rooftops, the **street**, and the grimy **undercity**
under it. The first three levels teach one plane each; from level 4 they're all open and joined by holes in the road
(each with an ENTRANCE gate), glass sky decks you can fly up through, and tunnels through the towers.

- 🏍️ **Corpo Pig Enforcer** chases you on a hoverbike along the street: boost away, or leave the street. Later he's
  back in a hovercar that follows you anywhere, so only boost loses him.
- 🤖 **Drones** and **gunships** guard the skytops. Drones flash and charge; gunships line up a sight line, blink,
  then fire a laser straight ahead.
- 🚇 **The metro** roars along the undercity tracks: a horn and a headlight glow warn you first.
- 🪧 **Billboards** in the sky (Sky Living hangs from the very top), **rails** you can grind for a boost, and every
  plane slopes gently into the street before the neon mud spa.

1. **Neon Arrival**: street only, with tower tunnels and your first Enforcer chase
2. **Underbelly**: undercity only, with hanging buildings and the metro
3. **Skytops**: above the smog, with drones, gunships and billboards
4. **Three-Way Junction**: all three planes open, gently
5. **Rush Hour**: busier, with the hovercar chase
6. **Pork-topia Prime**: the finale, everything at once

The rules these levels follow are in [docs/LEVEL_DESIGN.md](docs/LEVEL_DESIGN.md).

## Golden eggs, coins and the shop

- Every level hides **3 golden eggs**, usually somewhere dangerous. An egg only counts once you finish the level, but you don't have to get all three in the same run. Each new egg pays a 25-coin bonus.
- **Coins** are added to your wallet as soon as you grab them, even if you turn into bacon a second later. Clearing a level pays 10 coins, plus 40 the first time.
- Spend coins in the **Ham-berdashery** from the menu or the level-complete screen. It has three tabs: **Hats**, **Wings** and **Effects** (trails and auras like glitter, flames and a halo). Everything can be tried on before you buy it. Some items also need golden eggs: the tiara needs 9, the gold wings 12, the halo 15 and the crown every egg on the island.
- Progress is saved in the browser's local storage.

## Running locally

Plain HTML, CSS and JavaScript with no build step. Run `python tools/serve.py` (a dev server that turns off browser caching, so edits always show up) and open http://localhost:8123.

To jump straight into any level for testing (even a locked one; nothing is saved), add `?level=<id>`, e.g. http://localhost:8123/?level=city-3. The rules for building Pork-topia's levels are in [docs/LEVEL_DESIGN.md](docs/LEVEL_DESIGN.md).

## How the code is laid out

Plain scripts in `js/`, loaded in order by `index.html` (they share one scope, so there's still no build step):

| File | What's in it |
| --- | --- |
| `core.js` | Canvas setup, constants, maths and collision helpers |
| `puns.js` | All the jokes |
| `themes.js` | Background themes (sky, hills, weather) |
| `hazards.js` | The level builder and hazard registry |
| `hazards/*.js` | One file per area's hazards (how each is placed, moves, hits and is drawn) |
| `areas/*.js` | One file per area with its levels and map positions (`areas/farm.js` = the original six) |
| `world.js` | Area order, unlock rules, coming-soon areas |
| `cosmetics.js` | Hats, wings and effects |
| `save.js` | Save data, including upgrading old saves |
| `audio.js` | Sound effects and music (`PLAYLISTS`: tracks in `assets/Music/`, with optional per-area playlists keyed by area id) |
| `draw.js` | Drawing helpers: the pig, coins, eggs, backgrounds |
| `sprites.js` | Loads the sprite images in `assets/sprites/` |
| `sprite-shapes.js` | Sprite outlines used as hitboxes (made by `tools/sprites.py`) |
| `game.js` | Game state, physics and the in-level renderer |
| `overworld.js` | The Snout Island map (where each area sits and its tap region) |
| `shop.js` | The Ham-berdashery |
| `ui.js` | Menus, input, fullscreen, main loop, debug helpers |

**Adding an area:** the share of eggs needed is `UNLOCK_SHARE` in `world.js`. Create `js/areas/<id>.js` that calls `addArea({ id, name, blurb, color, eggs, levels })` (copy `areas/farm.js` as a template), use an id from `AREA_PLAN` in `world.js`, and add a `<script>` tag for it next to `areas/farm.js` in `index.html`. Level ids (like `farm-3`) are what saves use, so don't rename them once they're live.

**Adding a hazard:** in that area's `hazards/<area>.js`, one `defineBuild()` (how levels place it) and one `defineHazard()` (how it hits, moves and is drawn, plus its death quips). The header of `hazards.js` explains the fields, and `hazards/beach.js` lists the beach ones.

**Testing a level:** open the browser console and run `await __pig.solve('beach-3')`. A bot searches every flap/boost choice and reports whether the level can be finished with all 3 eggs (`{ ok: true }`), or how far it got. Use `__pig.solve('beach-3', { boost: false })` to prove a section really needs boost (it should fail), or `{ eggs: false }` to only check the level can be finished. It turns on test mode, so nothing gets saved.

## Editing levels

Levels are built with short builder calls (farm hazards shown here, beach ones are listed at the top of `js/hazards/beach.js`), for example:

```js
b.spikes(900, 3, 'floor', 45)        // x, count, 'floor' | 'ceil', height
 .tower(1850, 80, 170)               // hay bale topped with spikes
 .pan(2350, 260)                     // frying pan, meets the pig near x=2350 at height 260
 .farmer(2800, 160, 230, 2.2)        // x, min reach, max reach, jab period (s)
 .cleaver(3000, 290, 0.9, 2.0)       // pivot x, chain length, swing angle (radians), period (s)
 .coins(3200, 300, 5)                // x, y, count (optional dy, gap); coins inside obstacles are dropped
 .arc(3500, 380, 5, 50)              // x, y, count, arc height
 .egg(3740, 196)                     // golden egg (exactly 3 per level)
```

**Sprite art:** drop the big source image in `assets/`, add a line for it in `tools/sprites.py` (size and name), then run `python tools/sprites.py` (needs `pip install pillow`). That writes the small game-sized copies to `assets/sprites/`. Add the name to `SPRITE_NAMES` in `js/sprites.js`, and draw it with `spr('name')` (it's `null` until the image has loaded). The script also writes `js/sprite-shapes.js` (the giant crab's outline, used as its hitbox). The big originals aren't deployed. The beach's sandcastles, anemones, gulls, coconuts, palm trees and giant crabs are all whole sprites.

Hats live in `assets/hats/` and are listed in the `HATS` table in `js/cosmetics.js` (name, price, and how to fit them on the pig's head).  Wings (`WINGS`) and effects (`FX`) are drawn in code, so new ones only need an entry in those tables. To check how every hat sits on the pig, run `document.body.append(__pig.hatSheet())` in the browser console.

## Deploying to Cloudflare

The site at whenpigsfly.chubkingdom.cc is a Cloudflare Worker serving static files (see `wrangler.jsonc`; `.assetsignore` keeps non-game files unpublished):

```bash
npx wrangler deploy
```
