import Stage from './Stage';
import Map from './Map';

export type ItemOptions = {
  stage: Stage;
  width: number;
  height: number;
  x: number;
  y: number;
  type?: number;
  location?: Map;
  coord?: { x: number; y: number };
  orientation?: number;
  speed?: number;
  frames?: number;
};

// 活动对象构造
export default class Item {
  // crate 时的参数
  _params: ItemOptions;
  // 默认数据
  _settings = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    type: 0,
    color: '#F00',
    status: 1,
    orientation: 0,
    speed: 0,

    //地图相关
    location: null,
    coord: null,
    path: [],
    vector: null,

    //布局相关
    frames: 1,
    times: 0,
    timeout: 0,
    control: {},
    update: function () {},
    draw: function () {}, //绘制
  };

  /** 标志符 */
  _id: number = 0;
  /** 与所属布景绑定 */
  _stage: Stage;
  x: number = 0;
  y: number = 0;
  width: number = 20;
  height: number = 20;
  type: number = 0;
  color: string = '#F00';
  status: number = 1;
  orientation: number = 0;
  speed: number = 0;

  //地图相关
  location?: Map;
  coord?: { x: number; y: number };
  path: any[] = [];
  vector: any = null;

  //布局相关
  frames: number = 1;
  times: number = 0;
  timeout: number = 0;
  control = {};
  update?: () => boolean;
  draw?: (ctx: CanvasRenderingContext2D) => void;

  constructor(params: ItemOptions) {
    this._params = params || {};
    this._stage = params.stage;
    this.reset();
  }

  reset(): void {
    // const conf = {...this._settings, ...this._params};
    // this._id = conf._id;
    Object.assign(this, { ...this._settings, ...this._params });
  }
}
