'use strict';
// Pork-topia hazards: street buildings, undercity buildings, the undercity cavern and the Corpo Pig Enforcer.
// The vertical-level engine (solids, rails, camera) is in js/vertical.js.
//
//   bld(name, x, base = GROUND)    a building from BUILDINGS with its left edge at x, standing on `base`
//                                  (GROUND for the street, the level's bottom for the undercity floor)
//   bld(name, x, GROUND, pass)     ...with a street tunnel `pass` px tall through its ground floor, so you can keep
//                                  riding the road underneath (use on the towers)
//   hang(name, x, ceil)            an h_ building hanging from the undercity ceiling (default: under the street slab)
//   enforcer(x, until, mult, lead, car)
//                                  the Corpo Pig Enforcer: when you pass x he comes up behind you, `lead` px back, at
//                                  `mult` x the level speed, until `until`. On his hoverbike (car = false) he only
//                                  patrols the street: outrun him with BOOST, or shake him by flying up into the sky
//                                  or down into the undercity. In the hovercar (car = true) he follows you anywhere,
//                                  so only BOOST loses him.
//   drone(x, y)                    a robot drone waiting in the sky (or in the undercity, if y is under the street).
//                                  If you're on its plane when you get near, its eye flashes, then it charges at you
//                                  (steering a little). Off its plane it just hovers.
//   ad(kind, x, y)                 a solid billboard in the sky: 'sky' (Sky Living) hangs on its chains from the very
//                                  top of the map (y is ignored), forcing you to fly under it; 'cortexa' and 'hogfuel'
//                                  float on thrusters with their top at y, anywhere in the sky.
//   gunship(x, y)                  a robot with a laser (sky or undercity): if you're on its plane it drifts toward your height with a
//                                  sight line, stops, blinks, fires straight ahead, then flies on past.
//   metro(x0, x1, every)           undercity trains along the tracks (see below)
//   smog(x0, x1, y)                a glowing smog bank you can slide on, hiding the street below (sky-only levels)
// Every hole (hole() in vertical.js) gets the same signs in the same places: the ENTRANCE gate standing over it with
// a foot on each edge, the UNDERCITY sign right above the gate, and the STREET LEVEL sign under it in the undercity.

// ---------- Buildings ----------
// One fixed size per building (h in px; width follows the art). The hitbox follows the building's top edge
// (CITY_PROFILES, made by tools/sprites.py), sitting a little inside the art so near misses are forgiven.
const BUILDINGS = {
  // small shops: hop over them (about 3 pigs tall)
  b_ramen: { h: 170, ar: 540 / 498 },
  b_nexus: { h: 180, ar: 516 / 498 },
  // mid-size: about as tall as the street level
  b_dome: { h: 270, ar: 764 / 497 },
  b_arcology: { h: 330, ar: 576 / 633 },
  b_megacorp: { h: 380, ar: 600 / 642 },
  // towers: up into the sky level
  b_pigcorp: { h: 620, ar: 508 / 707 },
  b_fox: { h: 660, ar: 448 / 681 },
  b_skyscraper: { h: 720, ar: 437 / 741 },
  b_corptower: { h: 740, ar: 467 / 708 },
  b_orion: { h: 820, ar: 309 / 757 },
  // the undercity
  u_market: { h: 265, ar: 584 / 657 },
  u_facade: { h: 285, ar: 596 / 652 },
  // hanging from the undercity ceiling (hitbox follows their bottom edge)
  h_platform: { h: 185, ar: 768 / 511, hang: true },
  h_market: { h: 245, ar: 596 / 650, hang: true },
  h_industrial: { h: 260, ar: 550 / 698, hang: true },
};
for (const n in BUILDINGS) {
  BUILDINGS[n].w = Math.round(BUILDINGS[n].h * BUILDINGS[n].ar);
  const im = new Image(); im.src = `assets/sprites/${n}.png`; SPR[n] = im;
}
for (const n of ['cop', 'copcar', 'drone', 'gunship', 'metro', 'ad_sky', 'ad_cortexa', 'ad_hogfuel', 'sign_gate', 'sign_under', 'sign_street']) { const im = new Image(); im.src = `assets/sprites/${n}.png`; SPR[n] = im; }

// Standing buildings: base is the ground under them, each column reaches up to its top edge.
// Hanging ones: base is the ceiling above them, each column reaches down to its bottom edge.
function buildingRects(name, x, base, pass = 0) {
  const B = BUILDINGS[name], prof = CITY_PROFILES[name], cw = B.w / prof.length;
  const cols = []; // `edge` = the column's free end (its top, or its bottom when hanging), pulled in 6px
  prof.forEach((t, i) => {
    if (B.hang ? t > 0.05 : t < 0.95) cols.push({ x0: x + i * cw, x1: x + (i + 1) * cw, edge: B.hang ? base + B.h * t - 6 : base - B.h * (1 - t) + 6 });
  });
  cols[0].x0 += cw * 0.35; cols[cols.length - 1].x1 -= cw * 0.35;
  const rects = [];
  for (const c of cols) { // join neighbouring columns that reach about as far, keeping the shorter (forgiving)
    const last = rects[rects.length - 1];
    if (last && Math.abs(last.edge - c.edge) <= 14) { last.x1 = c.x1; last.edge = B.hang ? Math.min(last.edge, c.edge) : Math.max(last.edge, c.edge); }
    else rects.push({ ...c });
  }
  const floor = base - pass; // a street tunnel leaves the bottom `pass` px open
  return rects.map(r => B.hang ? { kind: 'hit', x: r.x0, w: r.x1 - r.x0, y: base, h: r.edge - base }
    : { kind: 'hit', x: r.x0, w: r.x1 - r.x0, y: r.edge, h: floor - r.edge }).filter(r => r.h > 12);
}
defineBuild('bld', (b, name, x, base = GROUND, pass = 0) => {
  const B = BUILDINGS[name];
  const rects = buildingRects(name, x, base, pass);
  geoOf(b).solids.push(...rects);
  b.add({ t: 'bld', x, w: B.w, name, base, rects, pass });
});
// The street tunnel through a tower's ground floor: a lit arcade with a neon frame
function drawPassage(o, B) {
  const x = o.x - camX, top = o.base - o.pass, w = B.w;
  const g = ctx.createLinearGradient(0, top, 0, o.base);
  g.addColorStop(0, '#05030e'); g.addColorStop(1, '#1d1238');
  ctx.fillStyle = g; ctx.fillRect(x, top, w, o.pass);
  ctx.fillStyle = '#2b2347'; ctx.fillRect(x, top - 10, w, 12); // the lintel
  ctx.save(); ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 14; ctx.fillStyle = '#38f0ff';
  ctx.fillRect(x, top + 2, w, 3);
  ctx.fillStyle = '#ff4fd8'; ctx.shadowColor = '#ff4fd8'; ctx.fillRect(x, top + 2, 4, o.pass - 2); ctx.fillRect(x + w - 4, top + 2, 4, o.pass - 2);
  ctx.restore();
  ctx.fillStyle = 'rgba(255,240,180,0.9)';
  for (let lx = x + 24; lx < x + w - 20; lx += 46) ctx.fillRect(lx, top + 8, 18, 3);
  ctx.fillStyle = 'rgba(255,240,180,0.07)';
  for (let lx = x + 24; lx < x + w - 20; lx += 46) { ctx.beginPath(); ctx.moveTo(lx, top + 11); ctx.lineTo(lx + 18, top + 11); ctx.lineTo(lx + 34, o.base); ctx.lineTo(lx - 16, o.base); ctx.closePath(); ctx.fill(); }
}
defineBuild('hang', (b, name, x, ceil = GROUND + SLAB) => b.bld(name, x, ceil));
defineHazard('bld', {
  back: true,
  hits: () => false, // the solids from buildingRects() do the colliding
  draw(o) {
    const B = BUILDINGS[o.name], im = spr(o.name), y = B.hang ? o.base : o.base - B.h;
    if (y > camY + H || y + B.h < camY) return;
    if (im) drawSpr(im, o.x - camX, y, B.w, B.h);
    else { ctx.fillStyle = '#2a1f55'; ctx.fillRect(o.x - camX, y, B.w, B.h); }
    if (o.pass) drawPassage(o, B);
    if (showHitboxes) { ctx.strokeStyle = '#ff2050'; ctx.lineWidth = 2; for (const r of o.rects) ctx.strokeRect(r.x - camX, r.y, r.w, r.h); }
  },
});
CAUSE_QUIPS.hit = ['Walled it!', 'That building had right of way.', 'Concrete evidence of bacon.', 'Hog-splat!', 'Skyscraper: 1, Pig: 0.', 'Zoning violation.'];

// ---------- The undercity cavern (grimy and brown, under the street) ----------
function drawCavern(a, c) {
  const x = a - camX, w = c - a, top = GROUND + SLAB, bot = level.bottom;
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, '#2a1a0e'); g.addColorStop(0.5, '#3b2715'); g.addColorStop(1, '#1e1209');
  ctx.fillStyle = g; ctx.fillRect(x, top, w, bot - top);
  // rock blotches
  for (let k = Math.ceil(a / 90); k * 90 < c; k++) for (let j = 0; j < 8; j++) {
    const r = hash(k * 31 + j * 7), bx = k * 90 + r * 80, by = top + 40 + j * (bot - top - 60) / 8 + hash(k + j * 13) * 50;
    if (by < camY - 40 || by > camY + H + 40) continue;
    ctx.fillStyle = r > 0.5 ? 'rgba(20,12,6,0.45)' : 'rgba(90,62,34,0.35)'; ellipse(bx - camX, by, 18 + r * 26, 8 + r * 10); ctx.fill();
  }
  // rusty pipes along the ceiling, with a few drips of green slime
  ctx.fillStyle = '#5c3b1f'; ctx.fillRect(x, top + 26, w, 16); ctx.fillRect(x, top + 52, w, 9);
  ctx.fillStyle = '#7a5130'; ctx.fillRect(x, top + 28, w, 4);
  ctx.fillStyle = '#3a2412'; for (let px = Math.ceil(a / 160) * 160; px < c; px += 160) ctx.fillRect(px - camX, top + 22, 10, 24);
  for (let px = Math.ceil(a / 520) * 520 + 90; px < c; px += 520) {
    const t = mod(clock * 0.8 + px * 0.01, 1.6);
    ctx.fillStyle = '#8bd13a'; ellipse(px - camX, top + 46, 4, 5); ctx.fill();
    if (t < 1) { ellipse(px - camX, top + 46 + t * 200, 3, 5); ctx.fill(); }
  }
  // dim lamps hanging off the ceiling
  for (let lx = Math.ceil(a / 340) * 340 + 170; lx < c; lx += 340) {
    const sx = lx - camX, sw = Math.sin(clock * 1.4 + lx) * 4;
    ctx.strokeStyle = '#1a0f07'; ctx.lineWidth = 2; line(sx, top, sx + sw, top + 90);
    const lg = ctx.createRadialGradient(sx + sw, top + 96, 2, sx + sw, top + 96, 120);
    lg.addColorStop(0, 'rgba(255,190,90,0.45)'); lg.addColorStop(1, 'rgba(255,190,90,0)');
    ctx.fillStyle = lg; circle(sx + sw, top + 96, 120); ctx.fill();
    ctx.fillStyle = '#ffcf7a'; circle(sx + sw, top + 96, 6); ctx.fill();
  }
  // muddy floor and the old rail tracks
  ctx.fillStyle = '#2a1c10'; ctx.fillRect(x, bot, w, 400);
  ctx.fillStyle = '#4a3420'; ctx.fillRect(x, bot, w, 6);
  ctx.fillStyle = '#3d2a1a'; for (let lx = Math.ceil(a / 30) * 30; lx < c; lx += 30) ctx.fillRect(lx - camX, bot + 10, 9, 22);
  ctx.fillStyle = '#8a7a66'; ctx.fillRect(x, bot + 12, w, 3); ctx.fillRect(x, bot + 27, w, 3);
}

// ---------- Corpo Pig Enforcer ----------
const COP_W = 240, COP_H = 120;          // hoverbike: fixed size (art is 2:1)
const CAR_W = 270, CAR_H = 139;          // hovercar
const COP_MIN = 40 + COP_H / 2, COP_MAX = GROUND - COP_H / 2 + 6; // his patrol band: the street level only
const COP_LOSE = 0.8;                    // seconds off the street before he loses you
defineBuild('enforcer', (b, x, until, mult = 1.22, lead = 420, car = false) =>
  b.add({ t: 'cop', x, w: 0, reach: 1e6, start: x, until, mult, lead, car, front: null, y: COP_MAX, off: 0, gone: 0, lost: false, wail: 0 }));
const copSize = o => o.car ? [CAR_W, CAR_H] : [COP_W, COP_H];
const offStreet = () => pig.y < -10 || pig.y > GROUND + 10;
defineHazard('cop', {
  update(o, dt) {
    if (o.front == null) { if (pig.x >= o.start) { o.front = pig.x - o.lead; o.x = o.front; sfx.siren(true, 0.5); } return; }
    if (o.gone > 0 || o.front >= o.until) { // peeling off: up and away
      if (o.gone === 0) o.gone = 0.001;
      o.gone = Math.min(1, o.gone + dt * 0.8); o.y -= 420 * dt; o.front += level.speed * 1.6 * dt; o.x = o.front;
      return;
    }
    o.front += level.speed * o.mult * dt; o.x = o.front;
    // he steers toward your height, but only within the street level, and not instantly
    const want = o.car ? clamp(pig.y, level.top + 80, level.bottom - CAR_H / 2) : clamp(pig.y, COP_MIN, COP_MAX);
    const steer = o.car ? 300 : 260;
    o.y += clamp(want - o.y, -steer * dt, steer * dt);
    const gap = pig.x - o.front;
    // shaken off: you left the street long enough, or got far enough ahead
    o.off = !o.car && offStreet() ? o.off + dt : 0;
    if (o.off > COP_LOSE || gap > 900) { o.lost = true; o.gone = 0.001; popText(pick(['LOST HIM!', 'SHAKEN!', 'BYE, COPPER!']), pig.x + 40, pig.y - 50, '#7dff6a', 30); sfx.siren(false, 0.4); return; }
    o.wail -= dt;
    if (o.wail <= 0) { o.wail = 0.42; o.hi = !o.hi; sfx.siren(o.hi, clamp(1 - (gap - 100) / 700, 0.15, 1)); }
  },
  hits(o, cx, cy, r) {
    if (o.front == null || o.gone !== 0) return false;
    const [w, h] = copSize(o);
    return circRect(cx, cy, r, o.front - w * 0.8, o.y - h * 0.3, w * 0.72, h * 0.6);
  },
  draw(o) {
    if (o.front == null || o.gone >= 1) return;
    const fx = o.front - camX, flash = Math.floor(clock * 8) % 2;
    if (fx < 0 && o.gone === 0) { // still behind the screen: warn at the left edge
      const near = clamp(1 - (camX - o.front) / 500, 0, 1), sy = clamp(o.y, camY + 60, camY + H - 60);
      const g = ctx.createLinearGradient(camX - camX, 0, 110, 0);
      g.addColorStop(0, flash ? `rgba(255,40,70,${0.3 + 0.4 * near})` : `rgba(40,120,255,${0.3 + 0.4 * near})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, camY, 110, H);
      text('🚨', 36, sy - 30, 34, '#fff', 'center', 'rgba(0,0,0,0)');
      text('BOOST', 50, sy + 6, 18 + near * 4, '#ffe14d', 'center', '#120a26');
      if (!o.car && (geo.subways.length || level.top < -100)) text('or ▲▼', 50, sy + 30, 16, '#fff', 'center', '#120a26');
      return;
    }
    ctx.save(); ctx.globalAlpha = 1 - o.gone;
    const [cw, ch] = copSize(o), im = spr(o.car ? 'copcar' : 'cop'), x = o.front - cw - camX, y = o.y - ch / 2;
    const lx = x + cw * (o.car ? 0.2 : 0.55), ly = y + (o.car ? 8 : 10); // siren glow
    const sg = ctx.createRadialGradient(lx, ly, 4, lx, ly, 70);
    sg.addColorStop(0, flash ? 'rgba(255,40,70,0.75)' : 'rgba(40,120,255,0.75)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg; circle(lx, ly, 70); ctx.fill();
    if (im) drawSpr(im, x, y, cw, ch);
    else { ctx.fillStyle = '#c0392b'; ctx.fillRect(x, y + 30, cw, ch - 40); }
    ctx.restore();
  },
  quips: ['Busted!', 'You have the right to remain crispy.', 'Pork Patrol: 1, Pig: 0.', 'Hogcuffed!', 'Ticketed to the frying pan.'],
});


// ---------- Robot drone (sky or undercity) ----------
// A drone (or gunship) hunts on the plane it's placed in: the sky, or the undercity if you put it under the street.
const DRONE_W = 150, DRONE_H = 90, DRONE_R = 32;
defineBuild('drone', (b, x, y) => b.add({ t: 'drone', x, w: DRONE_W, y, y0: y, under: y > GROUND + SLAB, st: 'idle', tell: 0 }));
const inSky = () => pig.y < -20;
const onPlane = o => o.under ? pig.y > GROUND + SLAB : inSky(); // is the pig on this robot's plane?
defineHazard('drone', {
  update(o, dt) {
    if (o.st === 'idle') {
      o.y = o.y0 + Math.sin(clock * 2.2 + o.x) * 8;
      if (onPlane(o) && o.x > pig.x && o.x - pig.x < 820) { o.st = 'tell'; o.tell = 0.6; sfx.lock(); }
    } else if (o.st === 'tell') {
      o.tell -= dt; if (o.tell <= 0) o.st = 'charge';
    } else {
      o.x -= 430 * dt;
      if (o.x > pig.x) o.y += clamp(pig.y - o.y, -170 * dt, 170 * dt); // steers at you until it passes you
    }
  },
  hits(o, cx, cy, r) { const dx = cx - (o.x + DRONE_W / 2), dy = cy - o.y; return dx * dx + dy * dy < (r + DRONE_R) * (r + DRONE_R); },
  blocksCoin: (o, it) => Math.abs(it.x - (o.x + DRONE_W / 2)) < 70 && Math.abs(it.y - o.y) < 60,
  draw(o) {
    const x = o.x - camX, im = spr('drone');
    if (im) drawSpr(im, x, o.y - DRONE_H / 2, DRONE_W, DRONE_H);
    else { ctx.fillStyle = '#6b6f8a'; circle(x + DRONE_W / 2, o.y, DRONE_R); ctx.fill(); }
    if (o.st !== 'idle') { // the tell: its eye flares red, then stays lit while it charges
      const on = o.st === 'charge' || Math.floor(o.tell * 12) % 2 === 0;
      if (on) {
        const ex = x + DRONE_W * 0.42, ey = o.y + DRONE_H * 0.12;
        const g = ctx.createRadialGradient(ex, ey, 2, ex, ey, 40);
        g.addColorStop(0, 'rgba(255,40,60,0.95)'); g.addColorStop(1, 'rgba(255,40,60,0)');
        ctx.fillStyle = g; circle(ex, ey, 40); ctx.fill();
      }
      if (o.st === 'tell') text('!', x + DRONE_W / 2, o.y - DRONE_H / 2 - 14, 30, '#ff3b4d', 'center', '#120a26');
    }
  },
  quips: ['Droned!', 'Robo-roasted.', 'Error 404: pig not found.', 'Drone and dusted.', 'Beep boop, you are soup.'],
});

// ---------- Sky billboards (solid) ----------
// Each has a fixed size; the hitbox is its panel (not the chains or thrusters).
const ADS = {
  sky: { img: 'ad_sky', w: 560, h: 315, box: [0.06, 0.2, 0.94, 0.84] },
  cortexa: { img: 'ad_cortexa', w: 470, h: 252, box: [0.06, 0.18, 0.94, 0.85] },
  hogfuel: { img: 'ad_hogfuel', w: 480, h: 242, box: [0.05, 0.2, 0.95, 0.8] },
};
defineBuild('ad', (b, kind, x, y) => {
  const A = ADS[kind], [l, t, r, bt] = A.box;
  // Sky Living always hangs from the very top, and its chains count: it's solid right up to the ceiling, so you
  // can't sneak over it along the top of the map
  if (kind === 'sky') y = level.top;
  const hy = kind === 'sky' ? y - 40 : y + A.h * t;
  geoOf(b).solids.push({ kind: 'hit', nocam: true, x: x + A.w * l, w: A.w * (r - l), y: hy, h: y + A.h * bt - hy });
  b.add({ t: 'ad', x, w: A.w, y, kind, camTop: kind === 'sky' ? y - 20 : null }); // the camera rises to show all of Sky Living
});
defineHazard('ad', {
  back: true,
  hits: () => false, // its solid does the colliding
  draw(o) {
    const A = ADS[o.kind], x = o.x - camX, im = spr(A.img);
    if (im) drawSpr(im, x, o.y, A.w, A.h);
    else { ctx.fillStyle = '#ff4fd8'; ctx.fillRect(x, o.y, A.w, A.h); }
    if (showHitboxes) { const [l, t, r, bt] = A.box, ty = o.kind === 'sky' ? o.y : o.y + A.h * t; ctx.strokeStyle = '#ff2050'; ctx.lineWidth = 2; ctx.strokeRect(x + A.w * l, ty, A.w * (r - l), o.y + A.h * bt - ty); }
  },
});

// ---------- Hole signs (always in the same places) ----------
const GATE_OPEN = 0.535;                         // the gap between the gate's legs, as a share of its width
const GATE_W = Math.round(HOLE_W / GATE_OPEN), GATE_H = Math.round(GATE_W * 318 / 640);
const SIGN_W = 270, SIGN_H = Math.round(SIGN_W * 169 / 560);
defineHazard('holesign', {
  hits: () => false,
  draw(o) {
    const cx = o.hx + o.hw / 2 - camX;
    if (o.down) {
      const gate = spr('sign_gate'), under = spr('sign_under'), gy = GROUND - GATE_H + 4;
      if (gate) drawSpr(gate, cx - GATE_W / 2, gy, GATE_W, GATE_H);
      if (under) drawSpr(under, cx - SIGN_W / 2, gy - SIGN_H - 8, SIGN_W, SIGN_H);
    }
    if (o.up) { const st = spr('sign_street'); if (st) drawSpr(st, cx - SIGN_W / 2, GROUND + SLAB + 26, SIGN_W, SIGN_H); }
  },
});


// ---------- Gunship (sky): lines up, fires a straight laser, then charges ----------
// The laser always fires straight ahead (left) at the gunship's own height, so it's easy to read and dodge.
// Tell: it drifts slowly toward your height with a dashed sight line, then STOPS and the line blinks solid for a
// while before it fires. Just change height while it's blinking.
const GUN_W = 180, GUN_H = 106, GUN_R = 34;
const GUN_AIM = 1.3, GUN_LOCK = 0.7, GUN_FIRE = 0.18, GUN_PAUSE = 0.6, GUN_DRIFT = 110, GUN_CHARGE = 300;
defineBuild('gunship', (b, x, y) => b.add({ t: 'gunship', x, w: GUN_W, reach: 1300, y, y0: y, under: y > GROUND + SLAB, st: 'idle', tt: 0 }));
const muzzle = o => [o.x + GUN_W * 0.03, o.y + GUN_H * 0.02];
defineHazard('gunship', {
  update(o, dt) {
    o.tt += dt;
    if (o.st === 'idle') {
      o.y = o.y0 + Math.sin(clock * 2 + o.x) * 8;
      if (onPlane(o) && o.x > pig.x + 260 && o.x - pig.x < 900) { o.st = 'aim'; o.tt = 0; sfx.lock(); }
    } else if (o.st === 'aim') {
      if (o.tt < GUN_AIM - GUN_LOCK) o.y += clamp(pig.y - o.y, -GUN_DRIFT * dt, GUN_DRIFT * dt); // drifts, then holds still
      if (o.tt >= GUN_AIM) { o.st = 'fire'; o.tt = 0; sfx.laser(); shake = Math.max(shake, 3); }
    } else if (o.st === 'fire') {
      if (o.tt >= GUN_FIRE) { o.st = 'pause'; o.tt = 0; }
    } else if (o.st === 'pause') {
      if (o.tt >= GUN_PAUSE) { o.st = 'charge'; o.tt = 0; }
    } else o.x -= GUN_CHARGE * dt; // flies straight on past you
  },
  hits(o, cx, cy, r) {
    const dx = cx - (o.x + GUN_W / 2), dy = cy - o.y;
    if (dx * dx + dy * dy < (r + GUN_R) * (r + GUN_R)) return true;
    if (o.st !== 'fire') return false;
    const [mx, my] = muzzle(o);
    return cx < mx && cx > mx - 1400 && Math.abs(cy - my) < r + 5;
  },
  blocksCoin: (o, it) => Math.abs(it.x - (o.x + GUN_W / 2)) < 80 && Math.abs(it.y - o.y) < 60,
  draw(o) {
    const x = o.x - camX, [mx, my] = muzzle(o), im = spr('gunship'), sx = mx - camX;
    if (o.st === 'aim') {
      const locked = o.tt >= GUN_AIM - GUN_LOCK;
      if (!locked || Math.floor(o.tt * 10) % 2 === 0) {
        ctx.save(); ctx.strokeStyle = locked ? 'rgba(255,60,80,0.9)' : 'rgba(255,60,80,0.4)'; ctx.lineWidth = locked ? 3 : 1.5;
        ctx.setLineDash(locked ? [] : [10, 8]); line(sx, my, sx - 1400, my); ctx.restore();
      }
    } else if (o.st === 'fire') {
      const f = 1 - o.tt / GUN_FIRE;
      ctx.save(); ctx.lineCap = 'round'; ctx.shadowColor = '#ff2050'; ctx.shadowBlur = 20;
      ctx.strokeStyle = `rgba(255,40,80,${0.6 + 0.4 * f})`; ctx.lineWidth = 12 * f + 5; line(sx, my, sx - 1400, my);
      ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; line(sx, my, sx - 1400, my); ctx.restore();
    }
    if (im) drawSpr(im, x, o.y - GUN_H / 2, GUN_W, GUN_H);
    else { ctx.fillStyle = '#6b6f8a'; circle(x + GUN_W / 2, o.y, GUN_R); ctx.fill(); }
    if (o.st === 'aim') text('!', x + GUN_W / 2, o.y - GUN_H / 2 - 14, 30, '#ff3b4d', 'center', '#120a26');
  },
  quips: ['Lasered!', 'Pew pew, pork stew.', 'Zapped to a crisp.', 'Target acquired: breakfast.', 'Laser-crisped bacon.'],
});

// ---------- Undercity metro ----------
// metro(x0, x1, every): while you're down in the undercity between x0 and x1, a train comes at you along the tracks
// about every `every` seconds. Tell: a warning light and horn at the right edge, then it zooms through, riding on
// the tracks in front of the undercity buildings.
const METRO_W = 470, METRO_H = 121, METRO_SPEED = 1150, METRO_WARN = 1.2;
const METRO_RAIL = 27; // its wheels sit on the top rail, which is drawn this far below the floor line
defineBuild('metro', (b, x0, x1, every = 7) => b.add({ t: 'metro', x: x0, w: x1 - x0, reach: 1e6, x0, x1, every, wait: every * 0.5, st: 'wait', tx: 0 }));
defineHazard('metro', {
  update(o, dt) {
    const down = pig.y > GROUND + SLAB && pig.x > o.x0 && pig.x < o.x1 - 600;
    if (o.st === 'wait') {
      if (down) o.wait -= dt;
      if (o.wait <= 0) { o.st = 'warn'; o.tt = METRO_WARN; sfx.horn(); }
    } else if (o.st === 'warn') {
      o.tt -= dt;
      if (o.tt <= 0) { o.st = 'run'; o.tx = camX + W + 40; }
    } else {
      o.tx -= METRO_SPEED * dt;
      if (o.tx + METRO_W < camX - 200) { o.st = 'wait'; o.wait = o.every; }
    }
  },
  hits: (o, cx, cy, r) => o.st === 'run' && circRect(cx, cy, r, o.tx + 20, level.bottom + METRO_RAIL - METRO_H * 0.9, METRO_W - 40, METRO_H * 0.82),
  draw(o) {
    const fy = level.bottom;
    if (o.st === 'warn') { // flashing light and a headlight glow from the right edge
      const on = Math.floor(o.tt * 8) % 2 === 0, ex = W;
      const g = ctx.createLinearGradient(ex - 240, 0, ex, 0);
      g.addColorStop(0, 'rgba(255,230,150,0)'); g.addColorStop(1, `rgba(255,230,150,${0.25 + 0.3 * (1 - o.tt / METRO_WARN)})`);
      ctx.fillStyle = g; ctx.fillRect(ex - 240, fy - METRO_H, 240, METRO_H);
      if (on) { ctx.fillStyle = '#ff3b4d'; circle(ex - 40, fy - METRO_H - 30, 12); ctx.fill(); }
      text('🚇', ex - 90, fy - METRO_H - 30, 30, '#fff', 'center', 'rgba(0,0,0,0)');
      return;
    }
    if (o.st !== 'run') return;
    const im = spr('metro'), x = o.tx - camX;
    if (im) drawSpr(im, x, fy + METRO_RAIL - METRO_H, METRO_W, METRO_H);
    else { ctx.fillStyle = '#7a5130'; ctx.fillRect(x, fy - METRO_H, METRO_W, METRO_H); }
    ctx.fillStyle = 'rgba(255,240,200,0.35)'; for (let k = 0; k < 6; k++) ctx.fillRect(x + METRO_W + 10 + k * 40, fy - METRO_H * 0.5 + rand(-30, 30), 30, 2); // speed lines
  },
  quips: ['Mind the gap!', 'Hit by the 5:15 to Bacon Street.', 'Train-ed to a crisp.', 'All aboard the pork express.'],
});


// ---------- Smog bank (the floor of a sky-only level) ----------
// Solid on top like a roof. It's drawn in front of the buildings, so towers look like they rise out of it.
defineBuild('smog', (b, x0, x1, y) => {
  geoOf(b).solids.push({ kind: 'smog', x: x0, w: x1 - x0, y, h: 1600 });
  b.add({ t: 'smog', x: x0, w: x1 - x0, y });
});
defineHazard('smog', {
  hits: () => false,
  draw(o) {
    const a = Math.max(o.x, camX - 40), c = Math.min(o.x + o.w, camX + W + 40);
    if (c <= a) return;
    const g = ctx.createLinearGradient(0, o.y - 30, 0, o.y + 160);
    g.addColorStop(0, 'rgba(255,90,200,0.0)'); g.addColorStop(0.18, 'rgba(190,80,220,0.92)'); g.addColorStop(1, '#2a0f45');
    ctx.fillStyle = g; ctx.fillRect(a - camX, o.y - 30, c - a, camY + H - o.y + 60);
    ctx.fillStyle = 'rgba(255,170,240,0.55)';
    for (let k = Math.floor(a / 70); k * 70 < c; k++) { // drifting puffs along the top
      const px = k * 70 + Math.sin(clock * 0.8 + k) * 14 - camX;
      ellipse(px, o.y + 2 + Math.sin(clock * 1.3 + k * 2) * 4, 46, 14); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,220,250,0.9)'; ctx.fillRect(a - camX, o.y - 1, c - a, 2);
  },
});
