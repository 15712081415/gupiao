var nodemailer = require('nodemailer');
var mailer = {};
mailer.send = function (toEmail,title,text,callback){
var transporter = nodemailer.createTransport({
  service: 'qq',
  auth: {
    user: '826164058@qq.com',
    pass: 'cxwdeusunmwqbdge'
  }
  });
  var mailOptions = {
    from: '826164058@qq.com', // 发送者
    to: toEmail || '851726398@qq.com', // 接受者,可以同时发送多个,以逗号隔开
    subject: title, // 标题
    //text: text, // 文本
    html: '<h2>' + text + '</h2>' // html代码
  };
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      callback(err,null)
      return;
    }
    callback(null,info);
  });
}
module.exports = mailer;