const randomInt = (min,max) => ~~(Math.random() * (max - min + 1)) + min;
class Maze{
    /**
     * 构造方法
     * @param {number} w 地图通道宽（不包括墙体）
     * @param {number} h 地图通道高（不包括墙体）
     * @param {object}   可选项
     *  - object.render  渲染方法
     */
    constructor(w,h,option){
        const _ts = this;

        option = option || {};

        _ts.w = w;
        _ts.h = h;
        _ts.list = [];                  // 保存所有列表
        _ts.notVisited = [];            // 保存未访问过的列表
        _ts.history = [];               // 保存访问过的列表
        _ts.render = option.render;     // 定义渲染方法

        _ts.map = this.createMap();
        _ts.createMaze();  
    }

    /**
     * 为地图生成迷宫的方法
     */
    createMaze(){
        const _ts = this;

        // 随机取一个空格子的索引作为起始点
        let startIndex = _ts.notVisited[0,randomInt(0,_ts.notVisited.length - 1)],
            each;

        (each = index => {
            // 如果当前索引点未添加到历史列表（即未被访问过），则将其添加到历史列表中
            if(_ts.history.indexOf(index) < 0){
                _ts.history.push(index);

                // 从未访问列表中移除
                let removeIndex = _ts.notVisited.indexOf(index);
                _ts.notVisited.splice(removeIndex,1);
            };

            // 获取当前点四周的空格子
            let around = _ts.getAround(index);

            // 如果有获取到周围有空格子，则随机选择一个并打通与该格子之间的墙。之后将随机选择的点作为起点重新寻找
            if(around.length){
                let selectIndex = around[randomInt(0,around.length - 1)],
                    wall = _ts.getWall(index,selectIndex);
                
                // 将墙设置为空格子
                _ts.set(wall,1);
                
                // 将新选择的格子作为起点重新寻找
                each(selectIndex);
            }
            // 直到所有的空格子都被访问到，如果还有未访问到的，则从已经访问的列表中随机抽取一个继续寻找
            else if(_ts.notVisited.length){
                each(_ts.history[randomInt(0,_ts.history.length - 1)]);
            };
        })(startIndex);
    }

    /**
     * 获取周围不在历史记录中的空格子
     * @param {number} index 空格子的索引值
     * @return {array} 返回四周相邻的空格子索引
     */
    getAround(index){
        const _ts = this;
        let result = [],
            temp = [];

        // 获取到索引对应格子的位置
        let y = ~~(index / (2 * _ts.w + 1)),
            x = index % (2 * _ts.w + 1),
            pos;

        if(!(y % 2) || !(x % 2)){
            throw new Error("传入的索引位置不是空格子");
        };

        // 获取上方的格子
        if(y > 2){
            pos = index - (_ts.w * 4 + 2);
            // _ts.set(pos,'w');
            temp.push(pos);
        };

        // 获取右边的格子
        if(x < 2 * _ts.w - 2){
            pos = index + 2;
            // _ts.set(pos,'d');
            temp.push(pos);
        };

        // 获取下方的格子
        if(y < 2 * _ts.h - 2){
            pos = index + (_ts.w * 4 + 2);
            // _ts.set(pos,'s');
            temp.push(pos);
        };

        // 获取左边的格子
        if(x > 2){
            pos = index - 2;
            // _ts.set(pos,'a');
            temp.push(pos);
        };

        // 过滤已经访问过的格子
        for(let i=0,len=temp.length; i<len; i++){
            let item = temp[i];
            if(_ts.history.indexOf(item) < 0){
                result.push(item);
            };
        };
        return result;
    }

    /**
     * 获取两个空格子之间的墙
     * @param {number} indexA 格子A索引值
     * @param {number} indexB 格子B索引值
     * @return {number} 返回两个格子之间强面的索引值
     */
    getWall(indexA,indexB){
        const _ts = this,
            gap = Math.abs(indexA-indexB);

        if(gap == 2){
            return indexA > indexB ? indexA - 1 : indexA + 1;
        }else if(gap == 4 * _ts.w + 2){
            return indexA > indexB ? indexA - (2 * _ts.w + 1) : indexA + (2 * _ts.w + 1);
        }else{
            throw new Error('传入的索引值并不是指向两个相邻的格子');
        };
    }

    /**
     * 创建地图二维数据(四周为墙，每个空格子之间也有墙隔开)
     * @return {array} 生成的地图二维数据
     */
    createMap(){
        const _ts = this;
        let result = [],
            index = 0;
        for(let i=0; i<_ts.h * 2 + 1; i++){
            result[i] = (()=>{
                let row = [];
                for(let j=0; j<_ts.w * 2 + 1; j++){
                    let val = (i+1) % 2 || (j + 1) % 2 ? 0 : 1;
                    row.push(val);

                    // 记录所有格子列表，方便对格子写数据
                    let pos = [j,i];
                    _ts.list.push(pos);

                    // 如果格子是空的，则将其索引加入记录
                    if(val){
                        _ts.notVisited.push(index);
                    };

                    // 渲染方法调用
                    if(typeof _ts.render === 'function'){
                        _ts.render(index,[j,i],val);
                    };

                    // 格子索引递加
                    index++;
                };
                return row;
            })();
        };
        return result;
    }

    /**
     * 为指定索引位置的格子写入值
     * @param {number} index 格子位置索引
     * @param {number} val 格子需要设置的值
     */
    set(index,val){
        const _ts = this,
            pos = this.list[index];
        _ts.map[pos[1]][pos[0]] = val;

        // 渲染方法调用
        if(typeof _ts.render === 'function'){
            _ts.render(index,pos,val);
        };
    }

    /**
     * 打印地图
     */
    debug(){
        const _ts = this,
        map = _ts.map;
        map.forEach((item,index)=>{
            console.log(item.join("  "))
        });
    }
};

// let maze = new Maze(6,6);
// maze.debug();