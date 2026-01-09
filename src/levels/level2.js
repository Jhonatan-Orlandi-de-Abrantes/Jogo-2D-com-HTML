// src/levels/level2.js
// Cave level with moving platforms and voids
export default {
  id: 2,
  name: { pt: "Fase 2 - Caverna", en: "Level 2 - Cave", es: "Fase 2 - Cueva" },
  ground: { x: 0, y: 360, w: 4800, h: 40 },
  bgSrc: "assets/cave_bg.png", // optional; if not present it will fallback to blue
  blocks: [
    // cave static blocks
    { x: 200, y: 300, w: 40, h: 40, type: "rock", collidable: true },
    { x: 240, y: 300, w: 40, h: 40, type: "rock", collidable: true },

    // moving platform (type: moving) - moves horizontally between x1 and x2, player can ride
    { x: 800, y: 320, w: 80, h: 16, type: "moving", collidable: true, moving: { x1: 800, x2: 1200, speed: 0.6, axis: "x" } },
    { x: 1400, y: 280, w: 80, h: 16, type: "moving", collidable: true, moving: { x1: 1400, x2: 1700, speed: 0.4, axis: "x" } },

    // sequences of platforms that allow passing over voids
    { x: 2000, y: 320, w: 80, h: 16, type: "moving", collidable: true, moving: { x1: 2000, x2: 2400, speed: 0.5, axis: "x" } },
    { x: 2600, y: 320, w: 80, h: 16, type: "moving", collidable: true, moving: { x1: 2600, x2: 3000, speed: 0.5, axis: "x" } },

    // some static pillars
    { x: 3400, y: 300, w: 40, h: 60, type: "rock", collidable: true }
  ],
  // pipes used as decorative or obstacles
  pipes: [
    { x: 1200, y: 300, w: 80, h: 60, collidable: true }
  ],
  // voids are expressed by leaving space in ground (visual only). ground width still big.
  endZone: { x: 4200, y: 280, w: 40, h: 80 },
  castleBlocks: [
    { x: 4199, y: 160, w: 40, h: 120 }
  ]
};
