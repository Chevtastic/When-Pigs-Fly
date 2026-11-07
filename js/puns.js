'use strict';
// All the jokes. Hazard-specific death quips live with each hazard in hazards.js.
// ---------- Puns ----------
const QUIPS = ['Crispy!', 'Pork belly flop!', 'Extra crunchy.', 'Hamageddon!', 'Sizzle sizzle...', 'Breakfast is served.', 'Well done. Literally.',
  'That was a mis-steak.', 'Hogwash!', 'Bacon bits everywhere.', 'Snout of luck.', 'Better luck next swine.', 'Pulled pork, anyone?',
  'Hog-tied!', 'Swine-d up as sausage.', 'Oink-redibly unlucky.', 'Prosciutto la vista, baby.', 'Pigs might fly. That one didn\'t.',
  'You\'ve been ham-bushed!', 'Squeal of misfortune.', 'Sow sad.', 'Ham-pered by hazards.', 'Rasher decision.', 'That\'s the way the cookie crumbles... into croutons.'];
const CAUSE_QUIPS = {}; // filled in by defineHazard()
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
