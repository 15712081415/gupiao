﻿let init = require('./init');
let setTime = init.setTime;
let longLine = require('./longLine');
let stup = require('./stup');
let HKstup = require('./HKstup');
let setBOX = require('./setBOX');
let minuteK = require('./minuteK');
init.init();
// ------------------------------------
let $ = {
    https: require('axios'),
    schedule: require('node-schedule'),
    email: require('../getemail'),
    io: init.viewHTML(),
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
    flagCode: {}
}
// 初始化
$.schedule.scheduleJob('0 55 8 * * 1-5', function () {
    // 每日清空数据
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
        let arr1 = [], arr2 = [], arr3 = [];
        for (let i = 0; i < d.data.length; i++) {
            let item = d.data[i];
            if (item.status > 0) {
                $.soaringMax[item.codeID] = 0;
                $.soaringMin[item.codeID] = 0;
                $.dayFlag[item.codeID] = 0;
                $.maxValue[item.codeID] = (item.max - Number(item.mean)) * 0.05;
                $.minValue[item.codeID] = (Number(item.mean) - item.min) * 0.05;
                $.maxCurr[item.codeID] = { nub: 0, arr: [] };
                $.minCurr[item.codeID] = { nub: 0, arr: [] };
                $.codeData[item.codeID] = item;
                $.deal[item.codeID] = { up: 0, dow: 0, status: true, info: null}
                if (item.codeID.indexOf('hk') !== -1) {
                    item.status == 3 && arr3.push(item)
                } else {
                    item.status == 1 && arr1.push(item)
                    item.status == 2 && arr2.push(item)
                }
            }
        }
        $.codeIDarr1 = arr1;
        $.codeIDarr2 = arr2;
        $.codeIDarr3 = arr3;
        gainCode();
    }).catch(function (err) {
        console.log(err);
    });
}
// 开始记录今天的数据
let ruleCurr = new $.schedule.RecurrenceRule();
ruleCurr.dayOfWeek = [1, 2, 3, 4, 5]; // 周
// ruleCurr.hour = [9, 10, 11, 12, 13, 14, 15]; // 时
ruleCurr.second = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]; // 秒
$.schedule.scheduleJob(ruleCurr, function () {
    $.codeIDarr1.length > 0 || $.codeIDarr2.length > 0 || $.codeIDarr3.length > 0 ? gainCode() : loading();
});

function gainCode() {
    if (!$.status) return;
    let time = new Date();
    console.log('time ->', time.getMinutes(), time.getSeconds());
    $.io.sockets.emit('news',{content: '代码：888888', title: '全仓'});
    $.io.sockets.emit('news',{content: '代码：888888', title: '清仓'});
    $.io.sockets.emit('news',{content: '代码：888888', title: '回降中'});
    time.getMinutes() % 5 == 0 && time.getSeconds() < 5 && minuteK($);
    if (time.getHours() < 15) {
        for (let i = 0; i < $.codeIDarr1.length; i++) {
            let item = $.codeIDarr1[i];
            console.log("longLine解析股票代码：", item.codeID)
            longLine(item.codeID, !!item.max, $);
        }
    }
    if (time.getHours() < 15) {
        for (let i = 0; i < $.codeIDarr2.length; i++) {
            let item = $.codeIDarr2[i];
            console.log("stup解析股票代码：", item.codeID)
            stup(item.codeID, !!item.max, $);
        }
    }
    for (let i = 0; i < $.codeIDarr3.length; i++) {
        let item = $.codeIDarr3[i];
        console.log("解析股票代码香港：", item.codeID)
        HKstup(item.codeID, true, $, i);
    }
}
// 发送最新股票评分
$.schedule.scheduleJob('5 53 14 * * 1-5', function () {
    console.log('发送最新股票评分');
    $.status = false; // 停止统计,避免占用资源
    $.https.get('http://127.0.0.1:9999/HamstrerServlet/api/grade?type=1').then(function (res){
        $.io.sockets.emit('news',{content: '代码：' + res.data, title: '全仓'});
        $.status = true; // 恢复统计
    });
    $.codeIDarr1.length && longLine.endEmail($);
    $.codeIDarr2.length && stup.endEmail($);
});
// 执行任务收集信息
// setBOX($);
// minuteK($)
$.schedule.scheduleJob('5 0 16 * * 1-5', function () {
    console.log('执行任务setBOX');
    setBOX($);
    minuteK($); // 最后5分钟K线
});
console.log('已开启统计计算服务')