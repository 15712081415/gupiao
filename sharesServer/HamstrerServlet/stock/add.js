
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
	}), stockName)
	var newList = new MyList[stockName](data);
	console.log('addData', data)
	newList.save(function(err) {
		if(err) {
			console.log(err);
			return res.send(err);
		}
		console.log('ok');
		return res.send('ok');
	});