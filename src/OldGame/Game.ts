import Stage from './Stage';
import type StageOptions from './Stage';

export type GameOption = {};

type EnvCallback<T extends keyof GlobalEventHandlersEventMap> = Record<
    `s_${number}`,
    (this: typeof Map, ev: GlobalEventHandlersEventMap[T]) => any
>;
type EventsMap = {
    [EnvType in keyof GlobalEventHandlersEventMap]?: Record<
        `s${number}`,
        (this: typeof Stage, ev: GlobalEventHandlersEventMap[EnvType]) => any
    >;
};

/*
 * 小型游戏引擎
 */
export default class Game {
    /** 画布宽度 */
    width: number;
    /** 画布高度 */
    height: number;
    /** 事件集合 */
    g_events: EventsMap = {};
    /** 当前布景索引 */
    _index: number = 0;
    /** 布景对象队列 */
    _stages: Stage[] = [];
    /** 帧动画控制 */
    _hander?: number;
    /**  */
    canvas: HTMLCanvasElement;
    /**  */
    _context: CanvasRenderingContext2D;

    constructor(id: string, params?: GameOption) {
        const { width, height } = { width: 960, height: 640, ...params };
        this.width = width;
        this.height = height;

        const canvas = document.querySelector<HTMLCanvasElement>(`#${id}`);
        if (!canvas) throw new Error('没有找到canvan元素');

        this.canvas = canvas;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this._context = this.canvas.getContext('2d')!; //画布上下文环境
    }

    // 动画结束
    stop() {
        this._hander && cancelAnimationFrame(this._hander);
    }

    // 事件坐标
    getPosition(e: MouseEvent) {
        var box = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - box.left * (this.width / box.width),
            y: e.clientY - box.top * (this.height / box.height),
        };
    }

    // 创建布景
    createStage(options: StageOptions) {
        var stage = new Stage(this, options);
        stage.index = this._stages.length;
        this._stages.push(stage);
        return stage;
    }

    // 指定布景
    setStage(index: number) {
        this._stages[this._index].status = 0;
        this._index = index;
        this._stages[this._index].status = 1;
        this._stages[this._index].reset(); //重置
        return this._stages[this._index];
    }

    // 下个布景
    nextStage() {
        if (this._index < this._stages.length - 1) {
            return this.setStage(++this._index);
        } else {
            throw new Error('unfound new stage.');
        }
    }

    // 获取布景列表
    getStages() {
        return this._stages;
    }

    // 初始化游戏引擎
    init() {
        this._index = 0;
        this.start();
    }

    // 动画开始
    start() {
        let f = 0; //帧数计算
        let timestamp = new Date().getTime();
        const fn = () => {
            var now = new Date().getTime();
            if (now - timestamp < 16) {
                // 限频，防止高刷屏幕动画过快
                this._hander = requestAnimationFrame(fn);
                return false;
            }
            timestamp = now;
            var stage = this._stages[this._index];
            this._context.clearRect(0, 0, this.width, this.height); //清除画布
            this._context.fillStyle = '#000000';
            this._context.fillRect(0, 0, this.width, this.height);
            f++;
            if (stage.timeout) {
                stage.timeout--;
            }
            if (stage.update && stage.update() !== false) {
                //update返回false,则不绘制
                stage.maps.forEach(map => {
                    if (!(f % map.frames)) {
                        map.times = f / map.frames; //计数器
                    }
                    if (map.cache) {
                        if (!map.imageData) {
                            this._context.save();
                            map.draw(this._context);
                            map.imageData = this._context.getImageData(0, 0, this.width, this.height);
                            this._context.restore();
                        } else {
                            this._context.putImageData(map.imageData, 0, 0);
                        }
                    } else {
                        map.update();
                        map.draw(this._context);
                    }
                });
                stage.items.forEach(item => {
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
                        item?.update?.();
                    }
                    item?.draw?.(this._context);
                });
            }
            this._hander = requestAnimationFrame(fn);
        };
        this._hander = requestAnimationFrame(fn);
    }
}
