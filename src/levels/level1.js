// src/levels/level1.js
// Classic overworld-ish level data for level 1
export default {
  id: 1,
  name: { pt: "Fase 1 - Campo", en: "Level 1 - Field", es: "Fase 1 - Campo" },
  ground: { x: 0, y: 360, w: 6000, h: 40 },
  bgSrc: "assets/bg.png",
  blocks: [
    { x: 260, y: 240, w: 40, h: 40, type: "q", collidable: true },
    { x: 320, y: 240, w: 40, h: 40, type: "q", collidable: true },

    { x: 440, y: 300, w: 40, h: 40, type: "brick", collidable: true },
    { x: 480, y: 300, w: 40, h: 40, type: "brick", collidable: true },

    { x: 720, y: 260, w: 40, h: 40, type: "brick", collidable: true },
    { x: 760, y: 260, w: 40, h: 40, type: "brick", collidable: true },
    { x: 800, y: 260, w: 40, h: 40, type: "brick", collidable: true },

    { x: 1100, y: 240, w: 40, h: 40, type: "q", collidable: true },
    { x: 1160, y: 240, w: 40, h: 40, type: "q", collidable: true },

    { x: 1300, y: 300, w: 40, h: 40, type: "brick", collidable: true },
    { x: 1340, y: 260, w: 40, h: 40, type: "brick", collidable: true },
    { x: 1380, y: 220, w: 40, h: 40, type: "brick", collidable: true },
    { x: 1420, y: 180, w: 40, h: 40, type: "brick", collidable: true },

    { x: 1700, y: 300, w: 40, h: 40, type: "brick", collidable: true },
    { x: 1740, y: 300, w: 40, h: 40, type: "brick", collidable: true },

    { x: 2000, y: 260, w: 40, h: 40, type: "platform", collidable: true },
    { x: 2040, y: 260, w: 40, h: 40, type: "platform", collidable: true },
    { x: 2080, y: 220, w: 40, h: 40, type: "platform", collidable: true },

    { x: 2555, y: 160, w: 40, h: 40, type: "q", collidable: true },
    { x: 2540, y: 300, w: 40, h: 40, type: "brick", collidable: true },
    { x: 2580, y: 300, w: 40, h: 40, type: "brick", collidable: true },

    { x: 4200, y: 300, w: 40, h: 40, type: "brick", collidable: true },
    { x: 4240, y: 260, w: 40, h: 40, type: "brick", collidable: true },
    { x: 4280, y: 220, w: 40, h: 40, type: "brick", collidable: true },
    { x: 4320, y: 180, w: 40, h: 40, type: "brick", collidable: true },

    { x: 4600, y: 300, w: 40, h: 40, type: "brick", collidable: true },
    { x: 4640, y: 300, w: 40, h: 40, type: "brick", collidable: true },
    { x: 4680, y: 300, w: 40, h: 40, type: "brick", collidable: true }
  ],
  pipes: [
    { x: 600, y: 300, w: 80, h: 60, collidable: true },
    { x: 900, y: 300, w: 120, h: 100, collidable: true },
    { x: 1500, y: 300, w: 80, h: 60, collidable: true },
    { x: 2200, y: 300, w: 80, h: 60, collidable: true },
    { x: 3200, y: 300, w: 120, h: 100, collidable: true },
    { x: 3800, y: 300, w: 80, h: 60, collidable: true }
  ],
  endZone: { x: 5200, y: 280, w: 40, h: 80 },
  castleBlocks: [
    { x: 5199, y: 160, w: 40, h: 120 },
    { x: 5090, y: 200, w: 109, h: 160 },
    { x: 5240, y: 200, w: 109, h: 160 }
  ]
};
