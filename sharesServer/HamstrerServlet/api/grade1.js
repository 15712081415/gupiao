// /**
//  * Created by Administrator on 2017/5/14.
//  */

// //最小值
// Array.prototype.min = function () {
//     let _this = this;
//     let min = Number(_this[0]);
//     let len = _this.length;
//     let nub = 0;
//     for (let i = 1; i < len; i++) {
//         if (_this[i] != 0 && _this[i] < min) {
//             min = Number(_this[i]);
//             nub = i;
//         }
//     }
//     return { min: min, nub: nub };
//   }
//   //最大值
//   Array.prototype.max = function () {
//     let _this = this;
//     let max = Number(_this[0]);
//     let len = _this.length;
//     let nub = 0;
//     for (let i = 1; i < len; i++) {
//         if (_this[i] > max) {
//             max = Number(_this[i]);
//             nub = i;
//         }
//     }
//     return { max: max, nub: nub };
//   }
//   // 平均数
//   Array.prototype.sum = function (name) {
//     let _this = this;
//     let sum = 0;
//     let len = _this.length;
//     let i = 0;
//     if (typeof _this[i] == 'object') {
//         for (i = 0; i < len; i++) {
//             sum = sum + Number(_this[i][name]);
//         }
//     } else {
//         for (i = 0; i < len; i++) {
//             sum = sum + Number(_this[i]);
//         }
//     }
//     return sum / _this.length;
//   }
//   // 格式化排名
//   Array.prototype.srotGrade = function () {
//     let _this = this;
//     let arr = _this.reverse();
//     let str = '分数排名：<br />';
//     let val = [];
//     _this = _this.filter(item => { return !!item});
//     _this.length = 5;
//     _this.forEach((item, index) => {
//         if (item) {
//             index++;
//             str += '<p style="font-weight: 100;"><b style="color:#4093c6">'+ index +'. </b>';
//             item = item.sort((it1, it2) => {
//                 return it2.nub - it1.nub;
//             })
//             item = item.filter(item => { return !!item});
//             item.forEach((obj, i) => {
//                 val.push(obj)
//                 if (i > 0) str += ',';
//                 str += '<span style="color:#4093c6">'+ obj.code +':</span>(' + obj.nub + ')';
//             })
//             str += '<p />'
//         }
//     })
//     this.val = val;
//     return str;
//   }
//   // 格式化日期
//   function setTime() {
//     let myDate = new Date();
//     let y = myDate.getFullYear();
//     let m = myDate.getMonth() + 1;
//     m = m < 10 ? '0' + m : m;
//     let d = myDate.getDate();
//     d = d < 10 ? ('0' + d) : d;
//     return y + '-' + m + '-' + d;
//   }
//   // 封装consoles，方便切换测试模式
//   let consoles = {
//     log: function (...val) {
//         if (test) console.log(...val);
//     }
//   }
//   // -------------------------------------------------------------------------------------------
//   let test = 0; // 是否展示测试console
//   let fileArr = [];
//   let content = {};
//   let serverUrl = '';
//   let curr = 0;
//   let MaxNumber = [];
//   let type = data.type;
//   let config = {
//     volume: 3, // 量比
//     BF: 1, // 反转趋势
//     bollCurr: 5, // 布林线趋势
//     equilibrium: 100 // 均线分
//   };
//   axios.post('http://127.0.0.1:9999/HamstrerServlet/stock/find', test ? {"codeID":"sz300266"} : {}).then(function(d) {
//     if (d.data) {
//         fileArr = d.data.filter(item => {
//             return (item.codeID[2] == 6 || item.codeID[2] == 3 || item.codeID[2] == 0) && item.codeID[0] == 's';
//         })
//     }
//     init(res);
//   })
//   function api(codeID, cb) {
//     return axios.get('http://hq.sinajs.cn/list=' + codeID, {
//        responseType:'arraybuffer'
//     }).then(function (res) {
//       let str = iconv.decode(res.data, 'gbk');
//       strArr = str.split('var hq_str_');
//       strArr.splice(0,1);
//       strArr.forEach(item => {
//         let obj = item.split('=');
//         content[obj[0]] = obj[1].split('"').join('').split(';').join('').split(',')
//       })
//       curr++;
//       curr * 200 >= fileArr.length && cb();
//     })
//   }

//   function init (resSend) {
//     let arr = fileArr.map(item => item.codeID);
//     for(let i = 0;i<arr.length; i+=200) {
//       let codeArr = arr.slice(i, i + 200 < arr.length ? i + 200 : arr.length).toString();
//       api(codeArr, cb);
//       console.log('init', i, arr.length);
//     }
//     function cb () {
//         for(let i = 0;i<arr.length; i++) {
//             getHtml(i, arr.length);
//         }
//         // 发送结果
//         if (!MaxNumber.length) return;
//         emailGet(null, '双针探底股票评分', MaxNumber.srotGrade());
//         let Arr = MaxNumber.val;
//         resSend.send(JSON.stringify(Arr.slice(0, Number(type))));
//     }
//   }

//   function getHtml(index, len){
//     console.log('indexKS', index, len);
//     let item = fileArr[index];    
//     let data = content[item.codeID];
//     if (!(fileArr[index] && fileArr[index]['K-Lin'] && data)) {
//         return consoles.log('not K-Lin');
//     }
//     let [
//         temp1, // 股票名称
//         temp2, // 今日开盘价
//         temp3, // 昨日收盘价
//         temp4, // 现价（股票当前价，收盘以后这个价格就是当日收盘价）
//         temp5, // 最高价
//         temp6, // 最低价
//         temp7, // 日期
//         temp8, // 时间
//         volume
//     ] = item.codeID.indexOf('hk') === -1 ? [
//         data[0],
//         data[1],
//         data[2],
//         data[3],
//         data[4],
//         data[5],
//         data[30],
//         data[31],
//         data[8]
//     ] : [
//         data[1],
//         data[2],
//         data[3],
//         data[6],
//         data[4],
//         data[5],
//         data[17],
//         data[18],
//         data[8]
//     ]
//     if (temp1.indexOf('退市') > -1 || temp1.indexOf('ST') > -1) {
//         consoles.log('劣质股！');
//         return;
//     }
//     if (Number(temp4) == 0 || (Number(temp4) - Number(temp3)) / Number(temp3) > 0.05) {
//         consoles.log('max 5%');
//         return;
//     }
//     let timeRQ = temp7;
//     let k_link = [];
//     let o = {
//         'max': Number(temp5),
//         'min': Number(temp6),
//         'mean': (Number(temp5) + Number(temp6)) / 2,
//         'boll': null,
//         'ks': Number(temp2),
//         'js': Number(temp4),
//         'volume': Number(volume),
//         'mean5': null,
//         'mean10': null,
//         'mean20': null,
//         'deal': null,
//         'timeRQ': temp7,
//         'status': Number(temp4) - Number(temp2)
//     }
//     console.log('boll');
//     o.boll = boll(item['K-Lin'], o);
//     if (!item['K-Lin'][0] || item['K-Lin'][0].timeRQ != o.timeRQ) {
//         k_link = [o];
//     }
//     if (item['K-Lin']) {
//         for (let k = 0; k < item['K-Lin'].length && k < 20; k++) {
//             if (item['K-Lin'][k].js) {
//                 k_link.push(item['K-Lin'][k]);
//             }
//         }
//     }
//     // 计算5，10均线
//     console.log('均线');
//     k_link.forEach((obj, index) => {
//         if (index + 5 < k_link.length) {
//             obj.mean5 = k_link.slice(index, index + 5).sum('js');
//         }
//         if (index + 10 < k_link.length) {
//             obj.mean10 = k_link.slice(index, index + 10).sum('js');
//         }
//         if (index + 20 < k_link.length) {
//             obj.mean20 = k_link.slice(index, index + 20).sum('js');
//         }
//     });
//     consoles.log('开始scoreNumber计算分数');
//     scoreNumber(k_link, item.codeID);
//     console.log('getHtml + 1');
//   }
//   function scoreNumber(k_link, code) {
//     consoles.log('scoreNumber');    
//     // if (code == 'sh300062') debugger
//     let score = {status:0, numner:0};
//     k_link.splice(0,1); // 测试代码去掉 n 数据
//     if (k_link.length > 2) {
//         consoles.log('k_link', k_link[0]);
//         let Dip = doubleNeedeDip(k_link);
//         score.numner += Dip.val;
//         consoles.log('doubleNeedeDip  ------>',code, score);
//         let bollNum = bollCurr(k_link);
//         score.numner += bollNum > 15 ? 15 : bollNum;
//         consoles.log('bollCurr  ------>',code, score);
//         score.numner += volumeFun(k_link, Dip.val);
//         consoles.log('volumeFun  ------>',code, score);
//         score.numner -= equilibrium(k_link, Dip.val ? Dip.sum : null);
//         consoles.log('equilibrium  ------>',code, score);
//         let name = parseInt(score.numner);
//         if (name > 0) {
//             if (!MaxNumber[name]) MaxNumber[name] = [];
//             MaxNumber[name].push({code: code, nub: score.numner});
//         }
//     }
//   }
  
//   // 计算布林值
//   function boll(k, o) {
//     let k_link = [o].concat(k)
//     let MA = 0, MD = 0, MB = 0, UP = 0, DN = 0, mean = 0, sum = 0, arr = [], i1 = 0, k1 = 0, k2 = 0;
//     for (let i = 0; i < k_link.length && i < 20; i++) {
//         MA += Number(k_link[i].js)
//         arr.push(Number(k_link[i].js))
//         i1++
//     }
//     MA = MA / i1
//     for (let k = 0; k < k_link.length && k < 20; k++) {
//         let item = k_link[k];
//         if (k < k_link.length - 1) {
//             sum += Math.pow(Number(item.js) - MA, 2);
//             k1++
//         }
//         if (k > 0) {
//             mean += Number(item.js)
//             k2++
//         }
//     }
//     MD = Math.sqrt(sum / k1);
//     MB = mean / k2;
//     let norm = ([].concat(JudgeMax(k_link), JudgeMinus(k_link))).sum() || 2
//     UP = MB + (norm * MD);
//     DN = MB - (norm * MD);
//     let obj = {
//         MA: MA,
//         MD: MD,
//         MB: MB,
//         UP: UP,
//         DN: DN
//     };
//     return obj
//   }
//   // 均线
//   function equilibrium(k_link, sum) {
//     let nub = 0;
//     let item = k_link[0];
//     let mean = sum ? sum : item.mean5;
//     let min = sum ? item.min : item.js;
//     if (item && mean && min) {
//         if (mean > min) {
//             nub = (mean - min) / mean * config.equilibrium;
//         } else {
//             nub = (min - mean) / min * config.equilibrium;
//         }
//     }
//     return nub;
//   }

//   // 价格区间记分
//   function bollCurr(k_link) {
//     consoles.log('bollCurr ---->', k_link[0].boll);
//     if ((k_link[0].boll.MB + k_link[0].boll.DN) / 2 < k_link[0].js) return 0;
//     let nub = k_link.length ? (k_link[0].boll.UP / k_link[0].js * config.bollCurr) || 0 : 0;
//     if (k_link[0] && k_link[1] && k_link[0].js > k_link[1].max) {
//         nub += (k_link[0].js / k_link[1].max * config.bollCurr * 0.5) || 0;
//     }
//     return nub;
//   }
//   // 量比记分
//   function volumeFun(k_link, type) {
//       // 量比加分
//       let numner = 0;
//       if (k_link[0].volume && k_link[0+1].volume && k_link[0+1].volume > k_link[0].volume && (!type || k_link[0].status)) {
//           let vol = k_link[0+1].volume / k_link[0].volume;
//           numner += (vol > 3 ? 3 : vol) * config.volume;
//         //   numner += vol * config.volume;
//           consoles.log('volumeFun >>> 量比1', numner);
//           numner += k_link[0+1].status > 0 ? config.volume * 0.8 : 0;
//           consoles.log('volumeFun >>> 量比2', numner);
//           let volume = true;
//           for (let i=1;k_link[i] && k_link[i].volume && i<k_link.length;i++) {
//               if (k_link[i].volume < k_link[0].volume) volume=false;
//           }
//           if (volume) numner += config.volume;
//           consoles.log('volumeFun >>> 量比3', numner);
//       }
//       consoles.log('volumeFun >>> 量比', numner);
//       return numner;
//   }

//   // 双针探底
//   function doubleNeedeDip (k_link) {
//     consoles.log('doubleNeedeDip k_link ------>', k_link[0].timeRQ);
//       let num = 0;
//       let min0 = {};
//       let min1 = {};
//       function minNeede (item,n = 2) {
//         let obj = {
//             val: 0, // 下引线得分
//             min: item.min, // 最低价
//             js: 0, // 下价
//             flag: false // 是否符合引线
//         };
//         if (item.status > 0) {
//            obj.val = parseInt((item.ks - item.min) / item.min * 10000 || 0) / 100;
//            consoles.log('doubleNeedeDip obj.val ------>', obj.val);
//            obj.flag = obj.val > n;
//            obj.js = item.ks;
//         } else {
//            obj.val = parseInt((item.js - item.min) / item.min * 10000 || 0) / 100;
//            consoles.log('doubleNeedeDip obj.val ------>', obj.val);
//            obj.flag = obj.val > n;
//            obj.js = item.js;
//         }
//         return obj;
//       }
//       let [js,ks,max,min] = [[],[],[],[]];
//       k_link.forEach((item, i) => {
//         js.push(item.js);
//         ks.push(item.ks);
//         max.push(item.max);
//         min.push(item.min);
//       });
//       let minNmb = min.min().nub;
//       consoles.log('doubleNeedeDip minNmb1 ------>', minNmb);
//       if (minNmb != 0 && minNmb < 6) {
//           min1 = minNeede(k_link[minNmb], 2.5); // 最低针探底
//           consoles.log('doubleNeedeDip min1 ------>', minNmb);
//           if (min1.flag) {
//             min[minNmb] = 10000000;
//             minNmb = min.min().nub;
//             consoles.log('doubleNeedeDip minNmb2 ------>', minNmb);
//             min0 = minNeede(k_link[minNmb], 2); // 最低针探底
//             if (minNmb == 0 && min0.flag) {
//                 num += min0.val;
//                 num += min1.val;          
//                 if (min0.min > min1.min && min0.min < min1.js) {
//                     num += 10;
//                 }
//                 consoles.log('doubleNeedeDip + ------>', num);                
//             }
//           }
//       }
//       consoles.log('doubleNeedeDip end ------>', num);  
//       return {val:num, sum: min1.min}
//   }

//   // 发送邮件
//   function emailGet(to, tit, text) {
//     !test && email.send(to, tit, text, function (err, info) {
//         if (err) {
//             consoles.log(err);
//             return;
//         }
//         consoles.log('邮件:', tit);
//     })
//   }
  
//   // boll计算高点
//   function JudgeMax (arrData) {
//     let [i, maxData, arr, arrs, index] = [0, [], [], []]
//     for (i = 0; i < arrData.length && arrData[i].boll; i++) {
//       if (arrData[i].js > arrData[i].boll.MB) {
//         arr.push(arrData[i].js)
//         arrs.push(arrData[i])
//       } else if (arr.length > 1) {
//         index = arr.max().nub
//         maxData.push((arrs[index].js - arrs[index].boll.MB) / arrs[index].boll.MD)
//         arr = []
//         arrs = []
//       }
//     }
//     if (arr.length > 1) {
//       index = arr.max().nub
//       maxData.push((arrs[index].js - arrs[index].boll.MB) / arrs[index].boll.MD)
//       arr = []
//       arrs = []
//     }
//     consoles.log('maxData:', maxData);
//     return maxData
//   }
//   // boll计算低点
//   function JudgeMinus (arrData) {
//     let [i, minData, arr, arrs, nub] = [0, [], [], []]
//     for (i = 0; i < arrData.length && arrData[i].boll; i++) {
//       if (arrData[i].js < arrData[i].boll.MB) {
//         arr.push(arrData[i].js)
//         arrs.push(arrData[i])
//       } else if (arr.length > 1) {
//         nub = arr.min().nub
//         minData.push((arrs[nub].boll.MB - arrs[nub].js) / arrs[nub].boll.MD)
//         arr = []
//         arrs = []
//       }
//     }
//     if (arr.length > 1) {
//       nub = arr.min().nub
//       minData.push((arrs[nub].boll.MB - arrs[nub].js) / arrs[nub].boll.MD)
//       arr = []
//       arrs = []
//     }
//     consoles.log('minData:', minData);
//     return minData
//   }


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
    let len = _this.length;
    let nub = 0;
    for (let i = 1; i < len; i++) {
        if (_this[i] > max) {
            max = Number(_this[i]);
            nub = i;
        }
    }
    return { max: max, nub: nub };
  }
  // 平均数
  Array.prototype.sum = function (name) {
    let _this = this;
    let sum = 0;
    let len = _this.length;
    let i = 0;
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
  // 格式化排名
  Array.prototype.srotGrade = function () {
    let _this = this;
    let arr = _this.reverse();
    let str = '分数排名：<br />';
    let val = [];
    _this = _this.filter(item => { return !!item});
    _this.length = 5;
    _this.forEach((item, index) => {
        if (item) {
            index++;
            str += '<p style="font-weight: 100;"><b style="color:#4093c6">'+ index +'. </b>';
            item = item.sort((it1, it2) => {
                return it2.nub - it1.nub;
            })
            item = item.filter(item => { return !!item});
            item.forEach((obj, i) => {
                val.push(obj);
                if (i > 0) str += ',';
                str += '<span style="color:#4093c6">'+ obj.code +':</span>(' + obj.nub + ')';
            })
            str += '<p />'
        }
    })
    this.val = val;
    return str;
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
  // 封装consoles，方便切换测试模式
  let consoles = {
    log: function (...val) {
        if (test) console.log(...val);
    }
  }
  // -------------------------------------------------------------------------------------------
  let test = 0; // 是否展示测试console
  let testData = 0; // 测试股票几率 ... 0为不测试
  let testCurr = 1; // 测试股票当前索引
  let statusUp = {
      UP: [],
      DN: [],
      all: 0,
      ok: 0
  };
  let fileArr = [];
  let content = {};
  let serverUrl = '';
  let curr = 0;
  let MaxNumber = [];
  let type = data.type;
  let config = {
    volume: 3, // 量比
    BF: 1, // 反转趋势
    bollCurr: 5, // 布林线趋势
    equilibrium: 100 // 均线分
  };
  axios.post('http://127.0.0.1:9999/HamstrerServlet/stock/find', test ? {"codeID":"sz300266"} : {}).then(function(d) {
    if (d.data) {
        fileArr = d.data.filter(item => {
            return (item.codeID[2] == 6 || item.codeID[2] == 3 || item.codeID[2] == 0) && item.codeID[0] == 's';
        })
    }
    if (testData) res.send();
    init();
  })
  function api(codeID) {
    return axios.get('http://hq.sinajs.cn/list=' + codeID, {
       responseType:'arraybuffer'
    }).then(function (res) {
      let str = iconv.decode(res.data, 'gbk');
      strArr = str.split('var hq_str_');
      strArr.splice(0,1);
      strArr.forEach(item => {
        let obj = item.split('=');
        content[obj[0]] = obj[1].split('"').join('').split(';').join('').split(',')
      })
      curr++;
      curr * 200 >= fileArr.length && cb();
    })
  }

    function init () {
        let arr = fileArr.map(item => item.codeID);
        for(let i = 0;i<arr.length; i+=200) {
            let codeArr = arr.slice(i, i + 200 < arr.length ? i + 200 : arr.length).toString();
            api(codeArr);
            console.log('init', i, arr.length);
        }
    }
    function cb (flag) {
        if (flag) {
            MaxNumber = [];
        }
        let arr = fileArr.map(item => item.codeID);
        for(let i = 0;i<arr.length; i++) {
            getHtml(i, arr.length);
        }
        // 发送结果
        let str = MaxNumber.srotGrade();
        console.log('testData', testData, testCurr);
        if (testData) {
            if (testData == testCurr - 1) {
                emailGet(null, '追涨票评分---测试数据', JSON.stringify(statusUp));
            } else {
                let Arr = MaxNumber.val;
                let a = Arr.slice(0, Number(type));
                statusUp.all += a.length;
                let up = a.filter(item => item.status).map(item => {
                    return {
                        min:item.min,
                        max:item.max
                    }
                });
                let dn = a.filter(item => !item.status).map(item => {
                    return {
                        min:item.min,
                        max:item.max
                    }
                });
                up.length && statusUp.UP.push(up);
                dn.length && statusUp.DN.push(dn);
                statusUp.ok += a.filter(item => item.status).length;
                testCurr++;
                cb(true);
            }
        } else {
            if (!MaxNumber.length) return;
            emailGet(null, '追涨票评分', str);
            let Arr = MaxNumber.val;
            res.send(JSON.stringify(Arr.slice(0, Number(type))));
        }
    }

  function getHtml(index, len){
    console.log('indexKS', index, len);
    let item = fileArr[index];    
    let data = content[item.codeID];
    if (!(fileArr[index] && fileArr[index]['K-Lin'] && data)) {
        return consoles.log('not K-Lin');
    }
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
    ] = item.codeID.indexOf('hk') === -1 ? [
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
    if (temp1.indexOf('退市') > -1 || temp1.indexOf('ST') > -1) {
        consoles.log('劣质股！');
        return;
    }
    if (Number(temp4) == 0 || (Number(temp4) - Number(temp3)) / Number(temp3) > 0.05) {
        consoles.log('max 5%');
        return;
    }
    let timeRQ = temp7;
    let k_link = [];
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
        'deal': null,
        'timeRQ': temp7,
        'status': Number(temp4) - Number(temp2)
    }
    console.log('boll');
    o.boll = boll(item['K-Lin'], o);
    if (!item['K-Lin'][0] || item['K-Lin'][0].timeRQ != o.timeRQ) {
        k_link = [o];
    }
    if (item['K-Lin']) {
        for (let k = 0; k < item['K-Lin'].length && k < 20; k++) {
            if (item['K-Lin'][k].js) {
                k_link.push(item['K-Lin'][k]);
            }
        }
    }
    // 计算5，10均线
    console.log('均线');
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
        if (index + 30 < k_link.length) {
            obj.mean30 = k_link.slice(index, index + 30).sum('js');
        }
    });
    consoles.log('开始scoreNumber计算分数');
    scoreNumber(k_link, item.codeID);
    console.log('getHtml + 1');
  }
  function scoreNumber(k_link, code) {
    consoles.log('scoreNumber');    
    // if (code == 'sh300062') debugger
    let score = {status:0, numner:0};
    let k__link = testData ? k_link.slice(testCurr, k_link.length) : k_link; // 测试代码去掉 n 数据
    if (k__link.length > 2) {
        consoles.log('k_link', k_link[0]);
        let Dip = doubleNeedeDip(k_link);
        score.numner += Dip.val;
        consoles.log('doubleNeedeDip  ------>',code, score);
        let bollNum = bollCurr(k_link);
        score.numner += bollNum > 15 ? 15 : bollNum;
        consoles.log('bollCurr  ------>',code, score);
        score.numner += volumeFun(k_link, Dip.val);
        consoles.log('volumeFun  ------>',code, score);
        score.numner -= equilibrium(k_link, Dip.val ? Dip.sum : null);
        consoles.log('equilibrium  ------>',code, score);
        let name = parseInt(score.numner);
        if (name > 0) {
            if (!MaxNumber[name]) MaxNumber[name] = [];
            MaxNumber[name].push({
                code: code,
                nub: score.numner,
                max: parseInt((k_link[testCurr - 1].max / k_link[testCurr].js - 1) * 10000) / 100,
                min: parseInt((k_link[testCurr - 1].min / k_link[testCurr].js - 1) * 10000) / 100,
                upNub: parseInt((k_link[testCurr - 1].js / k_link[testCurr].js - 1) * 10000) / 100,
                status: k_link[testCurr - 1].js > k_link[testCurr].js,
                timeRQ: k__link[0].timeRQ
            });
        }
    }
  }
  
  // 计算布林值
  function boll(k, o) {
    let k_link = [o].concat(k)
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
    let norm = ([].concat(JudgeMax(k_link), JudgeMinus(k_link))).sum() || 2
    UP = MB + (norm * MD);
    DN = MB - (norm * MD);
    let obj = {
        MA: MA,
        MD: MD,
        MB: MB,
        UP: UP,
        DN: DN
    };
    return obj
  }
  // 均线
  function equilibrium(k_link, sum) {
    let nub = 0;
    let item = k_link[0];
    let mean = sum ? sum : item.mean5;
    let min = sum ? item.min : item.js;
    if (item && mean && min) {
        if (mean > min) {
            nub = (mean - min) / mean * config.equilibrium;
        } else {
            nub = (min - mean) / min * config.equilibrium;
        }
    }
    return nub;
  }

  // 价格区间记分
  function bollCurr(k_link) {
    consoles.log('bollCurr ---->', k_link[0].boll);
    if ((k_link[0].boll.MB + k_link[0].boll.DN) / 2 < k_link[0].js) return 0;
    let nub = k_link.length ? (k_link[0].boll.UP / k_link[0].js * config.bollCurr) || 0 : 0;
    if (k_link[0] && k_link[1] && k_link[0].js > k_link[1].max) {
        nub += (k_link[0].js / k_link[1].max * config.bollCurr * 0.5) || 0;
    }
    return nub;
  }
  // 量比记分
  function volumeFun(k_link, type) {
      // 量比加分
      let numner = 0;
      if (k_link[0].volume && k_link[0+1].volume && k_link[0+1].volume > k_link[0].volume && (!type || k_link[0].status)) {
          let vol = k_link[0+1].volume / k_link[0].volume;
          numner += (vol > 3 ? 3 : vol) * config.volume;
        //   numner += vol * config.volume;
          consoles.log('volumeFun >>> 量比1', numner);
          numner += k_link[0+1].status > 0 ? config.volume * 0.8 : 0;
          consoles.log('volumeFun >>> 量比2', numner);
          let volume = true;
          for (let i=1;k_link[i] && k_link[i].volume && i<k_link.length;i++) {
              if (k_link[i].volume < k_link[0].volume) volume=false;
          }
          if (volume) numner += config.volume;
          consoles.log('volumeFun >>> 量比3', numner);
      }
      consoles.log('volumeFun >>> 量比', numner);
      return numner;
  }

  // 双针探底
  function doubleNeedeDip (k_link) {
    consoles.log('doubleNeedeDip k_link ------>', k_link[0].timeRQ);
      let num = 0;
      let min0 = {};
      let min1 = {};
      function minNeede (item,n = 2) {
        let obj = {
            val: 0, // 下引线得分
            min: item.min, // 最低价
            js: 0, // 下价
            flag: false // 是否符合引线
        };
        if (item.status > 0) {
           obj.val = parseInt((item.ks - item.min) / item.min * 10000 || 0) / 100;
           consoles.log('doubleNeedeDip obj.val ------>', obj.val);
           obj.flag = obj.val > n;
           obj.js = item.ks;
        } else {
           obj.val = parseInt((item.js - item.min) / item.min * 10000 || 0) / 100;
           consoles.log('doubleNeedeDip obj.val ------>', obj.val);
           obj.flag = obj.val > n;
           obj.js = item.js;
        }
        return obj;
      }
      let [js,ks,max,min] = [[],[],[],[]];
      k_link.forEach((item, i) => {
        js.push(item.js);
        ks.push(item.ks);
        max.push(item.max);
        min.push(item.min);
      });
      let minNmb = min.min().nub;
      consoles.log('doubleNeedeDip minNmb1 ------>', minNmb);
      if (minNmb != 0 && minNmb < 6) {
          min1 = minNeede(k_link[minNmb], 2.5); // 最低针探底
          consoles.log('doubleNeedeDip min1 ------>', minNmb);
          if (min1.flag) {
            min[minNmb] = 10000000;
            minNmb = min.min().nub;
            consoles.log('doubleNeedeDip minNmb2 ------>', minNmb);
            min0 = minNeede(k_link[minNmb], 2); // 最低针探底
            if (minNmb == 0 && min0.flag) {
                num += min0.val;
                num += min1.val;          
                if (min0.min > min1.min && min0.min < min1.js) {
                    num += 10;
                }
                consoles.log('doubleNeedeDip + ------>', num);                
            }
          }
      }
      consoles.log('doubleNeedeDip end ------>', num);  
      return {val:num, sum: min1.min}
  }
  // 发送邮件
  function emailGet(to, tit, text) {
    !test && email.send(to, tit, text, function (err, info) {
        if (err) {
            consoles.log(err);
            return;
        }
        consoles.log('邮件:', tit);
    })
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
    consoles.log('maxData:', maxData);
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
    consoles.log('minData:', minData);
    return minData
  }