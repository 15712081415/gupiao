MyList[stockName] = MyList[stockName] || mongoose.model(stockName, new Schema({
        "name" : String,
        "daima" : String,
        "dangqianjiage" : Number,
        "timeRQ" : String,
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
