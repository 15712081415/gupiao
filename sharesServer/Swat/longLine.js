let email = require('../getemail');
module.exports = function (code, flag, $) {
  $.https.get('http://hq.sinajs.cn/list=' + (code.indexOf('hk') === -1 ? code : 'rt_' + code), {
        'responseType': 'text/plain;charset=utf-8',
        'header': 'text/plain;charset=utf-8'
    }).then(res => {
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
        data[0] || 0,
        Number(data[1] || 0),
        Number(data[2] || 0),
        Number(data[3] || 0),
        Number(data[4] || 0),
        Number(data[5] || 0),
        data[30] || 0,
        data[31] || 0
        ] : [
        data[1] || 0,
        Number(data[2] || 0),
        Number(data[3] || 0),
        Number(data[6] || 0),
        Number(data[4] || 0),
        Number(data[5] || 0),
        data[17] || 0,
        data[18] || 0
        ]
        if (temp4 == 0) {
            console.log('temp4 == 0', code)
            return
        }
        let nub = temp4;
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
            'dangqianjiage': temp4,
            'timeRQ': temp7,
            'timeSJ': temp8
        };

        if (temp4 > 0 && !$.timeSJ[code + temp7 + temp8]) {
          $.timeSJ[code + temp7 + temp8] = true
          $.https.post('http://127.0.0.1:9999/HamstrerServlet/stockAll/add', str).then(function (message) {
              console.log(code + ':存储最新价格' + nub.toFixed(2) + '!');
          }).catch(function (err) {
              console.log(err);
          });
        }
        let stop = (parseInt((temp5 - temp3) / temp3 * 10000) / 100) || 0;
        let currEnt = parseInt((temp4 - temp3) / temp3 * 10000) / 100;
        console.log(code + '检测行情', currEnt + '%', stop);
        if (!$.openVal[code]) $.openVal[code] = {v:temp3, s:parseInt((temp4 - temp3) / temp3 * 10000) / 100};        
        if (currEnt < (stop < 0.02 && stop > 0.01 ? 0.01 : stop) - 0.025) {
            if (!$.flagCode[code]) {
                $.flagCode[code] = true;
                let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span><p>检测行情跌势'+ currEnt +'%</p>';
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: '清仓'});
                emailGet(null, $.codeData[code].name + '[' + code + ']:清仓', nubMon);
            }
            return
        }
        temp4 > 0 && flag && calculatingData(code, temp1);
    });
    function calculatingData(code, name) {
      if ($.Sday[code].length > 0) {
          let lengths = $.Sday[code].length - 1;
          let mean = $.Sday[code].sum();
          let newest = $.Sday[code][lengths];
          let max = $.Sday[code].max();
          let min = $.Sday[code].min();
          let currDay = $.Sday[code][0];
          let item = $.codeData[code];
          let maxSum = $.openVal[code].v * 1.05;
          let minSum = $.openVal[code].v * -1.02;
          let isMax = $.openVal[code].v * 0.004 < 0.03? 0.03 : $.openVal[code].v * 0.004;
          let isMin = $.openVal[code].v * 0.004 < 0.03? 0.03 : $.openVal[code].v * 0.004;
          console.log(newest,maxSum,isMax,minSum, isMin, 'max：', newest > maxSum, $.Sday[code].max().nub == $.Sday[code].length - 1, 'min:', newest < isMin, $.Sday[code].min().nub == $.Sday[code].length - 1);
          $.maxCurr[code].arr[0] || ($.maxCurr[code].arr[0] = maxSum);
          $.minCurr[code].arr[0] || ($.minCurr[code].arr[0] = minSum);
          let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
          let toEmail = null;
          if (newest > maxSum) {
              if (max.nub == lengths && $.soaringMax[code] == 0 && max.max > ($.maxCurr[code].arr[$.maxCurr[code].arr.length - 1] + $.maxCurr[code].nub)) {
                  emailGet(toEmail, $.codeData[code].name + '[' + code + ']:今日飙升中', '当前价：' + $.Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最高：' + max.max.toFixed(2) + ';上行：' + maxSum.toFixed(2) + ';上压：' + $.maxCurr[code].nub);
                  $.soaringMax[code] = 1;
                  $.minCurr[code].nub = 0;
              } else if ($.soaringMax[code] == 1 && newest < (max.max - isMax)) {
                  $.deal[item.codeID] && $.deal[item.codeID].up++;
                  let sale = '';
                  if ($.maxCurr[code].arr.length >= 3 ||  $.openVal[code].v * 1.075 < currDay) {
                    sale = '清仓'
                  } else if ($.maxCurr[code].arr.length == 1) {
                    sale = '清叁'
                  } else if ($.maxCurr[code].arr.length == 2) {
                    sale = '清贰'
                  }
                  $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: sale});
                  emailGet(toEmail, $.codeData[code].name + '[' + code + ']:' + sale, '当前价：' + $.Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最高：' + max.max.toFixed(2) + ';上行：' + maxSum.toFixed(2) + nubMon);
                  $.soaringMax[code] = 0;
                  $.maxCurr[code].nub = $.maxCurr[code].nub + mathNumber($.maxCurr[code].arr.length);
                  $.maxCurr[code].arr.push(max.max);
              }
          } else if (newest < minSum) {
              if (min.nub == lengths && $.soaringMin[code] == 0 && min.min < ($.minCurr[code].arr[$.minCurr[code].arr.length - 1] - $.minCurr[code].nub)) {
                //   emailGet(toEmail, $.codeData[code].name + '[' + code + ']:今日下降中', '当前价：' + $.Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最低：' + min.min.toFixed(2) + ';下行：' + minSum.toFixed(2) + ';下压：' + $.minCurr[code].nub);
                  $.soaringMin[code] = 1;
                  $.maxCurr[code].nub = 0
              } else if ($.soaringMin[code] == 1 && newest > (min.min + isMin)) {
                  $.deal[item.codeID] && $.deal[item.codeID].dow++
                //   emailGet(toEmail, $.codeData[code].name + '[' + code + ']:回升中', '当前价：' + $.Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最低：' + min.min.toFixed(2) + ';下行：' + minSum.toFixed(2) + nubMon);
                  $.soaringMin[code] = 0;
                  $.minCurr[code].nub = $.minCurr[code].nub + mathNumber($.minCurr[code].arr.length);
                  $.minCurr[code].arr.push(max.max);
              }
          }
          function mathNumber(val) {
              if (val == 1) {
                return $.openVal[code].v * 0.01
              } else if (val == 2) {
                return $.openVal[code].v * 0.003
              } else if (val == 3) {
                return $.openVal[code].v * 0.001
              } else {
                return 0.01
              }
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

// 检测行情
function statusFlag (k_lin) {
 if (!k_lin[1]) return true
 console.log('statusFlag', k_lin[0].boll.MB, k_lin[1].boll.MB)
 return k_lin[0] && k_lin[1] && (k_lin[0].boll.MB - k_lin[1].boll.MB <= 0)
}

module.exports.endEmail = function ($) {
    for (let item in $.codeIDarr1) {
        if ($.codeIDarr1[item].codeID) {
            let code = $.codeIDarr1[item].codeID;
            if (!$.openVal[code] || $.openVal[code].v < 9.9) {
                let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
                let toEmail = null;
                // if ($.soaringMax[code] == 1) {
                //     $.deal[code] && $.deal[code].up++
                //     emailGet(toEmail, $.codeData[code].name + '[' + code + ']:回降中', '当前价：' + $.Sday[code][$.Sday[code].length - 1].toFixed(2) + nubMon);
                //     $.soaringMax[code] = 0;
                // }
                // if ($.soaringMin[code] == 1) {
                //     $.deal[code] && $.deal[code].dow++
                //     emailGet(toEmail, $.codeData[code].name + '[' + code + ']:回升中', '当前价：' + $.Sday[code][$.Sday[code].length - 1].toFixed(2) + nubMon);
                //     $.soaringMin[code] = 0;
                // }
                $.io.sockets.emit('news',{content: '代码：' + code.substring(2, 8), title: '清仓'});
                emailGet(null, $.codeData[code].name + '[' + code + ']:清仓', nubMon);
                $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"status":0}});
            }
        }
    }
}