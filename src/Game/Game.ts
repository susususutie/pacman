interface GameOption {
  width: number;
  height: number;
}

export default class Game {
  canvas: HTMLCanvasElement;
  #context: CanvasRenderingContext2D;
  contextTool: ContextTool;
  width: number;
  height: number;

  constructor(selector: string, option: GameOption) {
    const canvas = document.querySelector<HTMLCanvasElement>(selector)!;

    this.canvas = canvas;
    this.width = option.width;
    this.height = option.height;

    canvas.width = this.width;
    canvas.height = this.height;
    this.#context = this.canvas.getContext("2d")!;
    this.contextTool = new ContextTool(this.#context);
  }

  /** 游戏初始化, 显示开场, 等待进一步操作 */
  init() {
    this.contextTool.fillAll("red");
  }

  /**  */
  start() {}
}

class ContextTool {
  context: CanvasRenderingContext2D;

  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  fillAll(color: string) {
    this.context.save();

    this.context.fillStyle = color;
    this.context.fillRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );

    this.context.restore();
  }
}
