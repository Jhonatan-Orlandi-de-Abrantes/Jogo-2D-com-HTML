// src/levels/level2.js
// Data for level 2 (Cave)

export const meta = { id: 2, name: "Cave", music: "assets/cave_music.wav" };

export const blocks = [
  { x: 200, y: 319, w: 40, h: 40, type: "brick" },
  { x: 240, y: 319, w: 40, h: 40, type: "brick" },
  { x: 720, y: 319, w: 40, h: 40, type: "brick" },
  { x: 900, y: 260, w: 40, h: 40, type: "platform" },
  { x: 940, y: 260, w: 40, h: 40, type: "platform" }
];

export const pipes = [
  { x: 1200, y: 300, w: 100, h: 60 },
  { x: 1820, y: 300, w: 100, h: 100 },
  { x: 2360, y: 150, w: 100, h: 300 },
];

export const castleBlocks = [
  { x: 5199, y: 160, w: 40, h: 120 },
  { x: 5090, y: 200, w: 109, h: 160 },
  { x: 5239, y: 200, w: 109, h: 160 },
  { x: 5050, y: 200, w: 40, h: 40 },
  { x: 5348, y: 200, w: 40, h: 40 },
  { x: 5090, y: 160, w: 40, h: 40 },
  { x: 5338, y: 160, w: 40, h: 40 }
];

/* movingPlatforms: horizontal and vertical example */
export const movingPlatforms = [
  // horizontal: moves between ax=240 and bx=720 (example)
  { x: 240, y: 300, w: 80, h: 16, ax: 240, ay: 300, bx: 720, by: 300, speed: 0.6 },
  // vertical: moves between ay=320 and by=150
  { x: 1300, y: 320, w: 60, h: 16, ax: 1300, ay: 320, bx: 1300, by: 150, speed: 0.4 }, // Y
  { x: 1380, y: 150, w: 80, h: 16, ax: 1380, ay: 150, bx: 1760, by: 150, speed: 0.6 }, // X
  { x: 1920, y: 300, w: 80, h: 16, ax: 1920, ay: 300, bx: 2260, by: 130, speed: 0.6 }, // X e Y
  { x: 2460, y: 150, w: 80, h: 16, ax: 2460, ay: 130, bx: 2800, by: 130, speed: 0.6 }, // X
  { x: 2880, y: 130, w: 60, h: 16, ax: 2880, ay: 130, bx: 2880, by: 320, speed: 0.5 }, // Y
  { x: 2940, y: 150, w: 80, h: 16, ax: 2940, ay: 320, bx: 3200, by: 320, speed: 0.7 }, // X
  { x: 3280, y: 130, w: 60, h: 16, ax: 3280, ay: 130, bx: 3280, by: 320, speed: 0.5 }, // Y
  { x: 3320, y: 130, w: 80, h: 16, ax: 3320, ay: 130, bx: 4000, by: 320, speed: 0.9 }, // X e Y
  { x: 5000, y: 320, w: 100, h: 16, ax: 5000, ay: 320, bx: 4200, by: 320, speed: 0.8 }, // X
];

/* void ranges on ground to force use of platforms */
export const groundVoids = [
  { x: 300, w: 420 },
  { x: 1380, w: 520 },
  { x: 2360, w: 1640 },
  { x: 4200, w: 850 },
];

/* ceiling (top roof) for cave: single rect spanning width (y=0, h=40) */
export const ceilings = [
  { x: 0, y: 0, w: 6000, h: 40 }
];

export const groundW = 6000;

export const endZone = { x: 5200, y: 280, w: 40, h: 80 };

/* enemies for level 2
   - fewer entries to fit groundW (2800)
   - same movement style (walk and reverse on collision), positions chosen analogous to prior defaults
*/
export const enemies = [
  { x: 900,  y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
  { x: 2300, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false }
];
