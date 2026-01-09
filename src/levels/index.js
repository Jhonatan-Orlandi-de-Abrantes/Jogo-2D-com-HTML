// src/levels/index.js
export const LEVELS = [
  {
    id: 1,
    name: "Fase 1 - Campos",
    bgSrc: "assets/bg.png",
    musicSrc: null,
    ground: { x: 0, y: 360, w: 5200, h: 40 },
    pipes: [
      { x: 600, y: 300, w: 80, h: 60 },
      { x: 900, y: 300, w: 120, h: 100 },
      { x: 1500, y: 300, w: 80, h: 60 }
    ],
    blocks: [
      { x: 260, y: 240, w: 40, h: 40, type: "q" },
      { x: 320, y: 240, w: 40, h: 40, type: "q" },
      { x: 440, y: 300, w: 40, h: 40, type: "brick" },
      { x: 480, y: 300, w: 40, h: 40, type: "brick" }
      // ... keep rest as before if desired
    ],
    endZone: { x: 5200, y: 280, w: 40, h: 80 },
    meta: { cave: false }
  },

  {
    id: 2,
    name: "Fase 2 - Caverna",
    bgSrc: null, // no scenic bg image; main will draw cave colors if meta.cave true
    musicSrc: "assets/cave_music.wav",
    ground: { x:0, y:320, w:3600, h:40 },
    pipes: [], // no pipes in cave
    blocks: [
      { x: 200, y: 280, w: 40, h: 40, type: "brick" },
      { x: 480, y: 240, w: 40, h: 40, type: "platform" }
    ],
    // moving platforms to bridge voids
    platforms: [
      { x: 600, y: 300, w: 120, h: 16, fromX: 600, toX: 900, speed: 60 },
      { x: 1200, y: 260, w: 120, h: 16, fromX: 1200, toX: 1500, speed: 60 },
      { x: 1800, y: 220, w: 120, h: 16, fromX: 1800, toX: 2100, speed: 80 }
    ],
    voids: [
      { x: 560, y: 360, w: 200, h: 120 },
      { x: 1160, y: 360, w: 220, h: 120 },
      { x: 1760, y: 360, w: 220, h: 120 }
    ],
    endZone: { x: 3400, y: 280, w: 60, h: 80 },
    meta: { cave: true }
  }
];
