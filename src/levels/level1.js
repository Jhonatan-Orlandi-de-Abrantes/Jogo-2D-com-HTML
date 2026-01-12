// src/levels/level1.js
// Data for level 1 (Field)

export const meta = { id: 1, name: "Field", music: "assets/menu_music.wav" };

export const blocks = [
  { x: 260, y: 240, w: 40, h: 40, type: "q" },
  { x: 320, y: 240, w: 40, h: 40, type: "q" },

  { x: 440, y: 300, w: 40, h: 40, type: "brick" },
  { x: 480, y: 300, w: 40, h: 40, type: "brick" },

  { x: 720, y: 260, w: 40, h: 40, type: "brick" },
  { x: 760, y: 260, w: 40, h: 40, type: "brick" },
  { x: 800, y: 260, w: 40, h: 40, type: "brick" },

  { x: 1100, y: 240, w: 40, h: 40, type: "q" },
  { x: 1160, y: 240, w: 40, h: 40, type: "q" },

  { x: 1300, y: 300, w: 40, h: 40, type: "brick" },
  { x: 1340, y: 260, w: 40, h: 40, type: "brick" },
  { x: 1380, y: 220, w: 40, h: 40, type: "brick" },
  { x: 1420, y: 180, w: 40, h: 40, type: "brick" },

  { x: 1700, y: 300, w: 40, h: 40, type: "brick" },
  { x: 1740, y: 300, w: 40, h: 40, type: "brick" },

  { x: 2000, y: 260, w: 40, h: 40, type: "platform" },
  { x: 2040, y: 260, w: 40, h: 40, type: "platform" },
  { x: 2080, y: 220, w: 40, h: 40, type: "platform" },

  { x: 2555, y: 160, w: 40, h: 40, type: "q" },
  { x: 2540, y: 300, w: 40, h: 40, type: "brick" },
  { x: 2580, y: 300, w: 40, h: 40, type: "brick" },

  { x: 4200, y: 300, w: 40, h: 40, type: "brick" },
  { x: 4240, y: 260, w: 40, h: 40, type: "brick" },
  { x: 4280, y: 220, w: 40, h: 40, type: "brick" },
  { x: 4320, y: 180, w: 40, h: 40, type: "brick" },

  { x: 4600, y: 300, w: 40, h: 40, type: "brick" },
  { x: 4640, y: 300, w: 40, h: 40, type: "brick" },
  { x: 4680, y: 300, w: 40, h: 40, type: "brick" }
];

export const pipes = [
  { x: 600, y: 300, w: 80, h: 60 },
  { x: 900, y: 300, w: 120, h: 100 },
  { x: 1500, y: 300, w: 80, h: 60 },
  { x: 2200, y: 300, w: 80, h: 60 },
  { x: 3200, y: 300, w: 120, h: 100 },
  { x: 3800, y: 300, w: 80, h: 60 }
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

export const movingPlatforms = []; // none in level 1

export const groundVoids = []; // none in level 1

export const ceilings = []; // none

export const groundW = 6000;

export const endZone = { x: 5200, y: 280, w: 40, h: 80 };

/* enemies for level 1 (same positions as the original global enemies) */
export const enemies = [
  { x: 900,  y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
  { x: 1200, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
  { x: 1600, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
  { x: 2300, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
  { x: 3000, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
  { x: 3500, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
  { x: 4100, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false }
];
