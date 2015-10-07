var expression = function(type, children, data) {
  return {
    type: type,
    children: children ? children : [],
    data: data ? data : {}
  };
};

var withOneChild = function(name) {
  return function(expr, data) {
    return expression(name, [expr], data);
  };
};

var withMultipleChildren = function(name) {
  return function(exprs, data) {
    if (exprs.length == 0) {
      throw name + ' takes at least one child node';
    } else if (exprs.length == 1) {
      return exprs[0];
    } else {
      return expression(name, exprs, data);
    }
  };
};

var disjunction = function(exprs, negated) {
  var notPred = function(x) { return !('type' in x) || x.type != 'predicate' };
  if (exprs.some(notPred)) {
    var first = notPred.find(notPred);
    throw 'disjunction must take predicates as arguments, got: ' + first.type;
  } else if (exprs.length < 1) {
    throw 'disjunction must take at least one predicate';
  }
  var children = exprs;
  var data = {negated: negated};
  return expression('disjunction', children, data);
};

var expressions = {
  predicate: function(name) {
    var data = {name: name};
    var children = [];
    return expression('predicate', children, data);
  },
  concatenation: withMultipleChildren('concatenation'),
  alternation: withMultipleChildren('alternation'),
  zeroOrMore: withOneChild('zeroOrMore'),
  oneOrMore: withOneChild('oneOrMore'),
  zeroOrOne: withOneChild('zeroOrOne'),
  root: withOneChild('root'),
  disjunction: disjunction
}

module.exports = expressions;
