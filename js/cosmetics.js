'use strict';
// Shop items: hats (PNG files), wings and effects (drawn in code).
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

// ---------- Wings (drawn in code; one wing, shoulder at origin, reaching up-left ~36px) ----------
const WING_PATHS = {
  feather: new Path2D('M0 0 Q-10 -28 -32 -30 Q-22 -21 -27 -15 Q-16 -11 -19 -4 Q-8 -4 0 0Z'),
  membrane: new Path2D('M0 0 L-10 -24 L-36 -30 Q-28 -22 -27 -12 Q-20 -14 -16 -6 Q-9 -8 -4 2Z'),
  bflyTop: new Path2D('M0 0 C-6 -30 -34 -38 -37 -24 C-38 -14 -20 -8 0 0Z'),
  bflyLow: new Path2D('M0 0 C-14 -2 -23 4 -19 10 C-13 14 -4 7 0 0Z'),
  paper: new Path2D('M0 0 L-37 -31 L-17 -7Z'),
  paperFold: new Path2D('M0 0 L-17 -7 L-25 -1Z'),
  crystal: new Path2D('M0 0 L-6 -26 L-16 -20 L-30 -35 L-27 -17 L-37 -15 L-20 -6 L-22 1Z'),
};
WING_PATHS.insect = new Path2D(); WING_PATHS.insect.ellipse(-16, -17, 21, 7, 0.8, 0, Math.PI * 2);
WING_PATHS.insect2 = new Path2D(); WING_PATHS.insect2.ellipse(-13, -6, 14, 5, 0.32, 0, Math.PI * 2);
const RAINBOW = ['#ff5a5a', '#ffa94d', '#ffe14d', '#6ee26e', '#5ab4ff', '#b07cff'];
const WINGS = [
  { id: 'w:classic', name: 'Cherub Classics', price: 0, style: 'feather', c: ['#ffffff', '#f4f4ff'], edge: '#b9b9d6', desc: 'The original. Angelic. Ham-gelic.' },
  { id: 'w:pigeon', name: 'Pig-eon Wings', price: 60, style: 'feather', c: ['#b4bdcb', '#7d8899'], edge: '#5b6475', bar: '#454d5c', desc: 'Coo coo ca-choo. Strictly park-bench chic.' },
  { id: 'w:paper', name: 'Origami Oinker', price: 60, style: 'paper', desc: 'Hand-folded. Do not fly in the rain. (You will.)' },
  { id: 'w:bee', name: 'Bee-con Buzzers', price: 100, style: 'insect', flap: 2.6, c: ['rgba(225,245,255,0.75)', 'rgba(255,255,255,0.35)'], edge: 'rgba(100,130,160,0.9)', desc: 'Bzzz-oink. They flap really, really fast.' },
  { id: 'w:butterfly', name: 'Butter-fly Pork', price: 100, style: 'butterfly', c: ['#ff9ad5', '#9a6cff'], edge: '#4a2160', desc: 'Pan-fried in pure elegance.' },
  { id: 'w:bat', name: 'Hog-ula Bat Wings', price: 160, style: 'membrane', c: ['#6a3e82', '#3a1f4c'], edge: '#24122f', bone: '#24122f', desc: 'I vant to suck... on some mud.' },
  { id: 'w:fairy', name: 'Fairy Hogmother', price: 160, style: 'insect', flap: 1.5, c: ['rgba(255,180,240,0.75)', 'rgba(160,225,255,0.75)'], edge: '#ffffff', sparkle: true, desc: 'Bibbidi-bobbidi-BOAR.' },
  { id: 'w:bone', name: 'Bone-in Wings', price: 160, style: 'bone', desc: 'Like a bone-in ham, but airborne. Spooky.' },
  { id: 'w:ice', name: 'Ice-Cold Cuts', price: 250, style: 'crystal', desc: 'Keeps your ham fresh at any altitude.' },
  { id: 'w:robo', name: 'Robo-Rind Jets', price: 250, style: 'robo', desc: 'Beep boop. Pork-tron 3000 online.' },
  { id: 'w:dragon', name: 'Draggin\' Bacon', price: 250, style: 'membrane', c: ['#ff6a3d', '#b52a17'], edge: '#1f5e2a', bone: '#2e8b3e', claw: true, desc: 'Breathes fire. Smells delicious about it.' },
  { id: 'w:rainbow', name: 'Rainbow Rasher', price: 250, style: 'feather', rainbow: true, edge: '#ffffff', desc: 'Every color of the ham-bow.' },
  { id: 'w:phoenix', name: 'Phoenix Pork Belly', price: 400, style: 'feather', c: ['#ffe066', '#ff4a1c'], edge: '#b8260f', glow: '#ff8a2a', desc: 'Rose from the ashes of a backyard BBQ.' },
  { id: 'w:gold', name: '24-Carat Crackling', price: 500, eggs: 12, style: 'feather', c: ['#fff3a0', '#d99a00'], edge: '#8a5a00', glow: '#ffd84a', shine: true, desc: 'Solid gold. Golden eggs not included (but required).' },
];
const WING_BY_ID = {};
for (const w of WINGS) WING_BY_ID[w.id] = w;

function wingGrad(a, b) { const g = ctx.createLinearGradient(0, 0, -34, -30); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
function bones(segs, col, lw) {
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const s of segs) { ctx.beginPath(); ctx.moveTo(s[0], s[1]); for (let i = 2; i < s.length; i += 2) ctx.lineTo(s[i], s[i + 1]); ctx.stroke(); }
}
function drawWing(w, back) {
  const P = WING_PATHS;
  ctx.save();
  if (back) ctx.globalAlpha *= 0.92;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (w.glow) { ctx.shadowColor = w.glow; ctx.shadowBlur = 10; }
  let shade = null;
  switch (w.style) {
    case 'feather': {
      if (w.rainbow) { const g = ctx.createLinearGradient(0, 0, -34, -30); RAINBOW.forEach((c, i) => g.addColorStop(i / (RAINBOW.length - 1), c)); ctx.fillStyle = g; }
      else ctx.fillStyle = wingGrad(w.c[0], w.c[1]);
      ctx.fill(P.feather); ctx.shadowBlur = 0;
      ctx.strokeStyle = w.edge; ctx.lineWidth = 1.5; ctx.stroke(P.feather);
      if (w.bar) { ctx.strokeStyle = w.bar; ctx.lineWidth = 2; line(-13, -15, -23, -21); line(-9, -7, -17, -11); }
      if (w.shine) { ctx.strokeStyle = `rgba(255,255,255,${0.55 + 0.35 * Math.sin(clock * 5)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-5, -6); ctx.quadraticCurveTo(-11, -20, -24, -25); ctx.stroke(); }
      if (w.glow && !w.shine) { ctx.strokeStyle = 'rgba(255,240,150,0.8)'; ctx.lineWidth = 1.5; line(-6, -5, -20, -22); }
      shade = P.feather; break;
    }
    case 'membrane': {
      ctx.fillStyle = wingGrad(w.c[0], w.c[1]); ctx.fill(P.membrane);
      ctx.strokeStyle = w.edge; ctx.lineWidth = 1.5; ctx.stroke(P.membrane);
      bones([[0, 0, -10, -24, -36, -30], [-10, -24, -27, -12], [-10, -24, -16, -6]], w.bone, 2.4);
      if (w.claw) { ctx.fillStyle = '#f4efe0'; ctx.beginPath(); ctx.moveTo(-9, -25); ctx.lineTo(-6, -31); ctx.lineTo(-12, -26); ctx.closePath(); ctx.fill(); }
      shade = P.membrane; break;
    }
    case 'butterfly': {
      ctx.fillStyle = wingGrad(w.c[0], w.c[1]); ctx.fill(P.bflyTop);
      ctx.fillStyle = w.c[1]; ctx.fill(P.bflyLow);
      ctx.strokeStyle = w.edge; ctx.lineWidth = 2; ctx.stroke(P.bflyTop); ctx.stroke(P.bflyLow);
      ctx.fillStyle = '#fff'; for (const [dx, dy, r] of [[-31, -25, 2.2], [-25, -30, 1.6], [-33, -18, 1.4], [-14, 6, 1.6]]) { circle(dx, dy, r); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ellipse(-18, -18, 7, 4); ctx.fill();
      shade = P.bflyTop; break;
    }
    case 'insect': {
      ctx.fillStyle = wingGrad(w.c[0], w.c[1]);
      ctx.fill(P.insect2); ctx.fill(P.insect);
      ctx.strokeStyle = w.edge; ctx.lineWidth = 1.2; ctx.stroke(P.insect2); ctx.stroke(P.insect);
      ctx.strokeStyle = w.sparkle ? 'rgba(255,255,255,0.8)' : 'rgba(100,130,160,0.5)'; ctx.lineWidth = 0.8;
      line(-2, -2, -29, -30); line(-12, -12, -22, -14); line(-3, -2, -24, -9);
      if (w.sparkle) {
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 4; i++) { const tw = 0.5 + 0.5 * Math.sin(clock * 9 + i * 1.9); circle(-8 - i * 6, -9 - i * 5 + (i % 2) * 6, 0.6 + tw * 1.2); ctx.fill(); }
      }
      break;
    }
    case 'paper': {
      ctx.fillStyle = '#fdfdfd'; ctx.fill(P.paper);
      ctx.fillStyle = '#dbe3ee'; ctx.fill(P.paperFold);
      ctx.strokeStyle = '#8c9ab0'; ctx.lineWidth = 1.2; ctx.stroke(P.paper); ctx.stroke(P.paperFold);
      ctx.strokeStyle = 'rgba(90,150,230,0.45)'; ctx.lineWidth = 0.8; line(-8, -7, -27, -23); line(-12, -6, -31, -24);
      shade = P.paper; break;
    }
    case 'crystal': {
      ctx.shadowColor = '#bfefff'; ctx.shadowBlur = 8;
      ctx.fillStyle = wingGrad('#f0fdff', '#6cc0f0'); ctx.fill(P.crystal); ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4; ctx.stroke(P.crystal);
      ctx.strokeStyle = 'rgba(80,160,220,0.6)'; ctx.lineWidth = 1; line(0, 0, -16, -20); line(0, 0, -27, -17); line(-16, -20, -27, -17); line(-6, -26, -16, -20);
      shade = P.crystal; break;
    }
    case 'bone': {
      const segs = [[0, 0, -10, -24, -34, -30], [-10, -24, -26, -13], [-10, -24, -17, -4]];
      bones(segs, '#7d725e', 6); bones(segs, '#f6f1e2', 3.6);
      ctx.fillStyle = '#f6f1e2'; ctx.strokeStyle = '#7d725e'; ctx.lineWidth = 1;
      for (const [dx, dy] of [[-34, -30], [-26, -13], [-17, -4]]) { circle(dx, dy, 2.6); ctx.fill(); ctx.stroke(); }
      break;
    }
    case 'robo': {
      for (let i = 2; i >= 0; i--) {
        const L = 36 - i * 7;
        ctx.save(); ctx.rotate(0.38 + i * 0.34);
        const g = ctx.createLinearGradient(0, -4, 0, 4); g.addColorStop(0, '#e8eef5'); g.addColorStop(1, '#8796a8');
        ctx.fillStyle = g; rrect(-L, -4, L, 8, 3); ctx.fill();
        ctx.strokeStyle = '#3d4a5a'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = '#3d4a5a'; circle(-L + 5, 0, 1.2); ctx.fill(); circle(-6, 0, 1.2); ctx.fill();
        ctx.fillStyle = i === 0 ? `rgba(80,230,255,${0.6 + 0.4 * Math.sin(clock * 10)})` : '#5a6a7a'; circle(-L + 1.5, 0, 1.6); ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#5a6a7a'; circle(0, 0, 4); ctx.fill();
      break;
    }
  }
  if (back && shade) { ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(40,20,70,0.14)'; ctx.fill(shade); }
  ctx.restore();
}

// ---------- Effects (trails + auras) ----------
// make(x, y, src) returns one particle; k = what to draw. Everything is purely cosmetic.
const FX = [
  { id: 'fx:none', name: 'Plain Pork', price: 0, icon: '🐖', desc: 'No frills. Just a pig, flying. As nature intended.' },
  { id: 'fx:smoke', name: 'Smoked Ham', price: 50, icon: '💨', rate: 24, desc: 'Hickory-smoked, mid-flight.',
    make: (x, y) => ({ k: 'smoke', x, y: y + rand(-4, 10), vx: rand(-30, 10), vy: rand(-40, -10), life: 0.9, size: rand(5, 8), col: pick(['#d4d4dc', '#b9b9c4', '#e8e8ee']) }) },
  { id: 'fx:bubbles', name: 'Hog Wash Bubbles', price: 60, icon: '🧼', rate: 16, desc: 'Squeaky clean. For about four seconds.',
    make: (x, y) => ({ k: 'bubble', x, y: y + rand(-14, 14), vx: rand(-40, 0), vy: rand(-50, -15), life: rand(1, 1.6), size: rand(4, 9), wob: rand(0, 6) }) },
  { id: 'fx:hearts', name: 'Hog & Kisses', price: 80, icon: '💕', rate: 14, desc: 'Love is in the air. So is the pig.',
    make: (x, y) => ({ k: 'heart', x, y: y + rand(-12, 12), vx: rand(-30, 10), vy: rand(-60, -25), life: 1.1, size: rand(7, 11), col: pick(['#ff5c8a', '#ff8fb0', '#ff3d6e', '#ffb3c8']), rot: rand(-0.4, 0.4) }) },
  { id: 'fx:sparkles', name: 'Pink Pork Sparkles', price: 100, icon: '✨', rate: 26, desc: 'Sparkle like the fabulous ham you are.',
    make: (x, y) => ({ k: 'star4', x: x + rand(-10, 10), y: y + rand(-18, 18), vx: rand(-20, 20), vy: rand(-20, 20), life: rand(0.5, 0.9), size: rand(4, 8), col: pick(['#ff7ab8', '#ffb3d9', '#ffffff', '#ff4fa3']), rot: rand(0, 1), vr: rand(-3, 3) }) },
  { id: 'fx:glitter', name: 'Glam-bon Glitter', price: 120, icon: '🎇', rate: 70, desc: 'You will be finding this in the barn for years.',
    make: (x, y) => ({ k: 'glint', x: x + rand(-14, 8), y: y + rand(-18, 18), vx: rand(-40, 20), vy: rand(-30, 10), g: 90, life: rand(0.5, 1), size: rand(1.5, 3), hue: rand(0, 360), rot: rand(0, 3), vr: rand(-8, 8) }) },
  { id: 'fx:notes', name: 'Hog Wild Tunes', price: 120, icon: '🎵', rate: 9, desc: 'Ham-mering out the hits. Oink-oink-ba-doink.',
    make: (x, y) => ({ k: 'note', x, y: y + rand(-14, 6), vx: rand(-40, -10), vy: rand(-60, -30), life: 1.3, size: rand(14, 20), txt: pick(['♪', '♫', '♬']), col: pick(['#ff6f9c', '#7a5cff', '#2fb4ff', '#ffb400']), wob: rand(0, 6) }) },
  { id: 'fx:confetti', name: 'Pig-nic Confetti', price: 150, icon: '🎊', rate: 30, desc: 'Every flight is a parade. You are the float.',
    make: (x, y) => ({ k: 'confetti', x, y: y + rand(-10, 10), vx: rand(-80, 40), vy: rand(-170, -40), g: 380, life: rand(0.9, 1.4), size: rand(4, 7), col: pick(RAINBOW), rot: rand(0, 6), vr: rand(-10, 10) }) },
  { id: 'fx:snow', name: 'Snow Hog', price: 150, icon: '❄️', rate: 20, desc: 'Let it snow, let it snow, let it oink.',
    make: (x, y) => ({ k: 'flake', x: x + rand(-8, 8), y: y + rand(-16, 16), vx: rand(-25, 15), vy: rand(20, 60), life: rand(1, 1.5), size: rand(3.5, 6), rot: rand(0, 1), vr: rand(-2, 2) }) },
  { id: 'fx:bacon', name: 'Bacon Bits', price: 160, icon: '🥓', rate: 9, desc: 'A little too on the nose? Never.',
    make: (x, y) => ({ k: 'bacon', x, y, vx: rand(-90, 20), vy: rand(-220, -80), g: 700, life: 1.1, size: 1, rot: rand(0, 6), vr: rand(-9, 9) }) },
  { id: 'fx:stars', name: 'Ham-azing Stars', price: 160, icon: '⭐', rate: 18, desc: 'A star is born. A pork star.',
    make: (x, y) => ({ k: 'star5', x, y: y + rand(-14, 14), vx: rand(-60, 10), vy: rand(-50, 50), life: rand(0.7, 1.1), size: rand(5, 9), col: pick(['#ffe14d', '#fff3a0', '#ffc93c']), rot: rand(0, 6), vr: rand(-4, 4) }) },
  { id: 'fx:fire', name: 'Hot Hog Flames', price: 250, icon: '🔥', rate: 55, aura: 'fire', desc: 'Sizzling. Literally. Please don\'t lick the screen.',
    make: (x, y) => ({ k: 'flame', x: x + rand(-6, 14), y: y + rand(-14, 8), vx: rand(-90, -30), vy: rand(-110, -40), life: rand(0.35, 0.6), size: rand(4, 8) }) },
  { id: 'fx:zap', name: 'Thunder Thighs', price: 250, icon: '⚡', rate: 24, aura: 'zap', desc: 'One million volts of pure pork power.',
    make: (x, y) => ({ k: 'spark', x: x + rand(-4, 16), y: y + rand(-16, 14), vx: rand(-160, 60), vy: rand(-160, 160), life: rand(0.15, 0.3), size: 2 }) },
  { id: 'fx:money', name: 'Piggy Bank Rain', price: 250, icon: '💰', rate: 12, desc: 'Make it rain. (The coins aren\'t real. Sorry.)',
    make: (x, y) => ({ k: 'coin', x, y, vx: rand(-70, 30), vy: rand(-180, -60), g: 650, life: 1.2, size: rand(4, 5.5) }) },
  { id: 'fx:rainbow', name: 'Rainbow Rasher Trail', price: 300, icon: '🌈', rate: 120, desc: 'Somewhere over the ham-bow.',
    make: (x, y) => ({ k: 'rainbow', x: x - 6, y: y + 2, life: 0.55, size: 1 }) },
  { id: 'fx:ghost', name: 'Hog-ographic Echo', price: 300, icon: '👻', rate: 14, desc: 'Moving so fast you leave yourself behind.',
    make: (x, y, s) => ({ k: 'ghost', x: x + 14, y, life: 0.35, size: 1, ang: s.ang, flap: s.flap, look: { hat: s.look.hat, wing: s.look.wing } }) },
  { id: 'fx:halo', name: 'Holy Ham Halo', price: 500, eggs: 15, icon: '😇', rate: 16, aura: 'halo', desc: 'Pure as the driven snout. Blessed be the bacon.',
    make: (x, y) => ({ k: 'star4', x: x + rand(-14, 14), y: y + rand(-20, 16), vx: rand(-30, 10), vy: rand(-30, 10), life: rand(0.5, 0.9), size: rand(3, 6), col: pick(['#fff3a0', '#ffe14d', '#ffffff']), rot: 0, vr: rand(-2, 2) }) },
];
const FX_BY_ID = {};
for (const f of FX) FX_BY_ID[f.id] = f;

const trail = { list: [], acc: 0 }, menuTrail = { list: [], acc: 0 }, pvTrail = { list: [], acc: 0 };
function emitFx(sys, id, x, y, dt, src, drift = 0) {
  const e = FX_BY_ID[id];
  if (!e || !e.make) { sys.acc = 0; return; }
  sys.acc += e.rate * dt;
  while (sys.acc >= 1) {
    sys.acc--;
    const p = e.make(x, y, src);
    p.vx = (p.vx || 0) + drift; p.vy = p.vy || 0; p.g = p.g || 0; p.max = p.life; p.size0 = p.size;
    if (sys.list.length < 500) sys.list.push(p);
  }
}
function stepFx(sys, dt) {
  for (const p of sys.list) { p.life -= dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.vr) p.rot += p.vr * dt; }
  if (sys.list.length && sys.list[0].life <= 0) sys.list = sys.list.filter(p => p.life > 0);
}
function starPath(r, inner, n) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? inner : r, a = -Math.PI / 2 + i * Math.PI / n; i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath();
}
function heartPath(s) {
  ctx.beginPath(); ctx.moveTo(0, s * 0.4);
  ctx.bezierCurveTo(-s * 1.1, -s * 0.3, -s * 0.5, -s * 1.1, 0, -s * 0.45);
  ctx.bezierCurveTo(s * 0.5, -s * 1.1, s * 1.1, -s * 0.3, 0, s * 0.4);
  ctx.closePath();
}
function drawTrail(list, cam) {
  const base = ctx.globalAlpha;
  for (const p of list) {
    const a = clamp(p.life / p.max, 0, 1), s = p.size;
    ctx.save(); ctx.globalAlpha = base * a; ctx.translate(p.x - cam, p.y); if (p.rot) ctx.rotate(p.rot);
    switch (p.k) {
      case 'smoke': ctx.globalAlpha = base * a * 0.6; ctx.fillStyle = p.col; circle(0, 0, s + 12 * (1 - a)); ctx.fill(); break;
      case 'bubble':
        ctx.translate(Math.sin(clock * 4 + p.wob) * 3, 0);
        ctx.fillStyle = 'rgba(200,240,255,0.25)'; ctx.strokeStyle = 'rgba(120,200,255,0.9)'; ctx.lineWidth = 1.5;
        circle(0, 0, s); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(0, 0, s * 0.65, -2.6, -1.6); ctx.stroke(); break;
      case 'heart': ctx.fillStyle = p.col; heartPath(s); ctx.fill(); break;
      case 'star4': {
        const r = s * (0.6 + 0.4 * Math.sin(clock * 12 + s * 7));
        ctx.fillStyle = p.col; ctx.beginPath(); ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(0, 0, r, 0); ctx.quadraticCurveTo(0, 0, 0, r); ctx.quadraticCurveTo(0, 0, -r, 0); ctx.quadraticCurveTo(0, 0, 0, -r); ctx.fill(); break;
      }
      case 'glint': ctx.globalAlpha = base * a * (0.5 + 0.5 * Math.sin(clock * 20 + p.hue)); ctx.fillStyle = `hsl(${(p.hue + clock * 240) % 360},100%,72%)`; ctx.fillRect(-s, -s, s * 2, s * 2); break;
      case 'note':
        ctx.translate(Math.sin(clock * 5 + p.wob) * 4, 0);
        ctx.font = `bold ${s}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.strokeText(p.txt, 0, 0); ctx.fillStyle = p.col; ctx.fillText(p.txt, 0, 0); break;
      case 'confetti': ctx.scale(1, Math.cos(clock * 9 + s)); ctx.fillStyle = p.col; ctx.fillRect(-s / 2, -s / 4, s, s / 2); break;
      case 'flake':
        ctx.lineCap = 'round';
        for (const [col, lw] of [['rgba(120,180,240,0.8)', 3], ['#fff', 1.4]]) {
          ctx.strokeStyle = col; ctx.lineWidth = lw;
          for (let i = 0; i < 3; i++) { const an = i * Math.PI / 3, cx = Math.cos(an) * s, cy = Math.sin(an) * s; line(-cx, -cy, cx, cy); }
        }
        break;
      case 'bacon': {
        const pts = [[-7, 0], [-3.5, -2], [0, 0], [3.5, 2], [7, 0]];
        const path = () => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); };
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        path(); ctx.strokeStyle = '#7a1f14'; ctx.lineWidth = 6.5; ctx.stroke();
        path(); ctx.strokeStyle = '#d0503c'; ctx.lineWidth = 4.5; ctx.stroke();
        path(); ctx.strokeStyle = '#f7d9c4'; ctx.lineWidth = 1.3; ctx.stroke(); break;
      }
      case 'star5': starPath(s, s * 0.45, 5); ctx.fillStyle = p.col; ctx.fill(); ctx.strokeStyle = '#c88a00'; ctx.lineWidth = 1; ctx.stroke(); break;
      case 'flame':
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = a > 0.65 ? '#fff0a0' : a > 0.35 ? '#ffa030' : '#ff4a1c';
        circle(0, 0, s * (0.4 + 0.6 * a)); ctx.fill(); break;
      case 'spark':
        ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#cfefff'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        line(0, 0, -p.vx * 0.04, -p.vy * 0.04); break;
      case 'coin':
        ctx.scale(Math.cos(clock * 10 + s * 3), 1);
        ctx.fillStyle = '#b77d00'; circle(0, 0, s); ctx.fill(); ctx.fillStyle = '#ffd23f'; circle(0, 0, s - 1.4); ctx.fill(); break;
      case 'rainbow':
        ctx.globalAlpha = base * Math.min(1, a * 1.6) * 0.9;
        RAINBOW.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(-3, -9 + i * 3, 6, 3); }); break;
      case 'ghost': ctx.globalAlpha = base * a * 0.35; drawPig(0, 0, p.ang, p.flap, 1, true, 1, p.look); break;
    }
    ctx.restore();
  }
}
// Auras are drawn in pig space (body centre at 0,0, head at 18,-6), behind (front=false) or over the pig
function drawAura(kind, front, hat) {
  ctx.save();
  if (kind === 'fire') {
    if (!front) {
      const g = ctx.createRadialGradient(2, -4, 6, 2, -4, 46); g.addColorStop(0, 'rgba(255,150,40,0.5)'); g.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.fillStyle = g; circle(2, -4, 46); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 8; i++) {
        const bx = -26 + i * 7.5, by = -Math.sqrt(Math.max(0, 1 - (bx / 30) ** 2)) * 19 + 2, h = 15 + 7 * Math.sin(clock * 19 + i * 2.1);
        for (const [col, k] of [['rgba(255,80,20,0.75)', 1], ['rgba(255,200,60,0.8)', 0.6]]) {
          ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(bx - 5 * k, by);
          ctx.quadraticCurveTo(bx - 6 * k, by - h * 0.6 * k, bx - 4 - h * 0.55 * k, by - h * k);
          ctx.quadraticCurveTo(bx + 2 * k, by - h * 0.45 * k, bx + 5 * k, by); ctx.closePath(); ctx.fill();
        }
      }
    }
  } else if (kind === 'zap') {
    if (!front) {
      const g = ctx.createRadialGradient(4, -4, 8, 4, -4, 44); g.addColorStop(0, 'rgba(120,200,255,0.4)'); g.addColorStop(1, 'rgba(120,200,255,0)');
      ctx.fillStyle = g; circle(4, -4, 44); ctx.fill();
    } else {
      ctx.strokeStyle = '#eaf8ff'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.shadowColor = '#5cc8ff'; ctx.shadowBlur = 8;
      const n = Math.floor(clock * 14) % 3 === 0 ? 2 : 1;
      for (let j = 0; j < n; j++) {
        const a0 = Math.random() * Math.PI * 2, r0 = 22, r1 = 40;
        ctx.beginPath(); ctx.moveTo(4 + Math.cos(a0) * r0, -4 + Math.sin(a0) * r0 * 0.8);
        for (let k = 1; k <= 4; k++) { const rr = r0 + (r1 - r0) * k / 4, aa = a0 + rand(-0.35, 0.35); ctx.lineTo(4 + Math.cos(aa) * rr, -4 + Math.sin(aa) * rr * 0.8); }
        ctx.stroke();
      }
    }
  } else if (kind === 'halo') {
    if (!front) {
      const g = ctx.createRadialGradient(6, -6, 8, 6, -6, 52); g.addColorStop(0, 'rgba(255,240,150,0.55)'); g.addColorStop(1, 'rgba(255,230,120,0)');
      ctx.fillStyle = g; circle(6, -6, 52); ctx.fill();
    } else {
      const hy = (hat ? -62 : -38) + Math.sin(clock * 3) * 2;
      ctx.shadowColor = '#fff3a0'; ctx.shadowBlur = 10; ctx.strokeStyle = '#ffd84a'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.ellipse(17, hy, 13, 4, -0.1, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(17, hy, 13, 4, -0.1, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
    }
  }
  ctx.restore();
}

