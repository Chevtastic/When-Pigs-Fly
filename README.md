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

On phones the game goes full screen and locks to landscape when you start a level (Android/Chrome). iPhone Safari doesn't allow web pages to go full screen, so on iPhone use Share → **Add to Home Screen** and launch it from there.

## Levels

Each level unlocks when you clear the one before it.

1. **Muddy Meadow**: daytime warm-up
2. **Barnyard Bash**: sunset, faster farmers and more pans
3. **Midnight Pork Panic**: night, jumping farmers and zigzag towers
4. **Hogwash Downpour**: thunderstorm, introduces swinging meat cleavers
5. **Frost-Bitten Bacon**: snow, cleaver gauntlets and long tunnels
6. **The Grand Hamyon**: canyon finale, everything at once

## Golden eggs, coins and the shop

- Every level hides **3 golden eggs**, usually somewhere dangerous. An egg only counts once you finish the level, but you don't have to get all three in the same run. Each new egg pays a 25-coin bonus.
- **Coins** are added to your wallet as soon as you grab them, even if you turn into bacon a second later. Clearing a level pays 10 coins, plus 40 the first time.
- Spend coins in the **Ham-berdashery** from the menu or the level-complete screen. It has three tabs: **Hats**, **Wings** and **Effects** (trails and auras like glitter, flames and a halo). Everything can be tried on before you buy it. Some items also need golden eggs: the tiara needs 9, the gold wings 12, the halo 15 and the crown all 18.
- Progress is saved in the browser's local storage.

## Running locally

Plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser.

## Editing levels

Levels are defined near the top of `game.js` with short builder calls, for example:

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

Hats live in `assets/hats/` and are listed in the `HATS` table in `game.js` (name, price, and how to fit them on the pig's head).  Wings (`WINGS`) and effects (`FX`) are drawn in code, so new ones only need an entry in those tables. To check how every hat sits on the pig, run `document.body.append(__pig.hatSheet())` in the browser console.

## Deploying to Cloudflare

The site at whenpigsfly.chubkingdom.cc is a Cloudflare Worker serving static files (see `wrangler.jsonc`; `.assetsignore` keeps non-game files unpublished):

```bash
npx wrangler deploy
```
