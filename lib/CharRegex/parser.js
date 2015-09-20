var syntax = require('../syntax.js');
var parsers = require('../parsers.js');

var alt = parsers.alt;
var lazy = parsers.lazy;
var regexParser = parsers.regex;
var sepBy = parsers.sepBy;
var pipe = parsers.pipe;
var dot = parsers.dot;
var parenthesized = parsers.parenthesized;
var starred = parsers.starred(syntax.zeroOrMore);
var plussed = parsers.plussed(syntax.oneOrMore);
var qmarked = parsers.qmarked(syntax.zeroOrOne);

var root = lazy('root expression', function() {
  return regex.map(syntax.root);
});

var regex = lazy('regex', function() {
  return sepBy(branch, pipe).map(syntax.alternation);
});

var wildcard = dot.map(function() {
  return syntax.predicate('wildcard');
}).desc('wildcard');

var character = regexParser(/[A-z0-9]/).map(syntax.predicate).desc('character');

var atom = alt(parenthesized(regex), wildcard, character).desc('atom');

var piece = alt(starred(atom), plussed(atom), qmarked(atom), atom).desc('piece');

var branch = piece.atLeast(1).map(syntax.concatenation).desc('branch');

module.exports = root;
