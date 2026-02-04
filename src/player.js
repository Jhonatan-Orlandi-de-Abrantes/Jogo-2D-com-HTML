// src/player.js
import { collide } from "./collision.js";
import { ground, blocks, pipes, movingPlatforms, ceilings, groundVoids } from "./world.js";
import { jumpSfx } from "./audio.js";
import { config } from "./config.js";

const img = new Image();
img.src = "assets/player.png";

export const player = {
  x: 50, y: 200, w: 32, h: 32,
  vx: 0, vy: 0,
  speed: 3.0,
  jumpForce: -7,
  jumping: false,
  lives: 3,
  frame: 0, frameTimer: 0, dir: 1,
  onPlatform: null // reference to moving platform if standing on it
};

const GRAVITY = 0.3;

export function resetPlayer() {
  player.x = 100; player.y = 200; player.vx = 0; player.vy = 0; player.jumping = false;
  player.onPlatform = null;
}

function isOverVoid(xCenter) {
  // checks if xCenter is inside any ground void
  for (const v of groundVoids) {
    if (xCenter >= v.x && xCenter < v.x + v.w) return true;
  }
  return false;
}

/**
 * checks whether rect collides with any object from the provided list
 * returns the first colliding object or null
 */
function firstCollision(rect, collidables) {
  for (let i = 0; i < collidables.length; i++) {
    const o = collidables[i];
    if (o.collidable === false) continue;
    if (collide(rect, { x: o.x, y: o.y, w: o.w, h: o.h })) return o;
  }
  return null;
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

  // build collidables: static blocks/pipes/ceilings
  const staticCollidables = [...blocks, ...pipes, ...ceilings];
  const allMoving = [...movingPlatforms];

  /* ----- HORIZONTAL MOVE with collision resolve ----- */
  const nextX = player.x + player.vx;
  let horizCollided = false;
  const hRect = { x: nextX, y: player.y, w: player.w, h: player.h };

  // check static collidables (blocks/pipes/ceilings)
  for (let i = 0; i < staticCollidables.length; i++) {
    const o = staticCollidables[i];
    if (o.collidable === false) continue;
    if (collide(hRect, { x: o.x, y: o.y, w: o.w, h: o.h })) {
      if (player.vx > 0) player.x = o.x - player.w;
      else if (player.vx < 0) player.x = o.x + o.w;
      player.vx = 0;
      horizCollided = true;
      break;
    }
  }

  // NOTE: intentionally DO NOT include movingPlatforms in horizontal collision checks.
  // This prevents vertical-moving platforms from "pushing" the player sideways.
  // Horizontal collision with moving platforms can produce unnatural pushes when the platform moves vertically.
  // Platforms are handled as one-way surfaces in vertical checks.

  if (!horizCollided) {
    player.x = nextX;
  }

  // clamp to world edges
  player.x = Math.max(0, Math.min(player.x, ground.w - player.w));

  /* ----- VERTICAL MOVE with collision resolve ----- */
  const nextY = player.y + player.vy;
  const vRect = { x: player.x, y: nextY, w: player.w, h: player.h };
  let vertCollided = false;

  // check static collidables (blocks/pipes/ceilings)
  for (let i = 0; i < staticCollidables.length; i++) {
    const o = staticCollidables[i];
    if (o.collidable === false) continue;
    if (collide(vRect, { x: o.x, y: o.y, w: o.w, h: o.h })) {
      vertCollided = true;
      if (player.vy > 0) {
        // landing on top
        player.y = o.y - player.h;
        player.vy = 0;
        player.jumping = false;
        player.onPlatform = null; // static object
      } else if (player.vy < 0) {
        // hit head on ceiling
        player.y = o.y + o.h;
        player.vy = 0;
        player.onPlatform = null;
      }
      break;
    }
  }

  // check moving platforms separately (one-way behavior)
  if (!vertCollided) {
    for (let i = 0; i < allMoving.length; i++) {
      const o = allMoving[i];
      if (o.collidable === false) continue;
      // one-way behavior:
      // - Only collide if the player is falling (vy > 0) and the player's bottom before moving is above platform top (allow small threshold)
      // - This allows player to pass upward through the platform (so you can jump up through it), but land on it when falling.
      const playerBottomBefore = player.y + player.h;
      const threshold = 8; // small forgiving window
      const platformTop = o.y;

      const wouldOverlap = collide(vRect, { x: o.x, y: o.y, w: o.w, h: o.h });
      if (!wouldOverlap) continue;

      if (player.vy > 0 && (playerBottomBefore <= platformTop + threshold)) {
        // landing on top of moving platform
        vertCollided = true;
        player.y = o.y - player.h;
        player.vy = 0;
        player.jumping = false;
        player.onPlatform = o;
        break;
      } else {
        // otherwise ignore vertical collision (pass through) — prevents being pushed horizontally when attempting to jump into it
        continue;
      }
    }
  }

  if (!vertCollided) {
    player.y = nextY;
    // walked off platform
    if (!player.onPlatform) {
      // nothing to do
    }
  }

  /* ----- handle platform-overlap cases when a platform moved up into the player ----- */
  // If a platform moved into the player's space, previously we simply snapped player to top.
  // Now we check if moving platform would carry player into a static object; if so, we "push"
  // the player up to the obstacle and detach from the platform instead of teleporting past it.
  // This prevents the teleportation and keeps player blocked by the object.

  // first, attempt to apply platform deltas if onPlatform exists (we will validate against static collisions)
  if (player.onPlatform) {
    const p = player.onPlatform;
    const dx = (p.x - (typeof p.prevX === "number" ? p.prevX : p.x));
    const dy = (p.y - (typeof p.prevY === "number" ? p.prevY : p.y));

    // proposed new player rect if platform moves the player
    const proposed = { x: player.x + dx, y: player.y + dy, w: player.w, h: player.h };

    // check collision with static collidables for the proposed rect
    const coll = firstCollision(proposed, staticCollidables);

    if (!coll) {
      // no collision — safe to transport the player
      player.x += dx;
      player.y += dy;
    } else {
      // collision WOULD happen. Rather than teleporting the player on top of the obstacle,
      // we push the player up to the obstacle's edge and detach from the platform.
      // Decide primary axis of movement to resolve properly.
      if (Math.abs(dx) >= Math.abs(dy)) {
        // primarily horizontal push: move player to obstacle edge horizontally
        if (dx > 0) {
          player.x = coll.x - player.w;
        } else {
          player.x = coll.x + coll.w;
        }
        player.vx = 0;
      } else {
        // primarily vertical movement: resolve vertically
        if (dy > 0) {
          // platform moved down into something below the player (unlikely) — place player above
          player.y = coll.y - player.h;
          player.vy = 0;
        } else {
          // platform moved up into an object above — place player below that object
          player.y = coll.y + coll.h;
          player.vy = 0;
        }
      }
      // detach player from platform so further platform movement won't keep trying to push through
      player.onPlatform = null;
    }

    // clamp after movement or push
    player.x = Math.max(0, Math.min(player.x, ground.w - player.w));
  }

  // Additionally, still handle the old case: if any moving platform ended up intersecting the player's rect
  // (e.g., platform moved up into player but not carrying them), and the platform moved upward, place player on top.
  // This is preserved for the case where platform intersects the player but there is no static collision blocking.
  for (let i = 0; i < allMoving.length; i++) {
    const p = allMoving[i];
    if (p.collidable === false) continue;
    const pr = { x: player.x, y: player.y, w: player.w, h: player.h };
    if (collide(pr, { x: p.x, y: p.y, w: p.w, h: p.h })) {
      if (typeof p.prevY === "number" && p.y < p.prevY) {
        // platform moved up into player, but we already checked static collisions above.
        // place player on top of platform (if not blocked)
        const aboveRect = { x: player.x, y: p.y - player.h, w: player.w, h: player.h };
        const blocking = firstCollision(aboveRect, staticCollidables);
        if (!blocking) {
          player.y = p.y - player.h;
          player.vy = 0;
          player.jumping = false;
          player.onPlatform = p;
          break;
        } else {
          // if there's a static obstacle above preventing placement, detach and leave player in place
          player.onPlatform = null;
        }
      }
    }
  }

  /* ----- ground floor check (honors voids) ----- */
  const footX = player.x + player.w / 2;
  const overVoid = isOverVoid(footX);

  if (!overVoid) {
    if (player.y + player.h > ground.y) {
      player.y = ground.y - player.h;
      player.vy = 0;
      player.jumping = false;
      player.onPlatform = null;
    }
  } // else: player can fall through void

  /* ----- rider behavior (already applied above) ----- */
  // Note: platform deltas handled earlier with collision safety.

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
