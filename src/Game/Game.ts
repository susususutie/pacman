interface GameOption {
  width: number;
  height: number;
}

class Game {
  canvas: HTMLCanvasElement;
  #context: CanvasRenderingContext2D;
  width: number;
  height: number;
  ready = false;

  constructor(option: GameOption) {
    const canvas = document.createElement('canvas');

    this.canvas = canvas;
    this.width = option.width;
    this.height = option.height;

    canvas.width = this.width;
    canvas.height = this.height;
    this.#context = this.canvas.getContext('2d')!;

    // dev
    (window as any).game = this;
    document.body.addEventListener('click', () => {
      const base64 = this.canvas.toDataURL();
      const img = new Image();
      img.src = base64;
      const newWindow = window.open('', '_preview');
      newWindow?.document.write(img.outerHTML);
      if (newWindow?.document) newWindow.document.title = new Date().toLocaleString();
    });

    this.asyncLoadAssets();
    // this.startCycle();
  }

  async asyncLoadAssets() {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    this.ready = true;
  }

  // #lastTimeStamp;
  // TODO
  #frame(time: any) {
    console.log(time);
    requestAnimationFrame(this.#frame.bind(this));
  }
  startCycle() {
    this.#frame(0);
    requestAnimationFrame(this.#frame.bind(this));
  }
  /** 游戏初始化, 显示开场, 等待进一步操作 */
  init() {
    const w = this.width;
    const h = this.height;

    this.#context.clearRect(0, 0, w, h);

    this.#context.save();
    this.#context.fillStyle = '#dedede';
    this.#context.fillRect(0, 0, w, h);
    this.#context.restore();
  }

  start() {}

  pause() {}
}

const game = new Game({ width: 200, height: 200 });
(window as any).Game = Game;
(window as any).game = game;
console.log(game)
