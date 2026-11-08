'use strict';
// The Ham-berdashery's deluxe wing: premium hats, wings and effects, all drawn in code so they can glow,
// shimmer and animate. Everything here is marked lux and gets the dark rainbow-rimmed card in the shop.
// Most designs take colours, so a new variant is usually one line in DELUXE_HATS / DELUXE_WINGS / DELUXE_FX.
//
// Adding a brand-new design:
//   hat    -> an entry with draw(): `this` is the hat entry (so this.c etc. work). Hat space has the brim's
//             bottom-centre at 0,0, the head's centre near 0,8 (radius 15), the eye near 4,3, snout to the right (+x).
//   wing   -> an entry with a style, plus WING_STYLES[style](w, back): one wing, shoulder at 0,0, reaching up-left
//             ~36px. Return a Path2D to get the darker back-wing shade, or null for none.
//   effect -> an entry with make() (one particle; k picks PARTICLE_DRAW[k]) and optionally aura
//             (AURAS[aura](front, hat, fx), drawn in pig space: body centre 0,0, head 18,-6).
// The shop lists every tab sorted by price, so entries can go anywhere.

// ---------- Shared bits ----------
const hue = (off = 0, l = 62, a = 1, speed = 90) => `hsla(${mod(clock * speed + off, 360)},100%,${l}%,${a})`;
function holoGrad(x0, y0, x1, y1, a = 0.85, l = 70, speed = 120) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, `hsla(${mod(clock * speed + i * 60, 360)},100%,${l}%,${a})`);
  return g;
}
function grad2(x0, y0, x1, y1, a, b) { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
function glow(col, blur = 10) { ctx.shadowColor = col; ctx.shadowBlur = blur; }
function noGlow() { ctx.shadowBlur = 0; }
function scanlines(x, y, w, h, gap = 3, col = 'rgba(255,255,255,0.25)') {
  ctx.fillStyle = col;
  for (let yy = y + mod(clock * 18, gap); yy < y + h; yy += gap) ctx.fillRect(x, yy, w, gap * 0.4);
}
function polyPath(pts) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); }
function sparkle(x, y, r, col = '#fff') {
  if (r <= 0) return;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
}
// a point along a polyline [x0,y0,x1,y1,...] at t in 0..1 (by segment, close enough for a glowing pulse)
function alongPoly(pl, t) {
  const n = pl.length / 2 - 1, f = clamp(t, 0, 0.9999) * n, i = Math.floor(f), k = f - i;
  return [pl[i * 2] + (pl[i * 2 + 2] - pl[i * 2]) * k, pl[i * 2 + 1] + (pl[i * 2 + 3] - pl[i * 2 + 1]) * k];
}

// ---------- Wings ----------
WING_PATHS.circuit = new Path2D('M0 0 L-8 -22 L-36 -32 L-30 -21 L-35 -15 L-22 -11 L-25 -4 L-10 -3Z');
WING_PATHS.insects = new Path2D(); WING_PATHS.insects.addPath(WING_PATHS.insect); WING_PATHS.insects.addPath(WING_PATHS.insect2);
const CRYSTAL_PTS = [[0, 0], [-6, -26], [-16, -20], [-30, -35], [-27, -17], [-37, -15], [-20, -6], [-22, 1]];
function facets(fill) {
  CRYSTAL_PTS.forEach((p, i) => {
    const q = CRYSTAL_PTS[(i + 1) % CRYSTAL_PTS.length];
    ctx.beginPath(); ctx.moveTo(-17, -14); ctx.lineTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.closePath();
    ctx.fillStyle = fill(i); ctx.fill();
  });
}
const MEMBRANE_BONES = [[0, 0, -10, -24, -36, -30], [-10, -24, -27, -12], [-10, -24, -16, -6]];

const WING_STYLES = {
  // Neon outline on black glass, with a light pulse racing along the circuit. c = neon colour
  neon(w) {
    const P = WING_PATHS.circuit, c = w.c;
    ctx.fillStyle = 'rgba(4,10,18,0.92)'; ctx.fill(P);
    glow(c, 10); ctx.strokeStyle = c; ctx.lineWidth = 1.8; ctx.stroke(P);
    ctx.lineWidth = 1; ctx.globalAlpha *= 0.75;
    line(-8, -22, -28, -24); line(-4, -10, -30, -19); line(-6, -5, -22, -8);
    ctx.globalAlpha /= 0.75;
    const spine = [0, 0, -8, -22, -36, -32];
    for (let i = 0; i < 2; i++) {
      const [px, py] = alongPoly(spine, mod(clock * 0.9 + i * 0.5, 1));
      glow(c, 12); ctx.fillStyle = '#fff'; circle(px, py, 1.8); ctx.fill();
    }
    noGlow();
    return null;
  },
  // Iridescent hologram: shifting rainbow, scanlines, a sweeping shine and the odd flicker. l/a = lightness/opacity
  holo(w) {
    const P = WING_PATHS.feather, l = w.l || 70;
    if (mod(clock, 2.7) < 0.09) { ctx.globalAlpha *= 0.45; ctx.translate(rand(-1.5, 1.5), 0); }
    glow(hue(0, l), 12); ctx.fillStyle = holoGrad(0, 0, -36, -32, w.a || 0.85, l, w.speed || 120); ctx.fill(P); noGlow();
    ctx.save(); ctx.clip(P);
    scanlines(-40, -40, 44, 44, 3.5);
    const sx = -50 + mod(clock * 45, 80), g = ctx.createLinearGradient(sx - 9, 0, sx + 9, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(-40, -40, 44, 44);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.3; ctx.stroke(P);
    return null;
  },
  // Dark rock with glowing, breathing cracks. rock = [light, dark], hot = [r,g,b dim, r,g,b bright], edge
  lava(w) {
    const P = WING_PATHS.crystal, pulse = 0.5 + 0.5 * Math.sin(clock * 4), [a, b] = w.hot;
    const hot = `rgb(${a.map((v, i) => v + (b[i] - v) * pulse | 0)})`, bright = `rgb(${b})`;
    glow(bright, 6 + 8 * pulse); ctx.fillStyle = wingGrad(w.rock[0], w.rock[1]); ctx.fill(P);
    glow(bright, 8);
    ctx.strokeStyle = hot; ctx.lineWidth = 1.6;
    for (const s of [[0, 0, -16, -20], [0, 0, -27, -17], [-16, -20, -27, -17], [-6, -26, -16, -20], [-16, -20, -30, -35], [-10, -8, -20, -6]]) line(...s);
    noGlow(); ctx.strokeStyle = w.edge; ctx.lineWidth = 1.2; ctx.stroke(P);
    const t = mod(clock * 0.7, 1);
    if (t < 0.5) { glow(bright, 6); ctx.fillStyle = bright; circle(-37, -15 + t * 30, 1.6 * (1 - t)); ctx.fill(); noGlow(); }
    return P;
  },
  // Three humming energy blades. c = blade colour
  blade(w) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const L = (36 - i * 7) * (0.95 + 0.05 * Math.sin(clock * 37 + i * 2));
      ctx.save(); ctx.rotate(0.4 + i * 0.36);
      glow(w.c, 14); ctx.strokeStyle = w.c; ctx.lineWidth = 5; line(-4, 0, -L, 0);
      noGlow(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8; line(-4, 0, -L + 1, 0);
      ctx.restore();
    }
    ctx.restore();
    ctx.fillStyle = '#2d313b'; rrect(-6, -3.5, 9, 7, 2); ctx.fill();
    ctx.fillStyle = '#a7b0bf'; circle(0, 0, 2.6); ctx.fill();
    return null;
  },
  // See-through wings with lights flowing across them. h = base hue of the bands
  aurora(w) {
    const P = WING_PATHS.insects, h = w.h ?? 130;
    ctx.fillStyle = 'rgba(10,30,50,0.35)'; ctx.fill(P);
    ctx.save(); ctx.clip(P); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 4.5;
    for (let b = 0; b < 3; b++) {
      ctx.strokeStyle = `hsla(${h + b * 55 + 30 * Math.sin(clock * 1.3 + b)},100%,60%,0.65)`;
      ctx.beginPath();
      for (let x = 0; x >= -40; x -= 2) { const y = -8 - b * 8 + x * 0.55 + Math.sin(x * 0.25 + clock * 3 + b * 1.7) * 3.5; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    ctx.restore();
    glow(`hsl(${h + 30},100%,75%)`, 8); ctx.strokeStyle = 'rgba(230,255,245,0.9)'; ctx.lineWidth = 1.1; ctx.stroke(WING_PATHS.insect2); ctx.stroke(WING_PATHS.insect); noGlow();
    return null;
  },
  // A slice of deep space. sky = [centre, middle, outer], neb = three nebula colours, rim = edge colour
  galaxy(w) {
    const P = WING_PATHS.membrane, g = ctx.createRadialGradient(-18, -18, 2, -18, -18, 30);
    g.addColorStop(0, w.sky[0]); g.addColorStop(0.5, w.sky[1]); g.addColorStop(1, w.sky[2]);
    glow(w.rim, 10); ctx.fillStyle = g; ctx.fill(P); noGlow();
    ctx.save(); ctx.clip(P); ctx.globalCompositeOperation = 'lighter';
    w.neb.forEach((col, i) => {
      const a = clock * 0.6 + i * 2.1; ctx.fillStyle = col; ellipse(-18 + Math.cos(a) * 8, -16 + Math.sin(a) * 6, 11, 6); ctx.fill();
    });
    for (let i = 0; i < 16; i++) {
      const tw = 0.5 + 0.5 * Math.sin(clock * 6 + i * 1.7);
      ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * tw})`; circle(-((i * 37) % 36) - 2, -((i * 23) % 30) - 1, 0.4 + tw * 0.9); ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha *= 0.75; bones(MEMBRANE_BONES, w.rim, 1.2); ctx.globalAlpha /= 0.75;
    ctx.strokeStyle = w.rim; ctx.lineWidth = 1.3; ctx.stroke(P);
    return null;
  },
  // Faceted crystal where every facet is a different, shifting colour
  prism(w) {
    glow(hue(0, 75), 12); ctx.fillStyle = '#fff'; ctx.fill(WING_PATHS.crystal); noGlow();
    facets(i => hue(i * 45, 68, 0.88, 110));
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.2; ctx.stroke(WING_PATHS.crystal);
    ctx.lineWidth = 0.6; for (const [x, y] of CRYSTAL_PTS) line(-17, -14, x, y);
    sparkle(-30, -35, 2 + 1.5 * Math.sin(clock * 7)); sparkle(-6, -26, 1.5 + Math.sin(clock * 5 + 1));
    return null;
  },
  // Pure darkness with a pulsing rim, slowly swallowing the light around it. h = rim hue
  void(w) {
    const P = WING_PATHS.membrane, h = w.h ?? 285, rim = `hsl(${h + 30 * Math.sin(clock * 2)},100%,62%)`;
    ctx.fillStyle = '#06020c'; ctx.fill(P);
    ctx.save(); ctx.clip(P);
    for (let i = 0; i < 3; i++) { ctx.strokeStyle = `hsla(${h - 15},100%,55%,${0.25 - i * 0.06})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(-18, -18, 6 + i * 5 + mod(clock * 6, 5), 3 + i * 3, clock * 0.5, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    glow(rim, 14); ctx.strokeStyle = rim; ctx.lineWidth = 2; ctx.stroke(P); noGlow();
    for (let i = 0; i < 5; i++) {
      const t = mod(clock * 0.8 + i * 0.2, 1), [sx, sy] = [[-36, -30], [-27, -12], [-16, -6], [-10, -24], [-33, -24]][i];
      ctx.fillStyle = `hsla(${h},100%,85%,${1 - t})`; circle(sx * (1 - t * t), sy * (1 - t * t), 1.2 * (1 - t) + 0.3); ctx.fill();
    }
    return null;
  },
  // Three glowing feathered wings fanned out, with motes of light. c = [light, dark], edge, glow, mote
  seraph(w) {
    const F = WING_PATHS.feather;
    for (const [r, s] of [[0.55, 0.72], [0.25, 0.86], [-0.08, 1]]) {
      ctx.save(); ctx.rotate(r); ctx.scale(s, s);
      glow(w.glow, 14); ctx.fillStyle = wingGrad(w.c[0], w.c[1]); ctx.fill(F); noGlow();
      ctx.strokeStyle = w.edge; ctx.lineWidth = 1.3; ctx.stroke(F);
      ctx.globalAlpha *= 0.5 + 0.4 * Math.sin(clock * 4 + r * 9); ctx.strokeStyle = w.mote; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(-4, -5); ctx.quadraticCurveTo(-11, -20, -24, -25); ctx.stroke();
      ctx.restore();
    }
    for (let i = 0; i < 4; i++) { const a = clock * 1.8 + i * Math.PI / 2; sparkle(-18 + Math.cos(a) * 16, -22 + Math.sin(a) * 9, 1.6 + Math.sin(clock * 8 + i), w.mote); }
    return null;
  },
  // A gemstone: facets, a rainbow glint sweeping across, sparkles everywhere. h = gem hue, s = saturation
  diamond(w) {
    const h = w.h ?? 200, s = w.s ?? 70;
    glow(`hsl(${h},100%,90%)`, 14); ctx.fillStyle = `hsl(${h},${s}%,92%)`; ctx.fill(WING_PATHS.crystal); noGlow();
    facets(i => `hsla(${h + 18 * Math.sin(i * 1.3 + clock * 2)},${s}%,${(w.l ?? 82) + 12 * Math.sin(clock * 3 + i * 1.9)}%,0.95)`);
    ctx.save(); ctx.clip(WING_PATHS.crystal);
    const sx = -60 + mod(clock * 55, 90); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = holoGrad(sx - 8, 0, sx + 8, -8, 0.55, 65, 200); ctx.beginPath(); ctx.moveTo(sx - 6, 6); ctx.lineTo(sx + 6, 6); ctx.lineTo(sx + 22, -40); ctx.lineTo(sx + 10, -40); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4; ctx.stroke(WING_PATHS.crystal);
    ctx.strokeStyle = `hsla(${h},60%,45%,0.6)`; ctx.lineWidth = 0.6; for (const [x, y] of CRYSTAL_PTS) line(-17, -14, x, y);
    [[-30, -35], [-37, -15], [-6, -26], [-20, -16], [-22, 1]].forEach(([x, y], i) => sparkle(x, y, 3.2 * Math.sin(clock * 5 + i * 1.3)));
    return null;
  },
};

const DELUXE_WINGS = [
  { id: 'w:tron', name: 'Grid Runner Wings', price: 900, style: 'neon', c: '#3ff6ff', desc: 'Fresh off the Ham-frame. End of line? Never.' },
  { id: 'w:tronRed', name: 'Rogue Program Wings', price: 900, style: 'neon', c: '#ff7a1a', desc: 'Derez the competition. Orange is the new oink.' },
  { id: 'w:tronPink', name: 'Synthwave Swine Wings', price: 1000, style: 'neon', c: '#ff3df0', desc: 'Outrun the sunset. Very fast. Very pink.' },
  { id: 'w:tronLime', name: 'Toxic Grid Wings', price: 1000, style: 'neon', c: '#9dff3a', desc: 'Radioactively stylish. Do not lick.' },
  { id: 'w:tronGold', name: 'Gold Standard Grid Wings', price: 1150, style: 'neon', c: '#ffd84a', desc: 'Backed by real gold. And real ham.' },
  { id: 'w:holo', name: 'Hog-ogram Wings', price: 1000, style: 'holo', desc: 'Help me, Oink-Wan. You\'re my only hope.' },
  { id: 'w:holoPearl', name: 'Pearl-escent Wings', price: 1250, style: 'holo', l: 88, a: 0.7, speed: 50, desc: 'Soft as an oyster, shiny as a disco ball.' },
  { id: 'w:holoRave', name: 'Rave-on Rasher Wings', price: 1400, style: 'holo', l: 58, a: 0.95, speed: 320, desc: 'Untz untz untz. The party never stops.' },
  { id: 'w:lava', name: 'Magma Hamma Wings', price: 1200, style: 'lava', rock: ['#3d2621', '#120a08'], hot: [[255, 110, 40], [255, 220, 40]], edge: '#5a2a18', desc: 'Forged in a volcano. Crispy on the outside.' },
  { id: 'w:frostfire', name: 'Frostfire Wings', price: 1350, style: 'lava', rock: ['#26344a', '#0a1020'], hot: [[60, 160, 255], [190, 250, 255]], edge: '#1c2c48', desc: 'So cold it burns. So hot it freezes. Science!' },
  { id: 'w:sludge', name: 'Toxic Sludge Wings', price: 1350, style: 'lava', rock: ['#2a3320', '#0c1008'], hot: [[90, 200, 30], [210, 255, 80]], edge: '#24301a', desc: 'Fresh from the bottom of the slop bucket.' },
  { id: 'w:plasma', name: 'Plasma Pork Blades', price: 1500, style: 'blade', c: '#ff3df0', desc: 'Vrrrm. Vrrrm. May the pork be with you.' },
  { id: 'w:laser', name: 'Laser Loin Blades', price: 1500, style: 'blade', c: '#4dff6a', desc: 'Cuts through clouds like butter. Bacon butter.' },
  { id: 'w:ion', name: 'Ion Bacon Blades', price: 1600, style: 'blade', c: '#3a9bff', desc: 'Charged with pure electric oink.' },
  { id: 'w:crimson', name: 'Crimson Chop Blades', price: 1600, style: 'blade', c: '#ff2a2a', desc: 'Join the dark side. We have bacon.' },
  { id: 'w:goldBlade', name: 'Golden Ham Blades', price: 1900, style: 'blade', c: '#ffc93a', desc: 'The rarest crystal in the galaxy: a golden pork chop.' },
  { id: 'w:aurora', name: 'Aurora Bore-hog-lis', price: 1800, style: 'aurora', h: 130, flap: 1.3, desc: 'The northern lights, but make it pork.' },
  { id: 'w:sunset', name: 'Sunset Bore-hog-lis', price: 1950, style: 'aurora', h: 300, flap: 1.3, desc: 'Golden hour, every hour.' },
  { id: 'w:galaxy', name: 'Milky Whey Wings', price: 2200, style: 'galaxy', sky: ['#5b2a8c', '#1d1450', '#050418'], neb: ['rgba(255,80,200,0.28)', 'rgba(80,180,255,0.28)', 'rgba(160,90,255,0.28)'], rim: '#c9b6ff', desc: 'A whole galaxy in every flap. Mind the black holes.' },
  { id: 'w:emerald', name: 'Emerald Nebula Wings', price: 2400, style: 'galaxy', sky: ['#1f7a5a', '#0c3a34', '#03110f'], neb: ['rgba(80,255,170,0.28)', 'rgba(60,200,255,0.28)', 'rgba(200,255,90,0.22)'], rim: '#9dffd8', desc: 'Somewhere out there, a planet made entirely of mud.' },
  { id: 'w:redGiant', name: 'Red Giant Wings', price: 2400, style: 'galaxy', sky: ['#a03a1a', '#4a0f20', '#12040a'], neb: ['rgba(255,140,40,0.3)', 'rgba(255,60,90,0.28)', 'rgba(255,210,90,0.22)'], rim: '#ffb38a', desc: 'A dying star. Still hotter than a summer BBQ.' },
  { id: 'w:prism', name: 'Prism-ham Wings', price: 2800, style: 'prism', desc: 'Splits light into every flavour of ham.' },
  { id: 'w:void', name: 'Void Hog Wings', price: 3500, style: 'void', h: 285, desc: 'Stare into the abyss. The abyss oinks back.' },
  { id: 'w:voidRed', name: 'Crimson Void Wings', price: 3800, style: 'void', h: 0, desc: 'Darkness, but angrier.' },
  { id: 'w:voidTeal', name: 'Abyssal Deep Wings', price: 3800, style: 'void', h: 175, desc: 'From the bottom of the Ham-arctic Trench.' },
  { id: 'w:seraph', name: 'Seraph-ham Six-Wings', price: 5000, style: 'seraph', flap: 0.85, c: ['#ffffff', '#ffe39a'], edge: '#d9ad3c', glow: '#fff2b0', mote: '#fff8d0', desc: 'Holy ham. Six wings. Zero chill.' },
  { id: 'w:fallen', name: 'Fallen Seraph-ham', price: 5500, style: 'seraph', flap: 0.85, c: ['#3a3040', '#0c0810'], edge: '#ff3a3a', glow: '#ff2a2a', mote: '#ff8a8a', desc: 'Kicked out of hog heaven for eating the communion bacon.' },
  { id: 'w:ruby', name: 'Ruby Snout Wings', price: 8000, style: 'diamond', h: 350, s: 85, l: 62, desc: 'Red, rare and ridiculously expensive. Like a fancy steak.' },
  { id: 'w:emeraldGem', name: 'Emerald Snout Wings', price: 8000, style: 'diamond', h: 145, s: 80, l: 58, desc: 'Green with envy? Everyone else will be.' },
  { id: 'w:diamond', name: 'Diamond Snout Wings', price: 9999, style: 'diamond', h: 200, desc: 'Ten thousand carats of pure flex. Pig-nificent.' },
];

// ---------- Hats ----------
// Each design is a function returning draw(); variants pass their own colours
const CROWN_PTS = [[-16, 0], [-18, -20], [-9, -11], [0, -26], [9, -11], [18, -20], [16, 0]];
const HAT_DRAW = {
  antenna: (stalk, ball) => function () {
    for (const [bx, tx, ph] of [[-5, -11, 0], [6, 12, 1.7]]) {
      const tip = [tx + Math.sin(clock * 5 + ph) * 2, -26 + Math.cos(clock * 4 + ph)];
      ctx.strokeStyle = stalk; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, -5); ctx.quadraticCurveTo(bx, -18, tip[0], tip[1]); ctx.stroke();
      glow(ball, 10 + 4 * Math.sin(clock * 6 + ph)); ctx.fillStyle = ball; circle(tip[0], tip[1], 3.4); ctx.fill(); noGlow();
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; circle(tip[0] - 1, tip[1] - 1, 1); ctx.fill();
    }
  },
  visor: (light, glass) => function () {
    ctx.fillStyle = '#1b1e26'; rrect(-15, -2, 33, 9, 4); ctx.fill();
    ctx.fillStyle = glass; rrect(-1, -0.5, 18, 6, 3); ctx.fill();
    const sx = 8 + 7 * Math.sin(clock * 3.2);
    glow(light, 10); ctx.fillStyle = light; rrect(sx - 3, 0.5, 6, 4, 2); ctx.fill(); noGlow();
    ctx.strokeStyle = '#5a6070'; ctx.lineWidth = 1; rrect(-15, -2, 33, 9, 4); ctx.stroke();
  },
  horns: (dark, light, glowCol, curl = 7) => function () {
    const fl = 8 + 6 * (0.5 + 0.5 * Math.sin(clock * 9) * Math.sin(clock * 2.3));
    for (const s of [-1, 1]) {
      const bx = s * 8 - 1;
      glow(glowCol, fl); ctx.fillStyle = grad2(bx, -4, bx + s * 6, -24, dark, light);
      ctx.beginPath(); ctx.moveTo(bx - 3.5, -3); ctx.quadraticCurveTo(bx - 2 + s * 2, -16, bx + s * curl, -24); ctx.quadraticCurveTo(bx + s * 2, -13, bx + 3.5, -4); ctx.closePath(); ctx.fill();
    }
    noGlow();
  },
  // cols: null = cycling rainbow, else a list of colours for the spikes
  mohawk: cols => function () {
    for (let i = 0; i < 6; i++) {
      const an = Math.PI * (1.18 + i * 0.12), nx = Math.cos(an), ny = Math.sin(an), L = 11 + 4 * Math.sin(i * 2.3) + 1.5 * Math.sin(clock * 6 + i);
      const bx = nx * 14, by = 8 + ny * 14, px = -ny * 3, py = nx * 3, c = cols ? cols[i % cols.length] : hue(i * 40, 60);
      glow(c, 9); ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(bx - px, by - py); ctx.lineTo(bx + nx * L, by + ny * L); ctx.lineTo(bx + px, by + py); ctx.closePath(); ctx.fill();
    }
    noGlow();
  },
  neonTop: (edge, glowCol) => function () {
    ctx.fillStyle = '#120a1c'; rrect(-11, -30, 22, 28, 2); ctx.fill(); rrect(-19, -4, 38, 5, 2.5); ctx.fill();
    glow(glowCol, 10); ctx.strokeStyle = edge; ctx.lineWidth = 1.8; rrect(-11, -30, 22, 28, 2); ctx.stroke(); rrect(-19, -4, 38, 5, 2.5); ctx.stroke();
    glow(hue(0), 12); ctx.fillStyle = hue(0, 66); ctx.fillRect(-11, -11, 22, 4); noGlow();
  },
  tron: (c, edge, glass) => function () {
    const pulse = 0.6 + 0.4 * Math.sin(clock * 3);
    ctx.fillStyle = '#0b1622'; ctx.beginPath(); ctx.arc(0, 8, 18, Math.PI * 0.93, Math.PI * 2.03); ctx.closePath(); ctx.fill();
    glow(c, 12); ctx.strokeStyle = edge; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.globalAlpha *= pulse; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(0, 8, 12.5, Math.PI * 1.02, Math.PI * 1.72); ctx.stroke();
    line(-17, 6, -8, 6);
    ctx.globalAlpha /= pulse;
    ctx.fillStyle = glass; rrect(-1, -1, 19, 7, 3); ctx.fill(); noGlow();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 0.8; line(1, 1, 16, 1);
  },
  wizard: (lo, hi, brim, band, star) => function () {
    ctx.fillStyle = grad2(0, 0, 0, -38, lo, hi); ctx.beginPath(); ctx.moveTo(-14, -2); ctx.quadraticCurveTo(-6, -22, -9, -38); ctx.quadraticCurveTo(4, -22, 14, -2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = brim; ellipse(0, -1.5, 20, 4); ctx.fill();
    ctx.fillStyle = band; ctx.fillRect(-12, -7, 24, 3);
    for (const [x, y, i] of [[-3, -16, 0], [4, -11, 1], [-6, -26, 2], [1, -21, 3]]) sparkle(x, y, 1 + Math.max(0, 1.6 * Math.sin(clock * 4 + i * 1.6)), '#fff6b0');
    glow(star, 10 + 5 * Math.sin(clock * 5));
    ctx.save(); ctx.translate(-9, -38); ctx.rotate(clock * 2); starPath(3.5, 1.5, 5); ctx.fillStyle = star; ctx.fill(); ctx.restore(); noGlow();
  },
  // pts = crown outline, speed = how fast the colours run
  holoCrown: (pts, speed) => function () {
    if (mod(clock, 2.3) < 0.08) { ctx.translate(rand(-2, 2), 0); ctx.globalAlpha *= 0.5; }
    ctx.globalAlpha *= 0.9;
    glow(hue(0, 70), 12); polyPath(pts); ctx.fillStyle = holoGrad(-16, 0, 16, -26, 0.75, 68, speed); ctx.fill(); noGlow();
    ctx.save(); polyPath(pts); ctx.clip(); scanlines(-20, -30, 40, 32, 3); ctx.restore();
    polyPath(pts); ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.2; ctx.stroke();
    pts.slice(1, -1).forEach(([x, y], i) => { if (y > -14) return; glow(hue(i * 90 + 180), 8); ctx.fillStyle = hue(i * 90 + 180, 75); circle(x, y, 2.4); ctx.fill(); });
    noGlow();
  },
  astro: (glass, rim, light) => function () {
    ctx.strokeStyle = '#9aa6b8'; ctx.lineWidth = 1.5; line(-10, -9, -14, -18);
    const on = Math.sin(clock * 5) > 0;
    glow(light, on ? 10 : 0); ctx.fillStyle = on ? light : '#555'; circle(-14, -18, 2); ctx.fill(); noGlow();
    ctx.fillStyle = glass; circle(1, 7, 21); ctx.fill();
    ctx.strokeStyle = rim; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(1, 7, 16, Math.PI * 1.1, Math.PI * 1.38); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; circle(12, -6, 1.6); ctx.fill();
  },
  flameCrown: (outer, inner, gold) => function () {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const bx = -12 + i * 6, h = 14 + 6 * Math.sin(clock * 17 + i * 2.1) + (i === 2 ? 5 : 0);
      for (const [col, k] of [[outer, 1], [inner, 0.6]]) {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(bx - 4 * k, -5);
        ctx.quadraticCurveTo(bx - 5 * k, -5 - h * 0.6 * k, bx + Math.sin(clock * 9 + i) * 2, -5 - h * k);
        ctx.quadraticCurveTo(bx + 5 * k, -5 - h * 0.5 * k, bx + 4 * k, -5); ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
    ctx.fillStyle = grad2(0, -7, 0, 0, gold[0], gold[1]); rrect(-15, -7, 30, 7, 2); ctx.fill(); ctx.strokeStyle = gold[2]; ctx.lineWidth = 1; ctx.stroke();
    for (const [x, c] of [[-8, '#ff3a5a'], [0, '#3ad0ff'], [8, '#6aff5a']]) { ctx.fillStyle = c; circle(x, -3.5, 1.8); ctx.fill(); }
  },
  planet: (light, dark, ringCol, moon) => function () {
    const cy = -22 + Math.sin(clock * 2) * 1.5, tilt = -0.25;
    const ring = (a0, a1) => { ctx.strokeStyle = ringCol; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(0, cy, 15, 4, tilt, a0, a1); ctx.stroke(); };
    ring(Math.PI, Math.PI * 2);
    const g = ctx.createRadialGradient(-2, cy - 3, 1, 0, cy, 8); g.addColorStop(0, light); g.addColorStop(1, dark);
    glow(light, 8); ctx.fillStyle = g; circle(0, cy, 7.5); ctx.fill(); noGlow();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1; line(-6.5, cy - 2, 6.5, cy - 3.5); line(-6, cy + 2.5, 6.5, cy + 1);
    ring(0, Math.PI);
    const ma = clock * 1.6;
    ctx.fillStyle = moon; circle(Math.cos(ma) * 19, cy + Math.sin(ma) * 7, 2.2); ctx.fill();
    sparkle(13, cy - 10, 2.5 * Math.sin(clock * 3));
  },
  cosmicCrown: (sky, neb, metal) => function () {
    glow(metal, 14); polyPath(CROWN_PTS);
    const g = ctx.createRadialGradient(0, -12, 2, 0, -12, 22); g.addColorStop(0, sky[0]); g.addColorStop(0.6, sky[1]); g.addColorStop(1, sky[2]);
    ctx.fillStyle = g; ctx.fill(); noGlow();
    ctx.save(); polyPath(CROWN_PTS); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = neb[0]; ellipse(-6 + Math.cos(clock) * 4, -8, 9, 5); ctx.fill();
    ctx.fillStyle = neb[1]; ellipse(6 + Math.sin(clock) * 4, -12, 9, 5); ctx.fill();
    for (let i = 0; i < 10; i++) { const tw = 0.5 + 0.5 * Math.sin(clock * 6 + i * 2.1); ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * tw})`; circle(((i * 29) % 30) - 15, -((i * 17) % 22) - 2, 0.4 + tw * 0.8); ctx.fill(); }
    ctx.restore();
    polyPath(CROWN_PTS); ctx.strokeStyle = metal; ctx.lineWidth = 1.6; ctx.stroke();
    for (const [x, y, i] of [[-18, -20, 0], [0, -26, 1], [18, -20, 2]]) { glow(hue(i * 120), 10); ctx.fillStyle = hue(i * 120, 75); circle(x, y, 2.6); ctx.fill(); }
    noGlow();
    for (let i = 0; i < 3; i++) {
      const a = clock * 1.4 + i * Math.PI * 2 / 3;
      if (Math.sin(a) > -0.2) sparkle(Math.cos(a) * 24, -12 + Math.sin(a) * 6, 2.4 + Math.sin(clock * 6 + i), '#fff6c0');
    }
  },
};
const TIARA_PTS = [[-14, 0], [-12, -8], [-6, -10], [0, -20], [6, -10], [12, -8], [14, 0]];
const SPIKE_PTS = [[-17, 0], [-19, -14], [-12, -8], [-9, -24], [-4, -10], [0, -30], [4, -10], [9, -24], [12, -8], [19, -14], [17, 0]];
const GOLD = ['#fff09a', '#c98a00', '#7a5200'], SILVER = ['#ffffff', '#9aa6b8', '#4a5466'], OBSIDIAN = ['#6a6070', '#1a1420', '#0a060c'];
const DELUXE_HATS = [
  { id: 'd:antenna', name: 'Alien Ant-hog-nnae', price: 1000, draw: HAT_DRAW.antenna('#3c8a2e', '#b6ff8a'), desc: 'Take me to your ham-der.' },
  { id: 'd:antennaPink', name: 'Pink Planet Probes', price: 1100, draw: HAT_DRAW.antenna('#a03a8a', '#ff9af0'), desc: 'Picking up signals from the planet Sow-turn.' },
  { id: 'd:antennaGold', name: 'Golden Receivers', price: 1350, draw: HAT_DRAW.antenna('#a07a20', '#ffe066'), desc: 'Only receives premium channels.' },
  { id: 'd:visor', name: 'Cyber Snout Visor', price: 1100, draw: HAT_DRAW.visor('#ff4a5a', 'rgba(255,40,60,0.28)'), desc: 'Scanning for truffles. Target acquired.' },
  { id: 'd:visorIce', name: 'Ice-Cold Scanner', price: 1200, draw: HAT_DRAW.visor('#5af0ff', 'rgba(60,220,255,0.28)'), desc: 'Calculating the perfect flap. 99.9% oink.' },
  { id: 'd:visorGold', name: 'Gold-Digger Visor', price: 1500, draw: HAT_DRAW.visor('#ffd84a', 'rgba(255,200,40,0.32)'), desc: 'Sees coins through solid walls. Probably.' },
  { id: 'd:horns', name: 'Deviled Ham Horns', price: 1250, draw: HAT_DRAW.horns('#7a0c0c', '#ff3a2a', '#ff2a10'), desc: 'A little bit naughty. A lot bit spicy.' },
  { id: 'd:hornsIce', name: 'Frost Giant Horns', price: 1450, draw: HAT_DRAW.horns('#2a5a9a', '#cff6ff', '#7fe0ff', 9), desc: 'Carved from a glacier. Brrrr-oink.' },
  { id: 'd:hornsVoid', name: 'Shadow Horns', price: 1600, draw: HAT_DRAW.horns('#0a0410', '#6a2aa0', '#b04aff', 5), desc: 'Whispers dark secrets. Mostly about snacks.' },
  { id: 'd:hornsGold', name: 'Golden Ram Horns', price: 1900, draw: HAT_DRAW.horns('#8a5a00', '#fff09a', '#ffd84a', 10), desc: 'Ram-tastic. Ham-tastic. Fan-tastic.' },
  { id: 'd:mohawk', name: 'Mo-hog-k 2099', price: 1400, draw: HAT_DRAW.mohawk(null), desc: 'Neon spikes. Zero regrets. Some hair gel.' },
  { id: 'd:mohawkToxic', name: 'Toxic Mo-hog-k', price: 1450, draw: HAT_DRAW.mohawk(['#9dff3a', '#5aff6a', '#d4ff3a']), desc: 'Glows in the dark. Also in the light.' },
  { id: 'd:mohawkIce', name: 'Ice Punk Spikes', price: 1450, draw: HAT_DRAW.mohawk(['#7ff6ff', '#bfe8ff', '#ffffff']), desc: 'Too cool for the farm. Literally frozen.' },
  { id: 'd:mohawkFire', name: 'Hot Rod Mo-hog-k', price: 1550, draw: HAT_DRAW.mohawk(['#ff3a1a', '#ff8a1a', '#ffd84a']), desc: 'Zero to bacon in 4.2 seconds.' },
  { id: 'd:neonTop', name: 'Neon Top Hog', price: 1600, draw: HAT_DRAW.neonTop('#ff8af5', '#ff3df0'), desc: 'Ham-sterdam nightlife, 3 a.m., zero chill.' },
  { id: 'd:neonTopCyan', name: 'Midnight Top Hog', price: 1600, draw: HAT_DRAW.neonTop('#8afbff', '#3ff6ff'), desc: 'Very fancy. Very blue. Very after hours.' },
  { id: 'd:neonTopLime', name: 'Acid Top Hog', price: 1700, draw: HAT_DRAW.neonTop('#d4ff8a', '#9dff3a'), desc: 'The dress code was "glow". You nailed it.' },
  { id: 'd:tron', name: 'Grid Runner Helmet', price: 1800, draw: HAT_DRAW.tron('#3ff6ff', '#7ffbff', 'rgba(70,240,255,0.4)'), desc: 'Greetings, program. Please oink responsibly.' },
  { id: 'd:tronRed', name: 'Rogue Program Helmet', price: 1800, draw: HAT_DRAW.tron('#ff7a1a', '#ffb070', 'rgba(255,130,40,0.4)'), desc: 'Plays by its own rules. Rule one: oink.' },
  { id: 'd:tronPurple', name: 'Sudo Swine Helmet', price: 2100, draw: HAT_DRAW.tron('#b04aff', '#d9a6ff', 'rgba(180,90,255,0.4)'), desc: 'Admin access to the whole grid. Use wisely.' },
  { id: 'd:tronGold', name: 'Master Control Helmet', price: 2600, draw: HAT_DRAW.tron('#ffd84a', '#fff0a0', 'rgba(255,210,60,0.45)'), desc: 'You ARE the system now.' },
  { id: 'd:wizard', name: 'Hog-warts Wizard Hat', price: 2000, draw: HAT_DRAW.wizard('#2a1060', '#6a34c0', '#3a1a80', '#ffd84a', '#ffe14d'), desc: 'You\'re a wizard, Hamm-y.' },
  { id: 'd:wizardFire', name: 'Fire Mage Hat', price: 2200, draw: HAT_DRAW.wizard('#5a0a0a', '#d0301a', '#7a1010', '#ffb000', '#ff8a2a'), desc: 'Specialises in one spell: Flame-grilled.' },
  { id: 'd:wizardSwamp', name: 'Swamp Sorcerer Hat', price: 2200, draw: HAT_DRAW.wizard('#0f3a1a', '#3a9a3a', '#1a4a1a', '#c9a24a', '#b6ff8a'), desc: 'Brews potions from only the finest mud.' },
  { id: 'd:wizardStar', name: 'Archmage of Oink', price: 2900, draw: HAT_DRAW.wizard('#0a1440', '#2a6ad0', '#101c50', '#ffffff', '#ffffff'), desc: 'Knows every spell. Only casts "more snacks".' },
  { id: 'd:holoCrown', name: 'Hologram Crown', price: 2500, draw: HAT_DRAW.holoCrown(CROWN_PTS, 120), desc: 'Royalty, projected. Not legally binding.' },
  { id: 'd:holoTiara', name: 'Hologram Tiara', price: 2400, draw: HAT_DRAW.holoCrown(TIARA_PTS, 80), desc: 'Pageant queen of the metaverse.' },
  { id: 'd:holoSpikes', name: 'Glitch King Crown', price: 3300, draw: HAT_DRAW.holoCrown(SPIKE_PTS, 260), desc: 'Rules a kingdom that crashes every five minutes.' },
  { id: 'd:astro', name: 'Ham Solo Space Helmet', price: 2800, draw: HAT_DRAW.astro('rgba(190,230,255,0.16)', 'rgba(225,245,255,0.95)', '#ff5a5a'), desc: 'One small step for pig. One giant leap for pork-kind.' },
  { id: 'd:astroGold', name: 'Moonwalker Helmet', price: 3200, draw: HAT_DRAW.astro('rgba(255,200,60,0.28)', '#ffd84a', '#5aff8a'), desc: 'Gold-tinted. Sun-proof. Ego-boosting.' },
  { id: 'd:astroPink', name: 'Space Princess Bubble', price: 3200, draw: HAT_DRAW.astro('rgba(255,140,220,0.22)', '#ffb3e6', '#ff5ad0'), desc: 'Bubblegum-flavoured oxygen. Probably.' },
  { id: 'd:flameCrown', name: 'Crown of Sizzle', price: 3500, draw: HAT_DRAW.flameCrown('rgba(255,70,20,0.85)', 'rgba(255,210,70,0.9)', GOLD), desc: 'Heavy is the head that wears the bacon.' },
  { id: 'd:blueFlame', name: 'Blue Blaze Crown', price: 3800, draw: HAT_DRAW.flameCrown('rgba(40,110,255,0.85)', 'rgba(170,240,255,0.9)', SILVER), desc: 'Hotter than orange fire. Hotter than you.' },
  { id: 'd:witchfire', name: 'Witchfire Crown', price: 3800, draw: HAT_DRAW.flameCrown('rgba(60,220,40,0.85)', 'rgba(220,255,140,0.9)', OBSIDIAN), desc: 'Burns green. Smells like a haunted BBQ.' },
  { id: 'd:soulfire', name: 'Soulfire Crown', price: 4400, draw: HAT_DRAW.flameCrown('rgba(170,50,255,0.85)', 'rgba(255,170,255,0.9)', OBSIDIAN), desc: 'Fuelled by the spirits of a thousand pork chops.' },
  { id: 'd:saturn', name: 'Orbiting Ham-et', price: 4500, draw: HAT_DRAW.planet('#ffe2b0', '#d0683a', '#f2d08a', '#e8ecf5'), desc: 'Your own personal planet. Population: you.' },
  { id: 'd:icePlanet', name: 'Frozen Ham-et', price: 4800, draw: HAT_DRAW.planet('#e8fbff', '#3a8ad0', '#bff0ff', '#ffffff'), desc: 'A tiny ice world. Keeps your thoughts fresh.' },
  { id: 'd:mudPlanet', name: 'Planet Mud-topia', price: 5200, draw: HAT_DRAW.planet('#c9a070', '#5a3a1a', '#9dff8a', '#ffb3c8'), desc: 'The pig homeworld. Mud oceans. Truffle mountains.' },
  { id: 'd:cosmicCrown', name: 'Crown of the Pig-verse', price: 12000, draw: HAT_DRAW.cosmicCrown(['#6a32b0', '#1d1450', '#070420'], ['rgba(255,80,200,0.3)', 'rgba(80,180,255,0.3)'], '#ffd84a'), desc: 'Rule every galaxy. Starting with this one.' },
  { id: 'd:infernoCrown', name: 'Crown of the Ham-ferno', price: 10000, draw: HAT_DRAW.cosmicCrown(['#c04a10', '#4a0a0a', '#120202'], ['rgba(255,150,40,0.35)', 'rgba(255,60,40,0.3)'], '#ff8a2a'), desc: 'Forged in the heart of a dying sun. Smells smoky.' },
  { id: 'd:frostCrown', name: 'Crown of Eternal Frost', price: 10000, draw: HAT_DRAW.cosmicCrown(['#5ab0e0', '#123a6a', '#040c1a'], ['rgba(140,240,255,0.35)', 'rgba(255,255,255,0.25)'], '#e8fbff'), desc: 'Winter is coming. You brought it.' },
];

// ---------- Effects ----------
const GLYPHS = ['0', '1', 'ハ', 'ム', 'ブ', 'タ', 'オ', 'イ', 'ン', 'ク', '豚'];
const fxMatrix = c => (x, y) => ({ k: 'glyph', x: x + rand(-18, 8), y: y + rand(-22, 14), vx: rand(-30, -10), vy: rand(30, 70), life: rand(0.7, 1.2), size: rand(8, 12), txt: pick(GLYPHS), c });
const fxLight = c => (x, y) => ({ k: 'lightbar', x: x - 6, y: y + 2, life: 0.65, size: 1, c });
const fxGems = hues => (x, y) => ({ k: 'gem', x, y, vx: rand(-80, 20), vy: rand(-190, -60), g: 600, life: 1.2, size: rand(4, 6), rot: rand(-0.4, 0.4), vr: rand(-3, 3), hue: pick(hues) });
const fxAurora = (h0, span) => (x, y) => ({ k: 'aurora', x: x - 6, y, vy: -12, life: 0.9, size: 1, ph: clock * 3, hue: h0 + span * (0.5 + 0.5 * Math.sin(clock * 1.2)) });
const fxFirework = (h0, span) => (x, y) => ({ k: 'firework', x: x + rand(-70, -10), y: y + rand(-70, 10), life: 1.1, size: rand(18, 30), hue: h0 + rand(0, span) });
const fxStars = cols => (x, y) => ({ k: 'star4', x: x + rand(-14, 10), y: y + rand(-20, 18), vx: rand(-40, 0), vy: rand(-20, 20), life: rand(0.6, 1), size: rand(3, 6), col: pick(cols), rot: 0, vr: rand(-2, 2) });
const fxNova = (h0, span) => (x, y) => ({ k: 'star4', x: x + rand(-16, 16), y: y + rand(-22, 18), vx: rand(-60, 20), vy: rand(-40, 40), life: rand(0.5, 1), size: rand(3, 7), col: `hsl(${h0 + rand(0, span) | 0},100%,75%)`, rot: 0, vr: rand(-3, 3) });
const DELUXE_FX = [
  { id: 'fx:matrix', name: 'The Ham-trix', price: 800, icon: '💾', rate: 24, make: fxMatrix('#3dff6a'), desc: 'There is no spoon. There is only bacon.' },
  { id: 'fx:matrixRed', name: 'Red Pill Ham-trix', price: 900, icon: '💊', rate: 24, make: fxMatrix('#ff3a4a'), desc: 'You took the red pill. It was a bacon bit.' },
  { id: 'fx:matrixBlue', name: 'Blue Screen of Oink', price: 900, icon: '🖥️', rate: 24, make: fxMatrix('#3aa0ff'), desc: 'A fatal error has occurred: too much swag.' },
  { id: 'fx:tron', name: 'Light Cycle Trail', price: 1000, icon: '🏍️', rate: 140, aura: 'tron', c: '#3ff6ff', make: fxLight('#3ff6ff'), desc: 'A solid wall of neon. Cut \'em off at the grid.' },
  { id: 'fx:tronOrange', name: 'Rogue Cycle Trail', price: 1000, icon: '🛵', rate: 140, aura: 'tron', c: '#ff7a1a', make: fxLight('#ff7a1a'), desc: 'Orange means danger. And ham.' },
  { id: 'fx:tronPink', name: 'Neon Nights Trail', price: 1100, icon: '🌃', rate: 140, aura: 'tron', c: '#ff3df0', make: fxLight('#ff3df0'), desc: 'Paint the town pink. One flap at a time.' },
  { id: 'fx:tronGold', name: 'Golden Cycle Trail', price: 1300, icon: '🏆', rate: 140, aura: 'tron', c: '#ffd84a', make: fxLight('#ffd84a'), desc: 'First place, every lap, forever.' },
  { id: 'fx:glitch', name: 'Holo-Hog Glitch', price: 1200, icon: '📺', rate: 22, aura: 'glitch', desc: 'Have you tried turning the pig off and on again?',
    make: (x, y) => ({ k: 'gbar', x: x + rand(-22, 10), y: y + rand(-22, 20), vx: rand(-70, -20), life: rand(0.2, 0.4), size: rand(4, 14), hue: rand(0, 360) }) },
  { id: 'fx:diamonds', name: 'Diamond Rain', price: 1600, icon: '💎', rate: 10, make: fxGems([195, 205, 290, 330, 160]), desc: 'Shine bright like a diamond-encrusted ham.' },
  { id: 'fx:rubies', name: 'Ruby Rain', price: 1700, icon: '❤️‍🔥', rate: 10, make: fxGems([350, 0, 340, 10]), desc: 'Rubies! Everywhere! Somebody call the bank!' },
  { id: 'fx:emeralds', name: 'Emerald Rain', price: 1700, icon: '💚', rate: 10, make: fxGems([140, 150, 160, 120]), desc: 'Green gems for a seriously green-with-envy crowd.' },
  { id: 'fx:aurora', name: 'Northern Swine', price: 1800, icon: '🌠', rate: 110, make: fxAurora(130, 150), desc: 'Leave the sky glowing behind you.' },
  { id: 'fx:sunsetAurora', name: 'Sunset Swine', price: 1900, icon: '🌅', rate: 110, make: fxAurora(300, 100), desc: 'Every flight ends at golden hour.' },
  { id: 'fx:fireworks', name: 'Hog-dependence Day', price: 2500, icon: '🎆', rate: 2.6, make: fxFirework(0, 360), desc: 'Every flight is a celebration. Ooooh. Aaaah. Oink.' },
  { id: 'fx:goldworks', name: 'Golden Gala', price: 2800, icon: '🎇', rate: 3, make: fxFirework(35, 25), desc: 'Black tie only. Gold fireworks. Champagne mud.' },
  { id: 'fx:galaxy', name: 'Star Hog Galaxy', price: 3000, icon: '🌌', rate: 18, aura: 'galaxy', h: 250, make: fxStars(['#c9a6ff', '#8ac8ff', '#ff9ad5', '#ffffff']), desc: 'The whole universe revolves around you. Finally.' },
  { id: 'fx:galaxyGreen', name: 'Emerald Galaxy', price: 3200, icon: '🪐', rate: 18, aura: 'galaxy', h: 140, make: fxStars(['#8affc9', '#8ae8ff', '#d4ff8a', '#ffffff']), desc: 'A galaxy far, far away. And very green.' },
  { id: 'fx:galaxyRed', name: 'Crimson Galaxy', price: 3200, icon: '☄️', rate: 18, aura: 'galaxy', h: 350, make: fxStars(['#ff8a8a', '#ffb36b', '#ff9ad5', '#ffffff']), desc: 'Red skies at night: pig\'s delight.' },
  { id: 'fx:blackhole', name: 'Event Ham-rizon', price: 4500, icon: '🕳️', rate: 16, aura: 'blackhole', ring: ['#ff9a3a', 'rgba(255,150,60,0.85)', '#fff4d0', 'rgba(255,140,60,0.25)'], make: fxStars(['#ffb36b', '#ffffff', '#c48bff']), desc: 'So dense, not even light escapes. Bacon smell does.' },
  { id: 'fx:quasar', name: 'Quasar Swine', price: 5200, icon: '🌀', rate: 16, aura: 'blackhole', ring: ['#3ab0ff', 'rgba(60,170,255,0.85)', '#e0f8ff', 'rgba(60,170,255,0.25)'], make: fxStars(['#8ac8ff', '#ffffff', '#3af0ff']), desc: 'The brightest object in the universe has a snout.' },
  { id: 'fx:solarFlare', name: 'Solar Flare Swine', price: 7500, icon: '☀️', rate: 32, aura: 'nova', h: 20, span: 40, make: fxNova(20, 40), desc: 'Hotter than the sun. Because it IS the sun.' },
  { id: 'fx:supernova', name: 'Super-nova Swine', price: 9999, icon: '💥', rate: 32, aura: 'nova', make: fxNova(0, 360), desc: 'The brightest pig in the known universe. Wear sunglasses.' },
];

// Particle drawers: ctx is already at the particle (and rotated by p.rot); alpha is base * a
const PARTICLE_DRAW = {
  glyph(p, a, s) {
    ctx.font = `bold ${s}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    glow(p.c, 6); ctx.fillStyle = a > 0.85 ? '#ffffff' : p.c; ctx.fillText(p.txt, 0, 0);
  },
  lightbar(p) {
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.8;
    ctx.fillStyle = p.c; ctx.fillRect(-3.2, -3, 6.4, 6);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-3.2, -0.9, 6.4, 1.8);
  },
  gbar(p, a, s) { ctx.fillStyle = `hsla(${mod(p.hue + clock * 300, 360)},100%,65%,0.85)`; ctx.fillRect(-s / 2, -1.2, s, 2.4); },
  gem(p, a, s) {
    polyPath([[-s, -s * 0.3], [-s * 0.5, -s * 0.8], [s * 0.5, -s * 0.8], [s, -s * 0.3], [0, s]]);
    ctx.fillStyle = grad2(0, -s, 0, s, `hsl(${p.hue},90%,90%)`, `hsl(${p.hue},80%,55%)`); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8; ctx.stroke();
    line(-s, -s * 0.3, s, -s * 0.3);
    if (Math.sin(clock * 9 + s * 5) > 0.6) sparkle(s * 0.4, -s * 0.6, 3);
  },
  aurora(p) {
    ctx.globalCompositeOperation = 'lighter';
    const yy = Math.sin(p.ph) * 6, g = ctx.createLinearGradient(0, -24 + yy, 0, 10 + yy);
    g.addColorStop(0, `hsla(${p.hue},100%,60%,0)`); g.addColorStop(0.55, `hsla(${p.hue},100%,60%,0.55)`); g.addColorStop(1, `hsla(${p.hue + 40},100%,60%,0)`);
    ctx.fillStyle = g; ctx.fillRect(-3, -24 + yy, 6, 34);
  },
  firework(p, a, s) {
    const t = 1 - a, r = s * (1 - (1 - t) ** 3);
    ctx.globalCompositeOperation = 'lighter';
    if (t < 0.15) { ctx.fillStyle = '#fff'; circle(0, 0, 5 * (1 - t / 0.15)); ctx.fill(); }
    ctx.fillStyle = `hsl(${p.hue},100%,65%)`;
    for (let i = 0; i < 14; i++) { const an = i / 14 * Math.PI * 2; circle(Math.cos(an) * r, Math.sin(an) * r + t * t * 10, 1.8 * (1 - t) + 0.4); ctx.fill(); }
    ctx.fillStyle = `hsl(${p.hue + 40},100%,80%)`;
    for (let i = 0; i < 7; i++) { const an = (i + 0.5) / 7 * Math.PI * 2; circle(Math.cos(an) * r * 0.55, Math.sin(an) * r * 0.55 + t * t * 8, 1.2 * (1 - t) + 0.3); ctx.fill(); }
  },
};

// Auras: drawn behind (front=false) and over (front=true) the pig, in pig space. fx = the effect entry
const AURAS = {
  tron(front, hat, fx) {
    if (front) return;
    const pulse = 0.5 + 0.5 * Math.sin(clock * 4);
    glow(fx.c, 12); ctx.strokeStyle = fx.c; ctx.globalAlpha *= 0.35 + 0.35 * pulse; ctx.lineWidth = 2;
    ellipse(4, -2, 38, 28); ctx.stroke(); noGlow();
  },
  glitch(front) {
    if (!front) {
      const g = ctx.createRadialGradient(4, -4, 8, 4, -4, 44); g.addColorStop(0, 'rgba(120,255,255,0.25)'); g.addColorStop(1, 'rgba(255,80,255,0)');
      ctx.fillStyle = g; circle(4, -4, 44); ctx.fill(); return;
    }
    if (mod(clock, 1.6) > 0.18) return;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const y = rand(-30, 20), h = rand(1.5, 4), dx = rand(-6, 6);
      ctx.fillStyle = 'rgba(0,255,255,0.35)'; ctx.fillRect(-28 + dx, y, rand(30, 66), h);
      ctx.fillStyle = 'rgba(255,0,200,0.35)'; ctx.fillRect(-26 - dx, y + h, rand(30, 66), h * 0.6);
    }
  },
  galaxy(front, hat, fx) {
    if (front) return;
    const h = fx.h ?? 250, g = ctx.createRadialGradient(4, -4, 6, 4, -4, 54);
    g.addColorStop(0, `hsla(${h + 15},70%,55%,0.45)`); g.addColorStop(1, `hsla(${h},70%,30%,0)`);
    ctx.fillStyle = g; circle(4, -4, 54); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    for (let arm = 0; arm < 2; arm++) for (let j = 0; j < 24; j++) {
      const an = clock * 0.8 + arm * Math.PI + j * 0.26, r = 10 + j * 1.8;
      ctx.fillStyle = `hsla(${h + j * 4},100%,78%,${1 - j / 24})`; circle(4 + Math.cos(an) * r, -4 + Math.sin(an) * r * 0.55, 1.5); ctx.fill();
    }
  },
  blackhole(front, hat, fx) {
    const [glowCol, ringCol, dash, haze] = fx.ring;
    const ring = (a0, a1) => {
      glow(glowCol, 14); ctx.lineWidth = 5; ctx.strokeStyle = ringCol;
      ctx.beginPath(); ctx.ellipse(2, 2, 50, 12, -0.12, a0, a1); ctx.stroke(); noGlow();
      ctx.setLineDash([5, 7]); ctx.lineDashOffset = -clock * 60; ctx.lineWidth = 2; ctx.strokeStyle = dash;
      ctx.beginPath(); ctx.ellipse(2, 2, 50, 12, -0.12, a0, a1); ctx.stroke(); ctx.setLineDash([]);
    };
    if (!front) {
      const g = ctx.createRadialGradient(2, -4, 10, 2, -4, 56); g.addColorStop(0, 'rgba(0,0,0,0.85)'); g.addColorStop(0.55, 'rgba(40,10,60,0.6)'); g.addColorStop(0.75, haze); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; circle(2, -4, 56); ctx.fill();
      ring(Math.PI, Math.PI * 2);
    } else ring(0, Math.PI);
  },
  nova(front, hat, fx) {
    if (front) return;
    const pulse = 0.5 + 0.5 * Math.sin(clock * 3), h0 = fx.h ?? 0, span = fx.span ?? 360;
    const col = (i, l, a) => span >= 360 ? hue(i * 30, l, a, 60) : `hsla(${h0 + span * (0.5 + 0.5 * Math.sin(clock * 2 + i))},100%,${l}%,${a})`;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 12; i++) {
      const an = clock * 0.5 + i * Math.PI / 6, L = 58 + 10 * Math.sin(clock * 4 + i);
      ctx.fillStyle = col(i, 65, 0.22);
      ctx.beginPath(); ctx.moveTo(4, -4); ctx.lineTo(4 + Math.cos(an - 0.09) * L, -4 + Math.sin(an - 0.09) * L); ctx.lineTo(4 + Math.cos(an + 0.09) * L, -4 + Math.sin(an + 0.09) * L); ctx.closePath(); ctx.fill();
    }
    const g = ctx.createRadialGradient(4, -4, 4, 4, -4, 40 + 6 * pulse);
    g.addColorStop(0, 'rgba(255,255,255,0.7)'); g.addColorStop(0.4, col(0, 70, 0.45)); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; circle(4, -4, 46 + 6 * pulse); ctx.fill();
  },
};

// ---------- Register ----------
for (const h of DELUXE_HATS) { h.lux = true; HATS.push(h); HAT_BY_ID[h.id] = h; }
for (const w of DELUXE_WINGS) { w.lux = true; WINGS.push(w); WING_BY_ID[w.id] = w; }
for (const f of DELUXE_FX) { f.lux = true; FX.push(f); FX_BY_ID[f.id] = f; }
// The shop lists everything cheapest first (the free starter wing and effect stay at the front)
for (const list of [HATS, WINGS, FX]) list.sort((a, b) => a.price - b.price);
