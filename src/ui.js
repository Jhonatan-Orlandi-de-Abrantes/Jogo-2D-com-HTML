// src/ui.js
import { ctx } from "./engine.js";
import { t } from "./i18n.js";
import { player } from "./player.js";
import { config } from "./config.js";

const fonts = { big: "28px monospace", mid: "18px monospace", small: "14px monospace" };
const ACTION_LABELS = {
  pt: { left: "Esquerda", right: "Direita", jump: "Pular" },
  en: { left: "Left", right: "Right", jump: "Jump" },
  es: { left: "Izquierda", right: "Derecha", jump: "Saltar" }
};
const HUD_STRINGS = {
  pt: { openOptions: "Pressione O / ESC para abrir as Opções", pauseTitle: "PAUSADO", pauseHint: "O - Opções | ESC - Voltar" },
  en: { openOptions: "Press O / ESC to open Options", pauseTitle: "PAUSED", pauseHint: "O - Options | ESC - Back" },
  es: { openOptions: "Presiona O / ESC para abrir Opciones", pauseTitle: "PAUSADO", pauseHint: "O - Opciones | ESC - Volver" }
};

export function drawGlobalGamepadMessage(msg) {
  if (!msg) return;
  ctx.fillStyle = "yellow"; ctx.font = "16px monospace";
  ctx.fillText(msg, 300, 20);
}

export function drawMenu(items, selected, gamepadConnected) {
  const texts = t();
  ctx.fillStyle = "#000"; ctx.fillRect(0,0,800,400);
  ctx.fillStyle = "#fff"; ctx.font = fonts.big; ctx.fillText(texts.menuTitle, 320, 90);
  ctx.font = fonts.mid;
  items.forEach((it,i) => {
    ctx.fillStyle = i === selected ? "#ff0" : "#fff";
    ctx.fillText(it, 340, 150 + i * 30);
  });
  ctx.font = fonts.small; ctx.fillStyle = "#ccc";
  ctx.fillText(texts.hints.menu, 10, 380);
  ctx.fillStyle = gamepadConnected ? "yellow" : "#f66";
  ctx.fillText(gamepadConnected ? texts.gamepad.on : texts.gamepad.off, 10, 360);
}

/** draw level selection list
 * levels: [{ id, name, music }]
 * selectedIndex: current cursor
 * unlockedLevel: highest unlocked (1-based)
 * records: map {id:time}
 */
export function drawLevelSelect(levels, selectedIndex, unlockedLevel, records = {}) {
  const texts = t();
  ctx.fillStyle = "#000"; ctx.fillRect(0,0,800,400);
  ctx.fillStyle = "#fff"; ctx.font = fonts.big; ctx.fillText(texts.play.title || "SELECIONE FASE", 280, 70);

  ctx.font = fonts.mid;
  levels.forEach((lvl, i) => {
    const y = 120 + i * 40;
    const locked = i + 1 > unlockedLevel;
    // background for each row
    ctx.fillStyle = locked ? "#222" : "#111";
    ctx.fillRect(40, y - 22, 720, 34);

    // name
    ctx.fillStyle = i === selectedIndex ? "#ff0" : (locked ? "#666" : "#fff");
    ctx.fillText(lvl.name || `Fase ${i+1}`, 80, y);

    // best time
    const rec = records[lvl.id] != null ? `${records[lvl.id].toFixed(2)}s` : "--.--s";
    ctx.fillStyle = locked ? "#444" : "#ff0";
    ctx.fillText(rec, 600, y);
  });

  ctx.font = fonts.small; ctx.fillStyle = "#ccc";
  ctx.fillText(texts.hints.play || "↑↓ navegar • ENTER iniciar", 10, 380);
}

/* drawOptions remains similar */
export function drawOptions(items, selected, overlay = false) {
  const texts = t();
  if (!overlay) { ctx.fillStyle = "#111"; ctx.fillRect(0,0,800,400); }
  else { ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(80,60,640,280); }
  ctx.fillStyle = "#fff"; ctx.font = fonts.big; ctx.fillText(texts.options.title, 320, 80);
  ctx.font = fonts.mid;
  items.forEach((it,i) => {
    const y = 140 + i * 30;
    ctx.fillStyle = i === selected ? "#ff0" : "#fff";
    ctx.fillText(it.label, 260, y);
    if (it.value !== null) ctx.fillText(it.value, 520, y);
  });
  ctx.font = fonts.small; ctx.fillStyle = "#ccc";
  ctx.fillText(texts.hints.options, 260, 340);
}

export function drawControlsPage(keyMap, gamepadMap, remapKey, remapGP, selected, overlay = false) {
  const texts = t();
  const lang = config.language || "pt";
  const labels = ACTION_LABELS[lang] || ACTION_LABELS.pt;
  const safeKeys = keyMap || {};
  const safeGP = gamepadMap || {};

  if (!overlay) { ctx.fillStyle = "#111"; ctx.fillRect(0,0,800,400); }
  else { ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(80,40,640,320); }

  ctx.fillStyle = "#fff"; ctx.font = fonts.big; ctx.fillText(texts.options.controls, 320, 60);
  ctx.font = fonts.small;
  ["left","right","jump"].forEach((a,i) => {
    const y = 140 + i * 30;
    ctx.fillStyle = i === selected ? "#ff0" : "#fff";
    ctx.fillText(`${i === selected ? "> " : "  "}${labels[a]}  Key: ${safeKeys[a] || "—"}  GP: ${safeGP[a] != null ? safeGP[a] : "-"}`, 160, y);
  });

  ctx.fillStyle = "#ccc";
  ctx.fillText(texts.hints.controls || "ENTER remap keyboard • G remap gamepad • ESC cancelar / voltar", 80, 300);
  if (remapKey) { ctx.fillStyle = "yellow"; ctx.fillText(texts.remapKey || "Aguardando tecla...", 200, 340); }
  if (remapGP) { ctx.fillStyle = "yellow"; ctx.fillText(texts.remapGamepad || "Aguardando botão do controle...", 200, 360); }
}

export function drawRecords(record) {
  const texts = t();
  ctx.fillStyle = "#000"; ctx.fillRect(0,0,800,400);
  ctx.fillStyle = "#fff"; ctx.font = fonts.big; ctx.fillText(texts.records.title, 320, 80);
  ctx.font = fonts.mid;
  if (record) ctx.fillText(`${texts.records.best}: ${record.toFixed(2)}s`, 260, 160);
  else ctx.fillText(texts.records.none, 260, 160);
  ctx.font = fonts.small; ctx.fillStyle = "#ccc"; ctx.fillText(texts.hints.back || "ESC - Voltar", 260, 200);
}

export function drawHUD(time) {
  const texts = t();
  const lang = config.language || "pt";
  const hudStrings = HUD_STRINGS[lang] || HUD_STRINGS.pt;
  ctx.fillStyle = "#fff"; ctx.font = fonts.small;
  ctx.fillText(`${texts.hud.lives}: ${player.lives}`, 10, 20);
  ctx.fillText(`${texts.hud.time}: ${time.toFixed(2)}s`, 650, 20);
  ctx.fillStyle = "#ccc"; ctx.fillText(hudStrings.openOptions, 10, 390);
}

export function drawGameOver(timeTaken) {
  const texts = t();
  ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0,0,800,400);
  ctx.fillStyle = "yellow"; ctx.font = "32px monospace"; ctx.fillText(texts.gameover, 300, 160);
  ctx.font = "16px monospace"; ctx.fillStyle = "#fff";
  ctx.fillText(`${texts.hud.time}: ${timeTaken.toFixed(2)}s`, 320, 200);
  ctx.fillText(texts.pressToContinue, 240, 240);
}

export function drawSuccess(timeTaken, record, livesLeft) {
  const texts = t();

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, 800, 400);

  ctx.fillStyle = "lime";
  ctx.font = "32px monospace";
  ctx.fillText(texts.success, 320, 140);

  ctx.font = "16px monospace";
  ctx.fillStyle = "#fff";
  ctx.fillText(`${texts.hud.time}: ${timeTaken.toFixed(2)}s`, 320, 180);

  if (record) {
    ctx.fillText(
      `${texts.records.best}: ${record.toFixed(2)}s`,
      320,
      210
    );
  }

  ctx.fillText(
    `${texts.hud.lives}: ${livesLeft}`,
    320,
    240
  );

  ctx.fillText(texts.pressToContinue, 220, 270);
}

export function drawPauseOverlay() {
  const lang = config.language || "pt";
  const hudStrings = HUD_STRINGS[lang] || HUD_STRINGS.pt;
  ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0,0,800,400);
  ctx.fillStyle = "#fff"; ctx.font = "18px monospace"; ctx.fillText(hudStrings.pauseTitle, 350, 170);
  ctx.font = "14px monospace"; ctx.fillText(hudStrings.pauseHint, 290, 200);
}

/* helper wrapText is omitted here (not used) */
