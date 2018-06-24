/**
 * Created by Administrator on 2017/5/14.
 */
function swat () {
  var https = require('https')
  var schedule = require('node-schedule')
  schedule.scheduleJob('30 * * * * *', function () {
    console.log('执行任务')
    setTime()
  })
  function setTime () {
    https.get('/api/HamstrerServlet/stock/find', function (res) {
      res.on('data', function (d) {
        for (var i = 0; i < d.length; i++) {
          var item = d[i]
          https.get('http://qt.gtimg.cn/q=s_sz' + item.codeId, function (res) {
	        res.on('data', function (d) {
	          var data = d.split('~')
	          var str = 'name=' + data[1] + '&' + 'daima=' + data[2] + '&' + 'dangqianjiage=' + data[3] + '&' + 'zhangdie=' + data[4] + '&' + 'zhangdie_=' + data[5] + '&' + 'chengjiao=' + data[6] + '&' + 'chengjiao_=' + data[7] + '&' + 'zongshizhi=' + data[9]
	          https.get('/api/HamstrerServlet/stockAll/add?' + str)
	        })
	      }).on('error', function (e) {
	        console.error(e)
	      })
        }
      })
    }).on('error', function (e) {
      console.error(e)
    })
  }
}
export default swat
