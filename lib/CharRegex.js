var parser = require('./parser.js');
var nfa = require('./nfa.js');

var CharRegex = function(pattern) {
  this.pattern = pattern;
  this.parseResults = parser.parse(pattern);
  if (!this.parseResults.status) {
    var error = Parsimmon.formatError(pattern, this.parseResults)
    throw new SyntaxError("Could not parse: " + error);
  }
  this.expression = this.parseResults.value;
  this.nfa = nfa.compile(this.expression);
};

module.exports = CharRegex;
