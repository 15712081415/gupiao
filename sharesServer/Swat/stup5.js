let email = require('../getemail');
let buy = ['买肆','买叁','买贰','全仓','清仓']; // '买伍',
let sell = ['买贰','清仓','清贰','清叁','清肆']; // ,'清伍'
module.exports = function (code, flag, $) {
  console.log('stup5', code, flag);
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
            'dangqianjiage': Number(temp4),
            'timeRQ': temp7,
            'timeSJ': temp8
        };
        $.timeRQ = temp7;
        let currEnt = parseInt((temp4 - temp3) / temp3 * 10000) / 100;
        console.log(code + '检测行情', currEnt + '%');
        if (!$.openVal[code]) $.openVal[code] = {v:temp3, s: currEnt};
        if (Number(temp4) > 0 && !$.timeSJ[code + temp7 + temp8]) {
          $.timeSJ[code + temp7 + temp8] = true
          $.https.post('http://127.0.0.1:9999/HamstrerServlet/stockAll/add', str).then(function (message) {
            //   console.log(code + ':存储最新价格' + nub.toFixed(2) + '!');
          }).catch(function (err) {
              console.log(err);
          });
        }
        Number(temp4) > 0 && !$.flagCode[code] && calculatingData(code, temp1);
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
          console.log(code + ':分析价格!', newest,max.max, maxSum + '<' + (max.max * 0.996), min.min,minSum + '>' + (min.min * 1.004))
          console.log('maxSum:', maxSum, 'minSum:', minSum);
          if (newest > maxSum || $.soaringMax[code]) {
              if ($.soaringMax[code] == 0) {
                  emailGet(toEmail, $.codeData[code].name + '[' + code + ']:今日飙升中', '当前价：' + $.Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最高：' + max.max.toFixed(2) + ';上行：' + maxSum.toFixed(2) + ';上压：' + $.maxCurr[code].nub);
                  $.soaringMax[code] = 1;
                  $.minCurr[code].nub = 0;
              } else if ($.soaringMax[code] == 1 && newest < max.max * 0.995) {
                  $.soaringMax[code] = 0;
                  item.curr = $.Sday[code][lengths].toFixed(2);
                  $.Sday[code] = [item.curr];
                  emailGet(toEmail, $.codeData[code].name + '[' + code + ']:' + sell[item.ztLength], '当前价：' + $.Sday[code][0]);
                  item.currLength > 0 && $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"curr": $.Sday[code][0],"currLength": currLength('-', item, code)}});
              }
          }
      }
    }
    function currLength(type, item, code) {
        if (type == '+') {
            $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: buy[item.currLength]});
            let nub = item.currLength + 1
            if (nub < buy.length) {
                item.currLength = nub
            } else {
                item.currLength = 0
                $.flagCode[code] = true;
            }
            return item.currLength
        } else {
            if (item.ztLength - 1 >= 0) {
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: sell[item.ztLength]});              
                item.ztLength = item.ztLength - 1
                let nub = item.currLength - 1
                if (nub >= 0) {
                    item.currLength = nub
                } else {
                    item.currLength = 0
                }
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
    for (let item in $.codeIDarr5) {
        let code = $.codeIDarr5[item].codeID;
        $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"status": $.openVal[code] && $.openVal[code].s > 9.9 ? 1 : 0}});
        if (code && !$.flagCode[code]) {
            if (!$.openVal[code] || $.openVal[code].s < 9.9) {
                let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
                let toEmail = null;
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: '清仓'});
                emailGet(null, $.codeData[code].name + '[' + code + ']:清仓', nubMon);
                $.flagCode[code] = true;
            }
        }
    }
}