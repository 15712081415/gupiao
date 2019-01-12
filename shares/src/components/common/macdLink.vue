<template>
    <div>
        <el-dialog :title="'' + curr.codeID + ' --日 MACD'" :visible.sync="show">
            <div id="echart" style="width: 674px;height:300px"></div>
        </el-dialog>
    </div>
</template>

<script>
export default {
//   name: 'kdjLink',
  data () {
    return {
        list: [],
        data: {}
    }
  },
  props: ['value', 'curr'],
  created() {
  },
  mounted() {
      this.$nextTick(function () {
          this.dataLink()
      })
  },
  computed: {
      show:{
          get () {
              return this.value
          },
          set (val) {
              this.$emit('input', val)
          }
      }
  },
  methods: {
      dataLink () {
        this.list = this.curr['K-Lin']
        console.log('dataLink', this.list)
        let norm = this.$sums([].concat(this.$maxJudgeAdd(this.list), this.$maxJudgeMinus(this.list)))
        console.log('norm', norm, this.$maxJudgeAdd(this.list), this.$maxJudgeMinus(this.list))
        this.data.EMA_DEA = []
        this.data.EMA_DIF = []
        this.data.EMA_BAR = []
        this.data.timeRQ = []
        let sj = {}
        this.list.forEach(item => {
            if (!sj[item.timeRQ] && item.MACD) {
            this.data.EMA_DEA.push(item.MACD.EMA_DEA)
            this.data.EMA_DIF.push(item.MACD.EMA_DIF)
            this.data.EMA_BAR.push(item.MACD.EMA_BAR)
            this.data.timeRQ.push(item.timeRQ)
            sj[item.timeRQ] = true
            }
        })
        this.data.EMA_DEA.reverse()
        this.data.EMA_DIF.reverse()
        this.data.EMA_BAR.reverse()
        this.data.timeRQ.reverse()
        this.echartload()
        },
        echartload () {
            let myChart = this.$echarts.init(document.getElementById('echart'))
            // 绘制图表
            myChart.title = '日 -- MACD'
            let colors = ['red', 'green', '#69d690']
            let option = {
                color: colors,
                tooltip: {
                trigger: 'none',
                axisPointer: {
                    type: 'cross'
                }
                },
                legend: {
                data: ['EMA_DEA', 'EMA_DIF', 'EMA_BAR']
                },
                grid: {
                top: 70,
                bottom: 50
                },
                xAxis: [
                    {
                        data: this.data.timeRQ
                    },
                    {
                        type: 'category',
                        show: false,
                        axisPointer: {
                            label: {
                                formatter: function (params) {
                                return 'EMA_BAR  ' + params.value
                                }
                            }
                        },
                        data: this.data.EMA_BAR
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
                    name: 'EMA_DEA',
                    type: 'line',
                    xAxisIndex: 1,
                    smooth: true,
                    data: this.data.EMA_DEA
                },
                {
                    name: 'EMA_DIF',
                    type: 'line',
                    smooth: true,
                    data: this.data.EMA_DIF
                },
                {
                    name: 'MACD',
                    type: 'bar',
                    label: {
                    normal: {
                        show: false,
                        position: 'inside'
                    }
                    },
                    data: this.data.EMA_BAR
                },
                // {
                //     name: 'EMA_BAR',
                //     type: 'line',
                //     smooth: true,
                //     data: this.data.EMA_BAR
                // }
                ]
            }
            myChart.setOption(option)
        }
  }
}
</script>
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
