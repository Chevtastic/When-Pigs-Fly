'use strict';
// Pork-topia 2099: the neon city on Snout Island's right cheek. Vertical levels with three planes: the SKY above the
// rooftops, the STREET (road + neon buildings) and the UNDERCITY (a grimy cavern under the street).
// The rules these levels follow are in docs/LEVEL_DESIGN.md.
//
// The area teaches the planes one at a time, then opens them up:
//   1. street only   2. undercity only   3. skytops only   4. all three (gentle)   5. all three, busier   6. finale
//
// Play any level directly (nothing is saved) with  index.html?level=city-3
const UNDER_FLOOR = GROUND + SLAB + GROUND; // the undercity floor: the cavern is as tall as the street level
const TUNNEL = 150;                       // street tunnel height through the towers

addArea({
  id: 'city', name: 'Pork-topia 2099', blurb: 'Neon lasers, robot drones and the Pork Patrol.',
  color: '#7a3cff',
  levels: [

  // ---------------------------------------------------------------------------------------------------------------
  // 1. STREET ONLY. A low ceiling (no sky, no undercity): hop the small and mid-size buildings, ride the tunnels
  // through the towers. The bike Enforcer shows up at the end; with nowhere else to go, BOOST is the escape.
  // It ends by sloping down into the undercity, where the mud spa waits on the cavern floor (level 2 starts there).
  {
    id: 'city-1', name: 'Neon Arrival', theme: 0, speed: 330, end: 10300,
    vert: true, top: 0, bottom: UNDER_FLOOR, spaY: UNDER_FLOOR,
    build() {
      const b = builder(this.speed);
      b.coins(300, 300, 6).bld('b_ramen', 800).arc(760, 260, 6, 60)
       .bld('b_nexus', 1500).coins(1450, 220, 5)
       .bld('b_orion', 2200, GROUND, TUNNEL).coins(2220, 400, 8)            // first tunnel: stay low
       .coins(2650, 380, 5, 40, -30)
       .bld('b_dome', 3000).egg(3200, 140).coins(2980, 200, 3)            // egg on the dome's roof
       .bld('b_arcology', 3700).coins(3740, 130, 6)
       .bld('b_skyscraper', 4500, GROUND, TUNNEL).coins(4520, 400, 10)
       .rail(5050, 440, 5450, 120)                                       // optional ride up to the Megacorp roof
       .bld('b_megacorp', 5600).egg(5780, 60).coins(5100, 300, 3)       // egg right under the ceiling
       .bld('b_corptower', 6400, GROUND, TUNNEL).coins(6420, 400, 12)
       .enforcer(6900, 8600, 1.3)                                         // the bike Enforcer: BOOST!
       .bld('b_ramen', 7400).coins(7380, 260, 5).egg(7650, 260)          // egg past the ramen shop, mid-chase
       .bld('b_fox', 7900, GROUND, TUNNEL).coins(7920, 400, 10)
      // the ending: the street drops away into the undercity and a girder slope eases you down to the spa
       .subway(8900, 11800).hole(9000, 2800, false, false, false)
       .ceilramp(8950, 0, 9950, UNDER_FLOOR - 250, 'rubble').coins(9000, 140, 9, 76, 100);
      return b;
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // 2. UNDERCITY ONLY. You start down in the cavern and stay there: weave over the standing buildings and under the
  // hanging ones, dodge the drones and the metro. At the end a slope lifts you out to the street and a neon skyway carries you on up
  // to the mud spa on a sky pad (level 3 starts up in the skytops).
  {
    id: 'city-2', name: 'Underbelly', theme: 0, speed: 335, end: 11000,
    vert: true, top: -600, bottom: UNDER_FLOOR, startY: GROUND + SLAB + 180, spaY: -230,
    build() {
      const b = builder(this.speed), F = UNDER_FLOOR;
      b.subway(-800, 9900).hole(9200, 700, false, true, false)
       .coins(300, 701, 8)
       .hang('h_platform', 800).coins(850, 917, 6)                        // first hanging one: stay low
       .bld('u_market', 1350, F).coins(1370, 676, 5)                       // first standing one: stay high
       .hang('h_industrial', 1800).coins(1810, 917, 4)
       .bld('u_facade', 2250, F).coins(2270, 664, 5)
       .drone(2950, 780).coins(2650, 780, 4)                               // first drone: change height when it flashes
       .hang('h_industrial', 3350).hang('h_market', 3700)                  // two hanging in a row
       .coins(3360, 936, 4).coins(3710, 917, 5)
       .egg(4100, 973)                                                     // egg on the tracks: mind the metro
       .bld('u_facade', 4400, F).bld('u_market', 4800, F)                  // two standing in a row
       .coins(4420, 664, 6).coins(4820, 676, 5)
       .hang('h_platform', 5300).bld('u_facade', 5850, F)                  // S-curve
       .coins(5350, 886, 6).coins(5870, 664, 5)
       .drone(6450, 900)
       .egg(6950, 571).coins(6800, 608, 3)                                 // egg right up under the street
       .hang('h_industrial', 7250).bld('u_market', 7700, F)
       .coins(7260, 917, 4).coins(7720, 676, 5)
       .drone(8150, 650)
       .hang('h_market', 8450).coins(8470, 917, 5).egg(8820, 967)       // duck under, then the egg on the floor
       .metro(-800, 8600, 6.5)
       .ramp(9000, F, 9860, 430).coins(9100, 850, 8, -67, 100)           // the way up and out...
       .ramp(9950, GROUND, 10910, -232, 'neon').coins(10000, 400, 9, -74, 100) // ...and on up the skyway
       .block(10900, 1000, -230, 40, 'pad');                                // the sky pad the spa sits on
      return b;
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // 3. SKYTOPS ONLY. Up above a smog bank (you can slide on it): tower spires poke up through it, Sky Living hangs
  // from the top, drones and gunships hunt you. The smog ends near the finish and you drop down to the mud spa.
  {
    id: 'city-3', name: 'Skytops', theme: 0, speed: 340, end: 10000,
    vert: true, top: -600, bottom: GROUND, startY: -250,
    build() {
      const b = builder(this.speed);
      b.smog(-800, 9000, -40)
       .coins(300, -250, 8).ad('sky', 400)                                  // no cruising along the very top
       .bld('b_orion', 1300).coins(1250, -380, 6)                          // a spire to hop
       .drone(2100, -300)
       .ad('sky', 2600).egg(2880, -290).coins(2650, -280, 5)               // under Sky Living
       .ad('cortexa', 3500, -400).egg(3740, -510).coins(3550, -500, 4)     // squeeze above Cortexa
       .drone(4200, -470)
       .bld('b_corptower', 4400).coins(4500, -300, 6)
       .block(5100, 380, -250, 18, 'deck').block(5600, 380, -250, 18, 'deck').coins(5150, -290, 8).ad('sky', 5300)
       .gunship(6100, -380)                                                // first gunship: watch it blink
       .ad('hogfuel', 6500, -500).coins(6550, -200, 5)
       .bld('b_skyscraper', 7000).ad('sky', 7550)
       .gunship(8000, -250).egg(8420, -540).coins(8200, -520, 4)
       .bld('b_fox', 8500).drone(8900, -350)
       .ad('sky', 9150).coins(9050, -120, 8, 50, 70);                                      // follow the coins down off the smog
      return b;
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // 4. ALL THREE, GENTLY. The first open level: holes (with their gate signs) join street and undercity, glass
  // decks join street and sky. One egg per plane, in order: undercity, street (in a tunnel), sky (near the end), so
  // all three fit in one run. The bike Enforcer patrols the street; duck under or climb to lose him.
  {
    id: 'city-4', name: 'Three-Way Junction', theme: 0, speed: 340, end: 11000,
    vert: true, top: -600, bottom: UNDER_FLOOR,
    build() {
      const b = builder(this.speed), F = UNDER_FLOOR;
      b.subway(1300, 10600)
       .hole(1400).hole(3000).hole(4600).hole(6400).hole(8000)
       .hole(9900, 700, false, true, false)
      // undercity
       .hang('h_platform', 1800).bld('u_facade', 2500, F)
       .coins(1850, 917, 6).coins(2540, 664, 6)
       .hang('h_market', 3300).bld('u_market', 3900, F)
       .coins(3350, 917, 5).coins(3940, 676, 6)
       .egg(4750, 967).coins(4900, 917, 5)                               // undercity egg, low under the hole
       .hang('h_industrial', 5200).bld('u_facade', 5800, F)
       .coins(5250, 936, 5).coins(5840, 664, 6)
       .hang('h_platform', 6800).bld('u_market', 7400, F)
       .coins(6850, 899, 6).coins(7440, 676, 6)
       .hang('h_market', 8400).bld('u_facade', 9000, F)
       .coins(8450, 917, 5).coins(9040, 664, 6)
       .drone(2950, 900).drone(6300, 700).drone(8800, 850)                // drones down below too
       .metro(1300, 9300, 9)
       .ramp(9750, F, 10560, 430).coins(9850, 850, 8, -72, 100)
      // street
       .overpass(-800, 1100, 40)
       .coins(320, 300, 6).bld('b_ramen', 700).arc(660, 260, 6, 60)
       .bld('b_nexus', 1800)
       .bld('b_orion', 2450, GROUND, TUNNEL).coins(2470, 400, 8)
       .bld('b_dome', 3400).bld('b_megacorp', 4000).coins(3450, 160, 6)
       .bld('b_skyscraper', 5000, GROUND, TUNNEL).coins(5020, 400, 10)
       .bld('b_ramen', 5800).coins(6150, 440, 5)
       .bld('b_corptower', 6800, GROUND, TUNNEL).coins(6820, 400, 5).egg(7040, 420).coins(7100, 400, 5) // street egg, in the tunnel
       .bld('b_arcology', 7500).bld('b_fox', 8400, GROUND, TUNNEL).coins(8420, 400, 10)
       .bld('b_nexus', 9100).bld('b_megacorp', 9400)
       .rail(3500, 196, 3780, -160)                                         // optional ride off the dome to the sky
      // sky
       .block(3300, 400, -200, 18, 'deck').block(3800, 350, -200, 18, 'deck')
       .coins(3350, -260, 5).coins(3850, -260, 5)
       .ad('cortexa', 1900, -450).ad('sky', 3000).drone(4400, -350).ad('sky', 5900).ad('hogfuel', 7300, -480).ad('sky', 7950).drone(8600, -400)
       .block(9000, 400, -180, 18, 'deck').coins(9050, -240, 3).egg(9200, -280)  // sky egg, over the last deck
       .ceilramp(9900, -600, 10750, 70).coins(9950, -510, 9, 79, 100)
      // the bike Enforcer, mid-level
       .enforcer(6600, 8800)
       .overpass(10800, 13000, 40).coins(10800, 300, 4);
      return b;
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // 5. RUSH HOUR. All three planes and busier: both Enforcers (the hovercar follows you anywhere), gunships,
  // drones, and a train every ~7 seconds. (This is the tuned prototype level.)
  {
    id: 'city-5', name: 'Rush Hour', theme: 0, speed: 340, end: 11300,
    vert: true, top: -600, bottom: UNDER_FLOOR,
    build() {
      const b = builder(this.speed), F = UNDER_FLOOR;
      b.subway(1200, 10900)
       .hole(1250).hole(2850).hole(4150).hole(6100).hole(7400).hole(9400)
       .hole(10180, 720, false, true, false)
      // undercity
       .coins(1600, 701, 8)
       .hang('h_platform', 1900).hang('h_industrial', 2420)
       .coins(1960, 923, 6).coins(2460, 923, 6)
       .bld('u_market', 3200, F).bld('u_facade', 3660, F)
       .coins(3240, 676, 6).coins(3700, 664, 6)
       .bld('u_market', 4450, F).coins(4470, 676, 5)
       .hang('h_market', 4950).bld('u_facade', 5600, F)
       .coins(5000, 917, 6).coins(5640, 664, 6)
       .hang('h_industrial', 6450)
       .coins(6500, 886, 5).egg(6860, 948)
       .rail(7000, 979, 7360, 602)
       .bld('u_market', 7750, F).hang('h_platform', 8300).bld('u_facade', 8900, F)
       .coins(7790, 676, 6).coins(8350, 886, 6).coins(8940, 664, 6)
       .hang('h_market', 9750).coins(9800, 917, 6)
       .ramp(10000, F, 10860, 430).coins(10100, 850, 8, -67, 100)
       .ceilramp(10150, -600, 11000, 70).coins(10200, -510, 9, 79, 100)
      // street
       .overpass(-800, 1000, 40)
       .coins(320, 300, 6).bld('b_ramen', 700).arc(660, 260, 6, 60)
       .bld('b_nexus', 1750)
       .bld('b_orion', 2400, GROUND, TUNNEL).coins(2420, 400, 8)
       .bld('b_dome', 3200).bld('b_megacorp', 3650)
       .bld('b_skyscraper', 4800, GROUND, TUNNEL).coins(4820, 400, 10)
       .bld('b_corptower', 5500, GROUND, TUNNEL).coins(5520, 400, 12)
       .bld('b_nexus', 6450).bld('b_dome', 6700)
       .bld('b_fox', 7800, GROUND, TUNNEL).coins(7820, 400, 10)
       .bld('b_pigcorp', 8400, GROUND, TUNNEL).coins(8420, 400, 10)
       .bld('b_arcology', 9000).bld('b_megacorp', 9700)
       .coins(1600, 250, 5).coins(3000, 300, 4).coins(4250, 300, 4).coins(6300, 300, 4).coins(9300, 300, 4)
       .rail(3300, 196, 3580, -160)
      // sky
       .block(3250, 360, -200, 18, 'deck').block(3700, 360, -200, 18, 'deck').egg(3650, -300)
       .coins(2480, -380, 4).coins(3300, -260, 5).coins(4900, -260, 6).coins(5600, -300, 6)
       .block(8650, 400, -150, 18, 'deck').block(9150, 400, -150, 18, 'deck').egg(9100, -280)
       .coins(7900, -220, 6).coins(8700, -200, 6).coins(9200, -200, 6)
       .drone(3550, -430).drone(5400, -300).drone(8250, -360)
       .gunship(6800, -420).gunship(9550, -440)
       .ad('sky', 2900).ad('sky', 4380).ad('sky', 7250).ad('sky', 8650)
       .ad('cortexa', 1750, -330).ad('hogfuel', 5950, -330)
       .gunship(5250, 880).drone(6100, 700).drone(9300, 900)             // undercity robots
       .metro(1200, 9700, 7)
       .enforcer(1500, 4300)
       .enforcer(7800, 10400, 1.22, 420, true)
       .overpass(11050, 13000, 40).coins(11000, 300, 6);
      return b;
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // 6. FINALE. The longest and fastest: everything at once. Bike chase early, hovercar chase late, a train every
  // ~6 seconds, gunships and drones up top.
  {
    id: 'city-6', name: 'Pork-topia Prime', theme: 0, speed: 350, end: 12500,
    vert: true, top: -600, bottom: UNDER_FLOOR,
    build() {
      const b = builder(this.speed), F = UNDER_FLOOR;
      b.subway(1300, 12000)
       .hole(1400).hole(2900).hole(4300).hole(5900).hole(7650).hole(8800).hole(10350)
       .hole(11300, 700, false, true, false)
      // undercity
       .hang('h_industrial', 1700).hang('h_market', 2100)                  // two hanging in a row
       .coins(1750, 936, 5).coins(2150, 917, 5)
       .bld('u_facade', 3100, F).bld('u_market', 3600, F)                  // two standing in a row
       .coins(3140, 664, 6).coins(3640, 676, 6)
       .hang('h_platform', 4700).bld('u_market', 5400, F)                  // S-curve
       .coins(4750, 899, 6).coins(5440, 676, 6)
       .hang('h_market', 6300).bld('u_facade', 6900, F)                    // S-curve, tighter
       .coins(6350, 917, 5).coins(6940, 664, 6)
       .hang('h_industrial', 8000).coins(8050, 936, 5)
       .egg(8480, 923).coins(8330, 936, 3)                               // undercity egg, low on the tracks...
       .rail(8560, 979, 8755, 639)                                         // ...then an optional ride up to the next hole
       .bld('u_market', 9200, F).hang('h_platform', 9800).bld('u_facade', 10700, F)
       .coins(9240, 676, 6).coins(9850, 899, 6).coins(10740, 664, 6)
       .drone(2600, 700).gunship(4200, 850).drone(6000, 900).gunship(7500, 720).drone(10300, 800) // undercity robots
       .metro(1300, 10500, 6)
       .ramp(11150, F, 11960, 430).coins(11250, 850, 8, -72, 100)
      // street
       .overpass(-800, 1100, 40)
       .coins(300, 300, 6).bld('b_ramen', 600).arc(560, 260, 6, 60)
       .bld('b_nexus', 1750)
       .bld('b_skyscraper', 2350, GROUND, TUNNEL).coins(2370, 400, 10)
       .bld('b_dome', 3250).bld('b_arcology', 3750)
       .bld('b_orion', 4650, GROUND, TUNNEL).coins(4670, 400, 8)
       .bld('b_ramen', 5300).bld('b_megacorp', 6250)
       .bld('b_corptower', 7050, GROUND, TUNNEL).coins(7070, 400, 12)
       .bld('b_fox', 8150, GROUND, TUNNEL).coins(8170, 400, 10)
       .bld('b_pigcorp', 9700, GROUND, TUNNEL).coins(9720, 400, 10)
       .bld('b_megacorp', 10700).egg(10880, 90).coins(10650, 200, 3)      // street egg, on the Megacorp roof
       .coins(5600, 300, 5).coins(6900, 300, 4).coins(9400, 300, 5)
      // sky
       .ad('sky', 1900).ad('cortexa', 3000, -470).drone(3700, -330)
       .block(4000, 420, -200, 18, 'deck').egg(4200, -300).coins(4040, -260, 5)
       .ad('sky', 3950).ad('sky', 5150)
       .gunship(5850, -420).ad('hogfuel', 6100, -500).ad('sky', 7300)
       .drone(8400, -380).ad('sky', 8700).gunship(9500, -450)
       .ad('cortexa', 10500, -480)
       .ceilramp(11300, -600, 12150, 70).coins(11350, -510, 9, 79, 100)
      // both Enforcers
       .enforcer(2500, 5200)
       .enforcer(8900, 11000, 1.22, 420, true)
       .overpass(12200, 14000, 40).coins(12200, 300, 4);
      return b;
    },
  },
  ],
});
