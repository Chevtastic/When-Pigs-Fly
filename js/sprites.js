'use strict';
// Sprite art. The files in assets/sprites/ are made from the big source images by tools/sprites.py.
// Anything drawn with a sprite falls back to its old hand-drawn shape until the image has loaded.
const SPRITE_NAMES = ['castle', 'coconut', 'palm', 'palm_tall', 'palm_bg', 'palm_night', 'anemone', 'gull', 'crab'];
const SPR = {};
for (const n of SPRITE_NAMES) { const im = new Image(); im.src = `assets/sprites/${n}.png`; SPR[n] = im; }
// the image if it's ready to draw, else null
const spr = n => { const im = SPR[n]; return im && im.complete && im.naturalWidth ? im : null; };
// draw `im` into the box (x, y, w, h), optionally mirrored in place
function drawSpr(im, x, y, w, h, flipX = false, flipY = false) {
  if (!flipX && !flipY) { ctx.drawImage(im, x, y, w, h); return; }
  ctx.save(); ctx.translate(x + (flipX ? w : 0), y + (flipY ? h : 0)); ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.drawImage(im, 0, 0, w, h); ctx.restore();
}
