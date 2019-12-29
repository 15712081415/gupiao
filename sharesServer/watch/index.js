let init = require('./init');
let setTime = init.setTime;
let setBOX = require('./setBOX');
let minuteK = require('./minuteK');
let all = require('./all');
init.init();
// ------------------------------------
let $ = {
    https: require('axios'),
    schedule: require('node-schedule'),
    email: require('../getemail'),
    io: init.viewHTML(),
    codeIDarr: [],
    codeIDarr1: [],
    codeIDarr2: [],
    codeIDarr3: [],
    Sday: {},
    codeData: {},
    soaringMax: {},
    soaringMin: {},
    dayFlag: {},
    timeRQ: null,
    timeSJ: {},
    maxValue: {},
    minValue: {},
    maxCurr: {},
    minCurr: {},
    MaxNumber: [],
    deal: {},
    openVal: {},
    status: true,
    flagCode: {},
    loading: loading,
}
// 初始化
$.schedule.scheduleJob('0 55 8 * * 1-5', function () {
    // 每日清空数据
    $.codeIDarr = []; // 所有
    $.codeIDarr1 = []; // 长线
    $.codeIDarr2 = []; // 短线
    $.codeIDarr3 = []; // 港股
    $.Sday = {}; // 当天获取的价格
    $.codeData = {}; // 所有股票信息
    $.soaringMax = {}; // 邮件状态 0：飙升中   1：回降中
    $.soaringMin = {}; // 邮件状态 0：下降中   1：回升中
    $.dayFlag = {}; // 5分钟添加数据，添加的时间点标识
    $.timeSJ = {}; // 时间
    $.maxValue = {}; // 上行线
    $.minValue = {}; // 下行线
    $.maxCurr = {}; // 上压值
    $.minCurr = {}; // 下压值
    $.MaxNumber = []; // 未使用
    $.deal = {}; // 当天买卖次数
    $.openVal = {}; // 开盘价
    $.status = true; // 是否开始统计
    $.flagCode = {}; // 清仓标识
});
function loading() {
    if ($.timeRQ == setTime()) return
    console.log('loading');
    $.Sday = {};
    $.timeRQ = setTime(); // 当天日期
    $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/find').then(function (d) {
        console.log('stock/find');
        d.data = d.data.filter(item => {
            return (item.codeID[2] == 6 || item.codeID[2] == 3 || item.codeID[2] == 0) && item.codeID[0] == 's';
        })
        let arr = [], arr1 = [];
        for (let i = 0; i < d.data.length; i++) {
            let item = d.data[i];
            $.codeData[item.codeID] = item;
            item.max && arr.push(item.codeID);
            item.status > 0 && arr1.push(item)
        }
        $.codeIDarr = arr;
        $.codeIDarr1 = arr1
        gainCode();
    }).catch(function (err) {
        console.log(err);
    });
}
// 开始记录今天的数据
let ruleCurr = new $.schedule.RecurrenceRule();
ruleCurr.dayOfWeek = [1, 2, 3, 4, 5]; // 周
ruleCurr.hour = [9, 10, 11, 12, 13, 14, 15]; // 时
ruleCurr.second = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]; // 秒
$.schedule.scheduleJob(ruleCurr, function () {
    $.codeIDarr.length > 0 ? gainCode() : loading();
});

function gainCode() {
    if (!$.status) return;
    let time = new Date();
    if (time.getHours() != 9 || time.getMinutes() > 30) {
        console.log('time ->', time.getMinutes(), time.getSeconds());
        if (time.getHours() < 15) {
            try {
                all($)
            } catch (error) {
                console.log(error)
            }
        }
    }
}


// 发送最新股票评分

// 执行任务收集信息
// setBOX($);
// minuteK($)
$.schedule.scheduleJob('5 0 16 * * 1-5', function () {
    console.log('执行任务setBOX');
    setBOX($);
    minuteK($); // 最后5分钟K线
});
console.log('已开启统计计算服务')

// 发送邮件
function emailGet(to, tit, text) {
    $.email.send(to, tit, text, function (err, info) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('邮件:', tit);
    })
}