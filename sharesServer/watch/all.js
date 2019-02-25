let email = require('../getemail');
let iconv = require('iconv-lite');
let content = {};
let sale = ['','买贰','全仓']
let curr = 0;
module.exports = function ($) {
    async function init() {
        let arr = $.codeIDarr;
        for (let i = 0; i < arr.length; i += 200) {
            let codeArr = arr.slice(i, i + 200 < arr.length ? i + 200 : arr.length).toString();
            await api(codeArr);
        }
        curr = 0;
    }
    function api(codeID) {
        return $.https.get('http://hq.sinajs.cn/list=' + codeID, {
            responseType: 'arraybuffer'
        }).then(function (res) {
            let str = iconv.decode(res.data, 'gbk');
            strArr = str.split('var hq_str_');
            strArr.splice(0, 1);
            strArr.forEach(item => {
                let obj = item.split('=');
                content[obj[0]] = obj[1].split('"').join('').split(';').join('').split(',')
            })
            curr++;
            curr * 200 >= $.codeIDarr.length && cb();
        })
    }
    function cb() {
        let arr = $.codeIDarr.map(item => item.codeID);
        for (let i = 0; i < arr.length; i++) {
            getHtml(i, arr.length);
        }
        console.log('init ->', new Date().toLocaleTimeString(), $.MaxNumber);
    }
    function getHtml(index, len) {
        let item = $.codeIDarr[index];
        let data = content[item];
        if (!data) return;
        let [
            temp1, // 股票名称
            temp2, // 今日开盘价
            temp3, // 昨日收盘价
            temp4, // 现价（股票当前价，收盘以后这个价格就是当日收盘价）
            temp5, // 最高价
            temp6, // 最低价
            temp7, // 日期
            temp8, // 时间
            volume
        ] = item.indexOf('hk') === -1 ? [
            data[0],
            data[1],
            data[2],
            data[3],
            data[4],
            data[5],
            data[30],
            data[31],
            data[8]
        ] : [
            data[1],
            data[2],
            data[3],
            data[6],
            data[4],
            data[5],
            data[17],
            data[18],
            data[8]
        ]
        if (!Number(temp5)) return;
        let stop = (parseInt((temp5 - temp3) / temp3 * 10000) / 100) || 0;
        let currEnt = parseInt((temp4 - temp3) / temp3 * 10000) / 100;
        currEnt > 9 && stop < 9.9 && console.log(item + '检测行情', currEnt + '%', stop);
        if (stop < 9.9 && currEnt > 9 && $.MaxNumber.length < 2 && !$.MaxNumber.includes(item) && switchItem(item)) {
            console.log(item + '-->', currEnt + '%', stop);
            $.MaxNumber.push(item)
            $.io.sockets.emit('news', { content: '代码：' + item.substring(2, 8), title: sale[$.MaxNumber.length] });
        }
    }
    function switchItem(codeID) {
        if ($.codeData[codeID]) {
            return true
        }
        return false
    }
    init();
}