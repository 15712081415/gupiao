let fs = require('fs');
let path = require('path');
let url = path.resolve('./data');
module.exports = function (data) {
    fs.writeFileSync(url + '/data.json', JSON.stringify(data.filter(item => !item.codeID.includes('hk'))))
}