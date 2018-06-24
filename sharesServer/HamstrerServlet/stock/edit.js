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
// console.log('EEE:', data.setter)
var conditions =data.where, update = {'$set':data.setter}, options ={ multi:true};
MyList[stockName].collection.update(conditions,update, options, function(err, docs){
    if(err) {
    	console.log(err)
		return res.send(err);
	}
	return res.send(docs);
})
