module.exports = function ($) {
  let current = 0;
  let arrDataCode = [];
  let data = null;
  $.status = {};
  async function stockFind(d) {
      for (let i = 0; i < d.data.length; i++) {
        let item = d.data[i];
        if (item) {
            await lookData(i, d.data.length, item);
            console.log('item', i);
        }
      }
  }
//   $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/find', {"codeID":"sh600240"}).then(function (d) {
  $.https.get('http://127.0.0.1:9999/HamstrerServlet/stock/find').then(function (d) {
    stockFind(d)
  });
  // 收集当天信息
  function lookData(index, len, item) {
    async function getApi(res) {
        console.log('lookData', index, len);      
        let data = res.data.split('=')[1].split('"').join('').split(';').join('').split(',');
        let [
        temp1, // 股票名称
        temp2, // 今日开盘价
        temp3, // 昨日收盘价
        temp4, // 现价（股票当前价，收盘以后这个价格就是当日收盘价）
        temp5, // 最高价
        temp6, // 最低价
        temp7, // 日期
        temp8, // 时间
        volume // 量
        ] = item.codeID.substring(0,2) !== 'hk' ? [
        data[0],
        Number(data[1]),
        Number(data[2]),
        Number(data[3]),
        Number(data[4]),
        Number(data[5]),
        data[30],
        data[31],
        Number(data[8])
        ] : [
        data[1],
        Number(data[2]),
        Number(data[3]),
        Number(data[6]),
        Number(data[4]),
        Number(data[5]),
        data[17],
        data[18],
        Number(data[8])
        ]
        if (Number(temp4) == 0) {
            current++
            lookData(index + 1, len)
            return;
        }
        let code = item.codeID;
        let timeRQ = temp7;
        let mean10, min10, max10, k_link;
        let o = {
            'max': Number(temp5),
            'min': Number(temp6),
            'mean': (Number(temp5) + Number(temp6)) / 2,
            'boll': null,
            'ks': Number(temp2),
            'js': Number(temp4),
            'volume': Number(volume),
            'mean5': null,
            'mean10': null,
            'mean20': null,
            'mean30': null,
            'deal': $.deal[item.codeID] || null,
            'timeRQ': temp7,
            'status': Number(temp4) - Number(temp2)
        }
        o.boll = boll(item['K-Lin'], o);
        k_link = [o];
        mean10 = [(Number(temp5) + Number(temp6)) / 2];
        min10 = [Number(temp6)];
        max10 = [Number(temp5)];
        if (item['K-Lin']) {
            let objCF = {}
            objCF[o.timeRQ] = true
            for (let k = 0; k < item['K-Lin'].length && k < 30; k++) {
                if (item['K-Lin'][k].js) {
                    mean10.push(item['K-Lin'][k].mean);
                    min10.push(item['K-Lin'][k].min);
                    max10.push(item['K-Lin'][k].max);
                    !objCF[item['K-Lin'][k].timeRQ] && k_link.push(item['K-Lin'][k]);
                    objCF[item['K-Lin'][k].timeRQ] = true;
                }
            }
        }
        // 计算5，10均线
        k_link.forEach((obj, index) => {
            if (index + 5 < k_link.length) {
                obj.mean5 = k_link.slice(index, index + 5).sum('js');
            }
            if (index + 10 < k_link.length) {
                obj.mean10 = k_link.slice(index, index + 10).sum('js');
            }
            if (index + 20 < k_link.length) {
                obj.mean20 = k_link.slice(index, index + 20).sum('js');
            }
        });
        mean10 = mean10.sum();
        min10 = min10.min().min;
        max10 = max10.max().max;
        let obj = {
            'minData': $.Sday[code] && $.Sday[code].length > 0 ? maxJudgeMinus($.Sday[code]) : [temp6, (temp5 + temp6) / 2],
            'maxData': $.Sday[code] && $.Sday[code].length > 0 ? maxJudgeAdd($.Sday[code]) : [temp5, (temp5 + temp6) / 2],
            'max': temp5,
            'min': temp6,
            'mean': (temp5 + temp6) / 2,
            'timeRQ': timeRQ,
            'mean10': mean10,
            'min10': min10,
            'max10': max10,
            'K-Lin': k_link
        };
        console.log('edit ->', index);
        if (obj.max) {
            await editData(item.codeID, obj, index);
        }
      }

      return $.https.get('http://hq.sinajs.cn/list=' + item.codeID, {
          'responseType': 'text/plain;charset=utf-8',
          'header': 'text/plain;charset=utf-8'
      }).then(getApi).catch(err => {
        !$.status[index + len] && lookData(index, len, item);
        $.status[index + len] = true;
      });
  }
  function editData (codeID, obj, index) {
      return $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit', {
          where: { codeID: codeID },
          setter: obj
      }).then(function (res) {
          console.log('成功 ' + codeID + '-->', index);
      }).catch(function (err) {
          console.log('失败 ', codeID + '-->', index);
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
  k_link[0].boll = {
    MD: MD,
    MB: MB
  } 
  let norm = k_link.length ? (([].concat(JudgeMax(k_link), JudgeMinus(k_link))).sum() || 2) : 2
  UP = MB + (norm * MD);
  DN = MB - (norm * MD);
  let obj = {
      MA: MA, // N日内的收盘价之和÷N
      MD: MD, // 计算标准差MD
      MB: MB, // 中线
      UP: UP, // 上线
      DN: DN // 下线
  };
  return obj
}

// 计算高点
function maxJudgeAdd(arrData) {
    let i = 0,
        n = 0,
        maxData = [],
        arr = [];
    for(i = 0; i < size; i++) {
        if(arrData[i] > mean) {
            arr.push(arrData[i])
        } else if(arr.length > 1) {
            maxData.push(arr.max().max)
            arr = [];
        }
    }
    if(arr.length > 1) {
        maxData.push(arr.max().max)
        arr = [];
    }
    return maxData || []
}
// 计算低点
function maxJudgeMinus(arrData) {
    let i = 0,
        n = 0,
        minData = [],
        arr = [];
    for(i = 0; i < size; i++) {
        if(arrData[i] < mean) {
            arr.push(arrData[i])
        } else if(arr.length > 1) {
            minData.push(arr.min().min)
            arr = [];
        }
    }
    if(arr.length > 1) {
        minData.push(arr.min().min)
        arr = [];
    }
    return minData || []
}

// boll计算高点
function JudgeMax (arrData) {
    let [i, maxData, arr, arrs, index] = [0, [], [], []]
    for (i = 0; i < arrData.length && arrData[i].boll; i++) {
      if (arrData[i].js > arrData[i].boll.MB) {
        arr.push(arrData[i].js)
        arrs.push(arrData[i])
      } else if (arr.length > 1) {
        index = arr.max().nub
        maxData.push((arrs[index].js - arrs[index].boll.MB) / arrs[index].boll.MD)
        arr = []
        arrs = []
      }
    }
    if (arr.length > 1) {
      index = arr.max().nub
      maxData.push((arrs[index].js - arrs[index].boll.MB) / arrs[index].boll.MD)
      arr = []
      arrs = []
    }
    return maxData
  }
  // boll计算低点
  function JudgeMinus (arrData) {
    let [i, minData, arr, arrs, nub] = [0, [], [], []]
    for (i = 0; i < arrData.length && arrData[i].boll; i++) {
      if (arrData[i].js < arrData[i].boll.MB) {
        arr.push(arrData[i].js)
        arrs.push(arrData[i])
      } else if (arr.length > 1) {
        nub = arr.min().nub
        minData.push((arrs[nub].boll.MB - arrs[nub].js) / arrs[nub].boll.MD)
        arr = []
        arrs = []
      }
    }
    if (arr.length > 1) {
      nub = arr.min().nub
      minData.push((arrs[nub].boll.MB - arrs[nub].js) / arrs[nub].boll.MD)
      arr = []
      arrs = []
    }
    return minData
  }