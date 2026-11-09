# Level design rules

The rules for Pork-topia's vertical levels (`js/areas/city.js`; play any of them with `index.html?level=city-1` …
`city-6`). Follow these for every vertical level so players can rely on the same signals everywhere. The code that
enforces most of them lives in `js/vertical.js` (engine) and `js/hazards/city.js` (Pork-topia art and hazards).

## 0. Teach one plane at a time

An area introduces its planes one level at a time before mixing them:

| Level | Planes | How it's built |
| --- | --- | --- |
| 1 | street only | `top: 0` (a low ceiling), no subway: towers must be ridden through their tunnels |
| 2 | undercity only | `startY` in the cavern, a subway the whole way, no holes except the final wide exit |
| 3 | sky only | `startY` in the sky above a `smog` floor; the smog ends near the finish and you drop to the spa |
| 4 | all three, gentle | holes, decks, one bike chase, slow metro |
| 5 | all three, busier | both Enforcers, gunships |
| 6 | finale | everything, longest and fastest |

Introduce each hazard in a level where it's the only new thing (the gunship first appears in level 3 with plenty
of room around it).

## 1. Three levels of play, all running the whole level

| Plane | Where | What lives there |
| --- | --- | --- |
| **Sky** | above the rooftops, up to `level.top` | glass decks, billboards, drones, gunships, sky eggs |
| **Street** | the road, `y = GROUND` | buildings, tower tunnels, the bike Enforcer, hole gates |
| **Undercity** | a cavern under the street slab, down to `level.bottom` (`UNDER_FLOOR`) | standing + hanging undercity buildings, drones, gunships, the metro, rails |

- Every plane must be playable **from the first drop to the end**. A player who picks one plane and stays there
  should be able to finish (the undercity runs under the whole level; the street always has tunnels through towers).
- **The undercity is one screen tall**, like the street: the cavern under the 70 px slab is exactly as tall as the
  street level (`GROUND`, 470 px), so down there the camera sits still and it plays like a classic level. Undercity
  buildings are sized for that cavern (section 5).
- The undercity has its own look: grimy and brown. The street and sky are neon cyberpunk.
- Detailed art is only used for things you can hit. The background stays dark, simple silhouettes behind a haze,
  so scenery never gets mistaken for an obstacle.

## 2. Never force a plane

- **Holes** let you drop into the undercity or fly back up. Space them roughly every 1,200–1,500 px.
- **Tall towers get a street tunnel** through their ground floor (`bld(name, x, GROUND, TUNNEL)`), so the road
  keeps going. Leave at least ~400 px of open street before a tunnel so a player coming off a rooftop can drop back
  to road height in time.
- **Glass sky decks** (`block(..., 'deck')`) are one-way: fly up through them, land on them from above. Leave gaps so
  players can drop back down.
- **Rails are optional.** They only catch you if you drop onto them from above while not flying; flying hops you
  off; they never grab you from below or from the ground.
  - A rail must **never sit across a hole** (it would catch players dropping in and carry them off).
    `finishGeo()` warns in the console if one does.
  - A rail may **point at** a hole and end just before it. End it low enough that the pig clears the slab edge
    before rising (otherwise it bumps its head), and test it while boosting.

## 3. Holes always look the same

Use `hole(x)` with the standard width (`HOLE_W` = 290). Every hole automatically gets, in the same spots:

1. the **ENTRANCE gate** standing over it, one foot on each edge
2. the **UNDERCITY sign** right above the gate
3. the **STREET LEVEL sign** directly under it, in the undercity
4. glowing **hazard-striped edges** and a **light shaft**
5. a **coin trail** curving down into it

Only the final exit is different: a wide opening (`hole(x, 720, false, true, false)`) with just the STREET LEVEL
sign underneath.

## 4. Every hazard has a tell

| Hazard | Plane | Tell | Escape |
| --- | --- | --- | --- |
| Drone | sky or undercity | eye flashes red + "!" + three beeps (0.6 s), then charges | change height; it ignores you off its own plane |
| Gunship | sky or undercity | drifts toward your height with a dashed sight line, **stops and blinks solid for 0.7 s**, then fires straight ahead | change height while it blinks |
| Bike Enforcer | street only | red/blue edge flash "BOOST or ▲▼" + siren | BOOST, or leave the street for 0.8 s |
| Hovercar Enforcer | any | red/blue edge flash "BOOST" + siren | BOOST only |
| Metro | undercity | horn + flashing light + headlight glow at the right edge (1.2 s) | fly above the train (~120 px tall) |

- Drones and gunships hunt on the plane they're placed in: give them a `y` under the street to put them in the
  undercity. Put them in open stretches between buildings (not right under a hole), so there's room to dodge.
- A chase (Enforcer) should start **after** a hole exit, not just before one, so nobody has to boost through a hole.
- The metro runs in front of undercity buildings on the tracks; stop its range (`metro(x0, x1)`) before the exit ramp.

## 5. Sizes are fixed per asset

Each asset has one in-game size, set once in a table, and keeps it everywhere it's reused:

- Buildings: `BUILDINGS` in `js/hazards/city.js` (small shops ~170–180, mid-size 270–380, towers 620–820,
  undercity 265–285, hanging 185–260; metro 470 × 121).
- Billboards: `ADS` (Sky Living 560, Cortexa 470, HogFuel 480 wide).
- Drones, gunship, Enforcers, metro, signs: constants next to each hazard.

Hitboxes sit slightly inside the art so near misses are forgiven:
- Buildings use their traced outline (`CITY_PROFILES`, made by `tools/sprites.py`), ignoring thin antennas.
- Billboards collide on their panel only, never the chains or thrusters.
- Check them with `__pig.hitboxes = true` in the console.

## 6. Placement rules

- **Sky Living** always hangs from the very top of the map (`ad('sky', x)`); it exists to force players to fly down.
  Only its own chains show.
- **Cortexa / HogFuel** float anywhere in the sky. Keep ~70 px of clearance from tower spires and decks.
- **Undercity rhythm**: vary it. Mix two hanging in a row (stay low), two standing in a row (stay high), tight
  S-curves (leave ~250 px between an under and an over), single buildings and open stretches.
- A hanging building can't hang where there's a hole above it, and standing + hanging buildings can't share the same
  x (the gap between them is too small to fly through).
- **No coin within 46 px of an egg** (enforced automatically in `pruneCoins()`).

## 7. Eggs

- Three per level, usually one per plane.
- Check that **all three can be collected in one run**: from each egg there must be time to reach the next one,
  including diving from the sky to the undercity floor (allow ~500 px after a hole to dive all the way down) and
  climbing back up (glass decks block falling, so plan around them).

## 8. The ending funnels everyone to the mud spa, where the next level starts

**The spa sits on the plane the next level starts on**, so levels flow into each other. Set `spaY` on the level
(the height the spa sits at; default is the street):

| Next level starts in | This level ends with | `spaY` |
| --- | --- | --- |
| the street | undercity floor ramp up + sky ceiling ramp down to the street (the default) | `GROUND` |
| the undercity | the street drops into a wide opening and a `ceilramp(..., 'rubble')` eases you down to the cavern floor | `UNDER_FLOOR` |
| the skytops | a `ramp` up out of the undercity, then a `ramp(..., 'neon')` skyway up to a sky `pad` | the pad's top |

No plane may end in a wall. About 1,000 px before the spa, every plane is funnelled with ramps:
- **floor ramps** (`ramp`) lift the pig, **ceiling ramps** (`ceilramp`) push it down
- style `'rubble'` (girders and dirt) for anything going into or out of the undercity, `'neon'` (a lit skyway) for
  the sky
- coin lines run along them, and they never kill

Test the ending from every height (floor-hugging, mid-cavern, pinned to the top of the sky), with and without boost.

### Camera

The camera never shows above the level's ceiling (`level.top`). A street-only level (`top: 0`) stays locked on the
street, and the skytops never scroll past the top lane. Under a solid ceiling (the street slab, a building) it may
peek 40 px above it so you can see what you're under.

## 9. New art checklist

1. Drop the original into `assets/`.
2. Add it to `tools/sprites.py` and run `python tools/sprites.py`. The tool can remove a solid black backdrop
   (`key_black`) or a baked-in fake transparency checkerboard (`key_checker`), and flip art to face the right way
   (things coming at the pig face left).
3. Give it a fixed size (and a hitbox box or traced profile) in its table.
4. Play it with `python tools/serve.py` (a no-cache dev server, so edits always show up) at `index.html?level=<id>`.

## 10. Testing a level

- `await __pig.solve(level, { eggs: false })`: the bot proves the level can be finished.
- The bot's search is coarse, so for tight spots (diving to an egg, a rail exit) steer the pig with a short script
  instead of trusting a bot failure.
- `__pig.hitboxes = true` shows every building and billboard hitbox.
