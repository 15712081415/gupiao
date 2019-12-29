let init = require('./init');
let setTime = init.setTime;
let longLine = require('./longLine');
let longLine1 = require('./longLine1');
let stup = require('./stup');
let stup4 = require('./stup4');
let stup5 = require('./stup5');
let HKstup = require('./HKstup');
let setBOX = require('./setBOX');
let minuteK = require('./minuteK');
let serverData = require('./serverData');
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
    codeIDarr4: [],
    codeIDarr5: [],
    codeIDarr6: [],
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
$.schedule.scheduleJob('1 55 8 * * 1-5', function () {
    // 每日清空数据
    $.codeIDarr1 = []; // 长线
    $.codeIDarr2 = []; // 短线
    $.codeIDarr3 = []; // 港股
    $.codeIDarr4 = []; // 只买
    $.codeIDarr5 = []; // 只卖
    $.codeIDarr6 = []; // 中短线
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
        serverData(d.data)
        console.log('stock/find');
        let arr1 = [], arr2 = [], arr3 = [], arr4 = [], arr5 = [], arr6 = [];
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
                item.ztLength = item.currLength || 0;
                $.codeData[item.codeID] = item;
                $.deal[item.codeID] = { up: 0, dow: 0, status: true, info: null}
                if (item.codeID.indexOf('hk') !== -1) {
                    item.status == 3 && arr3.push(item)
                } else {
                    item.status == 1 && arr1.push(item)
                    item.status == 2 && arr2.push(item)
                    item.status == 4 && arr4.push(item)
                    item.status == 5 && arr5.push(item)
                    item.status == 6 && arr6.push(item)
                }
            }
        }
        $.codeIDarr1 = arr1;
        $.codeIDarr2 = arr2;
        $.codeIDarr3 = arr3;
        $.codeIDarr4 = arr4;
        $.codeIDarr5 = arr5;
        $.codeIDarr6 = arr6;
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
    $.codeIDarr1.length > 0 
    || $.codeIDarr2.length > 0 
    || $.codeIDarr3.length > 0
    || $.codeIDarr4.length > 0
    || $.codeIDarr5.length > 0 
    || $.codeIDarr6.length > 0 ? gainCode() : loading();
});

function gainCode() {
    if (!$.status) return;
    let time = new Date();
    if (time.getHours() != 9 || time.getMinutes() > 30) {
        console.log('time ->', time.getMinutes(), time.getSeconds());
        time.getMinutes() % 5 == 0 && time.getSeconds() < 5 && minuteK($);
        if (time.getHours() < 15 || true) {
            for (let i = 0; i < $.codeIDarr1.length; i++) {
                let item = $.codeIDarr1[i];
                console.log("longLine解析股票代码：", item.codeID)
                longLine(item.codeID, !!item.max, $);
            }

            for (let i = 0; i < $.codeIDarr2.length; i++) {
                let item = $.codeIDarr2[i];
                console.log("stup解析股票代码：", item.codeID)
                try {
                    stup(item.codeID, !!item.max, $);
                } catch (error) {
                    console.error(error)
                }
            }

            for (let i = 0; i < $.codeIDarr4.length; i++) {
                let item = $.codeIDarr4[i];
                console.log("stup4解析股票代码：", item.codeID)
                try {
                    stup4(item.codeID, !!item.max, $);
                } catch (error) {
                    console.error(error)
                }
            }

            for (let i = 0; i < $.codeIDarr5.length; i++) {
                let item = $.codeIDarr5[i];
                console.log("stup5解析股票代码：", item.codeID)
                try {
                    stup5(item.codeID, !!item.max, $);
                } catch (error) {
                    console.error(error)
                }
            }

            for (let i = 0; i < $.codeIDarr6.length; i++) {
                let item = $.codeIDarr6[i];
                console.log("longLine1解析股票代码：", item.codeID)
                try {
                    longLine1(item.codeID, !!item.max, $);
                } catch (error) {
                    console.error(error)
                }
            }
        } 
        for (let i = 0; i < $.codeIDarr3.length; i++) {
            let item = $.codeIDarr3[i];
            console.log("解析股票代码香港：", item.codeID)
            HKstup(item.codeID, true, $, i);
        }
    }
}

//尾盘清理
// loading()
$.schedule.scheduleJob('1 54 14 * * 1-5', function () { // 1 54 14 * * 1-5
    $.codeIDarr1.length && longLine.endEmail($);
    $.codeIDarr2.length && stup.endEmail($);
    $.codeIDarr5.length && stup5.endEmail($);
    $.codeIDarr6.length && longLine1.endEmail($);
    !$.codeIDarr1.length && !$.codeIDarr2.length && loading()
});

// 发送最新股票评分
$.schedule.scheduleJob('30 56 14 * * 1-5',  function () { // '10 55 14 * * 1-5'
    console.log('发送最新股票评分');
    $.status = false; // 停止统计,避免占用资源
    let status = 6; // 买什么类型
    let currLone = 0; // 最长持有多少天
    // let codeIDarr1 = $.codeIDarr1.filter(item => $.codeData[item.codeID].status > 0).length
    // let codeIDarr6 = $.codeIDarr6.filter(item => $.codeData[item.codeID].status > 0).length
    // let list = 2 - (codeIDarr1 + codeIDarr6); // 买几只股
    let list = 2;
    list > 0 && $.https.get('http://127.0.0.1:9999/HamstrerServlet/api/grade18?type=' + list).then(function (res){
        if (res) {
            let arr = res.data;
            if (arr[2]) {
                $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":arr[2].code},"setter":{"status":status, 'currLone': currLone}}).then(res=>{
                    console.log(arr[2].code+'修改状态成功')
                })
                let numCode = arr[2].code.substring(2, 8);
                $.io.sockets.emit('news',{content: '代码：' + numCode, title: '买叁'});
                let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + numCode + '</span>';                
                emailGet(null, '[' + arr[2].code + ']:买叁', nubMon);
            }
            if (arr[1]) {
                $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":arr[1].code},"setter":{"status":status, 'currLone': currLone}}).then(res=>{
                    console.log(arr[1].code+'修改状态成功')
                })
                setTimeout(() => {
                    let numCode = arr[1].code.substring(2, 8);
                    $.io.sockets.emit('news',{content: '代码：' + numCode, title: '买贰'});
                    let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + numCode + '</span>';
                    emailGet(null, '[' + arr[1].code + ']:买贰', nubMon);
                }, 4000);
            }
            if (arr[0]) {
                $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":arr[0].code},"setter":{"status":status, 'currLone': currLone}}).then(res=>{
                    console.log(arr[0].code+'修改状态成功')
                })
                setTimeout(() => {
                    let numCode = arr[0].code.substring(2, 8);
                    $.io.sockets.emit('news',{content: '代码：' + numCode, title: '全仓'});
                    let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + numCode + '</span>';
                    emailGet(null, '[' + arr[0].code + ']:全仓', nubMon);
                }, 8000);
            }
        }
        $.status = true; // 恢复统计
    });
});

// 执行任务收集信息
setBOX($);
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