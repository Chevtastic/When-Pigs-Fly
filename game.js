/* When Pigs Fly — a side-scrolling dodge game.
   Hold SPACE (or touch) to fly up, let go to fall. Hold SHIFT (or ⚡) to go faster.
   Reach the mud pile at the end of each level. Grab golden eggs and coins; spend coins on hats. */
(() => {
'use strict';

// ---------- Setup ----------
const canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
const mainCtx = ctx;
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
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const bits = n => { let c = 0; while (n) { c += n & 1; n >>= 1; } return c; };

// ---------- Themes ----------
const THEMES = [
  { skyTop: '#6cc4ff', skyBot: '#d9f3ff', far: '#9bd38a', near: '#6fbf5c', grass: '#57b847', dirt: '#8a5a2e', dirt2: '#74491f', cloud: 'rgba(255,255,255,0.9)', sun: '#fff3a0', sunY: 90, fence: '#a0703f', barn: '#c0392b' },
  { skyTop: '#ff7a59', skyBot: '#ffd39a', far: '#c98a6a', near: '#9a6a4a', grass: '#7aa33a', dirt: '#7a4a2a', dirt2: '#633b20', cloud: 'rgba(255,225,200,0.85)', sun: '#ffe08a', sunY: 300, fence: '#6e4526', barn: '#a8322a' },
  { skyTop: '#070b2a', skyBot: '#2a2d6e', far: '#1d2550', near: '#16203f', grass: '#2c5a3a', dirt: '#3a2a1e', dirt2: '#2c1f16', cloud: 'rgba(160,170,220,0.22)', sun: '#f4f1d0', sunY: 90, night: true, fence: '#3b2a20', barn: '#5a1f1c' },
  { skyTop: '#3b4658', skyBot: '#8c99aa', far: '#5c7a5a', near: '#46664a', grass: '#4f8a45', dirt: '#5e4128', dirt2: '#4b331f', cloud: 'rgba(78,88,104,0.9)', noSun: true, fence: '#5a4030', barn: '#7a2a26', weather: 'rain' },
  { skyTop: '#93bfe6', skyBot: '#eef6ff', far: '#d6e4f0', near: '#bcd2e4', grass: '#f4f8fc', dirt: '#8f7a6a', dirt2: '#7a6656', cloud: 'rgba(255,255,255,0.95)', sun: '#fffbe0', sunY: 110, fence: '#8a6a50', barn: '#b03a30', weather: 'snow' },
  { skyTop: '#ff8f4a', skyBot: '#ffe3a8', far: '#c8643a', near: '#a54a2a', grass: '#c9a25a', dirt: '#9a5a32', dirt2: '#7e4626', cloud: 'rgba(255,235,210,0.8)', sun: '#fff1b0', sunY: 220, fence: '#6e4526', barn: '#8a3a22', mesa: true, cactus: true },
];
const STARS = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * 330, r: Math.random() * 1.6 + 0.4, p: Math.random() * 6 }));
const RAIN = Array.from({ length: 110 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: rand(700, 1000), l: rand(10, 20) }));
const SNOW = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: rand(30, 80), r: rand(1.5, 3.5), p: Math.random() * 6 }));

// ---------- Level building ----------
function builder(speed) {
  const o = [], items = [];
  let eggs = 0;
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
    // meat cleaver swinging on a chain from the sky: pivot x, chain length, swing angle (rad), period (s)
    cleaver(x, len, amp = 0.8, per = 2, ph = 0) { o.push({ t: 'cleaver', x, w: 0, len, amp, per, ph, reach: len * Math.sin(amp) + 40 }); return b; },
    coins(x, y, n = 5, dy = 0, gap = 40) { for (let i = 0; i < n; i++) items.push({ t: 'coin', x: x + i * gap, y: y + i * dy }); return b; },
    arc(x, y, n, h, gap = 40) { for (let i = 0; i < n; i++) items.push({ t: 'coin', x: x + i * gap, y: y - Math.sin(Math.PI * i / (n - 1)) * h }); return b; },
    egg(x, y) { items.push({ t: 'egg', x, y, id: eggs++ }); return b; },
    objs: o, items,
  };
  return b;
}

const LEVELS = [
  {
    name: 'Muddy Meadow', theme: 0, speed: 320, end: 9600,
    build() {
      const b = builder(this.speed);
      b.coins(420, 300, 6)
       .spikes(900, 3, 'floor', 45).arc(860, 380, 5, 50)
       .spikes(1400, 3, 'ceil', 140).coins(1300, 250, 2).egg(1460, 180)
       .tower(1850, 80, 170).arc(1790, 250, 5, 60)
       .pan(2350, 260).coins(2150, 390, 6)
       .farmer(2800, 160, 230, 2.2).arc(2690, 180, 5, 40)
       .spikes(3250, 2, 'floor', 60).spikes(3250, 2, 'ceil', 150).coins(3170, 280, 5)
       .tower(3700, 80, 230).tower(4050, 80, 230, 'ceil').egg(3740, 196).coins(3880, 300, 3, 15).coins(4040, 350, 3)
       .pan(4500, 380).pan(4800, 160).coins(4500, 270, 7)
       .farmer(5200, 160, 240, 2).arc(5080, 170, 6, 30)
       .spikes(5600, 6, 'floor', 50).spikes(5680, 4, 'ceil', 130).coins(5540, 290, 3).egg(5760, 388)
       .tower(6200, 80, 260, 'ceil').tower(6550, 80, 250).coins(6170, 340, 4).coins(6500, 170, 4)
       .pan(7000, 300, 60).arc(6880, 420, 6, 20)
       .farmer(7400, 160, 240, 1.8).farmer(7750, 160, 240, 1.8, Math.PI).coins(7300, 150, 14)
       .spikes(8150, 3, 'floor', 60).spikes(8150, 3, 'ceil', 160).coins(8110, 290, 5)
       .pan(8550, 200).pan(8700, 360).coins(8900, 300, 9);
      return b;
    },
  },
  {
    name: 'Barnyard Bash', theme: 1, speed: 340, end: 11600,
    build() {
      const b = builder(this.speed);
      b.coins(400, 260, 6)
       .spikes(800, 4, 'floor', 50).arc(770, 380, 6, 50)
       .tower(1200, 80, 220, 'ceil').tower(1500, 80, 220).coins(1180, 330, 3).coins(1480, 200, 3)
       .pan(1950, 240, 50).coins(1840, 420, 6)
       .farmer(2350, 170, 270, 1.6).arc(2240, 150, 6, 20)
       .spikes(2750, 8, 'floor', 60).spikes(2830, 6, 'ceil', 170).coins(2700, 300, 4).egg(2960, 196)
       .tower(3450, 120, 270).tower(3750, 120, 270, 'ceil').coins(3420, 150, 5).coins(3720, 360, 5)
       .pan(4200, 150).pan(4200, 400).coins(4080, 275, 6)
       .farmer(4600, 170, 270, 1.5).coins(4500, 150, 4)
       .spikes(4950, 3, 'ceil', 160).coins(4930, 300, 4)
       .farmer(5250, 170, 270, 1.5, 1.5).coins(5160, 150, 4)
       .tower(5650, 160, 180).spikes(5690, 3, 'ceil', 150).coins(5560, 230, 2).egg(5730, 222)
       .pan(6150, 300, 80, 240).coins(6040, 140, 5)
       .tower(6550, 80, 290, 'ceil').tower(6850, 80, 290).tower(7150, 80, 290, 'ceil').coins(6540, 380, 3).coins(6840, 130, 3).coins(7140, 380, 3)
       .pan(7650, 200).pan(7850, 350).pan(8050, 200).coins(7600, 100, 5)
       .farmer(8450, 170, 270, 1.3).farmer(8750, 170, 270, 1.3, 2).arc(8340, 150, 12, 20)
       .spikes(9150, 10, 'floor', 70).spikes(9250, 6, 'ceil', 180).coins(9140, 290, 5).egg(9440, 372)
       .pan(9950, 280, 70).coins(9880, 120, 5)
       .tower(10400, 80, 240).tower(10700, 80, 240, 'ceil').coins(10380, 180, 3).coins(10680, 330, 3).coins(10900, 300, 10);
      return b;
    },
  },
  {
    name: 'Midnight Pork Panic', theme: 2, speed: 350, end: 13400,
    build() {
      const b = builder(this.speed);
      b.coins(400, 280, 5)
       .spikes(800, 5, 'floor', 60).spikes(880, 3, 'ceil', 180).coins(780, 300, 6)
       .tower(1400, 80, 270, 'ceil').tower(1700, 80, 270).tower(2000, 80, 270, 'ceil').coins(1390, 380, 3).coins(1690, 140, 3).coins(1990, 380, 3)
       .pan(2450, 150, 60, 240).pan(2650, 370, 60, 240).coins(2380, 270, 8)
       .farmer(3050, 180, 300, 1.2).farmer(3300, 180, 300, 1.2, 1.3).farmer(3550, 180, 300, 1.2, 2.6).coins(2980, 110, 16)
       .spikes(3950, 12, 'floor', 80).spikes(4030, 10, 'ceil', 200).coins(3930, 300, 4).egg(4230, 232).coins(4320, 300, 3)
       .pan(4750, 260, 90, 240).coins(4640, 430, 5)
       .tower(5150, 120, 290).tower(5450, 120, 290, 'ceil').coins(5150, 130, 3).coins(5450, 370, 3)
       .hay(5850, 200, 120).spikes(5850, 5, 'floor', 40, 120).spikes(5890, 4, 'ceil', 170).coins(5780, 240, 2).egg(5970, 240)
       .farmer(6400, 180, 300, 1.1)
       .pan(6680, 120, 0, 220).pan(6680, 410, 0, 220).coins(6580, 265, 5)
       .farmer(7000, 180, 300, 1.1, 1.6)
       .tower(7400, 80, 290, 'ceil').tower(7700, 80, 290).tower(8000, 80, 290, 'ceil').tower(8300, 80, 290)
       .coins(7390, 380, 3).coins(7690, 140, 3).coins(7990, 380, 3).coins(8290, 140, 3)
       .pan(8750, 250, 110, 240)
       .spikes(9100, 6, 'floor', 90).coins(9090, 300, 6)
       .farmer(9500, 190, 300, 1.0).farmer(9750, 190, 300, 1.0, Math.PI).coins(9430, 110, 10)
       .spikes(10150, 14, 'floor', 70).spikes(10230, 12, 'ceil', 190).coins(10140, 295, 14)
       .pan(10950, 180, 0, 220).pan(11100, 330, 0, 220).pan(11250, 180, 0, 220).pan(11400, 330, 0, 220)
       .tower(11850, 80, 280).tower(12150, 80, 280, 'ceil').egg(11890, 150).coins(12140, 380, 3)
       .farmer(12500, 180, 290, 1.0).coins(12400, 120, 4)
       .spikes(12900, 4, 'floor', 60).spikes(12900, 4, 'ceil', 200).coins(12880, 305, 4).coins(13100, 300, 6);
      return b;
    },
  },
  {
    name: 'Hogwash Downpour', theme: 3, speed: 355, end: 12600,
    build() {
      const b = builder(this.speed);
      b.coins(320, 300, 6)
       .cleaver(900, 210, 0.7, 2.4).coins(800, 380, 6)
       .spikes(1320, 4, 'floor', 50).cleaver(1400, 190, 0.8, 2.2, 1).coins(1280, 350, 6)
       .tower(1800, 80, 250).tower(2100, 80, 250, 'ceil').coins(1780, 170, 3).coins(2080, 350, 3)
       .pan(2500, 200, 60).pan(2700, 380).coins(2450, 100, 6)
       .spikes(2920, 4, 'floor', 40).cleaver(3000, 290, 0.9, 2.0).egg(3000, 392)
       .farmer(3500, 170, 280, 1.4).farmer(3800, 170, 280, 1.4, 1.5).coins(3400, 130, 12)
       .spikes(4200, 6, 'floor', 60).spikes(4200, 6, 'ceil', 150).coins(4180, 280, 7)
       .cleaver(4800, 230, 1.0, 1.8).cleaver(5150, 230, 1.0, 1.8, Math.PI).coins(4700, 380, 14)
       .hay(5600, 160, 150).spikes(5600, 4, 'ceil', 120).coins(5560, 230, 2).egg(5680, 160).coins(5800, 230, 2)
       .tower(6200, 80, 270, 'ceil').tower(6500, 80, 270).tower(6800, 80, 270, 'ceil').coins(6190, 380, 3).coins(6490, 140, 3).coins(6790, 380, 3)
       .pan(7300, 150, 0, 230).pan(7300, 400, 0, 230).pan(7550, 275, 80, 230).coins(7200, 275, 4)
       .spikes(7900, 6, 'floor', 50).cleaver(8000, 250, 0.8, 1.5).coins(7880, 370, 6)
       .farmer(8500, 180, 300, 1.2).farmer(8750, 180, 300, 1.2, 1.2).coins(8420, 110, 10)
       .spikes(9100, 10, 'floor', 80).spikes(9150, 8, 'ceil', 180).coins(9100, 285, 10)
       .cleaver(9900, 270, 0.9, 1.7).cleaver(10200, 200, 0.9, 1.7, 1.5).coins(9800, 390, 6).coins(10150, 330, 4)
       .tower(10600, 80, 300).egg(10640, 128).spikes(10900, 4, 'ceil', 220).coins(10880, 320, 5)
       .pan(11300, 200).pan(11450, 360).coins(11250, 100, 5)
       .spikes(11800, 3, 'floor', 60).spikes(11800, 3, 'ceil', 180).coins(11760, 290, 5).coins(12000, 300, 8);
      return b;
    },
  },
  {
    name: 'Frost-Bitten Bacon', theme: 4, speed: 365, end: 13400,
    build() {
      const b = builder(this.speed);
      b.coins(320, 280, 6)
       .spikes(700, 4, 'floor', 60).spikes(760, 3, 'ceil', 170).coins(680, 300, 5)
       .cleaver(1200, 240, 0.9, 1.9).cleaver(1450, 240, 0.9, 1.9, Math.PI).coins(1100, 400, 12)
       .tower(1900, 100, 280).tower(2200, 100, 280, 'ceil').coins(1890, 140, 3).coins(2190, 370, 3)
       .farmer(2650, 180, 290, 1.2).farmer(2900, 180, 290, 1.2, 1.4).coins(2560, 120, 11)
       .pan(3300, 160).pan(3450, 390).pan(3600, 270, 90).coins(3250, 280, 4)
       .hay(4000, 240, 110).spikes(4000, 6, 'floor', 40, 110).spikes(4040, 5, 'ceil', 190).coins(3940, 255, 2).egg(4120, 255).coins(4200, 255, 2)
       .spikes(4600, 6, 'floor', 45).cleaver(4700, 280, 1.0, 1.6).coins(4580, 375, 6)
       .tower(5100, 80, 290, 'ceil').tower(5400, 80, 290).tower(5700, 80, 290, 'ceil').coins(5090, 380, 3).coins(5390, 130, 3).coins(5690, 380, 3)
       .farmer(6100, 180, 300, 1.1).cleaver(6400, 200, 0.8, 1.5).farmer(6700, 180, 300, 1.1, 2).coins(6020, 110, 4).coins(6300, 330, 4).coins(6620, 110, 4)
       .spikes(7200, 15, 'floor', 70).spikes(7280, 12, 'ceil', 190).coins(7190, 295, 6).egg(7500, 376).coins(7600, 295, 5)
       .pan(8200, 150).pan(8200, 400).pan(8400, 275).coins(8100, 275, 4)
       .spikes(8820, 19, 'floor', 40).cleaver(8900, 250, 0.9, 1.6).cleaver(9200, 250, 0.9, 1.6, 2.1).cleaver(9500, 250, 0.9, 1.6, 4.2)
       .coins(8800, 375, 4).egg(9200, 240).coins(9300, 375, 6)
       .tower(10000, 80, 300).tower(10300, 80, 300, 'ceil').coins(9990, 130, 3).coins(10290, 390, 3)
       .farmer(10800, 180, 300, 1.0).farmer(11050, 180, 300, 1.0, 1.2).farmer(11300, 180, 300, 1.0, 2.4).coins(10720, 110, 17)
       .spikes(11800, 4, 'floor', 70).spikes(11800, 4, 'ceil', 200).coins(11780, 300, 5)
       .pan(12300, 280, 90).coins(12500, 300, 8);
      return b;
    },
  },
  {
    name: 'The Grand Hamyon', theme: 5, speed: 375, end: 14900,
    build() {
      const b = builder(this.speed);
      b.coins(320, 280, 6)
       .spikes(700, 5, 'floor', 70).spikes(780, 3, 'ceil', 190).coins(680, 295, 6)
       .spikes(1120, 5, 'floor', 40).cleaver(1200, 260, 1.0, 1.6).coins(1100, 380, 6)
       .tower(1650, 80, 290, 'ceil').tower(1950, 80, 290).tower(2250, 80, 290, 'ceil').coins(1640, 380, 3).coins(1940, 130, 3).coins(2240, 380, 3)
       .pan(2700, 150, 50, 260).pan(2700, 400, 0, 260).pan(2900, 275, 100, 260)
       .farmer(3300, 180, 300, 1.0).farmer(3500, 180, 300, 1.0, 1.1).farmer(3700, 180, 300, 1.0, 2.2).coins(3220, 105, 14)
       .hay(4100, 280, 100).spikes(4100, 7, 'floor', 40, 100).spikes(4100, 7, 'ceil', 180).coins(4040, 255, 2).egg(4240, 255).coins(4320, 255, 2)
       .cleaver(4800, 220, 1.0, 1.4).cleaver(5050, 290, 1.0, 1.4, 2).cleaver(5300, 220, 1.0, 1.4, 4).coins(4700, 390, 4).coins(5150, 400, 3)
       .tower(5800, 120, 300).tower(6100, 120, 300, 'ceil').coins(5800, 120, 3).coins(6100, 390, 3)
       .spikes(6600, 16, 'floor', 80).spikes(6680, 12, 'ceil', 200).coins(6590, 295, 16)
       .pan(7600, 200, 0, 240).pan(7750, 350, 0, 240).pan(7900, 200, 0, 240).pan(8050, 350, 0, 240)
       .farmer(8350, 190, 300, 1.1).farmer(8750, 190, 300, 1.1, 1.8).coins(8270, 105, 3).egg(8545, 320).coins(8700, 105, 3)
       .spikes(9000, 8, 'floor', 50).cleaver(9100, 310, 0.8, 1.5).coins(8980, 390, 8)
       .tower(9700, 80, 300, 'ceil').tower(10000, 80, 300).tower(10300, 80, 300, 'ceil').tower(10600, 80, 300)
       .coins(9690, 390, 3).coins(9990, 130, 3).coins(10290, 390, 3).coins(10590, 130, 3)
       .spikes(11000, 6, 'floor', 90).coins(10980, 290, 6)
       .farmer(11400, 190, 300, 0.9).cleaver(11700, 230, 1.0, 1.3).coins(11320, 105, 4).coins(11600, 380, 6)
       .spikes(12100, 14, 'floor', 70).spikes(12180, 12, 'ceil', 200).coins(12090, 300, 4).egg(12400, 232).coins(12500, 300, 5)
       .pan(12900, 180, 0, 220).pan(13050, 340, 0, 220).pan(13200, 180, 0, 220).pan(13350, 340, 0, 220)
       .tower(13700, 80, 290).tower(14000, 80, 290, 'ceil').coins(13690, 140, 3).coins(13990, 380, 3)
       .spikes(14300, 3, 'floor', 60).spikes(14300, 3, 'ceil', 200).coins(14260, 300, 5).coins(14450, 300, 8);
      return b;
    },
  },
];
const TOTAL_EGGS = LEVELS.length * 3;

// ---------- Hats (assets/hats/*.png) ----------
// box = trimmed pixel bounds inside the 128x128 image; w = drawn width on the pig; dx/dy nudge; r = tilt
const HATS = [
  { id: 'baseballCap', name: 'Ham Run Cap', price: 30, box: [0, 28, 128, 64], w: 40 },
  { id: 'beanie', name: 'Sow Cozy Beanie', price: 30, box: [0, 12, 128, 106], w: 36, dy: 4 },
  { id: 'catEars', name: 'Purr-k Chop Ears', price: 30, box: [31, 2, 65, 124], w: 22, dy: 3 },
  { id: 'bunny', name: 'Easter Ham Ears', price: 30, box: [35, 2, 68, 124], w: 21, dy: 3 },
  { id: 'hardHat', name: 'Ham-struction Hat', price: 30, box: [2, 26, 124, 77], w: 40 },
  { id: 'police', name: 'Officer Oinksalot', price: 30, box: [2, 32, 126, 63], w: 40 },
  { id: 'cowboy', name: 'Rootin\' Tootin\' Rooter', price: 60, box: [1, 30, 126, 73], w: 46 },
  { id: 'beanieWithTassels', name: 'Swine-ter Tassels', price: 60, box: [4, 0, 120, 128], w: 36, dy: 4 },
  { id: 'fireman', name: 'Smokehouse Chief', price: 60, box: [0, 34, 128, 60], w: 44 },
  { id: 'outback', name: 'Crocodile Hog-dee', price: 60, box: [3, 36, 122, 50], w: 46 },
  { id: 'army', name: 'Private Porker', price: 60, box: [2, 23, 125, 82], w: 40, dy: 2 },
  { id: '50sMilitary', name: 'Sergeant Swine', price: 60, box: [0, 32, 128, 64], w: 38 },
  { id: '50sNurse', name: 'Nurse Oinkment', price: 60, box: [0, 26, 128, 74], w: 34 },
  { id: 'captains', name: 'Cap\'n Hamhock', price: 60, box: [0, 30, 128, 72], w: 40 },
  { id: 'robinhood', name: 'Robin Hog', price: 60, box: [0, 36, 128, 58], w: 42 },
  { id: 'tophat', name: 'Top Hog', price: 100, box: [1, 11, 124, 107], w: 38 },
  { id: 'bowlerHat', name: 'Sir Hamilton\'s Bowler', price: 100, box: [0, 29, 128, 94], w: 36 },
  { id: 'classicFedora', name: 'Indiana Jowls', price: 100, box: [0, 29, 128, 68], w: 42 },
  { id: 'fez', name: 'Hog Fez-tival', price: 100, box: [0, 12, 128, 106], w: 30 },
  { id: 'beret', name: 'Pig-casso Beret', price: 100, box: [0, 0, 128, 128], w: 36, dy: 4 },
  { id: 'graduation', name: 'Bachelor of Bacon', price: 100, box: [0, 16, 128, 94], w: 42 },
  { id: 'birthday', name: 'Hap-pig Birthday', price: 100, box: [4, 0, 120, 128], w: 28 },
  { id: 'sunhat', name: 'Sun-Dried Ham', price: 100, box: [1, 13, 125, 101], w: 48, dy: 4 },
  { id: 'takuhatsugasa', name: 'Sow-murai Straw Hat', price: 100, box: [0, 32, 128, 64], w: 48 },
  { id: 'waldo', name: 'Where\'s Oink-o?', price: 100, box: [0, 16, 128, 96], w: 36, dy: 4 },
  { id: 'lumberjack', name: 'Timberrr-oink', price: 100, box: [24, 2, 82, 125], w: 25, dy: 4 },
  { id: 'redBonnet', name: 'Little Red Riding Hog', price: 100, box: [1, 22, 126, 87], w: 40, dy: 8 },
  { id: 'antlers', name: 'Hambi Antlers', price: 160, box: [20, 3, 91, 122], w: 31, dy: 3 },
  { id: 'leprechaun', name: 'Pot o\' Pork', price: 160, box: [2, 16, 124, 96], w: 40 },
  { id: 'pinwheel', name: 'Hog-copter', price: 160, box: [0, 10, 128, 108], w: 38, dy: 3 },
  { id: 'umbrella', name: 'Pig-brella', price: 160, box: [0, 20, 128, 86], w: 44, dy: 3 },
  { id: 'hotdog', name: 'Hot Diggity Hog', price: 160, box: [0, 32, 128, 66], w: 42 },
  { id: 'freakazoid', name: 'Bed-Head Boar', price: 160, box: [0, 17, 128, 94], w: 38, dy: 6 },
  { id: 'wig', name: 'Big Pig Wig', price: 160, box: [1, 12, 126, 106], w: 42, dy: 9 },
  { id: 'ww1German', name: 'Pickle-Pork Helmet', price: 160, box: [0, 6, 128, 117], w: 36, dy: 4 },
  { id: 'bicorn', name: 'Napoleon Ham-aparte', price: 160, box: [0, 20, 128, 88], w: 46 },
  { id: 'viking', name: 'Ragnar Hogbrok', price: 250, box: [0, 16, 128, 94], w: 44, dy: 4 },
  { id: 'spartan', name: 'This Is Spar-HAM!', price: 250, box: [0, 6, 128, 116], w: 38, dy: 5 },
  { id: 'shark', name: 'Ham-merhead', price: 250, box: [0, 6, 128, 116], w: 40, dy: 6 },
  { id: 'skeleton', name: 'Spare Ribs', price: 250, box: [2, 5, 124, 116], w: 36, dy: 7 },
  { id: 'princess', name: 'Princess Truffle', price: 250, box: [0, 10, 128, 110], w: 38, dy: 4 },
  { id: 'horseHead', name: 'Trojan Hog', price: 250, box: [2, 10, 124, 110], w: 50, dy: 24, dx: 2, r: 0 },
  { id: 'tiara', name: 'Pork Pageant Tiara', price: 300, eggs: 9, box: [2, 8, 122, 113], w: 32, dy: 2 },
  { id: 'crown', name: 'Ham-peror\'s Crown', price: 500, eggs: TOTAL_EGGS, box: [1, 23, 125, 82], w: 36 },
];
const HAT_BY_ID = {};
for (const h of HATS) {
  h.img = new Image();
  h.img.src = `assets/hats/${h.id}.png`;
  HAT_BY_ID[h.id] = h;
}

// ---------- Save data ----------
const SAVE_KEY = 'pigsfly-save';
let save = { bests: {}, eggs: {}, coins: 0, owned: [], hat: null };
try {
  const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  if (s && typeof s === 'object') save = Object.assign(save, s);
  else save.bests = JSON.parse(localStorage.getItem('pigsfly-best') || '{}') || {};
} catch (e) {}
let noPersist = false, testSave = null;
function persist() { if (noPersist) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
const levelEggs = i => save.eggs[i] || 0;
const totalEggs = () => LEVELS.reduce((n, _, i) => n + bits(levelEggs(i)), 0);
const unlocked = i => i === 0 || !!save.bests[i - 1];

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
  coin() { tone(1320, 1320, 0.05, 'square', 0.035); tone(1760, 1760, 0.09, 'square', 0.035, 0.05); },
  egg() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, f * 1.01, 0.12, 'triangle', 0.08, i * 0.07)); },
  buy() { tone(880, 880, 0.06, 'square', 0.05); tone(1320, 1320, 0.06, 'square', 0.05, 0.07); tone(1760, 1760, 0.14, 'square', 0.05, 0.14); oinkLite(0.3); },
  nope() { tone(220, 160, 0.18, 'square', 0.05); },
};
// ---------- Music (alternates between the tracks in assets/Music) ----------
const TRACKS = ['assets/Music/Oink and Go.mp3', 'assets/Music/Sizzle and Soar.mp3'];
const music = { el: null, idx: 0 };
function startMusic() {
  if (!music.el) {
    const el = new Audio();
    el.preload = 'auto'; el.volume = 0.4;
    el.addEventListener('ended', () => { music.idx = (music.idx + 1) % TRACKS.length; el.src = encodeURI(TRACKS[music.idx]); syncMusic(); });
    el.src = encodeURI(TRACKS[0]);
    music.el = el;
  }
  syncMusic();
}
// Plays unless muted, paused or the tab is hidden
function syncMusic() {
  const el = music.el; if (!el) return;
  if (muted || state === 'paused' || document.hidden) el.pause();
  else if (el.paused) el.play().catch(() => {});
}
function toggleMute() { muted = !muted; $('muteBtn').textContent = muted ? 'Unmute' : 'Mute'; syncMusic(); }
function oinkLite(d) { tone(500, 300, 0.12, 'sawtooth', 0.05, d); }

// ---------- Puns ----------
const QUIPS = ['Crispy!', 'Pork belly flop!', 'Extra crunchy.', 'Hamageddon!', 'Sizzle sizzle...', 'Breakfast is served.', 'Well done. Literally.',
  'That was a mis-steak.', 'Hogwash!', 'Bacon bits everywhere.', 'Snout of luck.', 'Better luck next swine.', 'Pulled pork, anyone?',
  'Hog-tied!', 'Swine-d up as sausage.', 'Oink-redibly unlucky.', 'Prosciutto la vista, baby.', 'Pigs might fly. That one didn\'t.',
  'You\'ve been ham-bushed!', 'Squeal of misfortune.', 'Sow sad.', 'Ham-pered by hazards.', 'Rasher decision.', 'That\'s the way the cookie crumbles... into croutons.'];
const CAUSE_QUIPS = {
  spike: ['Pork-upine\'d!', 'Shish ka-bacon!', 'Pork on a stick!', 'Got the point?'],
  hay: ['Hay! Watch it!', 'Bale-d out.', 'Hit the hay. Hard.'],
  pan: ['Pan-fried!', 'Out of the frying pan...', 'Sunny side down.', 'Pan-demonium!'],
  farmer: ['Pitch-forked!', 'Fork-ed over.', 'Old MacDonald says hi.', 'Fork it over!'],
  cleaver: ['Chop chop!', 'Pork chopped!', 'Cleaved it to chance.', 'Cut the mustard. And you.'],
};
const WIN_TITLES = ['Made it to the mud!', 'Hog Heaven!', 'Sow-perb flying!', 'Ham-azing!', 'Swine and dandy!', 'Oink-credible!', 'Hogs and kisses!', 'Pig-tacular!', 'Hog wild!'];
const EGG_POPS = ['Egg-cellent!', 'Egg-straordinary!', 'Un-boar-lievable!', 'Yolk of genius!', 'Shell yeah!', 'Egg-squeezite!'];
const COIN_POPS = ['Pork-et change!', 'Cha-ching-oink!', 'Bringing home the bacon!', 'Piggy bank-roll!', 'Hog-wild money!', 'Snout-standing!'];
const TAGLINES = [
  'Dodge the farm. Reach the mud. Don\'t become breakfast.',
  'Bringing home the bacon... by not becoming it.',
  'Swine and dine? Not tonight.',
  'Ham on the run since breakfast.',
  'The sky\'s the limit. So is the frying pan.',
  'Pork-pelled by pure willpower.',
  'Hogs and kisses, see you at the mud spa.',
  'Some pigs are born to fly. Others are born to brunch.',
  'Golden eggs? Don\'t ask where a pig got those.',
];
const PAUSE_LINES = ['Hold your hogs...', 'Taking a hog-nap.', 'Snout break.', 'Pigs need breaks too. Ask any sow.', 'Bacon will wait.'];

// ---------- Game state ----------
let state = 'menu';          // menu | playing | dead | win | paused
let levelIdx = 0, level = LEVELS[0], objs = [], items = [];
let pig, camX = 0, levelT = 0, attempts = 0;
let particles = [], bacon = null, lostHat = null, deadT = 0, winT = 0, quip = '', shake = 0;
let menuCam = 0, clock = 0, splashed = false, newBest = false, winTime = 0;
let runCoins = 0, runEggs = 0, winInfo = null, shopOpen = false, shopSel = null, shopFrom = 'menu';
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

function startLevel(i) {
  levelIdx = i; level = LEVELS[i]; attempts = 0;
  hideAll();
  startMusic();
  if (isTouch && !autoFsTried) { autoFsTried = true; enterFullscreen(); }
  resetAttempt();
}
function pruneCoins(list) {
  return list.filter(it => {
    if (it.t !== 'coin') return true;
    if (it.y < 30 || it.y > GROUND - 14) return false;
    for (const o of objs) {
      if (o.t === 'spike' || o.t === 'hay') {
        if (it.x < o.x - 40 || it.x > o.x + o.w + 40) continue;
        if (hits(o, it.x, it.y, 20)) return false;
      } else if (o.t === 'farmer') {
        if (Math.abs(o.x - 15 - it.x) < 45 && it.y > GROUND - o.max - 30) return false;
      }
    }
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
  const prev = save.bests[levelIdx];
  const firstClear = !prev;
  newBest = !prev || winTime < prev;
  if (newBest) save.bests[levelIdx] = winTime;
  const prevEggs = levelEggs(levelIdx);
  const freshEggs = runEggs & ~prevEggs;
  save.eggs[levelIdx] = prevEggs | runEggs;
  const bonus = 10 + (firstClear ? 40 : 0) + bits(freshEggs) * 25;
  save.coins += bonus;
  winInfo = { firstClear, freshEggs, bonus, title: pick(WIN_TITLES) };
  persist();
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
function cleaverGeo(o) {
  const a = o.amp * Math.sin(2 * Math.PI * levelT / o.per + o.ph);
  const sx = Math.sin(a), cy = Math.cos(a);
  return { a, hx: o.x + sx * (o.len - 10), hy: cy * (o.len - 10), bx: o.x + sx * (o.len + 8), by: cy * (o.len + 8) };
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
    case 'cleaver': {
      const g = cleaverGeo(o), dx = cx - g.bx, dy = cy - g.by;
      return dx * dx + dy * dy < (r + 22) * (r + 22) || segDist2(cx, cy, o.x, 0, g.hx, g.hy) < (r + 3) * (r + 3);
    }
  }
  return false;
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
    }
    if (splashed && Math.random() < dt * 5) particles.push({ x: level.end + rand(40, 360), y: GROUND - 50, vx: rand(-20, 20), vy: rand(-70, -40), life: 1.6, max: 1.6, size: 18, col: '#ff6f9c', g: 0, heart: true });
    if (winT > 1.6 && $('win').classList.contains('hidden') && !shopOpen) showWin();
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
function drawPig(x, y, ang, flap, s = 1, wings = true, flip = 1, hat = null) {
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
  if (hat) drawHatOnHead(hat);
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

  // far hills (flat-topped mesas in the canyon)
  ctx.fillStyle = th.far; ctx.beginPath(); ctx.moveTo(0, GROUND);
  for (let x = 0; x <= W; x += 8) {
    const wx = x + cam * 0.25;
    const h = th.mesa ? 110 + (Math.sin(wx * 0.0042) > 0.1 ? 95 : 0) + (Math.sin(wx * 0.0013 + 2) > 0.4 ? 50 : 0) : 125 + Math.sin(wx * 0.004) * 40 + Math.sin(wx * 0.0113 + 1) * 20;
    ctx.lineTo(x, GROUND - h);
  }
  ctx.lineTo(W, GROUND); ctx.fill();
  if (th.weather === 'snow') { // snow caps
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let x = 0; x <= W; x += 8) { const wx = x + cam * 0.25; const h = 125 + Math.sin(wx * 0.004) * 40 + Math.sin(wx * 0.0113 + 1) * 20; if (h > 150) ctx.fillRect(x, GROUND - h, 8, (h - 150) * 0.6 + 4); }
  }

  // barns on the near layer
  const bc = cam * 0.5;
  for (let k = Math.floor((bc - 200) / 1400); k <= Math.floor((bc + W) / 1400); k++) drawBarn(k * 1400 + 500 - bc, GROUND - 40, th);

  // near hills
  ctx.fillStyle = th.near; ctx.beginPath(); ctx.moveTo(0, GROUND);
  for (let x = 0; x <= W; x += 16) { const wx = x + cam * 0.5; ctx.lineTo(x, GROUND - 45 - Math.sin(wx * 0.006 + 2) * 18 - Math.sin(wx * 0.017) * 8); }
  ctx.lineTo(W, GROUND); ctx.fill();

  if (th.cactus) {
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
function drawItems() {
  for (const it of items) {
    if (it.got || it.x < camX - 40 || it.x > camX + W + 40) continue;
    const x = it.x - camX;
    if (it.t === 'coin') drawCoin(x, it.y);
    else drawEgg(x, it.y + Math.sin(clock * 3 + it.id) * 4, 1, levelEggs(levelIdx) & (1 << it.id) ? 'ghost' : 'full');
  }
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
  if (state === 'win' && splashed) drawPig(pig.x - cam, GROUND - 34 + Math.sin(clock * 3) * 3 - Math.abs(Math.sin(clock * 6)) * 14, 0, clock * 20, 0.9, true, 1, save.hat);
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
    ctx.globalAlpha = p.txt ? clamp(a * 2, 0, 1) : a;
    if (p.txt) text(p.txt, p.x - cam, p.y, p.size, p.col);
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
  text(`${levelIdx + 1}. ${level.name}`, 16, 24, 20, '#fff', 'left');
  text(`Attempt ${attempts}`, 16, 50, 16, '#ffe1ea', 'left');
  // coins + eggs
  drawCoin(28, 80, 11);
  text(`${runCoins}`, 46, 81, 20, '#ffe14d', 'left');
  const saved = levelEggs(levelIdx);
  for (let i = 0; i < 3; i++) {
    const mode = runEggs & (1 << i) ? 'full' : saved & (1 << i) ? 'ghost' : 'none';
    drawEgg(108 + i * 24, 80, 0.6, mode);
  }
  text(`${levelT.toFixed(2)}s`, W - 16, 82, 20, '#fff', 'right');
  if (muted) text('MUTED', W - 16, 106, 14, '#ffe1ea', 'right');
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
  const th = THEMES[state === 'menu' ? Math.floor(menuCam / 3000) % THEMES.length : level.theme];
  const cam = state === 'menu' ? menuCam : camX;
  ctx.save();
  if (shake > 0) ctx.translate(rand(-shake, shake), rand(-shake, shake));
  drawBackground(cam, th);
  drawGround(cam, th);

  if (state === 'menu') {
    drawPig(PIG_SX + 40, 250 + Math.sin(clock * 2) * 50, Math.cos(clock * 2) * -0.25, clock * 22, 1, true, 1, save.hat);
  } else {
    drawMud(camX);
    for (const o of objs) {
      const r = o.reach || 0;
      if (o.x + (o.w || 60) + r < camX - 80 || o.x - r > camX + W + 80) continue;
      if (o.t === 'spike') drawSpike(o);
      else if (o.t === 'hay') drawHay(o);
      else if (o.t === 'farmer') drawFarmer(o);
      else if (o.t === 'pan') drawPan(o);
      else if (o.t === 'cleaver') drawCleaver(o);
    }
    drawItems();
    if (state === 'dead' && bacon) drawBacon(bacon.x - camX, bacon.y, bacon.rot);
    else if (!(state === 'win' && splashed)) drawPig(pig.x - camX, pig.y, pig.ang, pig.flap, 1, true, 1, save.hat);
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

// ---------- Shop ----------
const pvCanvas = $('preview'), pvCtx = pvCanvas.getContext('2d');
pvCanvas.width = pvCanvas.height = 260 * dpr;
function drawPreview() {
  ctx = pvCtx;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, 260, 260);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; drawCloud(20, 60, 0.9); drawCloud(180, 200, 0.7);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ellipse(130, 230, 60, 9); ctx.fill();
  drawPig(132, 150 + Math.sin(clock * 2.2) * 8, -0.05, clock * 14, 2.8, true, 1, shopSel);
  ctx = mainCtx;
}
function hatStatus(h) {
  if (!h) return { owned: true };
  const owned = save.owned.includes(h.id);
  const needEggs = h.eggs && totalEggs() < h.eggs ? h.eggs - totalEggs() : 0;
  return { owned, needEggs, short: Math.max(0, h.price - save.coins) };
}
function buildShop() {
  $('shopCoins').textContent = save.coins;
  $('shopEggs').textContent = `${totalEggs()}/${TOTAL_EGGS}`;
  const grid = $('hatGrid'); grid.innerHTML = '';
  const all = [null, ...HATS];
  for (const h of all) {
    const id = h ? h.id : null, st = hatStatus(h);
    const b = document.createElement('button');
    b.className = 'hat' + (st.owned ? ' owned' : '') + (save.hat === id ? ' equipped' : '') + (shopSel === id ? ' sel' : '') + (!st.owned && (st.short || st.needEggs) ? ' cant' : '');
    const label = !h ? 'Au naturel' : h.name;
    const price = !h ? 'Free' : save.hat === id ? 'Wearing' : st.owned ? 'Owned' : st.needEggs ? `🔒 ${h.eggs} eggs` : `<i class="coin"></i>${h.price}`;
    b.innerHTML = (h ? `<img src="${h.img.src}" alt="" draggable="false">` : `<span class="none">🐷</span>`) + `<span>${label}</span><span class="price">${price}</span>`;
    b.onclick = () => { shopSel = id; buildShop(); };
    grid.appendChild(b);
  }
  updatePreviewPanel();
}
function updatePreviewPanel() {
  const h = HAT_BY_ID[shopSel] || null, st = hatStatus(h), btn = $('pvBtn');
  $('pvName').textContent = h ? h.name : 'Au naturel';
  btn.disabled = false;
  if (save.hat === shopSel) { btn.textContent = 'Wearing it!'; btn.disabled = true; $('pvDesc').textContent = h ? 'Looking sharp, hog.' : 'Just you and your snout.'; }
  else if (st.owned) { btn.textContent = 'Wear it'; $('pvDesc').textContent = 'Already in your hog closet.'; }
  else if (st.needEggs) { btn.textContent = `Need ${st.needEggs} more golden eggs`; btn.disabled = true; $('pvDesc').textContent = `Unlocks with ${h.eggs} golden eggs.`; }
  else if (st.short) { btn.innerHTML = `<i class="coin"></i> ${h.price}`; btn.disabled = true; $('pvDesc').textContent = `${st.short} more coins. Keep hogging them!`; }
  else { btn.innerHTML = `Buy for <i class="coin"></i> ${h.price}`; $('pvDesc').textContent = 'Try before you buy. Swine-dow shopping!'; }
}
$('pvBtn').onclick = () => {
  const h = HAT_BY_ID[shopSel] || null, st = hatStatus(h);
  if (!st.owned) {
    if (st.needEggs || st.short) { sfx.nope(); return; }
    save.coins -= h.price; save.owned.push(h.id); sfx.buy();
  } else oinkLite(0);
  save.hat = shopSel;
  persist(); buildShop();
};
function openShop(from) {
  shopFrom = from; shopOpen = true; shopSel = save.hat;
  ['menu', 'win'].forEach(id => $(id).classList.add('hidden'));
  $('shop').classList.remove('hidden');
  buildShop();
  $('hatGrid').scrollTop = 0;
}
function closeShop() {
  shopOpen = false; $('shop').classList.add('hidden');
  if (shopFrom === 'win' && state === 'win') showWin(); else showMenu();
}

// ---------- UI ----------
function hideAll() { ['menu', 'win', 'pause', 'shop'].forEach(id => $(id).classList.add('hidden')); shopOpen = false; }
function blurAll() { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
const eggIcons = (mask, fresh = 0) => [0, 1, 2].map(i => `<i class="egg${mask & (1 << i) ? '' : ' empty'}${fresh & (1 << i) ? ' fresh' : ''}" style="animation-delay:${i * 0.15}s"></i>`).join('');
function buildMenu() {
  const el = $('levels'); el.innerHTML = '';
  LEVELS.forEach((L, i) => {
    const b = document.createElement('button'), open = unlocked(i), best = save.bests[i];
    b.className = 'lvl' + (best ? ' done' : '') + (open ? '' : ' locked');
    b.innerHTML = `<span class="num">${open ? i + 1 : '🔒'}</span><span class="name">${L.name}</span>` +
      `<span class="eggs">${eggIcons(levelEggs(i))}</span>` +
      `<span class="best">${!open ? `Clear level ${i} first` : best ? 'Best: ' + best.toFixed(2) + 's' : 'Not cleared yet'}</span>`;
    b.onclick = () => { blurAll(); if (open) startLevel(i); else { sfx.nope(); b.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], 200); } };
    el.appendChild(b);
  });
  $('menuCoins').textContent = save.coins;
  $('menuEggs').textContent = `${totalEggs()}/${TOTAL_EGGS}`;
  $('tagline').textContent = pick(TAGLINES);
}
function showMenu() { persist(); hideAll(); buildMenu(); state = 'menu'; $('menu').classList.remove('hidden'); }
function showWin() {
  const last = levelIdx === LEVELS.length - 1;
  const w = winInfo || { freshEggs: 0, bonus: 0, title: 'Made it to the mud!' };
  $('winTitle').textContent = last ? 'Ham-pion of the skies! Every level beaten!' : w.title;
  $('winEggs').innerHTML = eggIcons(levelEggs(levelIdx), w.freshEggs);
  $('winStats').textContent = `Time: ${winTime.toFixed(2)}s  •  Attempts: ${attempts}${newBest ? '  •  New best!' : ''}`;
  const parts = [`+${runCoins} grabbed`, `+${w.bonus} bonus${w.firstClear ? ' (first clear!)' : ''}`];
  $('winCoins').innerHTML = `<i class="coin"></i> ${parts.join('  •  ')}  •  Wallet: ${save.coins}`;
  $('nextBtn').style.display = last ? 'none' : '';
  $('win').classList.remove('hidden');
}
function togglePause() {
  if (state === 'playing') {
    state = 'paused'; $('pause').classList.remove('hidden');
    $('pauseSub').textContent = pick(PAUSE_LINES);
    $('muteBtn').textContent = muted ? 'Unmute' : 'Mute';
    input.ptrs.clear(); input.kbUp = false; input.boostPtr = null; syncKeys();
    persist();
  } else if (state === 'paused') { state = 'playing'; $('pause').classList.add('hidden'); }
  syncMusic();
}
function nextLevel() { if (levelIdx < LEVELS.length - 1) startLevel(levelIdx + 1); else showMenu(); }

$('nextBtn').onclick = () => { blurAll(); nextLevel(); };
$('replayBtn').onclick = () => { blurAll(); startLevel(levelIdx); };
$('menuBtn').onclick = () => { blurAll(); showMenu(); };
$('winShopBtn').onclick = () => { blurAll(); openShop('win'); };
$('shopBtn').onclick = () => { blurAll(); openShop('menu'); };
$('shopBack').onclick = () => { blurAll(); closeShop(); };
$('resumeBtn').onclick = () => { blurAll(); togglePause(); };
$('restartBtn').onclick = () => { blurAll(); $('pause').classList.add('hidden'); resetAttempt(); };
$('muteBtn').onclick = () => toggleMute();
$('quitBtn').onclick = () => { blurAll(); showMenu(); };
$('pauseBtn').onclick = () => { blurAll(); togglePause(); };

// ---------- Mobile + fullscreen ----------
let isTouch = matchMedia('(pointer: coarse)').matches;
let autoFsTried = false;
const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
const fsEnabled = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
document.body.classList.toggle('is-touch', isTouch);
document.body.classList.toggle('is-ios', isIOS && !standalone);
document.body.classList.toggle('no-fs', !fsEnabled || !!standalone);
const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement;
function enterFullscreen() {
  if (!fsEnabled || fsElement()) return;
  const el = document.documentElement;
  try {
    const p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el, { navigationUI: 'hide' });
    if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {});
  } catch (e) {}
}
function toggleFullscreen() {
  if (fsElement()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  else enterFullscreen();
}
document.querySelectorAll('.fsToggle').forEach(b => b.addEventListener('click', () => { blurAll(); autoFsTried = true; toggleFullscreen(); }));
function setTouch() { if (!isTouch) { isTouch = true; document.body.classList.add('is-touch'); } }

let hudShown = null;
function syncHudButtons() {
  const on = state === 'playing' || state === 'dead';
  const key = on + '|' + isTouch;
  if (key === hudShown) return;
  hudShown = key;
  $('hudBtns').classList.toggle('hidden', !on);
  $('boostBtn').classList.toggle('hidden', !(on && isTouch));
}

// ---------- Input ----------
function pressUp() {
  audio();
  if (shopOpen) return;
  if (state === 'menu') {
    let first = LEVELS.findIndex((_, i) => !save.bests[i]);
    if (first < 0) first = 0;
    startLevel(first); return;
  }
  if (state === 'playing') { sfx.flap(); for (let i = 0; i < 3; i++) particles.push({ x: pig.x - 8, y: pig.y + 16, vx: rand(-90, -30), vy: rand(40, 120), life: 0.35, max: 0.35, size: rand(3, 5), col: 'rgba(255,255,255,0.8)', g: 0 }); }
  if (state === 'dead' && deadT > 0.4) resetAttempt();
  if (state === 'win' && winT > 1.6) nextLevel();
}
const UP_KEYS = ['Space', 'ArrowUp', 'KeyW'];
addEventListener('keydown', e => {
  if (UP_KEYS.includes(e.code)) {
    e.preventDefault();
    if (!e.repeat) { input.kbUp = true; syncKeys(); pressUp(); }
  } else if (e.key === 'Shift') { input.kbBoost = true; syncKeys(); }
  else if (e.code === 'KeyP' || (e.code === 'Escape' && !shopOpen)) togglePause();
  else if (e.code === 'Escape' && shopOpen) closeShop();
  else if (e.code === 'KeyM') toggleMute();
  else if (e.code === 'KeyF') toggleFullscreen();
  else if (e.code === 'KeyR' && (state === 'playing' || state === 'dead')) resetAttempt();
  else if (e.code === 'Enter' && state === 'win' && winT > 1.6 && !shopOpen) nextLevel();
});
addEventListener('keyup', e => {
  if (UP_KEYS.includes(e.code)) { e.preventDefault(); input.kbUp = false; syncKeys(); }
  else if (e.key === 'Shift') { input.kbBoost = false; syncKeys(); }
});
canvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (e.pointerType === 'touch') setTouch();
  input.ptrs.add(e.pointerId); syncKeys(); pressUp();
});
const boostBtn = $('boostBtn');
boostBtn.addEventListener('pointerdown', e => {
  e.preventDefault(); e.stopPropagation();
  audio();
  input.boostPtr = e.pointerId; boostBtn.classList.add('on');
  try { boostBtn.setPointerCapture(e.pointerId); } catch (err) {}
  syncKeys();
});
function releasePtr(e) {
  if (e.pointerId === input.boostPtr) { input.boostPtr = null; boostBtn.classList.remove('on'); }
  input.ptrs.delete(e.pointerId);
  syncKeys();
}
addEventListener('pointerup', releasePtr);
addEventListener('pointercancel', releasePtr);
// No long-press menus, pinch zoom or double-tap zoom while playing
document.getElementById('wrap').addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());

function releaseAll() { input.kbUp = false; input.kbBoost = false; input.ptrs.clear(); input.boostPtr = null; boostBtn.classList.remove('on'); syncKeys(); }
addEventListener('blur', () => { releaseAll(); if (state === 'playing') togglePause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { releaseAll(); if (state === 'playing') togglePause(); persist(); } syncMusic(); });
addEventListener('pagehide', persist);
// Turning a phone to portrait mid-run pauses the game (the rotate prompt covers it)
const portrait = matchMedia('(orientation: portrait) and (pointer: coarse)');
const onPortrait = () => { if (portrait.matches && state === 'playing') togglePause(); };
if (portrait.addEventListener) portrait.addEventListener('change', onPortrait); else if (portrait.addListener) portrait.addListener(onPortrait);

// ---------- Main loop ----------
let last = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (state !== 'paused' && !(portrait.matches && state === 'playing')) {
    acc += dt;
    while (acc >= STEP) { update(STEP); acc -= STEP; }
  }
  render();
  requestAnimationFrame(frame);
}
showMenu();
requestAnimationFrame(frame);

// Exposed for debugging and automated play-testing in the console
window.__pig = {
  get state() { return state; }, get pig() { return pig; }, get items() { return items; }, get objs() { return objs; },
  get save() { return save; }, get music() { return music; }, startLevel, LEVELS, HATS, keys, update, render, openShop,
  // Automated play-testing: freezes save data (coins/eggs/bests) and sound until switched off
  testMode(on) {
    if (on && !noPersist) testSave = JSON.stringify(save);
    if (!on && noPersist && testSave) save = JSON.parse(testSave);
    noPersist = on; muted = on; syncMusic();
  },
  // Draws every hat on a pig into a canvas (handy for tuning hat fit): document.body.append(__pig.hatSheet())
  hatSheet() {
    const c = document.createElement('canvas'), cols = 9, cell = 110;
    c.width = cols * cell; c.height = Math.ceil(HATS.length / cols) * cell;
    c.style.cssText = 'position:fixed;inset:0;z-index:99;background:#cfeaff';
    ctx = c.getContext('2d');
    HATS.forEach((h, i) => { drawPig((i % cols) * cell + 50, Math.floor(i / cols) * cell + 70, 0, 1, 1.6, false, 1, h.id); ctx.fillStyle = '#000'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(h.id, (i % cols) * cell + 55, Math.floor(i / cols) * cell + 106); });
    ctx = mainCtx;
    return c;
  },
  snap: () => ({ pig: { ...pig }, levelT, camX, state, runEggs, runCoins, pans: objs.map(o => o.t === 'pan' ? [o.x, o.y, o.rot, o.active] : null), got: items.map(i => !!i.got) }),
  restore: d => {
    pig = { ...d.pig }; levelT = d.levelT; camX = d.camX; state = d.state; runEggs = d.runEggs; runCoins = d.runCoins; particles = [];
    d.pans.forEach((p, i) => { if (p) [objs[i].x, objs[i].y, objs[i].rot, objs[i].active] = p; });
    d.got.forEach((g, i) => { items[i].got = g; });
  },
};
})();
