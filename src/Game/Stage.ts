//布景对象构造器
export default class Stage {
  constructor(params) {
    this._params = params || {};
    this._settings = {
      index: 0,
      status: 0,
      maps: [],
      audio: [],
      images: [],
      items: [],
      timeout: 0,
      update: function () {}, //嗅探,处理布局下不同对象的相对关系
    };
    Object.assign(this, this._settings, this._params);
  }
  //添加对象
  createItem(options) {
    var item = new Item(options);
    //动态属性
    if (item.location) {
      Object.assign(item, item.location.coord2position(item.coord.x, item.coord.y));
    }
    //关系绑定
    item._stage = this;
    item._id = this.items.length;
    this.items.push(item);
    return item;
  }
  //重置物体位置
  resetItems() {
    this.status = 1;
    this.items.forEach(function (item, index) {
      Object.assign(item, item._settings, item._params);
      if (item.location) {
        Object.assign(item, item.location.coord2position(item.coord.x, item.coord.y));
      }
    });
  }
  //获取对象列表
  getItemsByType(type) {
    return this.items.filter(function (item) {
      return item.type == type;
    });
  }
  //添加地图
  createMap(options) {
    var map = new Map(options);
    //动态属性
    map.data = JSON.parse(JSON.stringify(map._params.data));
    map.y_length = map.data.length;
    map.x_length = map.data[0].length;
    map.imageData = null;
    //关系绑定
    map._stage = this;
    map._id = this.maps.length;
    this.maps.push(map);
    return map;
  }
  //重置地图
  resetMaps() {
    this.status = 1;
    this.maps.forEach(function (map) {
      Object.assign(map, map._settings, map._params);
      map.data = JSON.parse(JSON.stringify(map._params.data));
      map.y_length = map.data.length;
      map.x_length = map.data[0].length;
      map.imageData = null;
    });
  }
  //重置
  reset() {
    Object.assign(this, this._settings, this._params);
    this.resetItems();
    this.resetMaps();
  }
  //绑定事件
  bind(eventType, callback) {
    if (!_events[eventType]) {
      _events[eventType] = {};
      window.addEventListener(eventType, function (e) {
        var key = 's' + _index;
        if (_events[eventType][key]) {
          _events[eventType][key](e);
        }
        e.preventDefault();
      });
    }
    _events[eventType]['s' + this.index] = callback.bind(this); //绑定事件作用域
  }
}
