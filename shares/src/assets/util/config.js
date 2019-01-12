// 最小值
export function min (obj) {
    let min = Number(obj[0]);
    let len = obj.length;
    let nub = 0;
    for (let i = 1; i < len; i++) {
        if (obj[i] !== 0 && obj[i] < min) {
            min = Number(obj[i])
            nub = i
        }
    }
    return { min: min, nub: nub }
};
// 最大值
export function max (obj) {
    let max = Number(obj[0]);
    let len = obj.length;
    let nub = 0;
    for (let i = 1; i < len; i++) {
        if (obj[i] > max) {
            max = Number(obj[i])
            nub = i
        }
    }
    return { max: max, nub: nub }
};

// 平均数
export function sums (obj, name) {
    let sum = 0;
    let len = obj.length;
    let i = 0;
    let _this = obj;
    if (typeof _this[i] === 'object') {
        for (i = 0; i < len; i++) {
            sum = sum + Number(_this[i][name])
        }
    } else {
        for (i = 0; i < len; i++) {
            sum = sum + Number(_this[i])
        }
    }
    return sum / _this.length
};

// 计算高点
export function maxJudgeAdd (arrData) {
    let [i, maxData, arr, arrs, index] = [0, [], [], []]
    for (i = 0; i < arrData.length && arrData[i].boll; i++) {
        if (arrData[i].js > arrData[i].boll.MB) {
            arr.push(arrData[i].js)
            arrs.push(arrData[i])
        } else if (arr.length > 1) {
            index = max(arr).nub
            maxData.push((arrs[index].js - arrs[index].boll.MB) / arrs[index].boll.MD)
            arr = []
            arrs = []
        }
    }
    if (arr.length > 1) {
        index = max(arr).nub
        maxData.push((arrs[index].js - arrs[index].boll.MB) / arrs[index].boll.MD)
        arr = []
        arrs = []
    }
    return maxData
}

// 计算低点
export function maxJudgeMinus (arrData) {
    let [i, minData, arr, arrs, nub] = [0, [], [], []]
    for (i = 0; i < arrData.length && arrData[i].boll; i++) {
        if (arrData[i].js < arrData[i].boll.MB) {
            arr.push(arrData[i].js)
            arrs.push(arrData[i])
        } else if (arr.length > 1) {
            nub = min(arr).nub
            minData.push((arrs[nub].boll.MB - arrs[nub].js) / arrs[nub].boll.MD)
            arr = []
            arrs = []
        }
    }
    if (arr.length > 1) {
        nub = min(arr).nub
        minData.push((arrs[nub].boll.MB - arrs[nub].js) / arrs[nub].boll.MD)
        arr = []
        arrs = []
    }
    return minData
}