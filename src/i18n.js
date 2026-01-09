// src/i18n.js
import { config } from "./config.js";

const I18N = {
  pt: {
    menuTitle: "JOGO 2D",
    menu: { play: "JOGAR", options: "OPÇÕES", records: "RECORDE" },
    options: { title: "OPÇÕES", music: "Música", sfx: "Efeitos", language: "Idioma", controls: "Controles", returnToMenu: "Retornar ao Menu", clearData: "Limpar informações" },
    languages: { pt: "Português", en: "Inglês", es: "Espanhol" },
    hints: {
      menu: "↑↓ navegar • ENTER selecionar",
      options: "↑↓ selecionar • ←→ ajustar • ENTER abrir/editar • ESC voltar",
      controls: "↑↓ selecionar • ENTER iniciar remap teclado • □/X iniciar remap controle • ESC voltar",
      back: "ESC - Voltar"
    },
    remapKey: "Aguardando tecla... (ESC para cancelar)",
    remapGamepad: "Aguardando botão do controle... (ESC para cancelar)",
    confirm: {
      title: "Você tem certeza?",
      body: "Confirmar limpará todos os dados do jogo (recordes, configurações e atalhos). Esta ação não pode ser desfeita.",
      cancel: "Cancelar",
      confirm: "Confirmar"
    },
    gamepad: { on: "Controle: conectado", off: "Controle: desconectado" },
    hud: { lives: "VIDAS", time: "Tempo" },
    gameover: "GAME OVER",
    success: "SUCESSO!",
    pressToContinue: "Pressione ESPAÇO para continuar",
    records: { title: "RECORDE", best: "Melhor tempo", none: "Nenhum recorde ainda." }
  },
  en: {
    menuTitle: "2D GAME",
    menu: { play: "PLAY", options: "OPTIONS", records: "RECORD" },
    options: { title: "OPTIONS", music: "Music", sfx: "Effects", language: "Language", controls: "Controls", returnToMenu: "Return to Menu", clearData: "Clear data" },
    languages: { pt: "Portuguese", en: "English", es: "Spanish" },
    hints: {
      menu: "↑↓ navigate • ENTER select",
      options: "↑↓ select • ←→ adjust • ENTER open/edit • ESC back",
      controls: "↑↓ select • ENTER start keyboard remap • □/X start gamepad remap • ESC back",
      back: "ESC - Back"
    },
    remapKey: "Waiting for key... (ESC to cancel)",
    remapGamepad: "Waiting for gamepad button... (ESC to cancel)",
    confirm: {
      title: "Are you sure?",
      body: "Confirming will clear all game data (records, settings and control bindings). This cannot be undone.",
      cancel: "Cancel",
      confirm: "Confirm"
    },
    gamepad: { on: "Gamepad: connected", off: "Gamepad: disconnected" },
    hud: { lives: "LIVES", time: "Time" },
    gameover: "GAME OVER",
    success: "SUCCESS!",
    pressToContinue: "Press SPACE to continue",
    records: { title: "RECORD", best: "Best time", none: "No record yet." }
  },
  es: {
    menuTitle: "JUEGO 2D",
    menu: { play: "JUGAR", options: "OPCIONES", records: "RÉCORD" },
    options: { title: "OPCIONES", music: "Música", sfx: "Efectos", language: "Idioma", controls: "Controles", returnToMenu: "Volver al Menú", clearData: "Borrar datos" },
    languages: { pt: "Portugués", en: "Inglés", es: "Español" },
    hints: {
      menu: "↑↓ navegar • ENTER seleccionar",
      options: "↑↓ seleccionar • ←→ ajustar • ENTER abrir/editar • ESC volver",
      controls: "↑↓ seleccionar • ENTER iniciar remap control • □/X iniciar remap control • ESC volver",
      back: "ESC - Volver"
    },
    remapKey: "Esperando tecla... (ESC para cancelar)",
    remapGamepad: "Esperando botón del control... (ESC para cancelar)",
    confirm: {
      title: "¿Estás seguro?",
      body: "Confirmar borrará todos los datos del juego (récords, configuraciones y atajos). Esta acción no puede deshacerse.",
      cancel: "Cancelar",
      confirm: "Confirmar"
    },
    gamepad: { on: "Control: conectado", off: "Control: desconectado" },
    hud: { lives: "VIDAS", time: "Tiempo" },
    gameover: "GAME OVER",
    success: "¡ÉXITO!",
    pressToContinue: "Presiona ESPACIO para continuar",
    records: { title: "RÉCORD", best: "Mejor tiempo", none: "No hay récord todavía." }
  }
};

export function t() {
  return I18N[config.language] || I18N.pt;
}
