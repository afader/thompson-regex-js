var buildFragment = require('./buildFragment.js');

var nfaFragment = function(expr) {
  return expr.toNfaFragment();
};

var predicate = function(name, predicate) {
  return {
    name: name,
    predicate: predicate,
    children: [],
    toNfaFragment: function() {
      return buildFragment.predicate(name, predicate);
    }
  };
};

var concatenation = function(exprs) {
  if (exprs.length == 1) { return exprs[0]; }
  return {
    name: 'Concatenation',
    children: exprs,
    toNfaFragment: function() {
      var fragments = exprs.map(nfaFragment);
      return fragments.reduce(buildFragment.concatenation);
    }
  };
};

var alternation = function(exprs) {
  if (exprs.length == 1) { return exprs[0]; }
  return {
    name: 'Alternation',
    children: exprs,
    toNfaFragment: function() {
      var fragments = exprs.map(nfaFragment);
      return fragments.reduce(buildFragment.alternation);
    }
  };
};

var zeroOrMore = function(expr) {
  return {
    name: 'ZeroOrMore',
    children: [expr],
    toNfaFragment: function() {
      var fragment = expr.toNfaFragment();
      return buildFragment.zeroOrMore(fragment);
    }
  };
};

var oneOrMore = function(expr) {
  return {
    name: 'OneOrMore',
    children: [expr],
    toNfaFragment: function() {
      var fragment = expr.toNfaFragment();
      return buildFragment.oneOrMore(fragment);
    }
  };
};

var zeroOrOne = function(expr) {
  return {
    name: 'ZeroOrOne',
    children: [expr],
    toNfaFragment: function() {
      var fragment = expr.toNfaFragment();
      return buildFragment.zeroOrOne(fragment);
    }
  };
};

var root = function(expr) {
  return {
    name: 'Root',
    children: [expr],
    toNfaFragment: function() {
      var fragment = expr.toNfaFragment();
      return buildFragment.addFinalState(fragment);
    }
  };
};

var syntax = {
  predicate: predicate,
  concatenation: concatenation,
  alternation: alternation,
  zeroOrMore: zeroOrMore,
  oneOrMore: oneOrMore,
  zeroOrOne: zeroOrOne,
  root: root
};

module.exports = syntax;
