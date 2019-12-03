module.exports = function ($) {
  let current = 0;
  let arrDataCode = [];
  let data = null;
  let fileArr = [];
  let content = {};
  let curr = 0;
  $.status = {};
  function api(codeID) {
    return $.https.get('http://hq.sinajs.cn/list=' + codeID, {
//        responseType:'arraybuffer'
    }).then(function (res) {
    //   let str = iconv.decode(res.data, 'gbk');
      let strArr = res.data.split('var hq_str_');
      strArr.splice(0,1);
      strArr.forEach(item => {
        let obj = item.split('=');
        content[obj[0]] = obj[1].split('"').join('').split(';').join('').split(',')
      })
      curr++;
      console.log('api ->', curr)
      curr * 200 >= fileArr.length && cb();
    })
  }
  async function stockFind() {
    let arr = fileArr.map(item => item.codeID);
    for(let i = 0;i<arr.length; i+=200) {
        let codeArr = arr.slice(i, i + 200 < arr.length ? i + 200 : arr.length).toString();
        await api(codeArr);
        console.log('init', i, arr.length);
    }
  }

//   $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/find', {"codeID":"sh600240"}).then(function (d) {
  $.https.get('http://127.0.0.1:9999/HamstrerServlet/stock/find').then(function (d) {
      // fileArr = require('../data/data.json'); // 更新错误数据
    fileArr = d.data;
    stockFind();
  });
  function cb (flag) {
    if (flag) {
        MaxNumber = [];
    }
    console.log('arr 1');
    let arr = fileArr.map(item => item.codeID);
    console.log('arr 2');
    getApi(0, arr.length);
}
  // 收集当天信息
    async function getApi(index, len) {
        if (index >= len) return console.log($.timeRQ);
        console.log('lookData', index, len);      
        let item = fileArr[index];    
        let data = content[item.codeID] || {};
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
            getApi(index+1, len);
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
            'MACD': null,
            'KDJ': null,
            'WR': null,
            'ENE': null,
            'status': Number(temp4) - Number(temp2)
        }
        o.boll = boll(item['K-Lin'], o);
        k_link = [o];
        mean10 = [(Number(temp5) + Number(temp6)) / 2];
        min10 = [Number(temp6)];
        max10 = [Number(temp5)];
        console.log("item['K-Lin']", !!item['K-Lin'])
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
            if (k_link[1] && !k_link[1].MACD) {
                for (let j = k_link.length - 1; j >= 0; j--) {
                    k_link[j].MACD = MACD(k_link.slice(j, k_link.length));
                }
            } else {
                k_link[0].MACD = MACD(k_link);
            }
            
            if (k_link[1] && !k_link[1].KDJ) {
                for (let j = k_link.length - 9; j >= 0; j--) {
                    k_link[j].KDJ = KDJ(k_link.slice(j, k_link.length));
                }
            } else {
                k_link[0].KDJ = KDJ(k_link);
            }

            if (k_link[1] && !k_link[1].WR) {
                for (let j = k_link.length - 10; j >= 0; j--) {
                    k_link[j].WR = WR(k_link.slice(j, k_link.length));
                }
            } else {
                k_link[0].WR = WR(k_link);
            }

            if (k_link[1] && !k_link[1].ENE) {
                for (let j = k_link.length - 10; j >= 0; j--) {
                    k_link[j].ENE = ENE(k_link.slice(j, k_link.length));
                }
            } else {
                k_link[0].ENE = ENE(k_link);
            }
        }
        console.log("均线")
        // 计算5，10均线
        if (5 < k_link.length) {
            k_link[0].mean5 = k_link.slice(0, 5).sum('js');
        }
        if (10 < k_link.length) {
            k_link[0].mean10 = k_link.slice(0, 10).sum('js');
        }
        if (20 < k_link.length) {
            k_link[0].mean20 = k_link.slice(0, 20).sum('js');
        }
        if (28 < k_link.length) {
            k_link[0].mean30 = k_link.slice(0, 30).sum('js');
        }
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
            await addData(item.codeID, obj, index, len);
            await editData(item.codeID, obj, index, len);
            getApi(index+1, len);
        } else {
            getApi(index+1, len);
        }
    }
  function editData (codeID, obj, index, len) {
    return $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit', {
          where: { codeID: codeID },
          setter: obj
      }).then(function (res) {
          console.log('成功 ' + codeID + '-->', index);
      }).catch(function (err) {
          console.log('失败 ', codeID + '-->', index);
      })
  }

  function addData (codeID, obj, index, len) {
      let data = {
        'codeID': codeID,
        'K-Lin': obj['K-Lin'][0],
        'timeRQ': obj.timeRQ
      };
    return $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock_k/add', data).then(function (res) {
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
        mean = arrData.sum(),
        arr = [];
    for(i = 0; i < arrData.length; i++) {
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
        mean = arrData.sum(),
        arr = [];
    for(i = 0; i < arrData.length; i++) {
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

// MACD
function EMA(nub, k_link, js, name) {
    let num = 0;
    name = name || nub;
    if (k_link[1] && k_link[1].MACD && k_link[1].MACD['EMA_'+name]) {
        num = (k_link[1].MACD['EMA_' + name] || 0) * (nub - 1) / (nub+1) + js[0] * 2 / (nub + 1);
    }
    return num || js[0];
}
function MACD(k_link) {
    let js = k_link.map(item => item.js);
    let DEA = k_link.map(item => { return item.MACD && item.MACD.DEA ? item.MACD.EMA_DEA : 0});
    let obj = {};
    obj.EMA_12 = EMA(12, k_link, js);
    obj.EMA_26 = EMA(26, k_link, js);
    obj.EMA_DIF = (Number(obj.EMA_12) - Number(obj.EMA_26));
    obj.EMA_DEA = 0.2 * obj.EMA_DIF + 0.8 * EMA(9, k_link, DEA, 'DEA');
    obj.EMA_BAR = (obj.EMA_DIF - obj.EMA_DEA) * 2
    return obj;
}


// KDJ
function KDJ (list, key) {
    let k_link = list;
    let [max, min] = [k_link[0].max,k_link[0].min]
    let obj = {
        RSV: 0,
        K: 50,
        D: 50,
        J: 50
    };
    console.log(1)
    if (k_link[8]) {
        console.log(2)
        for (let i=1;i<9;i++) {
            if (k_link[i].max > max) max = k_link[i].max;
            if (k_link[i].min < min) min = k_link[i].min;
        }
        console.log(3, k_link.length)
        obj.RSV = (k_link[0].js-min)/(max-min)*100;
        if (k_link[1].KDJ && k_link[1].KDJ.K) {
            obj.K = 2 / 3 * k_link[1].KDJ.K+ 1 / 3 * obj.RSV;
        } else {
            console.log(4)
            let k = k_link.slice(0,1);
            obj.K = 2/3*KDJ(k, 'K')+1/3*obj.RSV;
        }
        if (k_link[1].KDJ && k_link[1].KDJ.D) {
            obj.D = 2 / 3 * k_link[1].KDJ.D+ 1 / 3 * obj.K;
        } else {
            console.log(5)
            let d = k_link.slice(0,1);
            obj.D = 2/3*KDJ(d, 'D')+1/3*obj.K;
        }
        obj.J = 3 * obj.K - 2 * obj.D;
    }
    return key ? obj[key] : obj;
}

function WR (list) {
    if (list.length < 10) {
        return null
    }
    let type = [10,6];
    let obj = {
    }
    type.forEach(item => {
        obj['WR' + item] = 100 * ( HIGH(item)- list[0].js ) / ( HIGH(item)-LOW(item) ) 
        console.log('WR' + item, HIGH(item), LOW(item), list[0].js)
    })
    function HIGH (N) {
        let arr = []
        for (let i = 0;i < N; i++) {
            arr.push(list[i].max)
        }
        return arr.max().max
    }
    function LOW (N) {
        let arr = []
        for (let i = 0;i < N; i++) {
            arr.push(list[i].min)
        }
        return arr.min().min
    }
    return obj
}

function ENE(list) {
    if (list.length < 10) {
        return null
    }
    var N=10,
    M1=11,
    M2=9,
    MA=list.slice(0, 10),
    UPPER=(1+M1/100)*MA.sum('js'),
    LOWER=(1-M2/100)*MA.sum('js'),
    ENE=(UPPER + LOWER)/2;
    let obj = {
        UPPER,
        LOWER,
        ENE
    }
    return obj
}