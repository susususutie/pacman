import Item from './Item';
import type ItemOptions from './Item';
import Game from './Game';
import Map from './Map';
import type MapOptions from './Map';

type StageOptions = {};

//布景对象构造器
export default class Stage {
  game: Game;
  index: number = 0;
  status: number = 0;
  maps: Map[] = [];
  audio: any[] = [];
  images: any[] = [];
  items: Item[] = [];
  timeout: number = 0;
  update?: () => boolean;

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
  createItem(options: Exclude<ItemOptions, 'stage'>) {
    let item = new Item({ ...options, stage: this });
    // 动态属性
    if (item.location && item.coord) {
      const newLocation = item.location.coord2position(item.coord.x, item.coord.y);
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
        const newLocation = item.location.coord2position(item.coord.x, item.coord.y);
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
    this.maps.forEach(map => {
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
  bind(
    eventType: keyof GlobalEventHandlersEventMap,
    callback: (ev: GlobalEventHandlersEventMap[typeof eventType]) => any
  ) {
    if (!this.game.g_events[eventType]) {
      this.game.g_events[eventType] = {};
      window.addEventListener<typeof eventType>(eventType, e => {
        const key = ('s' + this.game._index) as `s${number}`;
        const evnType = this.game.g_events[eventType];
        if (evnType) {
          const cback = evnType[key];
          cback.bind(this)(e);
        }
        e.preventDefault();
      });
    }
    this.game.g_events[eventType]![`s${this.index}`] = callback.bind<typeof this>(this); //绑定事件作用域
  }
}
