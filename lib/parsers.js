var syntax = require('./syntax.js');
var Parsimmon = require('Parsimmon');
Parsimmon.sepBy1 = function(parser, separator) {
  var pairs = separator.then(parser).many();
  return parser.chain(function(r) {
    return pairs.map(function(rs) {
      return [r].concat(rs);
    })
  })
};

var pipe = Parsimmon.string('|');
var lparen = Parsimmon.string('(');
var rparen = Parsimmon.string(')');
var star = Parsimmon.string('*');
var plus = Parsimmon.string('+');
var qmark = Parsimmon.string('?');
var dot = Parsimmon.string('.');

var parenthesized = function(parser) {
  return lparen.then(parser).skip(rparen);
};

var suffixOperator = function(operator, fn) {
  return function(parser) {
    return parser.skip(operator).map(fn);
  }
};

var plussed = suffixOperator(plus, syntax.oneOrMore);
var starred = suffixOperator(star, syntax.zeroOrMore);
var qmarked = suffixOperator(qmark, syntax.zeroOrOne);

var simpleCharRegex = function() {
  var root = Parsimmon.lazy('a simple, character-based regex', function() {
    return regex.map(syntax.root);
  });
  var regex = Parsimmon.lazy('regex', function() {
    return Parsimmon.sepBy1(branch, pipe).map(syntax.alternation);
  });
  var character = Parsimmon.regex(/[A-z]/).map(function(ch) {
    return syntax.predicate(ch);
  }).desc('character literal');
  var any = dot.map(function() {
    return syntax.predicate('.');
  }).desc('wildcard');
  var atom = Parsimmon.alt(parenthesized(regex), character, any).desc('atom');
  var piece = Parsimmon.alt(starred(atom), plussed(atom), qmarked(atom), atom).desc('piece');
  var branch = piece.atLeast(1).map(syntax.concatenation).desc('branch');
  return function(input) {
    var result = root.parse(input);
    if (result.status) {
      result.value.input = input;
    }
    return result;
  }
}();

module.exports = {
  simpleCharRegex: simpleCharRegex
};
