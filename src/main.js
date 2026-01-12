// src/main.js
import { canvas, ctx } from "./engine.js";
import { config, saveConfig } from "./config.js";
import {
  pressed, down, pollGamepad, hasGamepad,
  gpMenuUp, gpMenuDown, gpMenuSelect, gpMenuBack,
  gpMenuLeft, gpMenuRight, gpNewButtonPress, clearPressed,
  captureButtonsSnapshot, detectNewButtonFromSnapshot,
  gpActionPressed, gpActionDown, remapGamepad, consumeGamepadAction
} from "./input.js";
import { music, moveMenuSfx, applyVolumes, jumpSfx, stompSfx, gameOverSfx, winSfx, setMusic } from "./audio.js";
import * as WORLD from "./world.js";
import * as P from "./player.js";
import * as E from "./enemies.js";
import * as UI from "./ui.js";
import { t } from "./i18n.js";

applyVolumes();

/* BG estático */
const bgImage = new Image();
bgImage.src = "assets/bg.png";
let bgReady = false;
bgImage.onload = () => bgReady = true;

/* audio unlock */
let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  try { music.play().catch(()=>{}); } catch {}
}
window.addEventListener("keydown", unlockAudio);
window.addEventListener("mousedown", unlockAudio);

/* states */
const STATE = { MENU:0, OPTIONS:1, CONTROLS:2, RECORDS:3 /* repurposed: LEVEL SELECT */, GAME:4, PAUSE:5, GAMEOVER:6, SUCCESS:7 };
let state = STATE.MENU;

/* menu labels */
let menuIndex = 0;
function menuLabels() { const m = t().menu; return [m.play, m.options]; } // removed Records

/* options */
let optionsIndex = 0;
const baseOptionsKeys = ["musicVol","sfxVol","language","controls","clearData"];

/* controls */
let controlIndex = 0;
// added "restart" and "pause" actions
const controlActions = ["left","right","jump","restart","pause"];
let remapKey = null;
let remapGP = null;
let remapKeyListenerAttached = false;
let remapGpSnapshot = null; // <-- snapshot for robust detection
let controlsPrevState = STATE.MENU;

/* game */
let camX = 0;
let startTime = 0;
let endTime = 0;
let pauseAccum = 0;
let pauseStartedAt = null;
let pauseOptionsActive = false;
let currentLevel = 1;

/* level system */
const LEVELS = [
  { id: 1, key: "field" },
  { id: 2, key: "cave" }
];
let levelSelectIndex = 0;

// load unlocked level from config (config.unlockedLevel exists)
let unlockedLevel = config.unlockedLevel || 1;

// per-level records map { [id]: number|null }
let perLevelRecords = {};
function loadRecords() {
  perLevelRecords = {};
  for (const lvl of LEVELS) {
    const v = Number(localStorage.getItem(`record_${lvl.id}`));
    perLevelRecords[lvl.id] = (isFinite(v) && v > 0) ? v : null;
  }
}
loadRecords();

/* clear confirm */
let confirmClear = false;
let confirmClearIndex = 0; // 0 cancel, 1 confirm

/* final screen locking */
let finalScreenLocked = false;
let continueUnlockAt = 0;

/* gp message */
let gpMessage = "";
let gpMsgTimer = 0;
window.addEventListener("gamepadconnected", () => { gpMessage = t().gamepad.on; gpMsgTimer = 180; });
window.addEventListener("gamepaddisconnected", () => { gpMessage = t().gamepad.off; gpMsgTimer = 180; });

function playMove() { try { if (moveMenuSfx) { moveMenuSfx.currentTime = 0; moveMenuSfx.play().catch(()=>{}); } } catch{} }

function resetMenuState() {
  menuIndex = 0;
  optionsIndex = 0;
  controlIndex = 0;
  remapKey = null;
  remapGP = null;
  remapKeyListenerAttached = false;
  remapGpSnapshot = null;
  confirmClear = false;
  confirmClearIndex = 0;
}

/* ===== startGame: restore lives; now accepts level number ===== */
function startGame(level = 1) {
  currentLevel = level;
  if (typeof WORLD.loadLevel === "function") WORLD.loadLevel(level); // safe-call: load the level data
  P.resetPlayer();
  E.resetEnemies();
  if (P.player) P.player.lives = 3;
  camX = 0;
  startTime = Date.now();
  pauseAccum = 0;
  pauseStartedAt = null;
  pauseOptionsActive = false;
  state = STATE.GAME;

  // set music per level:
  if (level === 2) {
    try { setMusic("assets/cave_music.wav"); } catch {}
  } else {
    try { setMusic("assets/menu_music.wav"); } catch {}
  }
}

/* effective options keys (keeps same order as UI) */
function getEffectiveOptionsKeys(isPauseOptions) {
  if (!isPauseOptions) return [...baseOptionsKeys];
  // for pause overlay, UI shows ReturnToMenu BEFORE ClearData, so match that order:
  return ["musicVol","sfxVol","language","controls","returnToMenu","clearData"];
}

/* remap keyboard handler */
function remapKeyHandler(e) {
  if (!remapKey) return;
  if (e.code === "Escape") {
    remapKey = null;
  } else {
    config.keys[remapKey] = e.code;
    saveConfig();
    remapKey = null;
  }
  window.removeEventListener("keydown", remapKeyHandler);
  remapKeyListenerAttached = false;
}

/* handle input */
let lastGPNavTime = 0;
function handleInput() {
  const gp = pollGamepad();
  // if confirmClear active, handle its navigation first
  if (confirmClear) {
    const now = performance.now();
    let gpLeft = false, gpRight = false, gpSelect = false, gpBack = false;
    if (gp) {
      if (gpMenuLeft(gp) && now - lastGPNavTime > 120) { gpLeft = true; lastGPNavTime = now; }
      if (gpMenuRight(gp) && now - lastGPNavTime > 120) { gpRight = true; lastGPNavTime = now; }
      if (gpMenuSelect(gp)) gpSelect = true;
      if (gpMenuBack(gp)) gpBack = true;
    }

    if (pressed("ArrowLeft") || gpLeft) { confirmClearIndex = 0; playMove(); }
    if (pressed("ArrowRight") || gpRight) { confirmClearIndex = 1; playMove(); }

    if (pressed("Escape") || gpBack) { confirmClear = false; playMove(); return; }
    if (pressed("Enter") || gpSelect) {
      if (confirmClearIndex === 0) { confirmClear = false; playMove(); return; }
      // confirm action:
      // clear global record (legacy) and per-level records
      localStorage.removeItem("record");
      for (const lvl of LEVELS) localStorage.removeItem(`record_${lvl.id}`);

      localStorage.removeItem("language");
      localStorage.removeItem("musicVol");
      localStorage.removeItem("sfxVol");
      localStorage.removeItem("keys");
      localStorage.removeItem("gamepad");
      // reset runtime config
      config.language = "pt";
      config.musicVol = 0.5;
      config.sfxVol = 0.6;
      config.keys = { left: "ArrowLeft", right: "ArrowRight", jump: "Space", pause: "Escape", restart: "KeyR" };
      config.gamepad = { left: 14, right: 15, jump: 0, restart: 8, pause: 9 };
      saveConfig();
      applyVolumes();
      unlockedLevel = config.unlockedLevel = 1;
      saveConfig();
      loadRecords();
      confirmClear = false;
      playMove();
      return;
    }
    return;
  }

  const now = performance.now();
  let gpUp = false, gpDown = false, gpSelect = false, gpBack = false, gpOptions = false, gpLeft = false, gpRight = false;
  if (gp) {
    if (gpMenuUp(gp) && now - lastGPNavTime > 120) { gpUp = true; lastGPNavTime = now; }
    if (gpMenuDown(gp) && now - lastGPNavTime > 120) { gpDown = true; lastGPNavTime = now; }
    if (gpMenuLeft(gp) && now - lastGPNavTime > 120) { gpLeft = true; lastGPNavTime = now; }
    if (gpMenuRight(gp) && now - lastGPNavTime > 120) { gpRight = true; lastGPNavTime = now; }
    if (gpMenuSelect(gp)) gpSelect = true;
    if (gpMenuBack(gp)) gpBack = true;
    // use action-based check for pause/options (customizable)
    if (gpActionPressed('pause')) gpOptions = true;
  }

  // GAMEOVER / SUCCESS handled in update()

  // ESC / Back / Pause handling:
  // - In GAME: only pressed("Escape") or gpActionPressed('pause') open pause.
  // - gpBack (B) is treated as Back/Cancel in menus, but does NOT open pause when in-game.
  const escapePressed = pressed("Escape");
  const pauseActionPressed = gpActionPressed('pause');

  if (escapePressed || pauseActionPressed || gpBack) {
    // remap cancellation takes precedence
    if (remapKey) { remapKey = null; return; }
    if (remapGP) { remapGP = null; remapGpSnapshot = null; return; }

    // In-game: only open pause if explicit pause action or Escape key
    if (state === STATE.GAME) {
      if (escapePressed || pauseActionPressed) {
        pauseStartedAt = Date.now();
        pauseOptionsActive = true;
        state = STATE.PAUSE;

        // --- NEW: consume the gamepad action to avoid immediate close ---
        // clear keyboard pressed flags too
        clearPressed(["Space","Enter","KeyO","Escape"]);
        try { consumeGamepadAction('pause'); } catch(e) {}
        // -----------------------------------------------------------

        return;
      } else {
        // gpBack pressed during gameplay but not mapped to pause -> ignore here
        return;
      }
    }

    // Pause state: behave as before (toggle resume)
    if (state === STATE.PAUSE) {
      if (pauseOptionsActive) {
        pauseAccum += Date.now() - pauseStartedAt;
        pauseStartedAt = null;
        pauseOptionsActive = false;
        state = STATE.GAME;
        return;
      }
      pauseAccum += Date.now() - pauseStartedAt;
      pauseStartedAt = null;
      pauseOptionsActive = false;
      state = STATE.GAME;
      return;
    }

    // Controls page -> go back to previous state
    if (state === STATE.CONTROLS) {
      state = controlsPrevState || STATE.MENU;
      return;
    }

    // Level select (RECORDS) -> back to menu
    if (state === STATE.RECORDS) {
      state = STATE.MENU; return;
    }

    // Options -> back to menu
    if ([STATE.OPTIONS].includes(state)) {
      state = STATE.MENU; return;
    }
  }

  // MENU
  if (state === STATE.MENU) {
    if (pressed("ArrowUp") || gpUp) { menuIndex = (menuIndex - 1 + menuLabels().length) % menuLabels().length; playMove(); }
    if (pressed("ArrowDown") || gpDown) { menuIndex = (menuIndex + 1) % menuLabels().length; playMove(); }
    if (pressed("Enter") || (gp && gpSelect)) {
      const sel = menuLabels()[menuIndex];
      if (sel === t().menu.play) {
        // open level select
        state = STATE.RECORDS;
        levelSelectIndex = 0;
      }
      else if (sel === t().menu.options) { state = STATE.OPTIONS; optionsIndex = 0; playMove(); }
    }
    if (pressed("KeyO") || gpOptions) { state = STATE.OPTIONS; optionsIndex = 0; playMove(); }
    return;
  }

  // LEVEL SELECT (we repurposed STATE.RECORDS for this)
  if (state === STATE.RECORDS) {
    if (pressed("ArrowDown") || gpDown) { levelSelectIndex = (levelSelectIndex + 1) % LEVELS.length; playMove(); }
    if (pressed("ArrowUp") || gpUp) { levelSelectIndex = (levelSelectIndex - 1 + LEVELS.length) % LEVELS.length; playMove(); }

    if (pressed("Enter") || (gp && gpSelect)) {
      const chosen = LEVELS[levelSelectIndex];
      if (chosen && chosen.id <= (config.unlockedLevel || 1)) {
        playMove();
        startGame(chosen.id);
      } else {
        // not unlocked - play "move" sfx only
        playMove();
      }
    }

    return;
  }

  // OPTIONS
  if (state === STATE.OPTIONS || (state === STATE.PAUSE && pauseOptionsActive)) {
    const isPauseOptions = (state === STATE.PAUSE && pauseOptionsActive);
    const keys = getEffectiveOptionsKeys(isPauseOptions);

    if (pressed("ArrowDown") || gpDown) { optionsIndex = (optionsIndex + 1) % keys.length; playMove(); }
    if (pressed("ArrowUp") || gpUp) { optionsIndex = (optionsIndex - 1 + keys.length) % keys.length; playMove(); }

    const key = keys[optionsIndex];
    if (key === "musicVol") {
      if (pressed("ArrowLeft") || pressed("KeyA") || gpLeft) { config.musicVol = Math.max(0, config.musicVol - 0.05); applyVolumes(); saveConfig(); playMove(); }
      if (pressed("ArrowRight") || pressed("KeyD") || gpRight) { config.musicVol = Math.min(1, config.musicVol + 0.05); applyVolumes(); saveConfig(); playMove(); }
    } else if (key === "sfxVol") {
      if (pressed("ArrowLeft") || pressed("KeyA") || gpLeft) { config.sfxVol = Math.max(0, config.sfxVol - 0.05); applyVolumes(); saveConfig(); playMove(); }
      if (pressed("ArrowRight") || pressed("KeyD") || gpRight) { config.sfxVol = Math.min(1, config.sfxVol + 0.05); applyVolumes(); saveConfig(); playMove(); }
    } else if (key === "language") {
      if (pressed("Enter") || (gp && gpSelect)) { config.language = config.language === "pt" ? "en" : config.language === "en" ? "es" : "pt"; saveConfig(); playMove(); }
    } else if (key === "controls") {
      if (pressed("Enter") || (gp && gpSelect)) { controlsPrevState = state; state = STATE.CONTROLS; controlIndex = 0; playMove(); }
    } else if (key === "clearData") {
      if (pressed("Enter") || (gp && gpSelect)) { confirmClear = true; confirmClearIndex = 0; playMove(); }
    } else if (key === "returnToMenu") {
      if (pressed("Enter") || (gp && gpSelect)) { resetMenuState(); state = STATE.MENU; return; }
    }

    if (pressed("Escape") && !isPauseOptions) { state = STATE.MENU; }
    if (pressed("Escape") && isPauseOptions) { pauseOptionsActive = false; }
    return;
  }

  // CONTROLS page
  if (state === STATE.CONTROLS) {
    if (pressed("ArrowDown") || gpDown) { controlIndex = (controlIndex + 1) % controlActions.length; playMove(); }
    if (pressed("ArrowUp") || gpUp) { controlIndex = (controlIndex - 1 + controlActions.length) % controlActions.length; playMove(); }

    // keyboard remap
    if (pressed("Enter")) {
      remapKey = controlActions[controlIndex];
      if (!remapKeyListenerAttached) {
        remapKeyListenerAttached = true;
        window.addEventListener("keydown", remapKeyHandler);
      }
    }

    // start gamepad remap: press KeyG OR press A(0) or X(2) to start remap for currently selected action
    if (pressed("KeyG")) {
      remapGP = controlActions[controlIndex];
      remapGpSnapshot = captureButtonsSnapshot();
    }

    if (gp) {
      const newBtn = gpNewButtonPress(gp); // old helper (keeps prevButtons updated)
      if (newBtn !== null) {
        // if pressing A/X should begin remap:
        if ((newBtn === 0 || newBtn === 2) && remapGP === null) {
          remapGP = controlActions[controlIndex];
          remapGpSnapshot = captureButtonsSnapshot();
        } else {
          // If remapGP already active, we'll assign in handleRemap via snapshot detection
        }
      }
    }

    return;
  }

  // GAME
  if (state === STATE.GAME) {
    // allow opening pause/options by mapped keyboard or gamepad 'pause' action
    if (pressed("KeyO") || gpActionPressed('pause')) {
      pauseStartedAt = Date.now();
      pauseOptionsActive = true;
      state = STATE.PAUSE;

      // consume to avoid immediate toggle
      clearPressed(["Space","Enter","KeyO","Escape"]);
      try { consumeGamepadAction('pause'); } catch(e) {}

      return;
    }
    return;
  }
}

/* handleRemap using snapshot detection */
function handleRemap() {
  // keyboard remap handled via remapKeyHandler
  if (remapGP) {
    // if we don't have a snapshot (e.g. user triggered direct assignment), create it now
    if (!remapGpSnapshot) remapGpSnapshot = captureButtonsSnapshot();
    const newIdx = detectNewButtonFromSnapshot(remapGpSnapshot);
    if (newIdx !== null) {
      // use centralized remap so active map + config stay in sync
      remapGamepad(remapGP, newIdx);

      remapGP = null;
      remapGpSnapshot = null;
      // clear pressed so we don't immediately navigate
      clearPressed(["ArrowLeft","ArrowRight","Space","Enter"]);
    }
  }
}

/* update */
function update() {
  if (typeof gpMsgTimer !== "number") gpMsgTimer = 0;
  if (gpMsgTimer > 0) gpMsgTimer--;

  // final screens handling
  if (state === STATE.GAMEOVER || state === STATE.SUCCESS) {
    const gp = pollGamepad();
    if (Date.now() < continueUnlockAt) return;

    if (finalScreenLocked) {
      const anyHeld = down("Space") || down("Enter") || (gp && gp.buttons && !!gp.buttons[0].pressed);
      if (!anyHeld) {
        finalScreenLocked = false;
        clearPressed(["Space","Enter","KeyO","Escape"]);
      } else return;
    }

    if (pressed("Space") || pressed("Enter") || (gp && gpMenuSelect(gp))) {
      resetMenuState();
      state = STATE.MENU;
    }
    return;
  }

  handleInput();
  handleRemap();

  if (state !== STATE.GAME) return;

  // update world moving platforms
  if (typeof WORLD.updateMovingPlatforms === "function") WORLD.updateMovingPlatforms();

  const gp = pollGamepad();
  const keysLike = {};
  keysLike[config.keys.left] = down(config.keys.left) || (gp && config.gamepad.left != null && gp.buttons[config.gamepad.left]?.pressed);
  keysLike[config.keys.right] = down(config.keys.right) || (gp && config.gamepad.right != null && gp.buttons[config.gamepad.right]?.pressed);
  keysLike[config.keys.jump] = down(config.keys.jump) || (gp && config.gamepad.jump != null && gp.buttons[config.gamepad.jump]?.pressed);

  // analog axis X controls movement if significant (adds fluid analog movement)
  if (gp && gp.axes) {
    const ax = gp.axes[0] ?? 0;
    if (ax < -0.35) {
      keysLike[config.keys.left] = true;
      keysLike[config.keys.right] = false;
    } else if (ax > 0.35) {
      keysLike[config.keys.right] = true;
      keysLike[config.keys.left] = false;
    }
  }

  P.updatePlayer(keysLike);
  E.updateEnemies(camX);

  // ===== restart detection (keyboard once OR gamepad action edge) =====
  if (pressed(config.keys.restart) || gpActionPressed('restart')) {
    // restart current level
    startGame(currentLevel);
    return; // skip remainder of update this frame
  }

  // collisions & enemy logic (keeps per-level logic)
  E.enemies.forEach(e => {
    if (!e.alive) return;
    if (e.x < P.player.x + P.player.w && e.x + e.w > P.player.x && e.y < P.player.y + P.player.h && e.y + e.h > P.player.y) {
      if (P.player.vy > 0 && (P.player.y + P.player.h) - e.y < 12) {
        e.alive = false;
        try { const p = stompSfx.play(); if (p && p.catch) p.catch(()=>{}); } catch {}
        try { /* enemy destroy handled in enemies.js */ } catch {}
        P.player.vy = -6;
      } else {
        P.player.lives--;
        if (P.player.lives > 0) {
          P.resetPlayer(); E.resetEnemies(); camX = 0;
        } else {
          endTime = Date.now();
          try { gameOverSfx.play().catch(()=>{}); } catch {}
          state = STATE.GAMEOVER;
          continueUnlockAt = Date.now() + 200;
          finalScreenLocked = true;
          clearPressed(["Space","Enter","KeyO","Escape"]);
        }
      }
    }
  });

  // fall death
  if (P.player.y > canvas.height + 50) {
    P.player.lives--;
    if (P.player.lives > 0) { P.resetPlayer(); E.resetEnemies(); camX = 0; }
    else {
      endTime = Date.now();
      try { gameOverSfx.play().catch(()=>{}); } catch {}
      state = STATE.GAMEOVER;
      continueUnlockAt = Date.now() + 200;
      finalScreenLocked = true;
      clearPressed(["Space","Enter","KeyO","Escape"]);
    }
  }

  // reach end
  if (P.player.x + P.player.w > WORLD.endZone.x && P.player.x < WORLD.endZone.x + WORLD.endZone.w) {
    endTime = Date.now();
    const total = (endTime - startTime - pauseAccum) / 1000;

    // per-level record storage
    const prev = perLevelRecords[currentLevel];
    if (!prev || total < prev) {
      perLevelRecords[currentLevel] = total;
      localStorage.setItem(`record_${currentLevel}`, total);
    }

    // unlock next level (persist in config)
    if ((config.unlockedLevel || 1) < currentLevel + 1) {
      config.unlockedLevel = Math.min(LEVELS.length, currentLevel + 1);
      saveConfig();
      unlockedLevel = config.unlockedLevel;
    }

    try { winSfx.play().catch(()=>{}); } catch {}
    state = STATE.SUCCESS;
    continueUnlockAt = Date.now() + 200;
    finalScreenLocked = true;
    clearPressed(["Space","Enter","KeyO","Escape"]);
    return;
  }

  camX = Math.max(0, Math.min(P.player.x - 200, WORLD.ground.w - canvas.width));
}

/* render */
function render() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // draw world and pass bgImage if ready
  WORLD.drawWorld(ctx, camX, (bgImage && bgImage.complete ? bgImage : null));

  if (state === STATE.MENU) {
    UI.drawMenu(menuLabels(), menuIndex, hasGamepad());
  }
  else if (state === STATE.OPTIONS) {
    const items = [
      { label: t().options.music, value: Math.round(config.musicVol*100) + "%" },
      { label: t().options.sfx, value: Math.round(config.sfxVol*100) + "%" },
      { label: t().options.language, value: t().languages[config.language] },
      { label: t().options.controls, value: null },
      { label: t().options.clearData, value: null }
    ];
    UI.drawOptions(items, optionsIndex);
  }
  else if (state === STATE.CONTROLS) {
    const overlay = (controlsPrevState === STATE.PAUSE);
    UI.drawControlsPage(config.keys, config.gamepad, remapKey, remapGP, controlIndex, overlay);
  }
  else if (state === STATE.RECORDS) {
    // LEVEL SELECT screen
    const lvlList = LEVELS.map(l => ({ id: l.id, name: (t().phases && t().phases[l.id-1]) || (`Fase ${l.id}`) }));
    UI.drawLevelSelect(lvlList, levelSelectIndex, config.unlockedLevel || 1, perLevelRecords);
  }
  else if (state === STATE.GAME || state === STATE.PAUSE) {
    E.drawEnemies(ctx, camX);
    P.drawPlayer(ctx, camX);

    let timeElapsed = 0;
    if (state === STATE.GAME) timeElapsed = (Date.now() - startTime - pauseAccum)/1000;
    else if (state === STATE.PAUSE) timeElapsed = ((pauseStartedAt || Date.now()) - startTime - pauseAccum)/1000;

    UI.drawHUD(timeElapsed);

    if (state === STATE.PAUSE) {
      UI.drawPauseOverlay();
      if (pauseOptionsActive) {
        const items = [
          { label: t().options.music, value: Math.round(config.musicVol*100) + "%" },
          { label: t().options.sfx, value: Math.round(config.sfxVol*100) + "%" },
          { label: t().options.language, value: t().languages[config.language] },
          { label: t().options.controls, value: null },
          { label: t().options.returnToMenu, value: null },
          { label: t().options.clearData, value: null }
        ];
        UI.drawOptions(items, optionsIndex, true);
      }
    }
  }
  else if (state === STATE.GAMEOVER) {
    const total = (endTime - startTime - pauseAccum)/1000;
    UI.drawGameOver(total);
  }
  else if (state === STATE.SUCCESS) {
    const total = (endTime - startTime - pauseAccum)/1000;
    UI.drawSuccess(total, perLevelRecords[currentLevel], P.player.lives);
  }

  if (gpMsgTimer > 0) UI.drawGlobalGamepadMessage(gpMessage);

  if (confirmClear) UI.drawConfirmClear(confirmClearIndex);
}

/* loop */
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}
loop();
