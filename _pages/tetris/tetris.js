var TETRIS_ROWS = 20;   //20行
var TETRIS_COLS = 14;   //14列 
var CELL_SIZE = 25;     //一个格子大小

var tetris_canvas;  //canvas元素的tetris_canvas对象，在createCanvas
var tetris_ctx; //CanvasRenderingContext2D对象，在createCanvas

var curScore = 0;   //当前积分值

var curSpeed = 1;   //当前速度

var maxScore = 0;   //最大积分值

var curScoreEle , curSpeedEle , maxScoreEle;
//引用拥有制定ID的第一个对象，在window.onload

var curTimer;//setInterval() 返回的ID值，curTimer = setInterval("moveDown();" ,  500 / curSpeed);

var isPlaying = true; //判断游戏是否结束

var NO_BLOCK = 0;
var currentFall;
colors = ["#fff", "#f00" , "#0f0" , "#00f"
    , "#c60" , "#f0f" , "#0ff" , "#609"];

//该数组用于记录底下已经固定的方块,初始化为没有方块
var tetris_status=[];
for (var i = 0; i < TETRIS_ROWS; i++)
{
    tetris_status[i]=[];
    for (var j = 0; j < TETRIS_COLS; j++)
    {
        tetris_status[i][j] = NO_BLOCK;

    }
}

//定义几种可能出现的方块组合，相当于一个二维数组blockArr[7][4]
var blockArr = [

    [   {x:TETRIS_COLS/2-1,y:0,color:1},      //1. Z形方块组合
        {x:TETRIS_COLS/2,y:0,color:1},
        {x:TETRIS_COLS/2,y:1,color:1},
        {x:TETRIS_COLS/2+1,y:1,color:1}     
    ],
    [   {x:TETRIS_COLS/2+1,y:0,color:2},      //2. 反Z形方块组合
        {x:TETRIS_COLS/2,y:0,color:2},
        {x:TETRIS_COLS/2,y:1,color:2},
        {x:TETRIS_COLS/2-1,y:1,color:2}
    ],
    [   {x:TETRIS_COLS/2-1,y:0,color:3},      //3. 田形方块组合
        {x:TETRIS_COLS/2,y:0,color:3},
        {x:TETRIS_COLS/2-1,y:1,color:3},
        {x:TETRIS_COLS/2,y:1,color:3}
    ],
    [   {x:TETRIS_COLS/2,y:0,color:4},      //4. L形方块组合
        {x:TETRIS_COLS/2,y:1,color:4},
        {x:TETRIS_COLS/2,y:2,color:4},
        {x:TETRIS_COLS/2+1,y:2,color:4}
    ],  
    [   {x:TETRIS_COLS/2,y:0,color:5},      //5. J形方块组合
        {x:TETRIS_COLS/2,y:1,color:5},
        {x:TETRIS_COLS/2,y:2,color:5},
        {x:TETRIS_COLS/2-1,y:2,color:5}
    ],
    [   {x:TETRIS_COLS/2,y:0,color:6},      //6. 竖形方块组合
        {x:TETRIS_COLS/2,y:1,color:6},
        {x:TETRIS_COLS/2,y:2,color:6},
        {x:TETRIS_COLS/2,y:3,color:6}
    ],  
    [   {x:TETRIS_COLS/2,y:0,color:7},      //7. 凸形方块组合
        {x:TETRIS_COLS/2-1,y:1,color:7},
        {x:TETRIS_COLS/2,y:1,color:7},
        {x:TETRIS_COLS/2+1,y:1,color:7}
    ]
]

//定义正在掉落的方块
var initBlock =function()
{
    //随机生成正在掉落的方块（0-6）
    //math.floor(x)返回小于参数x的最大整数,即对浮点数向下取整.
    //Math.random()是令系统随机选取大于等于 0.0 且小于 1.0 的伪随机 double 值
    var rand = Math.floor (Math.random() * blockArr.length);

    //第rand+1种方块组合，每种组合四个方块组成，
    currentFall = [
        {x:blockArr[rand][0].x, y: blockArr[rand][0].y, color: blockArr[rand][0].color},
        {x:blockArr[rand][1].x, y: blockArr[rand][1].y, color: blockArr[rand][1].color},
        {x:blockArr[rand][2].x, y: blockArr[rand][2].y, color: blockArr[rand][2].color},
        {x:blockArr[rand][3].x, y: blockArr[rand][3].y, color: blockArr[rand][3].color}
    ];
}
//注意：tetris_status[y][x]，因为二维数组竖直方向为i（行数）=纵坐标y，横向为j（列数）=横坐标x

var createCanvas = function(rows ,cols ,cellWidth ,cellHeight)  //定义了一个函数，需要四个参数
{
    //新建canvas元素的tetris_canvas对象
    //document.createElement()与document.appendChild()联用
    //tetris_canvas = document.getElementById("canvas");这种方法刷新页面不能继续游戏而是重新开始游戏
    tetris_canvas = document.createElement("canvas");      
    //设置canvas组件的高度、宽度
    tetris_canvas.width = cols * cellWidth;
    tetris_canvas.height = rows * cellHeight;

    //设置组件边框
    tetris_canvas.style.border="1px solid black";

    //获取canvas上的绘图API
    //获取canvas上绘图的CanvasRenderingContext2D对象
    tetris_ctx=tetris_canvas.getContext('2d'); 

    //开始创建路径
    tetris_ctx.beginPath();

    //绘制横向网格对应的路径,画网格里面的横线
    for (var i=1; i < TETRIS_ROWS ; i++)               
    {
        tetris_ctx.moveTo(0 , i * CELL_SIZE);         
        //把当前路径结束点移动到(0 , i * CELL_SIZE),比如刚开始(0,a)
        tetris_ctx.lineTo(TETRIS_COLS * CELL_SIZE , i * CELL_SIZE); 
        //从当前结束点连接到(TETRIS_COLS * CELL_SIZE , i * CELL_SIZE),比如从(0,0)到(14*a,0);(0,a)-(14a,a)
    }

    //绘制竖向网格对应的路径
    for (var i=1; i < TETRIS_COLS ; i++)
    {
        tetris_ctx.moveTo(i * CELL_SIZE , 0);
        tetris_ctx.lineTo(i * CELL_SIZE , TETRIS_ROWS * CELL_SIZE);
    }

    tetris_ctx.closePath();//关闭前面定义的路径
    //设置笔触颜色，绘制路径填充风格，当前为纯色；fillStyle是填充路径填充风格
    tetris_ctx.strokeStyle="#314478";
    //设置线条粗细
    tetris_ctx.lineWidth=1;
    //绘制线条
    tetris_ctx.stroke();
}


//判断是否有一行已满
var lineFull =function()
{
    // 遍历每一行
    for (var i = 0; i < TETRIS_ROWS ; i++ )
    {
        var flag = true;        // 用flag标志是否有行已经满了

        // 遍历当前行每个单元格
        for (var j = 0 ; j < TETRIS_COLS ; j++ )
        {
            if(tetris_status[i][j] == NO_BLOCK)
            {
                flag = false;       //有空格，跳出该行循环
                break;
            }
        }
        // flag = true，该行已满
        if(flag)
        {
            // 当前积分+100
            curScoreEle.innerHTML = curScore+= 100;
            // 记录当前积分
            localStorage.setItem("curScore" , curScore);

            // 如果当前积分到达升级的极限
            if( curScore >= curSpeed * curSpeed * 500)
            {
                curSpeedEle.innerHTML = curSpeed += 1;
                // 记录当前速度
                localStorage.setItem("curSpeed" , curSpeed);

                clearInterval(curTimer);
                curTimer = setInterval("moveDown();" ,  500 / curSpeed);
                //etInterval() 方法会不停地调用函数，
                //直到 clearInterval() 被调用或窗口被关闭。
                //由 setInterval() 返回的 ID 值可用作 clearInterval() 方法的参数。
            }
            // 当前行的所有方块下移一行
            for (var k = i ; k > 0 ; k--)
            {
                for (var l = 0; l < TETRIS_COLS ; l++ )
                {
                    tetris_status[k][l] =tetris_status[k-1][l];
                }
            }
            // 重新绘制一遍方块
            drawBlock();      
        }
    }
}
//处理掉落方块组合
var moveDown = function()
{
    // 判断是否能掉落的标志
    var canDown = true;    
    // 遍历正在掉落的组合的每一个方块，判断是否能掉落
    for (var i = 0 ; i < currentFall.length ; i++)
    {
        // 已经到了底部
        if(currentFall[i].y >= TETRIS_ROWS - 1)
        {
            canDown = false;
            break;
        }
        // 下一格已经有方块
        if(tetris_status[currentFall[i].y + 1][currentFall[i].x] != NO_BLOCK)
        {
            canDown = false;
            break;
        }
    }
    // 如果可以掉落
    if(canDown)
    {
        // 首先将正在掉落的组合的每一格子涂成白色
        for (var i = 0 ; i < currentFall.length ; i++)
        {
            //cur代表组合的每一个格子（0 1 2 3）
            var cur = currentFall[i];
            // 填充白色
            tetris_ctx.fillStyle = 'white';
            // 绘制矩形 fillRect(x ,y ,width, height)
            tetris_ctx.fillRect(cur.x * CELL_SIZE + 1 
                , cur.y * CELL_SIZE + 1 , CELL_SIZE - 2 , CELL_SIZE - 2);
        }
        //  遍历组合每一个格子，下落一格，y坐标+1                                                                              
        for (var i = 0 ; i < currentFall.length ; i++)
        {
            var cur = currentFall[i];
            cur.y ++;
        }
        // 下落后涂色
        for (var i = 0 ; i < currentFall.length ; i++)
        {
            var cur = currentFall[i];
            // 填充颜色，colors[]在数据模型定义了数组
            tetris_ctx.fillStyle = colors[cur.color];
            // 绘制矩形
            tetris_ctx.fillRect(cur.x * CELL_SIZE + 1 
                , cur.y * CELL_SIZE + 1 , CELL_SIZE - 2 , CELL_SIZE - 2);
        }
    }
    // 若不能下落
    else
    {
        // ±éÀúÃ¿¸ö·½¿é, °ÑÃ¿¸ö·½¿éµÄÖµ¼ÇÂ¼µ½tetris_statusÊý×éÖÐ
        for (var i = 0 ; i < currentFall.length ; i++)
        {
            var cur = currentFall[i];
            // 如果有方块已经到了最上面，表明输了
            if(cur.y < 2)
            {

                localStorage.removeItem("curScore");        // 清空Local Storage当前积分值
                localStorage.removeItem("tetris_status");   // 清空Local Storage当前游戏状态
                localStorage.removeItem("curSpeed");        // 清空Local Storage当前速度
                if(confirm("You loss, would you want to record this score?"))     //confirm对话框提示游戏结束
                {
                    // 读取Local Storage里面maxsScore记录
                    maxScore = localStorage.getItem("maxScore");
                    maxScore = maxScore == null ? 0 : maxScore ;
                    // 如果当前积分大于localStorage最高积分
                    if(curScore >= maxScore)
                    {
                        // 记录最高分
                        localStorage.setItem("maxScore" , curScore);
                    }
                }
                // 游戏结束
                isPlaying = false;
                // 清楚计时器——该控制器控制方块组合不断向下掉落
                clearInterval(curTimer);  
                return;
            }
            // 还没有输，把把每个方块当前所在位置赋为当前方块颜色值       
            tetris_status[cur.y][cur.x] = cur.color;
        }

        lineFull(); // 判断是否有可消除的行   
        // 使用Local Storage记录游戏状态
        localStorage.setItem("tetris_status" , JSON.stringify(tetris_status));
        //开始新组块
        initBlock();
    }
}
// 绘制俄罗斯方块的状态
var drawBlock = function()
{
    for (var i = 0; i < TETRIS_ROWS ; i++ )
    {
        for (var j = 0; j < TETRIS_COLS ; j++ )
        {
            // 有方块的地方绘制颜色
            if(tetris_status[i][j] != NO_BLOCK)
            {
                // 填充颜色
                tetris_ctx.fillStyle = colors[tetris_status[i][j]];
                // 绘制矩形
                tetris_ctx.fillRect(j * CELL_SIZE + 1 
                    , i * CELL_SIZE + 1, CELL_SIZE - 2 , CELL_SIZE - 2);
            }
            // 没有方块地方绘制白色
            else
            {
                // 填充颜色
                tetris_ctx.fillStyle = 'white';
                // 绘制矩形
                tetris_ctx.fillRect(j * CELL_SIZE + 1 
                    , i * CELL_SIZE + 1 , CELL_SIZE - 2 , CELL_SIZE - 2);
            }
        }
    }
}
// 左移方块函数
var moveLeft = function()
{
    // 是否能左移标志
    var canLeft = true;
    for (var i = 0 ; i < currentFall.length ; i++)
    {
        // 如果到了最左边不能移动
        if(currentFall[i].x <= 0)
        {
            canLeft = false;
            break;
        }
        // 左边位置已经有方块
        if (tetris_status[currentFall[i].y][currentFall[i].x - 1] != NO_BLOCK)
        {
            canLeft = false;
            break;
        }
    }
    // 如果能左移
    if(canLeft)
    {
        // 左移前每个方块背景涂成白色
        for (var i = 0 ; i < currentFall.length ; i++)
        {
            var cur = currentFall[i];
            // 填充颜色
            tetris_ctx.fillStyle = 'white';
            // 绘制矩形
            tetris_ctx.fillRect(cur.x * CELL_SIZE +1 
                , cur.y * CELL_SIZE + 1 , CELL_SIZE - 2, CELL_SIZE - 2);
        }
        // 左移组合
        for (var i = 0 ; i < currentFall.length ; i++)
        {
            var cur = currentFall[i];
            cur.x --;
        }
        // 左移后方块涂成相应颜色
        for (var i = 0 ; i < currentFall.length ; i++)
        {
            var cur = currentFall[i];
            // 填充颜色
            tetris_ctx.fillStyle = colors[cur.color];
            // 绘制矩形
            tetris_ctx.fillRect(cur.x * CELL_SIZE + 1  
                , cur.y * CELL_SIZE + 1, CELL_SIZE - 2 , CELL_SIZE - 2);
        }
    }
}
// 右移方块函数
var moveRight = function()
{
    // 是否能右移标志
    var canRight = true;
    for (var i = 0 ; i < currentFall.length ; i++)
    {
        // 到达最右边，不能右移
        if(currentFall[i].x >= TETRIS_COLS - 1)
        {
            canRight = false;
            break;
        }
        // 右边位置已经有方块，不能右移
        if (tetris_status[currentFall[i].y][currentFall[i].x + 1] != NO_BLOCK)
        {
            canRight = false;
            break;
        }
    }
    // 如果能右移
    if(canRight)
    {       
        // 右移前每个方块的背景涂成白色
        for (var i = 0 ; i < currentFall.length ; i++)
        {
            var cur = currentFall[i];
            // 填充白色
            tetris_ctx.fillStyle = 'white';
            // 绘制矩形
            tetris_ctx.fillRect(cur.x * CELL_SIZE + 1  
                , cur.y * CELL_SIZE + 1 , CELL_SIZE - 2 , CELL_SIZE - 2);
        }
        // 右移正在掉落的方块组合坐标
        for (var i = 0 ; i < currentFall.length ; i++)
        {
            var cur = currentFall[i];
            cur.x ++;
        }
        // ½«ÓÒÒÆºóµÄÃ¿¸ö·½¿éµÄ±³¾°É«Í¿³É¸÷·½¿é¶ÔÓ¦µÄÑÕÉ«
        for (var i = 0 ; i < currentFall.length ; i++)
        {
            var cur = currentFall[i];
            // 填充方块
            tetris_ctx.fillStyle = colors[cur.color];
            // 绘制矩形
            tetris_ctx.fillRect(cur.x * CELL_SIZE + 1 
                , cur.y * CELL_SIZE + 1 , CELL_SIZE - 2, CELL_SIZE -2);
        }
    }
}
// 旋转方块函数
var rotate = function()
{
    // 定义是否能旋转的标志
    var canRotate = true;
    for (var i = 0 ; i < currentFall.length ; i++)
    {
        var preX = currentFall[i].x;
        var preY = currentFall[i].y;
        // 始终以第三个方块作为旋转中心
        // i == 2说明是旋转中心
        if(i != 2)
        {
            // 计算旋转后方块坐标
            var afterRotateX = currentFall[2].x + preY - currentFall[2].y;
            var afterRotateY = currentFall[2].y + currentFall[2].x - preX;
            // 如果旋转后的位置已经有方块，不能旋转
            if(tetris_status[afterRotateY][afterRotateX + 1] != NO_BLOCK)
            {
                canRotate = false;
                break;
            }
            // 旋转后坐标超出最左边界
            if(afterRotateX < 0 || tetris_status[afterRotateY - 1][afterRotateX] != NO_BLOCK)
            {
                moveRight();
                afterRotateX = currentFall[2].x + preY - currentFall[2].y;
                afterRotateY = currentFall[2].y + currentFall[2].x - preX;
                break;
            }
            if(afterRotateX < 0 || tetris_status[afterRotateY-1][afterRotateX] != NO_BLOCK)
            {
                moveRight();
                break;
            }
            // 旋转后坐标超出最右边界
            if(afterRotateX >= TETRIS_COLS - 1 || 
                tetris_status[afterRotateY][afterRotateX+1] != NO_BLOCK)
            {
                moveLeft();
                afterRotateX = currentFall[2].x + preY - currentFall[2].y;
                afterRotateY = currentFall[2].y + currentFall[2].x - preX;
                break;
            }
            if(afterRotateX >= TETRIS_COLS - 1 || 
                tetris_status[afterRotateY][afterRotateX+1] != NO_BLOCK)
            {
                moveLeft();
                break;
            }
        }
    }
    // 能旋转
    if(canRotate)
    {
        // 旋转前背景涂成白色
        for (var i = 0 ; i < currentFall.length ; i++)
        {
            var cur = currentFall[i];
            // 设置填充颜色
            tetris_ctx.fillStyle = 'white';
            // 绘制矩形
            tetris_ctx.fillRect(cur.x * CELL_SIZE + 1  
                , cur.y * CELL_SIZE + 1 , CELL_SIZE - 2, CELL_SIZE - 2);
        }
        for (var i = 0 ; i < currentFall.length ; i++)
        {
            var preX = currentFall[i].x;
            var preY = currentFall[i].y;
            // 始终以第三个方块作为旋转中心
            // i == 2说明是旋转中心
            if(i != 2)
            {
                currentFall[i].x = currentFall[2].x + 
                    preY - currentFall[2].y;
                currentFall[i].y = currentFall[2].y + 
                    currentFall[2].x - preX;
            }
        }
        // 旋转后每个方块的背景涂成各方块对应的颜色
        for (var i = 0 ; i < currentFall.length ; i++)
        {
            var cur = currentFall[i];
            // 填充颜色
            tetris_ctx.fillStyle = colors[cur.color];
            // 绘制矩形
            tetris_ctx.fillRect(cur.x * CELL_SIZE + 1 
                , cur.y * CELL_SIZE + 1 , CELL_SIZE - 2, CELL_SIZE - 2);
        }
    }
}

//窗口获取焦点（玩网页游戏需要在页面点击一下）
window.focus();
// 为窗口的按键事件绑定事件监听器
window.onkeydown = function(evt)
{
    //evt.keyCode 是指触发这个键盘事件的键盘码
    switch(evt.keyCode)
    {
        // 按了“向下”箭头
        case 40:
            if(!isPlaying)
                return;
            moveDown();
            break;
        // 按了“向左”箭头
        case 37:
            if(!isPlaying)
                return;
            moveLeft();
            break;
        // 按了“向右”箭头
        case 39:
            if(!isPlaying)
                return;
            moveRight();
            break;
        // 按了“向上”箭头
        case 38:
            if(!isPlaying)
                return;
            rotate();
            break;
    }
}

//初始化游戏状态
window.onload = function()
{

    //创建canvas组件
    createCanvas(TETRIS_ROWS , TETRIS_COLS , CELL_SIZE , CELL_SIZE);
    document.body.appendChild(tetris_canvas);

    //getElementById() 方法可返回对拥有指定 ID 的第一个对象的引用。
    curScoreEle = document.getElementById("curScoreEle");
    curSpeedEle = document.getElementById("curSpeedEle");
    maxScoreEle = document.getElementById("maxScoreEle");
    // 读取Local Storage里的tetris_status记录
    var tmpStatus = localStorage.getItem("tetris_status");
    tetris_status = tmpStatus == null ? tetris_status : JSON.parse(tmpStatus);
    // 把方块绘制出来
    drawBlock();
    // 读取Local Storage里的curScore记录
    curScore = localStorage.getItem("curScore");
    curScore = curScore == null ? 0 : parseInt(curScore);
    curScoreEle.innerHTML = curScore;
    // 读取Local Storage里的maxScore记录
    maxScore = localStorage.getItem("maxScore");
    maxScore = maxScore == null ? 0 : parseInt(maxScore);
    maxScoreEle.innerHTML = maxScore;
    // 读取Local Storage里的curSpeed记录
    curSpeed = localStorage.getItem("curSpeed");
    curSpeed = curSpeed == null ? 1 : parseInt(curSpeed);
    curSpeedEle.innerHTML = curSpeed;
    // 初始化正在掉落的方块
    initBlock();
    // 控制每隔一段时间执行一次“下落”
    curTimer = setInterval("moveDown();" ,  500 / curSpeed);
}