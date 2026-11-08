'use strict';
// Sound effects (tiny synth) and the music playlist.
// ---------- Audio (tiny synth, no files) ----------
let actx = null, testMuted = false;
// Master volume 0..1 (saved); 0 = muted. Scales both sound effects and music.
const muted = () => testMuted || !(save.volume > 0);
function audio() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } }
  if (actx && actx.state === 'suspended') actx.resume();
  return actx;
}
function tone(f0, f1, dur, type = 'square', vol = 0.08, delay = 0) {
  const a = audio(); if (!a || muted()) return;
  vol *= save.volume * 1.3;
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
  const a = audio(); if (!a || muted()) return;
  vol *= save.volume * 1.3;
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
  cheer() { // the other pigs squeal, then a sparkle
    [0, 0.1, 0.2, 0.32].forEach((d, i) => tone(560 + i * 45, 330 + i * 30, 0.13, 'sawtooth', 0.04, d));
    [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, f, 0.12, 'triangle', 0.05, 0.36 + i * 0.07));
  },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.18, 'square', 0.06, i * 0.12)); },
  splat() { noise(0.4, 0.18, 380, 'lowpass'); },
  tock() { tone(340, 250, 0.07, 'triangle', 0.05); },                               // coconut rocking in its tree
  crack() { noise(0.07, 0.1, 2400, 'highpass'); tone(760, 180, 0.22, 'triangle', 0.04); }, // ...and letting go
  clack() { tone(1250, 900, 0.035, 'square', 0.035); tone(1500, 1050, 0.04, 'square', 0.035, 0.06); }, // crab shimmy
  swell() { noise(1.2, 0.08, 500, 'lowpass'); },                                     // a tidal wave starts rolling
  crash() { noise(0.6, 0.16, 1400, 'lowpass'); noise(0.35, 0.05, 3000, 'highpass', 0.05); }, // ...and is right behind you
  laser() { tone(1800, 200, 0.28, 'sawtooth', 0.06); noise(0.2, 0.06, 2500, 'highpass'); },
  horn() { tone(220, 210, 0.5, 'sawtooth', 0.05); tone(277, 262, 0.5, 'sawtooth', 0.04); },
  lock() { [0, 0.12, 0.24].forEach(d => tone(1400, 1400, 0.07, 'square', 0.04, d)); }, // a drone locks on
  siren(hi, v = 1) { tone(hi ? 880 : 620, hi ? 860 : 600, 0.38, 'square', 0.03 * v); }, // the Enforcer's wee-woo
  coin() { tone(1320, 1320, 0.05, 'square', 0.035); tone(1760, 1760, 0.09, 'square', 0.035, 0.05); },
  egg() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, f * 1.01, 0.12, 'triangle', 0.08, i * 0.07)); },
  buy() { tone(880, 880, 0.06, 'square', 0.05); tone(1320, 1320, 0.06, 'square', 0.05, 0.07); tone(1760, 1760, 0.14, 'square', 0.05, 0.14); oinkLite(0.3); },
  nope() { tone(220, 160, 0.18, 'square', 0.05); },
};
// ---------- Tidal wave roar (a looping noise; hazards set surfWant 0..1 each step) ----------
let surfWant = 0;
const surf = { g: null, f: null };
function setSurf(v) {
  const a = actx; if (!a) return;
  if (muted() || state !== 'playing') v = 0;
  if (!surf.g) {
    if (v <= 0) return;
    const len = a.sampleRate * 2, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.03 * w) / 1.03; d[i] = last * 3 + w * 0.08; } // rumble + a little hiss
    const src = a.createBufferSource(); src.buffer = buf; src.loop = true;
    surf.f = a.createBiquadFilter(); surf.f.type = 'lowpass'; surf.g = a.createGain(); surf.g.gain.value = 0;
    src.connect(surf.f).connect(surf.g).connect(a.destination); src.start();
  }
  const t = a.currentTime;
  surf.g.gain.setTargetAtTime(v * v * 0.35 * save.volume * 1.3, t, 0.12);
  surf.f.frequency.setTargetAtTime(250 + 1600 * v, t, 0.12);
}

// ---------- Music (alternates between the tracks of the playlist for where you are) ----------
// An area can have its own playlist (keyed by area id); everywhere else plays the default one.
const PLAYLISTS = {
  default: ['assets/Music/Oink and Go.mp3', 'assets/Music/Sizzle and Soar.mp3'],
  beach: ['assets/Music/Bacon Bay.mp3', 'assets/Music/Coconut Cannonballs.mp3'],
  city: ['assets/Music/Porktopia-2099.mp3', 'assets/Music/Never Touch the Ground.mp3', 'assets/Music/Stay Up.mp3'],
};
const music = { el: null, idx: 0, list: null };
function musicList() {
  const a = ['playing', 'dead', 'win', 'paused'].includes(state) ? level.area : state === 'area' ? map.area : null;
  return PLAYLISTS[a && a.id] || PLAYLISTS.default;
}
function startMusic() {
  if (!music.el) {
    const el = new Audio();
    el.preload = 'auto';
    el.addEventListener('ended', () => { music.idx = (music.idx + 1) % music.list.length; el.src = encodeURI(music.list[music.idx]); syncMusic(); });
    music.el = el;
  }
  followMusic();
  syncMusic();
}
// Called every frame: switches playlist when you move into (or out of) an area that has its own music
function followMusic() {
  const el = music.el, list = musicList();
  if (!el || list === music.list) return;
  music.list = list; music.idx = 0; el.src = encodeURI(list[0]);
  syncMusic();
}
// Plays unless muted, paused or the tab is hidden
function syncMusic() {
  const el = music.el; if (!el) return;
  el.volume = clamp(save.volume * 0.55, 0, 1);
  if (muted() || state === 'paused' || document.hidden) el.pause();
  else if (el.paused) el.play().catch(() => {});
}
let lastVolume = save.volume > 0 ? save.volume : 0.7;
function setVolume(v, store = true) {
  save.volume = clamp(v, 0, 1);
  if (save.volume > 0) lastVolume = save.volume;
  const pct = Math.round(save.volume * 100);
  document.querySelectorAll('.vol').forEach(w => {
    w.querySelector('input').value = pct;
    w.querySelector('input').style.setProperty('--fill', pct + '%');
    w.querySelector('.volPct').textContent = pct ? pct + '%' : 'Muted';
    w.querySelector('.volIcon').textContent = !pct ? '🔇' : pct < 40 ? '🔈' : pct < 75 ? '🔉' : '🔊';
    w.querySelector('.volIcon').setAttribute('aria-label', pct ? 'Mute' : 'Unmute');
  });
  document.querySelectorAll('.volBtn').forEach(b => { b.textContent = !pct ? '🔇' : pct < 40 ? '🔈' : pct < 75 ? '🔉' : '🔊'; });
  syncMusic();
  if (store) persist();
}
function toggleMute() { setVolume(save.volume > 0 ? 0 : lastVolume); }
function oinkLite(d) { tone(500, 300, 0.12, 'sawtooth', 0.05, d); }
