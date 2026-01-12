// src/input.js
import { config, saveConfig } from "./config.js";

const keysDown = {};
const once = {};
let gpIndex = null;
let prevButtons = [];
let prevAxes = { x: 0, y: 0 };

/* cache por ação para tornar gpActionPressed idempotente dentro da mesma leitura */
const gpActionCache = {}; // { [action]: { stamp, curr, edge } }

window.addEventListener("keydown", e => {
  if (!keysDown[e.code]) once[e.code] = true;
  keysDown[e.code] = true;
});
window.addEventListener("keyup", e => keysDown[e.code] = false);

window.addEventListener("gamepadconnected", e => {
  gpIndex = e.gamepad.index;
  prevButtons = [];
  prevAxes = { x: 0, y: 0 };
  // clear action cache on new connection
  for (const k in gpActionCache) delete gpActionCache[k];
});
window.addEventListener("gamepaddisconnected", () => {
  gpIndex = null;
  prevButtons = [];
  prevAxes = { x: 0, y: 0 };
  for (const k in gpActionCache) delete gpActionCache[k];
});

export function down(code) {
  return !!keysDown[code];
}

export function pressed(code) {
  if (once[code]) { once[code] = false; return true; }
  return false;
}

/**
 * clearPressed(codes?)
 */
export function clearPressed(codes) {
  if (!codes) {
    for (const k in once) once[k] = false;
    return;
  }
  for (const c of codes) {
    if (once[c]) once[c] = false;
  }
}

export function pollGamepad() {
  if (gpIndex === null) return null;
  const gps = navigator.getGamepads?.();
  return gps ? gps[gpIndex] : null;
}

export function hasGamepad() {
  return !!pollGamepad();
}

/* ==========================
   ACTIVE MAPS (source of truth)
   ========================== */

// keyboard map (already used)
export const keyMap = { ...config.keys };

// gamepad map initialized from config
export const gamepadMap = { ...config.gamepad };

/* ===== MENU NAV HELPERS (vertical nav) ===== */

export function gpMenuUp(gp) {
  if (!gp) return false;
  const y = gp.axes?.[1] ?? 0;
  const pressedAxis = y < -0.6 && prevAxes.y >= -0.6;
  prevAxes.y = y;
  return pressedAxis || gpButtonPress(gp, 12); // D-Pad Up
}

export function gpMenuDown(gp) {
  if (!gp) return false;
  const y = gp.axes?.[1] ?? 0;
  const pressedAxis = y > 0.6 && prevAxes.y <= 0.6;
  prevAxes.y = y;
  return pressedAxis || gpButtonPress(gp, 13); // D-Pad Down
}

/* horizontal helpers for left/right (used in options volume adjust) */
export function gpMenuLeft(gp) {
  if (!gp) return false;
  const x = gp.axes?.[0] ?? 0;
  const pressedAxis = x < -0.6 && prevAxes.x >= -0.6;
  prevAxes.x = x;
  return pressedAxis || gpButtonPress(gp, 14);
}

export function gpMenuRight(gp) {
  if (!gp) return false;
  const x = gp.axes?.[0] ?? 0;
  const pressedAxis = x > 0.6 && prevAxes.x <= 0.6;
  prevAxes.x = x;
  return pressedAxis || gpButtonPress(gp, 15);
}

export function gpMenuSelect(gp) {
  if (!gp) return false;
  return gpButtonPress(gp, 0); // A / Cross
}

// B / Circle -> Back (acts like ESC)
export function gpMenuBack(gp) {
  if (!gp) return false;
  return gpButtonPress(gp, 1); // B / Circle
}

// Options / Start -> open options in-game (Start often 9)
export function gpMenuOptions(gp) {
  if (!gp) return false;
  return gpButtonPress(gp, 9) || gpButtonPress(gp, 7) || gpButtonPress(gp, 8);
}

/**
 * gpNewButtonPress(gp)
 * legacy utility: returns first newly-pressed button compared to prevButtons snapshot.
 * (keeps prevButtons updated)
 */
export function gpNewButtonPress(gp) {
  if (!gp || !gp.buttons) return null;
  for (let i = 0; i < gp.buttons.length; i++) {
    const prev = !!prevButtons[i];
    const curr = !!(gp.buttons[i] && gp.buttons[i].pressed);
    prevButtons[i] = curr;
    if (curr && !prev) return i;
  }
  return null;
}

/* ===== robust capture API for remapping ===== */

export function captureButtonsSnapshot() {
  const gp = pollGamepad();
  if (!gp || !gp.buttons) return [];
  return gp.buttons.map(b => !!b.pressed);
}

export function detectNewButtonFromSnapshot(snapshot) {
  const gp = pollGamepad();
  if (!gp || !gp.buttons || !Array.isArray(snapshot)) return null;
  const len = Math.min(snapshot.length, gp.buttons.length);
  for (let i = 0; i < len; i++) {
    const was = !!snapshot[i];
    const now = !!gp.buttons[i].pressed;
    if (!was && now) return i;
  }
  return null;
}

/* ===== action-based gamepad API (convenience) ===== */

/**
 * gpActionDown(action)
 * returns true while the mapped gamepad button for `action` is held.
 */
export function gpActionDown(action) {
  const gp = pollGamepad();
  if (!gp) return false;
  const btn = gamepadMap[action];
  if (btn == null) return false;
  return !!gp.buttons[Number(btn)]?.pressed;
}

/**
 * gpActionPressed(action)
 * edge-detection BUT idempotent within the same poll (uses gamepad.timestamp if available).
 * Multiple calls during the same poll return the same value.
 */
export function gpActionPressed(action) {
  const gp = pollGamepad();
  if (!gp) return false;
  const btn = gamepadMap[action];
  if (btn == null) return false;
  const idx = Number(btn);

  // stamp: prefer gp.timestamp (updated by browser when state changes)
  const stamp = gp.timestamp || Date.now();

  const cached = gpActionCache[action];
  if (cached && cached.stamp === stamp) {
    // already computed for this poll
    return !!cached.edge;
  }

  const curr = !!gp.buttons[idx]?.pressed;
  // previous value: prefer cache.curr if exists, otherwise read prevButtons array for better accuracy
  const prev = (cached ? !!cached.curr : !!prevButtons[idx]) || false;
  const edge = curr && !prev;

  // store for this action
  gpActionCache[action] = { stamp, curr, edge };
  return !!edge;
}

/* ===== remap helpers (update both active map and config) ===== */

/**
 * remapKey(action, code)
 * updates active keyMap and persisted config
 */
export function remapKey(action, code) {
  keyMap[action] = code;
  config.keys[action] = code;
  saveConfig();
}

/**
 * remapGamepad(action, buttonIndex)
 * updates active gamepadMap and config; clears duplicates before assigning.
 */
export function remapGamepad(action, buttonIndex) {
  const idx = Number(buttonIndex);

  // clear duplicates in both active map and config (nullify duplicates)
  for (const a of Object.keys(gamepadMap)) {
    if (Number(gamepadMap[a]) === idx) gamepadMap[a] = null;
  }
  if (config.gamepad) {
    for (const a of Object.keys(config.gamepad)) {
      if (Number(config.gamepad[a]) === idx) config.gamepad[a] = null;
    }
  }

  gamepadMap[action] = idx;
  if (!config.gamepad) config.gamepad = {};
  config.gamepad[action] = idx;
  saveConfig();

  // clear action cache for this action so future gpActionPressed uses fresh prev
  if (gpActionCache[action]) delete gpActionCache[action];
}

/**
 * consumeGamepadAction(action)
 * Marks the mapped button for `action` as already consumed for edge-detection.
 * Useful to call immediately after reacting to a gpActionPressed to avoid the same
 * transition being read again (which can cause immediate toggle).
 */
export function consumeGamepadAction(action) {
  const gp = pollGamepad();
  if (!gp) {
    // if no active gp, still clear any cached action and do nothing
    if (gpActionCache[action]) delete gpActionCache[action];
    return;
  }
  const btn = gamepadMap[action];
  if (btn == null) {
    if (gpActionCache[action]) delete gpActionCache[action];
    return;
  }
  const idx = Number(btn);
  // mark prevButtons as pressed so gpButtonPress will not see a rising edge next poll
  prevButtons[idx] = true;
  // set cache so gpActionPressed returns false (no edge) for the same stamp
  const stamp = gp.timestamp || Date.now();
  gpActionCache[action] = { stamp, curr: true, edge: false };
}

/* ===== internal helper ===== */
function gpButtonPress(gp, index) {
  if (!gp || !gp.buttons) return false;
  const prev = prevButtons[index] || false;
  const curr = !!gp.buttons[index]?.pressed;
  prevButtons[index] = curr;
  return curr && !prev;
}

// expose a wrapper so other modules can ask "was this gamepad button just pressed?"
export function gpButtonPressed(gp, index) {
  return gpButtonPress(gp, index);
}
