// src/world.js
export const ground = { x: 0, y: 360, w: 6000, h: 40 };

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

export const endZone = { x: 5200, y: 280, w: 40, h: 80 };

/* castle visual (no collisions) - decorative; drawn near the end zone */
export const castleBlocks = [
  { x: endZone.x - 1, y: endZone.y - 120, w: 40, h: 120 },

  { x: endZone.x - 110, y: endZone.y - 80, w: 109, h: 160 },
  { x: endZone.x + 39, y: endZone.y - 80, w: 109, h: 160 },

  { x: endZone.x - 150, y: endZone.y - 80, w: 40, h: 40 },
  { x: endZone.x + 148, y: endZone.y - 80, w: 40, h: 40 },

  { x: endZone.x - 110, y: endZone.y - 120, w: 40, h: 40 },
  { x: endZone.x + 108, y: endZone.y - 120, w: 40, h: 40 }
];

export function drawWorld(ctx, camX = 0, bgImg = null) {
  // background
  if (bgImg && bgImg.complete) {
    try {
      ctx.drawImage(bgImg, 0, 0, ctx.canvas.width, ctx.canvas.height);
    } catch (e) {
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  } else {
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  ctx.save();
  ctx.translate(-camX, 0);

  // ground
  ctx.fillStyle = "#654321";
  ctx.fillRect(ground.x, ground.y, ground.w, ground.h);

  // blocks
  blocks.forEach(b => {
    if (b.type === "brick") {
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "#5a2f14";
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    } else if (b.type === "q") {
      ctx.fillStyle = "#DAA520";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "#000";
      ctx.font = "20px monospace";
      ctx.fillText("?", b.x + 12, b.y + 28);
    } else if (b.type === "platform") {
      ctx.fillStyle = "#A0522D";
      ctx.fillRect(b.x, b.y, b.w, b.h);
    } else {
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
  });

  // pipes
  pipes.forEach(p => {
    ctx.fillStyle = "green";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#2e7d2e";
    ctx.fillRect(p.x - 4, p.y - 8, p.w + 8, 8);
  });

  // end zone flag base
  ctx.fillStyle = "yellow";
  ctx.fillRect(endZone.x, endZone.y, endZone.w, endZone.h);

  // castle decorative (no collisions)
  castleBlocks.forEach(c => {
    ctx.fillStyle = "#444";
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = "#222";
    ctx.strokeRect(c.x, c.y, c.w, c.h);
  });

  ctx.restore();
}