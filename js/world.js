'use strict';
// The island: areas, their levels and the rules for unlocking them.
//
// Each area lives in its own file in js/areas/ and calls addArea({...}):
//   id, name, icon, blurb, color   shown on the island and the area screen
//   (where each area sits on the island is set in overworld.js)
//   levels: [{ id, name, theme, speed, end, build() }, ...]
// Level ids (e.g. 'farm-3') are what the save file uses, so never rename one once it ships.
// (AREAS and addArea() are defined in hazards.js so area files can load before this one)

// Areas still to come. Once an area file exists for one of these ids, that file wins.
const AREA_PLAN = [
  { id: 'farm', icon: '🐷' },
  { id: 'beach', icon: '🏖️', name: 'Bacon Bay', blurb: 'Sun, sand and snapping crabs. Surf\'s up, ham!', color: '#f2d38a' },
  { id: 'city', icon: '🌃', name: 'Pork-topia 2099', blurb: 'Neon lasers, speed cameras and the Pork Patrol.', color: '#7a3cff' },
  { id: 'mountain', icon: '🏔️', name: 'Mount Snoutmore', blurb: 'Avalanches, eagles and very cold trotters.', color: '#e8f2ff' },
  { id: 'clouds', icon: '☁️', name: 'Hog Heaven', blurb: 'Where pigs truly fly. Mind the lightning.', color: '#fff6c8' },
];

let ALL_LEVELS = [], LEVEL_BY_ID = {}, TOTAL_EGGS = 0;
(function finishAreas() {
  const built = Object.fromEntries(AREAS.map(a => [a.id, a]));
  AREAS.length = 0;
  for (const plan of AREA_PLAN) AREAS.push(built[plan.id] ? { ...plan, ...built[plan.id] } : { ...plan, levels: [] });
  for (const a of AREAS) {
    a.levels.forEach((L, i) => { L.area = a; L.num = i + 1; ALL_LEVELS.push(L); LEVEL_BY_ID[L.id] = L; });
    a.soon = !a.levels.length;
  }
  TOTAL_EGGS = ALL_LEVELS.length * 3;
})();

const levelEggs = id => save.eggs[id] || 0;
const cleared = id => !!save.bests[id];
const totalEggs = () => ALL_LEVELS.reduce((n, L) => n + bits(levelEggs(L.id)), 0);
const areaEggs = a => a.levels.reduce((n, L) => n + bits(levelEggs(L.id)), 0);
const areaDone = a => a.levels.length > 0 && a.levels.every(L => cleared(L.id));
// An area opens once you've cleared the area before it and found UNLOCK_SHARE of that area's golden eggs
// (12 of 18). Once open it stays open (save.opened), even if the rule changes later.
const UNLOCK_SHARE = 2 / 3;
const prevArea = a => AREAS[AREAS.indexOf(a) - 1] || null;
const eggsToOpen = a => { const p = prevArea(a); return p ? Math.ceil(p.levels.length * 3 * UNLOCK_SHARE) : 0; };
// Why an area is closed: null if open, else { soon } or { prev, clear (still needs clearing), have, need (eggs from prev) }
function areaLock(a) {
  if (a.soon) return { soon: true };
  const prev = prevArea(a);
  if (!prev || save.opened[a.id]) return null;
  const need = eggsToOpen(a), have = Math.min(need, areaEggs(prev)), clear = !areaDone(prev);
  if (clear || have < need) return { prev, clear, have, need };
  save.opened[a.id] = true; // saved with the next persist()
  return null;
}
const areaOpen = a => !areaLock(a);
const levelOpen = L => areaOpen(L.area) && (L.num === 1 || cleared(L.area.levels[L.num - 2].id));
const nextInArea = L => L.area.levels[L.num] || null;
