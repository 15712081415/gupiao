MyList[stockName] = MyList[stockName] || mongoose.model(stockName, new Schema({
    'codeID': String,
    'K-Lin': Object,
    'timeRQ': String
}), stockName);
if (data.stor) {
    let query = MyList[stockName].find(data.data)
    data.stor && query.sort(data.stor)
    data.limit && query.limit(data.limit)
    query.exec(function (err, docs) {
        if(err) {
            console.log(err);
            return res.send(err);
        }
        return res.send(JSON.stringify(docs));
    })
} else {
    MyList[stockName].find(data, function(err, docs) {
        if(err) {
            console.log(err);
            return res.send(err);
        }
        return res.send(JSON.stringify(docs));
    });
}