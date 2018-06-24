/**
 * Created by Administrator on 2017/5/14.
 */

//最小值
Array.prototype.min = function () {
    let _this = this;
    let min = Number(_this[0]);
    let len = _this.length;
    let nub = 0;
    for (let i = 1; i < len; i++) {
        if (_this[i] != 0 && _this[i] < min) {
            min = Number(_this[i]);
            nub = i;
        }
    }
    return { min: min, nub: nub };
}
//最大值
Array.prototype.max = function () {
    let _this = this;
    let max = Number(_this[0]);
    let len = this.length;
    let nub = 0;
    for (let i = 1; i < len; i++) {
        if (this[i] > max) {
            max = Number(_this[i]);
            nub = i;
        }
    }
    return { max: max, nub: nub };
}
// 平均数
Array.prototype.sum = function (name) {
    let sum = 0;
    let len = this.length;
    let i = 0;
    let _this = this
    if (typeof _this[i] == 'object') {
        for (i = 0; i < len; i++) {
            sum = sum + Number(_this[i][name]);
        }
    } else {
        for (i = 0; i < len; i++) {
            sum = sum + Number(_this[i]);
        }
    }
    return sum / _this.length;
}
// 格式化日期
function setTime() {
    let myDate = new Date();
    let y = myDate.getFullYear();
    let m = myDate.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    let d = myDate.getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d;
}
// -------------------------------------------------------------------------------------------
let https = require('axios');
let schedule = require('node-schedule');
let email = require('../getemail');
let codeIDarr = [];
let Sday = {};
let codeData = {};
let soaringMax = {};
let soaringMin = {};
let dayFlag = {};
let timeRQ = setTime();
let timeSJ = {};
let maxValue = {};
let minValue = {};
let maxCurr = {};
let minCurr = {};
let MaxNumber = [];
let deal = {};
let ruleCurr = 0;
// 初始化
schedule.scheduleJob('0 55 8 * * 1-5', function () {
    // 每日清空数据
    codeIDarr = [];
    Sday = {};
    codeData = {};
    soaringMax = {};
    soaringMin = {};
    dayFlag = {};
    timeRQ = setTime();
    timeSJ = {};
    maxValue = {};
    minValue = {};
    maxCurr = {};
    minCurr = {};
    MaxNumber = [];
    deal = {};
    ruleCurr = 0;
});
function loading() {
    if (ruleCurr > 0) return
    console.log('loading');
    Sday = {};
    https.post('http://127.0.0.1:9999/HamstrerServlet/stock/find').then(function (d) {
        console.log('stock/find');
        let arr = [];
        for (let i = 0; i < d.data.length; i++) {
            let item = d.data[i];
            soaringMax[item.codeID] = 0;
            soaringMin[item.codeID] = 0;
            dayFlag[item.codeID] = 0;
            maxValue[item.codeID] = (item.max - Number(item.mean)) * 0.1;
            minValue[item.codeID] = (Number(item.mean) - item.min) * 0.1;
            maxCurr[item.codeID] = { nub: 0, arr: [] };
            minCurr[item.codeID] = { nub: 0, arr: [] };
            // if (item.codeID == 'sz300263') debugger
            if (item.status == 1) {
                arr.push(item)
                deal[item.codeID] = { up: 0, dow: 0 }
            }
        }
        codeIDarr = arr
        gainCode();
    }).catch(function (err) {
        console.log(err);
    });
}
// 开始记录今天的数据
// let ruleCurr = new schedule.RecurrenceRule();
// ruleCurr.dayOfWeek = [1, 2, 3, 4, 5]; // 周
// ruleCurr.hour = [9, 10, 11, 12, 13, 14]; // 时
// ruleCurr.second = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]; // 秒
schedule.scheduleJob('* * 9-15 * * 1-5', function () {
    codeIDarr && codeIDarr.length > 0 ? gainCode() : loading();
    ruleCurr++
});

// 运行完一天数据后 计算创建箱子
// let rules = new schedule.RecurrenceRule();
// rules.dayOfWeek = [1, 2, 3, 4, 5]; // 周
// rules.hour = 15; // 时
// rules.minute = 5; // 分
// rules.second = 0; // 秒
schedule.scheduleJob('5 30 15 * * 1-5', function () {
    console.log('执行任务setBOX');
    setBOX()
});


function gainCode() {
    if (codeIDarr && ruleCurr % 5 == 0) {
        for (let i = 0; i < codeIDarr.length; i++) {
            let item = codeIDarr[i];
            console.log("解析股票代码：", item.codeID)
            setURL(item.codeID, !!item.max);
            codeData[item.codeID] = item;
        }
    }
}
/*---------------------------------------------------测试-------------------------------------------------------------
(function (code,timeRQ){
    https.post('http://127.0.0.1:9999/HamstrerServlet/stock/find').then(function(d) {
        codeIDarr = [];
        for(let i = 0; i < d.data.length; i++) {
            let item = d.data[i];
            codeData[item.codeID] = item;
            soaringMax[item.codeID] = 0;
            soaringMin[item.codeID] = 0;
            dayFlag[item.codeID] = 0;
            maxValue[item.codeID] = (item.max - Number(item.mean)) * 0.1;
            minValue[item.codeID] = (Number(item.mean) - item.min) * 0.1;
            maxCurr[item.codeID] = { nub:0, arr:[] };
            minCurr[item.codeID] = { nub:0, arr:[] };
            if (item.codeID == code) {
                codeIDarr.push(item)
                dataInfo()
            }
        }
    });
    function dataInfo () {
        https.get('http://127.0.0.1:9999/HamstrerServlet/stockAll/find?'+'daima='+code+'&timeRQ='+timeRQ).then(function(res) {
            let data = res.data;
            let i = 0;
            CScalculatingData(code);
            function CScalculatingData(code) {
                if (i < data.length) {
                    let item = data[i]
                    if (Sday[code]) {
                        Sday[code].push(item.dangqianjiage*1 - 0.2);
                    } else {
                        Sday[code] = [];
                        Sday[code].push(item.dangqianjiage*1 - 0.2);
                    }
                }
                calculatingData(code)
                i++;
                setTimeout(function () {
                    // CScalculatingData(code)
                }, 100)
            }
        });
    }
})('sh601002','2017-10-16')
/*---------------------------------------------------测试end-------------------------------------------------------------*/
function setURL(code, flag) {
    https.get('http://hq.sinajs.cn/list=' + code, {
        'responseType': 'text/plain;charset=utf-8',
        'header': 'text/plain;charset=utf-8'
    }).then(res => {
        let data = res.data.split(',');
        if (Number(data[3]) == 0) {
            return
        }
        let nub = Number(data[3]);
        if (Sday[code]) {
            Sday[code].push(nub);
        } else {
            Sday[code] = [];
            Sday[code].push(nub);
        }
        let name = data[0].split('"')[1] + '[' + code + ']';
        let str = {
            'name': name,
            'daima': code,
            'dangqianjiage': Number(data[3]),
            'timeRQ': data[30],
            'timeSJ': data[31]
        };
        timeRQ = data[30];
        Number(data[3]) > 0 && !timeSJ[code + data[30] + data[31]] && https.post('http://127.0.0.1:9999/HamstrerServlet/stockAll/add', str).then(function (message) {
            console.log(code + ':存储最新价格' + nub.toFixed(2) + '!');
            timeSJ[code + data[30] + data[31]] = true
        }).catch(function (err) {
            console.log(err);
        });
        Number(data[3]) > 0 && flag && calculatingData(code, data[0].split('"')[1]);
    });
}
function calculatingData(code, name) {
    console.log(code + ':分析价格!');
    if (Sday[code].length > 0) {
        let lengths = Sday[code].length - 1;
        let mean = Sday[code].sum();
        let newest = Sday[code][lengths];
        let max = Sday[code].max();
        let min = Sday[code].min();
        let currDay = Number(Sday[code][0]);
        let item = codeData[code];
        let maxSum = item && item.maxData ? [item.maxData.max().max, item.maxData.min().min].sum() : 0;
        maxSum += item.mean - mean
        let minSum = item && item.minData ? [item.minData.max().max, item.minData.min().min].sum() : 0;
        minSum += item.mean - mean
        let isMax = (((max.max - mean) * 0.9) + mean) > (max.max - maxValue[code]) ? (((max.max - mean) * 0.9) + mean) : (max.max - maxValue[code]);
        let isMin = (mean - ((mean - min.min) * 0.9)) < (min.min + minValue[code]) ? (mean - ((mean - min.min) * 0.9)) : (min.min + minValue[code]);
        console.log('isMax-all', (((max.max - mean) * 0.9) + mean), (max.max - maxValue[code]), isMax);
        console.log('isMin-all', (mean - ((mean - min.min) * 0.9)), (min.min + minValue[code]), isMin);
        console.log('max：', newest > maxSum, Sday[code].max().nub == Sday[code].length - 1, 'min:', newest < item.minData.sum(), Sday[code].min().nub == Sday[code].length - 1);
        console.log('length:', lengths)
        maxCurr[code].arr[0] || (maxCurr[code].arr[0] = maxSum)
        minCurr[code].arr[0] || (minCurr[code].arr[0] = minSum)
        let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
        let toEmail = null;
        if (newest > maxSum) {
            if (max.nub == lengths && soaringMax[code] == 0 && max.max > (maxCurr[code].arr[maxCurr[code].arr.length - 1] + maxCurr[code].nub)) {
                emailGet(toEmail, codeData[code].name + '[' + code + ']:今日飙升中', '当前价：' + Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最高：' + max.max.toFixed(2) + ';上行：' + maxSum.toFixed(2) + ';上压：' + maxCurr[code].nub);
                soaringMax[code] = 1;
                minCurr[code].nub = 0;
            } else if (soaringMax[code] == 1 && newest < (isMax < max.max - 0.03 ? isMax : max.max - 0.03)) {
                deal[item.codeID] && deal[item.codeID].up++
                emailGet(toEmail, codeData[code].name + '[' + code + ']:回降中', '当前价：' + Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最高：' + max.max.toFixed(2) + ';上行：' + maxSum.toFixed(2) + nubMon);
                soaringMax[code] = 0;
                maxCurr[code].nub = maxCurr[code].nub + mathNumber(maxCurr[code].nub);
                maxCurr[code].arr.push(max.max)
            }
        } else if (newest < minSum) {
            if (min.nub == lengths && soaringMin[code] == 0 && min.min < (minCurr[code].arr[minCurr[code].arr.length - 1] - minCurr[code].nub)) {
                emailGet(toEmail, codeData[code].name + '[' + code + ']:今日下降中', '当前价：' + Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最低：' + min.min.toFixed(2) + ';下行：' + minSum.toFixed(2) + ';下压：' + minCurr[code].nub);
                soaringMin[code] = 1;
                maxCurr[code].nub = 0
            } else if (soaringMin[code] == 1 && newest > (isMin > min.min + 0.03 ? isMin : min.min + 0.03)) {
                deal[item.codeID] && deal[item.codeID].dow++
                emailGet(toEmail, codeData[code].name + '[' + code + ']:回升中', '当前价：' + Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最低：' + min.min.toFixed(2) + ';下行：' + minSum.toFixed(2) + nubMon);
                soaringMin[code] = 0;
                minCurr[code].nub = minCurr[code].nub + mathNumber(minCurr[code].nub);
                minCurr[code].arr.push(max.max)
            }
        }
        function mathNumber(val) {
            if (val < 0.05) {
                return 0.05
            } else if (val < 0.09) {
                return 0.04
            } else if (val < 0.12) {
                return 0.03
            } else if (val < 0.14) {
                return 0.02
            } else {
                return 0.01
            }
        }
    }
}
schedule.scheduleJob('1 59 14 * * 1-5', function () {
    endEmail()
});
function endEmail() {
    for (let item in codeIDarr) {
        if (codeIDarr[item].codeID) {
            let code = codeIDarr[item].codeID;
            let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
            let toEmail = null;
            if (soaringMax[code] == 1) {
                deal[code] && deal[code].up++
                emailGet(toEmail, codeData[code].name + '[' + code + ']:回降中', '当前价：' + Sday[code][Sday[code].length - 1].toFixed(2) + nubMon);
                soaringMax[code] = 0;
            }
            if (soaringMin[code] == 1) {
                deal[code] && deal[code].dow++
                emailGet(toEmail, codeData[code].name + '[' + code + ']:回升中', '当前价：' + Sday[code][Sday[code].length - 1].toFixed(2) + nubMon);
                soaringMin[code] = 0;
            }
        }
    }
}
// 发送邮件
function emailGet(to, tit, text) {
    email.send(to, tit, text, function (err, info) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('邮件:', tit);
    })
}
setBOX()
// timeRQ = '2017-11-13'
function setBOX() {
    let current = 0;
    stock_find()
    function stock_find(currI) {
        console.log('currI', currI)
        let curr = currI || 0
        let each = 200
        https.get('http://127.0.0.1:9999/HamstrerServlet/stock/find').then(function (d) {
            for (let i = curr; i < d.data.length && (i % each != 0 || i == curr); i++) {
                let item = d.data[i];
                lookData(item, i, d.data.length - 1)
            }
            if (curr + each < d.data.length) {
                setTimeout(() => {
                    stock_find(curr + each)
                }, 5000)
            }
        })
    }
    // 收集当天信息
    function lookData(item, index, all) {
        https.get('http://hq.sinajs.cn/list=' + item.codeID, {
            'responseType': 'text/plain;charset=utf-8',
            'header': 'text/plain;charset=utf-8'
        }).then(function (res) {
            let data = res.data.split(',');
            if (Number(data[3]) == 0) {
                current++
                return;
            }
            let timeRQ = data[30];
            let mean10, min10, max10, k_link;
            let o = {
                'max': Number(data[4]),
                'min': Number(data[5]),
                'mean': (Number(data[4]) + Number(data[5])) / 2,
                'boll': null,
                'ks': Number(data[1]),
                'js': Number(data[3]),
                'deal': deal[item.codeID] || null,
                'timeRQ': data[30],
                'status': Number(data[3]) - Number(data[1])
            }
            o.boll = boll(item['K-Lin'], o);
            k_link = [o];
            mean10 = [(Number(data[4]) + Number(data[5])) / 2];
            min10 = [Number(data[5])];
            max10 = [Number(data[4])];
            if (item['K-Lin']) {
                let objCF = {}
                objCF[o.timeRQ] = true
                for (let k = 0; k < item['K-Lin'].length && k < 20; k++) {
                    if (item['K-Lin'][k].js) {
                        mean10.push(item['K-Lin'][k].mean);
                        min10.push(item['K-Lin'][k].min);
                        max10.push(item['K-Lin'][k].max);
                        !objCF[item['K-Lin'][k].timeRQ] && k_link.push(item['K-Lin'][k]);
                        objCF[item['K-Lin'][k].timeRQ] = true
                    }
                }
            }
            mean10 = mean10.sum();
            min10 = min10.min().min;
            max10 = max10.max().max;
            let obj = {
                'minData': [Number(data[5]), (Number(data[4]) + Number(data[5])) / 2],
                'maxData': [Number(data[4]), (Number(data[4]) + Number(data[5])) / 2],
                'max': Number(data[4]),
                'min': Number(data[5]),
                'mean': (Number(data[4]) + Number(data[5])) / 2,
                'timeRQ': timeRQ,
                'mean10': mean10,
                'min10': min10,
                'max10': max10,
                'K-Lin': k_link
            };
            obj.max && https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit', {
                where: { codeID: item.codeID },
                id: { '_id': item['_id'] },
                setter: obj
            }).then(function (res) {
                current++
                console.log('成功 ' + item.codeID + '-->', current)
            }).catch(function (err) {
                console.log(err);
            })
        })
    }
}
// 计算布林值
function boll(k_link, o) {
    k_link = [o].concat(k_link)
    let MA = 0, MD = 0, MB = 0, UP = 0, DN = 0, mean = 0, sum = 0, arr = [], i1 = 0, k1 = 0, k2 = 0;
    for (let i = 0; i < k_link.length && i < 20; i++) {
        MA += Number(k_link[i].js)
        arr.push(Number(k_link[i].js))
        i1++
    }
    MA = MA / i1
    for (let k = 0; k < k_link.length && k < 20; k++) {
        let item = k_link[k];
        if (k < k_link.length - 1) {
            sum += Math.pow(Number(item.js) - MA, 2);
            k1++
        }
        if (k > 0) {
            mean += Number(item.js)
            k2++
        }
    }
    MD = Math.sqrt(sum / k1);
    MB = mean / k2;
    let sumK = (arr.max().max / arr.sum() + (arr.sum() + (arr.sum() - arr.min().min)) / arr.sum()) / 2
    UP = MB + (sumK * MD);
    DN = MB - (sumK * MD);
    let obj = {
        MA: MA,
        MD: MD,
        MB: MB,
        UP: UP,
        DN: DN
    };
    return obj
}
console.log("已开启统计计算服务！！");

