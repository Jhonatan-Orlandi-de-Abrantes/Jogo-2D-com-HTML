// src/enemies.js
import { collide } from "./collision.js";
import { blocks, pipes, ground, movingPlatforms, ceilings, levelEnemies, resetLevelEnemies } from "./world.js";
import { stompSfx, enemyDestroySfx } from "./audio.js";
import { player } from "./player.js";

/**
 * We expose `enemies` as a live reference to world.levelEnemies for compatibility.
 * Other modules (main.js etc.) access E.enemies — this will point to levelEnemies array.
 */
export const enemies = levelEnemies;

/* Helper: placeEnemySafely(e)
   - ensures enemy spawns not overlapping static collidables
   - if enemy has explicit y, we preserve it; otherwise snap to ground unless over voids
*/
function placeEnemySafely(e) {
  const collidables = [...blocks, ...pipes, ...movingPlatforms, ...ceilings].filter(o => o.collidable !== false);
  // if no explicit y (or y null), snap to ground
  if (typeof e.y !== "number") e.y = ground.y - (e.h || 24);

  // move right until free (simple resolution)
  let loopGuard = 0;
  while (collidables.some(o => collide(e, { x:o.x, y:o.y, w:o.w, h:o.h }))) {
    e.x += 16;
    loopGuard++;
    if (e.x > ground.w - (e.w || 24) || loopGuard > 200) { e.x = Math.max(0, e.x - 200); break; }
  }
}

/**
 * resetEnemies()
 * - resets runtime enemies to their original per-level snapshot (via world.resetLevelEnemies)
 * - if no enemies present for the level, provides a safe fallback set (keeps old behavior)
 * - places each enemy safely (so they don't spawn inside blocks)
 */
export function resetEnemies() {
  // call world helper to reset array to original snapshot (if any)
  try {
    resetLevelEnemies();
  } catch (e) {
    // if world doesn't provide snapshot for some reason, clear array
    enemies.length = 0;
  }

  // fallback: if level has no enemies, populate with sensible defaults (compatibility)
  if (!enemies || enemies.length === 0) {
    const fallback = [
      { x: 900, y: ground.y - 24, w: 24, h: 24, dir: -1, alive: true, active: false },
      { x: 1200, y: ground.y - 24, w: 24, h: 24, dir: -1, alive: true, active: false },
      { x: 1600, y: ground.y - 24, w: 24, h: 24, dir: -1, alive: true, active: false }
    ];
    enemies.length = 0;
    for (const f of fallback) enemies.push(f);
  }

  // ensure none spawn inside collidable objects
  enemies.forEach(e => {
    // ensure defaults exist
    if (typeof e.w !== "number") e.w = 24;
    if (typeof e.h !== "number") e.h = 24;
    if (typeof e.alive !== "boolean") e.alive = true;
    if (typeof e.active !== "boolean") e.active = false;
    if (typeof e.dir !== "number") e.dir = -1;

    placeEnemySafely(e);
  });
}

/**
 * updateEnemies(camX = 0)
 * - works on runtime enemies array (levelEnemies)
 * - supports patrol ranges if enemy has `ax`/`bx` (horizontal) or `ay`/`by` (vertical)
 * - speed can be overridden per-enemy with `speed` property
 */
export function updateEnemies(camX = 0) {
  enemies.forEach(e => {
    if (!e.alive) return;

    const left = camX - 200;
    const right = camX + 800 + 200;
    e.active = (e.x + e.w > left && e.x < right);

    if (!e.active) return;

    // per-enemy speed (fallback 1.0) - keep parity with previous tweaks
    const sp = (typeof e.speed === "number") ? e.speed : 1.0;

    // If enemy defines patrol range (horizontal)
    if (typeof e.ax === "number" && typeof e.bx === "number") {
      // move horizontally between ax and bx
      const minX = Math.min(e.ax, e.bx);
      const maxX = Math.max(e.ax, e.bx);
      e.x += e.dir * sp;
      if (e.x < minX) { e.x = minX; e.dir = 1; }
      else if (e.x + (e.w || 24) > maxX) { e.x = maxX - (e.w || 24); e.dir = -1; }
    } else if (typeof e.ay === "number" && typeof e.by === "number") {
      // vertical patrol: move along y between ay and by
      const minY = Math.min(e.ay, e.by);
      const maxY = Math.max(e.ay, e.by);
      e.y += e.dir * sp;
      if (e.y < minY) { e.y = minY; e.dir = 1; }
      else if (e.y + (e.h || 24) > maxY) { e.y = maxY - (e.h || 24); e.dir = -1; }
    } else {
      // default behaviour: horizontal walking with collision-based turn
      e.x += e.dir * sp;

      const collidables = [...blocks, ...pipes, ...movingPlatforms, ...ceilings].filter(o => o.collidable !== false);
      for (let i=0;i<collidables.length;i++) {
        const o = collidables[i];
        if (collide(e, { x:o.x, y:o.y, w:o.w, h:o.h })) {
          e.dir *= -1;
          // nudge out a bit
          if (e.dir > 0) e.x = o.x + o.w + 1;
          else e.x = o.x - e.w - 1;
        }
      }

      if (e.x < 0) { e.x = 0; e.dir = 1; }
      if (e.x + e.w > ground.w) { e.x = ground.w - e.w; e.dir = -1; }
    }

    // stomp safety (duplicate check)
    if (collide(e, player)) {
      if (player.vy > 0 && (player.y + player.h) - e.y < 12) {
        e.alive = false;
        try {
          const p = stompSfx.play();
          if (p && p.catch) p.catch(()=>{});
        } catch {}
        // also play enemy_destroy for effect
        try {
          const q = enemyDestroySfx.play();
          if (q && q.catch) q.catch(()=>{});
        } catch {}
        player.vy = -6;
      } else {
        // collision from side / player hit: handled in main.js (player damage)
      }
    }
  });
}

/**
 * drawEnemies(ctx, camX = 0)
 */
export function drawEnemies(ctx, camX = 0) {
  ctx.save();
  ctx.translate(-camX, 0);
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    if (e.alive) ctx.fillRect(e.x, e.y, e.w, e.h);
  });
  ctx.restore();
}
