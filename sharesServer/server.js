let _ = require('underscore');
let vm = require('vm');
let fs = require('fs');
let async = require('async');  
let dbutil = require('./dbutil');
let querystring = require('querystring');
let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('./set-server.js');
let axios = require('axios');
let email = require('./getemail');
let iconv = require('iconv-lite');
let Schema = mongoose.Schema;
let app = express();
let MyList={};
String.prototype.replaceAll = function(s1, s2) {  
    let demo = this;
    while (demo.indexOf(s1) != - 1)  
    demo = demo.replace(s1, s2);  
    return demo;  
}
function isEmptyObject(e) {  
    let t;  
    for (t in e)  
        return !1;  
    return !0  
}
app.get('/HamstrerServlet/*', function(req, res){
    let data = req.query;
    let stockName = req.url.replaceAll("/HamstrerServlet/", "").split("/")[0];
    let sandbox = {  
        req: req,  
        res: res,
        async: async,
        data: data,
        stockName: stockName,
        mongoose: mongoose,
        Schema: Schema,
        MyList: MyList,
        axios: axios,
        email: email,
        console: console,
        iconv: iconv,
        setTimeout: setTimeout
    };
    let url = req.url.split('?')[0];
    fs.readFile('.' + url + '.js', function(err, fileData) {
        vm.runInNewContext(fileData, sandbox, 'myfile.vm');
    });
});
let jsonParser = bodyParser.json()
app.post('/HamstrerServlet/*', jsonParser, function(req, res){
    let body = '', jsonStr = '';
    if (req.body) {
        //能正确解析 json 格式的post参数
        jsonStr = req.body;
    } else {
        //不能正确解析json 格式的post参数
        req.on('data', function (chunk) {
            body += chunk; //读取参数流转化为字符串
        });
        req.on('end', function () {
            //读取参数流结束后将转化的body字符串解析成 JSON 格式
            try {
                jsonStr = JSON.parse(body);
            } catch (err) {
                jsonStr = '';
            }
        });
    }
    let stockName = req.url.replaceAll("/HamstrerServlet/", "").split("/")[0];
    let sandbox = {  
        req: req,  
        res: res,
        async: async,
        data: jsonStr,
        stockName: stockName,
        mongoose: mongoose,
        Schema: Schema,
        MyList: MyList,
        axios: axios,
        email: email,
        console: console,
        iconv: iconv,
        setTimeout: setTimeout
    };
    fs.readFile('.' + req.url + '.js', function(err, fileData) {
        vm.runInNewContext(fileData, sandbox, 'myfile.vm');
    });
});  
app.listen(9999); 
console.log('http://127.0.0.1:9999');