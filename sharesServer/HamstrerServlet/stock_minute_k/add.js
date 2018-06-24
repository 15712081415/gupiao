MyList[stockName] = MyList[stockName] || mongoose.model(stockName, new Schema({
    'code': String,
    'max': Number,
    'min': Number,
    'mean': Number,
    'boll': Object,
    'ks': Number,
    'js': Number,
    'status': Number,
    'timeRQ': String,
    "timeSJ" : String
    }), stockName)
var newList = new MyList[stockName](data);
newList.save(function(err) {
    if(err) {
        console.log(err);
        return res.send(err);
    }
    console.log('ok');
    return res.send('ok');
});
