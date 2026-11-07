'use strict';
// Hamlet Farms: the original six levels. Please leave these as they are.
addArea({
  id: 'farm', name: 'Hamlet Farms', blurb: 'Where it all began. Mind the pitchforks.',
  color: '#6fbf5c',
  levels: [
  {
    id: 'farm-1', name: 'Muddy Meadow', theme: 0, speed: 320, end: 9600,
    build() {
      const b = builder(this.speed);
      b.coins(420, 300, 6)
       .spikes(900, 3, 'floor', 45).arc(860, 380, 5, 50)
       .spikes(1400, 3, 'ceil', 140).coins(1300, 250, 2).egg(1460, 180)
       .tower(1850, 80, 170).arc(1790, 250, 5, 60)
       .pan(2350, 260).coins(2150, 390, 6)
       .farmer(2800, 160, 230, 2.2).arc(2690, 180, 5, 40)
       .spikes(3250, 2, 'floor', 60).spikes(3250, 2, 'ceil', 150).coins(3170, 280, 5)
       .tower(3700, 80, 230).tower(4050, 80, 230, 'ceil').egg(3740, 196).coins(3880, 300, 3, 15).coins(4040, 350, 3)
       .pan(4500, 380).pan(4800, 160).coins(4500, 270, 7)
       .farmer(5200, 160, 240, 2).arc(5080, 170, 6, 30)
       .spikes(5600, 6, 'floor', 50).spikes(5680, 4, 'ceil', 130).coins(5540, 290, 3).egg(5760, 388)
       .tower(6200, 80, 260, 'ceil').tower(6550, 80, 250).coins(6170, 340, 4).coins(6500, 170, 4)
       .pan(7000, 300, 60).arc(6880, 420, 6, 20)
       .farmer(7400, 160, 240, 1.8).farmer(7750, 160, 240, 1.8, Math.PI).coins(7300, 150, 14)
       .spikes(8150, 3, 'floor', 60).spikes(8150, 3, 'ceil', 160).coins(8110, 290, 5)
       .pan(8550, 200).pan(8700, 360).coins(8900, 300, 9);
      return b;
    },
  },
  {
    id: 'farm-2', name: 'Barnyard Bash', theme: 1, speed: 340, end: 11600,
    build() {
      const b = builder(this.speed);
      b.coins(400, 260, 6)
       .spikes(800, 4, 'floor', 50).arc(770, 380, 6, 50)
       .tower(1200, 80, 220, 'ceil').tower(1500, 80, 220).coins(1180, 330, 3).coins(1480, 200, 3)
       .pan(1950, 240, 50).coins(1840, 420, 6)
       .farmer(2350, 170, 270, 1.6).arc(2240, 150, 6, 20)
       .spikes(2750, 8, 'floor', 60).spikes(2830, 6, 'ceil', 170).coins(2700, 300, 4).egg(2960, 196)
       .tower(3450, 120, 270).tower(3750, 120, 270, 'ceil').coins(3420, 150, 5).coins(3720, 360, 5)
       .pan(4200, 150).pan(4200, 400).coins(4080, 275, 6)
       .farmer(4600, 170, 270, 1.5).coins(4500, 150, 4)
       .spikes(4950, 3, 'ceil', 160).coins(4930, 300, 4)
       .farmer(5250, 170, 270, 1.5, 1.5).coins(5160, 150, 4)
       .tower(5650, 160, 180).spikes(5690, 3, 'ceil', 150).coins(5560, 230, 2).egg(5730, 222)
       .pan(6150, 300, 80, 240).coins(6040, 140, 5)
       .tower(6550, 80, 290, 'ceil').tower(6850, 80, 290).tower(7150, 80, 290, 'ceil').coins(6540, 380, 3).coins(6840, 130, 3).coins(7140, 380, 3)
       .pan(7650, 200).pan(7850, 350).pan(8050, 200).coins(7600, 100, 5)
       .farmer(8450, 170, 270, 1.3).farmer(8750, 170, 270, 1.3, 2).arc(8340, 150, 12, 20)
       .spikes(9150, 10, 'floor', 70).spikes(9250, 6, 'ceil', 180).coins(9140, 290, 5).egg(9440, 372)
       .pan(9950, 280, 70).coins(9880, 120, 5)
       .tower(10400, 80, 240).tower(10700, 80, 240, 'ceil').coins(10380, 180, 3).coins(10680, 330, 3).coins(10900, 300, 10);
      return b;
    },
  },
  {
    id: 'farm-3', name: 'Midnight Pork Panic', theme: 2, speed: 350, end: 13400,
    build() {
      const b = builder(this.speed);
      b.coins(400, 280, 5)
       .spikes(800, 5, 'floor', 60).spikes(880, 3, 'ceil', 180).coins(780, 300, 6)
       .tower(1400, 80, 270, 'ceil').tower(1700, 80, 270).tower(2000, 80, 270, 'ceil').coins(1390, 380, 3).coins(1690, 140, 3).coins(1990, 380, 3)
       .pan(2450, 150, 60, 240).pan(2650, 370, 60, 240).coins(2380, 270, 8)
       .farmer(3050, 180, 300, 1.2).farmer(3300, 180, 300, 1.2, 1.3).farmer(3550, 180, 300, 1.2, 2.6).coins(2980, 110, 16)
       .spikes(3950, 12, 'floor', 80).spikes(4030, 10, 'ceil', 200).coins(3930, 300, 4).egg(4230, 232).coins(4320, 300, 3)
       .pan(4750, 260, 90, 240).coins(4640, 430, 5)
       .tower(5150, 120, 290).tower(5450, 120, 290, 'ceil').coins(5150, 130, 3).coins(5450, 370, 3)
       .hay(5850, 200, 120).spikes(5850, 5, 'floor', 40, 120).spikes(5890, 4, 'ceil', 170).coins(5780, 240, 2).egg(5970, 240)
       .farmer(6400, 180, 300, 1.1)
       .pan(6680, 120, 0, 220).pan(6680, 410, 0, 220).coins(6580, 265, 5)
       .farmer(7000, 180, 300, 1.1, 1.6)
       .tower(7400, 80, 290, 'ceil').tower(7700, 80, 290).tower(8000, 80, 290, 'ceil').tower(8300, 80, 290)
       .coins(7390, 380, 3).coins(7690, 140, 3).coins(7990, 380, 3).coins(8290, 140, 3)
       .pan(8750, 250, 110, 240)
       .spikes(9100, 6, 'floor', 90).coins(9090, 300, 6)
       .farmer(9500, 190, 300, 1.0).farmer(9750, 190, 300, 1.0, Math.PI).coins(9430, 110, 10)
       .spikes(10150, 14, 'floor', 70).spikes(10230, 12, 'ceil', 190).coins(10140, 295, 14)
       .pan(10950, 180, 0, 220).pan(11100, 330, 0, 220).pan(11250, 180, 0, 220).pan(11400, 330, 0, 220)
       .tower(11850, 80, 280).tower(12150, 80, 280, 'ceil').egg(11890, 150).coins(12140, 380, 3)
       .farmer(12500, 180, 290, 1.0).coins(12400, 120, 4)
       .spikes(12900, 4, 'floor', 60).spikes(12900, 4, 'ceil', 200).coins(12880, 305, 4).coins(13100, 300, 6);
      return b;
    },
  },
  {
    id: 'farm-4', name: 'Hogwash Downpour', theme: 3, speed: 355, end: 12600,
    build() {
      const b = builder(this.speed);
      b.coins(320, 300, 6)
       .cleaver(900, 210, 0.7, 2.4).coins(800, 380, 6)
       .spikes(1320, 4, 'floor', 50).cleaver(1400, 190, 0.8, 2.2, 1).coins(1280, 350, 6)
       .tower(1800, 80, 250).tower(2100, 80, 250, 'ceil').coins(1780, 170, 3).coins(2080, 350, 3)
       .pan(2500, 200, 60).pan(2700, 380).coins(2450, 100, 6)
       .spikes(2920, 4, 'floor', 40).cleaver(3000, 290, 0.9, 2.0).egg(3000, 392)
       .farmer(3500, 170, 280, 1.4).farmer(3800, 170, 280, 1.4, 1.5).coins(3400, 130, 12)
       .spikes(4200, 6, 'floor', 60).spikes(4200, 6, 'ceil', 150).coins(4180, 280, 7)
       .cleaver(4800, 230, 1.0, 1.8).cleaver(5150, 230, 1.0, 1.8, Math.PI).coins(4700, 380, 14)
       .hay(5600, 160, 150).spikes(5600, 4, 'ceil', 120).coins(5560, 230, 2).egg(5680, 160).coins(5800, 230, 2)
       .tower(6200, 80, 270, 'ceil').tower(6500, 80, 270).tower(6800, 80, 270, 'ceil').coins(6190, 380, 3).coins(6490, 140, 3).coins(6790, 380, 3)
       .pan(7300, 150, 0, 230).pan(7300, 400, 0, 230).pan(7550, 275, 80, 230).coins(7200, 275, 4)
       .spikes(7900, 6, 'floor', 50).cleaver(8000, 250, 0.8, 1.5).coins(7880, 370, 6)
       .farmer(8500, 180, 300, 1.2).farmer(8750, 180, 300, 1.2, 1.2).coins(8420, 110, 10)
       .spikes(9100, 10, 'floor', 80).spikes(9150, 8, 'ceil', 180).coins(9100, 285, 10)
       .cleaver(9900, 270, 0.9, 1.7).cleaver(10200, 200, 0.9, 1.7, 1.5).coins(9800, 390, 6).coins(10150, 330, 4)
       .tower(10600, 80, 300).egg(10640, 128).spikes(10900, 4, 'ceil', 220).coins(10880, 320, 5)
       .pan(11300, 200).pan(11450, 360).coins(11250, 100, 5)
       .spikes(11800, 3, 'floor', 60).spikes(11800, 3, 'ceil', 180).coins(11760, 290, 5).coins(12000, 300, 8);
      return b;
    },
  },
  {
    id: 'farm-5', name: 'Frost-Bitten Bacon', theme: 4, speed: 365, end: 13400,
    build() {
      const b = builder(this.speed);
      b.coins(320, 280, 6)
       .spikes(700, 4, 'floor', 60).spikes(760, 3, 'ceil', 170).coins(680, 300, 5)
       .cleaver(1200, 240, 0.9, 1.9).cleaver(1450, 240, 0.9, 1.9, Math.PI).coins(1100, 400, 12)
       .tower(1900, 100, 280).tower(2200, 100, 280, 'ceil').coins(1890, 140, 3).coins(2190, 370, 3)
       .farmer(2650, 180, 290, 1.2).farmer(2900, 180, 290, 1.2, 1.4).coins(2560, 120, 11)
       .pan(3300, 160).pan(3450, 390).pan(3600, 270, 90).coins(3250, 280, 4)
       .hay(4000, 240, 110).spikes(4000, 6, 'floor', 40, 110).spikes(4040, 5, 'ceil', 190).coins(3940, 255, 2).egg(4120, 255).coins(4200, 255, 2)
       .spikes(4600, 6, 'floor', 45).cleaver(4700, 280, 1.0, 1.6).coins(4580, 375, 6)
       .tower(5100, 80, 290, 'ceil').tower(5400, 80, 290).tower(5700, 80, 290, 'ceil').coins(5090, 380, 3).coins(5390, 130, 3).coins(5690, 380, 3)
       .farmer(6100, 180, 300, 1.1).cleaver(6400, 200, 0.8, 1.5).farmer(6700, 180, 300, 1.1, 2).coins(6020, 110, 4).coins(6300, 330, 4).coins(6620, 110, 4)
       .spikes(7200, 15, 'floor', 70).spikes(7280, 12, 'ceil', 190).coins(7190, 295, 6).egg(7500, 376).coins(7600, 295, 5)
       .pan(8200, 150).pan(8200, 400).pan(8400, 275).coins(8100, 275, 4)
       .spikes(8820, 19, 'floor', 40).cleaver(8900, 250, 0.9, 1.6).cleaver(9200, 250, 0.9, 1.6, 2.1).cleaver(9500, 250, 0.9, 1.6, 4.2)
       .coins(8800, 375, 4).egg(9050, 320).coins(9300, 375, 6)
       .tower(10000, 80, 300).tower(10300, 80, 300, 'ceil').coins(9990, 130, 3).coins(10290, 390, 3)
       .farmer(10800, 180, 300, 1.0).farmer(11050, 180, 300, 1.0, 1.2).farmer(11300, 180, 300, 1.0, 2.4).coins(10720, 110, 17)
       .spikes(11800, 4, 'floor', 70).spikes(11800, 4, 'ceil', 200).coins(11780, 300, 5)
       .pan(12300, 280, 90).coins(12500, 300, 8);
      return b;
    },
  },
  {
    id: 'farm-6', name: 'The Grand Hamyon', theme: 5, speed: 375, end: 14900,
    build() {
      const b = builder(this.speed);
      b.coins(320, 280, 6)
       .spikes(700, 5, 'floor', 70).spikes(780, 3, 'ceil', 190).coins(680, 295, 6)
       .spikes(1120, 5, 'floor', 40).cleaver(1200, 260, 1.0, 1.6).coins(1100, 380, 6)
       .tower(1650, 80, 290, 'ceil').tower(1950, 80, 290).tower(2250, 80, 290, 'ceil').coins(1640, 380, 3).coins(1940, 130, 3).coins(2240, 380, 3)
       .pan(2700, 150, 50, 260).pan(2700, 400, 0, 260).pan(2900, 275, 100, 260)
       .farmer(3300, 180, 300, 1.0).farmer(3500, 180, 300, 1.0, 1.1).farmer(3700, 180, 300, 1.0, 2.2).coins(3220, 105, 14)
       .hay(4100, 280, 100).spikes(4100, 7, 'floor', 40, 100).spikes(4100, 7, 'ceil', 180).coins(4040, 255, 2).egg(4240, 255).coins(4320, 255, 2)
       .cleaver(4800, 220, 1.0, 1.4).cleaver(5050, 290, 1.0, 1.4, 2).cleaver(5300, 220, 1.0, 1.4, 4).coins(4700, 390, 4).coins(5150, 400, 3)
       .tower(5800, 120, 300).tower(6100, 120, 300, 'ceil').coins(5800, 120, 3).coins(6100, 390, 3)
       .spikes(6600, 16, 'floor', 80).spikes(6680, 12, 'ceil', 200).coins(6590, 295, 16)
       .pan(7600, 200, 0, 240).pan(7750, 350, 0, 240).pan(7900, 200, 0, 240).pan(8050, 350, 0, 240)
       .farmer(8300, 190, 280, 1.2).farmer(8950, 190, 280, 1.2, 1.8).coins(8220, 105, 3).arc(8480, 330, 3, -30).egg(8625, 340).arc(8690, 330, 3, -30).coins(8900, 105, 3)
       .spikes(9300, 7, 'floor', 40).cleaver(9440, 240, 0.75, 1.8).coins(9220, 360, 9)
       .tower(9700, 80, 300, 'ceil').tower(10000, 80, 300).tower(10300, 80, 300, 'ceil').tower(10600, 80, 300)
       .coins(9690, 390, 3).coins(9990, 130, 3).coins(10290, 390, 3).coins(10590, 130, 3)
       .spikes(11000, 6, 'floor', 90).coins(10980, 290, 6)
       .farmer(11400, 190, 300, 0.9).cleaver(11700, 230, 1.0, 1.3).coins(11320, 105, 4).coins(11600, 380, 6)
       .spikes(12100, 14, 'floor', 70).spikes(12180, 12, 'ceil', 200).coins(12090, 300, 4).egg(12400, 232).coins(12500, 300, 5)
       .pan(12900, 180, 0, 220).pan(13050, 340, 0, 220).pan(13200, 180, 0, 220).pan(13350, 340, 0, 220)
       .tower(13700, 80, 290).tower(14000, 80, 290, 'ceil').coins(13690, 140, 3).coins(13990, 380, 3)
       .spikes(14300, 3, 'floor', 60).spikes(14300, 3, 'ceil', 200).coins(14260, 300, 5).coins(14450, 300, 8);
      return b;
    },
  },
  ],
});
