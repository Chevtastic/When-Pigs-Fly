'use strict';
// Game state, physics, collisions and the in-level renderer.
// ---------- Game state ----------
let state = 'menu';          // menu | map (island) | area (level cards) | playing | dead | win | paused
let level = ALL_LEVELS[0], objs = [], items = [];
let pig, camX = 0, levelT = 0, attempts = 0;
let particles = [], bacon = null, lostHat = null, deadT = 0, winT = 0, quip = '', shake = 0;
let menuCam = 0, clock = 0, splashed = false, newBest = false, winTime = 0;
let runCoins = 0, runEggs = 0, winInfo = null, shopOpen = false, shopSel = {}, shopFrom = 'menu';
const keys = { up: false, boost: false };
const input = { kbUp: false, kbBoost: false, ptrs: new Set(), boostPtr: null };
function syncKeys() {
  keys.up = input.kbUp || input.ptrs.size > 0;
  const b = input.kbBoost || input.boostPtr !== null;
  if (b && !keys.boost && state === 'playing') sfx.boost();
  keys.boost = b;
}

function newPig() { return { x: 0, y: 300, vy: 0, flap: 0, ang: 0, ground: false }; }
pig = newPig();

// accepts a level object, a level id ('farm-2') or an index into ALL_LEVELS
function startLevel(L) {
  level = typeof L === 'object' ? L : LEVEL_BY_ID[L] || ALL_LEVELS[L]; attempts = 0;
  save.mapAt = level.id;
  hideAll();
  startMusic();
  if (isTouch && !autoFsTried) { autoFsTried = true; enterFullscreen(); }
  resetAttempt();
}
function pruneCoins(list) {
  return list.filter(it => {
    if (it.t !== 'coin') return true;
    if (it.y < 30 || it.y > GROUND - 14) return false;
    for (const o of objs) { const h = HAZARDS[o.t]; if (h.blocksCoin && h.blocksCoin(o, it)) return false; }
    return true;
  });
}
function resetAttempt() {
  if (state === 'dead' || state === 'playing') persist();
  attempts++;
  const b = level.build();
  objs = b.objs;
  items = pruneCoins(b.items);
  pig = newPig();
  camX = pig.x - PIG_SX;
  levelT = 0; particles = []; bacon = null; lostHat = null; shake = 0; splashed = false;
  trail.list = []; trail.acc = 0;
  runCoins = 0; runEggs = 0;
  state = 'playing';
}
function die(cause) {
  state = 'dead'; deadT = 0;
  bacon = { x: pig.x, y: pig.y, vx: 60, vy: -520, rot: 0, vr: 7 };
  if (save.hat) lostHat = { x: pig.x + 18, y: pig.y - 24, vx: rand(80, 180), vy: -620, rot: 0, vr: rand(6, 10) };
  quip = CAUSE_QUIPS[cause] && Math.random() < 0.5 ? pick(CAUSE_QUIPS[cause]) : pick(QUIPS);
  shake = 14;
  for (let i = 0; i < 26; i++) particles.push({ x: pig.x, y: pig.y, vx: rand(-260, 260), vy: rand(-420, 80), life: rand(0.5, 1.1), max: 1.1, size: rand(3, 7), col: Math.random() < 0.5 ? '#ffb3c8' : '#ffe08a', g: 900 });
  for (let i = 0; i < 10; i++) particles.push({ x: pig.x, y: pig.y, vx: rand(-60, 60), vy: rand(-120, -40), life: rand(0.8, 1.4), max: 1.4, size: rand(8, 14), col: 'rgba(230,230,230,0.6)', g: -40 });
  sfx.oink(); sfx.sizzle();
  persist();
}
function win() {
  state = 'win'; winT = 0; winTime = levelT;
  pig.sx = pig.x; pig.sy = pig.y;
  const prev = save.bests[level.id];
  const firstClear = !prev;
  newBest = !prev || winTime < prev;
  if (newBest) save.bests[level.id] = winTime;
  const prevEggs = levelEggs(level.id);
  const freshEggs = runEggs & ~prevEggs;
  save.eggs[level.id] = prevEggs | runEggs;
  const bonus = 10 + (firstClear ? 40 : 0) + bits(freshEggs) * 25;
  save.coins += bonus;
  winInfo = { firstClear, freshEggs, bonus, title: pick(WIN_TITLES) };
  persist();
  sfx.win();
}

function pigHit() {
  const circles = [[pig.x, pig.y + 2, 16], [pig.x + 20, pig.y - 6, 12]];
  for (const o of objs) {
    if (Math.abs(o.x - pig.x) > 260 + (o.reach || 0)) continue;
    for (const [cx, cy, r] of circles) if (hits(o, cx, cy, r)) return o.t;
  }
  return null;
}
function collect() {
  const px = pig.x + 6, py = pig.y - 3;
  for (const it of items) {
    if (it.got || Math.abs(it.x - px) > 50) continue;
    const r = it.t === 'egg' ? 32 : 30;
    const dx = it.x - px, dy = it.y - py;
    if (dx * dx + dy * dy > r * r) continue;
    it.got = true;
    if (it.t === 'coin') {
      runCoins++; save.coins++;
      sfx.coin();
      for (let i = 0; i < 5; i++) particles.push({ x: it.x, y: it.y, vx: rand(-90, 90), vy: rand(-140, 20), life: 0.35, max: 0.35, size: rand(2, 3.5), col: '#fff3a0', g: 300 });
      if (runCoins % 20 === 0) popText(pick(COIN_POPS), it.x, it.y - 30, '#ffe14d', 24);
    } else {
      runEggs |= 1 << it.id;
      sfx.egg(); shake = Math.max(shake, 4);
      for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; particles.push({ x: it.x, y: it.y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, life: 0.6, max: 0.6, size: rand(2.5, 4.5), col: i % 2 ? '#ffd84a' : '#fff', g: 0 }); }
      popText(pick(EGG_POPS), it.x, it.y - 40, '#ffd84a', 34);
    }
  }
}
function popText(txt, x, y, col, size) { particles.push({ x, y, vx: 0, vy: -50, life: 1.1, max: 1.1, size, col, g: 0, txt }); }

// ---------- Update ----------
function update(dt) {
  clock += dt;
  if (state === 'playing') surfWant = 0; // the tidal wave sets it again if one is rolling
  if (shake > 0) shake = Math.max(0, shake - dt * 40);

  if (state === 'menu') {
    menuCam += 140 * dt;
    emitFx(menuTrail, save.fx, PIG_SX + 26, 250 + Math.sin(clock * 2) * 50, dt, { ang: Math.cos(clock * 2) * -0.25, flap: clock * 22, look: myLook() }, -260);
  }
  if (state === 'map' || state === 'area') updateMap(dt);
  stepFx(menuTrail, dt);
  stepFx(trail, dt);
  if ((state === 'playing' || (state === 'win' && !splashed)) && pig) emitFx(trail, save.fx, pig.x - 14, pig.y, dt, { ang: pig.ang, flap: pig.flap, look: myLook() });

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

    for (const o of objs) { const h = HAZARDS[o.t]; if (h.update) h.update(o, dt); }

    if (keys.boost && Math.random() < dt * 60) particles.push({ x: pig.x - 30, y: pig.y + rand(-18, 18), vx: -300, vy: 0, life: 0.25, max: 0.25, size: 2, col: 'rgba(255,255,255,0.8)', g: 0, streak: rand(30, 70) });
    if (pig.ground && Math.random() < dt * 25) particles.push({ x: pig.x - 10, y: GROUND - 4, vx: rand(-120, -40), vy: rand(-80, -20), life: 0.4, max: 0.4, size: rand(3, 5), col: 'rgba(140,100,60,0.7)', g: 200 });

    collect();
    const hit = pigHit();
    if (hit) die(hit);
    else if (pig.x >= level.end) win();
  } else if (state === 'dead') {
    deadT += dt;
    if (bacon) {
      bacon.vy += 1500 * dt; bacon.x += bacon.vx * dt; bacon.y += bacon.vy * dt; bacon.rot += bacon.vr * dt;
      if (bacon.y > GROUND - 8) { bacon.y = GROUND - 8; bacon.vy *= -0.35; bacon.vx *= 0.6; bacon.vr *= 0.5; }
      if (Math.random() < dt * 14) particles.push({ x: bacon.x + rand(-20, 20), y: bacon.y - 8, vx: rand(-15, 15), vy: rand(-90, -50), life: 0.9, max: 0.9, size: rand(5, 9), col: 'rgba(240,240,240,0.5)', g: -20 });
    }
    if (lostHat) {
      lostHat.vy += 1300 * dt; lostHat.x += lostHat.vx * dt; lostHat.y += lostHat.vy * dt; lostHat.rot += lostHat.vr * dt;
      if (lostHat.y > GROUND - 10) { lostHat.y = GROUND - 10; lostHat.vy *= -0.3; lostHat.vx *= 0.5; lostHat.vr *= 0.4; }
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
      // a little party: confetti from both sides, a cheer and a "LEVEL CLEAR!" pop
      const CONF = ['#ff6f9c', '#ffe14d', '#4cd964', '#3fb6e8', '#b57bff', '#ff8a1e'];
      for (let i = 0; i < 70; i++) {
        const side = i % 2 ? 1 : -1;
        particles.push({ x: camX + W / 2 + side * rand(380, 480), y: GROUND + 10, vx: -side * rand(120, 380), vy: rand(-760, -480), life: rand(1.6, 2.4), max: 2.4,
          size: rand(5, 9), col: CONF[i % CONF.length], g: 560, conf: true, rot: rand(0, 6), vr: rand(-12, 12) });
      }
      particles.push({ x: camX + W / 2, y: 150, vx: 0, vy: -12, life: 1.5, max: 1.5, size: 54, col: '#ffe14d', g: 0, txt: 'LEVEL CLEAR!', pop: true });
      sfx.cheer();
    }
    if (splashed && Math.random() < dt * 8) particles.push({ x: level.end + rand(40, 360), y: GROUND - 50, vx: rand(-20, 20), vy: rand(-70, -40), life: 1.6, max: 1.6, size: 18, col: '#ff6f9c', g: 0, heart: true });
    if (winT > 1.6 && $('win').classList.contains('hidden') && !shopOpen) showWin();
  }

  for (const p of particles) { p.life -= dt; p.vy += p.g * dt; if (p.conf) { p.vx *= 1 - dt * 1.2; p.vy = Math.min(p.vy, 140); } p.x += p.vx * dt; p.y += p.vy * dt; }
  particles = particles.filter(p => p.life > 0);
}

function drawItems() {
  for (const it of items) {
    if (it.got || it.x < camX - 40 || it.x > camX + W + 40) continue;
    const x = it.x - camX;
    if (it.t === 'coin') drawCoin(x, it.y);
    else drawEgg(x, it.y + Math.sin(clock * 3 + it.id) * 4, 1, levelEggs(level.id) & (1 << it.id) ? 'ghost' : 'full');
  }
}
// The mud spa at the end of a level, where the other pigs wait. Bacon Bay's is a beach spa: a surfboard sign,
// tiki torches, a palm, a beach umbrella, starfish on the sand and the pigs lounging in rubber rings.
function drawMud(cam) {
  const ex = level.end - cam, beach = level.area && level.area.id === 'beach';
  if (ex > W + 520 || ex < -620) return;
  const cheer = state === 'win' && splashed;
  const pigs = [[60, 1], [130, -1], [270, 1], [345, -1]].map(([px, f], i) =>
    [ex + px, GROUND - 34 + Math.sin(clock * 2.5 + i) * 3 - (cheer ? Math.abs(Math.sin(clock * 6 + i)) * 22 : 0), f]);
  if (beach) drawBeachSpaBack(ex);
  // sign
  if (beach) drawSurfSign(ex - 94, GROUND);
  else {
    ctx.fillStyle = '#7b4a22'; ctx.fillRect(ex - 95, GROUND - 95, 8, 95);
    ctx.fillStyle = '#c8955a'; rrect(ex - 150, GROUND - 120, 112, 40, 8); ctx.fill();
    ctx.strokeStyle = '#7b4a22'; ctx.lineWidth = 3; ctx.stroke();
    ctx.font = `20px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#5a2340';
    ctx.fillText('MUD SPA', ex - 94, GROUND - 99);
  }
  // mud back
  ctx.fillStyle = '#4a2f17'; ellipse(ex + 200, GROUND - 4, 235, 72); ctx.fill();
  // pigs relaxing (cheering when you win)
  for (const [x, y, f] of pigs) drawPig(x, y, f * 0.08, 0, 0.8, false, f);
  if (cheer) drawPig(pig.x - cam, GROUND - 34 + Math.sin(clock * 3) * 3 - Math.abs(Math.sin(clock * 6)) * 14, 0, clock * 20, 0.9, true, 1, myLook());
  // mud front
  const mg = ctx.createLinearGradient(0, GROUND - 40, 0, GROUND + 40);
  mg.addColorStop(0, '#7a5230'); mg.addColorStop(1, '#4a2f17');
  if (beach) { ctx.fillStyle = '#e9c98a'; ellipse(ex + 200, GROUND + 24, 256, 52); ctx.fill(); } // sandy rim
  ctx.fillStyle = mg; ellipse(ex + 200, GROUND + 20, 245, 46); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ellipse(ex + 150, GROUND - 6, 70, 7); ctx.fill(); ellipse(ex + 300, GROUND, 40, 5); ctx.fill();
  ctx.fillStyle = 'rgba(122,82,48,0.9)';
  for (let i = 0; i < 4; i++) { const r = 4 + 3 * Math.abs(Math.sin(clock * 1.5 + i * 2)); circle(ex + 80 + i * 90, GROUND - 10, r); ctx.fill(); }
  if (beach) {
    pigs.forEach(([x, y], i) => { if (i % 3 === 0) drawRing(x, y + 22, i ? '#ff6f9c' : '#3fb6e8'); }); // rubber rings
    drawStarfish(ex - 10, GROUND + 48, 9, 0.3); drawStarfish(ex + 420, GROUND + 40, 7, -0.5);
    ctx.fillStyle = '#fff3e0'; ellipse(ex + 455, GROUND + 52, 6, 4); ctx.fill(); // a shell
  }
}
function drawBeachSpaBack(ex) {
  const palm = spr('palm');
  if (palm) { const h = 300, w = h * palm.width / palm.height; drawSpr(palm, ex + 400, GROUND + 8 - h, w, h, true); }
  // beach umbrella leaning over the pool
  ctx.save(); ctx.translate(ex + 330, GROUND - 4); ctx.rotate(-0.18);
  ctx.strokeStyle = '#7b4a22'; ctx.lineWidth = 5; line(0, 0, 0, -150);
  for (let k = 0; k < 6; k++) {
    ctx.fillStyle = k % 2 ? '#fff6e8' : '#ff5a5f';
    ctx.beginPath(); ctx.moveTo(0, -150); ctx.arc(0, -150, 86, Math.PI + k * Math.PI / 6, Math.PI + (k + 1) * Math.PI / 6); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // tiki torches either side of the pool
  for (const tx of [ex - 6, ex + 440]) {
    ctx.fillStyle = '#a8743f'; ctx.fillRect(tx - 4, GROUND - 112, 8, 112);
    ctx.fillStyle = '#6e4526'; for (let y = GROUND - 100; y < GROUND; y += 22) ctx.fillRect(tx - 4, y, 8, 3);
    ctx.fillStyle = '#8a5a32'; rrect(tx - 9, GROUND - 126, 18, 18, 4); ctx.fill();
    const f = Math.sin(clock * 13 + tx) * 2;
    ctx.fillStyle = '#ff8a1e'; ellipse(tx + f * 0.5, GROUND - 138, 9, 16 + f); ctx.fill();
    ctx.fillStyle = '#ffe14d'; ellipse(tx + f * 0.3, GROUND - 134, 5, 9 + f * 0.5); ctx.fill();
  }
}
function drawSurfSign(x, y) { // a surfboard stuck in the sand, saying MUD SPA
  ctx.save(); ctx.translate(x, y + 6); ctx.rotate(-0.12);
  ctx.fillStyle = '#3fb6e8'; ellipse(0, -78, 30, 84); ctx.fill();
  ctx.strokeStyle = '#1d6f99'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#fff6e8'; ctx.fillRect(-4, -158, 8, 160);
  ctx.fillStyle = '#ff6f9c'; ctx.fillRect(-30, -40, 60, 6);
  ctx.restore();
  ctx.fillStyle = '#c8955a'; rrect(x - 56, y - 128, 112, 36, 8); ctx.fill(); // plaque across it
  ctx.strokeStyle = '#7b4a22'; ctx.lineWidth = 3; ctx.stroke();
  ctx.font = `20px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#5a2340';
  ctx.fillText('MUD SPA', x, y - 109);
  text('🌺', x + 52, y - 128, 18, '#fff', 'center', 'rgba(0,0,0,0)');
}
function drawRing(x, y, col) { // rubber ring round a lounging pig
  ctx.save(); ctx.lineWidth = 9;
  ctx.strokeStyle = col; ctx.beginPath(); ctx.ellipse(x, y, 30, 9, 0, 0, Math.PI); ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.setLineDash([9, 13]); ctx.beginPath(); ctx.ellipse(x, y, 30, 9, 0, 0, Math.PI); ctx.stroke();
  ctx.restore();
}
function drawStarfish(x, y, r, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = '#ff8a5c'; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.42 : r, t = i * Math.PI / 5 - Math.PI / 2; ctx.lineTo(Math.cos(t) * rr, Math.sin(t) * rr); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}

function drawParticles(cam) {
  for (const p of particles) {
    const a = clamp(p.life / p.max, 0, 1);
    ctx.globalAlpha = p.txt ? clamp(a * 2, 0, 1) : a;
    if (p.txt) text(p.txt, p.x - cam, p.y, p.pop ? p.size * (1 + 0.5 * clamp(1 - (p.max - p.life) / 0.18, 0, 1)) : p.size, p.col);
    else if (p.conf) { // a fluttering scrap of confetti
      ctx.save(); ctx.translate(p.x - cam, p.y); ctx.rotate(p.rot + p.vr * (p.max - p.life));
      ctx.fillStyle = p.col; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2 * Math.abs(Math.cos(clock * 9 + p.rot))); ctx.restore();
    }
    else if (p.streak) { ctx.strokeStyle = p.col; ctx.lineWidth = p.size; line(p.x - cam, p.y, p.x - cam + p.streak, p.y); }
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
  // egg markers on the progress bar
  for (const it of items) if (it.t === 'egg') drawEgg(bx + bw * clamp(it.x / level.end, 0, 1), by + 7, 0.42, it.got ? 'full' : 'none');
  text(`${Math.floor(p * 100)}%`, W / 2, by + 34, 18);
  text(`${level.num}. ${level.name}`, 16, 24, 20, '#fff', 'left');
  text(`Attempt ${attempts}`, 16, 50, 16, '#ffe1ea', 'left');
  // coins + eggs
  drawCoin(28, 80, 11);
  text(`${runCoins}`, 46, 81, 20, '#ffe14d', 'left');
  const saved = levelEggs(level.id);
  for (let i = 0; i < 3; i++) {
    const mode = runEggs & (1 << i) ? 'full' : saved & (1 << i) ? 'ghost' : 'none';
    drawEgg(108 + i * 24, 80, 0.6, mode);
  }
  text(`${levelT.toFixed(2)}s`, W - 16, 82, 20, '#fff', 'right');
  if (muted()) text('MUTED', W - 16, 106, 14, '#ffe1ea', 'right');
  if (state === 'playing' && keys.boost) text('⚡ BOOST', isTouch ? W - 140 : W - 16, H - 28, 24, '#ffe14d', 'right');
  if (state === 'playing' && attempts === 1 && levelT < 2.5) {
    ctx.globalAlpha = clamp(2.5 - levelT, 0, 1);
    text(isTouch ? 'Hold anywhere to fly  •  Hold ⚡ to go faster' : 'Hold SPACE to fly  •  Hold SHIFT to go faster', W / 2, H / 2 - 60, 26);
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
  if (state === 'map' || state === 'area') { drawOverworld(); if (shopOpen) drawPreview(); syncHudButtons(); return; }
  const th = THEMES[state === 'menu' ? Math.floor(menuCam / 3000) % THEMES.length : level.theme];
  const cam = state === 'menu' ? menuCam : camX;
  ctx.save();
  if (shake > 0) ctx.translate(rand(-shake, shake), rand(-shake, shake));
  drawBackground(cam, th);
  drawGround(cam, th);

  if (state === 'menu') {
    drawTrail(menuTrail.list, 0);
    drawPig(PIG_SX + 40, 250 + Math.sin(clock * 2) * 50, Math.cos(clock * 2) * -0.25, clock * 22, 1, true, 1, myLook());
  } else {
    drawMud(camX);
    for (const back of [true, false]) for (const o of objs) { // 'back' hazards (scenery like palm trees) first
      const r = o.reach || 0;
      if (!HAZARDS[o.t].back !== !back || o.x + (o.w || 60) + r < camX - 80 || o.x - r > camX + W + 80) continue;
      HAZARDS[o.t].draw(o);
    }
    drawItems();
    drawTrail(trail.list, camX);
    if (state === 'dead' && bacon) drawBacon(bacon.x - camX, bacon.y, bacon.rot);
    else if (!(state === 'win' && splashed)) drawPig(pig.x - camX, pig.y, pig.ang, pig.flap, 1, true, 1, myLook());
    if (state === 'dead' && lostHat && HAT_BY_ID[save.hat]) {
      ctx.save(); ctx.translate(lostHat.x - camX, lostHat.y); ctx.rotate(lostHat.rot); ctx.translate(0, 10);
      hatImage(HAT_BY_ID[save.hat]); ctx.restore();
    }
    drawParticles(camX);
  }
  ctx.restore();
  drawWeather(th, cam);
  if (state !== 'menu') drawHUD();
  if (shopOpen) drawPreview();
  syncHudButtons();
}
