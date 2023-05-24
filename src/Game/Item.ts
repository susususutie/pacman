import Event from './Event';

/** 0表示普通对象(不与地图绑定),1表示玩家控制对象,2表示程序控制对象 */
enum ItemType {
    NORMAL = 0,
    PLAYER = 1,
    AI = 2,
}

/** 0表示未激活/结束,1表示正常,2表示暂停,3表示临时,4表示异常 */
enum ItemStatus {
    INIT = 0,
    NORMAL = 1,
    PAUSE = 2,
    TEMP = 3,
    ERROR = 4,
}

enum Orientation {
    RIGHT = 0,
    DOWN = 1,
    LEFT = 2,
    TOP = 3,
}

interface SizePower {
    x: number;
    y: number;
    width: number;
    height: number;
}

type ItemParams = {
    x: number;
    y: number;
    width: number;
    height: number;
    type: ItemType;
    status: ItemStatus;
    color: string;
    orientation: Orientation;
    speed: number;
    // TODO
};

class Item extends Event implements SizePower {
    _id: number = 0;
    // size
    x: number = 0;
    y: number = 0;
    width: number = 20;
    height: number = 20;
    //
    type: ItemType = ItemType.NORMAL;
    status: ItemStatus = ItemStatus.INIT;
    color: string = '#FFF';
    //
    orientation: Orientation = Orientation.RIGHT;
    speed: number = 0;
    location = null;
    coord = null;
    path = [];
    vector = null;
    // layout
    frames = 1; //   速度等级,内部计算器times多少帧变化一次
    times = 0; //    刷新画布计数(用于循环动画状态判断)
    timeout = 0; //  倒计时(用于过程动画状态判断)
    control = {}; // 控制缓存,到达定位点时处理
    _stage = [];
    game: any;
    //
    _params: any;
    _settings: any;

    constructor(params: Partial<ItemParams> = {}) {
        super();
        this.#updateParams(params);
    }

    update() {} //更新参数信息
    draw() {} //绘制

    #updateParams(params: Partial<ItemParams>) {
        // TODO
    }
}

export default Item;
