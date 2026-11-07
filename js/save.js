'use strict';
// Save data (localStorage). Level progress is keyed by level id, e.g. bests['farm-2'].
const SAVE_KEY = 'pigsfly-save';
let save = { v: 2, bests: {}, eggs: {}, opened: {}, coins: 0, owned: [], hat: null, wing: 'w:classic', fx: 'fx:none', volume: 0.7, mapAt: 'farm-1' };
try {
  const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  if (s && typeof s === 'object') save = Object.assign(save, s);
  else save.bests = JSON.parse(localStorage.getItem('pigsfly-best') || '{}') || {};
} catch (e) {}
// Saves from before the overworld keyed levels by list position (0-5). Those were the six farm levels.
function migrateSave(s) {
  for (const k of ['bests', 'eggs']) {
    const o = s[k] || (s[k] = {});
    for (const key of Object.keys(o)) {
      if (!/^\d+$/.test(key)) continue;
      const id = 'farm-' + (Number(key) + 1);
      if (o[id] == null) o[id] = o[key];
      delete o[key];
    }
  }
  s.v = 2;
}
migrateSave(save);
// Areas you've opened stay open. Saves from before this opened Bacon Bay with Hamlet Farms cleared + 8 eggs.
if (!save.opened || typeof save.opened !== 'object') {
  save.opened = {};
  const farm = ALL_LEVELS.filter(L => L.area.id === 'farm'), eggs = Object.values(save.eggs).reduce((n, m) => n + bits(m), 0);
  if (farm.every(L => save.bests[L.id]) && eggs >= 8) save.opened.beach = true;
}
let noPersist = false, testSave = null;
function persist() { if (noPersist) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
if (!WING_BY_ID[save.wing]) save.wing = 'w:classic';
if (!FX_BY_ID[save.fx]) save.fx = 'fx:none';
if (!LEVEL_BY_ID[save.mapAt]) save.mapAt = ALL_LEVELS[0].id;
const myLook = () => ({ hat: save.hat, wing: save.wing, fx: save.fx });
