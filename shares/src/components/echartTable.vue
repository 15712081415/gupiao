<template>
  <div>
  <div style='max-width: 500px;margin: 10px auto'>
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="股票代码">
        <el-input v-model="codeID"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="init()" @keyup.enter="init()">查看数据</el-button>
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
                <!-- <el-button type="primary" class="f-info" @click="kdjLink(scope.row)">日线</el-button>
                <el-button type="primary" class="f-info" @click="minuteLink(scope.row)">5分钟线</el-button>
                <el-button type="primary" class="f-info" @click="presentLink(scope.row)">实时</el-button>-->
                <el-button type="primary" class="f-info" @click="MACDLink(scope.row)">MACD</el-button>
                <el-button type="primary" class="f-info" @click="KDJLink(scope.row)">KDJ</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
  </div>
  <!-- <el-dialog :title="'' + code + ' -- k线图'" :visible.sync="flag" @open="echartEv">
    <div id="echart" style="width: 674px;height:300px"></div>
  </el-dialog> -->
  <kdj-link v-model="flag.kdjLink" :curr="curr" v-if="flag.kdjLink"></kdj-link>
  <macd-link v-model="flag.macdLink" :curr="curr" v-if="flag.macdLink"></macd-link>
  </div>
</template>
<script>
import kdjLink from './common/kdjLink'
import macdLink from './common/macdLink'
export default {
  name: 'add',
  data () {
    return {
      codeID: '',
      form: {},
      data: [],
      boll: {},
      curr: null,
      flag: {
          kdjLink: false,
          macdLink: false
      }
    }
  },
  components: {
      kdjLink,
      macdLink
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
    KDJLink(row) {
        this.curr = row
        this.flag.kdjLink = true
    },
    MACDLink(row) {
        this.curr = row
        this.flag.macdLink = true
    }
  }
}
</script>
