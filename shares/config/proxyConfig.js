/**
 * Created by Administrator on 2017/5/14.
 */
module.exports = {
  proxyList: {
    '/api/':{
      target: 'http://10.10.10.10：8080',
      pathRewrite: {
        '^/consumerRecord/getAll': '/consumerRecord/getAll'
      }
    }
  }
}
