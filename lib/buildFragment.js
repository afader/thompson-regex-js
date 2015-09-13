var predicates = require('./predicates.js');
var transitionTest = function(name, predicate, increment) {
  return {
    name: name,
    predicate: predicate,
    increment: increment
  }
};
var eps = "\u03B5";
var epsilonTest = transitionTest(eps, predicates.alwaysTrue, false);

var fragmentState = function(transitions, index) {
  return {
    transitions: transitions ? transitions : [],
    index: index
  };
};

var fragmentTransition = function(test, target) {
  return {
    test: test,
    target: target
  };
};

var fragment = function(head, tails) {
  return {
    head: head,
    tails: tails
  }
};

var patch = function(tails, state) {
  tails.forEach(function(tail) {
    tail.target = state;
  });
};

var buildFragment = {
  empty: function() {
    var trans = fragmentTransition(epsilonTest, null);
    var head = fragmentState([trans]);
    var tails = [trans];
    return fragment(head, tails);
  },
  predicate: function(name, predicate) {
    var test = transitionTest(name, predicate, true);
    var trans = fragmentTransition(test, null);
    var head = fragmentState([trans]);
    var tails = [trans];
    return fragment(head, tails);
  },
  concatenation: function(frag1, frag2) {
    patch(frag1.tails, frag2.head);
    var head = frag1.head;
    var tails = frag2.tails;
    return fragment(head, tails);
  },
  alternation: function(frag1, frag2) {
    var trans1 = fragmentTransition(epsilonTest, frag1.head);
    var trans2 = fragmentTransition(epsilonTest, frag2.head);
    var head = fragmentState([trans1, trans2]);
    var tails = frag1.tails.concat(frag2.tails);
    return fragment(head, tails);
  },
  zeroOrMore: function(frag) {
    var loopTrans = fragmentTransition(epsilonTest, frag.head);
    var breakTrans = fragmentTransition(epsilonTest, null);
    var head = fragmentState([loopTrans, breakTrans]);
    patch(frag.tails, head);
    return fragment(head, [breakTrans]);
  },
  oneOrMore: function(frag) {
    var loopTrans = fragmentTransition(epsilonTest, frag.head);
    var breakTrans = fragmentTransition(epsilonTest, null);
    var state = fragmentState([loopTrans, breakTrans]);
    patch(frag.tails, state);
    return fragment(frag.head, [breakTrans]);
  },
  zeroOrOne: function(frag) {
    var matchTrans = fragmentTransition(epsilonTest, frag.head);
    var skipTrans = fragmentTransition(epsilonTest, null);
    var head = fragmentState([matchTrans, skipTrans]);
    var tails = frag.tails.concat([skipTrans]);
    return fragment(head, tails);
  },
  addFinalState: function(frag) {
    var finalState = fragmentState();
    patch(frag.tails, finalState);
    return fragment(frag.head, []);
  }
};
module.exports = buildFragment;
