import Stage from './Stage'

export type MapOptions = {
  stage: Stage;
  x: number;
  y: number;
  size: number;
  data: number[][];
  x_length: number;
  y_length: number;
  frames: number;
  times: number;
  cache: boolean;
  update: Function;
  draw: Function;
};

// 地图对象构造器
export default class Map {
  _params: MapOptions;
  _id: number = 0;
  _stage: Stage;
  x: number = 0;
  y: number = 0;
  size: number = 20;
  data: number[][] = [];
  x_length: number = 0;
  y_length: number = 0;
  frames: number = 1;
  times: number = 0;
  cache: boolean = false;
  update: Function = function () {};
  draw: Function = function () {}; //绘制地图
  imageData: ImageData | null = null;

  _settings = {
    x: 0,
    y: 0,
    size: 20,
    data: [],
    x_length: 0,
    y_length: 0,
    frames: 1,
    times: 0,
    cache: false,
    update: function () {},
    draw: function () {}, //绘制地图
  };

  constructor(params: MapOptions) {
    this._params = params || {};
    this._stage = params.stage;

    Object.assign(this, this._settings, this._params);
  }

  // 获取地图上某点的值
  get(x: number, y: number) {
    if (this.data[y] && typeof this.data[y][x] != "undefined") {
      return this.data[y][x];
    }
    return -1;
  }

  // 设置地图上某点的值
  set(x: number, y: number, value: any) {
    if (this.data[y]) {
      this.data[y][x] = value;
    }
  }

  // 地图坐标转画布坐标
  coord2position(cx: number, cy: number) {
    return {
      x: this.x + cx * this.size + this.size / 2,
      y: this.y + cy * this.size + this.size / 2,
    };
  }

  // 画布坐标转地图坐标
  position2coord(x: number, y: number) {
    var fx = (Math.abs(x - this.x) % this.size) - this.size / 2;
    var fy = (Math.abs(y - this.y) % this.size) - this.size / 2;
    return {
      x: Math.floor((x - this.x) / this.size),
      y: Math.floor((y - this.y) / this.size),
      offset: Math.sqrt(fx * fx + fy * fy),
    };
  }

  // 寻址算法
  finder(params: {
    map: number[][];
    start: { x: number; y: number };
    end: { x: number; y: number };
    type?: "path" | "next";
  }) {
    const options = {
      type: "path",
      ...params,
    };

    if (
      options.map[options.start.y][options.start.x] ||
      options.map[options.end.y][options.end.x]
    ) {
      //当起点或终点设置在墙上
      return [];
    }

    var finded = false;
    var result = [];
    var y_length = options.map.length;
    var x_length = options.map[0].length;
    var steps = Array(y_length)
      .fill(0)
      .map(() => Array(x_length).fill(0)); //步骤的映射
    const _getValue = (x: number, y: number) => {
      //获取地图上的值
      if (options.map[y] && typeof options.map[y][x] != "undefined") {
        return options.map[y][x];
      }
      return -1;
    };
    const _next = (to: { x: number; y: number; change?: 1 }) => {
      //判定是否可走,可走放入列表
      var value = _getValue(to.x, to.y);
      if (value < 1) {
        if (value == -1) {
          to.x = (to.x + x_length) % x_length;
          to.y = (to.y + y_length) % y_length;
          to.change = 1;
        }
        if (!steps[to.y][to.x]) {
          result.push(to);
        }
      }
    };
    var _render = function (list: { x: number; y: number }[]) {
      //找线路
      var new_list: { x: number; y: number }[] = [];
      var next = function (
        from: { x: number; y: number },
        to: { x: number; y: number; change?: 1 }
      ) {
        var value = _getValue(to.x, to.y);
        if (value < 1) {
          //当前点是否可以走
          if (value == -1) {
            to.x = (to.x + x_length) % x_length;
            to.y = (to.y + y_length) % y_length;
            to.change = 1;
          }
          if (to.x == options.end.x && to.y == options.end.y) {
            steps[to.y][to.x] = from;
            finded = true;
          } else if (!steps[to.y][to.x]) {
            steps[to.y][to.x] = from;
            new_list.push(to);
          }
        }
      };
      list.forEach(function (current) {
        next(current, { y: current.y + 1, x: current.x });
        next(current, { y: current.y, x: current.x + 1 });
        next(current, { y: current.y - 1, x: current.x });
        next(current, { y: current.y, x: current.x - 1 });
      });
      if (!finded && new_list.length) {
        _render(new_list);
      }
    };
    _render([options.start]);
    if (finded) {
      var current = options.end;
      if (options.type == "path") {
        while (current.x != options.start.x || current.y != options.start.y) {
          result.unshift(current);
          current = steps[current.y][current.x];
        }
      } else if (options.type == "next") {
        _next({ x: current.x + 1, y: current.y });
        _next({ x: current.x, y: current.y + 1 });
        _next({ x: current.x - 1, y: current.y });
        _next({ x: current.x, y: current.y - 1 });
      }
    }
    return result;
  }
}
