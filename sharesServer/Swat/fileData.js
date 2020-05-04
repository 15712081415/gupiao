let axios = require('axios');
let fs = require('fs');
let path = require('path');
let url = path.resolve('../data');
let fileArr = null;
let src = 'http://192.168.3.101:9999';
let content = {};
let curr = 0;
axios.post(src + '/HamstrerServlet/stock/find', {}).then(function (d) {
    if (d.data) {
        fileArr = d.data.filter(item => {
            return (item.codeID[2] == 6 || item.codeID[2] == 3 || item.codeID[2] == 0) && item.codeID[0] == 's';
        })
    }
    init();
})
function api(codeID) {
    let data = {
        stor: { timeRQ: -1 },
        data: {
            codeID: codeID
        }
    }
    return axios.post(src + '/HamstrerServlet/stock_k/find', data)
}

async function init() {
    for (let i = 0; i < fileArr.length; i++) {
        console.log('api ->', i, fileArr.length)
        let data = {}
        let item = fileArr[i]
        let res = await api(item.codeID);
        let t = {};
        data['K-Lin'] = res.data.filter(item => {
            if (!t[item.timeRQ]) {
                t[item.timeRQ] = true;
                return true
            }
            return false
        }).map(item => {
            return item['K-Lin']
        });
        fs.writeFileSync(url + '/' + item.codeID + '.json', JSON.stringify(data))
    }
}