var parsers = require('Parsimmon');
var syntax = require('./syntax.js');
parsers.sepBy = function(parser, separator) {
  var pairs = separator.then(parser).many();
  return parser.chain(function(r) {
    return pairs.map(function(rs) {
       return [r].concat(rs);
     })
  })
};
var pipe = parsers.pipe = parsers.string('|');
var lparen = parsers.lparen = parsers.string('(');
var rparen = parsers.rparen = parsers.string(')');
var star = parsers.star = parsers.string('*');
var plus = parsers.plus = parsers.string('+');
var qmark = parsers.qmark = parsers.string('?');
var dot = parsers.dot = parsers.string('.');
var parenthesized = parsers.parenthesized = function(parser) {
  return lparen.then(parser).skip(rparen);
};
var suffixOperator = parsers.suffixOperator = function(operator) {
  return function(fn) {
    return function(parser) {
      return parser.skip(operator).map(fn);
    }
  }
};
parsers.plussed = suffixOperator(plus);
parsers.starred = suffixOperator(star);
parsers.qmarked = suffixOperator(qmark);
module.exports = parsers;
