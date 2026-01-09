// src/input.js
const keysDown = {};
const once = {};
let gpIndex = null;
let prevButtons = [];
let prevAxes = { x: 0, y: 0 };

window.addEventListener("keydown", e => {
  if (!keysDown[e.code]) once[e.code] = true;
  keysDown[e.code] = true;
});
window.addEventListener("keyup", e => keysDown[e.code] = false);

window.addEventListener("gamepadconnected", e => {
  gpIndex = e.gamepad.index;
  prevButtons = [];
  prevAxes = { x: 0, y: 0 };
});
window.addEventListener("gamepaddisconnected", () => {
  gpIndex = null;
  prevButtons = [];
  prevAxes = { x: 0, y: 0 };
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

/**
 * captureButtonsSnapshot()
 * returns an array of booleans representing currently-pressed state for each button.
 * Use this when entering remap mode to capture baseline.
 */
export function captureButtonsSnapshot() {
  const gp = pollGamepad();
  if (!gp || !gp.buttons) return [];
  return gp.buttons.map(b => !!b.pressed);
}

/**
 * detectNewButtonFromSnapshot(snapshot)
 * returns the index of the first button that was previously false in `snapshot`
 * and is currently true. Returns null if none.
 */
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

/* ===== internal helper ===== */
function gpButtonPress(gp, index) {
  if (!gp || !gp.buttons) return false;
  const prev = prevButtons[index] || false;
  const curr = !!(gp.buttons[index] && gp.buttons[index].pressed);
  prevButtons[index] = curr;
  return curr && !prev;
}
