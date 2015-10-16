var exprs = require('./exprs.js');
var predexprs = {};
predexprs.stringify = function(expr) {
  var constant = x => () => x;
  var curlyBraced = elts => '{' + elts.join(',') + '}';
  var stringifyEnv = {
    quote: x => exprs.isAtom(x) ? x.value : JSON.stringify(x),
    charEquals: x => x,
    inRange: (first, second) => `${first}-${second}`,
    word: constant('word'),
    digit: constant('digit'),
    whitespace: constant('whitespace'),
    newline: constant('newline'),
    wildcard: constant('wildcard'),
    epsilon: constant('\u03B5'),
    oneOf: (...strings) => curlyBraced(strings),
    noneOf: (...strings) => '\u00AC' + curlyBraced(strings)
  };
  return exprs.evaluate(expr, stringifyEnv);
};
predexprs.evaluate = function(expr) {
  var charClass = chars => y => chars.indexOf(y) >= 0;
  var not = p => y => !p(y);
  var or = (p, q) => y => p(y) || q(y);
  var and = (p, q) => y => p(y) && q(y);
  var lte = x => y => y <= x;
  var gte = x => y => y >= x;
  var equals = x => y => x == y;
  var alwaysTrue = x => true;
  var evaluateEnv = {
    charEquals: equals,
    inRange: (a, b) => and(gte(a), lte(b)),
    word: or(and(gte('0'), lte('z')), equals('_')),
    digit: and(gte('0'), lte('9')),
    whitespace: or(equals('\s'), equals(' ')),
    newline: or(equals('\n'), equals('\r')),
    wildcard: alwaysTrue,
    epsilon: alwaysTrue,
    oneOf: (...preds) => preds.reduce(or),
    noneOf: (...preds) => not(preds.reduce(and))
  };
  return exprs.evaluate(expr, evaluateEnv);
};
module.exports = predexprs;
