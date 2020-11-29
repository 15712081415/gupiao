let email = require('../getemail');
let buy = ['买肆','买叁','买贰','全仓','清仓']; // '买伍',
let sell = ['买贰','清仓','清贰','清叁','清肆']; // ,'清伍'
module.exports = function (code, flag, $) {
  console.log('stup', code, flag);
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
        console.log('stup '+code+' ->', flag, Number(temp4))  
        if (Number(temp4) == 0) {
            return
        }
        let nub = Number(temp4);

        // 随机数
        let nubs = nub - nub * 0.9
        nub = (nub * 0.9) + (nubs * Math.random() * 2)

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
            'dangqianjiage': Number(nub),
            'timeRQ': temp7,
            'timeSJ': temp8
        };
        $.timeRQ = temp7;
        let currEnt = parseInt((nub - temp3) / temp3 * 10000) / 100;
        console.log(code + '检测行情', currEnt + '%');
        if (!$.openVal[code]) $.openVal[code] = {v:temp3, s: currEnt};
        if (Number(nub) > 0 && !$.timeSJ[code + temp7 + temp8]) {
          $.timeSJ[code + temp7 + temp8] = true
          $.https.post('http://127.0.0.1:9999/HamstrerServlet/stockAll/add', str).then(function (message) {
            //   console.log(code + ':存储最新价格' + nub.toFixed(2) + '!');
          }).catch(function (err) {
              console.log(err);
          });
        }
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
        Number(nub) > 0 && !$.flagCode[code] && calculatingData(code, temp1);
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
          let maxSum = (currDay || $.openVal[code].v) * 1.03;
          let minSum = (currDay || $.openVal[code].v) * 0.97;
          let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
          let toEmail = null;
          console.log(code + ':分析价格!', newest, '仓位：', $.codeData[code].currLength)
          console.log('maxSum:', maxSum, 'minSum:', minSum);
          if (newest > maxSum || $.soaringMax[code]) {
              if ($.soaringMax[code] == 0) {
                  $.soaringMax[code] = 1;
                  $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: '今日飙升中', nub: item.curr});  
                //   emailGet(toEmail, $.codeData[code].name + '[' + code + ']:今日飙升中', '当前价：' + $.Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最高：' + max.max.toFixed(2) + ';上行：' + maxSum.toFixed(2) + ';上压：' + $.maxCurr[code].nub);
                  $.minCurr[code].nub = 0;
              } else if ($.soaringMax[code] == 1 && newest < max.max * 0.992) {
                  $.codeData[code].curr = $.Sday[code][lengths].toFixed(2);
                  $.Sday[code] = [$.codeData[code].curr];
                  $.soaringMax[code] = 0;
                  $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"curr": $.Sday[code][0],"currLength": currLength('-', item, code)}});
              }
          } else if (newest < minSum || $.soaringMin[code]) {
              if ($.soaringMin[code] == 0) {
                  $.soaringMin[code] = 1;
                  $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: '今日下降中', nub: item.curr});
                  let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
                //   emailGet(toEmail, $.codeData[code].name + '[' + code + ']:今日下降中', '当前价：' + $.Sday[code][$.Sday[code].length - 1].toFixed(2) + nubMon);
                  $.maxCurr[code].nub = 0
              } else if ($.soaringMin[code] == 1 && newest > min.min * 1.008) {
                  $.soaringMin[code] = 0;
                  $.codeData[code].curr = $.Sday[code][lengths].toFixed(2);
                  $.Sday[code] = [$.codeData[code].curr];
                  emailGet(toEmail, $.codeData[code].name + '[' + code + ']:' + buy[item.currLength], '当前价：' + $.Sday[code][0]);
                  $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"curr": $.Sday[code][0],"currLength": currLength('+', item, code)}});
              }
          }
      }
    }
    function currLength(type, item, code) {
        if (type == '-') {
            if ($.codeData[code].ztLength > 0) {
                let nub = $.codeData[code].currLength - 1
                $.codeData[code].currLength = nub
                $.codeData[code].ztLength = $.codeData[code].ztLength - 1
                console.log('currLength ->', $.codeData[code].currLength)
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: sell[$.codeData[code].ztLength], nub: $.codeData[code].curr});              
            } else {
                console.log('无可卖')
                $.flagCode[code] = true
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: sell[$.codeData[code].ztLength], nub: $.codeData[code].curr}); 
                return 2
            }
            return $.codeData[code].currLength
        } else {
            if ($.codeData[code].currLength < buy.length) {
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: buy[$.codeData[code].currLength], nub: $.codeData[code].curr});
                emailGet(null, $.codeData[code].name + '[' + code + ']:' + buy[$.codeData[code].currLength], '当前价：' + $.Sday[code][0]);
                let nub = $.codeData[code].currLength + 1
                if (nub < buy.length) {
                    $.codeData[code].currLength = nub
                }
                console.log('currLength ->', $.codeData[code].currLength)
            } else {
                console.log('无可买')
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: buy[$.codeData[code].currLength], nub: $.codeData[code].curr});
                $.flagCode[code] = true
                return $.codeData[code].currLength - $.codeData[code].ztLength
            }
            return $.codeData[code].currLength
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
                emailGet(null, $.codeData[code].name + '[' + code + ']:' + buy[item.currLength], '当前价：' + $.Sday[code][0]);
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: buy[item.currLength]});
                item.currLength < 5 && $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"curr": $.Sday[code][0],"currLength": currLength('+', item)}});
            }
            if ($.soaringMax[code] == 1) {
                $.soaringMax[code] = 0;
                item.curr = $.Sday[code][lengths].toFixed(2);
                $.Sday[code] = [item.curr];
                emailGet(null, $.codeData[code].name + '[' + code + ']:' + sell[item.currLength], '当前价：' + $.Sday[code][0]);
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: sell[item.currLength]});
                item.currLength > 0 && $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"curr": $.Sday[code][0],"currLength": currLength('-', item)}});
            }
        }
    }
}