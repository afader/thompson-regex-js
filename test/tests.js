var assert = require('assert');
var nfa = require('../lib/nfa.js');
var parsers = require('../lib/parsers.js');
var predicates = require('../lib/predicates.js');

describe('regex tests', function() {
  it('should correctly parse, compile, simulate', function(done) {
    var pattern = '(abba+)|b.*';
    var environment = function(symbol) {
      if (symbol.match(/[a-z]/)) {
        return predicates.equals(symbol);
      } else if (symbol == '.') {
        return predicates.alwaysTrue;
      }
    }
    var parsed = parsers.simpleCharRegex(pattern);
    var compiled = nfa.build(parsed.value, environment);
    var match = function(string) { return nfa.simulate(compiled, string); };
    var matches = function(string) {
      assert(string + ' should match', match(string));
    };
    var doesntMatch = function(string) {
      assert(string + ' should not match', !match(string));
    }
    matches('abba');
    matches('abbaaa');
    doesntMatch('abb');
    matches('b');
    doesntMatch('');
    matches('bbbbb');
    done();
  });
});
