var exprs = require('./exprs.js');
var root = exprs.shape.oneArg('root');
var charEquals = exprs.shape.oneArg('charEquals');
var quote = exprs.shape.oneArg('quote');
var predicate = exprs.shape.oneArg('predicate');
var alternation = exprs.shape.atLeast2('alternation');
var concatenation = exprs.shape.atLeast2('concatenation');
var oneOrMore = exprs.shape.oneArg('oneOrMore');
var zeroOrMore = exprs.shape.oneArg('zeroOrMore');
var zeroOrOne = exprs.shape.oneArg('zeroOrOne');
var oneOf = exprs.shape.many('oneOf');
var noneOf = exprs.shape.many('noneOf');
var inRange = function(first, second) {
  if (first < second) {
    var values = [exprs.atom('inRange'), quote(exprs.atom(first)), quote(exprs.atom(second))];
    return exprs.list(values);
  } else {
    throw 'inRange requires first < second, got ' + first + ' >= ' + second;
  }
};
var wildcard = exprs.shape.zeroArg('wildcard');
var digit = exprs.shape.zeroArg('digit');
var whitespace = exprs.shape.zeroArg('whitespace');
var word = exprs.shape.zeroArg('word');
var newline = exprs.shape.zeroArg('newline');
var Parsimmon = require('parsimmon');
Parsimmon.Parser.prototype.markMap = function(fn) {
  return this.map(fn).mark().map(function(markObj) {
    markObj.value.parse = {start: markObj.start, end: markObj.end};
    return markObj.value;
  });
};
var lparen = Parsimmon.string('(');
var rparen = Parsimmon.string(')');
var lsqrb = Parsimmon.string('[');
var rsqrb = Parsimmon.string(']');
var caret = Parsimmon.string('^');
var pipe = Parsimmon.string('|');
var dot = Parsimmon.string('.');
var dash = Parsimmon.string('-');
var plus = Parsimmon.string('+');
var star = Parsimmon.string('*');
var qmark = Parsimmon.string('?');
var bslash = Parsimmon.string('\\');
var suffixOperator = (operator, fn) => parser => parser.skip(operator).markMap(fn);
var plussed = suffixOperator(plus, oneOrMore);
var starred = suffixOperator(star, zeroOrMore);
var qmarked = suffixOperator(qmark, zeroOrOne);
var parenthesized = parser => lparen.then(parser).skip(rparen);
var bracketed = parser => lsqrb.then(parser).skip(rsqrb);
var bslashed = (string, map) => Parsimmon.string(`\\${string}`).markMap(map);
var escape = c => bslashed(c, exprs.atom(c)).markMap(quote).markMap(charEquals);
var sepBy = function(parser, separator) {
  var pairs = separator.then(parser).many();
  return parser.chain(r => pairs.map(rs => [r].concat(rs)));
};
var rootRegex = Parsimmon.lazy('root', () => regex.markMap(root));
var regex = Parsimmon.lazy('regex', () => sepBy(branch, pipe).markMap(alternation));
var wildcard = dot.markMap(wildcard);
var charPattern = /[^\\*+?()\[\].|]/;
var character = Parsimmon.regex(charPattern).markMap(exprs.atom).markMap(quote).markMap(charEquals);
var escChars = ['(', ')', '[', ']', '*', '+', '\\', '.', '|'];
var escaped = Parsimmon.alt.apply(null, escChars.map(escape));
var specialCharClass = Parsimmon.alt(
  bslashed('s', whitespace),
  bslashed('w', word),
  bslashed('n', newline),
  bslashed('d', digit)
);
var customClassChar = Parsimmon.regex(/[^\[\]\\]/);
var escapedBrackets = Parsimmon.alt(escape('['), escape(']'));
var escapedDash = escape('-');
var escapedBslash = escape('\\');
var charClassChar = customClassChar.markMap(exprs.atom).markMap(quote).markMap(charEquals);
var charRange = customClassChar.chain(first => (
  dash.then(customClassChar).markMap(second => inRange(first, second))
));
var customClassVals = Parsimmon.alt(escapedBslash, escapedBrackets, escapedDash, charRange,
  specialCharClass, charClassChar).atLeast(1);
var customCharClass = bracketed(customClassVals.markMap(oneOf));
var negCustomCharClass = bracketed(caret.then(customClassVals).markMap(noneOf));
var charClasses = Parsimmon.alt(negCustomCharClass, customCharClass, specialCharClass);
var predValue = Parsimmon.alt(escaped, charClasses, wildcard, character);
var predicate = predValue.markMap(quote).markMap(predicate);
var atom = Parsimmon.alt(parenthesized(regex), predicate);
var piece = Parsimmon.alt(plussed(atom), qmarked(atom), starred(atom), atom);
var branch = piece.atLeast(1).markMap(concatenation);
module.exports = rootRegex;
