var exprs = {};
var callIfFunction = exprs.callIfFunction = function(value) {
  return typeof value == 'function' ? value() : value;
};
var getArgs = exprs.getArgs = function(argObj) {
  var results = [];
  for (var i = 0; i < argObj.length; i++) results.push(argObj[i]);
  return results;
};
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
var evalQuote = function(tail, env) {
  if ('quote' in env) {
    return env.quote(tail);
  } else if (tail.length == 1) {
    return tail[0];
  } else {
    throw 'Quote takes one argument, got ' + JSON.stringify(tail);
  }
};
var evalExpr = function(expr, env) {
  if (expr.length == 0) return null;
  var head = expr[0];
  var tail = expr.slice(1);
  if (head == 'quote') {
    return evalQuote(tail, env);
  } else {
    var evalInEnv = function(x) { return evaluate(x, env) };
    var fn = evalInEnv(head);
    var args = tail.map(evalInEnv);
    return fn.apply(null, args);
  }
};
var evaluate = exprs.evaluate = function(expr, env) {
  if (isAtom(expr)) {
    return evalAtom(expr, env);
  } else {
    return evalExpr(expr, env);
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
exprs.shape.zeroArg = function(name) {
  return [name, []];
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
