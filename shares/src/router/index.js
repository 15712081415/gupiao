import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import add from '@/components/add'
import kLink from '@/components/k_link'
import kLink1 from '@/components/k_link.1'
Vue.use(Router)
export default new Router({
  routes: [
    {
      path: '/',
      name: 'add',
      component: add
    },
    {
      path: '/hello',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/add',
      name: 'add',
      component: add
    },
    {
      path: '/k_link',
      name: 'k_link',
      component: kLink
    },
    {
      path: '/k_link.1',
      name: 'k_link.1',
      component: kLink1
    }
  ]
})
