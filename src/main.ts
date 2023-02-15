// import "./style.css";
// document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
// <div class="game">
//   <canvas id="canvas" width="960" height="640">不支持画布</canvas>
//     <div class="info">
//       <p>按 [空格键] 暂停或继续</p>
//     </div>
// </div>
// `;

import Game from "./Game/Game";

document.querySelector<HTMLDivElement>(
  "#app"
)!.innerHTML = `<canvas id="canvas" width="300" height="400" style="border: 1px solid;">不支持画布</canvas>`;

const game = new Game("#canvas", { width: 300, height: 400 });

game.init();

/**
 *       KeyW
 *
 * KeyA  KeyS  KeyD    Space
 *
 */

document.addEventListener("keypress", (ev) => {
  // console.log(ev.code, ev.ctrlKey, ev.shiftKey);

  switch (ev.code) {
    case "KeyW":
      break;

    default:
      break;
  }
});


type GameMapRow = UTIL.FixedArray<0 | 1, 27>;
type GameMap = UTIL.FixedArray<GameMapRow, 31>;
type WallColor =
  | "#0099FF"
  | "#FF5983"
  | "#E08031"
  | "#37C6C0"
  | "#5ED5D1"
  | "#7E884F"
  | "#CC99CC"
  | "#EB3F2F"
  | "#2E68AA"
  | "#C1194E"
  | "#56A36C"
  | "#9966CC";

/** 能量豆 */
type Goods = {
  [position: string]: 1;
};

/** NPC颜色 */
enum NPC_COLOR {
  "#F00" = "#F00",
  "#F93" = "#F93",
  "#0CF" = "#0CF",
  "#F9C" = "#F9C",
}

/** 游戏关卡 */
interface GameLevel {
  map: GameMap;
  wall_color: WallColor;
  goods: Goods;
}
