var exprs = {};

var atom = exprs.atom = value => ({ type: 'atom', value: value });
var list = exprs.list = values => ({ type: 'list', values: values });
var isAtom = exprs.isAtom = expr => (expr != null && expr.type == 'atom');
var isList = exprs.isList = expr => (expr != null && expr.type == 'list');
var isEmptyList = exprs.isEmptyList = expr => (isList(expr) && expr.values.length == 0);
var isNonEmptyList = expr => isList(expr) && !isEmptyList(expr);
var tail = exprs.tail = expr => isList(expr) ? expr.values.slice(1) : [];
var head = exprs.head = expr => isNonEmptyList(expr) ? expr.values[0] : null;
var isNumber = expr => isAtom(expr) && typeof expr.value == 'number';
var inEnv = (expr, env) => isAtom(expr) && !isNumber(expr) && expr.value in env;
var numArgs = expr => isNonEmptyList(expr) ? expr.values.length - 1 : 0;
var firstArg = expr => expr.values[1];

var evalAtom = function(atom, env) {
  if (isNumber(atom)) {
    return atom.value;
  } else if (inEnv(atom, env)) {
    return env[atom.value];
  } else {
    throw new Error('Unknown symbol: ' + atom.value);
  }
};

var evalQuote = function(expr, env) {
  if (numArgs(expr) != 1) throw new Error('quote takes one argument: ' + JSON.stringify(expr));
  if ('quote' in env) {
    var context = { expression: expr };
    return env.quote.call(context, firstArg(expr));
  } else {
    return firstArg(expr);
  }
};

var evalList = function(expr, env) {
  if (isEmptyList(expr)) return null;
  if (head(expr).value == 'quote') {
    return evalQuote(expr, env);
  } else {
    var evalInEnv = function(x) { return evaluate(x, env) };
    var fn = evalInEnv(head(expr));
    var args = tail(expr).map(evalInEnv);
    var context = { expression: expr };
    return fn.apply(context, args);
  }
};

var evaluate = exprs.evaluate = function(expr, env) {
  if (isAtom(expr)) {
    return evalAtom(expr, env);
  } else if (isList(expr)) {
    return evalList(expr, env);
  } else {
    var str = JSON.stringify(expr);
    throw new Error('Only lists and atoms can be evaluated: ' + str);
  }
};

exprs.shape = {};
exprs.shape.empty = () => list([]);
exprs.shape.oneArg = name => expr => list([atom(name), expr]);
exprs.shape.zeroArg = name => () => list([atom(name), exprs.shape.empty()]);
exprs.shape.many = name => exprs => list([atom(name)].concat(exprs));
exprs.shape.atLeast2 = function(name) {
  return function(exprs) {
    if (exprs.length == 1) {
      return exprs[0];
    } else {
      var values = [atom(name)].concat(exprs);
      return list(values);
    }
  }
};
module.exports = exprs;
