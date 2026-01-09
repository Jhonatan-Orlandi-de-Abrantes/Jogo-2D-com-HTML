// src/enemies.js
import { collide } from "./collision.js";
import { blocks, pipes, ground } from "./world.js";
import { stompSfx, enemyDestroySfx } from "./audio.js";
import { player } from "./player.js";

export let enemies = [
  { x: 900, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
  { x: 1200, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
  { x: 1600, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
  { x: 2300, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
  { x: 3000, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
  { x: 3500, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
  { x: 4100, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false }
];

function placeEnemySafely(e) {
  const collidables = [...blocks, ...pipes].filter(o => o.collidable !== false);
  // snap to ground
  e.y = ground.y - e.h;
  // move right until free (simple resolution)
  let loopGuard = 0;
  while (collidables.some(o => collide(e, { x:o.x, y:o.y, w:o.w, h:o.h }))) {
    e.x += 16;
    loopGuard++;
    if (e.x > ground.w - e.w || loopGuard > 200) { e.x = Math.max(0, e.x - 200); break; }
  }
}

export function resetEnemies() {
  enemies = [
    { x: 900, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
    { x: 1200, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
    { x: 1600, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
    { x: 2300, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
    { x: 3000, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
    { x: 3500, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false },
    { x: 4100, y: 328, w: 24, h: 24, dir: -1, alive: true, active: false }
  ];
  // ensure none spawn inside collidable objects
  enemies.forEach(e => placeEnemySafely(e));
}

export function updateEnemies(camX = 0) {
  enemies.forEach(e => {
    if (!e.alive) return;

    const left = camX - 200;
    const right = camX + 800 + 200;
    e.active = (e.x + e.w > left && e.x < right);

    if (!e.active) return;

    e.x += e.dir * 0.8;

    const collidables = [...blocks, ...pipes].filter(o => o.collidable !== false);
    // change direction on collision and try to unstuck slightly
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
      }
    }
  });
}

export function drawEnemies(ctx, camX = 0) {
  ctx.save();
  ctx.translate(-camX, 0);
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    if (e.alive) ctx.fillRect(e.x, e.y, e.w, e.h);
  });
  ctx.restore();
}