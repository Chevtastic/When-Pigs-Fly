'use strict';
// Canvas setup, constants and small helpers shared by every file.
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


// ---------- Collision helpers ----------
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
