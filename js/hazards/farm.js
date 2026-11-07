'use strict';
// Hamlet Farms hazards: spikes, hay bales, frying pans, farmers and meat cleavers.
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
function cleaverGeo(o) {
  const a = o.amp * Math.sin(2 * Math.PI * levelT / o.per + o.ph);
  const sx = Math.sin(a), cy = Math.cos(a);
  return { a, hx: o.x + sx * (o.len - 10), hy: cy * (o.len - 10), bx: o.x + sx * (o.len + 8), by: cy * (o.len + 8) };
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
function drawCleaver(o) {
  const g = cleaverGeo(o), L = o.len;
  ctx.save(); ctx.translate(o.x - camX, 0); ctx.rotate(-g.a);
  // chain
  ctx.strokeStyle = '#59606a'; ctx.lineWidth = 3;
  for (let y = 0; y < L - 34; y += 14) { ellipse(0, y + 7, 3.5, 6); ctx.stroke(); }
  // handle
  ctx.fillStyle = '#6b3d1e'; rrect(-6, L - 36, 12, 26, 4); ctx.fill();
  ctx.fillStyle = '#c9cfd6'; circle(0, L - 30, 2); ctx.fill(); circle(0, L - 18, 2); ctx.fill();
  // blade
  const bg = ctx.createLinearGradient(-24, 0, 24, 0);
  bg.addColorStop(0, '#f1f4f7'); bg.addColorStop(0.55, '#b5bec7'); bg.addColorStop(1, '#7c8590');
  ctx.fillStyle = bg; ctx.strokeStyle = '#2d3238'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-24, L - 12); ctx.lineTo(24, L - 12); ctx.lineTo(26, L + 26); ctx.quadraticCurveTo(0, L + 32, -26, L + 26); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-23, L + 23); ctx.quadraticCurveTo(0, L + 28, 23, L + 23); ctx.stroke();
  ctx.fillStyle = 'rgba(40,40,50,0.65)'; circle(14, L - 2, 4); ctx.fill();
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

// spikes(x, count, 'floor'|'ceil', height, base): a row of spikes, optionally sitting on top of something
defineBuild('spikes', (b, x, n, side = 'floor', h = 50, base = 0) => { for (let i = 0; i < n; i++) b.add({ t: 'spike', x: x + i * 40, w: 40, h, side, base }); });
defineHazard('spike', {
  hits: (o, cx, cy, r) => circTri(cx, cy, r - 2, spikeTri(o)),
  draw: drawSpike,
  blocksCoin: (o, it) => it.x >= o.x - 40 && it.x <= o.x + o.w + 40 && hits(o, it.x, it.y, 20),
  quips: ['Pork-upine\'d!', 'Shish ka-bacon!', 'Pork on a stick!', 'Got the point?'],
});

defineBuild('hay', (b, x, w, h, side = 'floor') => b.add({ t: 'hay', x, w, h, side }));
// tower = hay bale topped with spikes
defineBuild('tower', (b, x, w, h, side = 'floor') => { b.hay(x, w, h - 40, side); b.spikes(x, Math.round(w / 40), side, 40, h - 40); });
defineHazard('hay', {
  hits: (o, cx, cy, r) => o.side === 'floor' ? circRect(cx, cy, r, o.x, GROUND - o.h, o.w, o.h) : circRect(cx, cy, r, o.x, 0, o.w, o.h),
  draw: drawHay,
  blocksCoin: (o, it) => it.x >= o.x - 40 && it.x <= o.x + o.w + 40 && hits(o, it.x, it.y, 20),
  quips: ['Hay! Watch it!', 'Bale-d out.', 'Hit the hay. Hard.'],
});

// pan(meet, y, wobble, speed): "meet" = roughly where the pan reaches the pig (pans fly toward you once on screen)
defineBuild('pan', (b, meet, y, wob = 0, spd = 200) => {
  const x = meet + spd * 800 / (b.speed + spd);
  b.add({ t: 'pan', x, w: 50, y0: y, y, wob, spd, ph: x * 0.01, rot: 0, active: false });
});
defineHazard('pan', {
  hits: (o, cx, cy, r) => { const dx = cx - o.x, dy = cy - o.y; return dx * dx + dy * dy < (r + 22) * (r + 22); },
  update(o, dt) {
    if (!o.active && o.x - camX < W + 60) o.active = true;
    if (o.active) { o.x -= o.spd * dt; o.rot -= dt * 9; o.y = o.y0 + Math.sin(levelT * 3 + o.ph) * o.wob; }
  },
  draw: drawPan,
  quips: ['Pan-fried!', 'Out of the frying pan...', 'Sunny side down.', 'Pan-demonium!'],
});

// farmer(x, minReach, maxReach, period, phase): pokes a pitchfork up and down
defineBuild('farmer', (b, x, min, max, per = 2, ph = 0) => b.add({ t: 'farmer', x, w: 40, min, max, per, ph }));
defineHazard('farmer', {
  hits(o, cx, cy, r) {
    const g = farmerGeo(o), by = GROUND - g.lift, fx = o.x - 30;
    return circRect(cx, cy, r, o.x - 17, by - 116, 34, 116) ||
           circRect(cx, cy, r, fx - 3, g.tipY + 22, 6, 122) ||
           circRect(cx, cy, r, fx - 12, g.tipY, 24, 22);
  },
  draw: drawFarmer,
  blocksCoin: (o, it) => Math.abs(o.x - 15 - it.x) < 45 && it.y > GROUND - o.max - 30,
  quips: ['Pitch-forked!', 'Fork-ed over.', 'Old MacDonald says hi.', 'Fork it over!'],
});

// cleaver(x, chainLength, swingAngle (rad), period, phase): meat cleaver swinging on a chain from the sky
defineBuild('cleaver', (b, x, len, amp = 0.8, per = 2, ph = 0) => b.add({ t: 'cleaver', x, w: 0, len, amp, per, ph, reach: len * Math.sin(amp) + 40 }));
defineHazard('cleaver', {
  hits(o, cx, cy, r) {
    const g = cleaverGeo(o), dx = cx - g.bx, dy = cy - g.by;
    return dx * dx + dy * dy < (r + 22) * (r + 22) || segDist2(cx, cy, o.x, 0, g.hx, g.hy) < (r + 3) * (r + 3);
  },
  draw: drawCleaver,
  quips: ['Chop chop!', 'Pork chopped!', 'Cleaved it to chance.', 'Cut the mustard. And you.'],
});
