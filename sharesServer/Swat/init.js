/**
 * Created by Administrator on 2017/5/14.
 */
module.exports = {
  init: function () {
    //最小值
    Array.prototype.min = function () {
      let _this = this;
      let min = Number(_this[0]);
      let len = _this.length;
      let nub = 0;
      for (let i = 1; i < len; i++) {
          if (_this[i] != 0 && _this[i] < min) {
              min = Number(_this[i]);
              nub = i;
          }
      }
      return { min: min, nub: nub };
    }
    //最大值
    Array.prototype.max = function () {
      let _this = this;
      let max = Number(_this[0]);
      let len = this.length;
      let nub = 0;
      for (let i = 1; i < len; i++) {
          if (this[i] > max) {
              max = Number(_this[i]);
              nub = i;
          }
      }
      return { max: max, nub: nub };
    }
    // 平均数
    Array.prototype.sum = function (name) {
      let sum = 0;
      let len = this.length;
      let i = 0;
      let _this = this
      if (typeof _this[i] == 'object') {
          for (i = 0; i < len; i++) {
              sum = sum + Number(_this[i][name]);
          }
      } else {
          for (i = 0; i < len; i++) {
              sum = sum + Number(_this[i]);
          }
      }
      return sum / _this.length;
    }
  },
  // 格式化日期
  setTime: function () {
    let myDate = new Date();
    let y = myDate.getFullYear();
    let m = myDate.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    let d = myDate.getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d;
  }
}