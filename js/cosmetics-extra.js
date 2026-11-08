'use strict';
// More deluxe designs: same rules as js/cosmetics-deluxe.js (and it reuses that file's helpers).
// Hats: halos, cat ears, headphones, orbiting orbs, unicorn horns, weather clouds, flower crowns, jellyfish, disco balls.
// Wings: 8-bit, soap bubble, petals, playing cards, jets, clockwork, lightning, stained glass, pure flame.
// Effects: petals, pixels, neon hearts, butterflies, emoji, money, comets, frost, magic circles, disco, portals.

// ---------- Hats ----------
Object.assign(HAT_DRAW, {
  halo: (c, rings = 1) => function () {
    const y = -20 + Math.sin(clock * 3) * 2;
    for (let r = 0; r < rings; r++) {
      const yy = y - r * 5, rx = 12 - r * 2, col = c || hue(r * 120, 65);
      glow(col, 12); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(2, yy, rx, 3.5, -0.1, 0, Math.PI * 2); ctx.stroke();
      noGlow(); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(2, yy, rx, 3.5, -0.1, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke();
    }
  },
  neko: c => function () {
    for (const [bx, lean] of [[-9, -0.35], [5, 0.15]]) {
      const by = 9 - Math.sqrt(225 - bx * bx), col = c || hue(bx * 8, 62);
      ctx.save(); ctx.translate(bx, by); ctx.rotate(lean + Math.sin(clock * 2 + bx) * 0.05);
      polyPath([[-5, 0], [0, -13], [5, 0]]); ctx.fillStyle = '#1a1424'; ctx.fill();
      glow(col, 10); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.globalAlpha *= 0.55 + 0.3 * Math.sin(clock * 4); ctx.fillStyle = col; polyPath([[-2.5, -1], [0, -8], [2.5, -1]]); ctx.fill();
      ctx.restore();
    }
  },
  phones: c => function () {
    const col = c || hue(0, 60), band = () => { ctx.beginPath(); ctx.moveTo(-6, 4); ctx.quadraticCurveTo(-8, -12, 1, -10); ctx.stroke(); };
    ctx.strokeStyle = '#1b1e26'; ctx.lineWidth = 4; band();
    glow(col, 8); ctx.strokeStyle = col; ctx.lineWidth = 1.2; band(); noGlow();
    ctx.fillStyle = '#20232c'; circle(-6, 8, 7); ctx.fill();
    glow(col, 10); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = col;
    for (let i = 0; i < 4; i++) { const h = 2 + 6 * Math.abs(Math.sin(clock * (6 + i * 1.7) + i)); ctx.fillRect(-9.8 + i * 2, 11 - h, 1.3, h); }
    noGlow();
  },
  orbs: cols => function () {
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(0, -6, 20, 6, 0, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const a = clock * 2 + i * Math.PI * 2 / 3, x = Math.cos(a) * 20, y = -6 + Math.sin(a) * 6, front = Math.sin(a) > 0, c = cols ? cols[i] : hue(i * 120);
      ctx.save(); ctx.globalAlpha *= front ? 1 : 0.45;
      glow(c, 12); ctx.fillStyle = c; circle(x, y, front ? 3 : 2.3); ctx.fill(); noGlow();
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; circle(x - 0.8, y - 0.8, 1); ctx.fill();
      ctx.restore();
    }
  },
  // cols = [base, tip, glow], or null for a hologram horn
  unicorn: cols => function () {
    ctx.save(); ctx.translate(8, -4); ctx.rotate(0.5);
    if (cols) { glow(cols[2], 12); ctx.fillStyle = grad2(0, 0, 0, -24, cols[0], cols[1]); }
    else { glow(hue(0, 70), 12); ctx.fillStyle = holoGrad(-4, 0, 4, -24, 0.95, 70, 160); }
    polyPath([[-4, 0], [0, -24], [4, 0]]); ctx.fill(); noGlow();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) { const y = -i * 5, w = 4 * (1 + y / 24); line(-w, y + 1.5, w, y - 1.5); }
    ctx.restore();
    sparkle(19.5 + Math.cos(clock * 3) * 6, -25 + Math.sin(clock * 3) * 4, 2 * Math.abs(Math.sin(clock * 5)));
    sparkle(13, -17, 1.6 * Math.sin(clock * 4 + 2));
  },
  // kind: 'rain' (with lightning), 'snow' or 'rainbow'
  cloud: kind => function () {
    const cy = -26 + Math.sin(clock * 1.5) * 1.5;
    if (kind === 'rainbow') RAINBOW.forEach((c, i) => { ctx.strokeStyle = c; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(2, cy + 6, 16 - i * 1.6, Math.PI, Math.PI * 2); ctx.stroke(); });
    else for (let i = 0; i < 6; i++) {
      const t = mod(clock * (kind === 'snow' ? 0.7 : 2.2) + i / 6, 1), x = -8 + i * 3.4 + (kind === 'snow' ? Math.sin(clock * 2 + i) * 1.5 : 0), y = cy + 4 + t * 16;
      if (kind === 'snow') { ctx.fillStyle = `rgba(255,255,255,${1 - t})`; circle(x, y, 1.2); ctx.fill(); }
      else { ctx.strokeStyle = `rgba(120,180,255,${1 - t})`; ctx.lineWidth = 1.2; line(x, y, x - 1, y + 3); }
    }
    if (kind === 'rain' && mod(clock, 2.4) < 0.12) {
      glow('#fff3a0', 10); ctx.strokeStyle = '#fff6b0'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(2, cy + 3); ctx.lineTo(-1, cy + 9); ctx.lineTo(3, cy + 10); ctx.lineTo(0, cy + 17); ctx.stroke(); noGlow();
    }
    ctx.fillStyle = kind === 'rain' ? grad2(0, cy - 9, 0, cy + 5, '#8a93a6', '#5d6578') : grad2(0, cy - 9, 0, cy + 5, '#ffffff', '#d6e4f5');
    for (const [x, y, r] of [[-8, cy, 5], [-2, cy - 4, 7], [6, cy - 2, 6], [11, cy + 1, 4], [1, cy + 2, 6]]) { circle(x, y, r); ctx.fill(); }
  },
  flowers: (petal, centre) => function () {
    for (let i = 0; i < 7; i++) {
      const an = Math.PI * (1.08 + i * 0.14);
      ctx.save(); ctx.translate(Math.cos(an) * 14.5, 8 + Math.sin(an) * 14.5); ctx.rotate(clock * 0.6 + i);
      ctx.fillStyle = petal[i % 2];
      for (let k = 0; k < 5; k++) { ctx.rotate(Math.PI * 2 / 5); ellipse(0, -3, 1.9, 3); ctx.fill(); }
      ctx.fillStyle = centre; circle(0, 0, 1.4); ctx.fill(); ctx.restore();
    }
    for (let i = 0; i < 3; i++) {
      const t = mod(clock * 0.5 + i / 3, 1);
      ctx.save(); ctx.translate(-14 + i * 12 + Math.sin(clock * 2 + i) * 3, -6 + t * 24); ctx.rotate(clock * 3 + i); ctx.globalAlpha *= 1 - t;
      ctx.fillStyle = petal[0]; ellipse(0, 0, 1.6, 2.6); ctx.fill(); ctx.restore();
    }
  },
  jelly: c => function () {
    const by = -24 + Math.sin(clock * 2.2) * 2.5, pulse = 1 + 0.08 * Math.sin(clock * 4.4);
    glow(c, 6); ctx.strokeStyle = c; ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const x0 = -6 + i * 3; ctx.beginPath(); ctx.moveTo(x0, by + 1);
      for (let k = 1; k <= 4; k++) ctx.lineTo(x0 + Math.sin(clock * 3 + i + k * 0.9) * 2, by + 1 + k * 4);
      ctx.stroke();
    }
    ctx.save(); ctx.translate(0, by); ctx.scale(pulse, 1 / pulse);
    const g = ctx.createRadialGradient(-2, -4, 1, 0, -2, 11); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, c);
    glow(c, 14); ctx.fillStyle = g; ctx.globalAlpha *= 0.85;
    ctx.beginPath(); ctx.moveTo(-10, 1); ctx.quadraticCurveTo(-10, -11, 0, -11); ctx.quadraticCurveTo(10, -11, 10, 1);
    ctx.quadraticCurveTo(5, -1, 0, 1.5); ctx.quadraticCurveTo(-5, -1, -10, 1); ctx.fill();
    ctx.restore(); noGlow();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; circle(-4, by - 6, 1.2); ctx.fill();
  },
  disco: gold => function () {
    const cy = -22 + Math.sin(clock * 2) * 1.2;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 8; i++) {
      const an = clock * 1.5 + i * Math.PI / 4;
      ctx.fillStyle = gold ? `hsla(${40 + 15 * Math.sin(i)},100%,65%,0.22)` : hue(i * 45, 65, 0.22);
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(Math.cos(an - 0.08) * 30, cy + Math.sin(an - 0.08) * 30); ctx.lineTo(Math.cos(an + 0.08) * 30, cy + Math.sin(an + 0.08) * 30); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = '#888'; ctx.lineWidth = 0.8; line(0, cy - 8, 0, cy - 16);
    ctx.save(); circle(0, cy, 8); ctx.clip();
    for (let gx = -8; gx < 8; gx += 2.6) for (let gy = -8; gy < 8; gy += 2.6) {
      const b = 0.5 + 0.5 * Math.sin(clock * 6 + gx * 1.7 + gy * 2.3);
      ctx.fillStyle = gold ? `hsl(45,85%,${38 + b * 52}%)` : `hsl(220,12%,${42 + b * 52}%)`; ctx.fillRect(gx + 0.2, gy + 0.2, 2.2, 2.2);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1; circle(0, cy, 8); ctx.stroke();
    sparkle(-3, cy - 4, 2.5 * Math.sin(clock * 7));
  },
});
// Stacks several hat designs into one hat
const combo = (...fns) => function () { for (const f of fns) { ctx.save(); f.call(this); ctx.restore(); } };

const EXTRA_HATS = [
  { id: 'd:haloPink', name: 'Hot Pink Halo', price: 1000, draw: HAT_DRAW.halo('#ff5ad0'), desc: 'Angelic, but make it nightclub.' },
  { id: 'd:haloCyan', name: 'Cyber Halo', price: 1000, draw: HAT_DRAW.halo('#3ff6ff'), desc: 'Blessed by the cloud. The computer kind.' },
  { id: 'd:haloGold', name: 'Golden Glow Halo', price: 1300, draw: HAT_DRAW.halo('#ffd84a'), desc: 'Officially the goodest pig.' },
  { id: 'd:haloRainbow', name: 'Rainbow Double Halo', price: 2400, draw: HAT_DRAW.halo(null, 2), desc: 'Twice as holy. Four times as fabulous.' },
  { id: 'd:nekoPink', name: 'Neko Neon Ears', price: 1050, draw: HAT_DRAW.neko('#ff5ad0'), desc: 'Nya-oink.' },
  { id: 'd:nekoCyan', name: 'Cyber Kitty Ears', price: 1050, draw: HAT_DRAW.neko('#3ff6ff'), desc: 'Purr-cessing at 9000 meows per second.' },
  { id: 'd:nekoPurple', name: 'Shadow Cat Ears', price: 1150, draw: HAT_DRAW.neko('#b04aff'), desc: 'Nine lives. Zero chill. One snout.' },
  { id: 'd:nekoRainbow', name: 'Rainbow Kitty Ears', price: 1500, draw: HAT_DRAW.neko(null), desc: 'The cat\'s pyjamas. The pig\'s whiskers.' },
  { id: 'd:phonesPink', name: 'DJ Hog-phones', price: 1250, draw: HAT_DRAW.phones('#ff3df0'), desc: 'Now spinning: Oink-Oink Remix (Extended).' },
  { id: 'd:phonesCyan', name: 'Bass Drop Phones', price: 1250, draw: HAT_DRAW.phones('#3ff6ff'), desc: 'Wub wub wub. Oink oink oink.' },
  { id: 'd:phonesRave', name: 'Rave Phones', price: 1600, draw: HAT_DRAW.phones(null), desc: 'The beat never stops. Neither do you.' },
  { id: 'd:phonesGold', name: 'Platinum Record Phones', price: 1700, draw: HAT_DRAW.phones('#ffd84a'), desc: 'Your debut album went triple-ham.' },
  { id: 'd:orbsFire', name: 'Orbiting Embers', price: 1600, draw: HAT_DRAW.orbs(['#ff7a1a', '#ffb040', '#ff3a1a']), desc: 'Three tiny suns with a crush on you.' },
  { id: 'd:orbsPixie', name: 'Pixie Orbs', price: 1600, draw: HAT_DRAW.orbs(['#7dff5a', '#b6ff8a', '#ffffff']), desc: 'Fairy friends. They only eat truffles.' },
  { id: 'd:orbsVoid', name: 'Void Orbs', price: 1800, draw: HAT_DRAW.orbs(['#b04aff', '#6a2aa0', '#ff5ad0']), desc: 'They whisper. Mostly about lunch.' },
  { id: 'd:orbsChroma', name: 'Chroma Orbs', price: 2100, draw: HAT_DRAW.orbs(null), desc: 'Red, green, blue and all the snacks between.' },
  { id: 'd:cloudRain', name: 'Personal Rain Cloud', price: 1900, draw: HAT_DRAW.cloud('rain'), desc: 'Gloomy? Never. Perfect mud weather.' },
  { id: 'd:cloudSnow', name: 'Let It Snow Cloud', price: 2000, draw: HAT_DRAW.cloud('snow'), desc: 'Your own private winter wonderland.' },
  { id: 'd:cloudRainbow', name: 'Rainbow Cloud', price: 2400, draw: HAT_DRAW.cloud('rainbow'), desc: 'Every day is a good day under here.' },
  { id: 'd:sakura', name: 'Sakura Crown', price: 2200, draw: HAT_DRAW.flowers(['#ff9ac8', '#ffc4dd'], '#ffe14d'), desc: 'Cherry blossoms. Cherry-glazed ham.' },
  { id: 'd:lotus', name: 'Lotus Crown', price: 2300, draw: HAT_DRAW.flowers(['#ffffff', '#d4b8ff'], '#ffd84a'), desc: 'Inner peace, outer fabulousness.' },
  { id: 'd:sunflower', name: 'Sunflower Crown', price: 2300, draw: HAT_DRAW.flowers(['#ffd84a', '#ffb000'], '#6a3a10'), desc: 'Always faces the sun. And the snack bowl.' },
  { id: 'd:unicorn', name: 'Uni-pork-n Horn', price: 2300, draw: HAT_DRAW.unicorn(null), desc: 'Magical. Majestic. Mostly ham.' },
  { id: 'd:unicornIce', name: 'Crystal Uni-pork-n', price: 2500, draw: HAT_DRAW.unicorn(['#ffffff', '#7cc8f0', '#bff4ff']), desc: 'Carved from one perfect icicle.' },
  { id: 'd:unicornDark', name: 'Obsidian Uni-pork-n', price: 2700, draw: HAT_DRAW.unicorn(['#3a1a5a', '#0a0410', '#b04aff']), desc: 'A night-mare. Get it? Sorry.' },
  { id: 'd:unicornGold', name: 'Golden Uni-pork-n', price: 3000, draw: HAT_DRAW.unicorn(['#fff09a', '#c98a00', '#ffd84a']), desc: 'Worth more than the entire farm.' },
  { id: 'd:jellyPink', name: 'Jelly Hog', price: 2800, draw: HAT_DRAW.jelly('rgba(255,120,220,0.85)'), desc: 'Bloop. Bloop. Wobbly and proud.' },
  { id: 'd:jellyBlue', name: 'Blue Bloop Jelly', price: 2800, draw: HAT_DRAW.jelly('rgba(90,180,255,0.85)'), desc: 'Fresh from the Bacon Bay deep.' },
  { id: 'd:jellyGlow', name: 'Glow-in-the-Dark Jelly', price: 3000, draw: HAT_DRAW.jelly('rgba(120,255,150,0.85)'), desc: 'Night-light included. Batteries not.' },
  { id: 'd:disco', name: 'Disco Ball Hog', price: 3500, draw: HAT_DRAW.disco(false), desc: 'Saturday night fever. Every night.' },
  { id: 'd:discoGold', name: 'Golden Disco Ball', price: 5500, draw: HAT_DRAW.disco(true), desc: 'Studio 54 called. They want their pig back.' },
  { id: 'd:pigverseHorn', name: 'Pig-verse Uni-pork-n', price: 15000, draw: combo(HAT_DRAW.halo(null, 2), HAT_DRAW.orbs(null), HAT_DRAW.unicorn(null)), desc: 'Halo, orbs AND a horn. The final form of fabulous.' },
];

// ---------- Wings ----------
const srand = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// squares of a 3px grid that fall inside the feather wing, for the 8-bit wings
const PIXEL_CELLS = (() => {
  const c = document.createElement('canvas').getContext('2d'), out = [];
  c.translate(50, 50);
  for (let x = -39; x <= 0; x += 3) for (let y = -36; y <= 3; y += 3) if (c.isPointInPath(WING_PATHS.feather, x + 51.5, y + 51.5)) out.push([x, y]);
  return out;
})();
function gearPath(r, teeth) {
  ctx.beginPath();
  for (let i = 0; i < teeth * 4; i++) { const a = i * Math.PI / (teeth * 2), rr = (i % 4 < 2) ? r : r * 0.78; i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(rr, 0); }
  ctx.closePath();
}
Object.assign(WING_STYLES, {
  // Chunky 8-bit pixels. pal = palette, or null for a rainbow wave
  pixel(w) {
    for (const [x, y] of PIXEL_CELLS) {
      ctx.fillStyle = w.pal ? w.pal[mod(Math.floor((x - y) / 6 + clock * 4), w.pal.length)] : `hsl(${mod((x + y) * 4 + clock * 200, 360)},90%,60%)`;
      ctx.fillRect(x, y, 3.05, 3.05);
    }
    return null;
  },
  // Soap film: almost clear, with rainbow swirls and little bubbles drifting off
  bubble(w) {
    const P = WING_PATHS.feather;
    ctx.fillStyle = holoGrad(0, 0, -36, -32, 0.25, 75, 60); ctx.fill(P);
    ctx.strokeStyle = holoGrad(0, 0, -36, -32, 0.9, 70, 60); ctx.lineWidth = 1.4; ctx.stroke(P);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-6, -10); ctx.quadraticCurveTo(-12, -22, -22, -26); ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const t = mod(clock * 0.5 + i / 3, 1);
      ctx.strokeStyle = `rgba(200,240,255,${1 - t})`; ctx.lineWidth = 0.8; circle(-30 + i * 8 - t * 6, -20 - t * 14 + i * 4, 1.5 + i * 0.5); ctx.stroke();
    }
    return null;
  },
  // A soft wing covered in petals (or leaves), a few blowing away. c = [light, dark], edge, p = petal colours
  petal(w) {
    const P = WING_PATHS.feather;
    const petalAt = (x, y, r, rot, col) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(r * 0.9, 0, 0, r); ctx.quadraticCurveTo(-r * 0.9, 0, 0, -r); ctx.fill(); ctx.restore(); };
    ctx.fillStyle = wingGrad(w.c[0], w.c[1]); ctx.fill(P);
    ctx.strokeStyle = w.edge; ctx.lineWidth = 1.2; ctx.stroke(P);
    [[-30, -27], [-24, -20], [-18, -12], [-12, -6], [-22, -26], [-14, -18], [-8, -14]].forEach(([x, y], i) => petalAt(x, y, 3, i + Math.sin(clock * 2 + i) * 0.2, w.p[i % w.p.length]));
    for (let i = 0; i < 3; i++) {
      const t = mod(clock * 0.6 + i / 3, 1);
      ctx.save(); ctx.globalAlpha *= 1 - t; petalAt(-20 - t * 12 + i * 6, -10 + t * 22, 2.4, clock * 4 + i, w.p[0]); ctx.restore();
    }
    return P;
  },
  // A fan of playing cards. gold = golden cards
  cards(w) {
    const suits = ['♠', '♥', '♣', '♦', '♥'];
    for (let i = 0; i < 5; i++) {
      ctx.save(); ctx.rotate(0.12 + i * 0.27);
      rrect(-37, -6, 25, 12, 2);
      ctx.fillStyle = w.gold ? grad2(-37, -6, -12, 6, '#fff3a0', '#d99a00') : '#ffffff'; ctx.fill();
      ctx.strokeStyle = w.gold ? '#8a5a00' : '#4a4a5a'; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = w.gold ? '#8a5a00' : (i % 2 ? '#e0203a' : '#1a1a2a'); ctx.fillText(suits[i], -25, 0.5);
      ctx.restore();
    }
    if (w.gold) sparkle(-30, -24, 2.8 * Math.sin(clock * 5));
    return null;
  },
  // A swept metal wing with a jet engine roaring. c = [light, dark], edge, stripe, flame = [outer, core]
  jet(w) {
    polyPath([[0, -2], [-30, -26], [-36, -24], [-14, 2]]);
    ctx.fillStyle = grad2(0, 0, -34, -20, w.c[0], w.c[1]); ctx.fill(); ctx.strokeStyle = w.edge; ctx.lineWidth = 1; ctx.stroke();
    ctx.strokeStyle = w.stripe; ctx.lineWidth = 1.6; line(-6, -3, -30, -22);
    const L = 10 + 4 * Math.sin(clock * 40);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(w.flame[0], 10); ctx.fillStyle = w.flame[0]; polyPath([[-26, -13], [-26 - L, -10], [-26, -7]]); ctx.fill();
    ctx.fillStyle = w.flame[1]; polyPath([[-26, -11.5], [-26 - L * 0.55, -10], [-26, -8.5]]); ctx.fill();
    ctx.restore();
    rrect(-27, -14, 16, 8, 4); ctx.fillStyle = grad2(0, -14, 0, -6, '#e8eef5', '#5a6a7a'); ctx.fill(); ctx.strokeStyle = '#2d313b'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#2d313b'; ctx.fillRect(-27, -13, 2, 6);
    return null;
  },
  // Brass struts, metal feathers and spinning gears. c = [light, dark, hub]
  gear(w) {
    const [hi, lo, hub] = w.c, struts = [[0, 0, -12, -22, -34, -30], [-12, -22, -26, -10]];
    for (let i = 0; i < 4; i++) {
      ctx.save(); ctx.translate(-12, -22); ctx.rotate(-0.15 + i * 0.4);
      rrect(-24, -2, 24, 4, 2); ctx.fillStyle = grad2(-24, 0, 0, 0, hi, lo); ctx.fill(); ctx.strokeStyle = lo; ctx.lineWidth = 0.6; ctx.stroke();
      ctx.restore();
    }
    bones(struts, lo, 3.4); bones(struts, hi, 1.4);
    for (const [x, y, r, t, dir] of [[-12, -22, 7, 8, 1], [-28, -26, 5.5, 7, -1], [-25, -10, 4.5, 6, -1], [-3, -4, 4, 6, 1]]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(clock * dir * 3.2 / r * 2);
      gearPath(r, t); ctx.fillStyle = grad2(-r, -r, r, r, hi, lo); ctx.fill(); ctx.strokeStyle = lo; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.fillStyle = hub; circle(0, 0, r * 0.32); ctx.fill();
      ctx.restore();
    }
    return null;
  },
  // Crackling bolts in the shape of a wing. c = bolt colour, haze = faint fill
  lightning(w) {
    const seed = Math.floor(clock * 14);
    ctx.fillStyle = w.haze; ctx.fill(WING_PATHS.feather);
    [[-36, -30], [-30, -20], [-26, -12], [-20, -4], [-14, -26]].forEach(([tx, ty], i) => {
      const pts = [[0, 0]];
      for (let k = 1; k <= 5; k++) { const f = k / 5, j = k < 5 ? (srand(seed * 7 + i * 13 + k) - 0.5) * 7 : 0; pts.push([tx * f - ty / 30 * j, ty * f + tx / 36 * j]); }
      const path = () => { ctx.beginPath(); pts.forEach(([x, y], n) => n ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
      glow(w.c, 12); ctx.strokeStyle = w.c; ctx.lineWidth = 2.4; path();
      noGlow(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.9; path();
    });
    return null;
  },
  // Cathedral window: jewel panes, lead lines and light passing through. pal = pane colours, lead
  stained(w) {
    const P = WING_PATHS.feather;
    ctx.save(); ctx.clip(P);
    for (let i = 0; i < 6; i++) {
      const a0 = Math.PI * (1 + i * 0.085), a1 = a0 + Math.PI * 0.085;
      for (const [r0, r1, l] of [[0, 14, 0], [14, 27, 1], [27, 50, 2]]) {
        ctx.beginPath(); ctx.arc(0, 0, r1, a0, a1); ctx.arc(0, 0, r0, a1, a0, true); ctx.closePath();
        ctx.fillStyle = w.pal[(i + l * 2) % w.pal.length]; ctx.fill();
      }
    }
    const sx = -50 + mod(clock * 30, 70), g = ctx.createRadialGradient(sx, -18, 1, sx, -18, 14);
    g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(-40, -40, 44, 44);
    ctx.strokeStyle = w.lead; ctx.lineWidth = 1.3;
    for (let i = 0; i <= 6; i++) { const a = Math.PI * (1 + i * 0.085); line(0, 0, Math.cos(a) * 50, Math.sin(a) * 50); }
    for (const r of [14, 27]) { ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, Math.PI * 1.55); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = w.lead; ctx.lineWidth = 2; ctx.stroke(P);
    return P;
  },
  // A wing made of nothing but flickering flame. c = [outer, inner], or rainbow
  flame(w) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(w.rainbow ? hue(0, 60) : w.c[0], 10);
    [[-36, -30], [-33, -24], [-30, -18], [-26, -11], [-20, -4], [-24, -30]].forEach(([tx, ty], i) => {
      const fl = Math.sin(clock * 14 + i * 1.9), L = Math.hypot(tx, ty), px = -ty / L, py = tx / L;
      for (const k of [1, 0.6]) {
        ctx.fillStyle = w.rainbow ? hue(i * 50 + (k < 1 ? 40 : 0), k < 1 ? 75 : 55, k < 1 ? 0.9 : 0.8) : w.c[k < 1 ? 1 : 0];
        const wd = 5 * k, ex = tx * k * (1 + 0.08 * fl), ey = ty * k * (1 + 0.08 * fl) + fl;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(ex * 0.5 + px * wd, ey * 0.5 + py * wd, ex, ey); ctx.quadraticCurveTo(ex * 0.5 - px * wd, ey * 0.5 - py * wd, 0, 0); ctx.fill();
      }
    });
    ctx.restore();
    return null;
  },
});

const GB = ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'];
const FIRE = ['rgba(255,70,20,0.8)', 'rgba(255,210,70,0.9)'];
const EXTRA_WINGS = [
  { id: 'w:pixel', name: 'Retro 8-Bit Wings', price: 1100, style: 'pixel', pal: null, desc: 'Press START to oink.' },
  { id: 'w:pixelGB', name: 'Pocket Pixel Wings', price: 1150, style: 'pixel', pal: GB, desc: 'Four shades of green. Infinite nostalgia.' },
  { id: 'w:pixelGold', name: 'Arcade Gold Wings', price: 1300, style: 'pixel', pal: ['#7a4a00', '#c98a00', '#ffd84a', '#fff3a0'], desc: 'High score: ALL OF THEM.' },
  { id: 'w:bubble', name: 'Soap Opera Wings', price: 1200, style: 'bubble', desc: 'Dramatic. Shiny. Might pop at any moment.' },
  { id: 'w:sakura', name: 'Sakura Wings', price: 1400, style: 'petal', c: ['#ffe4f0', '#ffb3d0'], edge: '#e88ab0', p: ['#ff9ac8', '#ffc4dd', '#ffffff'], desc: 'Blossoms on the breeze. Bacon on the menu.' },
  { id: 'w:autumn', name: 'Autumn Wings', price: 1400, style: 'petal', c: ['#ffe0b0', '#e07a30'], edge: '#a04a10', p: ['#e0502a', '#f0a020', '#c03a1a'], desc: 'Pumpkin spice and everything nice.' },
  { id: 'w:lavender', name: 'Lavender Wings', price: 1500, style: 'petal', c: ['#f4e8ff', '#b89aff'], edge: '#8a6ad0', p: ['#a07aff', '#d4c0ff', '#ffffff'], desc: 'Smells like a spa. Flies like a pig.' },
  { id: 'w:cards', name: 'High Roller Wings', price: 1700, style: 'cards', desc: 'Always bet on pork.' },
  { id: 'w:jet', name: 'Turbo Trotter Jets', price: 1800, style: 'jet', c: ['#dfe6ee', '#7d8899'], edge: '#3d4a5a', stripe: '#ff3a3a', flame: ['#ff8a2a', '#fff3a0'], desc: 'Mach 3 and still smells like bacon.' },
  { id: 'w:jetRed', name: 'Hot Rod Jets', price: 2000, style: 'jet', c: ['#ff6a5a', '#a0140a'], edge: '#5a0a05', stripe: '#ffd84a', flame: ['#ff5a1a', '#ffe14d'], desc: 'Flames on the side. Flames out the back.' },
  { id: 'w:jetStealth', name: 'Stealth Swine Jets', price: 2100, style: 'jet', c: ['#4a5260', '#1a1e26'], edge: '#0a0c10', stripe: '#3ff6ff', flame: ['#3a9bff', '#e0f8ff'], desc: 'Invisible to radar. Not to bacon lovers.' },
  { id: 'w:gear', name: 'Clockwork Wings', price: 2300, style: 'gear', c: ['#ffe08a', '#9a6a10', '#5a3a10'], desc: 'Tick tock, it\'s oink o\'clock.' },
  { id: 'w:gearChrome', name: 'Chrome Cog Wings', price: 2500, style: 'gear', c: ['#ffffff', '#7d8899', '#2a3a4a'], desc: 'Polished to a mirror shine. Admire yourself.' },
  { id: 'w:cardsGold', name: 'Golden Ticket Wings', price: 2600, style: 'cards', gold: true, desc: 'You found it! A lifetime supply of truffles.' },
  { id: 'w:storm', name: 'Thunderwing', price: 2600, style: 'lightning', c: '#7fd8ff', haze: 'rgba(120,200,255,0.12)', desc: 'Ride the lightning. Smell like toast.' },
  { id: 'w:stormViolet', name: 'Violet Storm Wings', price: 2800, style: 'lightning', c: '#c48bff', haze: 'rgba(180,120,255,0.12)', desc: 'Purple rain. Purple pain. Purple pig.' },
  { id: 'w:gearRose', name: 'Rose Gold Gears', price: 2900, style: 'gear', c: ['#ffd8d0', '#c07a6a', '#ff8ab0'], desc: 'Fancy machinery for a fancy hog.' },
  { id: 'w:stormGold', name: 'Golden Bolt Wings', price: 3200, style: 'lightning', c: '#ffe14d', haze: 'rgba(255,220,80,0.12)', desc: 'Struck by lightning. Twice. On purpose.' },
  { id: 'w:stained', name: 'Cathedral Glass Wings', price: 4000, style: 'stained', pal: ['#c0203a', '#2050c0', '#e0a020', '#20a060', '#8030b0', '#e06020'], lead: '#2a1a10', desc: 'A masterpiece of medieval ham-craft.' },
  { id: 'w:seaGlass', name: 'Sea Glass Wings', price: 4200, style: 'stained', pal: ['#7ad8c8', '#4ab0b8', '#a0e8d0', '#3a8aa0', '#c0f0e0', '#5ac0a8'], lead: '#1a3a3a', desc: 'Tumbled smooth by a thousand Bacon Bay tides.' },
  { id: 'w:inferno', name: 'Inferno Wings', price: 4500, style: 'flame', c: FIRE, desc: 'Pure fire. No feathers. No regrets.' },
  { id: 'w:infernoBlue', name: 'Blue Inferno Wings', price: 4800, style: 'flame', c: ['rgba(40,110,255,0.8)', 'rgba(170,240,255,0.9)'], desc: 'The hottest flames burn blue. So do you.' },
  { id: 'w:ghostfire', name: 'Ghostfire Wings', price: 4800, style: 'flame', c: ['rgba(60,220,40,0.8)', 'rgba(220,255,140,0.9)'], desc: 'Spooky. Toasty. Spoasty.' },
  { id: 'w:soulfire', name: 'Soulfire Wings', price: 5200, style: 'flame', c: ['rgba(170,50,255,0.8)', 'rgba(255,170,255,0.9)'], desc: 'Burns with the spirit of a thousand barbecues.' },
  { id: 'w:phoenixPrime', name: 'Phoenix Prime', price: 15000, style: 'flame', rainbow: true, desc: 'Every colour of fire at once. The legend is real.' },
];

// ---------- Effects ----------
const fxPetals = cols => (x, y) => ({ k: 'petal', x, y: y + rand(-14, 14), vx: rand(-50, -10), vy: rand(10, 40), life: 1.4, size: rand(3, 5), rot: rand(0, 6), vr: rand(-3, 3), col: pick(cols), wob: rand(0, 6) });
const fxPixels = pal => (x, y) => ({ k: 'px', x: x + rand(-6, 6), y: y + rand(-16, 16), vx: rand(-70, -10), vy: rand(-30, 30), life: rand(0.4, 0.8), size: pick([2, 3, 4]), col: pal ? pick(pal) : `hsl(${rand(0, 360) | 0},90%,60%)` });
const fxNeonHearts = c => (x, y) => ({ k: 'nheart', x, y: y + rand(-12, 12), vx: rand(-30, 10), vy: rand(-60, -25), life: 1.1, size: rand(6, 10), col: c, rot: rand(-0.4, 0.4) });
const fxButterflies = cols => (x, y) => ({ k: 'bfly', x, y: y + rand(-14, 14), vx: rand(-40, -10), vy: rand(-40, -15), life: 1.6, size: rand(3, 4.5), col: cols ? pick(cols) : `hsl(${rand(0, 360) | 0},100%,65%)`, wob: rand(0, 6), rot: rand(-0.3, 0.3) });
const fxBills = gold => (x, y) => ({ k: 'bill', x, y, vx: rand(-80, 20), vy: rand(-150, -50), g: 250, life: 1.6, size: 1, rot: rand(0, 6), vr: rand(-4, 4), gold });
const fxComet = (c, core) => (x, y) => ({ k: 'comet', x: x - 4, y: y + rand(-2, 2), vx: rand(-20, 0), life: 0.5, size: rand(8, 12), c, core });
const fxRunes = c => (x, y) => ({ k: 'star4', x: x + rand(-14, 10), y: y + rand(-20, 18), vx: rand(-40, 0), vy: rand(-20, 20), life: rand(0.6, 1), size: rand(3, 6), col: c || `hsl(${rand(0, 360) | 0},100%,72%)`, rot: 0, vr: rand(-2, 2) });
const EXTRA_FX = [
  { id: 'fx:sakura', name: 'Sakura Swirl', price: 900, icon: '🌸', rate: 12, make: fxPetals(['#ff9ac8', '#ffc4dd', '#ffffff']), desc: 'Spring has sprung. So has the pig.' },
  { id: 'fx:leaves', name: 'Fall-ing Leaves', price: 900, icon: '🍂', rate: 12, make: fxPetals(['#e0502a', '#f0a020', '#c03a1a', '#a0601a']), desc: 'Leaf it to the pig to look this good.' },
  { id: 'fx:lavender', name: 'Lavender Breeze', price: 1000, icon: '💜', rate: 12, make: fxPetals(['#a07aff', '#d4c0ff', '#ffffff']), desc: 'Calm, relaxing, extremely fast.' },
  { id: 'fx:pixels', name: 'Retro Pixel Trail', price: 1100, icon: '👾', rate: 40, make: fxPixels(null), desc: 'Leaving a trail of 8-bit glory.' },
  { id: 'fx:pixelsGB', name: 'Pocket Pixel Trail', price: 1150, icon: '🕹️', rate: 40, make: fxPixels(GB), desc: 'Batteries low. Swag high.' },
  { id: 'fx:neonLove', name: 'Neon Love', price: 1200, icon: '💗', rate: 12, make: fxNeonHearts('#ff5ad0'), desc: 'Love at first oink, in glowing pink.' },
  { id: 'fx:cyberCrush', name: 'Cyber Crush', price: 1200, icon: '💙', rate: 12, make: fxNeonHearts('#3ff6ff'), desc: 'Your heart: downloaded. Your snout: adored.' },
  { id: 'fx:emoji', name: 'Emoji Oink-splosion', price: 1300, icon: '🐷', rate: 8, desc: 'Say it with emoji. Say it with pig.',
    make: (x, y) => ({ k: 'emoji', x, y: y + rand(-10, 10), vx: rand(-60, 0), vy: rand(-90, -30), g: 120, life: 1.2, size: rand(10, 14), rot: rand(-0.5, 0.5), vr: rand(-2, 2), txt: pick(['🐷', '🥓', '🔥', '💯', '✨', '🐽', '😎']) }) },
  { id: 'fx:butterflies', name: 'Flutter-by Swine', price: 1400, icon: '🦋', rate: 6, make: fxButterflies(['#3a9bff', '#5ad0ff', '#7a5cff']), desc: 'A flock of tiny fans follows you everywhere.' },
  { id: 'fx:monarch', name: 'Monarch Majesty', price: 1500, icon: '👑', rate: 6, make: fxButterflies(['#ff8a1a', '#ffb000', '#e05a10']), desc: 'Royal butterflies for a royal ham.' },
  { id: 'fx:neonFlutter', name: 'Neon Flutter', price: 1700, icon: '🧚', rate: 7, make: fxButterflies(null), desc: 'Glow-in-the-dark butterflies. Very rare. Very extra.' },
  { id: 'fx:bills', name: 'Make It Rain (For Real)', price: 2000, icon: '💵', rate: 8, make: fxBills(false), desc: 'Cash money. Ham money. Fake money, but still.' },
  { id: 'fx:comet', name: 'Comet Ham-ley', price: 2200, icon: '💫', rate: 70, make: fxComet('rgba(90,200,255,0.5)', '#e8fbff'), desc: 'Only visible once every 76 years. Or every flight.' },
  { id: 'fx:cometPink', name: 'Magenta Comet', price: 2300, icon: '🔮', rate: 70, make: fxComet('rgba(255,80,220,0.5)', '#ffe0fa'), desc: 'A shooting star with a snout.' },
  { id: 'fx:tickets', name: 'Golden Tickets', price: 2600, icon: '🎫', rate: 8, make: fxBills(true), desc: 'Everyone gets a tour of the ham factory!' },
  { id: 'fx:frost', name: 'Frozen Aura', price: 2700, icon: '🧊', rate: 14, aura: 'frost', desc: 'Chill vibes only. Extremely chill.',
    make: (x, y) => ({ k: 'flake', x: x + rand(-8, 8), y: y + rand(-16, 16), vx: rand(-25, 15), vy: rand(20, 60), life: rand(1, 1.5), size: rand(3, 5), rot: rand(0, 1), vr: rand(-2, 2) }) },
  { id: 'fx:arcane', name: 'Arcane Circle', price: 3400, icon: '🔯', rate: 14, aura: 'runes', c: '#5ab4ff', make: fxRunes('#8ac8ff'), desc: 'Summoning... one (1) flying pig.' },
  { id: 'fx:infernal', name: 'Infernal Circle', price: 3600, icon: '😈', rate: 14, aura: 'runes', c: '#ff3a2a', make: fxRunes('#ff8a6a'), desc: 'Summoned from the depths of the deep fryer.' },
  { id: 'fx:druid', name: 'Druid Circle', price: 3600, icon: '🌿', rate: 14, aura: 'runes', c: '#7dff5a', make: fxRunes('#b6ff8a'), desc: 'One with nature. One with mud.' },
  { id: 'fx:disco', name: 'Disco Inferno', price: 3900, icon: '🪩', rate: 40, aura: 'disco', desc: 'Burn, baby, burn. On the dance floor.',
    make: (x, y) => ({ k: 'glint', x: x + rand(-14, 8), y: y + rand(-18, 18), vx: rand(-40, 20), vy: rand(-30, 10), g: 90, life: rand(0.5, 1), size: rand(1.5, 3), hue: rand(0, 360), rot: rand(0, 3), vr: rand(-8, 8) }) },
  { id: 'fx:portal', name: 'Portal Hopper', price: 4200, icon: '🚪', rate: 10, aura: 'portal', c: '#ff9a2a', c2: 'rgba(255,140,40,0.35)', make: fxRunes('#ffc070'), desc: 'Now you\'re thinking with pork-tals.' },
  { id: 'fx:portalBlue', name: 'Blue Portal Hopper', price: 4200, icon: '🔵', rate: 10, aura: 'portal', c: '#3ab0ff', c2: 'rgba(60,170,255,0.35)', make: fxRunes('#8ad0ff'), desc: 'In one side, out the other. Still a pig.' },
  { id: 'fx:overlord', name: 'Arcane Overlord', price: 15000, icon: '🧙', rate: 20, aura: 'runes', c: null, make: fxRunes(null), desc: 'Master of every magic. Especially the snack kind.' },
];

Object.assign(PARTICLE_DRAW, {
  petal(p, a, s) {
    ctx.scale(Math.cos(clock * 6 + p.wob), 1); ctx.fillStyle = p.col;
    ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.9, 0, 0, s); ctx.quadraticCurveTo(-s * 0.9, 0, 0, -s); ctx.fill();
  },
  px(p, a, s) { ctx.fillStyle = p.col; ctx.fillRect(-s / 2, -s / 2, s, s); },
  nheart(p, a, s) { glow(p.col, 8); ctx.strokeStyle = p.col; ctx.lineWidth = 1.8; heartPath(s); ctx.stroke(); },
  bfly(p, a, s) {
    const f = 0.25 + 0.75 * Math.abs(Math.sin(clock * 14 + p.wob));
    glow(p.col, 4); ctx.fillStyle = p.col;
    ctx.save(); ctx.scale(f, 1); ellipse(-s * 0.8, -s * 0.4, s, s * 0.8); ctx.fill(); ellipse(s * 0.8, -s * 0.4, s, s * 0.8); ctx.fill();
    ellipse(-s * 0.6, s * 0.5, s * 0.6, s * 0.5); ctx.fill(); ellipse(s * 0.6, s * 0.5, s * 0.6, s * 0.5); ctx.fill(); ctx.restore();
    noGlow(); ctx.fillStyle = '#2a1a10'; ctx.fillRect(-0.5, -s * 0.9, 1, s * 1.7);
  },
  emoji(p, a, s) { ctx.font = `${s}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.txt, 0, 0); },
  bill(p) {
    ctx.scale(1, Math.cos(clock * 7 + p.rot * 3));
    ctx.fillStyle = p.gold ? '#ffd84a' : '#6fc46a'; ctx.fillRect(-7, -3.5, 14, 7);
    ctx.strokeStyle = p.gold ? '#8a5a00' : '#2a6a2a'; ctx.lineWidth = 0.8; ctx.strokeRect(-6, -2.5, 12, 5);
    ctx.fillStyle = p.gold ? '#8a5a00' : '#2a6a2a'; ctx.font = 'bold 5px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.gold ? '★' : '$', 0, 0.3);
  },
  comet(p, a, s) {
    ctx.globalCompositeOperation = 'lighter';
    const r = s * (0.3 + 0.7 * a), g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, p.core); g.addColorStop(0.35, p.c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; circle(0, 0, r); ctx.fill();
  },
});

Object.assign(AURAS, {
  frost(front) {
    if (!front) {
      const g = ctx.createRadialGradient(4, -4, 8, 4, -4, 48); g.addColorStop(0, 'rgba(190,240,255,0.4)'); g.addColorStop(1, 'rgba(190,240,255,0)');
      ctx.fillStyle = g; circle(4, -4, 48); ctx.fill();
    }
    for (let i = 0; i < 6; i++) {
      const a = clock * 1.3 + i * Math.PI / 3;
      if ((Math.sin(a) > 0) !== front) continue;
      ctx.save(); ctx.translate(4 + Math.cos(a) * 40, -4 + Math.sin(a) * 12); ctx.rotate(a * 2);
      glow('#bff4ff', 8); ctx.fillStyle = grad2(0, -6, 0, 6, '#ffffff', '#7cc8f0'); polyPath([[0, -6], [2.5, 0], [0, 6], [-2.5, 0]]); ctx.fill();
      ctx.restore();
    }
  },
  runes(front, hat, fx) {
    if (front) return;
    const c = fx.c || hue(0, 62);
    ctx.translate(2, -4); glow(c, 10); ctx.strokeStyle = c; ctx.globalAlpha *= 0.75; ctx.lineWidth = 1.5;
    circle(0, 0, 40); ctx.stroke(); circle(0, 0, 33); ctx.stroke();
    ctx.save(); ctx.rotate(clock * 0.6); ctx.lineWidth = 1.2;
    for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); const k = i % 4; ctx.beginPath(); ctx.moveTo(-2, -38.5); ctx.lineTo(k < 2 ? 2 : -1, -35); ctx.lineTo(k % 2 ? -2 : 2, -34.5); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.rotate(-clock * 0.9);
    for (const off of [0, Math.PI]) {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) { const a = off - Math.PI / 2 + i * Math.PI * 2 / 3; i ? ctx.lineTo(Math.cos(a) * 30, Math.sin(a) * 30) : ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); }
      ctx.closePath(); ctx.stroke();
    }
    ctx.restore();
  },
  disco(front) {
    if (front) return;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const sw = Math.sin(clock * 1.6 + i * 1.3) * 40;
      ctx.fillStyle = hue(i * 72, 60, 0.2); ctx.beginPath(); ctx.moveTo(4, -75); ctx.lineTo(sw - 8, 40); ctx.lineTo(sw + 14, 40); ctx.closePath(); ctx.fill();
    }
    for (let i = 0; i < 10; i++) { const a = clock * 1.2 + i * 0.63, r = 30 + (i % 3) * 8; ctx.fillStyle = hue(i * 36, 70, 0.7); circle(4 + Math.cos(a) * r, -4 + Math.sin(a) * r * 0.6, 1.8); ctx.fill(); }
  },
  portal(front, hat, fx) {
    if (front) return;
    ctx.translate(-4, -4); ctx.scale(0.8, 1.1);
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 34); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.6, fx.c2); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; circle(0, 0, 34); ctx.fill();
    glow(fx.c, 14); ctx.strokeStyle = fx.c; ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const a = clock * 3 + i * Math.PI * 2 / 5; ctx.lineWidth = 3 - i * 0.3; ctx.beginPath(); ctx.arc(0, 0, 28 - i * 2.5, a, a + 1.6); ctx.stroke(); }
  },
});

// ---------- Register ----------
for (const h of EXTRA_HATS) { h.lux = true; HATS.push(h); HAT_BY_ID[h.id] = h; }
for (const w of EXTRA_WINGS) { w.lux = true; WINGS.push(w); WING_BY_ID[w.id] = w; }
for (const f of EXTRA_FX) { f.lux = true; FX.push(f); FX_BY_ID[f.id] = f; }
for (const list of [HATS, WINGS, FX]) list.sort((a, b) => a.price - b.price);
