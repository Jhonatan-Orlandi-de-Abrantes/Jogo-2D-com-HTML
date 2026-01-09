// src/player.js
import { collide } from "./collision.js";
import { ground, blocks, pipes } from "./world.js";
import { jumpSfx } from "./audio.js";
import { config } from "./config.js";

const img = new Image();
img.src = "assets/player.png";

export const player = {
  x: 50, y: 200, w: 32, h: 32,
  vx: 0, vy: 0,
  speed: 1.8,
  jumpForce: -6,   // stronger jump
  jumping: false,
  lives: 3,
  frame: 0, frameTimer: 0, dir: 1
};

const GRAVITY = 0.2;

export function resetPlayer() {
  player.x = 100; player.y = 200; player.vx = 0; player.vy = 0; player.jumping = false;
}

export function updatePlayer(keysLike) {
  // horizontal input
  if (keysLike[config.keys.right]) { player.vx = player.speed; player.dir = 1; }
  else if (keysLike[config.keys.left]) { player.vx = -player.speed; player.dir = -1; }
  else player.vx *= 0.8;

  // jump input: allow jump only if not jumping
  if ((keysLike[config.keys.jump] || keysLike["ArrowUp"]) && !player.jumping) {
    player.vy = player.jumpForce;
    player.jumping = true;
    try { jumpSfx.currentTime = 0; jumpSfx.play().catch(()=>{}); } catch {}
  }

  // apply gravity
  player.vy += GRAVITY;

  // HORIZONTAL MOVE with collision resolve
  const nextX = player.x + player.vx;
  let horizCollided = false;
  // build temp rect for horizontal movement
  const hRect = { x: nextX, y: player.y, w: player.w, h: player.h };

  // check collisions against collidable blocks/pipes
  const collidables = [...blocks, ...pipes];
  for (let i=0;i<collidables.length;i++) {
    const o = collidables[i];
    if (o.collidable === false) continue; // skip non-collidable (e.g. decorated castle blocks)
    if (collide(hRect, { x:o.x, y:o.y, w:o.w, h:o.h })) {
      // moving right -> place to left of object
      if (player.vx > 0) {
        player.x = o.x - player.w;
      } else if (player.vx < 0) {
        player.x = o.x + o.w;
      }
      player.vx = 0;
      horizCollided = true;
      break;
    }
  }
  if (!horizCollided) {
    player.x = nextX;
  }

  // clamp to world edges
  player.x = Math.max(0, Math.min(player.x, ground.w - player.w));

  // VERTICAL MOVE with collision resolve
  const nextY = player.y + player.vy;
  const vRect = { x: player.x, y: nextY, w: player.w, h: player.h };
  let vertCollided = false;

  for (let i=0;i<collidables.length;i++) {
    const o = collidables[i];
    if (o.collidable === false) continue;
    if (collide(vRect, { x:o.x, y:o.y, w:o.w, h:o.h })) {
      vertCollided = true;
      if (player.vy > 0) {
        // landing on top
        player.y = o.y - player.h;
        player.vy = 0;
        player.jumping = false;
      } else if (player.vy < 0) {
        // hit head on ceiling
        player.y = o.y + o.h;
        player.vy = 0;
      }
      break;
    }
  }

  if (!vertCollided) {
    player.y = nextY;
  }

  // ground floor check (in case no block underneath)
  if (player.y + player.h > ground.y) {
    player.y = ground.y - player.h;
    player.vy = 0;
    player.jumping = false;
  }

  // animation frames (simple)
  if (Math.abs(player.vx) > 0.5 && !player.jumping) {
    player.frameTimer++;
    if (player.frameTimer > 12) { player.frame = (player.frame + 1) % 2; player.frameTimer = 0; }
  } else player.frame = 0;
}

export function drawPlayer(ctx, camX=0) {
  ctx.save();
  ctx.translate(-camX, 0);
  ctx.translate(player.x + player.w/2, player.y);
  ctx.scale(player.dir, 1);
  if (img.complete) {
    ctx.drawImage(img, player.frame * 32, 0, 32, 32, -player.w/2, 0, player.w, player.h);
  } else {
    ctx.fillStyle = "blue";
    ctx.fillRect(-player.w/2, 0, player.w, player.h);
  }
  ctx.restore();
}