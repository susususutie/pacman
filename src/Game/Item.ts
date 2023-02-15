export default class Item {
  _id = 0;
  _index
  _params: any;
  _settings: any;
  _stage: any;
  game:any

  constructor(params) {
    this._params = params || {};
    this._id = 0; //标志符
    this._stage = null; //与所属布景绑定
    this._settings = {
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
    Object.assign(this, this._settings, this._params);
  }
  bind(eventType, callback) {
    if (!_events[eventType]) {
      _events[eventType] = {};
      $canvas.addEventListener(eventType, function (e) {
        var position = _.getPosition(e);
        _stages[_index].items.forEach(function (item) {
          if (
            item.x <= position.x &&
            position.x <= item.x + item.width &&
            item.y <= position.y &&
            position.y <= item.y + item.height
          ) {
            var key = "s" + _index + "i" + item._id;
            if (_events[eventType][key]) {
              _events[eventType][key](e);
            }
          }
        });
        e.preventDefault();
      });
    }
    _events[eventType]["s" + this._stage.index + "i" + this._id] =
      callback.bind(this); //绑定作用域
  }
}
