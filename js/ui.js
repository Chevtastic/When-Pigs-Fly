'use strict';
// Menus, input, fullscreen, the main loop and debug helpers.
// ---------- UI ----------
function hideAll() { ['menu', 'map', 'area', 'win', 'pause', 'shop'].forEach(id => $(id).classList.add('hidden')); shopOpen = false; closeVolPops(); }
function blurAll() { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
const eggIcons = (mask, fresh = 0) => [0, 1, 2].map(i => `<i class="egg${mask & (1 << i) ? '' : ' empty'}${fresh & (1 << i) ? ' fresh' : ''}" style="animation-delay:${i * 0.15}s"></i>`).join('');
// The level "Continue" plays: the first open level you haven't cleared, else the last one you played
function nextUp() { return ALL_LEVELS.find(L => levelOpen(L) && !cleared(L.id)) || LEVEL_BY_ID[save.mapAt] || ALL_LEVELS[0]; }
function continueGame() { blurAll(); startLevel(nextUp()); }
function buildMenu() {
  const up = nextUp();
  $('continueSub').textContent = `${up.area.name}  •  ${up.num}. ${up.name}`;
  $('menuCoins').textContent = save.coins;
  $('menuEggs').textContent = `${totalEggs()}/${TOTAL_EGGS}`;
  $('tagline').textContent = pick(TAGLINES);
}
function showMenu() { persist(); hideAll(); buildMenu(); state = 'menu'; map.goal = 0; map.k = 0; $('menu').classList.remove('hidden'); }
// An area's levels as big cards, over the island zoomed into that area
function showArea(a) {
  persist(); hideAll(); state = 'area';
  map.area = a; map.goal = 1; map.k = 1; map.sel = AREAS.indexOf(a);
  $('areaName').textContent = `${a.icon || ''} ${a.name}`.trim();
  $('areaBlurb').textContent = a.blurb || '';
  $('areaEggs').textContent = `${areaEggs(a)}/${a.levels.length * 3}`;
  $('areaCoins').textContent = save.coins;
  const el = $('levels'); el.innerHTML = '';
  const up = nextUp();
  a.levels.forEach(L => {
    const b = document.createElement('button'), open = levelOpen(L), best = save.bests[L.id];
    b.className = 'lvl' + (best ? ' done' : '') + (open ? '' : ' locked') + (L === up && open && !best ? ' next' : '');
    b.innerHTML = `<span class="num">${open ? L.num : '🔒'}</span><span class="name">${L.name}</span>` +
      `<span class="eggs">${eggIcons(levelEggs(L.id))}</span>` +
      `<span class="best">${!open ? `Clear level ${L.num - 1} first` : best ? 'Best: ' + best.toFixed(2) + 's' : L === up ? 'Up next!' : 'Not cleared yet'}</span>`;
    b.onclick = () => { blurAll(); if (open) startLevel(L); else { sfx.nope(); b.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], 200); } };
    el.appendChild(b);
  });
  // what this area's eggs unlock next
  const n = AREAS[AREAS.indexOf(a) + 1], need = n ? eggsToOpen(n) : 0, have = Math.min(need, areaEggs(a));
  $('areaNext').innerHTML = !n ? '' : `Next: <b>${n.icon || ''} ${n.name}</b>${n.soon ? ' (coming soon)' : ''}  •  ` +
    (areaOpen(n) ? 'open!' : `${areaDone(a) ? '' : 'clear every level here and '}find <b>${need}</b> golden eggs here <span class="pill"><i class="egg"></i><b>${have}/${need}</b></span>`);
  for (const [id, d] of [['areaL', -1], ['areaR', 1]]) {
    const b = $(id), n = AREAS[AREAS.indexOf(a) + d], lock = n && areaLock(n);
    b.classList.toggle('hidden', !n);
    if (!n) continue;
    b.classList.toggle('locked', !!lock);
    b.title = lock ? `${n.name}: ${lockText(n)}` : n.name;
    b.setAttribute('aria-label', (d < 0 ? 'Previous area: ' : 'Next area: ') + b.title);
    b.innerHTML = `<svg viewBox="0 0 24 24"><path d="${d < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
      `<span>${lock ? '🔒' : n.icon || ''}</span>`;
  }
  $('area').classList.remove('hidden');
}
// Jump straight to the next / previous area's level cards (if it's open)
function areaStep(d) {
  const a = map.area, n = a && AREAS[AREAS.indexOf(a) + d];
  if (!n) return;
  if (areaOpen(n)) { showArea(n); return; }
  sfx.nope();
  const b = $(d < 0 ? 'areaL' : 'areaR');
  b.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], 200);
  // the line under the cards already says what it needs: make it flash
  $('areaNext').animate([{ color: '#ff3a6a', transform: 'scale(1.06)' }, { color: '', transform: 'none' }], 600);
}
function showWin() {
  const next = nextInArea(level);
  const w = winInfo || { freshEggs: 0, bonus: 0, title: 'Made it to the mud!' };
  $('winTitle').textContent = next ? w.title : `${level.area.name} conquered!`;
  $('winEggs').innerHTML = eggIcons(levelEggs(level.id), w.freshEggs);
  $('winStats').textContent = `Time: ${winTime.toFixed(2)}s  •  Attempts: ${attempts}${newBest ? '  •  New best!' : ''}`;
  const parts = [`+${runCoins} grabbed`, `+${w.bonus} bonus${w.firstClear ? ' (first clear!)' : ''}`];
  $('winCoins').innerHTML = `<i class="coin"></i> ${parts.join('  •  ')}  •  Wallet: ${save.coins}`;
  $('nextBtn').textContent = next ? 'Next level' : 'To the island 🗺️';
  $('menuBtn').style.display = next ? '' : 'none';
  $('win').classList.remove('hidden');
}
function togglePause() {
  if (state === 'playing') {
    state = 'paused'; $('pause').classList.remove('hidden');
    $('pauseSub').textContent = pick(PAUSE_LINES);
    input.ptrs.clear(); input.kbUp = false; input.boostPtr = null; syncKeys();
    persist();
  } else if (state === 'paused') { state = 'playing'; $('pause').classList.add('hidden'); }
  syncMusic();
}
// next level in this area, or (after an area's last level) back out to the island
function nextLevel() { const n = nextInArea(level); if (n && levelOpen(n)) startLevel(n); else { map.area = level.area; map.goal = 1; map.k = 1; showMap(); } }

$('nextBtn').onclick = () => { blurAll(); nextLevel(); };
$('replayBtn').onclick = () => { blurAll(); startLevel(level); };
$('menuBtn').onclick = () => { blurAll(); showArea(level.area); };
$('continueBtn').onclick = continueGame;
$('islandBtn').onclick = () => { blurAll(); showMap(); };
$('mapBack').onclick = () => { blurAll(); showMenu(); };
$('mapShop').onclick = () => { blurAll(); openShop('map'); };
$('areaBack').onclick = () => { blurAll(); showMap(); };
$('areaShop').onclick = () => { blurAll(); openShop('area'); };
$('areaL').onclick = () => { blurAll(); areaStep(-1); };
$('areaR').onclick = () => { blurAll(); areaStep(1); };
$('winShopBtn').onclick = () => { blurAll(); openShop('win'); };
$('shopBtn').onclick = () => { blurAll(); openShop('menu'); };
$('shopBack').onclick = () => { blurAll(); closeShop(); };
$('resumeBtn').onclick = () => { blurAll(); togglePause(); };
$('restartBtn').onclick = () => { blurAll(); $('pause').classList.add('hidden'); resetAttempt(); };
document.querySelectorAll('.vol').forEach(w => {
  const slider = w.querySelector('input');
  slider.addEventListener('input', () => setVolume(slider.value / 100, false));
  slider.addEventListener('change', () => { persist(); slider.blur(); if (save.volume > 0) sfx.coin(); });
  w.querySelector('.volIcon').addEventListener('click', () => { blurAll(); toggleMute(); });
});
// a song picker under every volume slider: ◀ track name ▶ ("Auto" = the music for where you are)
document.querySelectorAll('.vol').forEach(w => {
  const s = document.createElement('div');
  s.className = 'song';
  s.innerHTML = '<span class="songIcon" aria-hidden="true">♪</span><button class="songPrev" aria-label="Previous song">◀</button>'
    + '<span class="songName" aria-live="polite">Auto</span><button class="songNext" aria-label="Next song">▶</button>';
  s.querySelector('.songPrev').addEventListener('click', () => { blurAll(); audio(); startMusic(); stepSong(-1); });
  s.querySelector('.songNext').addEventListener('click', () => { blurAll(); audio(); startMusic(); stepSong(1); });
  w.after(s);
});
// speaker buttons on the island and area screens open a volume slider; tapping anywhere else closes it
function closeVolPops() { document.querySelectorAll('.volPop').forEach(p => p.classList.add('hidden')); document.querySelectorAll('.volBtn').forEach(b => b.setAttribute('aria-expanded', 'false')); }
document.querySelectorAll('.volDrop').forEach(d => {
  const btn = d.querySelector('.volBtn'), pop = d.querySelector('.volPop');
  btn.addEventListener('click', () => { blurAll(); const open = pop.classList.contains('hidden'); closeVolPops(); if (open) { pop.classList.remove('hidden'); btn.setAttribute('aria-expanded', 'true'); } });
});
addEventListener('pointerdown', e => {
  if (!document.querySelector('.volPop:not(.hidden)') || e.target.closest('.volDrop')) return;
  closeVolPops();
  if (e.target === canvas) e.stopPropagation(); // the tap just closes the slider, it doesn't pick an area
}, true);
$('quitBtn').onclick = () => { blurAll(); showArea(level.area); };
$('pauseBtn').onclick = () => { blurAll(); togglePause(); };

// ---------- Mobile + fullscreen ----------
let isTouch = matchMedia('(pointer: coarse)').matches;
let autoFsTried = false;
const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
const fsEnabled = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
document.body.classList.toggle('is-touch', isTouch);
document.body.classList.toggle('is-ios', isIOS && !standalone);
// iPhone browsers have no fullscreen at all; there the button explains Add to Home Screen instead (#iosFs)
const iosNoFs = isIOS && !fsEnabled && !standalone;
document.body.classList.toggle('no-fs', (!fsEnabled && !iosNoFs) || !!standalone);
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
document.querySelectorAll('.fsToggle').forEach(b => b.addEventListener('click', () => {
  blurAll(); autoFsTried = true;
  if (iosNoFs) { if (state === 'playing') togglePause(); $('iosFs').classList.remove('hidden'); return; }
  toggleFullscreen();
}));
$('iosFsClose').onclick = () => { blurAll(); $('iosFs').classList.add('hidden'); };
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
  if (state === 'menu') { continueGame(); return; }
  if (state === 'map' || state === 'area') return;
  if (state === 'playing') { sfx.flap(); for (let i = 0; i < 3; i++) particles.push({ x: pig.x - 8, y: pig.y + 16, vx: rand(-90, -30), vy: rand(40, 120), life: 0.35, max: 0.35, size: rand(3, 5), col: 'rgba(255,255,255,0.8)', g: 0 }); }
  if (state === 'dead' && deadT > 0.4) resetAttempt();
  if (state === 'win' && winT > 1.6) nextLevel();
}
const UP_KEYS = ['Space', 'ArrowUp', 'KeyW'];
addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return; // arrow keys adjust a focused volume slider
  if (state === 'map' && !shopOpen) {
    if (['ArrowLeft', 'KeyA', 'ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); mapStep(-1); return; }
    if (['ArrowRight', 'KeyD', 'ArrowDown', 'KeyS'].includes(e.code)) { e.preventDefault(); mapStep(1); return; }
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (!e.repeat) mapPlay(); return; }
    if (e.code === 'Escape') { showMenu(); return; }
  }
  if (state === 'area' && !shopOpen) {
    if (e.code === 'Escape') { showMap(); return; }
    if (['ArrowLeft', 'KeyA'].includes(e.code)) { e.preventDefault(); areaStep(-1); return; }
    if (['ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); areaStep(1); return; }
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); const L = map.area.levels.find(l => levelOpen(l) && !cleared(l.id)); if (L && !e.repeat) startLevel(L); return; }
  }
  if (UP_KEYS.includes(e.code)) {
    e.preventDefault();
    if (!e.repeat) { input.kbUp = true; syncKeys(); pressUp(); }
  } else if (e.key === 'Shift') { input.kbBoost = true; syncKeys(); }
  else if (e.code === 'KeyP' || (e.code === 'Escape' && !shopOpen)) togglePause();
  else if (e.code === 'Escape' && shopOpen) closeShop();
  else if (e.code === 'KeyM') toggleMute();
  else if (e.code === 'KeyN' && !e.repeat) stepSong(e.shiftKey ? -1 : 1);
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
  if (state === 'map') {
    if (shopOpen) return;
    const r = canvas.getBoundingClientRect();
    audio(); mapTap((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H); return;
  }
  if (state === 'area') return;
  input.ptrs.add(e.pointerId); syncKeys(); pressUp();
});
canvas.addEventListener('pointermove', e => {
  if (state !== 'map' || e.pointerType === 'touch') return;
  const r = canvas.getBoundingClientRect();
  mapHover((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H);
  canvas.style.cursor = map.hover >= 0 ? 'pointer' : '';
});
canvas.addEventListener('pointerleave', () => { map.hover = -1; canvas.style.cursor = ''; });
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
  followMusic();
  setSurf(surfWant);
  requestAnimationFrame(frame);
}
setVolume(save.volume, false);
stepSong(0);
showMenu();
// Music plays from the main menu. Browsers block sound until the first tap/click/key,
// so try right away and again on the first interaction.
startMusic();
const kickMusic = () => { audio(); startMusic(); ['pointerdown', 'keydown', 'touchend'].forEach(ev => removeEventListener(ev, kickMusic, true)); };
['pointerdown', 'keydown', 'touchend'].forEach(ev => addEventListener(ev, kickMusic, true));
requestAnimationFrame(frame);

// Exposed for debugging and automated play-testing in the console
window.__pig = {
  get state() { return state; }, get pig() { return pig; }, get items() { return items; }, get objs() { return objs; },
  get save() { return save; }, get music() { return music; }, get camY() { return camY; }, set hitboxes(v) { showHitboxes = v; }, startLevel, showMap, LEVELS: ALL_LEVELS, AREAS, HATS, WINGS, FX, keys, update, render, openShop,
  // Automated play-testing: freezes save data (coins/eggs/bests) and sound until switched off
  testMode(on) {
    if (on && !noPersist) testSave = JSON.stringify(save);
    if (!on && noPersist && testSave) save = JSON.parse(testSave);
    noPersist = on; testMuted = on; syncMusic();
  },
  // Draws every hat on a pig into a canvas (handy for tuning hat fit): document.body.append(__pig.hatSheet())
  hatSheet() {
    const c = document.createElement('canvas'), cols = 9, cell = 110;
    c.width = cols * cell; c.height = Math.ceil(HATS.length / cols) * cell;
    c.style.cssText = 'position:fixed;inset:0;z-index:99;background:#cfeaff';
    ctx = c.getContext('2d');
    HATS.forEach((h, i) => { drawPig((i % cols) * cell + 50, Math.floor(i / cols) * cell + 70, 0, 1, 1.6, false, 1, { hat: h.id }); ctx.fillStyle = '#000'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(h.id, (i % cols) * cell + 55, Math.floor(i / cols) * cell + 106); });
    ctx = mainCtx;
    return c;
  },
  snap: () => ({ pig: { ...pig }, levelT, camX, state, runEggs, runCoins, objs: objs.map(o => ({ ...o })), got: items.map(i => !!i.got) }),
  // Level solver for testing a level: await __pig.solve('beach-2'). Searches flap/boost choices every 0.05s.
  //   boost: false  -> proves a level NEEDS boost (it should fail)
  //   eggs: false   -> only checks the level can be finished
  // Resolves to { ok, eggs, x } (x = how far the best attempt got). Turns test mode on (no saving, no sound).
  async solve(id, { boost = true, eggs = true, beam = 320 } = {}) {
    const P = window.__pig; P.testMode(true);
    startLevel(id);
    const eggXs = items.filter(i => i.t === 'egg').map(i => i.x), all = (1 << eggXs.length) - 1;
    const acts = boost ? [[0, 0], [1, 0], [0, 1], [1, 1]] : [[0, 0], [1, 0]];
    let states = [P.snap()], far = 0, n = 0;
    for (;;) {
      const next = new Map();
      for (const s of states) for (const [up, bo] of acts) {
        P.restore(s); keys.up = !!up; keys.boost = !!bo;
        for (let k = 0; k < 6 && state === 'playing'; k++) update(STEP);
        if (state === 'win') { if (!eggs || (runEggs & all) === all) { keys.up = keys.boost = false; return { ok: true, eggs: runEggs, x: Math.round(pig.x) }; } continue; }
        if (state !== 'playing') continue;
        if (eggs && eggXs.some((ex, i) => pig.x > ex + 40 && !(runEggs & (1 << i)))) continue;
        const key = `${Math.round(pig.x / 30)},${Math.round(pig.y / 6)},${Math.round(pig.vy / 90)}`;
        if (!next.has(key)) next.set(key, P.snap());
      }
      if (!next.size) { keys.up = keys.boost = false; return { ok: false, eggs: states[0] ? states[0].runEggs : 0, x: Math.round(far) }; }
      states = [...next.values()];
      // keep the ones furthest ahead plus a random spread of the rest
      if (states.length > beam) {
        states.sort((a, b) => b.pig.x - a.pig.x);
        const keep = states.slice(0, beam >> 1), rest = states.slice(beam >> 1);
        for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
        states = keep.concat(rest.slice(0, beam - keep.length));
      }
      far = Math.max(far, states[0].pig.x);
      if (++n % 15 === 0) await new Promise(r => setTimeout(r, 0));
    }
  },
  restore: d => {
    pig = { ...d.pig }; levelT = d.levelT; camX = d.camX; state = d.state; runEggs = d.runEggs; runCoins = d.runCoins; particles = [];
    d.objs.forEach((o, i) => Object.assign(objs[i], o));
    d.got.forEach((g, i) => { items[i].got = g; });
  },
};

// For testing: index.html?level=city-3 jumps straight into that level, even if it's locked (nothing is saved)
{ const id = new URLSearchParams(location.search).get('level'); if (id && LEVEL_BY_ID[id]) { noPersist = true; startLevel(id); } }
