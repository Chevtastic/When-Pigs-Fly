/* When Pigs Fly — a side-scrolling dodge game.
   Hold SPACE to fly up, let go to fall. Hold SHIFT to go faster.
   Reach the mud pile at the end of each level. */
(() => {
'use strict';

// ---------- Setup ----------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 960, H = 540, GROUND = 470, PIG_SX = 220;
const GRAV = 1750, THRUST = 1750, MAXV = 540, BOOST = 1.65;
const STEP = 1 / 120;
const FONT = '"Lilita One", "Arial Black", Impact, sans-serif';
const dpr = Math.min(2, window.devicePixelRatio || 1);
canvas.width = W * dpr;
canvas.height = H * dpr;

const $ = id => document.getElementById(id);
const mod = (a, b) => ((a % b) + b) % b;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);

// ---------- Themes ----------
const THEMES = [
  { skyTop: '#6cc4ff', skyBot: '#d9f3ff', far: '#9bd38a', near: '#6fbf5c', grass: '#57b847', dirt: '#8a5a2e', dirt2: '#74491f', cloud: 'rgba(255,255,255,0.9)', sun: '#fff3a0', sunY: 90, night: false, fence: '#a0703f', barn: '#c0392b' },
  { skyTop: '#ff7a59', skyBot: '#ffd39a', far: '#c98a6a', near: '#9a6a4a', grass: '#7aa33a', dirt: '#7a4a2a', dirt2: '#633b20', cloud: 'rgba(255,225,200,0.85)', sun: '#ffe08a', sunY: 300, night: false, fence: '#6e4526', barn: '#a8322a' },
  { skyTop: '#070b2a', skyBot: '#2a2d6e', far: '#1d2550', near: '#16203f', grass: '#2c5a3a', dirt: '#3a2a1e', dirt2: '#2c1f16', cloud: 'rgba(160,170,220,0.22)', sun: '#f4f1d0', sunY: 90, night: true, fence: '#3b2a20', barn: '#5a1f1c' },
];
const STARS = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * 330, r: Math.random() * 1.6 + 0.4, p: Math.random() * 6 }));

// ---------- Level building ----------
function builder(speed) {
  const o = [];
  const b = {
    spikes(x, n, side = 'floor', h = 50, base = 0) {
      for (let i = 0; i < n; i++) o.push({ t: 'spike', x: x + i * 40, w: 40, h, side, base });
      return b;
    },
    hay(x, w, h, side = 'floor') { o.push({ t: 'hay', x, w, h, side }); return b; },
    tower(x, w, h, side = 'floor') { b.hay(x, w, h - 40, side); b.spikes(x, Math.round(w / 40), side, 40, h - 40); return b; },
    // "meet" = roughly where the pan reaches the pig (pans fly toward you once on screen)
    pan(meet, y, wob = 0, spd = 200) {
      const x = meet + spd * 800 / (speed + spd);
      o.push({ t: 'pan', x, w: 50, y0: y, y, wob, spd, ph: x * 0.01, rot: 0, active: false });
      return b;
    },
    farmer(x, min, max, per = 2, ph = 0) { o.push({ t: 'farmer', x, w: 40, min, max, per, ph }); return b; },
    objs: o,
  };
  return b;
}

const LEVELS = [
  {
    name: 'Muddy Meadow', theme: 0, speed: 320, end: 9600,
    build() {
      const b = builder(this.speed);
      b.spikes(900, 3, 'floor', 45)
       .spikes(1400, 3, 'ceil', 140)
       .tower(1850, 80, 170)
       .pan(2350, 260)
       .farmer(2800, 160, 230, 2.2)
       .spikes(3250, 2, 'floor', 60).spikes(3250, 2, 'ceil', 150)
       .tower(3700, 80, 230).tower(4050, 80, 230, 'ceil')
       .pan(4500, 380).pan(4800, 160)
       .farmer(5200, 160, 240, 2)
       .spikes(5600, 6, 'floor', 50).spikes(5680, 4, 'ceil', 130)
       .tower(6200, 80, 260, 'ceil').tower(6550, 80, 250)
       .pan(7000, 300, 60)
       .farmer(7400, 160, 240, 1.8).farmer(7750, 160, 240, 1.8, Math.PI)
       .spikes(8150, 3, 'floor', 60).spikes(8150, 3, 'ceil', 160)
       .pan(8550, 200).pan(8700, 360);
      return b.objs;
    },
  },
  {
    name: 'Barnyard Bash', theme: 1, speed: 340, end: 11600,
    build() {
      const b = builder(this.speed);
      b.spikes(800, 4, 'floor', 50)
       .tower(1200, 80, 220, 'ceil').tower(1500, 80, 220)
       .pan(1950, 240, 50)
       .farmer(2350, 170, 270, 1.6)
       .spikes(2750, 8, 'floor', 60).spikes(2830, 6, 'ceil', 170)
       .tower(3450, 120, 270).tower(3750, 120, 270, 'ceil')
       .pan(4200, 150).pan(4200, 400)
       .farmer(4600, 170, 270, 1.5)
       .spikes(4950, 3, 'ceil', 160)
       .farmer(5250, 170, 270, 1.5, 1.5)
       .tower(5650, 160, 180).spikes(5690, 3, 'ceil', 150)
       .pan(6150, 300, 80, 240)
       .tower(6550, 80, 290, 'ceil').tower(6850, 80, 290).tower(7150, 80, 290, 'ceil')
       .pan(7650, 200).pan(7850, 350).pan(8050, 200)
       .farmer(8450, 170, 270, 1.3).farmer(8750, 170, 270, 1.3, 2)
       .spikes(9150, 10, 'floor', 70).spikes(9250, 6, 'ceil', 180)
       .pan(9950, 280, 70)
       .tower(10400, 80, 240).tower(10700, 80, 240, 'ceil');
      return b.objs;
    },
  },
  {
    name: 'Midnight Pork Panic', theme: 2, speed: 350, end: 13400,
    build() {
      const b = builder(this.speed);
      b.spikes(800, 5, 'floor', 60).spikes(880, 3, 'ceil', 180)
       .tower(1400, 80, 270, 'ceil').tower(1700, 80, 270).tower(2000, 80, 270, 'ceil')
       .pan(2450, 150, 60, 240).pan(2650, 370, 60, 240)
       .farmer(3050, 180, 300, 1.2).farmer(3300, 180, 300, 1.2, 1.3).farmer(3550, 180, 300, 1.2, 2.6)
       .spikes(3950, 12, 'floor', 80).spikes(4030, 10, 'ceil', 200)
       .pan(4750, 260, 90, 240)
       .tower(5150, 120, 290).tower(5450, 120, 290, 'ceil')
       .hay(5850, 200, 120).spikes(5850, 5, 'floor', 40, 120).spikes(5890, 4, 'ceil', 170)
       .farmer(6400, 180, 300, 1.1)
       .pan(6680, 120, 0, 220).pan(6680, 410, 0, 220)
       .farmer(7000, 180, 300, 1.1, 1.6)
       .tower(7400, 80, 290, 'ceil').tower(7700, 80, 290).tower(8000, 80, 290, 'ceil').tower(8300, 80, 290)
       .pan(8750, 250, 110, 240)
       .spikes(9100, 6, 'floor', 90)
       .farmer(9500, 190, 300, 1.0).farmer(9750, 190, 300, 1.0, Math.PI)
       .spikes(10150, 14, 'floor', 70).spikes(10230, 12, 'ceil', 190)
       .pan(10950, 180, 0, 220).pan(11100, 330, 0, 220).pan(11250, 180, 0, 220).pan(11400, 330, 0, 220)
       .tower(11850, 80, 280).tower(12150, 80, 280, 'ceil')
       .farmer(12500, 180, 290, 1.0)
       .spikes(12900, 4, 'floor', 60).spikes(12900, 4, 'ceil', 200);
      return b.objs;
    },
  },
];

// ---------- Save data ----------
let bests = {};
try { bests = JSON.parse(localStorage.getItem('pigsfly-best') || '{}') || {}; } catch (e) { bests = {}; }
function saveBests() { try { localStorage.setItem('pigsfly-best', JSON.stringify(bests)); } catch (e) {} }

// ---------- Audio (tiny synth, no files) ----------
let actx = null, muted = false;
function audio() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } }
  if (actx && actx.state === 'suspended') actx.resume();
  return actx;
}
function tone(f0, f1, dur, type = 'square', vol = 0.08, delay = 0) {
  const a = audio(); if (!a || muted) return;
  const t0 = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function noise(dur, vol, freq, type = 'highpass', delay = 0) {
  const a = audio(); if (!a || muted) return;
  const t0 = a.currentTime + delay;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.15 ? 1 : 0.45);
  const src = a.createBufferSource(); src.buffer = buf;
  const f = a.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  const g = a.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t0);
}
const sfx = {
  flap() { noise(0.09, 0.05, 900, 'lowpass'); },
  oink() { tone(420, 220, 0.16, 'sawtooth', 0.08); tone(390, 190, 0.2, 'sawtooth', 0.08, 0.18); },
  sizzle() { noise(1.1, 0.1, 3500, 'highpass', 0.05); },
  boost() { tone(220, 660, 0.22, 'triangle', 0.05); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.18, 'square', 0.06, i * 0.12)); },
  splat() { noise(0.4, 0.18, 380, 'lowpass'); },
};

// ---------- Game state ----------
let state = 'menu';          // menu | playing | dead | win | paused
let levelIdx = 0, level = LEVELS[0], objs = [];
let pig, camX = 0, levelT = 0, attempts = 0;
let particles = [], bacon = null, deadT = 0, winT = 0, quip = '', shake = 0;
let menuCam = 0, clock = 0, splashed = false, newBest = false, winTime = 0;
const keys = { up: false, boost: false };
const QUIPS = ['Crispy!', 'Pork belly flop!', 'Extra crunchy.', 'Hamageddon!', 'Sizzle sizzle...', 'Breakfast is served.', 'Well done. Literally.', 'That was a mis-steak.'];

function newPig() { return { x: 0, y: 300, vy: 0, flap: 0, ang: 0, ground: false }; }
pig = newPig();

function startLevel(i) {
  levelIdx = i; level = LEVELS[i]; attempts = 0;
  hideAll();
  resetAttempt();
}
function resetAttempt() {
  attempts++;
  objs = level.build();
  pig = newPig();
  camX = pig.x - PIG_SX;
  levelT = 0; particles = []; bacon = null; shake = 0; splashed = false;
  state = 'playing';
}
function die() {
  state = 'dead'; deadT = 0;
  bacon = { x: pig.x, y: pig.y, vx: 60, vy: -520, rot: 0, vr: 7 };
  quip = QUIPS[Math.floor(Math.random() * QUIPS.length)];
  shake = 14;
  for (let i = 0; i < 26; i++) particles.push({ x: pig.x, y: pig.y, vx: rand(-260, 260), vy: rand(-420, 80), life: rand(0.5, 1.1), max: 1.1, size: rand(3, 7), col: Math.random() < 0.5 ? '#ffb3c8' : '#ffe08a', g: 900 });
  for (let i = 0; i < 10; i++) particles.push({ x: pig.x, y: pig.y, vx: rand(-60, 60), vy: rand(-120, -40), life: rand(0.8, 1.4), max: 1.4, size: rand(8, 14), col: 'rgba(230,230,230,0.6)', g: -40 });
  sfx.oink(); sfx.sizzle();
}
function win() {
  state = 'win'; winT = 0; winTime = levelT;
  pig.sx = pig.x; pig.sy = pig.y;
  const prev = bests[levelIdx];
  newBest = !prev || winTime < prev;
  if (newBest) { bests[levelIdx] = winTime; saveBests(); }
  sfx.win();
}

// ---------- Collision ----------
function circRect(cx, cy, r, x, y, w, h) {
  const nx = clamp(cx, x, x + w), ny = clamp(cy, y, y + h);
  const dx = cx - nx, dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}
function segDist2(px, py, ax, ay, bx, by) {
  const abx = bx - ax, aby = by - ay;
  const t = clamp(((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby), 0, 1);
  const dx = px - (ax + abx * t), dy = py - (ay + aby * t);
  return dx * dx + dy * dy;
}
function inTri(px, py, a, b, c) {
  const s = (p1, p2) => (px - p2[0]) * (p1[1] - p2[1]) - (p1[0] - p2[0]) * (py - p2[1]);
  const d1 = s(a, b), d2 = s(b, c), d3 = s(c, a);
  const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}
function circTri(cx, cy, r, [a, b, c]) {
  if (inTri(cx, cy, a, b, c)) return true;
  const r2 = r * r;
  return segDist2(cx, cy, a[0], a[1], b[0], b[1]) < r2 || segDist2(cx, cy, b[0], b[1], c[0], c[1]) < r2 || segDist2(cx, cy, c[0], c[1], a[0], a[1]) < r2;
}
function spikeTri(o) {
  if (o.side === 'floor') { const b = GROUND - o.base; return [[o.x + 3, b], [o.x + o.w - 3, b], [o.x + o.w / 2, b - o.h]]; }
  const b = o.base; return [[o.x + 3, b], [o.x + o.w - 3, b], [o.x + o.w / 2, b + o.h]];
}
function farmerGeo(o) {
  const reach = o.min + (o.max - o.min) * (0.5 - 0.5 * Math.cos(2 * Math.PI * levelT / o.per + o.ph));
  let tipY = GROUND - reach, handY = tipY + 132;
  if (handY > GROUND - 20) { handY = GROUND - 20; tipY = handY - 132; }
  const lift = Math.max(0, (GROUND - 130) - handY);
  return { tipY, handY, lift };
}
function hits(o, cx, cy, r) {
  switch (o.t) {
    case 'spike': return circTri(cx, cy, r - 2, spikeTri(o));
    case 'hay': return o.side === 'floor' ? circRect(cx, cy, r, o.x, GROUND - o.h, o.w, o.h) : circRect(cx, cy, r, o.x, 0, o.w, o.h);
    case 'pan': { const dx = cx - o.x, dy = cy - o.y; return dx * dx + dy * dy < (r + 22) * (r + 22); }
    case 'farmer': {
      const g = farmerGeo(o), by = GROUND - g.lift, fx = o.x - 30;
      return circRect(cx, cy, r, o.x - 17, by - 116, 34, 116) ||
             circRect(cx, cy, r, fx - 3, g.tipY + 22, 6, 122) ||
             circRect(cx, cy, r, fx - 12, g.tipY, 24, 22);
    }
  }
  return false;
}
function pigHit() {
  const circles = [[pig.x, pig.y + 2, 16], [pig.x + 20, pig.y - 6, 12]];
  for (const o of objs) {
    if (Math.abs(o.x - pig.x) > 260) continue;
    for (const [cx, cy, r] of circles) if (hits(o, cx, cy, r)) return true;
  }
  return false;
}

// ---------- Update ----------
function update(dt) {
  clock += dt;
  if (shake > 0) shake = Math.max(0, shake - dt * 40);

  if (state === 'menu') menuCam += 140 * dt;

  if (state === 'playing') {
    levelT += dt;
    const spd = level.speed * (keys.boost ? BOOST : 1);
    pig.x += spd * dt;
    pig.vy = clamp(pig.vy + (keys.up ? -THRUST : GRAV) * dt, -MAXV, MAXV);
    pig.y += pig.vy * dt;
    pig.ground = false;
    if (pig.y < 26) { pig.y = 26; pig.vy = Math.max(0, pig.vy); }
    if (pig.y > GROUND - 22) { pig.y = GROUND - 22; pig.vy = Math.min(0, pig.vy); pig.ground = true; }
    pig.flap += dt * (keys.up ? 30 : pig.ground ? 0 : 9);
    pig.ang += (clamp(pig.vy / 1000, -0.45, 0.55) - pig.ang) * Math.min(1, dt * 12);
    camX = pig.x - PIG_SX;

    for (const o of objs) {
      if (o.t !== 'pan') continue;
      if (!o.active && o.x - camX < W + 60) o.active = true;
      if (o.active) { o.x -= o.spd * dt; o.rot -= dt * 9; o.y = o.y0 + Math.sin(levelT * 3 + o.ph) * o.wob; }
    }

    if (keys.boost && Math.random() < dt * 60) particles.push({ x: pig.x - 30, y: pig.y + rand(-18, 18), vx: -300, vy: 0, life: 0.25, max: 0.25, size: 2, col: 'rgba(255,255,255,0.8)', g: 0, streak: rand(30, 70) });
    if (pig.ground && Math.random() < dt * 25) particles.push({ x: pig.x - 10, y: GROUND - 4, vx: rand(-120, -40), vy: rand(-80, -20), life: 0.4, max: 0.4, size: rand(3, 5), col: 'rgba(140,100,60,0.7)', g: 200 });

    if (pigHit()) die();
    else if (pig.x >= level.end) win();
  } else if (state === 'dead') {
    deadT += dt;
    if (bacon) {
      bacon.vy += 1500 * dt; bacon.x += bacon.vx * dt; bacon.y += bacon.vy * dt; bacon.rot += bacon.vr * dt;
      if (bacon.y > GROUND - 8) { bacon.y = GROUND - 8; bacon.vy *= -0.35; bacon.vx *= 0.6; bacon.vr *= 0.5; }
      if (Math.random() < dt * 14) particles.push({ x: bacon.x + rand(-20, 20), y: bacon.y - 8, vx: rand(-15, 15), vy: rand(-90, -50), life: 0.9, max: 0.9, size: rand(5, 9), col: 'rgba(240,240,240,0.5)', g: -20 });
    }
    if (deadT > 1.5) resetAttempt();
  } else if (state === 'win') {
    winT += dt;
    const tx = level.end + 190, ty = GROUND - 30;
    const p = Math.min(1, winT / 0.9);
    pig.x = pig.sx + (tx - pig.sx) * p;
    pig.y = pig.sy + (ty - pig.sy) * p - Math.sin(Math.PI * p) * 120;
    pig.flap += dt * 20; pig.ang = p * 0.5;
    if (p >= 1 && !splashed) {
      splashed = true; sfx.splat(); shake = 6;
      for (let i = 0; i < 40; i++) particles.push({ x: tx, y: ty, vx: rand(-300, 300), vy: rand(-520, -150), life: rand(0.6, 1.2), max: 1.2, size: rand(4, 9), col: Math.random() < 0.7 ? '#5a3a1e' : '#7a5230', g: 1200 });
    }
    if (splashed && Math.random() < dt * 5) particles.push({ x: level.end + rand(40, 360), y: GROUND - 50, vx: rand(-20, 20), vy: rand(-70, -40), life: 1.6, max: 1.6, size: 18, col: '#ff6f9c', g: 0, heart: true });
    if (winT > 1.6 && $('win').classList.contains('hidden')) showWin();
  }

  for (const p of particles) { p.life -= dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  particles = particles.filter(p => p.life > 0);
}

// ---------- Drawing helpers ----------
function ellipse(x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); }
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function text(str, x, y, size, fill = '#fff', align = 'center', stroke = '#5a2340') {
  ctx.font = `${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size / 7); ctx.strokeStyle = stroke;
  ctx.strokeText(str, x, y); ctx.fillStyle = fill; ctx.fillText(str, x, y);
}

function wing(col) {
  ctx.fillStyle = col; ctx.strokeStyle = '#b9b9d6'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-10, -28, -32, -30);
  ctx.quadraticCurveTo(-22, -21, -27, -15);
  ctx.quadraticCurveTo(-16, -11, -19, -4);
  ctx.quadraticCurveTo(-8, -4, 0, 0);
  ctx.fill(); ctx.stroke();
}
function drawPig(x, y, ang, flap, s = 1, wings = true, flip = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s * flip, s);
  const wa = Math.sin(flap) * 0.7;
  if (wings) { ctx.save(); ctx.translate(-2, -14); ctx.rotate(-0.5 + wa); wing('#e4e4f4'); ctx.restore(); }
  // tail
  ctx.strokeStyle = '#e07a9a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-24, -4); ctx.bezierCurveTo(-34, -14, -40, 2, -31, 2); ctx.bezierCurveTo(-26, 2, -28, -6, -34, -4); ctx.stroke();
  // legs
  for (const lx of [-16, -6, 8, 17]) { ctx.fillStyle = '#f293b2'; ctx.fillRect(lx - 3, 11, 7, 10); ctx.fillStyle = '#a8456a'; ctx.fillRect(lx - 3, 19, 7, 3); }
  // body
  ctx.fillStyle = '#ffb3c8'; ctx.strokeStyle = '#d96b8e'; ctx.lineWidth = 2;
  ellipse(0, 0, 26, 19); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ellipse(-4, -8, 14, 6); ctx.fill();
  // head
  ctx.fillStyle = '#ffb3c8'; circle(18, -6, 15); ctx.fill(); ctx.stroke();
  // ear
  ctx.fillStyle = '#f293b2'; ctx.beginPath(); ctx.moveTo(10, -17); ctx.lineTo(16, -29); ctx.lineTo(23, -18); ctx.closePath(); ctx.fill(); ctx.stroke();
  // snout
  ctx.fillStyle = '#ff8fb0'; ellipse(31, -2, 7, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#a8456a'; circle(29, -2, 1.6); ctx.fill(); circle(33, -2, 1.6); ctx.fill();
  // eye + cheek
  ctx.fillStyle = '#fff'; circle(22, -11, 4.2); ctx.fill();
  ctx.fillStyle = '#222'; circle(23.2, -11, 2.3); ctx.fill();
  ctx.fillStyle = 'rgba(255,110,150,0.45)'; circle(20, -1, 3.5); ctx.fill();
  if (wings) { ctx.save(); ctx.translate(-5, -11); ctx.rotate(-0.2 - wa); wing('#ffffff'); ctx.restore(); }
  ctx.restore();
}
function drawBacon(x, y, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const pts = []; for (let i = 0; i <= 20; i++) pts.push([-34 + i * 3.4, Math.sin(i * 0.9 + clock * 6) * 4]);
  const path = dy => { ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py + dy) : ctx.moveTo(px, py + dy)); };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  path(0); ctx.strokeStyle = '#6e1b10'; ctx.lineWidth = 22; ctx.stroke();
  path(0); ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 18; ctx.stroke();
  path(-3.5); ctx.strokeStyle = '#f7d9c4'; ctx.lineWidth = 3.5; ctx.stroke();
  path(4); ctx.strokeStyle = '#f3c9ad'; ctx.lineWidth = 3; ctx.stroke();
  path(-7); ctx.strokeStyle = '#e0604c'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
function drawCloud(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 22); ctx.arc(0, 0, 22, Math.PI / 2, Math.PI * 1.62);
  ctx.arc(24, -10, 28, Math.PI * 1.1, Math.PI * 1.95);
  ctx.arc(52, 0, 22, Math.PI * 1.4, Math.PI / 2);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawBarn(x, y, th) {
  ctx.fillStyle = th.barn; ctx.fillRect(x, y - 70, 90, 70);
  ctx.beginPath(); ctx.moveTo(x - 8, y - 68); ctx.lineTo(x + 45, y - 110); ctx.lineTo(x + 98, y - 68); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = th.night ? '#888' : '#fff'; ctx.lineWidth = 3;
  ctx.strokeRect(x + 28, y - 44, 34, 44); line(x + 28, y - 44, x + 62, y); line(x + 62, y - 44, x + 28, y);
  ctx.fillStyle = th.night ? '#ffd65c' : '#fff'; ctx.fillRect(x + 37, y - 92, 16, 14);
}

// ---------- World drawing ----------
function drawBackground(cam, th) {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, th.skyTop); g.addColorStop(1, th.skyBot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  if (th.night) {
    for (const s of STARS) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(clock * 2 + s.p); ctx.fillStyle = '#fff'; circle(mod(s.x - cam * 0.02, W), s.y, s.r); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = th.sun; circle(790, th.sunY, 38); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; circle(776, 82, 8); ctx.fill(); circle(802, 104, 6); ctx.fill(); circle(805, 76, 4); ctx.fill();
  } else {
    const sg = ctx.createRadialGradient(790, th.sunY, 10, 790, th.sunY, 120);
    sg.addColorStop(0, th.sun); sg.addColorStop(0.35, th.sun); sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg; circle(790, th.sunY, 120); ctx.fill();
  }

  ctx.fillStyle = th.cloud;
  for (let i = 0; i < 7; i++) drawCloud(mod(i * 260 - cam * 0.12, W + 300) - 150, 55 + (i * 53) % 150, 0.8 + (i % 3) * 0.25);

  // far hills
  ctx.fillStyle = th.far; ctx.beginPath(); ctx.moveTo(0, GROUND);
  for (let x = 0; x <= W; x += 16) { const wx = x + cam * 0.25; ctx.lineTo(x, GROUND - 125 - Math.sin(wx * 0.004) * 40 - Math.sin(wx * 0.0113 + 1) * 20); }
  ctx.lineTo(W, GROUND); ctx.fill();

  // barns on the near layer
  const bc = cam * 0.5;
  for (let k = Math.floor((bc - 200) / 1400); k <= Math.floor((bc + W) / 1400); k++) drawBarn(k * 1400 + 500 - bc, GROUND - 40, th);

  // near hills
  ctx.fillStyle = th.near; ctx.beginPath(); ctx.moveTo(0, GROUND);
  for (let x = 0; x <= W; x += 16) { const wx = x + cam * 0.5; ctx.lineTo(x, GROUND - 45 - Math.sin(wx * 0.006 + 2) * 18 - Math.sin(wx * 0.017) * 8); }
  ctx.lineTo(W, GROUND); ctx.fill();

  // fence
  ctx.fillStyle = th.fence; const fo = mod(cam * 0.8, 70);
  for (let x = -fo; x < W + 70; x += 70) ctx.fillRect(x, GROUND - 38, 7, 38);
  ctx.fillRect(0, GROUND - 32, W, 5); ctx.fillRect(0, GROUND - 18, W, 5);
}
function drawGround(cam, th) {
  ctx.fillStyle = th.dirt; ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = th.dirt2;
  const o = mod(cam, 60);
  for (let x = -o - 60; x < W + 60; x += 60) { ctx.fillRect(x, GROUND + 26, 28, 6); ctx.fillRect(x + 32, GROUND + 48, 22, 5); }
  ctx.fillStyle = th.grass; ctx.fillRect(0, GROUND, W, 12);
  const t = mod(cam, 24);
  ctx.beginPath();
  for (let x = -t; x < W + 24; x += 24) { ctx.moveTo(x, GROUND + 1); ctx.lineTo(x + 5, GROUND - 7); ctx.lineTo(x + 10, GROUND + 1); }
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0, GROUND + 10, W, 3);
}

function drawSpike(o) {
  const tri = spikeTri(o).map(([x, y]) => [x - 3 * Math.sign(x - (o.x + o.w / 2)) - camX, y]);
  const g = ctx.createLinearGradient(o.x - camX, 0, o.x + o.w - camX, 0);
  g.addColorStop(0, '#e9eef3'); g.addColorStop(0.5, '#a9b3bd'); g.addColorStop(1, '#6d7680');
  ctx.fillStyle = g; ctx.strokeStyle = '#2d3238'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(...tri[0]); ctx.lineTo(...tri[2]); ctx.lineTo(...tri[1]); ctx.closePath(); ctx.fill(); ctx.stroke();
}
function drawHay(o) {
  const x = o.x - camX, y = o.side === 'floor' ? GROUND - o.h : 0;
  ctx.fillStyle = o.side === 'floor' ? '#e3b94a' : '#d9a840'; ctx.fillRect(x, y, o.w, o.h);
  ctx.strokeStyle = 'rgba(150,100,20,0.45)'; ctx.lineWidth = 1.5;
  for (let yy = y + 6; yy < y + o.h; yy += 9) line(x + 3, yy, x + o.w - 3, yy + ((yy * 7) % 5) - 2);
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 3;
  line(x + o.w * 0.28, y, x + o.w * 0.28, y + o.h); line(x + o.w * 0.72, y, x + o.w * 0.72, y + o.h);
  ctx.strokeStyle = '#9c7425'; ctx.lineWidth = 2.5; ctx.strokeRect(x, y, o.w, o.h);
}
function drawPan(o) {
  ctx.save(); ctx.translate(o.x - camX, o.y); ctx.rotate(o.rot);
  ctx.fillStyle = '#5b3a1e'; rrect(20, -5, 46, 10, 5); ctx.fill();
  ctx.fillStyle = '#2b2b2b'; circle(0, 0, 26); ctx.fill();
  ctx.fillStyle = '#444'; circle(0, 0, 21); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-2, 2, 12, 9, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffc61a'; circle(-1, 1, 5); ctx.fill();
  ctx.restore();
}
function drawFarmer(o) {
  const x = o.x - camX, g = farmerGeo(o), by = GROUND - g.lift, fx = x - 30;
  ctx.lineCap = 'round';
  // pitchfork
  ctx.strokeStyle = '#7b4a22'; ctx.lineWidth = 5; line(fx, g.tipY + 22, fx, g.tipY + 144);
  ctx.strokeStyle = '#a7b0ba'; ctx.lineWidth = 3;
  line(fx - 11, g.tipY + 22, fx + 11, g.tipY + 22);
  for (const dx of [-11, 0, 11]) line(fx + dx, g.tipY + 22, fx + dx, g.tipY + 1);
  // boots + legs
  ctx.fillStyle = '#2b1d14'; ctx.fillRect(x - 17, by - 8, 15, 8); ctx.fillRect(x + 2, by - 8, 15, 8);
  ctx.fillStyle = '#3b6fb6'; ctx.fillRect(x - 14, by - 46, 28, 38);
  ctx.fillStyle = '#2c548c'; ctx.fillRect(x - 1, by - 30, 2, 22);
  // shirt
  ctx.fillStyle = '#d63b3b'; rrect(x - 17, by - 82, 34, 40, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(80,0,0,0.35)'; ctx.lineWidth = 2;
  for (let yy = by - 76; yy < by - 44; yy += 8) line(x - 15, yy, x + 15, yy);
  // overall bib
  ctx.fillStyle = '#3b6fb6'; ctx.fillRect(x - 10, by - 68, 20, 24);
  ctx.strokeStyle = '#3b6fb6'; ctx.lineWidth = 3; line(x - 9, by - 68, x - 13, by - 80); line(x + 9, by - 68, x + 13, by - 80);
  // head
  ctx.fillStyle = '#f1c27d'; circle(x, by - 93, 13); ctx.fill();
  circle(x - 12, by - 90, 4); ctx.fill();
  ctx.fillStyle = '#8a5a2b'; ctx.beginPath(); ctx.arc(x, by - 88, 12, 0.2, Math.PI - 0.2); ctx.fill(); // beard
  ctx.fillStyle = '#222'; circle(x - 6, by - 96, 2); ctx.fill();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2.2; line(x - 11, by - 102, x - 2, by - 99);
  // hat
  ctx.fillStyle = '#e8c35a'; ellipse(x, by - 104, 25, 5); ctx.fill();
  rrect(x - 12, by - 118, 24, 15, 5); ctx.fill();
  ctx.fillStyle = '#b33'; ctx.fillRect(x - 12, by - 108, 24, 4);
  // arm
  ctx.strokeStyle = '#d63b3b'; ctx.lineWidth = 7; line(x - 9, by - 74, fx, g.handY);
  ctx.fillStyle = '#f1c27d'; circle(fx, g.handY, 5); ctx.fill();
}
function drawMud(cam) {
  const ex = level.end - cam;
  if (ex > W + 520 || ex < -620) return;
  // sign
  ctx.fillStyle = '#7b4a22'; ctx.fillRect(ex - 95, GROUND - 95, 8, 95);
  ctx.fillStyle = '#c8955a'; rrect(ex - 150, GROUND - 120, 112, 40, 8); ctx.fill();
  ctx.strokeStyle = '#7b4a22'; ctx.lineWidth = 3; ctx.stroke();
  ctx.font = `20px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#5a2340';
  ctx.fillText('MUD SPA', ex - 94, GROUND - 99);
  // mud back
  ctx.fillStyle = '#4a2f17'; ellipse(ex + 200, GROUND - 4, 235, 72); ctx.fill();
  // pigs relaxing (cheering when you win)
  const cheer = state === 'win' && splashed;
  const pigs = [[60, 1], [130, -1], [270, 1], [345, -1]];
  pigs.forEach(([px, f], i) => {
    const hop = cheer ? Math.abs(Math.sin(clock * 6 + i)) * 22 : 0;
    drawPig(ex + px, GROUND - 34 + Math.sin(clock * 2.5 + i) * 3 - hop, f * 0.08, 0, 0.8, false, f);
  });
  if (state === 'win' && splashed) drawPig(pig.x - cam, GROUND - 34 + Math.sin(clock * 3) * 3 - Math.abs(Math.sin(clock * 6)) * 14, 0, clock * 20, 0.9, true);
  // mud front
  const mg = ctx.createLinearGradient(0, GROUND - 40, 0, GROUND + 40);
  mg.addColorStop(0, '#7a5230'); mg.addColorStop(1, '#4a2f17');
  ctx.fillStyle = mg; ellipse(ex + 200, GROUND + 20, 245, 46); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ellipse(ex + 150, GROUND - 6, 70, 7); ctx.fill(); ellipse(ex + 300, GROUND, 40, 5); ctx.fill();
  ctx.fillStyle = 'rgba(122,82,48,0.9)';
  for (let i = 0; i < 4; i++) { const r = 4 + 3 * Math.abs(Math.sin(clock * 1.5 + i * 2)); circle(ex + 80 + i * 90, GROUND - 10, r); ctx.fill(); }
}

function drawParticles(cam) {
  for (const p of particles) {
    const a = clamp(p.life / p.max, 0, 1);
    ctx.globalAlpha = a;
    if (p.streak) { ctx.strokeStyle = p.col; ctx.lineWidth = p.size; line(p.x - cam, p.y, p.x - cam + p.streak, p.y); }
    else if (p.heart) { ctx.fillStyle = p.col; ctx.font = `${p.size}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('♥', p.x - cam, p.y); }
    else { ctx.fillStyle = p.col; circle(p.x - cam, p.y, p.size); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}

function drawHUD() {
  const p = clamp(pig.x / level.end, 0, 1);
  const bw = 360, bx = (W - bw) / 2, by = 16;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; rrect(bx - 4, by - 4, bw + 8, 22, 11); ctx.fill();
  ctx.fillStyle = '#ff8fb0'; rrect(bx, by, Math.max(14, bw * p), 14, 7); ctx.fill();
  text(`${Math.floor(p * 100)}%`, W / 2, by + 34, 18);
  text(`${levelIdx + 1}. ${level.name}`, 16, 24, 20, '#fff', 'left');
  text(`Attempt ${attempts}`, 16, 50, 16, '#ffe1ea', 'left');
  text(`${levelT.toFixed(2)}s`, W - 16, 24, 20, '#fff', 'right');
  if (muted) text('MUTED', W - 16, 50, 14, '#ffe1ea', 'right');
  if (state === 'playing' && keys.boost) text('⚡ BOOST', W - 16, H - 28, 24, '#ffe14d', 'right');
  if (state === 'playing' && attempts === 1 && levelT < 2.5) {
    ctx.globalAlpha = clamp(2.5 - levelT, 0, 1);
    text('Hold SPACE to fly  •  Hold SHIFT to go faster', W / 2, H / 2 - 60, 26);
    ctx.globalAlpha = 1;
  }
  if (state === 'dead') {
    const s = 1 + Math.max(0, 0.4 - deadT) * 2;
    ctx.save(); ctx.translate(W / 2, H / 2 - 50); ctx.scale(s, s);
    text('BACON!', 0, 0, 84, '#ff6f4d', 'center', '#5a1a0e');
    ctx.restore();
    text(quip, W / 2, H / 2 + 20, 28);
  }
}

function render() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const th = THEMES[state === 'menu' ? Math.floor(menuCam / 3000) % 3 : level.theme];
  const cam = state === 'menu' ? menuCam : camX;
  ctx.save();
  if (shake > 0) ctx.translate(rand(-shake, shake), rand(-shake, shake));
  drawBackground(cam, th);
  drawGround(cam, th);

  if (state === 'menu') {
    drawPig(PIG_SX + 40, 250 + Math.sin(clock * 2) * 50, Math.cos(clock * 2) * -0.25, clock * 22);
  } else {
    drawMud(camX);
    for (const o of objs) {
      if (o.x + (o.w || 60) < camX - 80 || o.x > camX + W + 80) continue;
      if (o.t === 'spike') drawSpike(o);
      else if (o.t === 'hay') drawHay(o);
      else if (o.t === 'farmer') drawFarmer(o);
      else if (o.t === 'pan') drawPan(o);
    }
    if (state === 'dead' && bacon) drawBacon(bacon.x - camX, bacon.y, bacon.rot);
    else if (!(state === 'win' && splashed)) drawPig(pig.x - camX, pig.y, pig.ang, pig.flap);
    drawParticles(camX);
  }
  ctx.restore();
  if (state !== 'menu') drawHUD();
}

// ---------- UI ----------
function hideAll() { ['menu', 'win', 'pause'].forEach(id => $(id).classList.add('hidden')); }
function blurAll() { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
function buildMenu() {
  const el = $('levels'); el.innerHTML = '';
  LEVELS.forEach((L, i) => {
    const b = document.createElement('button');
    b.className = 'lvl' + (bests[i] ? ' done' : '');
    b.innerHTML = `<span class="num">${i + 1}</span><span class="name">${L.name}</span><span class="best">${bests[i] ? 'Best: ' + bests[i].toFixed(2) + 's' : 'Not cleared yet'}</span>`;
    b.onclick = () => { blurAll(); startLevel(i); };
    el.appendChild(b);
  });
}
function showMenu() { hideAll(); buildMenu(); state = 'menu'; $('menu').classList.remove('hidden'); }
function showWin() {
  const last = levelIdx === LEVELS.length - 1;
  $('winTitle').textContent = last ? 'Hog Heaven! You beat every level!' : 'Made it to the mud!';
  $('winStats').textContent = `Time: ${winTime.toFixed(2)}s  •  Attempts: ${attempts}${newBest ? '  •  New best!' : ''}`;
  $('nextBtn').style.display = last ? 'none' : '';
  $('win').classList.remove('hidden');
}
function togglePause() {
  if (state === 'playing') { state = 'paused'; $('pause').classList.remove('hidden'); keys.up = false; }
  else if (state === 'paused') { state = 'playing'; $('pause').classList.add('hidden'); }
}
function nextLevel() { if (levelIdx < LEVELS.length - 1) startLevel(levelIdx + 1); else showMenu(); }

$('nextBtn').onclick = () => { blurAll(); nextLevel(); };
$('replayBtn').onclick = () => { blurAll(); startLevel(levelIdx); };
$('menuBtn').onclick = () => { blurAll(); showMenu(); };
$('resumeBtn').onclick = () => { blurAll(); togglePause(); };
$('quitBtn').onclick = () => { blurAll(); showMenu(); };

// ---------- Input ----------
function pressUp() {
  audio();
  if (state === 'menu') { const first = LEVELS.findIndex((_, i) => !bests[i]); startLevel(first < 0 ? 0 : first); return; }
  if (state === 'playing') { sfx.flap(); for (let i = 0; i < 3; i++) particles.push({ x: pig.x - 8, y: pig.y + 16, vx: rand(-90, -30), vy: rand(40, 120), life: 0.35, max: 0.35, size: rand(3, 5), col: 'rgba(255,255,255,0.8)', g: 0 }); }
  if (state === 'dead' && deadT > 0.4) resetAttempt();
  if (state === 'win' && winT > 1.6) nextLevel();
}
const UP_KEYS = ['Space', 'ArrowUp', 'KeyW'];
addEventListener('keydown', e => {
  if (UP_KEYS.includes(e.code)) {
    e.preventDefault();
    if (!e.repeat) { keys.up = true; pressUp(); }
  } else if (e.key === 'Shift') {
    if (!keys.boost && state === 'playing') sfx.boost();
    keys.boost = true;
  } else if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
  else if (e.code === 'KeyM') muted = !muted;
  else if (e.code === 'KeyR' && (state === 'playing' || state === 'dead')) resetAttempt();
  else if (e.code === 'Enter' && state === 'win' && winT > 1.6) nextLevel();
});
addEventListener('keyup', e => {
  if (UP_KEYS.includes(e.code)) { e.preventDefault(); keys.up = false; }
  else if (e.key === 'Shift') keys.boost = false;
});
canvas.addEventListener('pointerdown', e => { e.preventDefault(); keys.up = true; pressUp(); });
addEventListener('pointerup', () => { keys.up = false; });
addEventListener('blur', () => { keys.up = false; keys.boost = false; if (state === 'playing') togglePause(); });

// ---------- Main loop ----------
let last = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (state !== 'paused') {
    acc += dt;
    while (acc >= STEP) { update(STEP); acc -= STEP; }
  }
  render();
  requestAnimationFrame(frame);
}
showMenu();
requestAnimationFrame(frame);

// Exposed for debugging in the console
window.__pig = {
  get state() { return state; }, get pig() { return pig; }, startLevel, LEVELS, keys, update,
  snap: () => JSON.stringify({ pig, levelT, camX, state, pans: objs.map(o => o.t === 'pan' ? [o.x, o.y, o.rot, o.active] : null) }),
  restore: s => { const d = JSON.parse(s); pig = d.pig; levelT = d.levelT; camX = d.camX; state = d.state; particles = []; d.pans.forEach((p, i) => { if (p) [objs[i].x, objs[i].y, objs[i].rot, objs[i].active] = p; }); },
};
})();
