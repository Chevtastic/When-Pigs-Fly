# When Pigs Fly 🐷

A browser game where you play a flying pig. Dodge spikes, flying frying pans and farmers with pitchforks, and reach the big mud pile where the other pigs are waiting. Get hit and you turn into bacon.

**Play it:** https://chevtastic.github.io/When-Pigs-Fly/

## Controls

| Key | Action |
| --- | --- |
| Hold **Space** (or click / tap) | Fly up. Let go to fall |
| Hold **Shift** | Go faster |
| **P** / **Esc** | Pause |
| **R** | Restart level |
| **M** | Mute |

## Levels

1. **Muddy Meadow**: daytime warm-up
2. **Barnyard Bash**: sunset, faster farmers and more pans
3. **Midnight Pork Panic**: night, jumping farmers and zigzag towers

## Running locally

Plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser.

## Editing levels

Levels are defined near the top of `game.js` with short builder calls, for example:

```js
b.spikes(900, 3, 'floor', 45)        // x, count, 'floor' | 'ceil', height
 .tower(1850, 80, 170)               // hay bale topped with spikes
 .pan(2350, 260)                     // frying pan, meets the pig near x=2350 at height 260
 .farmer(2800, 160, 230, 2.2)        // x, min reach, max reach, jab period (s)
```
