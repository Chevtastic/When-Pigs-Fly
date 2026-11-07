'use strict';
// The Ham-berdashery: hats, wings and effects tabs.
// ---------- Shop ----------
const pvCanvas = $('preview'), pvCtx = pvCanvas.getContext('2d');
pvCanvas.width = pvCanvas.height = 260 * dpr;
let shopTab = 'hats', pvLast = 0;
const SHOP = {
  hats: { list: HATS, by: HAT_BY_ID, key: 'hat', none: true, on: 'Wearing', equip: 'Wear it', equipped: 'Wearing it!', owned: 'Already in your hog closet.' },
  wings: { list: WINGS, by: WING_BY_ID, key: 'wing', on: 'Flapping', equip: 'Strap them on', equipped: 'Flapping away!', owned: 'Already in your wing-drobe.' },
  fx: { list: FX, by: FX_BY_ID, key: 'fx', on: 'Active', equip: 'Turn it on', equipped: 'Looking fab-ulous!', owned: 'Already in your sparkle stash.' },
};
const shopLook = () => ({ hat: shopSel.hats, wing: shopSel.wings, fx: shopSel.fx });
function drawPreview() {
  const dt = clamp(clock - pvLast, 0, 0.05); pvLast = clock;
  ctx = pvCtx;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, 260, 260);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; drawCloud(20, 60, 0.9); drawCloud(180, 200, 0.7);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ellipse(130, 230, 60, 9); ctx.fill();
  const look = shopLook(), by = Math.sin(clock * 2.2) * 3.4, flap = clock * 14;
  ctx.save(); ctx.translate(132, 150); ctx.scale(2.6, 2.6);
  emitFx(pvTrail, look.fx, -14, by, dt, { ang: -0.05, flap, look }, -150);
  stepFx(pvTrail, dt);
  drawTrail(pvTrail.list, 0);
  drawPig(0, by, -0.05, flap, 1, true, 1, look);
  ctx.restore();
  ctx = mainCtx;
}
// Wing thumbnails are drawn once into little canvases
const wingThumbs = {};
function wingThumb(w) {
  if (wingThumbs[w.id]) return wingThumbs[w.id];
  const c = document.createElement('canvas'); c.width = c.height = 120;
  const prev = ctx; ctx = c.getContext('2d');
  const saved = clock; clock = 0;
  ctx.translate(84, 92); ctx.scale(2, 2);
  ctx.save(); ctx.translate(4, 2); ctx.rotate(-0.55); drawWing(w, true); ctx.restore();
  ctx.save(); ctx.rotate(-0.05); drawWing(w, false); ctx.restore();
  clock = saved; ctx = prev;
  return (wingThumbs[w.id] = c.toDataURL());
}
function itemStatus(it) {
  if (!it || !it.price) return { owned: true };
  const owned = save.owned.includes(it.id);
  const needEggs = it.eggs && totalEggs() < it.eggs ? it.eggs - totalEggs() : 0;
  return { owned, needEggs, short: Math.max(0, it.price - save.coins) };
}
function buildShop() {
  $('shopCoins').textContent = save.coins;
  $('shopEggs').textContent = `${totalEggs()}/${TOTAL_EGGS}`;
  document.querySelectorAll('.shopTabs .tab').forEach(t => { const on = t.dataset.tab === shopTab; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
  const cat = SHOP[shopTab], grid = $('hatGrid'); grid.innerHTML = '';
  const all = cat.none ? [null, ...cat.list] : cat.list;
  for (const it of all) {
    const id = it ? it.id : null, st = itemStatus(it), cur = save[cat.key] === id;
    const b = document.createElement('button');
    b.className = 'hat' + (st.owned ? ' owned' : '') + (cur ? ' equipped' : '') + (shopSel[shopTab] === id ? ' sel' : '') + (!st.owned && (st.short || st.needEggs) ? ' cant' : '');
    const label = it ? it.name : 'Au naturel';
    const price = cur ? cat.on : !it || !it.price ? 'Free' : st.owned ? 'Owned' : st.needEggs ? `🔒 ${it.eggs} eggs` : `<i class="coin"></i>${it.price}`;
    const thumb = !it ? `<span class="none">🐷</span>`
      : shopTab === 'hats' ? `<img src="${it.img.src}" alt="" draggable="false">`
      : shopTab === 'wings' ? `<img src="${wingThumb(it)}" alt="" draggable="false">`
      : `<span class="none fxIcon">${it.icon}</span>`;
    b.innerHTML = thumb + `<span>${label}</span><span class="price">${price}</span>`;
    b.onclick = () => { shopSel[shopTab] = id; buildShop(); };
    grid.appendChild(b);
  }
  updatePreviewPanel();
}
function updatePreviewPanel() {
  const cat = SHOP[shopTab], sel = shopSel[shopTab], it = cat.by[sel] || null, st = itemStatus(it), btn = $('pvBtn');
  const desc = it && it.desc;
  $('pvName').textContent = it ? it.name : 'Au naturel';
  btn.disabled = false;
  if (save[cat.key] === sel) { btn.textContent = cat.equipped; btn.disabled = true; $('pvDesc').textContent = desc || (it ? 'Looking sharp, hog.' : 'Just you and your snout.'); }
  else if (st.owned) { btn.textContent = cat.equip; $('pvDesc').textContent = desc || cat.owned; }
  else if (st.needEggs) { btn.textContent = `Need ${st.needEggs} more golden eggs`; btn.disabled = true; $('pvDesc').textContent = `Unlocks with ${it.eggs} golden eggs.`; }
  else if (st.short) { btn.innerHTML = `<i class="coin"></i> ${it.price}`; btn.disabled = true; $('pvDesc').textContent = `${st.short} more coins. Keep hogging them!`; }
  else { btn.innerHTML = `Buy for <i class="coin"></i> ${it.price}`; $('pvDesc').textContent = desc || 'Try before you buy. Swine-dow shopping!'; }
}
$('pvBtn').onclick = () => {
  const cat = SHOP[shopTab], sel = shopSel[shopTab], it = cat.by[sel] || null, st = itemStatus(it);
  if (!st.owned) {
    if (st.needEggs || st.short) { sfx.nope(); return; }
    save.coins -= it.price; save.owned.push(it.id); sfx.buy();
  } else oinkLite(0);
  save[cat.key] = sel;
  persist(); buildShop();
};
document.querySelectorAll('.shopTabs .tab').forEach(t => t.onclick = () => {
  if (shopTab === t.dataset.tab) return;
  shopTab = t.dataset.tab; oinkLite(0); buildShop(); $('hatGrid').scrollTop = 0;
});
function openShop(from) {
  shopFrom = from; shopOpen = true;
  shopSel = { hats: save.hat, wings: save.wing, fx: save.fx };
  pvTrail.list = []; pvLast = clock;
  ['menu', 'map', 'area', 'win'].forEach(id => $(id).classList.add('hidden'));
  $('shop').classList.remove('hidden');
  buildShop();
  $('hatGrid').scrollTop = 0;
}
function closeShop() {
  shopOpen = false; $('shop').classList.add('hidden');
  if (shopFrom === 'win' && state === 'win') showWin(); else if (shopFrom === 'map') showMap(); else if (shopFrom === 'area') showArea(map.area); else showMenu();
}
