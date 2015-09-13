var util = require('util');
var fragment = require('./fragment.js');

var indexedFragmentStates = function(fragment) {
  var nextIndex = 0;
  var frontier = [fragment.head];
  var states = [];
  while (frontier.length > 0) {
    var state = frontier.pop();
    if (state.index == null) {
      state.index = nextIndex;
      nextIndex++;
      state.transitions.forEach(function(transition) {
	frontier.push(transition.target);
      });
      states.push(state);
    };
  };
  return states;
};

var evalFunctions = {};
var evalExpression = function(expr, env) {
  if (expr.type == null) {
    var exprString = util.inspect(expr);
    throw "Expression has no type: " + exprString;
  } else if (!(expr.type in evalFunctions)) {
    throw "No evaluation function for expression type '" + expr.type + "'";
  } else {
    return evalFunctions[expr.type](expr, env);
  }
};

var evalChildThen = function(wrapper) {
  return function(expr, env) {
    var childFrag = evalExpression(expr.children[0], env);
    return wrapper(childFrag);
  };
};

var evalChildrenThen = function(wrapper) {
  return function(expr, env) {
    var evalChild = function(child) { return evalExpression(child, env); };
    var childFrags = expr.children.map(evalChild);
    return wrapper(childFrags);
  };
};

var undefinedSymbol = function(symbol) {
  throw "Undefined symbol '" + symbol + "'";
};

var lookup = function(name, env) {
  switch(typeof env) {
    case 'function':
      var value = env(name);
      if (value != null) {
	return value;
      } else {
	undefinedSymbol(name);
      }
    case 'object':
      if (name in env) {
	return env[name];
      } else {
	undefinedSymbol(name);
      }
    default:
      throw 'Environment must be object or function'
  };
};

evalFunctions.root = evalChildThen(fragment.root);
evalFunctions.concatenation = evalChildrenThen(fragment.concatenation);
evalFunctions.alternation = evalChildrenThen(fragment.alternation);
evalFunctions.zeroOrMore = evalChildThen(fragment.zeroOrMore);
evalFunctions.oneOrMore = evalChildThen(fragment.oneOrMore);
evalFunctions.zeroOrOne = evalChildThen(fragment.zeroOrOne);
evalFunctions.predicate = function(expr, env) {
  var name = expr.data.name;
  var pred = lookup(name, env);
  return fragment.predicate(name, pred);
};

var build = function(parsedRegex, env) {
  var fragment = evalExpression(parsedRegex, env);
  var util=require('util');
  var states = indexedFragmentStates(fragment);
  var numStates = states.length;
  var nfaTransitions = {};
  var finalState;
  states.forEach(function(state) {
    if (state.transitions.length == 0) {
      finalState = state.index;
    };
    var outTrans = {};
    state.transitions.map(function(fragTrans) {
      outTrans[fragTrans.target.index] = fragTrans.test;
    });
    nfaTransitions[state.index] = outTrans;
  });
  return {
    initialState: 0,
    numStates: numStates,
    finalState: finalState,
    transitions: nfaTransitions
  };
};

var simulate = function(nfa, input) {
  var initial = { state: 0, offset: 0 };
  var frontier = [initial];
  while (frontier.length > 0) {
    var current = frontier.shift();
    if (current.state == nfa.finalState && current.offset == input.length) {
      return true;
    }
    for (nextState in nfa.transitions[current.state]) {
      var observed = input[current.offset];
      var transition = nfa.transitions[current.state][nextState];
      var nextOffset = current.offset + transition.increment;
      if (transition.predicate(observed) && nextOffset <= input.length) {
	var next = { state: nextState, offset: nextOffset };
	frontier.push(next);
      }
    }
  }
  return false;
};

module.exports = {
  build: build,
  simulate: simulate
};
