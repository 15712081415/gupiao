// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Axios from 'axios'
import Element from 'element-ui'
import echarts from 'echarts'
import 'element-ui\\lib\\theme-chalk\\index.css'
import {
  min,
  max,
  sums,
  maxJudgeAdd,
  maxJudgeMinus
} from '@/assets/util/config'
Vue.use(Element)
Vue.prototype.$axios = Axios
Vue.prototype.$echarts = echarts
Vue.prototype.$maxJudgeAdd = maxJudgeAdd
Vue.prototype.$maxJudgeMinus = maxJudgeMinus
Vue.prototype.$min = min
Vue.prototype.$max = max
Vue.prototype.$sums = sums

Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
