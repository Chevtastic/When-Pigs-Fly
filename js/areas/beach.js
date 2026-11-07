'use strict';
// Bacon Bay: the beach on Snout Island's chin. First area where BOOST matters:
// giant crabs burst out of the sand if you're too slow, and tidal waves chase you down the beach.
// Themes: 6 = day, 7 = sunset, 8 = moonlit night.
addArea({
  id: 'beach', name: 'Bacon Bay', blurb: 'Sun, sand and snapping crabs. Surf\'s up, ham!',
  color: '#f2b84a', eggs: 8,
  levels: [
  {
    id: 'beach-1', name: 'Sun-Burnt Bacon', theme: 6, speed: 340, end: 10200,
    build() {
      const b = builder(this.speed);
      b.coins(320, 280, 6)
       .urchins(700, 3, 'floor', 46).coins(680, 330, 4)
       .pier(1100, 160, 150).coins(1080, 280, 5)
       .sandcastle(1560).arc(1440, 260, 5, 40).egg(1560, 200)
       .gull(2100, 260).coins(2000, 340, 5)
       .urchins(2600, 5, 'floor', 50).urchins(2680, 3, 'ceil', 150).coins(2600, 300, 6)
       .sandcastle(3250).pier(3560, 100, 180).coins(3190, 240, 3).coins(3550, 330, 3).egg(3440, 380)
       .gull(4100, 180).gull(4300, 380).coins(4000, 280, 6)
       .coconut(4800, 1.8, 0).coconut(5000, 1.8, 0.7).coins(4750, 300, 8)
       .urchins(5600, 8, 'floor', 46).pier(5700, 200, 140).coins(5600, 300, 8).egg(5800, 186)
       .sign(6430)
       .coins(6600, 280, 8).crab(7150)
       .gull(7700, 260, 60).coins(7600, 330, 4)
       .sandcastle(8210).urchins(8150, 3, 'ceil', 150).coins(8140, 240, 3)
       .coins(8500, 260, 8).crab(9050)
       .coins(9300, 300, 10);
      return b;
    },
  },
  {
    id: 'beach-2', name: 'Pinch Me, I\'m Bacon', theme: 6, speed: 350, end: 11400,
    build() {
      const b = builder(this.speed);
      b.coins(320, 280, 6)
       .urchins(700, 4, 'floor', 50).urchins(780, 3, 'ceil', 160).coins(680, 300, 6)
       .coins(1100, 260, 10).crab(1700)
       .pier(2100, 140, 170).sandcastle(2470).coins(2080, 300, 3).coins(2390, 220, 3)
       .coins(2700, 250, 6).crab(3300).egg(3150, 225)
       .gull(3900, 200).gull(4000, 380).coins(3820, 290, 5)
       .coconut(4500, 1.7, 0).coconut(4650, 1.7, 0.6).coconut(4800, 1.7, 1.2).coins(4450, 330, 9)
       .crab(5600)
       .urchins(6100, 10, 'floor', 60).urchins(6180, 8, 'ceil', 180).coins(6090, 300, 10).egg(6400, 206)
       .crab(7200).crab(7700)
       .sandcastle(8350).pier(8550, 100, 200).sandcastle(8850).coins(8290, 230, 3).coins(8540, 330, 3).coins(8790, 230, 3)
       .coins(9200, 260, 8).crab(9800).egg(9640, 245)
       .coins(10200, 300, 10);
      return b;
    },
  },
  {
    id: 'beach-3', name: 'Coconut Cannonball', theme: 7, speed: 355, end: 12000,
    build() {
      const b = builder(this.speed);
      b.coins(320, 280, 6)
       .coconut(800, 1.6, 0).coconut(900, 1.6, 0.4).coins(760, 330, 5)
       .pier(1300, 120, 160).urchins(1300, 3, 'floor', 50).coins(1290, 300, 3)
       .coconut(1800, 1.5, 0).coconut(1900, 1.5, 0.3).coconut(2000, 1.5, 0.6).coconut(2100, 1.5, 0.9).coins(1760, 260, 10).egg(1950, 380)
       .gull(2700, 160, 40).gull(2800, 340, 40).coins(2600, 250, 6)
       .sandcastle(3370).coconut(3370, 1.4, 0).coins(3290, 230, 4)
       .coins(3700, 260, 8).crab(4300)
       .urchins(4800, 6, 'floor', 50).urchins(4880, 4, 'ceil', 170).coconut(4920, 1.6, 0.5).coins(4790, 300, 6)
       .coconut(5600, 2.2, 0).coconut(5700, 2.2, 0.25).coconut(5800, 2.2, 0.5).coconut(5900, 2.2, 0.75).coconut(6000, 2.2, 1.0).coins(5560, 320, 12).egg(5850, 200)
       .gull(6700, 260, 80).coins(6600, 330, 4)
       .pier(7200, 120, 200).sandcastle(7510).pier(7700, 120, 200).coins(7190, 330, 3).coins(7440, 230, 3).coins(7690, 330, 3)
       .coins(8100, 260, 8).crab(8700).coconut(8840, 1.7, 0)
       .urchins(9300, 12, 'floor', 70).urchins(9380, 10, 'ceil', 200).coins(9290, 290, 12).egg(9600, 245)
       .gull(10400, 220).gull(10500, 380).coconut(10900, 1.5, 0).coconut(11000, 1.5, 0.75).coins(10300, 300, 18);
      return b;
    },
  },
  {
    id: 'beach-4', name: 'Low Tide, High Swine', theme: 6, speed: 360, end: 12400,
    build() {
      const b = builder(this.speed);
      b.coins(320, 280, 6)
       .urchins(700, 4, 'floor', 50).coins(680, 330, 5)
       .pier(1100, 140, 150).sandcastle(1410).coins(1090, 280, 3).coins(1340, 260, 3)
       .gull(1900, 260).coins(1800, 340, 5)
       .wave(2400, 5200, 1.22)
       .coins(2500, 300, 6).urchins(2900, 4, 'floor', 50).coins(2880, 330, 4)
       .pier(3300, 120, 150).coins(3290, 280, 3).egg(3500, 400)
       .sandcastle(3860).coins(3790, 240, 3)
       .gull(4300, 200).coins(4200, 300, 6)
       .urchins(4700, 6, 'floor', 50).urchins(4780, 4, 'ceil', 160).coins(4690, 300, 6)
       .coins(5400, 280, 8)
       .coconut(5900, 1.6, 0).coconut(6050, 1.6, 0.8).coins(5850, 330, 6)
       .crab(6900).egg(6760, 235)
       .pier(7400, 140, 180).sandcastle(7770).coins(7390, 320, 3).coins(7690, 230, 3)
       .wave(8000, 11400, 1.28)
       .gull(8500, 160).gull(8600, 360).coins(8400, 260, 6)
       .urchins(9000, 8, 'floor', 60).urchins(9080, 6, 'ceil', 180).coins(8990, 300, 8).egg(9300, 222)
       .sandcastle(9750).pier(9950, 100, 200).sandcastle(10250).coins(9690, 230, 3).coins(9940, 330, 3).coins(10190, 230, 3)
       .coconut(10700, 1.6, 0).coconut(10850, 1.6, 0.8).coins(10650, 320, 8)
       .coins(11600, 300, 10);
      return b;
    },
  },
  {
    id: 'beach-5', name: 'Shell-fish Behavior', theme: 7, speed: 370, end: 13200,
    build() {
      const b = builder(this.speed);
      b.coins(320, 280, 6)
       .urchins(700, 5, 'floor', 60).urchins(780, 3, 'ceil', 180).coins(680, 300, 6)
       .coins(1100, 250, 8).crab(1700)
       .coconut(2100, 1.5, 0).coconut(2220, 1.5, 0.5).coconut(2340, 1.5, 1.0).coins(2060, 300, 8)
       .pier(2800, 120, 190).sandcastle(3110).pier(3390, 120, 190).coins(2790, 330, 3).coins(3040, 230, 3).coins(3380, 330, 3).egg(3270, 380)
       .gull(3900, 180, 60).gull(4050, 360, 60).coins(3800, 270, 6)
       .wave(4400, 7600, 1.27)
       .urchins(4700, 6, 'floor', 50).coins(4690, 330, 6)
       .crab(5500)
       .coconut(6000, 1.6, 0).coconut(6150, 1.6, 0.8).coins(5950, 300, 6).egg(6075, 200)
       .sandcastle(6670).pier(6900, 140, 170).coins(6590, 260, 3).coins(6890, 300, 3)
       .coins(7700, 280, 8)
       .urchins(8200, 12, 'floor', 70).urchins(8280, 10, 'ceil', 200).coins(8190, 290, 12)
       .crab(9300).crab(9800)
       .gull(10400, 220, 70).coins(10300, 300, 6)
       .coconut(10900, 1.4, 0).coconut(11000, 1.4, 0.35).coconut(11100, 1.4, 0.7).coconut(11200, 1.4, 1.05).coins(10850, 330, 10).egg(11150, 410)
       .pier(11800, 100, 210).sandcastle(12100).coins(11790, 330, 3).coins(12040, 220, 3)
       .coins(12500, 300, 8);
      return b;
    },
  },
  {
    id: 'beach-6', name: 'The Big Kahuna', theme: 8, speed: 380, end: 14800,
    build() {
      const b = builder(this.speed);
      b.coins(320, 280, 6)
       .urchins(700, 5, 'floor', 70).urchins(780, 3, 'ceil', 190).coins(680, 295, 6)
       .gull(1200, 180, 50, 260).gull(1300, 360, 50, 260).coins(1100, 270, 6)
       .crab(1900)
       .sandcastle(2350).pier(2550, 100, 220).sandcastle(2850).coins(2290, 210, 3).coins(2540, 330, 3).coins(2790, 210, 3).egg(2700, 330)
       .coconut(3300, 1.4, 0).coconut(3420, 1.4, 0.47).coconut(3540, 1.4, 0.93).coins(3260, 320, 8)
       .wave(3900, 8800, 1.3)
       .urchins(4200, 6, 'floor', 60).urchins(4280, 4, 'ceil', 180).coins(4190, 300, 6)
       .crab(5000)
       .gull(5500, 200, 60, 260).coins(5400, 320, 5)
       .pier(5900, 120, 200).sandcastle(6210).coins(5890, 330, 3).coins(6140, 230, 3)
       .coconut(6600, 1.5, 0).coconut(6720, 1.5, 0.5).coins(6560, 300, 6).egg(6660, 380)
       .crab(7400)
       .urchins(7900, 10, 'floor', 60).urchins(7980, 8, 'ceil', 190).coins(7890, 300, 10)
       .coins(9000, 280, 8)
       .crab(9800).crab(10300)
       .coconut(10800, 1.4, 0).coconut(10900, 1.4, 0.35).coconut(11000, 1.4, 0.7).coconut(11100, 1.4, 1.05).coins(10750, 320, 10)
       .wave(11500, 14000, 1.32)
       .sandcastle(11950).pier(12150, 100, 200).sandcastle(12450).coins(11890, 230, 3).coins(12140, 330, 3).coins(12390, 230, 3)
       .gull(12900, 200, 60, 260).gull(13000, 380, 60, 260).egg(13150, 260)
       .urchins(13500, 6, 'floor', 60).coins(13480, 330, 6)
       .coins(14200, 300, 10);
      return b;
    },
  },
  ],
});
