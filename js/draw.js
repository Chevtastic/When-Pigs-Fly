'use strict';
// Drawing helpers: shapes, text, the pig, coins, eggs and the scrolling backgrounds.
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

// Draws a hat image with its brim's bottom-centre at the current origin
function hatImage(h) {
  if (!h.img.complete || !h.img.naturalWidth) return;
  const [bx, by, bw, bh] = h.box, w = h.w || 38, hh = bh * w / bw;
  ctx.drawImage(h.img, bx, by, bw, bh, -w / 2, -hh, w, hh);
}
function drawHatOnHead(id) {
  const h = HAT_BY_ID[id]; if (!h) return;
  ctx.save(); ctx.translate(18 + (h.dx || 0), -14 + (h.dy || 0)); ctx.rotate(h.r ?? -0.12);
  hatImage(h);
  ctx.restore();
}
// look = { hat, wing, fx } (any may be missing)
function drawPig(x, y, ang, flap, s = 1, wings = true, flip = 1, look = null) {
  const hat = look && look.hat, wg = (look && WING_BY_ID[look.wing]) || WINGS[0], fx = look && FX_BY_ID[look.fx];
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s * flip, s);
  const wa = Math.sin(flap * (wg.flap || 1)) * 0.7;
  if (fx && fx.aura) drawAura(fx.aura, false, hat);
  if (wings) { ctx.save(); ctx.translate(-2, -14); ctx.rotate(-0.5 + wa); drawWing(wg, true); ctx.restore(); }
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
  if (hat) drawHatOnHead(hat);
  if (wings) { ctx.save(); ctx.translate(-5, -11); ctx.rotate(-0.2 - wa); drawWing(wg, false); ctx.restore(); }
  if (fx && fx.aura) drawAura(fx.aura, true, hat);
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
  if (th.weather === 'snow') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x - 10, y - 66); ctx.lineTo(x + 45, y - 112); ctx.lineTo(x + 100, y - 66); ctx.lineTo(x + 88, y - 72); ctx.lineTo(x + 45, y - 100); ctx.lineTo(x + 2, y - 72); ctx.closePath(); ctx.fill(); }
}
function drawCactus(x, y) {
  ctx.fillStyle = '#4f7a3a';
  rrect(x - 7, y - 54, 14, 54, 7); ctx.fill();
  rrect(x - 22, y - 38, 10, 22, 5); ctx.fill(); ctx.fillRect(x - 22, y - 22, 16, 8);
  rrect(x + 12, y - 46, 10, 24, 5); ctx.fill(); ctx.fillRect(x + 6, y - 28, 16, 8);
}
function drawCoin(x, y, r = 11) {
  // Every coin is the same size; a shine sweeps across them in a wave (phase follows world x)
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#b77d00'; circle(0, 0, r); ctx.fill();
  ctx.fillStyle = '#ffd23f'; circle(0, 0, r - 2); ctx.fill();
  ctx.strokeStyle = '#e8b21a'; ctx.lineWidth = 1.5; circle(0, 0, r - 4.5); ctx.stroke();
  ctx.fillStyle = '#e0a400'; ellipse(0, 1, r * 0.45, r * 0.36); ctx.fill();
  ctx.fillStyle = '#b77d00'; circle(-r * 0.17, 1, r * 0.1); ctx.fill(); circle(r * 0.17, 1, r * 0.1); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; circle(-r * 0.42, -r * 0.42, r * 0.17); ctx.fill();
  const t = mod(clock * 0.9 - (x + camX) * 0.0025, 1.6);
  if (t < 0.5) {
    const sx = -r * 1.6 + (t / 0.5) * r * 3.2;
    ctx.beginPath(); ctx.arc(0, 0, r - 2, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath(); ctx.moveTo(sx - 3, r); ctx.lineTo(sx + 3, r); ctx.lineTo(sx + 9, -r); ctx.lineTo(sx + 3, -r); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function eggPath(x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y - 17 * s);
  ctx.bezierCurveTo(x + 12 * s, y - 17 * s, x + 14 * s, y + 2 * s, x + 13 * s, y + 6 * s);
  ctx.bezierCurveTo(x + 11 * s, y + 14 * s, x - 11 * s, y + 14 * s, x - 13 * s, y + 6 * s);
  ctx.bezierCurveTo(x - 14 * s, y + 2 * s, x - 12 * s, y - 17 * s, x, y - 17 * s);
  ctx.closePath();
}
function drawEgg(x, y, s = 1, mode = 'full') {
  if (mode === 'none') {
    eggPath(x, y, s); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.stroke(); return;
  }
  ctx.save();
  if (mode === 'ghost') ctx.globalAlpha *= 0.4;
  if (mode === 'full' && s >= 1) {
    const gl = ctx.createRadialGradient(x, y, 4, x, y, 34 * s);
    gl.addColorStop(0, 'rgba(255,230,120,0.55)'); gl.addColorStop(1, 'rgba(255,230,120,0)');
    ctx.fillStyle = gl; circle(x, y, 34 * s); ctx.fill();
  }
  const g = ctx.createLinearGradient(x - 13 * s, y - 17 * s, x + 13 * s, y + 13 * s);
  g.addColorStop(0, '#fff6c0'); g.addColorStop(0.35, '#ffd84a'); g.addColorStop(1, '#d99a00');
  eggPath(x, y, s); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = '#a06a00'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ellipse(x - 5 * s, y - 7 * s, 3 * s, 5 * s); ctx.fill();
  ctx.restore();
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
  } else if (!th.noSun) {
    const sg = ctx.createRadialGradient(790, th.sunY, 10, 790, th.sunY, 120);
    sg.addColorStop(0, th.sun); sg.addColorStop(0.35, th.sun); sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg; circle(790, th.sunY, 120); ctx.fill();
  }

  ctx.fillStyle = th.cloud;
  const nClouds = th.weather === 'rain' ? 11 : 7;
  for (let i = 0; i < nClouds; i++) drawCloud(mod(i * 260 - cam * 0.12, W + 300) - 150, (th.weather === 'rain' ? 30 : 55) + (i * 53) % 150, 0.8 + (i % 3) * 0.25 + (th.weather === 'rain' ? 0.5 : 0));

  // the ocean on the horizon (beach themes)
  if (th.sea) drawOcean(cam, th);
  // far hills (flat-topped mesas in the canyon)
  else { ctx.fillStyle = th.far; ctx.beginPath(); ctx.moveTo(0, GROUND); }
  if (!th.sea) {
  for (let x = 0; x <= W; x += 8) {
    const wx = x + cam * 0.25;
    const h = th.mesa ? 110 + (Math.sin(wx * 0.0042) > 0.1 ? 95 : 0) + (Math.sin(wx * 0.0013 + 2) > 0.4 ? 50 : 0) : 125 + Math.sin(wx * 0.004) * 40 + Math.sin(wx * 0.0113 + 1) * 20;
    ctx.lineTo(x, GROUND - h);
  }
  ctx.lineTo(W, GROUND); ctx.fill();
  }
  if (th.weather === 'snow') { // snow caps
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let x = 0; x <= W; x += 8) { const wx = x + cam * 0.25; const h = 125 + Math.sin(wx * 0.004) * 40 + Math.sin(wx * 0.0113 + 1) * 20; if (h > 150) ctx.fillRect(x, GROUND - h, 8, (h - 150) * 0.6 + 4); }
  }

  // barns (or palm trees) on the near layer
  const bc = cam * 0.5;
  if (th.palms) { for (let k = Math.floor((bc - 300) / 520); k <= Math.floor((bc + W + 100) / 520); k++) drawPalm(k * 520 + 180 - bc, GROUND - 22, 4.6 + (mod(k, 3)) * 0.5, th.night ? 'palm_night' : 'palm_bg'); }
  else for (let k = Math.floor((bc - 200) / 1400); k <= Math.floor((bc + W) / 1400); k++) drawBarn(k * 1400 + 500 - bc, GROUND - 40, th);

  // near hills (low sand dunes at the beach)
  ctx.fillStyle = th.near; ctx.beginPath(); ctx.moveTo(0, GROUND);
  const dune = th.sea ? 0.45 : 1;
  for (let x = 0; x <= W; x += 16) { const wx = x + cam * 0.5; ctx.lineTo(x, GROUND - (45 + Math.sin(wx * 0.006 + 2) * 18 + Math.sin(wx * 0.017) * 8) * dune); }
  ctx.lineTo(W, GROUND); ctx.fill();

  if (th.sea) {
    // beach umbrellas and shells instead of a fence
    const uo = mod(cam * 0.8, 460);
    for (let x = -uo; x < W + 460; x += 460) { drawUmbrella(x + 90, GROUND - 2, ['#ff6f9c', '#5ab4ff', '#ffd84a'][Math.abs(Math.round((x + uo + cam * 0.8) / 460)) % 3]); }
  } else if (th.cactus) {
    const co = mod(cam * 0.8, 330);
    for (let x = -co; x < W + 330; x += 330) drawCactus(x + 60, GROUND);
  } else {
    ctx.fillStyle = th.fence; const fo = mod(cam * 0.8, 70);
    for (let x = -fo; x < W + 70; x += 70) ctx.fillRect(x, GROUND - 38, 7, 38);
    ctx.fillRect(0, GROUND - 32, W, 5); ctx.fillRect(0, GROUND - 18, W, 5);
  }
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
function drawWeather(th, cam) {
  if (th.weather === 'rain') {
    ctx.strokeStyle = 'rgba(200,220,255,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (const r of RAIN) {
      const y = mod(r.y + clock * r.s, H), x = mod(r.x - clock * r.s * 0.2 - cam * 0.3, W);
      ctx.moveTo(x, y); ctx.lineTo(x - r.l * 0.2, y + r.l);
    }
    ctx.stroke();
    const f = mod(clock, 8.5);
    if (f < 0.22 && !(f > 0.07 && f < 0.13)) {
      ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,230,0.85)'; ctx.lineWidth = 3; ctx.beginPath();
      let x = 640 + Math.sin(Math.floor(clock / 8.5) * 7) * 200, y = 0; ctx.moveTo(x, y);
      for (let i = 0; i < 6; i++) { x += (i % 2 ? -1 : 1) * 18; y += 36; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  } else if (th.weather === 'snow') {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (const s of SNOW) {
      const y = mod(s.y + clock * s.s, H), x = mod(s.x + Math.sin(clock + s.p) * 18 - cam * 0.4, W);
      circle(x, y, s.r); ctx.fill();
    }
  }
}

// Ocean on the horizon with drifting sparkles and a sailboat (beach themes)
function drawOcean(cam, th) {
  const top = GROUND - 150;
  const g = ctx.createLinearGradient(0, top, 0, GROUND);
  g.addColorStop(0, th.far); g.addColorStop(1, th.far2);
  ctx.fillStyle = g; ctx.fillRect(0, top, W, GROUND - top);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(0, top, W, 3);
  ctx.strokeStyle = th.night ? 'rgba(180,200,255,0.3)' : 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const y = top + 12 + (i * 37) % 130, sp = 0.15 + (y - top) / 600;
    const x = mod(i * 173 - cam * sp + Math.sin(clock + i) * 6, W + 60) - 30;
    line(x, y, x + 10 + (y - top) * 0.08, y);
  }
  // a little sailboat far away
  const bx = mod(700 - cam * 0.08, W + 200) - 100, by = top + 10 + Math.sin(clock * 1.5) * 2;
  ctx.fillStyle = th.night ? '#9aa6c8' : '#ffffff'; ctx.beginPath(); ctx.moveTo(bx, by - 2); ctx.lineTo(bx, by - 30); ctx.lineTo(bx + 18, by - 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = th.night ? '#3a3050' : '#b5523b'; ctx.beginPath(); ctx.moveTo(bx - 12, by); ctx.lineTo(bx + 24, by); ctx.lineTo(bx + 18, by + 6); ctx.lineTo(bx - 6, by + 6); ctx.closePath(); ctx.fill();
}
