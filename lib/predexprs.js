var exprs = require('./exprs.js');
var predexprs = {};
predexprs.stringify = function(expr) {
  var identity1 = function(x) { return x };
  var constant = function(x) { return function() { return x } };
  var curlyBraced = function(elts) { return '{' + elts.join(",") + '}' };
  var stringifyEnv = {
    charEquals: function(x) { return x },
    inRange: function(first, second) { return first + '-' + second },
    word: constant('word'),
    digit: constant('digit'),
    whitespace: constant('whitespace'),
    newline: constant('newline'),
    wildcard: constant('wildcard'),
    epsilon: constant('\u03B5'),
    oneOf: function() { return curlyBraced(exprs.getArgs(arguments)) },
    noneOf: function() {
      var negation = "\u00AC";
      return negation + curlyBraced(exprs.getArgs(arguments));
    }
  };
  return exprs.evaluate(expr, stringifyEnv);
};
predexprs.evaluate = function(expr) {
  var charClass = function(chars) {
    return function(y) {
      return chars.indexOf(y) >= 0;
    }
  };
  var not = function(p) { return function(y) { return !p(y) } };
  var or = function(p, q) { return function(y) { return p(y) || q(y) } };
  var and = function(p, q) { return function(y) { return p(y) && q(y) } };
  var lte = function(x) { return function(y) { return y <= x } };
  var gte = function(x) { return function(y) { return y >= x } };
  var equals = function(x) { return function(y) { return x == y } };
  var alwaysTrue = function(x) { return true };
  var evaluateEnv = {
    charEquals: equals,
    inRange: function(a, b) { return and(gte(a), lte(b)) },
    word: or(and(gte('0'), lte('z')), equals('_')),
    digit: and(gte('0'), lte('9')),
    whitespace: or(equals('\s'), equals(' ')),
    newline: or(equals('\n'), equals('\r')),
    wildcard: alwaysTrue,
    epsilon: alwaysTrue,
    oneOf: function() {
      var preds = exprs.getArgs(arguments);
      return preds.reduce(or);
    },
    noneOf: function(preds) {
      var preds = exprs.getArgs(arguments);
      return not(preds.reduce(and));
    }
  };
  return exprs.evaluate(expr, evaluateEnv);
};
module.exports = predexprs;
