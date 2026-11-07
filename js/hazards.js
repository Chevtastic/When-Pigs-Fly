'use strict';
// Hazards and the level builder.
//
// Adding a new hazard = one defineBuild() (how levels place it) + one defineHazard() (how it behaves).
// Nothing else in the game needs to change. A hazard object needs:
//   t      its type name (matches defineHazard)
//   x, w   world x and width (used for culling)
//   reach  optional extra distance it can swing/move past x (used for culling and collision range)
// defineHazard(type, {
//   hits(o, cx, cy, r)  -> true if a circle at (cx,cy) radius r touches it   (required)
//   draw(o)             -> draws it at o.x - camX                            (required)
//   back: true          -> drawn behind the other hazards (scenery)          (optional)
//   update(o, dt)       -> moves it, if it moves on its own                  (optional)
//   blocksCoin(o, coin) -> true if a coin placed here would be unreachable   (optional)
//   quips: [...]        -> death lines when this hazard turns you into bacon (optional)
// })
// Hazards can read levelT (seconds into the attempt), camX, pig and keys.

// Area files (js/areas/*.js) register themselves here; world.js finishes the list.
const AREAS = [];
function addArea(a) { AREAS.push(a); }

const HAZARDS = {};
function defineHazard(t, def) { HAZARDS[t] = def; if (def.quips) CAUSE_QUIPS[t] = def.quips; }
const BUILD = {};
// fn(b, ...args) adds things to the level via b.add(obj) / b.item(obj)
function defineBuild(name, fn) { BUILD[name] = fn; }

function builder(speed) {
  const objs = [], items = [];
  let eggs = 0;
  const b = {
    speed, objs, items,
    add(o) { objs.push(o); return b; },
    item(it) { if (it.t === 'egg') it.id = eggs++; items.push(it); return b; },
  };
  for (const name in BUILD) b[name] = (...args) => { BUILD[name](b, ...args); return b; };
  return b;
}
const hits = (o, cx, cy, r) => HAZARDS[o.t].hits(o, cx, cy, r);

// ---------- Collectibles ----------
defineBuild('coins', (b, x, y, n = 5, dy = 0, gap = 40) => { for (let i = 0; i < n; i++) b.item({ t: 'coin', x: x + i * gap, y: y + i * dy }); });
defineBuild('arc', (b, x, y, n, h, gap = 40) => { for (let i = 0; i < n; i++) b.item({ t: 'coin', x: x + i * gap, y: y - Math.sin(Math.PI * i / (n - 1)) * h }); });
defineBuild('egg', (b, x, y) => b.item({ t: 'egg', x, y }));
