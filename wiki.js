"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _axios = _interopRequireDefault(require("axios"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _fs = _interopRequireDefault(require("fs"));

var _lodash = require("lodash");

var wikipedia = 'https://ig.wikipedia.org';
var wikipediaDirectoryPath = '/w/index.php?title=Ih%C3%BC_k%C3%A1r%C3%ADr%C3%AD:Ih%C3%BCN%C3%ADl%C3%A9&from=Abuja+Declaration+%282001%29';
var dir = './wikipedia';

if (!_fs["default"].existsSync(dir)) {
  _fs["default"].mkdirSync(dir);
}

var nextNavigationLinks = [];
var skipMatches = [/\[\d{1,}\]/g, /\s\.{1,}/g];
var latinCharacters = /\p{Latin}/;
var finalSentenceCount = 0;

var scrapePageContent = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(pageLinks) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return Promise.all((0, _lodash.map)(pageLinks, /*#__PURE__*/function () {
              var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(pageLink) {
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return _axios["default"].get("".concat(wikipedia).concat(pageLink)).then(function (_ref3) {
                          var data = _ref3.data;

                          var $ = _cheerio["default"].load(data);

                          var sentences = (0, _lodash.compact)((0, _lodash.flatten)((0, _lodash.map)($('#mw-content-text p'), function (paragraph) {
                            var paragraphContent = $(paragraph).text();

                            if (paragraphContent !== null && paragraphContent !== void 0 && paragraphContent.split) {
                              return (0, _lodash.map)(paragraphContent.split('. '), function (sentence) {
                                var cleanedSentence = skipMatches.reduce(function (finalSentence, skipMatch) {
                                  return finalSentence.replaceAll(skipMatch, '');
                                }, sentence);
                                return cleanedSentence.match(latinCharacters) ? (0, _lodash.trim)(cleanedSentence) : null;
                              });
                            }

                            return [];
                          })));
                          finalSentenceCount += sentences.length;
                          var docName = pageLink.split('/wiki/')[1].replace('/', '_');
                          var filePath = "".concat(dir, "/").concat(docName, ".json");

                          if (!_fs["default"].existsSync(filePath)) {
                            _fs["default"].writeFileSync(filePath, JSON.stringify(sentences, null, 2));

                            console.log("Successfully wrote ".concat(docName));
                          }
                        });

                      case 2:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x2) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function scrapePageContent(_x) {
    return _ref.apply(this, arguments);
  };
}();

var saveNextPageNavigationURL = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3($) {
    var nextNavigationLink, pageLinks;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            nextNavigationLink = $((0, _lodash.last)($('.mw-allpages-nav a'))).attr('href');

            if (nextNavigationLinks.includes(nextNavigationLink)) {
              _context3.next = 8;
              break;
            }

            nextNavigationLinks.push(nextNavigationLink);
            pageLinks = (0, _lodash.map)($('.mw-allpages-chunk li a'), function (link) {
              return $(link).attr('href');
            });
            _context3.next = 6;
            return scrapePageContent(pageLinks);

          case 6:
            _context3.next = 8;
            return nextPageNavigation({
              startLink: "".concat(wikipedia).concat(nextNavigationLink)
            });

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function saveNextPageNavigationURL(_x3) {
    return _ref4.apply(this, arguments);
  };
}();

var sleep = function sleep(timeout) {
  console.log("Sleeping for ".concat(timeout, "ms"));
  return new Promise(function (resolve) {
    return setTimeout(resolve, timeout);
  });
};

var nextPageNavigation = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(_ref5) {
    var startLink, url;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            startLink = _ref5.startLink;
            url = startLink ? startLink : "".concat(wikipedia).concat(wikipediaDirectoryPath); // Sleep for 10 seconds to avoid rate limiting

            _context5.next = 4;
            return sleep(5000);

          case 4:
            _context5.next = 6;
            return _axios["default"].get(url).then( /*#__PURE__*/function () {
              var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(_ref7) {
                var data, $;
                return _regenerator["default"].wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        data = _ref7.data;
                        $ = _cheerio["default"].load(data); // Save the next navigation link in the array

                        _context4.next = 4;
                        return saveNextPageNavigationURL($);

                      case 4:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4);
              }));

              return function (_x5) {
                return _ref8.apply(this, arguments);
              };
            }());

          case 6:
            console.log('final sentence count', finalSentenceCount);

          case 7:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function nextPageNavigation(_x4) {
    return _ref6.apply(this, arguments);
  };
}();

nextPageNavigation({});
