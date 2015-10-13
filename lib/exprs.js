var exprs = {};
var isAtom = exprs.isAtom = function(expr) {
  var t = typeof expr;
  return t == 'string' || t == 'number';
};
var evalAtom = function(atom, env) {
  if (typeof atom == 'number') {
    return atom;
  } else if (atom in env) {
    return env[atom];
  } else {
    throw 'Unknown symbol: ' + atom;
  }
};
var evalExpr = function(expr, env) {
  if (expr.length == 0) throw 'Empty expression';
  var head = expr[0];
  var tail = expr.slice(1);
  if (head == 'quote') {
    return tail;
  } else {
    var evalInEnv = function(x) { return evaluate(expr, env) };
    var fn = evalInEnv(head);
    var args = tail.map(evalInEnv);
    return fn.apply(null, args);
  }
};
var evaluate = exprs.evaluate = function(expr, env) {
  if (isAtom(expr)) {
    return evalAtom(expr);
  } else {
    return evalExpr(expr);
  }
};
exprs.shape = {};
exprs.shape.atom = function(name) {
  return name;
};
exprs.shape.oneArg = function(name) {
  return function(expr) {
    return [name, expr];
  }
};
exprs.shape.many = function(name) {
  return function(expr) {
    return [name].concat(expr);
  }
};
exprs.shape.flatMany = function(name) {
  return function(expr) {
    if (isAtom(expr)) {
      return expr;
    } else if (expr.length == 1) {
      return expr[0];
    } else {
      return [name].concat(expr);
    }
  }
};
module.exports = exprs;
