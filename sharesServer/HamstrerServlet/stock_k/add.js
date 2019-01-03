MyList[stockName] = MyList[stockName] || mongoose.model(stockName, new Schema({
    'codeID': String,
    'K-Lin': Object,
    'timeRQ': String
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
