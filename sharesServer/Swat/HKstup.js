let email = require('../getemail');
// let indexNum = 0
module.exports = function (code, flag, $, itemIndex) {
  // console.log('HKstup', code, flag)
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
        ];
        if (temp4 == 0) {
            return
        }
        let nub = temp4;
        let name = temp1 + '[' + code + ']';
        let str = {
            'name': name,
            'daima': code,
            'dangqianjiage': temp4,
            'timeRQ': temp7,
            'timeSJ': temp8
        };
        $.timeRQ = temp7;
        if (temp4 > 0 && !$.timeSJ[code + temp7 + temp8]) {
          $.timeSJ[code + temp7 + temp8] = true
          $.https.post('http://127.0.0.1:9999/HamstrerServlet/stockAll/add', str).then(function (message) {
              console.log(code + ':存储最新价格' + nub.toFixed(2) + '!');
              if ($.Sday[code]) {
                $.Sday[code].push(nub);
              } else {
                $.Sday[code] = [];
                $.Sday[code].push(nub);
              }
              flag && calculatingData(code, temp1);
          }).catch(function (err) {
              console.log(err);
          });
        }
    });
    function calculatingData(code, name) {
      let data = {
        stor: { timeRQ: -1, timeSJ: -1 },
        data: {
          daima: code
        },
        limit: 300
      }
      $.https
      .post('http://127.0.0.1:9999/HamstrerServlet/stockAll/find', data)
      .then(d => {
        _MACD(d);
      })
      // macd分析价格
      function _MACD (d) {
        let list = []
        let arr = []
        d.data.forEach((item, i) => {
          arr.push(item.dangqianjiage)
        })
        d.data.forEach((item, i) => {
          if (i >= 24) {
            list.push(MACD(arr, 12, i - 24))
          }
        })
        // 开始分析
        if (list.length > 1) {
          let itemData = $.Sday[code] || []
          if (itemIndex != 0) {
            if (itemData[itemData.length-1] > itemData.sum()) {
              let EPS = (itemData.sum() - itemData[0]) / itemData[0]
              if (EPS > ($.EPS || 0)) {
                $.EPS = EPS
                [$.codeIDarr3[0], $.codeIDarr3[itemIndex]] = [$.codeIDarr3[itemIndex], $.codeIDarr3[0]]
              }
            }
          } else {
            let EPS = (itemData[itemData.length-1] - itemData[0]) / itemData[0]
            $.codeIDarr3[0].codeID == code && ($.EPS = EPS)
          }
          let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
          let upStr = '全仓';
          if ($.deal[code].up == 0) {
            upStr = '买叁';
          } else if ($.deal[code].up == 1) {
            upStr = '买贰';
          }
          let dowStr = '全仓';
          if ($.deal[code].dow == 0) {
            dowStr = '买叁';
          } else if ($.deal[code].dow == 1) {
            dowStr = '买贰';
          }
          if (!$.deal[code].info && $.codeIDarr3[0].codeID == code) { // 空仓
            console.log(code + '空仓', list[0].M1.toFixed(2), list[0].M2.toFixed(2), list[0].M.toFixed(2), $.EPS, $.HKflag)
            if (((list[0].M1 < list[0].M2 && (list[0].M - list[0].M2) > 0) || (list[0].M > list[0].M1 && list[0].M1 > list[0].M2)) && !$.HKflag) {
              emailGet(null, $.codeData[code].name + '[' + code + ']:' + upStr, '当前价：' + list[0].M + nubMon);
              let bottom = []
              for (let i = 0; i < list.length && (list[i].M1 < list[i].M2 || i < 5); i++) {
                bottom.push(list[i].M)
              }
              $.deal[code].up++
              $.deal[code].info = {
                M: list[0].M,
                bottom: bottom.min().min
              }
              $.HKflag = true
            }
          } else if ($.deal[code].info) { // 满仓
            console.log(code + '满仓', list[0].M1.toFixed(2), list[0].M2.toFixed(2), list[0].M.toFixed(2),$.deal[code].info.bottom.toFixed(2))
            if (list[0].M - $.deal[code].info.bottom >= 0) {
              if ((list[0].M - $.deal[code].info.M) / $.deal[code].info.M > 0.005) {
                if (list[0].M < list[0].M1 && list[1].M < list[1].M1) {
                  emailGet(null, $.codeData[code].name + '[' + code + ']:' + dowStr, '当前价：' + list[0].M + nubMon);
                  $.deal[code].info = null
                  $.HKflag = false
                }
              }
            } else if (list[0].M - $.deal[code].info.bottom < 0 && list[1].M - $.deal[code].info.bottom < 0) { // 破最低清仓
              emailGet(null, $.codeData[code].name + '[' + code + ']:清仓', '当前价：' + list[0].M + nubMon);
              $.deal[code].info = null
              $.deal[code].dow++
              $.HKflag = false
            }
          }
        }
      }
    }
}
// 计算布林值
function bolls (Arr, index = 0) {
  let klink = Arr
  let [MA, MD, MB, UP, DN, mean, sum, arr, i1, k1, k2] = [0, 0, 0, 0, 0, 0, 0, [], 0, 0, 0]
  for (let i = index; i < klink.length && i < index + 20; i++) {
    MA += Number(klink[i])
    arr.push(Number(klink[i]))
    i1++
  }
  MA = MA / i1
  for (let k = index; k < klink.length && k < index + 20; k++) {
    let item = klink[k]
    if (k < klink.length - 1) {
      sum += Math.pow(Number(item) - MA, 2)
      k1++
    }
    if (k > 0) {
      mean += Number(item)
      k2++
    }
  }
  MD = Math.sqrt(sum / k1)
  MB = mean / k2
  let sumK = (arr.max().max / arr.sum() + (arr.sum() + (arr.sum() - arr.min().min)) / arr.sum()) / 2
  UP = MB + (sumK * MD)
  DN = MB - (sumK * MD)
  let obj = {
    MA: MA, // N日内的收盘价之和÷N
    MD: MD, // 计算标准差MD
    MB: MB, // 中线
    UP: UP, // 上线
    DN: DN // 下线
  }
  return obj
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
function MACD (data, dayCount = 30, index) {
  let [M1, M2, sum1, sum2] = [0, 0, 0, 0]
  for (let i = index; i < index + dayCount; i++) {
    sum1 = 0
    for (let j = 0; j < dayCount; j++) {
      sum1 += data[i + j]
    }
    i === index && (M1 = sum1 / dayCount)
    sum2 += sum1 / dayCount
  }
  M2 = sum2 / dayCount
  return {
    M: data[index],
    M1: M1,
    M2: M2
  }
}
module.exports.endEmail = function ($) {
    for (let item in $.codeIDarr2) {
        if ($.codeIDarr2[item].codeID) {
            let code = $.codeIDarr2[item].codeID;
            let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
            emailGet(null, $.codeData[code].name + '[' + code + ']:清仓', '当前价：' + $.Sday[code][$.Sday[code].length - 1].toFixed(2) + nubMon);
        }
    }
}