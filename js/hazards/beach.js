'use strict';
// Bacon Bay hazards. Giant crabs and the tidal wave are BOOST hazards: at normal speed you can't make it.
//   urchins(x, n, side, h)         row of stinging anemones (beach spikes)
//   sandcastle(x)                  sandcastle centred on x (always the same size)
//   pier(x, w, h)                  solid wooden pier hanging from the top
//   gull(meet, y, wobble, speed)   seagull flying at you (like a frying pan)
//   coconut(x, period, phase)      coconut that drops on a loop from a palm tree; rocks 3 times first
//   crab(x)                        giant half-buried crab: you have CRAB_LEAD seconds to pass x + 76 before it rears up
//   wave(x, until, mult, lead)     tidal wave that chases you from x to `until` at `mult` x level speed
//   sign(x)                        "hold boost" signpost (decoration)

// ---------- Sea anemones (the beach's spikes) ----------
// The hitbox is a row of spike triangles. It's drawn as a few whole anemone sprites spread along the row at
// their natural shape (as tall as the row), hanging upside down for rows on the top.
defineBuild('urchins', (b, x, n, side = 'floor', h = 44) => {
  for (let i = 0; i < n; i++) b.add({ t: 'urchin', x: x + i * 40, w: 40, h, side, base: 0 });
  const aw = h * 1.08 * 260 / 223; // anemone.png is 260x223
  b.add({ t: 'anemones', x, w: n * 40, reach: aw / 2, h, side, k: Math.max(1, Math.round(n * 40 / (aw * 0.7))) });
});
defineHazard('urchin', {
  hits: (o, cx, cy, r) => circTri(cx, cy, r - 2, spikeTri(o)),
  draw() {}, // drawn by its row's 'anemones'
  blocksCoin: (o, it) => it.x >= o.x - 40 && it.x <= o.x + o.w + 40 && hits(o, it.x, it.y, 20),
  quips: ['Anemone-mia!', 'Stung like a bee, ham.', 'With anemones like these...', 'Tentacle-d!'],
});
defineHazard('anemones', {
  hits: () => false,
  draw(o) {
    const im = spr('anemone');
    if (!im) return;
    const floor = o.side === 'floor', h = o.h * 1.08, w = h * im.width / im.height;
    for (let i = 0; i < o.k; i++) {
      const j = Math.round(o.x / 40) + i, sway = Math.sin(clock * 2.2 + j * 0.9) * 0.1;
      ctx.save(); ctx.translate(o.x - camX + o.w * (i + 0.5) / o.k, floor ? GROUND + 3 : -3);
      ctx.scale(j % 2 ? -1 : 1, floor ? 1 : -1); // mirror every other one; hang upside down from the top
      ctx.transform(1, 0, -sway, 1, 0, 0); // tentacles sway, the base stays put
      ctx.drawImage(im, -w / 2, -h, w, h);
      ctx.restore();
    }
  },
});

// ---------- Sandcastles ----------
// The whole castle sprite (castle.png, 600x409), always the same size: its tallest tower is CASTLE_H above the
// sand (the flags stick up above that). sandcastle(x) centres it on x.
// Hitbox: the stepped outline of its towers and walls. CASTLE_PARTS are [left, right, top] as fractions of the sprite.
const CASTLE_H = 170, CASTLE_TOP = 0.168, CASTLE_SINK = 6; // tower height; tallest tower's top in the sprite; how far the base sits in the sand
const CASTLE_SH = (CASTLE_H + CASTLE_SINK) / (1 - CASTLE_TOP), CASTLE_SW = CASTLE_SH * 600 / 409;
const CASTLE_PARTS = [[0.378, 0.618, 0.168], [0.34, 0.66, 0.43], [0.158, 0.308, 0.408], [0.682, 0.832, 0.408],
  [0.284, 0.712, 0.57], [0.124, 0.875, 0.633], [0.06, 0.94, 0.878]];
defineBuild('sandcastle', (b, x) => b.add({ t: 'castle', x: x - CASTLE_SW / 2, w: CASTLE_SW, reach: CASTLE_SW, sh: CASTLE_SH }));
function castleRects(o) {
  const y0 = GROUND + CASTLE_SINK - o.sh;
  return CASTLE_PARTS.map(([a, b, t]) => [o.x + o.w * a + 3, y0 + o.sh * t + 3, o.w * (b - a) - 6, GROUND]);
}
defineHazard('castle', {
  hits: (o, cx, cy, r) => castleRects(o).some(([x, y, w, h]) => circRect(cx, cy, r, x, y, w, h)),
  draw(o) { const im = spr('castle'); if (im) ctx.drawImage(im, o.x - camX, GROUND + CASTLE_SINK - o.sh, o.w, o.sh); },
  blocksCoin: (o, it) => it.x >= o.x - 40 && it.x <= o.x + o.w + 40 && hits(o, it.x, it.y, 20),
  quips: ['Sand-wiched!', 'Castle crashed.', 'Built different. You weren\'t.'],
});


// ---------- Piers (hang from the top) ----------
defineBuild('pier', (b, x, w, h) => b.add({ t: 'pier', x, w, h }));
function drawPier(o) {
  const x = o.x - camX, w = o.w, h = o.h;
  ctx.fillStyle = '#8a5a32'; ctx.fillRect(x, 0, w, h);
  ctx.fillStyle = '#6e4526';
  for (let px = x + 6; px < x + w - 4; px += 22) ctx.fillRect(px, 0, 10, h - 14);
  ctx.fillStyle = '#a8743f'; ctx.fillRect(x - 6, h - 16, w + 12, 16);
  ctx.strokeStyle = '#5b3a1e'; ctx.lineWidth = 2; ctx.strokeRect(x - 6, h - 16, w + 12, 16);
  // barnacles + seaweed on the posts
  ctx.fillStyle = '#d8d0c0'; for (let px = x + 10; px < x + w - 4; px += 44) { circle(px, h - 22, 3); ctx.fill(); }
  ctx.strokeStyle = '#3f9a3a'; ctx.lineWidth = 3;
  for (let px = x + 16; px < x + w; px += 50) { ctx.beginPath(); ctx.moveTo(px, h); ctx.quadraticCurveTo(px + 6 * Math.sin(clock * 2 + px), h + 10, px - 2, h + 18); ctx.stroke(); }
}
defineHazard('pier', {
  hits: (o, cx, cy, r) => circRect(cx, cy, r, o.x - 6, 0, o.w + 12, o.h),
  draw: drawPier,
  blocksCoin: (o, it) => it.x >= o.x - 46 && it.x <= o.x + o.w + 46 && hits(o, it.x, it.y, 20),
  quips: ['Pier pressure!', 'Boardwalked into it.', 'Docked points.'],
});

// ---------- Seagulls (fly at you, like frying pans) ----------
defineBuild('gull', (b, meet, y, wob = 0, spd = 220) => {
  const x = meet + spd * 800 / (b.speed + spd);
  b.add({ t: 'gull', x, w: 50, y0: y, y, wob, spd, ph: x * 0.01, active: false });
});
function drawGull(o) {
  const im = spr('gull');
  if (!im) return drawGullOld(o);
  const x = o.x - camX, f = Math.sin(levelT * 14 + o.ph), w = 78, h = w * im.height / im.width;
  ctx.save(); ctx.translate(x, o.y - f * 2); ctx.rotate(-0.06 + f * 0.04); ctx.scale(1, 1 + f * 0.1); // flapping bob
  drawSpr(im, -w * 0.52, -h * 0.55, w, h, true); // the art faces right; gulls fly left at you
  ctx.restore();
}
function drawGullOld(o) {
  const x = o.x - camX, y = o.y, f = Math.sin(levelT * 14 + o.ph);
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#cfd6de'; // wings
  ctx.beginPath(); ctx.moveTo(-2, -2); ctx.quadraticCurveTo(10, -16 - f * 14, 26, -10 - f * 18); ctx.quadraticCurveTo(14, -4, 4, 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ellipse(0, 0, 20, 10); ctx.fill();
  ctx.fillStyle = '#ffffff'; circle(-16, -5, 8); ctx.fill();
  ctx.fillStyle = '#ffb21a'; ctx.beginPath(); ctx.moveTo(-23, -6); ctx.lineTo(-34, -3); ctx.lineTo(-23, -1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#222'; circle(-17, -7, 1.8); ctx.fill();
  ctx.strokeStyle = '#7a8794'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, -11); ctx.lineTo(-13, -9); ctx.stroke(); // angry brow
  ctx.fillStyle = '#9aa6b2'; ctx.beginPath(); ctx.moveTo(-2, -2); ctx.quadraticCurveTo(-10, -18 - f * 12, -2, -14 - f * 16); ctx.quadraticCurveTo(4, -6, 6, 0); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(18, -2); ctx.lineTo(30, -6); ctx.lineTo(28, 4); ctx.closePath(); ctx.fill();
  ctx.restore();
}
defineHazard('gull', {
  hits: (o, cx, cy, r) => { const dx = cx - o.x, dy = cy - o.y; return dx * dx + dy * dy < (r + 17) * (r + 17); },
  update(o, dt) {
    if (!o.active && o.x - camX < W + 60) o.active = true;
    if (o.active) { o.x -= o.spd * dt; o.y = o.y0 + Math.sin(levelT * 3 + o.ph) * o.wob; }
  },
  draw: drawGull,
  quips: ['Gull-ty as charged!', 'Seagull\'d!', 'Mine? MINE!', 'Beaked and bacon\'d.'],
});

// ---------- Coconuts (drop on a loop from a palm tree) ----------
// Nuts placed close together share one full-height palm tree (palm_tall.png, toned down so the nuts stand out),
// drawn behind everything with no hitbox. The nuts hang just under its crown at y = COCO_Y.
// Every drop has the same tell, whatever the nut's period: it rocks COCO_ROCKS times ("tock" each time) over
// COCO_WARN seconds, then cracks loose and falls. The shadow on the sand grows as it comes.
const COCO_WARN = 0.75, COCO_ROCKS = 3, COCO_G = 1900, COCO_Y = 84, COCO_R = 17;
const PALM = { jx: 0.52, jy: 0.303, crown: 74 }; // where the fronds meet (fraction of palm_tall.png), and how high that is on screen
const PALM_H = (GROUND + 8 - PALM.crown) / (1 - PALM.jy), PALM_W = PALM_H * 520 / 719;
defineBuild('coconut', (b, x, per = 1.8, ph = 0) => {
  let tree = b.objs.find(o => o.t === 'palm' && o.xs.length < 3 && Math.abs(x - o.xs[0]) <= 220);
  if (!tree) { tree = { t: 'palm', xs: [], w: PALM_W, flip: b.objs.filter(o => o.t === 'palm').length % 2 === 1 }; b.add(tree); }
  tree.xs.push(x); tree.cx = (Math.min(...tree.xs) + Math.max(...tree.xs)) / 2;
  tree.x = tree.cx - PALM_W * (tree.flip ? 1 - PALM.jx : PALM.jx);
  b.add({ t: 'coco', x, w: 30, per: Math.max(per, 1.45), ph, beat: -1 });
});
defineHazard('palm', {
  back: true, hits: () => false,
  draw(o) { const im = spr('palm_tall'); if (im) drawSpr(im, o.x - camX, GROUND + 8 - PALM_H, PALM_W, PALM_H, o.flip); },
});
// where a nut lands: the sand, or the top of a sandcastle under it
function cocoFloor(o) {
  if (o.floor == null) {
    o.floor = GROUND - 14;
    for (const c of objs) if (c.t === 'castle') for (const [x, y, w] of castleRects(c)) if (o.x >= x && o.x <= x + w) o.floor = Math.min(o.floor, y - 8);
  }
  return o.floor;
}
function cocoY(o) {
  const c = mod(levelT + o.ph, o.per);
  if (c < COCO_WARN) return { warn: c / COCO_WARN, y: null };
  const y = COCO_Y + 0.5 * COCO_G * (c - COCO_WARN) ** 2;
  return y < cocoFloor(o) ? { warn: 1, y } : { warn: 0, y: null, landed: c - COCO_WARN };
}
function drawCoco(o) {
  const nut = spr('coconut');
  if (!nut) return;
  const x = o.x - camX, g = cocoY(o), R = COCO_R, fl = cocoFloor(o) + 12;
  // shadow under it grows as it gets close
  const s = g.y != null ? 0.5 + 0.5 * clamp((g.y - COCO_Y) / (fl - COCO_Y), 0, 1) : g.warn ? 0.2 + 0.3 * g.warn : 0;
  if (s) { ctx.fillStyle = `rgba(60,30,10,${0.15 + 0.3 * s})`; ellipse(x, fl, 22 * s + 6, 5 * s + 2); ctx.fill(); }
  const nutAt = (cx, cy, a, alpha = 1) => {
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy);
    ctx.fillStyle = 'rgba(255,240,200,0.55)'; circle(0, 0, R + 3); ctx.fill(); // light rim so it pops against the tree
    ctx.rotate(a); ctx.drawImage(nut, -R, -R, R * 2, R * 2); ctx.restore();
  };
  if (g.y != null) nutAt(x, g.y, (g.y - COCO_Y) * 0.02 + o.ph);
  else {
    if (g.landed != null && g.landed < 0.5) { ctx.save(); ctx.translate(x, fl - 6); ctx.scale(1.3, 0.7); nutAt(0, 0, 0, 1 - g.landed * 2); ctx.restore(); }
    // the next one, hanging from its stalk (rocks back and forth COCO_ROCKS times before it drops)
    const L = 20, a = g.warn ? Math.sin(g.warn * COCO_ROCKS * Math.PI * 2) * 0.45 : 0, hx = x + Math.sin(a) * L, hy = COCO_Y - L + Math.cos(a) * L;
    ctx.strokeStyle = '#5b3a1e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, COCO_Y - L - 8); ctx.lineTo(hx - Math.sin(a) * (R - 2), hy - Math.cos(a) * (R - 2)); ctx.stroke();
    nutAt(hx, hy, a);
  }
}
defineHazard('coco', {
  update(o) { // tock on every rock, crack as it lets go (only when you can see it)
    const c = mod(levelT + o.ph, o.per), beat = c < COCO_WARN ? Math.floor(c / COCO_WARN * COCO_ROCKS) : COCO_ROCKS;
    if (beat !== o.beat) {
      if (o.x - camX > -40 && o.x - camX < W + 40) (beat < COCO_ROCKS ? sfx.tock : sfx.crack)();
      o.beat = beat;
    }
  },
  hits: (o, cx, cy, r) => { const g = cocoY(o); if (g.y == null) return false; const dx = cx - o.x, dy = cy - g.y; return dx * dx + dy * dy < (r + 13) * (r + 13); },
  draw: drawCoco,
  quips: ['Coco-KNOCKED!', 'Nuts to that.', 'Coconut concussion.', 'That\'s the way the coconut crumbles.'],
});

// ---------- Giant crab (BOOST) ----------
// A huge crab (crab.png, whole, mirrored so its mega claw faces you) sits half buried in the sand. Fly over it.
// Every crab has the same tell: when it spots you it shimmies CRAB_SHIMMIES times (a claw clack each time,
// digging itself up a little more each time), and on the next beat it rears up out of the sand with its claw
// raised to the top of the screen. CRAB_LEAD seconds in all. Be past its back (x + CRAB_W) by then. How far out
// it spots you scales with the level's speed so it always takes boost to make it.
// Hitbox: the crab's outline (CRAB_PROFILE, made by tools/sprites.py), turned with it as it rears up.
const CRAB_W = 76, CRAB_LEAD = 1.6, CRAB_PACE = 1.25, CRAB_SLAM = 0.3, CRAB_SHIMMIES = 4, CRAB_REAR = 0.6;
const CRAB_BEAT = (CRAB_LEAD - CRAB_SLAM) / CRAB_SHIMMIES; // one shimmy, then a pause
const CRAB_SH = 280, CRAB_SW = CRAB_SH * 800 / 526, CRAB_BW = CRAB_SW / CRAB_PROFILE.length;
const CRAB_SINK = [128, 100, 8]; // how deep it's buried: when it spots you, after its last shimmy, reared up
defineBuild('crab', (b, x) => {
  const gate = x + CRAB_W;
  b.add({ t: 'crab', x: gate - CRAB_SW, w: CRAB_SW, reach: CRAB_SW, gate, trig: gate - CRAB_LEAD * b.speed * CRAB_PACE, t0: null, burst: false, beat: -1 });
});
const crabTop = j => CRAB_PROFILE[CRAB_PROFILE.length - 1 - j] * CRAB_SH; // top of column j of the mirrored sprite
function crabGeo(o) {
  const since = o.t0 == null ? 0 : levelT - o.t0, left = CRAB_LEAD - since;
  const s = clamp(1 - left / CRAB_SLAM, 0, 1), e = s * (2 - s); // e: 0 buried, 1 reared up
  // shimmy k of CRAB_SHIMMIES: a quick wiggle in the first half of each beat, digging it up a step
  const k = o.t0 == null ? -1 : Math.floor(since / CRAB_BEAT), ph = since / CRAB_BEAT - k, on = k >= 0 && k < CRAB_SHIMMIES && ph < 0.5;
  const wig = on ? Math.sin(ph * 2 * Math.PI * 3) * (1 - ph * 2) : 0;
  const dig = o.t0 == null ? 0 : clamp((k + (on ? ph * 2 : 1)) / CRAB_SHIMMIES, 0, 1);
  const sink = CRAB_SINK[0] + (CRAB_SINK[1] - CRAB_SINK[0]) * dig + (CRAB_SINK[2] - CRAB_SINK[1]) * e;
  return { left, e, wig, a: CRAB_REAR * e, px: o.gate, py: GROUND + sink }; // turns about its back foot (px, py)
}
function crabPt(g, u, v) { // point (u, v) on the sprite -> world
  const c = Math.cos(g.a), s = Math.sin(g.a), du = u - CRAB_SW, dv = v - CRAB_SH;
  return [g.px + du * c - dv * s, g.py + du * s + dv * c];
}
function drawCrab(o) {
  const im = spr('crab');
  if (!im) return;
  const g = crabGeo(o), sh = g.wig * 6;
  ctx.save(); ctx.beginPath(); ctx.rect(-50, -200, W + 100, GROUND + 201 + (g.e >= 1 ? CRAB_SINK[2] : 0)); ctx.clip();
  ctx.translate(g.px - camX + sh, g.py); ctx.rotate(g.a + g.wig * 0.035);
  drawSpr(im, -CRAB_SW, -CRAB_SH, CRAB_SW, CRAB_SH, true);
  ctx.restore();
  if (g.e < 1) { // sand heaped around it
    ctx.fillStyle = 'rgba(120,80,30,0.25)';
    for (let k = 0; k < 5; k++) { ellipse(o.x - camX + CRAB_SW * (0.1 + k * 0.2) + sh, GROUND + 2, 50, 7); ctx.fill(); }
  }
}
defineHazard('crab', {
  update(o) {
    if (o.t0 == null && pig.x >= o.trig) o.t0 = levelT;
    const beat = o.t0 == null ? -1 : Math.min(CRAB_SHIMMIES, Math.floor((levelT - o.t0) / CRAB_BEAT));
    if (beat !== o.beat) { if (beat >= 0 && beat < CRAB_SHIMMIES) sfx.clack(); o.beat = beat; } // clack on every shimmy
    if (!o.burst && o.t0 != null && levelT - o.t0 >= CRAB_LEAD - CRAB_SLAM) { // sand flies as it rears up
      o.burst = true; shake = Math.max(shake, 5); sfx.splat();
      for (let i = 0; i < 36; i++) particles.push({ x: o.x + CRAB_SW * Math.random(), y: GROUND - 4, vx: rand(-120, 120), vy: rand(-520, -160), life: 0.7, max: 0.7, size: rand(3, 6), col: '#e9c98a', g: 1200 });
    }
  },
  hits(o, cx, cy, r) {
    const g = crabGeo(o), c = Math.cos(g.a), s = Math.sin(g.a), dx = cx - g.px, dy = cy - g.py;
    const u = dx * c + dy * s + CRAB_SW, v = -dx * s + dy * c + CRAB_SH, n = CRAB_PROFILE.length, bw = CRAB_BW; // pig in sprite space
    for (let j = Math.max(0, Math.floor((u - r) / bw)); j <= Math.min(n - 1, Math.floor((u + r) / bw)); j++) {
      const top = crabTop(j) + 4;
      if (circRect(u, v, r, j * bw + 3, top, bw - 6, CRAB_SH - top)) return true;
    }
    if (g.e >= 1) for (let j = 0; j < n; j++) { // reared up, its claw reaches the top of the screen: no sneaking over it
      const [x, y] = crabPt(g, (j + 0.5) * bw, crabTop(j));
      if (y < 80 && circRect(cx, cy, r, x - bw / 2, -80, bw, y + 80)) return true;
    }
    return false;
  },
  draw: drawCrab,
  blocksCoin: (o, it) => it.x > o.x - 30 && it.x < o.gate + 30 && hits(o, it.x, it.y, 22),
  quips: ['Pinched!', 'Crabby ending.', 'Snip snap, pork chop!', 'Claws for concern.', 'Shell-shocked!'],
});


// ---------- Tidal wave (BOOST) ----------
// Starts `lead` px behind you when you pass x, then rolls along at `mult` x the level speed until `until`.
defineBuild('wave', (b, x, until, mult = 1.25, lead = 340) => b.add({ t: 'wave', x, w: 0, reach: 1e6, start: x, until, mult, lead, front: null, gone: 0 }));
defineHazard('wave', {
  update(o, dt) {
    if (o.front == null) { if (pig.x >= o.start) { o.front = pig.x - o.lead; o.x = o.front; sfx.swell(); } return; }
    if (o.front < o.until) { o.front += level.speed * o.mult * dt; o.x = o.front; }
    else o.gone = Math.min(1, o.gone + dt * 1.2);
    // its roar: louder and brighter the closer it gets, with a crash when it's right on your tail
    const gap = pig.x - o.front;
    surfWant = Math.max(surfWant, clamp(1 - (gap - 60) / 600, 0.2, 1) * (1 - o.gone));
    if (gap < 170 && !o.close && o.gone === 0) { o.close = true; sfx.crash(); }
    else if (gap > 260) o.close = false;
  },
  hits: (o, cx, cy, r) => o.front != null && o.front < o.until && cx - r * 0.6 < o.front,
  draw(o) {
    if (o.front == null || o.gone >= 1) return;
    const fx = o.front - camX, sink = o.gone * 520;
    if (fx < -30) { // still off screen: warn at the left edge
      const near = clamp(1 - (camX - o.front) / 500, 0, 1), pulse = 0.5 + 0.5 * Math.sin(clock * 10);
      const g = ctx.createLinearGradient(0, 0, 90, 0); g.addColorStop(0, `rgba(40,140,255,${0.25 + 0.35 * near * pulse})`); g.addColorStop(1, 'rgba(40,140,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 90, GROUND);
      text('🌊', 30, GROUND / 2 - 18, 34, '#fff', 'center', 'rgba(0,0,0,0)');
      text('BOOST!', 40, GROUND / 2 + 20, 18 + near * 6, '#ffe14d', 'center', '#123a6a');
      return;
    }
    ctx.save(); ctx.translate(0, sink);
    // body of the wave
    const g = ctx.createLinearGradient(fx - 400, 0, fx, 0); g.addColorStop(0, '#0f5fa8'); g.addColorStop(1, '#2fa3e6');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-20, GROUND + 10); ctx.lineTo(-20, 20);
    ctx.lineTo(fx - 120, 10); ctx.quadraticCurveTo(fx + 30, 0, fx + 40, 70); // curling lip
    ctx.quadraticCurveTo(fx + 12, 50, fx - 4, 92);
    for (let y = 92; y <= GROUND + 10; y += 24) ctx.lineTo(fx + Math.sin(y * 0.08 + clock * 8) * 8, y);
    ctx.closePath(); ctx.fill();
    // foam along the front and the crest
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let y = 60; y < GROUND; y += 22) { circle(fx + Math.sin(y * 0.1 + clock * 9) * 6, y, 9 + 4 * Math.sin(y + clock * 6)); ctx.fill(); }
    for (let k = 0; k < 7; k++) { circle(fx - 110 + k * 22, 12 + Math.sin(clock * 7 + k) * 4, 10); ctx.fill(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 4;
    for (let k = 0; k < 4; k++) { const yy = 140 + k * 80; ctx.beginPath(); ctx.moveTo(fx - 300, yy); ctx.quadraticCurveTo(fx - 160, yy - 30, fx - 40, yy); ctx.stroke(); }
    ctx.restore();
  },
  quips: ['Washed up!', 'Wiped out, dude.', 'Surf\'s up, pork\'s down.', 'Totally tubular. Totally bacon.', 'Ham-ami!'],
});

// ---------- "Hold boost" signpost (no collision) ----------
defineBuild('sign', (b, x, kind = 'boost') => b.add({ t: 'sign', x, w: 110, kind }));
defineHazard('sign', {
  hits: () => false,
  draw(o) {
    const x = o.x - camX;
    ctx.fillStyle = '#7b4a22'; ctx.fillRect(x + 50, GROUND - 120, 10, 120);
    ctx.fillStyle = '#c8955a'; rrect(x, GROUND - 170, 110, 60, 10); ctx.fill();
    ctx.strokeStyle = '#7b4a22'; ctx.lineWidth = 3; ctx.stroke();
    text(isTouch ? 'HOLD ⚡' : 'HOLD SHIFT', x + 55, GROUND - 152, isTouch ? 20 : 17, '#ffe14d', 'center', '#5a2340');
    text('to beat the crab!', x + 55, GROUND - 128, 12, '#fff', 'center', '#5a2340');
  },
});
