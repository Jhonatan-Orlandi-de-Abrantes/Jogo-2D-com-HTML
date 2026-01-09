// src/config.js
export const config = {
  language: localStorage.getItem("language") || "pt",
  musicVol: Number(localStorage.getItem("musicVol")) || 0.5,
  sfxVol: Number(localStorage.getItem("sfxVol")) || 0.6,
  keys: JSON.parse(localStorage.getItem("keys")) || {
    left: "ArrowLeft",
    right: "ArrowRight",
    jump: "Space",
    pause: "Escape"
  },
  gamepad: JSON.parse(localStorage.getItem("gamepad")) || {
    left: 14,
    right: 15,
    jump: 0
  },
  // highest unlocked level (1 = first level unlocked)
  unlockedLevel: Number(localStorage.getItem("unlockedLevel")) || 1
};

export function saveConfig() {
  localStorage.setItem("language", config.language);
  localStorage.setItem("musicVol", config.musicVol);
  localStorage.setItem("sfxVol", config.sfxVol);
  localStorage.setItem("keys", JSON.stringify(config.keys));
  localStorage.setItem("gamepad", JSON.stringify(config.gamepad));
  localStorage.setItem("unlockedLevel", config.unlockedLevel);
}
