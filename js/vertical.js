'use strict';
// Vertical levels: the camera follows the pig up onto rooftops and down into the subway.
//
// A level opts in with  vert: true, top: <world ceiling>, bottom: <world floor>  (y grows downward, the street
// is at GROUND). Ordinary levels never touch any of this: camY stays 0 and their ceiling/floor stay put.
//
// In a vertical level the world is made of SOLIDS. Like the ground, you can land on a solid's roof and slide
// along it, and you bump your head on its underside. Flying into its side wall is BACON.
//
// Builders (world coordinates):
//   tower(x, w, topY, botY = GROUND)   a building standing on the street (or on anything)
//   block(x, w, y, h, kind = 'board')  a floating solid: 'board' (billboard) or 'deck' (sky deck / walkway)
//   overpass(x0, x1, y)                an elevated highway overhead: the classic ceiling, at height y
//   subway(x0, x1)                     a tunnel under the street; the street above becomes a thin slab
//   hole(x, w = HOLE_W, down, up, trail)
//                                      an opening in the street slab down into the undercity. Every hole is
//                                      telegraphed the same way: hazard-striped glowing edges, a light shaft, the
//                                      ENTRANCE gate + UNDERCITY sign over it (down), the STREET LEVEL sign under it
//                                      (up) and (trail) a coin trail curving down into it.
//   rail(x0, y0, x1, y1)               neon boost rail (optional): drop onto it from above and you grind along it,
//                                      faster. Fly to hop off. It never grabs you from below or from the ground.
//   arrow(x, y, dir, label)            holo sign pointing at a path: dir = 'up' | 'down' | 'right'
//   ramp(x0, y0, x1, y1)               a sloped FLOOR that never kills: anything below the line is solid and just
//                                      pushes the pig up along it (use it to lift the undercity up to the street)
//   ceilramp(x0, y0, x1, y1)           a sloped CEILING that never kills: pushes the pig down along it (use it to
//                                      bring the sky back down to the street)
let camY = 0, showHitboxes = false;
let geo = { solids: [], subways: [], holes: [], rails: [], ramps: [] };
const SLAB = 70;            // street thickness above a subway
const PIG_T = 24, PIG_B = 22, PIG_F = 32, PIG_BK = 22; // pig's box: top, bottom, front, back (from its centre)
const RAIL_BOOST = 1.4, RAIL_LINGER = 0.35;
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

const geoOf = b => b.geo || (b.geo = { solids: [], subways: [], holes: [], rails: [], ramps: [] });
defineBuild('tower', (b, x, w, top, bot = GROUND) => geoOf(b).solids.push({ kind: 'tower', x, w, y: top, h: bot - top }));
defineBuild('block', (b, x, w, y, h, kind = 'board') => geoOf(b).solids.push({ kind, x, w, y, h }));
defineBuild('overpass', (b, x0, x1, y) => geoOf(b).solids.push({ kind: 'over', x: x0, w: x1 - x0, y: y - 1600, h: 1600 }));
defineBuild('subway', (b, x0, x1) => geoOf(b).subways.push([x0, x1]));
const HOLE_W = 290; // the standard hole width (the ENTRANCE gate's legs stand on its edges)
defineBuild('hole', (b, x, w = HOLE_W, down = true, up = true, trail = true) => {
  geoOf(b).holes.push([x, x + w]);
  b.add({ t: 'holesign', x: x - 140, w: w + 280, hx: x, hw: w, down, up }); // its signs are drawn in js/hazards/city.js
  if (trail) for (let i = 0; i < 6; i++) { const t = i / 5; b.item({ t: 'coin', x: x - 120 + t * (w * 0.5 + 120), y: GROUND - 90 + t * t * (SLAB + 230) }); }
});
defineBuild('rail', (b, x0, y0, x1, y1) => { const r = { t: 'rail', x: x0, w: x1 - x0, x0, y0, x1, y1 }; geoOf(b).rails.push(r); b.add(r); });
defineBuild('ramp', (b, x0, y0, x1, y1) => geoOf(b).ramps.push({ x0, y0, x1, y1, ceil: false }));
defineBuild('ceilramp', (b, x0, y0, x1, y1) => geoOf(b).ramps.push({ x0, y0, x1, y1, ceil: true }));
defineBuild('arrow', (b, x, y, dir = 'up', label = '') => b.add({ t: 'arrow', x: x - 80, w: 160, cx: x, y, dir, label }));

// Turns the builder's geometry into the solids the pig collides with: the street (solid earth, or a thin slab
// where a subway runs underneath, with gaps at the holes) plus every tower, block and overpass.
function finishGeo(b, L) {
  const g = geoOf(b), deep = L.bottom + 600;
  const xs = [...new Set([-800, L.end + 1600, ...g.subways.flat(), ...g.holes.flat()])].sort((a, c) => a - c);
  const street = [];
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], c = xs[i + 1], m = (a + c) / 2;
    const sub = g.subways.some(([s, e]) => m > s && m < e), hole = g.holes.some(([s, e]) => m > s && m < e);
    if (sub && hole) continue;
    street.push({ kind: sub ? 'slab' : 'street', x: a, w: c - a, y: GROUND, h: sub ? SLAB : deep - GROUND });
  }
  // rails can lead toward a hole but must never sit across one (they'd catch you and carry you off)
  for (const r of g.rails) for (const [s, e] of g.holes) if (r.x1 > s - 40 && r.x0 < e + 40) console.warn(`${L.id}: rail at ${r.x0}-${r.x1} crosses the hole at ${s}-${e}`);
  return { solids: street.concat(g.solids), subways: g.subways, holes: g.holes, rails: g.rails, ramps: g.ramps };
}

// Highest roof at or below y over world x (or the level floor)
function surfaceBelow(x, y) {
  let s = level.bottom ?? GROUND;
  for (const o of geo.solids) if (x >= o.x && x <= o.x + o.w && o.y >= y - 1 && o.y < s) s = o.y;
  return s;
}
// Lowest underside at or above y over world x (or the level ceiling)
function surfaceAbove(x, y) {
  let s = level.top ?? 0;
  for (const o of geo.solids) { const u = o.y + o.h; if (o.kind !== 'deck' && !o.nocam && x >= o.x && x <= o.x + o.w && u <= y + 1 && u > s) s = u; }
  return s;
}
const floorY = (x, y) => level.vert ? surfaceBelow(x, y) : GROUND;
const solidAt = (x, y) => geo.solids.some(o => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h);

// ---------- Rails ----------
const railY = (r, x) => r.y0 + (r.y1 - r.y0) * (x - r.x0) / (r.x1 - r.x0);
// Rails never grab you: you only ride one if you drop onto it from above (not flying), and flying hops you off.
function railStep(spd, dt, prevY) {
  pig.grind = Math.max(0, (pig.grind || 0) - dt);
  let on = null;
  for (const r of geo.rails) {
    if (keys.up || pig.x < r.x0 || pig.x > r.x1) continue;
    const ry = railY(r, pig.x), feet = pig.y + PIG_B, was = prevY + PIG_B;
    if (pig.rail === r || (pig.vy >= 0 && was <= ry + 3 && feet >= ry - 3)) { on = r; break; }
  }
  if (!on) { pig.rail = null; return; }
  if (pig.rail !== on) { sfx.boost(); shake = Math.max(shake, 2); }
  pig.rail = on; pig.grind = RAIL_LINGER;
  pig.y = railY(on, pig.x) - PIG_B;
  pig.vy = (on.y1 - on.y0) / (on.x1 - on.x0) * spd;
  pig.ground = true;
  if (Math.random() < dt * 50) particles.push({ x: pig.x - 8, y: pig.y + PIG_B, vx: rand(-260, -80), vy: rand(-160, -20), life: 0.3, max: 0.3, size: rand(1.5, 3), col: Math.random() < 0.5 ? '#7ff6ff' : '#fff', g: 600 });
}

// ---------- Solids ----------
// Returns 'wall' if the pig flew into a side wall, else pushes it onto roofs / off undersides.
function solidStep(prevY, wasGround) {
  const step = wasGround ? 40 : 12; // walking along a roof you step up small ledges; flying in, only near misses
  for (const o of geo.solids) {
    if (o.x > pig.x + PIG_F || o.x + o.w < pig.x - PIG_BK) continue;
    const top = pig.y - PIG_T, bot = pig.y + PIG_B;
    if (bot <= o.y || top >= o.y + o.h) continue;
    if (o.kind === 'deck') { // one-way: fly up through it from below, land on it from above
      if (prevY + PIG_B <= o.y + 8 && pig.vy >= 0) { pig.y = o.y - PIG_B; pig.vy = 0; pig.ground = true; }
      continue;
    }
    if (prevY + PIG_B <= o.y + step) { pig.y = o.y - PIG_B; pig.vy = Math.min(0, pig.vy); pig.ground = true; }
    else if (prevY - PIG_T >= o.y + o.h - 8) { pig.y = o.y + o.h + PIG_T; pig.vy = Math.max(0, pig.vy); }
    else if (pig.y + 15 > o.y && pig.y - 17 < o.y + o.h) return o.kind === 'hit' ? 'hit' : 'wall';
    else if (pig.y < o.y + o.h / 2) { pig.y = o.y - PIG_B; pig.vy = Math.min(0, pig.vy); pig.ground = true; } // grazed a corner
    else { pig.y = o.y + o.h + PIG_T; pig.vy = Math.max(0, pig.vy); }
  }
  return null;
}
CAUSE_QUIPS.wall = ['Walled it!', 'That building had right of way.', 'Concrete evidence of bacon.', 'Hog-splat!', 'Skyscraper: 1, Pig: 0.'];

// ---------- Ramps ----------
// Checked at the pig's middle and near its nose, so it rides up (or down) a ramp before its nose digs in.
const rampY = (r, x) => r.y0 + (r.y1 - r.y0) * (x - r.x0) / (r.x1 - r.x0);
function rampStep() {
  for (const r of geo.ramps) {
    let ry = null;
    for (const x of [pig.x, pig.x + PIG_F * 0.7]) {
      if (x < r.x0 || x > r.x1) continue;
      const y = rampY(r, x); ry = ry == null ? y : r.ceil ? Math.max(ry, y) : Math.min(ry, y);
    }
    if (ry == null) continue;
    if (!r.ceil && pig.y + PIG_B > ry) { pig.y = ry - PIG_B; pig.vy = Math.min(pig.vy, 0); pig.ground = true; }
    if (r.ceil && pig.y - PIG_T < ry) { pig.y = ry + PIG_T; pig.vy = Math.max(pig.vy, 0); }
  }
}
function drawRamp(r) {
  const a = r.x0 - camX, c = r.x1 - camX, far = r.ceil ? level.top - 900 : level.bottom + 500;
  ctx.beginPath(); ctx.moveTo(a, r.y0); ctx.lineTo(c, r.y1); ctx.lineTo(c, far); ctx.lineTo(a, far); ctx.closePath();
  ctx.save(); ctx.clip();
  if (r.ceil) { // a slanted neon megastructure leaning down toward the street, with rows of lit windows
    ctx.fillStyle = '#2a1f55'; ctx.fillRect(a, far - 10, c - a, 3000);
    ctx.fillStyle = 'rgba(0,229,255,0.35)';
    for (let wy = Math.floor((camY - 20) / 26) * 26; wy < camY + H; wy += 26) for (let wx = Math.ceil(r.x0 / 22) * 22; wx < r.x1; wx += 22)
      if (hash(wx * 1.7 + wy) > 0.55) ctx.fillRect(wx - camX, wy, 9, 11);
  } else { // a rubble-and-girder slope climbing out of the undercity
    ctx.fillStyle = '#4a3220'; ctx.fillRect(a, Math.min(r.y0, r.y1) - 10, c - a, 3000);
    ctx.strokeStyle = 'rgba(30,18,8,0.55)'; ctx.lineWidth = 6;
    for (let gx = Math.ceil(r.x0 / 90) * 90; gx < r.x1 + 600; gx += 90) line(gx - camX, Math.min(r.y0, r.y1), gx - camX - 400, Math.max(r.y0, r.y1) + 400);
  }
  ctx.restore();
  // the edge: a glowing guide strip with chevrons running along it toward the street
  const col = r.ceil ? '#ff4fd8' : '#ffd84a';
  ctx.save(); ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 14;
  ctx.strokeStyle = col; ctx.lineWidth = 5; line(a, r.y0, c, r.y1); ctx.restore();
  const len = Math.hypot(r.x1 - r.x0, r.y1 - r.y0), ang = Math.atan2(r.y1 - r.y0, r.x1 - r.x0);
  for (let d = mod(clock * 120, 70); d < len; d += 70) {
    const x = a + Math.cos(ang) * d, y = r.y0 + Math.sin(ang) * d + (r.ceil ? 16 : -16);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = col; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.moveTo(-6, -7); ctx.lineTo(4, 0); ctx.lineTo(-6, 7); ctx.lineTo(-2, 0); ctx.closePath(); ctx.fill(); ctx.restore();
  }
}

// ---------- Camera ----------
// Keeps the pig inside a band of the screen, leaning the way it's moving, never showing below the floor
// under it (or the floor just ahead) or far above the ceiling over it.
function camStep(dt) {
  if (!level.vert) { camY = 0; return; }
  let want;
  if (state === 'win') want = 0;
  else {
    const lead = clamp(pig.vy * 0.3, -150, 150), sy = pig.y + lead - camY;
    want = sy < 170 ? pig.y + lead - 170 : sy > 380 ? pig.y + lead - 380 : camY;
    // a wall coming up: tilt up so its roof is in view. A drop coming up: allow looking down into it.
    const ax = pig.x + 240, wall = geo.solids.find(o => o.kind !== 'deck' && ax >= o.x && ax <= o.x + o.w && pig.y >= o.y - PIG_B && pig.y <= o.y + o.h);
    if (wall && wall.y > (level.top ?? 0)) want = Math.min(want, wall.y - 160);
    const below = Math.max(surfaceBelow(pig.x, pig.y), wall ? 0 : surfaceBelow(pig.x + 180, pig.y));
    // something tall hanging in the sky (Sky Living) on screen: rise to show all of it, keeping the pig in view
    for (const o of objs) if (o.camTop != null && o.x < camX + W && o.x + o.w > camX && pig.y < 0) want = Math.max(Math.min(want, o.camTop), pig.y - 420);
    const lo = surfaceAbove(pig.x, pig.y) - 40, hi = below + 70 - H;
    want = lo > hi ? hi : clamp(want, lo, hi);
  }
  camY += (want - camY) * Math.min(1, dt * 6);
}

// ---------- Drawing ----------
const CITY_THEME = { city: true, skyTop: '#05031a', skyBot: '#4a1468' };
function drawSkyline(off, base, seed, cell, hMin, hMax, body, edge, lit) {
  const k0 = Math.floor(off / cell) - 1;
  for (let k = k0; k < k0 + W / cell + 3; k++) {
    const r = hash(k * 7 + seed), r2 = hash(k * 13 + seed), w = cell * (0.55 + r2 * 0.4), h = hMin + r * (hMax - hMin);
    const x = k * cell - off, y = base - h;
    ctx.fillStyle = body; ctx.fillRect(x, y, w, H - y + 10);
    if (r2 > 0.6) { ctx.fillRect(x + w / 2 - 2, y - 30, 4, 30); ctx.fillStyle = '#ff3b6b'; circle(x + w / 2, y - 31, 2.5); ctx.fill(); }
    ctx.fillStyle = edge; ctx.fillRect(x, y, w, 2);
    if (lit) {
      ctx.fillStyle = lit;
      for (let wy = y + 12; wy < Math.min(H, y + h); wy += 18) for (let wx = x + 8; wx < x + w - 8; wx += 14)
        if (hash(wx * 3.1 + wy * 7.7 + k) > 0.72) ctx.fillRect(wx, wy, 6, 8);
    }
  }
}
function drawCityBackground(cam) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#05031a'); g.addColorStop(0.55, '#1e0f4a'); g.addColorStop(1, '#4a1468');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const s of STARS) { ctx.globalAlpha = 0.4 + 0.4 * Math.sin(clock * 2 + s.p); ctx.fillStyle = '#fff'; circle(mod(s.x - cam * 0.02, W), mod(s.y - camY * 0.05, H), s.r); ctx.fill(); }
  ctx.globalAlpha = 1;
  // striped synthwave sun sinking behind the city
  const sy = 260 - camY * 0.12;
  ctx.save(); circle(720, sy, 90); ctx.clip();
  const sg = ctx.createLinearGradient(0, sy - 90, 0, sy + 90); sg.addColorStop(0, '#ffe14d'); sg.addColorStop(1, '#ff3b8d');
  ctx.fillStyle = sg; ctx.fillRect(620, sy - 90, 200, 180);
  ctx.fillStyle = '#1e0f4a'; for (let i = 0; i < 6; i++) ctx.fillRect(620, sy + 10 + i * 14, 200, 3 + i * 1.2);
  ctx.restore();
  drawSkyline(cam * 0.12, GROUND + 40 - camY * 0.25, 1, 80, 120, 300, '#170d36', 'rgba(255,79,216,0.18)', null);
  drawSkyline(cam * 0.3, GROUND + 70 - camY * 0.5, 2, 110, 140, 380, '#0d0722', 'rgba(0,229,255,0.12)', 'rgba(255,214,102,0.22)');
  ctx.fillStyle = 'rgba(8,4,24,0.35)'; ctx.fillRect(0, 0, W, H); // haze: the background sits back, the play layer pops
}
const NEON = ['#00e5ff', '#ff4fd8', '#7dff6a', '#ffd84a'];
const BOARD_TEXT = ['PIGTECH', 'OINKCORP', 'SNOUTCOLA', 'HAMAZON', 'TRUFFL OS', 'SWINE.NET'];
function drawSolid(o) {
  const x = o.x - camX, n = Math.floor(hash(o.x * 0.37 + o.y) * 4);
  if (o.kind === 'smog') return; // drawn by its 'smog' hazard, in front of the towers
  if (o.kind === 'hit') { // a building's hitbox: the building art is drawn by its 'bld' hazard
    if (showHitboxes) { ctx.strokeStyle = '#ff2050'; ctx.lineWidth = 2; ctx.strokeRect(x, o.y, o.w, o.h); }
    return;
  }
  const vy0 = Math.max(o.y, camY - 20), vy1 = Math.min(o.y + o.h, camY + H + 20); // only the visible part
  if (o.kind === 'street' || o.kind === 'slab') {
    ctx.fillStyle = '#150d29'; ctx.fillRect(x, vy0, o.w, vy1 - vy0);
    ctx.fillStyle = '#2b2347'; ctx.fillRect(x, o.y, o.w, 16);
    ctx.fillStyle = '#ffd84a'; for (let lx = Math.ceil(o.x / 80) * 80; lx < o.x + o.w - 30; lx += 80) ctx.fillRect(lx - camX, o.y + 7, 34, 3);
    ctx.fillStyle = '#00e5ff'; ctx.fillRect(x, o.y, o.w, 3);
    if (o.kind === 'slab') {
      ctx.fillStyle = '#4a2f18'; ctx.fillRect(x, o.y + o.h - 14, o.w, 14); // rusty underside
      ctx.fillStyle = '#2a1a0c'; for (let lx = Math.ceil(o.x / 40) * 40; lx < o.x + o.w - 4; lx += 40) { circle(lx - camX, o.y + o.h - 7, 2.5); ctx.fill(); }
    } else { ctx.fillStyle = 'rgba(0,229,255,0.07)'; for (let ly = o.y + 40; ly < vy1; ly += 40) ctx.fillRect(x, ly, o.w, 2); }
  } else if (o.kind === 'over') {
    const b = o.y + o.h;
    ctx.fillStyle = '#241b3d'; ctx.fillRect(x, vy0, o.w, b - vy0);
    ctx.fillStyle = '#3a2f5c'; ctx.fillRect(x, b - 22, o.w, 12);
    ctx.fillStyle = '#ff4fd8'; ctx.fillRect(x, b - 4, o.w, 4);
    for (let lx = Math.ceil(o.x / 120) * 120; lx < o.x + o.w; lx += 120) { ctx.fillStyle = 'rgba(255,240,180,0.18)'; ctx.beginPath(); ctx.moveTo(lx - camX - 8, b); ctx.lineTo(lx - camX + 8, b); ctx.lineTo(lx - camX + 40, b + 90); ctx.lineTo(lx - camX - 40, b + 90); ctx.closePath(); ctx.fill(); }
  } else if (o.kind === 'tower') {
    const col = NEON[n];
    const tg = ctx.createLinearGradient(x, 0, x + o.w, 0); tg.addColorStop(0, '#3a2a6e'); tg.addColorStop(1, '#24184a');
    ctx.fillStyle = tg; ctx.fillRect(x, vy0, o.w, vy1 - vy0);
    ctx.fillStyle = col; ctx.globalAlpha = 0.55;
    for (let wy = o.y + 22; wy < vy1 - 10; wy += 26) for (let wx = x + 12; wx < x + o.w - 16; wx += 22) if (wy > vy0 && hash(wx + o.x + wy * 1.3) > 0.55) ctx.fillRect(wx, wy, 10, 12);
    ctx.globalAlpha = 1;
    ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.strokeRect(x + 2, o.y + 2, o.w - 4, o.h - 4); ctx.restore();
    if (o.y + o.h < GROUND - 5 && !solidAt(o.x + o.w / 2, o.y + o.h + 4)) { // hover building: thrusters underneath
      const b = o.y + o.h;
      for (const tx of [x + 30, x + o.w - 30]) {
        ctx.fillStyle = '#5a4a8a'; ctx.fillRect(tx - 12, b, 24, 10);
        const f = 16 + Math.sin(clock * 30 + tx) * 5;
        ctx.fillStyle = 'rgba(0,229,255,0.7)'; ellipse(tx, b + 12 + f / 2, 8, f / 2 + 4); ctx.fill();
        ctx.fillStyle = '#fff'; ellipse(tx, b + 14, 4, 5); ctx.fill();
      }
    }
    ctx.fillStyle = '#7dff6a'; ctx.fillRect(x - 3, o.y - 3, o.w + 6, 6); // the roof: safe to land on
  } else if (o.kind === 'deck') {
    // a glass walkway: see-through and dashed underneath, because you can fly up through it
    ctx.fillStyle = 'rgba(125,255,106,0.14)'; ctx.fillRect(x, o.y, o.w, o.h);
    ctx.fillStyle = '#7dff6a'; ctx.fillRect(x - 3, o.y - 3, o.w + 6, 6);
    ctx.fillStyle = 'rgba(125,255,106,0.55)'; for (let lx = Math.ceil(o.x / 28) * 28; lx < o.x + o.w - 10; lx += 28) ctx.fillRect(lx - camX, o.y + o.h - 3, 14, 3);
    ctx.fillStyle = 'rgba(125,255,106,0.35)'; for (let lx = Math.ceil(o.x / 90) * 90; lx < o.x + o.w; lx += 90) ctx.fillRect(lx - camX, o.y, 2, o.h);
  } else { // billboard
    const col = NEON[(n + 1) % 4], on = Math.sin(clock * 9 + o.x) > -0.95;
    ctx.fillStyle = '#120a26'; ctx.fillRect(x, o.y, o.w, o.h);
    ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = on ? 14 : 0;
    ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.strokeRect(x + 2, o.y + 2, o.w - 4, o.h - 4); ctx.restore();
    if (on) text(BOARD_TEXT[Math.floor(hash(o.x) * BOARD_TEXT.length)], x + o.w / 2, o.y + o.h / 2, Math.min(30, o.h * 0.45, o.w / 6), col, 'center', '#120a26');
    ctx.fillStyle = '#7dff6a'; ctx.fillRect(x - 3, o.y - 3, o.w + 6, 6);
  }
}
function drawTunnels() {
  for (const [a, c] of geo.subways) if (c >= camX - 40 && a <= camX + W + 40) drawCavern(a, c);
}
// A hole's light shaft and hazard-striped edges, so you can spot it from the street and from below
function drawHole(a, c) {
  const x = a - camX, w = c - a, top = GROUND - 140, bot = GROUND + SLAB + 260;
  const g = ctx.createLinearGradient(0, bot, 0, top);
  const p = 0.16 + 0.06 * Math.sin(clock * 3 + a);
  g.addColorStop(0, 'rgba(255,190,90,0)'); g.addColorStop(0.45, `rgba(255,200,110,${p})`); g.addColorStop(1, 'rgba(255,200,110,0)');
  ctx.fillStyle = g; ctx.fillRect(x + 6, top, w - 12, bot - top);
  for (const ex of [x - 12, x + w]) {
    ctx.save(); ctx.beginPath(); ctx.rect(ex, GROUND, 12, SLAB); ctx.clip();
    ctx.fillStyle = '#ffd84a'; ctx.fillRect(ex, GROUND, 12, SLAB);
    ctx.fillStyle = '#1a1208'; for (let k = -2; k < SLAB / 10 + 2; k++) { ctx.beginPath(); ctx.moveTo(ex, GROUND + k * 14); ctx.lineTo(ex + 12, GROUND + k * 14 - 8); ctx.lineTo(ex + 12, GROUND + k * 14 - 1); ctx.lineTo(ex, GROUND + k * 14 + 7); ctx.fill(); }
    ctx.restore();
  }
  ctx.save(); ctx.shadowColor = '#ffd84a'; ctx.shadowBlur = 12; ctx.fillStyle = '#ffe98a';
  ctx.fillRect(x - 12, GROUND - 2, 12, 4); ctx.fillRect(x + w, GROUND - 2, 12, 4); ctx.restore();
}
function drawVertWorld() {
  drawTunnels();
  for (const o of geo.solids) {
    if (o.x + o.w < camX - 40 || o.x > camX + W + 40 || o.y > camY + H + 20 || o.y + o.h < camY - 20) continue;
    drawSolid(o);
  }
  for (const [a, c] of geo.holes) if (c >= camX - 60 && a <= camX + W + 60) drawHole(a, c);
  for (const r of geo.ramps) if (r.x1 >= camX - 40 && r.x0 <= camX + W + 40) drawRamp(r);
  for (const o of objs) if (HAZARDS[o.t].under) HAZARDS[o.t].draw(o); // hazards drawn behind the buildings (none use this yet)
}

defineHazard('rail', {
  hits: () => false,
  draw(o) {
    const ax = o.x0 - camX, bx = o.x1 - camX;
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = '#3a2f5c'; ctx.lineWidth = 4;
    for (let px = o.x0 + 40; px < o.x1 - 20; px += 110) { const py = railY(o, px); line(px - camX, py, px - camX, py + 26); }
    ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 16;
    ctx.strokeStyle = '#38f0ff'; ctx.lineWidth = 6; line(ax, o.y0, bx, o.y1);
    ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; line(ax, o.y0, bx, o.y1);
    for (let k = 0; k < 3; k++) { // pulses running up the rail
      const t = mod(clock * 0.9 + k / 3, 1), px = o.x0 + (o.x1 - o.x0) * t;
      ctx.fillStyle = '#fff'; circle(px - camX, railY(o, px), 4); ctx.fill();
    }
    ctx.restore();
  },
});
defineHazard('arrow', {
  hits: () => false,
  draw(o) {
    const x = o.cx - camX, y = o.y, col = { up: '#00e5ff', down: '#ff4fd8', right: '#ffd84a' }[o.dir];
    const glyph = { up: '▲', down: '▼', right: '►' }[o.dir], on = Math.sin(clock * 7 + o.x) > -0.9;
    ctx.save(); ctx.globalAlpha = on ? 0.95 : 0.5;
    ctx.fillStyle = 'rgba(10,6,30,0.75)'; rrect(x - 78, y - 26, 156, 52, 10); ctx.fill();
    ctx.shadowColor = col; ctx.shadowBlur = 12; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke(); ctx.shadowBlur = 0;
    const bob = Math.sin(clock * 5) * 3 * (o.dir === 'up' ? -1 : o.dir === 'down' ? 1 : 0);
    text(glyph, x - 52, y + bob, 24, col, 'center', 'rgba(0,0,0,0)');
    text(o.label, x + 14, y, 18, '#fff', 'center', '#120a26');
    ctx.restore();
  },
});
