'use strict';
// The overworld: Snout Island, shaped like a pig's face seen from the front.
// Ears = Mount Snoutmore, left cheek = Hamlet Farms, chin = Bacon Bay, right cheek = Pork-topia 2099,
// the snout is a plateau with two nostril ponds, and Hog Heaven floats in the sky.
// The island is for picking an AREA: tap one and the camera zooms in, then that area's levels
// appear as big cards (the area screen, see showArea in ui.js).

// Big tap regions, in island coordinates (checked in this order)
const AREA_HIT = {
  clouds: (x, y) => ((x - 470) / 130) ** 2 + ((y - 60) / 56) ** 2 < 1,
  mountain: (x, y) => y < 200 && x > 210 && x < 730,
  beach: (x, y) => ((x - 470) / 290) ** 2 + ((y - 524) / 100) ** 2 < 1,
  farm: (x, y) => ((x - 258) / 112) ** 2 + ((y - 296) / 130) ** 2 < 1,
  city: (x, y) => ((x - 682) / 112) ** 2 + ((y - 296) / 130) ** 2 < 1,
};
const AREA_FOCUS = { farm: [258, 300], beach: [470, 474], city: [682, 300], mountain: [470, 164], clouds: [470, 64] };
// camera: island point (x, y) is drawn at ((x - cx) * s + W/2, (y - cy) * s + 296)
const CAM_HOME = { cx: 470, cy: 282, s: 1.1 };
const map = { sel: 0, hover: -1, k: 0, goal: 0, area: null, toast: null, shake: 0 };
const homeArea = () => (LEVEL_BY_ID[save.mapAt] || ALL_LEVELS[0]).area;

function mapCam() {
  const e = map.k * map.k * (3 - 2 * map.k), a = map.area;
  if (!a || e === 0) return CAM_HOME;
  const [fx, fy] = AREA_FOCUS[a.id];
  return { cx: CAM_HOME.cx + (fx - CAM_HOME.cx) * e, cy: CAM_HOME.cy + (fy - CAM_HOME.cy) * e, s: CAM_HOME.s + (2.3 - CAM_HOME.s) * e };
}
function toIsland(sx, sy) { const c = mapCam(); return [(sx - W / 2) / c.s + c.cx, (sy - 296) / c.s + c.cy]; }
function areaAt(x, y) { return AREAS.findIndex(a => AREA_HIT[a.id] && AREA_HIT[a.id](x, y)); }

// Show the island. Coming back from an area, the camera zooms back out from it.
function showMap() {
  persist(); hideAll(); state = 'map';
  if (map.goal !== 1) map.k = 0;
  map.goal = 0;
  map.sel = AREAS.indexOf(homeArea()); map.toast = null;
  $('map').classList.remove('hidden');
  updateMapUI();
}
function enterArea(i) {
  const a = AREAS[i];
  if (!a || map.goal === 1) return;
  map.sel = i;
  if (!areaOpen(a)) { map.toast = { a, text: lockText(a), t: 2 }; map.shake = 0.4; sfx.nope(); return; }
  map.area = a; map.goal = 1; map.toast = null;
  oinkLite(0);
}
function mapTap(sx, sy) {
  if (map.goal === 1) return;
  const [x, y] = toIsland(sx, sy), i = areaAt(x, y);
  if (i >= 0) enterArea(i);
}
function mapHover(sx, sy) { const [x, y] = toIsland(sx, sy); map.hover = map.goal === 1 ? -1 : areaAt(x, y); }
function mapStep(dir) { if (map.goal === 1) return; map.sel = (map.sel + dir + AREAS.length) % AREAS.length; map.toast = null; }
function mapPlay() { enterArea(map.sel); }
function updateMap(dt) {
  const was = map.k;
  map.k = clamp(map.k + (map.goal ? dt : -dt) / 0.45, 0, 1);
  if (map.goal === 1 && map.k === 1 && was < 1) showArea(map.area);
  if (map.goal === 0 && map.k === 0) map.area = null;
  if (map.toast && (map.toast.t -= dt) <= 0) map.toast = null;
  if (map.shake > 0) map.shake = Math.max(0, map.shake - dt);
}
function lockText(a) {
  const l = areaLock(a);
  if (!l) return '';
  if (l.soon) return 'Coming soon!';
  const more = l.need - l.have, eggs = `${more} more golden egg${more === 1 ? '' : 's'} from ${l.prev.name}`;
  return l.clear ? (more ? `Clear ${l.prev.name} and find ${eggs}` : `Clear ${l.prev.name} first`) : `Find ${eggs}`;
}
// The second line of an area's label, as text and golden-egg icons (EGG): your eggs there if it's open,
// or a lock, an egg and how many eggs it needs (with your progress) if it isn't
const EGG = { egg: true }, EGG_W = 13;
function labelParts(a, lock) {
  if (!lock) return [`${a.levels.length} levels  •  `, EGG, ` ${areaEggs(a)}/${a.levels.length * 3}`];
  const need = eggsToOpen(a);
  if (lock.soon) return need ? ['Coming soon  •  🔒 ', EGG, ` ${need}`] : ['Coming soon'];
  return ['🔒 ', EGG, ` ${lock.have}/${lock.need}`, ...(lock.clear ? [`  •  Clear ${lock.prev.name}`] : [])];
}
const partsWidth = parts => parts.reduce((w, p) => w + (p === EGG ? EGG_W : ctx.measureText(p).width), 0);
function drawParts(parts, x, y, col) {
  for (const p of parts) {
    if (p === EGG) { drawEgg(x + EGG_W / 2, y + 1, 0.42); x += EGG_W; continue; }
    text(p, x, y, 13, col, 'left', 'rgba(255,255,255,0)'); x += ctx.measureText(p).width;
  }
}
function updateMapUI() {
  $('mapCoins').textContent = save.coins;
  $('mapEggs').textContent = `${totalEggs()}/${TOTAL_EGGS}`;
}

// ---------- Drawing ----------
const EAR_L = [[226, 176], [244, 92], [290, 48], [334, 84], [376, 132]];
const EAR_R = EAR_L.map(([x, y]) => [940 - x, y]).reverse();
function earPath(e) { ctx.moveTo(e[0][0], e[0][1]); ctx.quadraticCurveTo(e[1][0], e[1][1], e[2][0], e[2][1]); ctx.quadraticCurveTo(e[3][0], e[3][1], e[4][0], e[4][1]); ctx.closePath(); }
function islandPath() {
  ctx.beginPath();
  ctx.ellipse(470, 305, 290, 192, 0, 0, Math.PI * 2);
  earPath(EAR_L); earPath(EAR_R);
}
const REGIONS = {
  farm: () => { ctx.beginPath(); ctx.ellipse(258, 296, 104, 122, -0.1, 0, Math.PI * 2); },
  beach: () => { ctx.beginPath(); ctx.ellipse(470, 524, 285, 96, 0, 0, Math.PI * 2); },
  city: () => { ctx.beginPath(); ctx.ellipse(682, 296, 104, 122, 0.1, 0, Math.PI * 2); }, // mirror of farm
  mountain: () => { ctx.beginPath(); earPath(EAR_L); earPath(EAR_R); ctx.moveTo(330, 210); ctx.lineTo(400, 120); ctx.lineTo(470, 104); ctx.lineTo(540, 120); ctx.lineTo(610, 210); ctx.closePath(); },
  clouds: () => { ctx.beginPath(); ctx.ellipse(470, 58, 124, 50, 0, 0, Math.PI * 2); },
};
const WAVES = Array.from({ length: 60 }, (_, i) => ({ x: (i * 211) % 1100 - 70, y: (i * 97) % 640 - 50, p: i * 1.7 }));
const inIsland = (x, y) => ((x - 470) / 312) ** 2 + ((y - 305) / 214) ** 2 < 1 || (y < 190 && ((x > 210 && x < 390) || (x > 550 && x < 730)));

function drawWaves() {
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (const w of WAVES) {
    const x = mod(w.x + 70 + clock * 6, 1100) - 70, y = w.y + Math.sin(clock * 1.3 + w.p) * 3;
    if (inIsland(x, y)) continue;
    ctx.beginPath(); ctx.arc(x - 6, y, 6, Math.PI * 1.15, Math.PI * 1.85); ctx.arc(x + 6, y, 6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  }
}
// Palm tree standing at (x, y). The sprite is about 36*s tall; `kind` picks a softer copy for scenery.
function drawPalm(x, y, s = 1, kind = 'palm') {
  const im = spr(kind);
  if (im) { const h = 36 * s, w = h * im.width / im.height; ctx.drawImage(im, x - w * 0.46, y - h, w, h); return; }
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-3, -12, 3, -22); ctx.stroke();
  ctx.fillStyle = '#3f9a3a';
  for (const a of [-2.6, -1.9, -1.2, -0.5, 0.2]) { ctx.save(); ctx.translate(3, -22); ctx.rotate(a); ellipse(9, 0, 10, 3.2); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
function drawUmbrella(x, y, col) {
  ctx.strokeStyle = '#7b4a22'; ctx.lineWidth = 2; line(x, y, x, y - 14);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - 14, 11, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.arc(x, y - 14, 11, Math.PI * 1.33, Math.PI * 1.66); ctx.fill();
}
function drawIsland() {
  // shallows, foam and sand rim
  ctx.save(); ctx.lineJoin = 'round';
  islandPath();
  ctx.strokeStyle = 'rgba(160,235,250,0.55)'; ctx.lineWidth = 50; ctx.stroke();
  // 2.5D: cliffs under the island give it some thickness
  ctx.save(); ctx.translate(0, 14); islandPath(); ctx.fillStyle = '#9c6b3c'; ctx.fill(); ctx.strokeStyle = '#7d522c'; ctx.lineWidth = 20; ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(0, 7); islandPath(); ctx.strokeStyle = '#c08a52'; ctx.lineWidth = 22; ctx.stroke(); ctx.restore();
  islandPath();
  ctx.strokeStyle = '#f3dc9a'; ctx.lineWidth = 22; ctx.stroke();
  ctx.fillStyle = '#7cc75e'; ctx.fill();
  ctx.clip();

  // Hamlet Farms: patchwork fields on the left cheek
  const fields = ['#8fd16a', '#b5dc62', '#d9e07e', '#78c45a', '#e7d47c', '#a3d36a'];
  ctx.save(); REGIONS.farm(); ctx.fillStyle = '#9ad46c'; ctx.fill(); ctx.clip();
  ctx.translate(258, 296); ctx.rotate(-0.22);
  for (let i = 0; i < 16; i++) {
    const fx = -150 + (i % 4) * 66, fy = -130 + Math.floor(i / 4) * 66;
    ctx.fillStyle = fields[(i * 5) % fields.length]; ctx.fillRect(fx, fy, 62, 62);
    ctx.strokeStyle = 'rgba(80,120,40,0.25)'; ctx.lineWidth = 2;
    for (let k = 8; k < 62; k += 10) line(fx + 4, fy + k, fx + 58, fy + k);
  }
  ctx.restore();
  ctx.save(); REGIONS.farm(); ctx.strokeStyle = 'rgba(90,140,50,0.5)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(304, 346); ctx.scale(0.3, 0.3); drawBarn(-45, 0, THEMES[0]); ctx.restore();

  // Bacon Bay: sandy chin
  REGIONS.beach(); ctx.fillStyle = '#f2d38a'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ellipse(470, 438, 230, 9); ctx.fill();
  drawPalm(330, 458, 0.85); drawPalm(372, 446); drawPalm(568, 446); drawPalm(610, 458, 0.85);
  drawUmbrella(404, 496, '#ff6f9c'); drawUmbrella(540, 498, '#5ab4ff'); drawUmbrella(470, 446, '#ffd84a');

  // Pork-topia 2099: neon city on the right cheek
  ctx.save(); REGIONS.city(); ctx.fillStyle = '#231a46'; ctx.fill(); ctx.clip();
  ctx.strokeStyle = 'rgba(80,230,255,0.35)'; ctx.lineWidth = 1;
  for (let x = 570; x < 800; x += 14) line(x, 168, x, 424);
  for (let y = 168; y < 424; y += 14) line(570, y, 800, y);
  const towers = [[616, 276, 16, 46], [638, 236, 14, 86], [660, 266, 18, 56], [684, 216, 16, 110], [708, 252, 14, 70], [730, 276, 16, 46], [752, 298, 14, 30],
    [630, 350, 18, 40], [660, 366, 16, 34], [690, 352, 18, 50], [722, 360, 16, 36], [662, 194, 14, 30], [706, 188, 14, 34]];
  for (const [tx, ty, tw, th] of towers) {
    ctx.fillStyle = '#120c2c'; ctx.fillRect(tx, ty, tw, th);
    ctx.strokeStyle = tx % 3 ? '#ff4fd8' : '#4ff3ff'; ctx.lineWidth = 1.5; ctx.strokeRect(tx, ty, tw, th);
    ctx.fillStyle = 'rgba(255,240,120,0.85)';
    for (let wy = ty + 5; wy < ty + th - 4; wy += 8) for (let wx = tx + 3; wx < tx + tw - 3; wx += 6) if ((wx * 7 + wy * 3) % 5 > 1) ctx.fillRect(wx, wy, 2, 3);
  }
  ctx.restore();
  ctx.save(); REGIONS.city(); ctx.strokeStyle = 'rgba(255,79,216,0.6)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

  // Mount Snoutmore: the ears, plus a ridge across the forehead
  const peaks = [[400, 206, 46, 136], [470, 210, 52, 122], [540, 206, 46, 136]];
  for (const [px, py, pw, top] of peaks) {
    ctx.fillStyle = '#93a0b4'; ctx.beginPath(); ctx.moveTo(px - pw, py); ctx.lineTo(px, top); ctx.lineTo(px + pw, py); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(px - pw * 0.35, top + 25); ctx.lineTo(px, top); ctx.lineTo(px + pw * 0.35, top + 25); ctx.lineTo(px + 8, top + 20); ctx.lineTo(px, top + 27); ctx.lineTo(px - 8, top + 20); ctx.closePath(); ctx.fill();
  }
  for (const e of [EAR_L, EAR_R]) {
    ctx.beginPath(); earPath(e); ctx.fillStyle = '#93a0b4'; ctx.fill();
    ctx.save(); ctx.clip();
    const tx = e[2][0], s = tx < 470 ? 1 : -1;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(tx - 46 * s, 112); ctx.lineTo(tx, 36); ctx.lineTo(tx + 52 * s, 100);
    ctx.lineTo(tx + 30 * s, 104); ctx.lineTo(tx + 14 * s, 90); ctx.lineTo(tx - 4 * s, 106); ctx.lineTo(tx - 22 * s, 96); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,170,200,0.35)'; ctx.beginPath(); ctx.moveTo(tx - 16 * s, 150); ctx.lineTo(tx + 2 * s, 92); ctx.lineTo(tx + 28 * s, 140); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // eyes = two round groves of trees
  for (const ex of [384, 556]) {
    ctx.fillStyle = '#2f7d3a'; circle(ex, 246, 24); ctx.fill();
    ctx.fillStyle = '#3f9a46'; for (const [dx, dy] of [[-10, -8], [9, -9], [-12, 8], [11, 7], [0, 0]]) { circle(ex + dx, 246 + dy, 9); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; circle(ex - 9, 236, 5); ctx.fill();
  }
  // the snout plateau with two nostril ponds
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ellipse(470, 368, 92, 62); ctx.fill();
  ctx.fillStyle = '#ffb3c8'; ctx.strokeStyle = '#d96b8e'; ctx.lineWidth = 4; ellipse(470, 360, 90, 60); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ellipse(452, 330, 46, 12); ctx.fill();
  for (const nx of [440, 500]) {
    ctx.fillStyle = '#3f9fd6'; ctx.strokeStyle = '#a8456a'; ctx.lineWidth = 3; ellipse(nx, 364, 15, 22); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ellipse(nx - 4, 356 + Math.sin(clock * 2 + nx) * 2, 5, 3); ctx.fill();
  }
  ctx.restore();

  // Hog Heaven: cloud islands floating between the ears (with shadows below), a golden gate on top
  const clouds = [[364, 70, 0.95], [440, 44, 1.2], [528, 70, 0.95], [404, 86, 0.8], [490, 88, 0.8]];
  ctx.fillStyle = 'rgba(10,60,110,0.16)';
  for (const [cx, cy, s] of clouds) drawCloud(cx + 10, cy + 40, s);
  for (const [cx, cy, s] of clouds) { ctx.fillStyle = '#ffffff'; drawCloud(cx, cy + Math.sin(clock + cx) * 2, s); }
  ctx.fillStyle = '#ffd84a'; ctx.fillRect(458, 14, 5, 26); ctx.fillRect(478, 14, 5, 26);
  ctx.strokeStyle = '#ffd84a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(470.5, 16, 10, Math.PI, 0); ctx.stroke();
}
// Areas that aren't open yet sit under a fog
function drawFog() {
  for (const a of AREAS) {
    if (areaOpen(a) || !REGIONS[a.id]) continue;
    ctx.save();
    if (a.id !== 'clouds') { islandPath(); ctx.clip(); }
    REGIONS[a.id](); ctx.fillStyle = 'rgba(48,36,84,0.42)'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    const [lx, ly] = AREA_FOCUS[a.id];
    for (let k = 0; k < 4; k++) drawCloud(lx - 70 + k * 34 + Math.sin(clock * 0.6 + k) * 6, ly + 10 + (k % 2) * 16, 0.55);
    ctx.restore();
  }
}
function drawAreaLabels() {
  AREAS.forEach((a, i) => {
    const [x0, y] = AREA_FOCUS[a.id], lock = areaLock(a), hot = i === map.hover || i === map.sel;
    const toast = map.toast && map.toast.a === a;
    const x = x0 + (toast ? Math.sin(map.shake * 60) * map.shake * 14 : 0), s = hot ? 1.08 + 0.03 * Math.sin(clock * 5) : 1;
    const sub = toast ? [map.toast.text] : labelParts(a, lock);
    const title = `${a.icon || ''} ${a.name}`.trim();
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.font = `13px ${FONT}`; const sw = partsWidth(sub);
    ctx.font = `22px ${FONT}`; const w = Math.max(ctx.measureText(title).width, sw) + 30;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; rrect(-w / 2 + 2, -14, w, 46, 14); ctx.fill();
    ctx.fillStyle = lock ? 'rgba(238,232,245,0.95)' : 'rgba(255,255,255,0.97)'; ctx.strokeStyle = hot ? '#ff6f9c' : a.color; ctx.lineWidth = hot ? 4 : 3;
    rrect(-w / 2, -18, w, 46, 14); ctx.fill(); ctx.stroke();
    text(title, 0, -3, 22, lock ? '#8d7a95' : '#5a2340', 'center', 'rgba(255,255,255,0)');
    drawParts(sub, -sw / 2, 17, lock ? '#a8456a' : '#c0507a');
    ctx.restore();
  });
}
// Outline the area under the cursor / keyboard selection
function drawAreaGlow() {
  const a = AREAS[map.hover >= 0 ? map.hover : map.sel];
  if (!a || map.goal === 1 || !REGIONS[a.id]) return;
  ctx.save();
  if (a.id !== 'clouds') { islandPath(); ctx.clip(); }
  REGIONS[a.id]();
  ctx.fillStyle = `rgba(255,255,255,${0.1 + 0.06 * Math.sin(clock * 4)})`; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -clock * 30; ctx.stroke();
  ctx.restore();
}
function drawOverworld() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#46c3ee'); g.addColorStop(1, '#1d86cf');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const c = mapCam();
  ctx.save();
  ctx.translate(W / 2, 296); ctx.scale(c.s, c.s); ctx.translate(-c.cx, -c.cy);
  drawWaves();
  drawIsland();
  drawFog();
  drawAreaGlow();
  drawAreaLabels();
  // the pig hovers over the area you're up to
  const [hx, hy] = AREA_FOCUS[homeArea().id], bob = Math.sin(clock * 3) * 4;
  drawPig(hx + 8, hy - 52 + bob, Math.sin(clock * 1.5) * 0.08, clock * 14, 0.7, true, 1, myLook());
  ctx.restore();
  // dim while zooming into an area (its level cards appear on top)
  if (map.k > 0) { ctx.fillStyle = `rgba(20,10,40,${0.35 * map.k})`; ctx.fillRect(0, 0, W, H); }
}
