var parser = require('./parser.js');

var CharRegex = function(pattern) {
  this.pattern = pattern;
  this.parseResults = parser.parse(pattern);
  if (!this.parseResults.status) {
    var error = Parsimmon.formatError(pattern, this.parseResults)
    throw "Could not parse: " + error;
  }
  this.expression = this.parseResults.value;
};

module.exports = CharRegex;
