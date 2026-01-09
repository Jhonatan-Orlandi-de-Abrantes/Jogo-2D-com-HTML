// src/audio.js
import { config } from "./config.js";

function safeAudio(src = "", loop = false) {
  try {
    const a = new Audio();
    a.src = src;
    a.loop = loop;
    a.preload = "auto";
    a.onerror = () => {};
    return a;
  } catch {
    return { play: () => Promise.resolve(), pause: () => {}, currentTime:0, volume:0, loop };
  }
}

export const music = safeAudio("assets/menu_music.wav", true);
export const moveMenuSfx = safeAudio("assets/move_menu.wav");
export const jumpSfx = safeAudio("assets/jump.wav");
export const stompSfx = safeAudio("assets/stomp.wav");
export const enemyDestroySfx = safeAudio("assets/enemy_destroy.wav");
export const gameOverSfx = safeAudio("assets/game_over.wav");
export const winSfx = safeAudio("assets/win.wav");

export function applyVolumes() {
  try { music.volume = typeof config.musicVol === "number" ? config.musicVol : 0.5; } catch {}
  try { moveMenuSfx.volume = typeof config.sfxVol === "number" ? config.sfxVol : 0.6; } catch {}
  try { jumpSfx.volume = typeof config.sfxVol === "number" ? config.sfxVol : 0.6; } catch {}
  try { stompSfx.volume = typeof config.sfxVol === "number" ? config.sfxVol : 0.6; } catch {}
  try { enemyDestroySfx.volume = typeof config.sfxVol === "number" ? config.sfxVol : 0.6; } catch {}
  try { gameOverSfx.volume = typeof config.sfxVol === "number" ? config.sfxVol : 0.6; } catch {}
  try { winSfx.volume = typeof config.sfxVol === "number" ? config.sfxVol : 0.6; } catch {}
}

/** Muda a música atual (pausa a anterior, altera src e tenta reproduzir). */
export function setMusic(src) {
  try {
    music.pause();
    music.src = src;
    music.loop = true;
    music.load();
    music.play().catch(()=>{});
  } catch {}
}
