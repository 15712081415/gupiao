<template>
  <div>
  <div style='max-width: 500px;margin: 10px auto'>
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="股票代码">
        <el-input v-model="codeID"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="init()">查看数据</el-button>
      </el-form-item>
    </el-form>
    </div>
    <div style="max-width: 1000px;margin: 10px auto">
      <div>
        <template>
          <el-table
            :data="data"
            border
            align="left"
            style="margin:0 auto">
            <el-table-column
              prop="codeID"
              label="代码"
              width="120">
            </el-table-column>
            <el-table-column
              prop="name"
              label="名称"
              width="120">
            </el-table-column>
            <el-table-column
              prop="max"
              label="上次最高"
              width="120">
            </el-table-column>
            <el-table-column
              prop="min"
              width="120"
              label="上次最低">
            </el-table-column>
            <el-table-column
              prop="timeRQ"
              width="120"
              label="日期">
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态">
              <template slot-scope="scope">
                <el-button type="primary" class="f-info" @click="dayLink(scope.row)">日线</el-button>
                <el-button type="primary" class="f-info" @click="minuteLink(scope.row)">5分钟线</el-button>
                <el-button type="primary" class="f-info" @click="presentLink(scope.row)">实时</el-button>
                <el-button type="primary" class="f-info" @click="MACDLink(scope.row)">MACD</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
  </div>
  <el-dialog :title="'' + code + ' -- k线图'" :visible.sync="flag" @open="echartEv">
    <div id="echart" style="width: 674px;height:300px"></div>
  </el-dialog>
  </div>
</template>
<script>
// 最小值
let min = function (obj) {
  let _this = obj
  let min = Number(_this[0])
  let len = _this.length
  let nub = 0
  for (let i = 1; i < len; i++) {
    if (_this[i] !== 0 && _this[i] < min) {
      min = Number(_this[i])
      nub = i
    }
  }
  return { min: min, nub: nub }
}
// 最大值
let max = function (obj) {
  let _this = obj
  let max = Number(_this[0])
  let len = obj.length
  let nub = 0
  for (let i = 1; i < len; i++) {
    if (obj[i] > max) {
      max = Number(_this[i])
      nub = i
    }
  }
  return { max: max, nub: nub }
}
// 平均数
let sums = function (obj, name) {
  let sum = 0
  let len = obj.length
  let i = 0
  let _this = obj
  if (typeof _this[i] === 'object') {
    for (i = 0; i < len; i++) {
      sum = sum + Number(_this[i][name])
    }
  } else {
    for (i = 0; i < len; i++) {
      sum = sum + Number(_this[i])
    }
  }
  return sum / _this.length
}
// 计算高点
function maxJudgeAdd (arrData) {
  let [i, maxData, arr, arrs, index] = [0, [], [], []]
  for (i = 0; i < arrData.length && arrData[i].boll; i++) {
    if (arrData[i].js > arrData[i].boll.MB) {
      arr.push(arrData[i].js)
      arrs.push(arrData[i])
    } else if (arr.length > 1) {
      index = max(arr).nub
      maxData.push((arrs[index].js - arrs[index].boll.MB) / arrs[index].boll.MD)
      arr = []
      arrs = []
    }
  }
  if (arr.length > 1) {
    index = max(arr).nub
    maxData.push((arrs[index].js - arrs[index].boll.MB) / arrs[index].boll.MD)
    arr = []
    arrs = []
  }
  return maxData
}
// 计算低点
function maxJudgeMinus (arrData) {
  let [i, minData, arr, arrs, nub] = [0, [], [], []]
  for (i = 0; i < arrData.length && arrData[i].boll; i++) {
    if (arrData[i].js < arrData[i].boll.MB) {
      arr.push(arrData[i].js)
      arrs.push(arrData[i])
    } else if (arr.length > 1) {
      nub = min(arr).nub
      minData.push((arrs[nub].boll.MB - arrs[nub].js) / arrs[nub].boll.MD)
      arr = []
      arrs = []
    }
  }
  if (arr.length > 1) {
    nub = min(arr).nub
    minData.push((arrs[nub].boll.MB - arrs[nub].js) / arrs[nub].boll.MD)
    arr = []
    arrs = []
  }
  return minData
}
export default {
  name: 'add',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      codeID: '',
      code: '',
      form: {},
      list: [],
      data: [],
      index: 0,
      boll: {},
      status: 1,
      obj: null,
      flag: false
    }
  },
  methods: {
    init () {
      let obj = {}
      if (this.codeID) {
        obj.codeID = this.codeID
      } else {
        obj.status = { $gt: 0 }
      }
      console.log('init ->', obj)
      this.$axios
        .post('/api/HamstrerServlet/stock/find', obj)
        .then(d => {
          this.data = d.data
        })
        .catch(response => {
          console.log(response)
        })
    },
    dayLink (obj) {
      if (!obj) return
      this.status = 1
      this.code = obj.codeID
      let data = {
        codeID: obj.codeID
      }
      this.$axios
        .post('/api/HamstrerServlet/stock/find', data)
        .then(d => {
          console.log('d', d)
          this.list = d.data[0]['K-Lin']
          let norm = sums([].concat(maxJudgeAdd(this.list), maxJudgeMinus(this.list)))
          console.log('norm', norm, maxJudgeAdd(this.list), maxJudgeMinus(this.list))
          this.boll.SJ = []
          this.boll.JS = []
          this.boll.MB = []
          this.boll.UP = []
          this.boll.DN = []
          // this.boll.KS = []
          // this.boll.Max = []
          // this.boll.Min = []
          let sj = {}
          this.list.forEach(item => {
            if (!sj[item.timeRQ] && item.boll) {
              this.boll.SJ.push(item.timeRQ)
              this.boll.JS.push(item.js)
              // this.boll.KS.push(item.ks)
              // this.boll.Max.push(item.max)
              // this.boll.Min.push(item.min)
              this.boll.MB.push(item.boll.MB)
              this.boll.UP.push(item.boll.MB + (item.boll.MD * norm))
              this.boll.DN.push(item.boll.MB - (item.boll.MD * norm))
              // this.boll.UP.push(item.boll.UP)
              // this.boll.DN.push(item.boll.DN)
              sj[item.timeRQ] = true
            }
          })
          this.boll.SJ.reverse()
          this.boll.JS.reverse()
          this.boll.MB.reverse()
          this.boll.UP.reverse()
          this.boll.DN.reverse()
          this.flag = true
        })
        .catch(response => {
          console.error(response)
          this.status = 0
          this.$message('刷新数据失败!')
        })
    },
    minuteLink (obj, cb) {
      if (!obj) return
      this.status = 2
      this.obj = obj
      this.code = obj.codeID
      let data = {
        stor: { timeRQ: -1, timeSJ: -1 },
        data: {
          code: obj.codeID
        },
        limit: 20
      }
      this.$axios
        .post('/api/HamstrerServlet/stock_minute_k/find', data)
        .then(d => {
          this.list = d.data
          // let norm = sums([].concat(maxJudgeAdd(this.list), maxJudgeMinus(this.list)))
          // let norm = max([].concat(maxJudgeAdd(this.list), maxJudgeMinus(this.list))).max
          // console.log('norm', norm, maxJudgeAdd(this.list), maxJudgeMinus(this.list))
          this.boll.SJ = []
          this.boll.JS = []
          this.boll.MB = []
          this.boll.UP = []
          this.boll.DN = []
          // this.boll.KS = []
          // this.boll.Max = []
          // this.boll.Min = []
          let sj = {}
          this.list.forEach(item => {
            if (!sj[item.timeRQ + item.timeSJ] && item.boll) {
              this.boll.SJ.push(item.timeSJ)
              this.boll.JS.push(item.js)
              // this.boll.KS.push(item.ks)
              // this.boll.Max.push(item.max)
              // this.boll.Min.push(item.min)
              this.boll.MB.push(item.boll.MB)
              // this.boll.UP.push(item.boll.MB + (item.boll.MD * norm))
              // this.boll.DN.push(item.boll.MB - (item.boll.MD * norm))
              this.boll.UP.push(item.boll.UP)
              this.boll.DN.push(item.boll.DN)
              sj[item.timeRQ + item.timeSJ] = true
            }
          })
          this.boll.SJ.reverse()
          this.boll.JS.reverse()
          this.boll.MB.reverse()
          this.boll.UP.reverse()
          this.boll.DN.reverse()
          !cb && (this.flag = true)
          cb && cb()
        })
        .catch(response => {
          console.error(response)
          this.status = 0
          this.$message('刷新数据失败!')
        })
    },
    presentLink (obj, cb) {
      if (!obj) return
      this.status = 3
      this.obj = obj
      this.code = obj.codeID
      let data = {
        stor: { timeRQ: -1, timeSJ: -1 },
        data: {
          daima: obj.codeID
        },
        limit: 120
      }
      this.$axios
        .post('/api/HamstrerServlet/stockAll/find', data)
        .then(d => {
          this.list = []
          this.boll.SJ = []
          this.boll.JS = []
          this.boll.MB = []
          this.boll.UP = []
          this.boll.DN = []
          let arr = []
          d.data.forEach((item, i) => {
            arr.push(item.dangqianjiage)
          })
          d.data.forEach((item, i) => {
            if (i >= 20) {
              this.list.push({
                timeSJ: d.data[i - 20].timeSJ,
                js: d.data[i - 20].dangqianjiage,
                boll: this.bolls(arr, i - 20)
              })
            }
          })
          // let norm = sums([].concat(maxJudgeAdd(this.list), maxJudgeMinus(this.list)))
          // let norm = max([].concat(maxJudgeAdd(this.list), maxJudgeMinus(this.list))).max
          // console.log('norm', norm, maxJudgeAdd(this.list), maxJudgeMinus(this.list))
          let sj = {}
          this.list.forEach(item => {
            if (!sj[item.timeRQ + item.timeSJ] && item.boll) {
              this.boll.SJ.push(item.timeSJ)
              this.boll.JS.push(item.js)
              this.boll.MB.push(item.boll.MB)
              // this.boll.UP.push(item.boll.MB + (item.boll.MD * norm))
              // this.boll.DN.push(item.boll.MB - (item.boll.MD * norm))
              this.boll.UP.push(item.boll.UP)
              this.boll.DN.push(item.boll.DN)
              sj[item.timeRQ + item.timeSJ] = true
            }
          })
          this.boll.SJ.reverse()
          this.boll.JS.reverse()
          this.boll.MB.reverse()
          this.boll.UP.reverse()
          this.boll.DN.reverse()
          !cb && (this.flag = true)
          cb && cb()
        })
        .catch(response => {
          console.error(response)
          this.status = 0
          this.$message('刷新数据失败!')
        })
    },
    MACDLink (obj, cb) {
      if (!obj) return
      console.log('MACD', obj)
      this.status = 4
      this.obj = obj
      this.code = obj.codeID
      let data = {
        stor: { timeRQ: -1, timeSJ: -1 },
        data: {
          daima: obj.codeID
        },
        limit: 300
      }
      this.$axios
        .post('/api/HamstrerServlet/stockAll/find', data)
        .then(d => {
          this.list = []
          this.boll.SJ = []
          this.boll.JS = []
          this.boll.MB = []
          this.boll.UP = []
          this.boll.DN = []
          let arr = []
          d.data.forEach((item, i) => {
            arr.push(item.dangqianjiage)
          })
          d.data.forEach((item, i) => {
            if (i >= 24) {
              this.list.push({
                timeSJ: d.data[i - 24].timeSJ,
                js: d.data[i - 24].dangqianjiage,
                boll: this.MACD(arr, 12, i - 24)
              })
            }
          })
          // let norm = sums([].concat(maxJudgeAdd(this.list), maxJudgeMinus(this.list)))
          // let norm = max([].concat(maxJudgeAdd(this.list), maxJudgeMinus(this.list))).max
          // console.log('norm', norm, maxJudgeAdd(this.list), maxJudgeMinus(this.list))
          let sj = {}
          this.list.forEach(item => {
            if (!sj[item.timeRQ + item.timeSJ] && item.boll) {
              this.boll.SJ.push(item.timeSJ)
              this.boll.JS.push(item.js)
              this.boll.MB.push(item.boll.MB)
              this.boll.UP.push(item.boll.UP)
              this.boll.DN.push(item.boll.DN)
              sj[item.timeRQ + item.timeSJ] = true
            }
          })
          this.boll.SJ.reverse()
          this.boll.JS.reverse()
          this.boll.MB.reverse()
          this.boll.UP.reverse()
          this.boll.DN.reverse()
          !cb && (this.flag = true)
          cb && cb()
        })
        .catch(response => {
          console.error(response)
          this.status = 0
          this.$message('刷新数据失败!')
        })
    },
    echartEv () {
      setTimeout(() => {
        this.echartload()
      })
    },
    echartload () {
      // 基于准备好的dom，初始化echarts实例
      this.status === 2 && this.flag && setTimeout(() => {
        this.minuteLink(this.obj, () => {
          this.echartload()
        })
      }, 1000)
      this.status === 3 && this.flag && setTimeout(() => {
        this.presentLink(this.obj, () => {
          this.echartload()
        })
      }, 1000)
      this.status === 4 && this.flag && setTimeout(() => {
        this.MACDLink(this.obj, () => {
          this.echartload()
        })
      }, 1000)
      // let K = []
      // this.boll.JS.forEach((item, i) => {
      //   K.push([this.boll.KS[i], this.boll.JS[i], this.boll.Min[i], this.boll.Max[i]])
      // })
      let myChart = this.$echarts.init(document.getElementById('echart'))
      // 绘制图表
      myChart.title = '5分钟bull值'
      let colors = ['red', 'bull', 'green', '#ccc']
      let option = {
        color: colors,
        tooltip: {
          trigger: 'none',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['UP', 'DN']
        },
        grid: {
          top: 70,
          bottom: 50
        },
        xAxis: [
          {
            type: 'category',
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: colors[1]
              }
            },
            axisPointer: {
              label: {
                formatter: function (params) {
                  return 'UP值  ' + params.value + (params.seriesData.length ? '：' + params.seriesData[0].data : '')
                }
              }
            },
            data: this.boll.SJ
          },
          {
            type: 'category',
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: colors[1]
              }
            },
            axisPointer: {
              label: {
                formatter: function (params) {
                  return 'DN值  ' + params.value + (params.seriesData.length ? '：' + params.seriesData[0].data : '')
                }
              }
            },
            data: this.boll.SJ
          },
          {
            type: 'category',
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: colors[2]
              }
            },
            axisPointer: {
              label: {
                formatter: function (params) {
                  return 'MB值  ' + params.value + (params.seriesData.length ? '：' + params.seriesData[0].data : '')
                }
              }
            }
          },
          {
            type: 'category',
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: colors[0]
              }
            },
            axisPointer: {
              label: {
                formatter: function (params) {
                  return '当前值  ' + params.value + (params.seriesData.length ? '：' + params.seriesData[0].data : '')
                }
              }
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            min: function (value) {
              return parseInt(value.min * 100) / 100 - 0.01
            }
          }
        ],
        series: [
          {
            name: 'UP',
            type: 'line',
            xAxisIndex: 1,
            smooth: true,
            data: this.boll.UP
          },
          {
            name: 'DN',
            type: 'line',
            smooth: true,
            data: this.boll.DN
          },
          {
            name: 'MB',
            type: 'line',
            smooth: true,
            data: this.boll.MB
          },
          // {
          //   type: 'candlestick',
          //   name: '日K',
          //   data: K,
          //   itemStyle: {
          //     normal: {
          //       color: '#ef232a',
          //       color0: '#14b143',
          //       borderColor: '#ef232a',
          //       borderColor0: '#14b143'
          //     },
          //     emphasis: {
          //       color: 'black',
          //       color0: '#444',
          //       borderColor: 'black',
          //       borderColor0: '#444'
          //     }
          //   }
          // }
          {
            name: 'JS',
            type: 'line',
            smooth: true,
            data: this.boll.JS
          }
        ]
      }
      myChart.setOption(option)
    },
    // 计算布林值
    bolls (Arr, index = 0) {
      let klink = Arr
      let [MA, MD, MB, UP, DN, mean, sum, arr, i1, k1, k2, arr1] = [0, 0, 0, 0, 0, 0, 0, [], 0, 0, 0, []]
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
        if (k - index > 10) {
          arr1.push(sums(arr.slice(k - 10 - index, k - index)))
        }
      }
      MD = Math.sqrt(sum / k1)
      MB = sums(arr1)
      console.log(mean, k2)
      let sumK = (max(arr).max / sums(arr) + (sums(arr) + (sums(arr) - min(arr).min)) / sums(arr)) / 2
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
    },
    MACD (data, dayCount = 30, index) {
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
        MB: [],
        UP: M1,
        DN: M2
      }
    }
  }
}
</script>
