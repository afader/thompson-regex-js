// The code in this file is used to map a string like "a+b*" to an expression like
// (root (concatenation (oneOrMore (quote a)) (zeroOrMore (quote b)))). This mapping is done using 
// a parser combinator library called Parsimmon. The expressions are represented using javascript
// Arrays.

// Each expression tree starts with a root node.
var exprs = require('./exprs.js');
var root = exprs.shape.oneArg('root');

// Two expressions used to represent a single character match like "a". This creates an expression
// that looks like (charEquals (quote a)). Quoting is used to distinguish between the character 
// "a" and the symbol a (similar to lisp).
var charEquals = exprs.shape.oneArg('charEquals');
var quote = exprs.shape.oneArg('quote');

// Used for alternation in regexes, e.g. "a|b".
var alternation = exprs.shape.flatMany('alternation');

// Concatenates two expressions, e.g. "ab"
var concatenation = exprs.shape.flatMany('concatenation');

// Repetition operator, e.g. "a+" "a*" and "a?" respectively.
var oneOrMore = exprs.shape.oneArg('oneOrMore');
var zeroOrMore = exprs.shape.oneArg('zeroOrMore');
var zeroOrOne = exprs.shape.oneArg('zeroOrOne');

// Used for defining custom character classes e.g. "[ab]" is represented as the expression
// (oneOf (charEquals (quote a)) (charEquals (quote b))). A negative character class is the same,
// only using the symbol noneOf instead of oneOf.
var oneOf = exprs.shape.many('oneOf');
var noneOf = exprs.shape.many('noneOf');

// Function for creating inRange functions, which are used to represent character ranges like A-Z.
var inRange = function(first, second) {
  if (first < second) {
    var name = exprs.shape.atom('inRange');
    return [name, quote(first), quote(second)];
  } else {
    throw 'inRange requires first < second, got ' + first + ' >= ' + second;
  }
};

// The familiar regular expression character classes.
var wildcard = exprs.shape.atom('wildcard');
var digit = exprs.shape.atom('digit');
var whitespace = exprs.shape.atom('whitespace');
var word = exprs.shape.atom('word');
var newline = exprs.shape.atom('newline');

// Now to define the parser combinators. Each parser combinator defines a piece of the entire 
// parser that maps a string to an expression. 
var Parsimmon = require('Parsimmon');

// Parsers for exact matching of a few strings.
var caret = Parsimmon.string('^');
var pipe = Parsimmon.string('|');
var dot = Parsimmon.string('.');
var dash = Parsimmon.string('-');
var plus = Parsimmon.string('+');
var star = Parsimmon.string('*');
var qmark = Parsimmon.string('?');

// Save some boilerplate code for defining the suffix operators like +, *, and ?. Each one has
// an operator parser and then a function that wraps the result in an expression like oneOrMore.
var suffixOperator = function(operator, fn) {
  return function(parser) {
    return parser.skip(operator).map(fn);
  }
};
var plussed = suffixOperator(plus, oneOrMore);
var starred = suffixOperator(star, zeroOrMore);
var qmarked = suffixOperator(qmark, zeroOrOne);

// Boilerplate for defining parenthesized and bracketed parsers.
var parenthesized = function(parser) {
  return Parsimmon.string('(').then(parser).skip(Parsimmon.string(')'));
};
var bracketed = function(parser) {
  return Parsimmon.string('[').then(parser).skip(Parsimmon.string(']'));
};

// Boilerplate for defining parsers involving backslashes, e.g. for special character classes and
// escaped characters.
var backslashed = function(string, result) {
  var pattern = '\\' + string;
  return Parsimmon.string(pattern).result(result).desc(pattern);
};
var escape = function(c) { return backslashed(c, charEquals(c)) };

// For defining parsers for expressions like a|b|c|...|z defined by a parser for the separator
// and one for the stuff between the separator.
var sepBy = function(parser, separator) {
  var pairs = separator.then(parser).many();
  return parser.chain(function(r) {
    return pairs.map(function(rs) {
       return [r].concat(rs);
     })
  })
};

// The top-level parser for regular expressions.
var rootRegex = Parsimmon.lazy('root', function() { return regex.map(root); });

// A second-level parser for matching a regular expression. A complete regular expression may be
// composed of an alternation of regular expression "branches" e.g. branch1|branch2|...|branchN.
var regex = Parsimmon.lazy('regex', function() {
  return sepBy(branch, pipe).map(alternation);
});

// Map "." to the symbol 'wildcard' in the output expression.
var wildcard = dot.result(wildcard).desc('wildcard');

// Match any character that doesn't have a special meaning in regular expressions.
var character = Parsimmon.regex(/[^\\*+?()\[\].|-]/).map(charEquals).desc('character');

// Special characters that require an escaping backslash.
var escChars = ['(', ')', '[', ']', '*', '+', '\\', '.', '|'];
var escaped = Parsimmon.alt.apply(null, escChars.map(escape));

// Some special character classes that are parsed from a backslashed character to a symbol.
var specialCharClass = Parsimmon.alt(
  backslashed('s', whitespace),
  backslashed('w', word),
  backslashed('n', newline),
  backslashed('d', digit)
);

// The next few definitions are used for matching custom character classes, i.e. the stuff between
// square brackets. Inside of the square brackets, characters don't need to be escaped (except for
// square brackets themselves).
var customClassChar = Parsimmon.regex(/[^\[\]]/);
var escapedBrackets = Parsimmon.alt(escape('['), escape(']'));

// Map a single character to a charEquals expression.
var charClassChar = customClassChar.map(charEquals);

// Map a character range like "A-Z" to an inRange expression.
var charRange = customClassChar.chain(function(first) {
  return dash.then(customClassChar).map(function(second) {
    return inRange(first, second);
  });
});

// customClassVals defines all of the sub-expressions that can appear within a square-bracketed
// regular expression.
var customClassVals = Parsimmon.alt(escapedBrackets, charRange, specialCharClass,
  charClassChar).atLeast(1);

// Positive and negative custom character classes are bracketed sequences of customClassVals, 
// wrapped in oneOf or noneOf expressions, respectively.
var customCharClass = bracketed(customClassVals.map(oneOf));
var negCustomCharClass = bracketed(caret.then(customClassVals).map(noneOf));

// An atom is any regular expression that can be modified by a repetition operator.
var atom = Parsimmon.alt(parenthesized(regex), escaped, negCustomCharClass, customCharClass,
  specialCharClass, wildcard, character).desc('atom');

// Pieces of a regular expression can be written in sequence to define a concatenation.
var piece = Parsimmon.alt(plussed(atom), qmarked(atom), starred(atom), atom).desc('piece');
var branch = piece.atLeast(1).map(concatenation);

// Export the top-level regex parser. Has a .parse method that can be called on a string.
module.exports = rootRegex;
