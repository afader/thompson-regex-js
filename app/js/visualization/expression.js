var exprs = require('../../../lib/exprs.js');

var callIfFunction = function(value) {
  return typeof value == 'function' ? value() : value;
};

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
  var newNode = function(label) {
    var node = { id: nextId(), label: label }
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

  // The next step is to define how new nodes can be added to the vis.js graph. The first case is
  // when encountering a quoted expression. In this case, we want to create a new 
  // node that just contains the quoted character as the label. When the evaluator encounters a
  // quote expression, it will call the following function with the literal value of the sub-
  // expression as the argument. So the expression (quote c) will call the javascript function
  // quoteNode("c") and return its value.
  var quoteNode = newNode;
  // The second case is when encountering a leaf node like whitespace or wildcard. In this case,
  // we want to create a new node in the graph that has the name of the leaf node. It is returned
  // so the parent expression has access to it. 
  var leafNode = function(name) {
    return function() {
      return newNode(name)
    }
  };
  // The third case is when encountering an inner node like a concatenation. In this case, we want
  // to create a new node and edges going from the new node to the nodes corresponding to the 
  // child expressions. Because inner nodes may have one or more argument expressions, we need to
  // access them via the javascript arguments object. 
  var innerNode = function(name) {
    return function() {
      var fromNode = newNode(name);
      var argValues = exprs.getArgs(arguments);
      var toNodes = argValues.map(callIfFunction); // hack since leaf nodes return 0-arg functions
      addEdges(fromNode, toNodes);
      return fromNode;
    }
  };
  // Now we define the environment for evaluation. The environment is a table mapping symbols that
  // appear in expressions to values. In this case, all of the values in the symbol table are
  // functions that produce the side-effect of modifying the vis.js graph.
  var env = {
    quote: quoteNode,
    charEquals: innerNode('equals'),
    concatenation: innerNode('concat'),
    alternation: innerNode('alt'),
    zeroOrMore: innerNode('zeroOrMore'),
    oneOrMore: innerNode('oneOrMore'),
    zeroOrOne: innerNode('zeroOrOne'),
    root: innerNode('root'),
    oneOf: innerNode('oneOf'),
    noneOf: innerNode('noneOf'),
    inRange: innerNode('inRange'),
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
