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
  root: withOneChild('root')
}

module.exports = expressions;
