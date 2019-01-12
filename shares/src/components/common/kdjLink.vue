<template>
    <div>
        <el-dialog :title="'' + curr.codeID + ' -- KDJ'" :visible.sync="show">
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
        this.data.K = []
        this.data.D = []
        this.data.J = []
        this.data.timeRQ = []
        let sj = {}
        this.list.forEach(item => {
            if (!sj[item.timeRQ] && item.KDJ) {
            this.data.K.push(item.KDJ.K)
            this.data.D.push(item.KDJ.D)
            this.data.J.push(item.KDJ.J)
            this.data.timeRQ.push(item.timeRQ)
            sj[item.timeRQ] = true
            }
        })
        this.data.K.reverse()
        this.data.D.reverse()
        this.data.J.reverse()
        this.data.timeRQ.reverse()
        this.echartload()
        },
        echartload () {
            let myChart = this.$echarts.init(document.getElementById('echart'))
            // 绘制图表
            myChart.title = '日 -- KDJ'
            let colors = ['red', 'green', '#ccc']
            let option = {
                color: colors,
                tooltip: {
                trigger: 'none',
                axisPointer: {
                    type: 'cross'
                }
                },
                legend: {
                data: ['K', 'D', 'J']
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
                                return 'J  ' + params.value
                                }
                            }
                        },
                        data: this.data.J
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
                    name: 'K',
                    type: 'line',
                    xAxisIndex: 1,
                    smooth: true,
                    data: this.data.K
                },
                {
                    name: 'D',
                    type: 'line',
                    smooth: true,
                    data: this.data.D
                },
                {
                    name: 'J',
                    type: 'line',
                    smooth: true,
                    data: this.data.J
                }
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
