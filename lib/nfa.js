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

var build = function(parsedRegex) {
  var fragment = parsedRegex.toNfaFragment();
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
