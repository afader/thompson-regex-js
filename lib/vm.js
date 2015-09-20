var instruction = {};
instruction.predicate = function(name) {
  return { type: 'predicate', name: name };
};
instruction.match = function() {
  return { type: 'match' };
};
instruction.jump = function(increment) {
  return { type: 'jump', increment: increment };
};
instruction.split = function(increment) {
  return { type: 'split', increment: increment };
};

var concat = function(array1, array2) { return array1.concat(array2); };
var codes = {};
var compile = function(expr) {
  if (expr.type in codes) {
    return codes[expr.type](expr);
  } else {
    throw 'Unexpected expression type: "' + expr.type + '"';
  }
};

codes.predicate = function(expr) {
  var predName = expr.data.name;
  var pred = instruction.predicate(predName);
  return [pred];
};

codes.concatenation = function(expr) {
  var childCodes = expr.children.map(compile);
  return childCodes.reduce(concat);
};

codes.alternation = function(expr) {
  var childCodes = expr.children.map(compile);
  var reducer = function(codes1, codes2) {
    var split = [instruction.split(codes1.length + 2)];
    var jump = [instruction.jump(codes2.length + 1)];
    var parts = [ split, codes1, jump, codes2 ];
    return parts.reduce(concat);
  };
  return childCodes.reduce(reducer);
};

codes.zeroOrOne = function(expr) {
  var codes = compile(expr.children[0]);
  var split = [instruction.split(codes.length + 1)];
  return concat(split, codes);
};

codes.zeroOrMore = function(expr) {
  var codes = compile(expr.children[0]);
  var split = [instruction.split(codes.length + 2)];
  var jump = [instruction.jump(-codes.length - 1)];
  var parts = [split, codes, jump];
  return parts.reduce(concat);
};

codes.oneOrMore = function(expr) {
  var codes = compile(expr.children[0]);
  var split = [instruction.split(-codes.length)];
  return concat(codes, split);
};

codes.root = function(expr) {
  var childCodes = compile(expr.children[0]);
  var match = instruction.match();
  return childCodes.concat([match]);
};

var thread = function(position) {
  return { position: position };
};

var addThread = function(t, threads) {
  var positions = threads.map(function(x) { return x.position; });
  if (positions.indexOf(t.position) == -1) {
    threads.push(t);
  }
};

var threadList = function() {
  var positions = {};
  var threads = [];
  var addThread = function(t) {
    if (!(t.position in positions)) {
      threads.push(t);
      positions[t.position] = t;
    }
  };
  return { positions: positions, threads: threads, addThread: addThread };
};

var thompson = function(program, input, env) {
  var currentThreads = threadList();
  currentThreads.addThread(thread(0));
  for (var i = 0; i <= input.length; i++) {
    var nextThreads = threadList();
    for (var j = 0; j < currentThreads.threads.length; j++) {
      var t = currentThreads.threads[j];
      var instr = program[t.position];
      switch(instr.type) {
	case 'predicate':
	  var pred = env(instr.name);
	  if (pred(input[i])) {
	    nextThreads.addThread(thread(t.position + 1));
	  }
	  break;
	case 'match':
	  if (i == input.length) {
	    return true;
	  }
	  break;
	case 'split':
	  currentThreads.addThread(thread(t.position + 1));
	  currentThreads.addThread(thread(t.position + instr.increment));
	  break;
	case 'jump':
	  currentThreads.addThread(thread(t.position + instr.increment));
	  break;
      }
    }
    currentThreads = nextThreads;
  }
  return false;
};

module.exports = {
  compile: compile,
  run: thompson
};
