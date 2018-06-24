console.log('find', stockName, data);
MyList[stockName] = MyList[stockName] || mongoose.model(stockName, new Schema({
	"codeID": String,
	"status": Number,
	"minData": [],
	"maxData": [],
	"name": String,
	"max": Number,
	"min": Number,
	"mean": Number,
	"timeRQ": String,
	"mean10": Number,
	"min10": Number,
	"max10": Number,
	"K-Lin": []
}), stockName);
console.log('find', stockName, data);
//var newList = new Mylist(data.data);
MyList[stockName].find(data, function(err, docs) {
	if(err) {
		console.log(err);
		return res.send(err);
	}
	return res.send(JSON.stringify(docs));
});