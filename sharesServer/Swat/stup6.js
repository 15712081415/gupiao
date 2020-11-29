let email = require('../getemail');
let buy = ['买肆','买叁','买贰','全仓']; // '买伍',
let sell = ['清仓','清贰','清叁','清肆']; // ,'清伍'
module.exports = function (code, flag, $) {
  console.log('stup6', code, flag);
  $.https.get('http://hq.sinajs.cn/list=' + (code.indexOf('hk') === -1 ? code : 'rt_' + code)).then(res => {
        let data = res.data.split('=')[1].split('"').join('').split(';').join('').split(',');
        let [
        temp1, // 股票名称
        temp2, // 今日开盘价
        temp3, // 昨日收盘价
        temp4, // 现价（股票当前价，收盘以后这个价格就是当日收盘价）
        temp5, // 最高价
        temp6, // 最低价
        temp7, // 日期
        temp8 // 时间
        ] = code.indexOf('hk') === -1 ? [
        data[0],
        data[1],
        data[2],
        data[3],
        data[4],
        data[5],
        data[30],
        data[31]
        ] : [
        data[1],
        data[2],
        data[3],
        data[6],
        data[4],
        data[5],
        data[17],
        data[18]
        ]
        if (Number(temp4) == 0) {
            return
        }
        let nub = Number(temp4);
        
        // 随机数
    //    let nubs = nub - nub * 0.9
    //     nub = (nub * 0.9) + (nubs * Math.random() * 2)
        
        console.log('stup '+code+' ->', flag, Number(nub))  

        if ($.Sday[code]) {
          $.Sday[code].push(nub);
        } else {
          $.Sday[code] = [];
          $.Sday[code].push(nub);
        }
        let name = temp1 + '[' + code + ']';
        let str = {
            'name': name,
            'daima': code,
            'dangqianjiage': nub,
            'timeRQ': temp7,
            'timeSJ': temp8
        };
        $.timeRQ = temp7;
        let currEnt = parseInt((nub - temp3) / temp3 * 10000) / 100;
        console.log(code + '检测行情6', currEnt + '%', $.flagCode[code]);
        if (!$.openVal[code]) $.openVal[code] = {v:temp3, s: currEnt};
        if ($.codeData[code] && 
            $.codeData[code]['K-Lin'] &&
            $.codeData[code]['K-Lin'][0] &&
            $.codeData[code]['K-Lin'][1] &&
            $.codeData[code]['K-Lin'][2] &&
            $.codeData[code]['K-Lin'][0]['MACD']['EMA_BAR'] < $.codeData[code]['K-Lin'][1]['MACD']['EMA_BAR'] &&
            $.codeData[code]['K-Lin'][1]['MACD']['EMA_BAR'] > $.codeData[code]['K-Lin'][2]['MACD']['EMA_BAR']
        ) {
            if (!$.flagCode[code]) {
                $.flagCode[code] = true;
                let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span><p>检测行情跌势'+ currEnt +'% 暂停交易</p>';
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: '清仓'});
                emailGet(null, $.codeData[code].name + '[' + code + ']:清仓', nubMon);
                $.codeData[code].currLength > 0 && $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"curr": $.Sday[code][0],"currLength": 0}});
            }
            return
        }
        
        nub > 0 && !$.flagCode[code] && calculatingData(code, temp1);
    });
    function calculatingData(code, name) {
      if ($.Sday[code].length > 0) {
          let lengths = $.Sday[code].length - 1;
          let mean = $.Sday[code].sum();
          let newest = $.Sday[code][lengths];
          let max = $.Sday[code].max();
          let min = $.Sday[code].min();
          let currDay = Number($.Sday[code][0]);
          let item = $.codeData[code];
          !item.currLength && (item.currLength = 0);
          let maxSum = (item.curr || $.openVal[code].v) * 1.02;
          let minSum = (item.curr || $.openVal[code].v) * 0.98;
          let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
          let toEmail = null;
          console.log(code + ':分析价格!', newest)
          console.log('maxSum:', maxSum, 'minSum:', minSum);
          if (newest > (maxSum || ($.Sday[code][0] * 1.02))) {
                console.log(code + ':分析价格! +++')
                  item.curr = $.Sday[code][lengths].toFixed(2);
                  $.Sday[code] = [item.curr];
                //   emailGet(toEmail, $.codeData[code].name + '[' + code + ']:' + sell[item.ztLength], '当前价：' + $.Sday[code][0]);
                  $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"curr": $.Sday[code][0],"currLength": currLength('+', item, code)}});
          } else if (newest < (minSum || $.Sday[code][0] * 0.98)) {
                console.log(code + ':分析价格! ---')
                  item.curr = $.Sday[code][lengths].toFixed(2);
                  $.Sday[code] = [item.curr];
                //   emailGet(null, $.codeData[code].name + '[' + code + ']:' + buy[item.currLength], '当前价：' + $.Sday[code][0]);
                  $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"curr": $.Sday[code][0],"currLength": currLength('-', item, code)}});
          }
      }
    }
    function currLength(type, item, code) {
        if (type == '+') {
            if (item.currLength < buy.length) {
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: buy[item.currLength]});
                console.log(code, buy[item.currLength])
                let nub = item.currLength + 1
                if (nub < buy.length) {
                    item.currLength = nub
                }
            } else {
                console.log('无可买')
            }
            return item.currLength
        } else {
            if (item.ztLength > 0) {
                let nub = item.currLength - 1
                item.currLength = nub
                item.ztLength = item.ztLength - 1
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: sell[item.ztLength]});
                console.log(code, sell[item.ztLength])              
            } else {
                console.log('无可卖')
            }
            return item.currLength
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

module.exports.endEmail = function ($) { // 尾盘结束监听
    for (let key in $.codeIDarr2) {
        let code = $.codeIDarr2[key].codeID;
        if (code && $.Sday[code]) {
            let item = $.codeIDarr2[key];
            let lengths = $.Sday[code].length - 1;
            if ($.soaringMin[code] == 1) {
                $.soaringMin[code] = 0;
                item.curr = $.Sday[code][lengths].toFixed(2);
                $.Sday[code] = [item.curr];
                // emailGet(null, $.codeData[code].name + '[' + code + ']:' + buy[item.currLength], '当前价：' + $.Sday[code][0]);
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: buy[item.currLength]});
                item.currLength < 5 && $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"curr": $.Sday[code][0],"currLength": currLength('+', item)}});
            }
            if ($.soaringMax[code] == 1) {
                $.soaringMax[code] = 0;
                item.curr = $.Sday[code][lengths].toFixed(2);
                $.Sday[code] = [item.curr];
                // emailGet(null, $.codeData[code].name + '[' + code + ']:' + sell[item.currLength], '当前价：' + $.Sday[code][0]);
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: sell[item.currLength]});
                item.currLength > 0 && $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"curr": $.Sday[code][0],"currLength": currLength('-', item)}});
            }
        }
    }
    function currLength(type, item, name) {
        if (type == '+') {
            let nub = buy.indexOf(name) + 1
            return nub
        } else {
            let nub = item.currLength - 1
            if (nub >= 0) {
                item.currLength = nub
            } else {
                item.currLength = buy.length - 1
            }
            return nub
        }
    }
}