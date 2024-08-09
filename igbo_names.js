"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _axios = _interopRequireDefault(require("axios"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _fs = _interopRequireDefault(require("fs"));

var igboNames = 'https://www.myigboname.com';
var namesCategory = '/start-with';
var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'R', 'S', 'T', 'U', 'W', 'Z'].map(function (letter) {
  return letter.toLowerCase();
});
var dir = './igbo_names';

if (!_fs["default"].existsSync(dir)) {
  _fs["default"].mkdirSync(dir);
}

letters.forEach(function (letter) {
  var url = "".concat(igboNames).concat(namesCategory, "/").concat(letter);
  console.log(url);
});
