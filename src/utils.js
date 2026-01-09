export const STATE = {
  MENU: "MENU",
  OPTIONS: "OPTIONS",
  CONTROLS: "CONTROLS",
  RECORDS: "RECORDS",
  GAME: "GAME",
  PAUSE: "PAUSE",
  GAMEOVER: "GAMEOVER",
  SUCCESS: "SUCCESS"
};

export const state = { value: STATE.MENU };
export function setState(s) { state.value = s; }
