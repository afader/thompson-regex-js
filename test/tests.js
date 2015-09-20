var assert = require('assert');
var nfa = require('../lib/nfa.js');
var parsers = require('../lib/parsers.js');
var predicates = require('../lib/predicates.js');
var vm = require('../lib/vm.js');

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
      assert(match(string), string + ' should match');
    };
    var doesntMatch = function(string) {
      assert(!match(string), string + ' should not match');
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

describe('vm tests', function() {
  it('should comile', function(done) {
    var expr = parsers.simpleCharRegex('(ab*)*').value;
    var compiled = vm.compile(expr);
    var env = function(symbol) { return predicates.equals(symbol); };
    var run = function(input) {
      console.log(input + ' => ' + vm.run(compiled, input, env));
    };
    compiled.forEach(function(inst, i) {
      console.log(i + ' ' + JSON.stringify(inst));
    });
    run('a');
    run('');
    run('b');
    run('ab');
    run('ba');
    run('aa');
    run('abcx');
    run('abcxx');
    run('abc');
    run('abcabc');
    run('abcabcx');
    run('abcab');
    run('bc');
    run('aaabc');
    done();
  });
});
