var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/shares');
mongoose.Promise = global.Promise;
/*调试模式是mongoose提供的一个非常实用的功能，用于查看mongoose模块对mongodb操作的日志，一般开发时会打开此功能，以便更好的了解和优化对mongodb的操作。*/
mongoose.set('debug', true);
mongoose.connection.on("error", function (error) {  
  console.log("数据库连接失败：" + error); 
}); 
mongoose.connection.on("open", function () { 
  console.log("数据库连接成功"); 
});
module.exports = mongoose;
