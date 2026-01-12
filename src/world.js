// src/world.js
// Central world module — agora carrega dados de fase de arquivos em src/levels/*

import * as LEVEL1 from "./levels/level1.js";
import * as LEVEL2 from "./levels/level2.js";

// ground base; width ajustado por level
export const ground = { x: 0, y: 360, w: 6000, h: 40 };

// exported containers (mutáveis para manter referências)
export const blocks = [];
export const pipes = [];
export const castleBlocks = [];
export const movingPlatforms = [];
export const ceilings = [];
export const groundVoids = [];

// enemies for the current level (populated via loadLevel / setLevelEnemies)
export const levelEnemies = [];
let _levelEnemiesOriginal = []; // internal snapshot for resets

export let currentLevel = 1;

// end zone (será ajustado por cada level)
export const endZone = { x: 5200, y: 280, w: 40, h: 80 };

/* ------------------------ helpers ------------------------ */

function copyInto(targetArray, srcArray) {
  targetArray.length = 0;
  if (!srcArray) return;
  for (const s of srcArray) targetArray.push(JSON.parse(JSON.stringify(s)));
}

/* ===== enemies helpers exposed ===== */

/**
 * setLevelEnemies(arr)
 * - called by loadLevel to initialize the runtime enemies array.
 * - stores an original snapshot for resetLevelEnemies().
 */
export function setLevelEnemies(arr) {
  _levelEnemiesOriginal = [];
  levelEnemies.length = 0;
  if (!arr || !Array.isArray(arr)) {
    return;
  }
  for (const e of arr) {
    const clone = JSON.parse(JSON.stringify(e));
    levelEnemies.push(clone);
    _levelEnemiesOriginal.push(JSON.parse(JSON.stringify(clone)));
  }
}

/**
 * resetLevelEnemies()
 * - resets runtime enemies to the original snapshot captured at loadLevel()
 * - preserves the array reference (mutates levelEnemies) so other modules keep working.
 */
export function resetLevelEnemies() {
  levelEnemies.length = 0;
  for (const e of _levelEnemiesOriginal) levelEnemies.push(JSON.parse(JSON.stringify(e)));
}

/* loadLevel(n)
   - carrega os dados do módulo de level correspondente
   - preserva referências dos arrays exportados (outros módulos continuam vendo as atualizações)
*/
export function loadLevel(n = 1) {
  currentLevel = n;

  // choose module
  let mod;
  if (n === 1) mod = LEVEL1;
  else if (n === 2) mod = LEVEL2;
  else mod = LEVEL1;

  // clear runtime arrays
  movingPlatforms.length = 0;
  ceilings.length = 0;
  groundVoids.length = 0;
  castleBlocks.length = 0;

  // copy static geometry
  copyInto(blocks, mod.blocks || []);
  copyInto(pipes, mod.pipes || []);
  copyInto(castleBlocks, mod.castleBlocks || []);

  // initialize moving platforms with runtime bookkeeping
  const mps = mod.movingPlatforms || [];
  for (const p of mps) {
    const pl = Object.assign({}, p);
    pl.dir = 1;
    pl.prevX = pl.x;
    pl.prevY = pl.y;
    pl._isMoving = true;
    movingPlatforms.push(pl);
  }

  // ceilings and voids
  copyInto(ceilings, mod.ceilings || []);
  copyInto(groundVoids, mod.groundVoids || []);

  // set endZone if provided
  if (mod.endZone) {
    endZone.x = mod.endZone.x;
    endZone.y = mod.endZone.y;
    endZone.w = mod.endZone.w;
    endZone.h = mod.endZone.h;
  }

  // set ground width if provided
  if (typeof mod.groundW === "number") ground.w = mod.groundW;
  else ground.w = 6000;

  // initialize enemies for this level (keeps original snapshot)
  setLevelEnemies(mod.enemies || []);

  // Note: we intentionally do NOT "place safely" here because enemies placement
  // requires collision helpers present in enemies.js. Instead, callers (main.startGame
  // calls E.resetEnemies after loadLevel) will call E.resetEnemies() which will place them.
}

/* updateMovingPlatforms() — moves each platform along A<->B and tracks prev positions */
export function updateMovingPlatforms() {
  // factor to slightly speed up platforms to recover previous game pace
  const SPEED_SCALE = 1.25;

  for (const p of movingPlatforms) {
    p.prevX = p.x;
    p.prevY = p.y;

    const targetX = p.dir > 0 ? p.bx : p.ax;
    const targetY = p.dir > 0 ? p.by : p.ay;

    const dx = targetX - p.x;
    const dy = targetY - p.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < 0.001) {
      p.dir *= -1;
      continue;
    }

    const nx = dx / dist;
    const ny = dy / dist;
    // apply SPEED_SCALE to p.speed
    const mv = Math.min(p.speed * SPEED_SCALE, dist);
    p.x += nx * mv;
    p.y += ny * mv;

    // clamp if overshot and flip
    const newDx = (p.dir > 0 ? p.bx : p.ax) - p.x;
    if ((p.dir > 0 && Math.sign(dx) !== Math.sign(newDx)) || (p.dir < 0 && Math.sign(dx) !== Math.sign(newDx))) {
      if (p.dir > 0) { p.x = p.bx; p.y = p.by; }
      else { p.x = p.ax; p.y = p.ay; }
      p.dir *= -1;
    }
  }
}

/* drawWorld: draws background, ground (with voids), blocks, pipes, moving platforms and ceilings */
export function drawWorld(ctx, camX = 0, bgImg = null) {
  // background: cave level (2) uses solid color, others use bg image/sky
  if (currentLevel === 2) {
    ctx.fillStyle = "#652525";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } else {
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
  }

  ctx.save();
  ctx.translate(-camX, 0);

  // ground (visual tiles; skip void tiles)
  const tileW = 40;
  for (let gx = 0; gx < ground.w; gx += tileW) {
    const tileX = gx;
    let inVoid = false;
    for (const vd of groundVoids) {
      if (tileX + tileW > vd.x && tileX < vd.x + vd.w) { inVoid = true; break; }
    }
    if (!inVoid) {
      ctx.fillStyle = "#4e2e1d";
      ctx.fillRect(tileX, ground.y, tileW, ground.h);
      ctx.strokeStyle = "#3e2416";
      ctx.strokeRect(tileX, ground.y, tileW, ground.h);
    }
  }

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

  // moving platforms
  movingPlatforms.forEach(p => {
    ctx.fillStyle = "#A9A9A9";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = "#777";
    ctx.strokeRect(p.x, p.y, p.w, p.h);
  });

  // ceilings (cave roof)
  ceilings.forEach(c => {
    ctx.fillStyle = "#422727";
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = "#2e1d1d";
    ctx.strokeRect(c.x, c.y, c.w, c.h);
  });

  // end zone flag base
  ctx.fillStyle = "yellow";
  ctx.fillRect(endZone.x, endZone.y, endZone.w, endZone.h);

  // castle decorative
  castleBlocks.forEach(c => {
    ctx.fillStyle = "#444";
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = "#222";
    ctx.strokeRect(c.x, c.y, c.w, c.h);
  });

  ctx.restore();
}

/* initialize with level 1 */
loadLevel(1);
