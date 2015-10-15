var exprs = require('../../../lib/exprs.js');

var visGraph = function(rootExpr) {
  // This function converts an expression tree to a vis.js graph. The strategy used is to 
  // evaluate the expression tree. The evaluation of each node in the tree mutates a vis.js 
  // graph by adding nodes and edges.
  var nodes = [];
  var edges = [];
  var graph = {nodes: nodes, edges: edges};

  // Next define some helper functions to generate unique node ids and mutate the graph.
  var id = 0;
  var nextId = function() { return id++ };
  var newNode = function(label, level) {
    level = level == null ? 0 : level;
    var node = { id: nextId(), label: label, level: level };
    nodes.push(node);
    return node;
  };
  var addEdges = function(fromNode, toNodes) {
    var newEdges = toNodes.map(function(toNode) {
      var edge = { from: fromNode.id, to: toNode.id };
      edges.push(edge);
      return edge;
    });
    return newEdges;
  };

  // The first case is when encountering a leaf node like whitespace or wildcard. In this case,
  // we want to create a new node in the graph that has the name of the leaf node. It is returned
  // so the parent expression has access to it. 
  var leafNode = function(name) {
    return function() {
      return newNode(name)
    }
  };
  // The second case is when encountering an inner node like a concatenation. In this case, we want
  // to create a new node and edges going from the new node to the nodes corresponding to the 
  // child expressions. Because inner nodes may have one or more argument expressions, we need to
  // access them via the javascript arguments object. 
  var innerNode = function(name) {
    return function() {
      var fromNode = newNode(name);
      var toNodes = exprs.getArgs(arguments);
      addEdges(fromNode, toNodes);
      fromNode.level = Math.min.apply(this, toNodes.map(function(x) { return x.level })) - 1;
      return fromNode;
    }
  };
  // Now we define the environment for evaluation. The environment is a table mapping symbols that
  // appear in expressions to values. In this case, all of the values in the symbol table are
  // functions that produce the side-effect of modifying the vis.js graph.
  var env = {
    quote: function(x) {
      var arg = x[0];
      if (exprs.isAtom(arg)) {
	return newNode(arg);
      } else {
	var child = exprs.evaluate(arg, env);
	return innerNode('quote')(child);
      }
    },
    charEquals: innerNode('charEquals'),
    inRange: innerNode('inRange'),
    predicate: innerNode('predicate'),
    concatenation: innerNode('concat'),
    alternation: innerNode('alt'),
    zeroOrMore: innerNode('zeroOrMore'),
    oneOrMore: innerNode('oneOrMore'),
    zeroOrOne: innerNode('zeroOrOne'),
    root: innerNode('root'),
    oneOf: innerNode('oneOf'),
    noneOf: innerNode('noneOf'),
    whitespace: leafNode('whitespace'),
    word: leafNode('word'),
    newline: leafNode('newline'),
    digit: leafNode('digit'),
    wildcard: leafNode('wildcard')
  };
  // Calls the eval/apply loop on the root expression. Since we're only interested in the
  // side-effect of building the expression graph
  exprs.evaluate(rootExpr, env);
  return graph;
};

// Object to configure the vis.js display of the graph.
var config = {
  layout: {
    hierarchical: {
      direction: 'UD',
      levelSeparation: 100
    }
  },
  edges: {
    arrows: 'to',
    color: 'black'
  },
  nodes: {
    color: {
      border: 'black',
      background: 'white'
    },
  },
  interaction: {
    dragNodes: false,
    dragView: true,
    selectable: false
  }
};

module.exports = {
  visGraph: visGraph,
  config: config
};
