type GameOption = {};

/*
 * 小型游戏引擎
 */
class Game {
  /** 画布宽度 */
  width: number;
  /** 画布高度 */
  height: number;
  /** 事件集合 */
  g_events: EventsMap = {}
  /** 当前布景索引 */
  _index: number = 0;

  constructor(id: string, params?: GameOption) {
    const { width, height } = { width: 960, height: 640, ...params };
    this.width = width;
    this.height = height;

    const thisGame = this;
    const $canvas = document.querySelector<HTMLCanvasElement>(`#${id}`);
    if (!$canvas) throw new Error("没有找到canvan元素");

    $canvas.width = this.width;
    $canvas.height = this.height;
    const _context = $canvas.getContext("2d")!; //画布上下文环境
    var _stages = []; //布景对象队列
    var _hander; //帧动画控制

    
    //动画开始
    this.start = function () {
      var f = 0; //帧数计算
      var timestamp = new Date().getTime();
      var fn = function () {
        var now = new Date().getTime();
        if (now - timestamp < 16) {
          // 限频，防止高刷屏幕动画过快
          _hander = requestAnimationFrame(fn);
          return false;
        }
        timestamp = now;
        var stage = _stages[_index];
        _context.clearRect(0, 0, thisGame.width, thisGame.height); //清除画布
        _context.fillStyle = "#000000";
        _context.fillRect(0, 0, thisGame.width, thisGame.height);
        f++;
        if (stage.timeout) {
          stage.timeout--;
        }
        if (stage.update() != false) {
          //update返回false,则不绘制
          stage.maps.forEach(function (map) {
            if (!(f % map.frames)) {
              map.times = f / map.frames; //计数器
            }
            if (map.cache) {
              if (!map.imageData) {
                _context.save();
                map.draw(_context);
                map.imageData = _context.getImageData(
                  0,
                  0,
                  thisGame.width,
                  thisGame.height
                );
                _context.restore();
              } else {
                _context.putImageData(map.imageData, 0, 0);
              }
            } else {
              map.update();
              map.draw(_context);
            }
          });
          stage.items.forEach(function (item) {
            if (!(f % item.frames)) {
              item.times = f / item.frames; //计数器
            }
            if (stage.status == 1 && item.status != 2) {
              //对象及布景状态都不处于暂停状态
              if (item.location) {
                item.coord = item.location.position2coord(item.x, item.y);
              }
              if (item.timeout) {
                item.timeout--;
              }
              item.update();
            }
            item.draw(_context);
          });
        }
        _hander = requestAnimationFrame(fn);
      };
      _hander = requestAnimationFrame(fn);
    };
    //动画结束
    this.stop = function () {
      _hander && cancelAnimationFrame(_hander);
    };
    //事件坐标
    this.getPosition = function (e) {
      var box = $canvas.getBoundingClientRect();
      return {
        x: e.clientX - box.left * (thisGame.width / box.width),
        y: e.clientY - box.top * (thisGame.height / box.height),
      };
    };
    //创建布景
    this.createStage = function (options) {
      var stage = new Stage(this, options);
      stage.index = _stages.length;
      _stages.push(stage);
      return stage;
    };
    //指定布景
    this.setStage = function (index) {
      _stages[_index].status = 0;
      _index = index;
      _stages[_index].status = 1;
      _stages[_index].reset(); //重置
      return _stages[_index];
    };
    //下个布景
    this.nextStage = function () {
      if (_index < _stages.length - 1) {
        return this.setStage(++_index);
      } else {
        throw new Error("unfound new stage.");
      }
    };
    //获取布景列表
    this.getStages = function () {
      return _stages;
    };
    //初始化游戏引擎
    this.init = function () {
      _index = 0;
      this.start();
    };
  }
}

export default Game;

type ItemOptions = {
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
class Item {
  // crate 时的参数
  _params: ItemOptions;
  // 默认数据
  _settings = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    type: 0,
    color: "#F00",
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
  color: string = "#F00";
  status: number = 1;
  orientation: number = 0;
  speed: number = 0;

  //地图相关
  location: Map;
  coord: { x: number; y: number };
  path: any[] = [];
  vector: any = null;

  //布局相关
  frames: number = 1;
  times: number = 0;
  timeout: number = 0;
  control = {};

  reset(): void {
    // const conf = {...this._settings, ...this._params};
    // this._id = conf._id;
    Object.assign(this, { ...this._settings, ...this._params });
  }

  constructor(params: ItemOptions) {
    this._params = params || {};
    this._stage = params.stage;
    this.reset();
  }
}

type MapOptions = {
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
class Map {
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

type StageOptions = {};

type EnvCallback<T extends keyof GlobalEventHandlersEventMap> = Record<`s_${number}`, (this: typeof Map, ev: GlobalEventHandlersEventMap[T]) => any>
type EventsMap = {
  [EnvType in keyof GlobalEventHandlersEventMap]?: Record<`s${number}`, (this: Stage, ev: GlobalEventHandlersEventMap[T]) => any>
}

//布景对象构造器
class Stage {
  game: Game;
  index: number = 0;
  status: number = 0;
  maps: Map[] = [];
  audio: any[] = [];
  images: any[] = [];
  items: Item[] = [];
  timeout: number = 0;

  _params: StageOptions;
  _settings = {
    index: 0,
    status: 0,
    maps: [],
    audio: [],
    images: [],
    items: [],
    timeout: 0,
    update: function () {}, //嗅探,处理布局下不同对象的相对关系
  };

  resetOption() {
    Object.assign(this, this._settings, this._params);
  }
  constructor(game: Game, params: StageOptions) {
    this.game = game;

    this._params = params || {};
    Object.assign(this, this._settings, this._params);
  }

  // 添加对象
  createItem(options: Exclude<ItemOptions, "stage">) {
    let item = new Item({ ...options, stage: this });
    // 动态属性
    if (item.location) {
      const newLocation = item.location.coord2position(
        item.coord.x,
        item.coord.y
      );
      item.x = newLocation.x;
      item.y = newLocation.y;
    }
    item._id = this.items.length;
    this.items.push(item);
    return item;
  }

  // 重置物体位置
  resetItems() {
    this.status = 1;
    this.items.forEach((item, index) => {
      item.reset();
      if (item.location) {
        const newLocation = item.location.coord2position(
          item.coord.x,
          item.coord.y
        );
        item.x = newLocation.x;
        item.y = newLocation.y;
      }
    });
  }

  // 获取对象列表
  getItemsByType(type: number) {
    return this.items.filter(item => item.type == type);
  }

  // 添加地图
  createMap(options: MapOptions) {
    const map = new Map({ ...options, stage: this });
    // 动态属性
    map.data = JSON.parse(JSON.stringify(map._params.data));
    map.y_length = map.data.length;
    map.x_length = map.data[0].length;
    map.imageData = null;
    
    // 关系绑定
    map._stage = this;
    map._id = this.maps.length;
    this.maps.push(map);
    return map;
  }

  // 重置地图
  resetMaps() {
    this.status = 1;
    this.maps.forEach((map) => {
      Object.assign(map, map._settings, map._params);
      map.data = JSON.parse(JSON.stringify(map._params.data));
      map.y_length = map.data.length;
      map.x_length = map.data[0].length;
      map.imageData = null;
    });
  }
  
  // 重置
  reset() {
    Object.assign(this, this._settings, this._params);
    this.resetItems();
    this.resetMaps();
  }

  // 绑定事件
  bind(eventType: keyof GlobalEventHandlersEventMap, callback: (this: typeof this, ev: GlobalEventHandlersEventMap[typeof eventType]) => any) {
    if (!this.game.g_events[eventType]) {
      this.game.g_events[eventType] = {};
      window.addEventListener<typeof eventType>(eventType,  (e) => {
        const key = "s" + this.game._index as `s${number}`;
        const evnType = this.game.g_events[eventType];
        if(evnType) {
          const cback =  evnType[key];
          cback.bind(this)(e)
        }
        e.preventDefault();
      });
    }
    this.game.g_events[eventType]![`s${this.index}`] = callback.bind(this); //绑定事件作用域
  }
}