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
              width="100">
            </el-table-column>
            <el-table-column
              prop="name"
              label="名称"
              width="100">
            </el-table-column>
            <el-table-column
              prop="max"
              label="上次最高"
              width="100">
            </el-table-column>
            <el-table-column
              prop="min"
              width="100"
              label="上次最低">
            </el-table-column>
            <el-table-column
              width="100"
              prop="mean"
              label="上次平均价">
            </el-table-column>
            <el-table-column
              prop="timeRQ"
              width="100"
              label="日期">
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态">
              <template slot-scope="scope">
                <el-button type="primary" class="f-info" @click="dayLink(scope.row)">日线</el-button>
                <el-button type="primary" class="f-info" @click="minuteLink(scope.row)">5分钟线</el-button>
                <el-button type="primary" class="f-info" @click="MACD(scope.row)">MACD</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
  </div>
  <el-dialog :title="'' + code + ' -- k线图'" width="712px" :visible.sync="flag" @open="echartEv">
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
      maxData.push(
        (arrs[index].js - arrs[index].boll.MB) / arrs[index].boll.MD
      )
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
      list: [],
      data: [],
      index: 0,
      boll: {},
      macd: {},
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
          let norm = sums(
            [].concat(maxJudgeAdd(this.list), maxJudgeMinus(this.list))
          )
          console.log(
            'norm',
            norm,
            maxJudgeAdd(this.list),
            maxJudgeMinus(this.list)
          )
          this.boll.SJ = []
          this.boll.JS = []
          this.boll.MB = []
          this.boll.UP = []
          this.boll.DN = []
          this.boll.KS = []
          this.boll.Max = []
          this.boll.Min = []
          let sj = {}
          this.list.forEach(item => {
            if (!sj[item.timeRQ] && item.boll) {
              this.boll.SJ.push(item.timeRQ)
              this.boll.JS.push(item.js)
              this.boll.KS.push(item.ks)
              this.boll.Max.push(item.max)
              this.boll.Min.push(item.min)
              this.boll.MB.push(item.boll.MB)
              this.boll.UP.push(item.boll.MB + item.boll.MD * norm)
              this.boll.DN.push(item.boll.MB - item.boll.MD * norm)
              sj[item.timeRQ] = true
            }
          })
          this.boll.SJ.reverse()
          this.boll.JS.reverse()
          this.boll.MB.reverse()
          this.boll.UP.reverse()
          this.boll.DN.reverse()
          this.boll.KS.reverse()
          this.boll.Max.reverse()
          this.boll.Min.reverse()
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
        limit: 100
      }
      this.$axios
        .post('/api/HamstrerServlet/stock_minute_k/find', data)
        .then(d => {
          this.list = d.data
          this.boll.SJ = []
          this.boll.JS = []
          this.boll.MB = []
          this.boll.UP = []
          this.boll.DN = []
          this.boll.KS = []
          this.boll.Max = []
          this.boll.Min = []
          let sj = {}
          this.list.forEach(item => {
            if (!sj[item.timeRQ + item.timeSJ] && item.boll) {
              this.boll.SJ.push(item.timeSJ)
              this.boll.JS.push(item.js)
              this.boll.KS.push(item.ks)
              this.boll.Max.push(item.max)
              this.boll.Min.push(item.min)
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
          this.boll.KS.reverse()
          this.boll.Max.reverse()
          this.boll.Min.reverse()
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
        if (this.status === 1 || this.status === 2) {
          this.echartload()
        } else if (this.status === 3) {
          this.echartMACD()
        }
      })
    },
    MACD (obj) {
      if (!obj) return
      this.status = 3
      this.obj = obj
      this.code = obj.codeID
      let data = {
        codeID: obj.codeID
      }
      this.$axios
        .post('/api/HamstrerServlet/stock/find', data)
        .then(d => {
          console.log('d', d)
          this.list = d.data[0]['K-Lin']
          this.macd = this.list.map(item => item.MACD)
          this.flag = true
        })
    },
    echartMACD () {
      let myChart = this.$echarts.init(document.getElementById('echart'))
      // 绘制图表
      myChart.title = '5分钟bull值'
      let option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          data: ['MACD', 'DIF', 'DEA']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            axisTick: {show: false},
            data: this.list.map(item => item.timeRQ).reverse()
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: 'MACD',
            type: 'bar',
            label: {
              normal: {
                show: false,
                position: 'inside'
              }
            },
            data: this.macd.map(item => item.EMA_BAR).reverse()
          },
          {
            data: this.macd.map(item => item.EMA_DIF).reverse(),
            label: {
              normal: {
                show: false,
                position: 'inside'
              }
            },
            type: 'line'
          },
          {
            data: this.macd.map(item => item.EMA_DEA).reverse(),
            label: {
              normal: {
                show: false,
                position: 'inside'
              }
            },
            type: 'line'
          }
        ]
      }
      myChart.setOption(option)
    },
    echartload () {
      // 基于准备好的dom，初始化echarts实例
      // this.status === 2 &&
      //   this.flag &&
      //   setTimeout(() => {
      //     this.minuteLink(this.obj, () => {
      //       this.echartload()
      //     })
      //   }, 1000)
      let K = []
      this.boll.JS.forEach((item, i) => {
        K.push([
          this.boll.KS[i],
          this.boll.JS[i],
          this.boll.Min[i],
          this.boll.Max[i]
        ])
      })
      let myChart = this.$echarts.init(document.getElementById('echart'))
      // 绘制图表
      myChart.title = '5分钟bull值'

      let data = {
        categoryData: this.boll.SJ,
        values: K,
        volumns: []
      }
      myChart.setOption({
        backgroundColor: '#eee',
        animation: false,
        legend: {
          bottom: 10,
          left: 'center',
          data: ['Dow-Jones index', 'UP', 'MB', 'DN']
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          backgroundColor: 'rgba(245, 245, 245, 0.8)',
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          textStyle: {
            color: '#000'
          },
          position: function (pos, params, el, elRect, size) {
            let obj = { top: 10 }
            obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30
            return obj
          },
          extraCssText: 'width: 170px'
        },
        axisPointer: {
          link: { xAxisIndex: 'all' },
          label: {
            backgroundColor: '#777'
          }
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: false
            },
            brush: {
              type: ['lineX', 'clear']
            }
          }
        },
        brush: {
          xAxisIndex: 'all',
          brushLink: 'all',
          outOfBrush: {
            colorAlpha: 0.1
          }
        },
        grid: [
          {
            left: '10%',
            right: '8%',
            height: '50%'
          },
          {
            left: '10%',
            right: '8%',
            bottom: '20%',
            height: '15%'
          }
        ],
        xAxis: [
          {
            type: 'category',
            data: data.categoryData,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
              z: 100
            }
          },
          {
            type: 'category',
            gridIndex: 1,
            data: data.categoryData,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
              label: {
                formatter: function (params) {
                  let seriesValue = (params.seriesData[0] || {}).value
                  return (params.value + (seriesValue != null ? '\n' + this.$echarts.format.addCommas(seriesValue) : ''))
                }
              }
            }
          }
        ],
        yAxis: [
          {
            scale: true,
            splitArea: {
              show: true
            }
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false }
          }
        ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            start: 0,
            end: 100
          },
          {
            show: false,
            xAxisIndex: [0, 1],
            type: 'slider',
            top: '85%',
            start: 0,
            end: 100
          }
        ],
        series: [
          {
            name: 'Dow-Jones index',
            type: 'candlestick',
            data: data.values,
            itemStyle: {
              normal: {
                color: '#06B800',
                color0: '#FA0000',
                borderColor: null,
                borderColor0: null,
                opacity: 0.5
              }
            },
            tooltip: {
              formatter: function (param) {
                param = param[0]
                return [
                  'Date: ' + param.name + '<hr size=1 style="margin: 3px 0">',
                  'Open: ' + param.data[0] + '<br/>',
                  'Close: ' + param.data[1] + '<br/>',
                  'Lowest: ' + param.data[2] + '<br/>',
                  'Highest: ' + param.data[3] + '<br/>'
                ].join('')
              }
            }
          },
          {
            name: 'UP',
            type: 'line',
            data: this.boll.UP,
            smooth: true,
            lineStyle: {
              normal: { opacity: 0.5 }
            }
          },
          {
            name: 'MB',
            type: 'line',
            data: this.boll.MB,
            smooth: true,
            lineStyle: {
              normal: { opacity: 0.5 }
            }
          },
          {
            name: 'DN',
            type: 'line',
            data: this.boll.DN,
            smooth: true,
            lineStyle: {
              normal: { opacity: 0.5 }
            }
          },
          {
            name: 'Volumn',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: data.volumns
          }
        ]
      }, true)
    }
  }
}
</script>
