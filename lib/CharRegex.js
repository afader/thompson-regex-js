var parser = require('./CharRegex/parser.js');
var env = require('./CharRegex/env.js');
var vm = require('./vm.js');
var nfa = require('./nfa.js');
var Parsimmon = require('Parsimmon');

var CharRegex = function(pattern) {
  this.pattern = pattern;
  this.parseResults = parser.parse(pattern);
  if (!this.parseResults.status) {
    var error = Parsimmon.formatError(pattern, this.parseResults)
    throw "Could not parse: " + error;
  }
  this.expression = this.parseResults.value;
  this.program = vm.compile(this.expression);
  this.nfa = nfa.compile(this.expression);
  this.match = function(input) {
    return vm.run(this.program, input, env);
  }
};

module.exports = CharRegex;
