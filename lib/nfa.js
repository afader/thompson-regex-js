var exprs = require('./exprs.js');
var assign = require('object.assign').getPolyfill();
var predexprs = require('./predexprs.js');
var nfa = {};
var epsilonExpr = exprs.shape.zeroArg('epsilon');
var compile = nfa.compile = function(rootExpr) {
  var nodes = [];
  var edges = [];
  var graph = {nodes: nodes, edges: edges, start: null, end: null};
  var id = 0;
  var nextId = () => id++;
  var newNode = function() {
    var id = nextId();
    var node = { id: id, label: id };
    nodes.push(node);
    return id;
  };
  var newEdge = function(edge) {
    var predicate = predexprs.evaluate(edge.expression);
    var label = predexprs.stringify(edge.expression);
    var edgeDefn = assign({}, { label: label, predicate: predicate, isEpsilon: false }, edge);
    edges.push(edgeDefn);
    return edgeDefn;
  };
  var patch = (tails, id) => tails.forEach(tail => tail.to = id);
  var newEpsilonEdge = function(edge) {
    var defn = assign({}, edge, { expression: epsilonExpr(), isEpsilon: true });
    return newEdge(defn);
  };
  var tails = frag => frag.tails;
  var concat = (a1, a2) => a1.concat(a2);
  var env = {
    predicate: function(arg) {
      var node = newNode();
      var edge = newEdge({ from: node, to: null, expression: arg });
      return { head: node, tails: [edge] };
    },
    concatenation: function(...frags) {
      var reducer = function(frag1, frag2) {
	patch(frag1.tails, frag2.head);
	return { head: frag1.head, tails: frag2.tails }
      };
      return frags.reduce(reducer);
    },
    alternation: function(...frags) {
      var node = newNode();
      frags.forEach(frag => newEpsilonEdge({ from: node, to: frag.head }));
      return { head: node, tails: frags.map(tails).reduce(concat) };
    },
    zeroOrOne: function(frag) {
      var node = newNode();
      var zero = newEpsilonEdge({ from: node, to: null });
      var one = newEpsilonEdge({ from: node, to: frag.head });
      return { head: node, tails: frag.tails.concat([zero]) };
    },
    zeroOrMore: function(frag) {
      var node = newNode();
      patch(frag.tails, node);
      var start = newEpsilonEdge({ from: node, to: frag.head });
      var stop = newEpsilonEdge({ from: node, to: null });
      return { head: node, tails: [stop] };
    },
    oneOrMore: function(frag) {
      var node = newNode();
      patch(frag.tails, node);
      var loop = newEpsilonEdge({ from: node, to: frag.head });
      var stop = newEpsilonEdge({ from: node, to: null });
      return { head: frag.head, tails: [stop] };
    },
    root: function(frag) {
      var node = newNode();
      patch(frag.tails, node);
      graph.start = frag.head;
      graph.end = node;
    }
  };
  exprs.evaluate(rootExpr, env);
  return graph;
};
module.exports = nfa;
