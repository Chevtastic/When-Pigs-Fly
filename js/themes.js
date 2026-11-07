'use strict';
// Background themes. A level picks one with theme: <index>.
// ---------- Themes ----------
const THEMES = [
  { skyTop: '#6cc4ff', skyBot: '#d9f3ff', far: '#9bd38a', near: '#6fbf5c', grass: '#57b847', dirt: '#8a5a2e', dirt2: '#74491f', cloud: 'rgba(255,255,255,0.9)', sun: '#fff3a0', sunY: 90, fence: '#a0703f', barn: '#c0392b' },
  { skyTop: '#ff7a59', skyBot: '#ffd39a', far: '#c98a6a', near: '#9a6a4a', grass: '#7aa33a', dirt: '#7a4a2a', dirt2: '#633b20', cloud: 'rgba(255,225,200,0.85)', sun: '#ffe08a', sunY: 300, fence: '#6e4526', barn: '#a8322a' },
  { skyTop: '#070b2a', skyBot: '#2a2d6e', far: '#1d2550', near: '#16203f', grass: '#2c5a3a', dirt: '#3a2a1e', dirt2: '#2c1f16', cloud: 'rgba(160,170,220,0.22)', sun: '#f4f1d0', sunY: 90, night: true, fence: '#3b2a20', barn: '#5a1f1c' },
  { skyTop: '#3b4658', skyBot: '#8c99aa', far: '#5c7a5a', near: '#46664a', grass: '#4f8a45', dirt: '#5e4128', dirt2: '#4b331f', cloud: 'rgba(78,88,104,0.9)', noSun: true, fence: '#5a4030', barn: '#7a2a26', weather: 'rain' },
  { skyTop: '#93bfe6', skyBot: '#eef6ff', far: '#d6e4f0', near: '#bcd2e4', grass: '#f4f8fc', dirt: '#8f7a6a', dirt2: '#7a6656', cloud: 'rgba(255,255,255,0.95)', sun: '#fffbe0', sunY: 110, fence: '#8a6a50', barn: '#b03a30', weather: 'snow' },
  { skyTop: '#ff8f4a', skyBot: '#ffe3a8', far: '#c8643a', near: '#a54a2a', grass: '#c9a25a', dirt: '#9a5a32', dirt2: '#7e4626', cloud: 'rgba(255,235,210,0.8)', sun: '#fff1b0', sunY: 220, fence: '#6e4526', barn: '#8a3a22', mesa: true, cactus: true },
  // Bacon Bay (6-8): sea = ocean horizon instead of far hills, palms instead of barns, sand instead of dirt
  { skyTop: '#4fc3ff', skyBot: '#fff4cc', far: '#2aa6dc', far2: '#1679b8', near: '#f2d791', grass: '#f6e3a8', dirt: '#e8c983', dirt2: '#d9b46c', cloud: 'rgba(255,255,255,0.95)', sun: '#fff6b0', sunY: 95, sea: true, palms: true },
  { skyTop: '#ff6f61', skyBot: '#ffd59a', far: '#d86a7a', far2: '#7a3a78', near: '#e9b97a', grass: '#f0d08e', dirt: '#dcae6a', dirt2: '#c99656', cloud: 'rgba(255,214,190,0.85)', sun: '#ffe08a', sunY: 330, sea: true, palms: true },
  { skyTop: '#06102e', skyBot: '#253f7a', far: '#16305a', far2: '#0b1a38', near: '#4f5878', grass: '#cdbf95', dirt: '#a99b73', dirt2: '#968860', cloud: 'rgba(150,170,230,0.2)', sun: '#f4f1d0', sunY: 90, night: true, sea: true, palms: true },
];
const STARS = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * 330, r: Math.random() * 1.6 + 0.4, p: Math.random() * 6 }));
const RAIN = Array.from({ length: 110 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: rand(700, 1000), l: rand(10, 20) }));
const SNOW = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: rand(30, 80), r: rand(1.5, 3.5), p: Math.random() * 6 }));
