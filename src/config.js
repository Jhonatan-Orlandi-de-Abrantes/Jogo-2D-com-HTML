// src/config.js
// Central simple config storage with persistence

// load JSON helper
function loadJSON(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    if (!s) return fallback;
    return JSON.parse(s);
  } catch (e) {
    return fallback;
  }
}

export const config = {
  language: localStorage.getItem("language") || "pt",
  musicVol: Number(localStorage.getItem("musicVol")) || 0.5,
  sfxVol: Number(localStorage.getItem("sfxVol")) || 0.6,
  // default key bindings
  keys: loadJSON("keys", {
    left: "ArrowLeft",
    right: "ArrowRight",
    jump: "Space",
    pause: "Escape",
    restart: "KeyR"
  }),
  // default gamepad mapping (indexes) — presets requested, plus pause
  gamepad: loadJSON("gamepad", {
    left: 14,
    right: 15,
    jump: 0,
    restart: 8,
    pause: 9
  }),
  // unlocked level (persisted if you changed it)
  unlockedLevel: Number(localStorage.getItem("unlockedLevel")) || 1
};

export function saveConfig() {
  try {
    localStorage.setItem("language", config.language);
    localStorage.setItem("musicVol", String(config.musicVol));
    localStorage.setItem("sfxVol", String(config.sfxVol));
    localStorage.setItem("keys", JSON.stringify(config.keys));
    localStorage.setItem("gamepad", JSON.stringify(config.gamepad));
    localStorage.setItem("unlockedLevel", String(config.unlockedLevel));
  } catch (e) {
    // fail silently (storage might be disabled)
    console.warn("saveConfig failed", e);
  }
}
