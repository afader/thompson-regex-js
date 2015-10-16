var exprs = require('../../../lib/exprs.js');

var visGraph = function(rootExpr) {
  var nodes = [];
  var edges = [];
  var graph = {nodes: nodes, edges: edges};
  var id = 0;
  var nextId = () => id++;
  var newNode = function(label, expression) {
    var node = { id: nextId(), label: label, level: 0 };
    if (expression && 'parse' in expression) {
      node.parse = { start: expression.parse.start, end: expression.parse.end };
    }
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
  var leafNode = name => () => newNode(name, this.expression);
  var innerNode = name => function(...toNodes) {
    var fromNode = newNode(name, this.expression);
    addEdges(fromNode, toNodes);
    var childLevels = toNodes.map(n => n.level);
    fromNode.level = Math.max.apply(this, childLevels) + 1;
    return fromNode;
  };
  var quoteNode = function(expr) {
    if (exprs.isAtom(expr)) {
      return newNode(expr.value, this.expression);
    } else {
      var childNode = exprs.evaluate(expr, env);
      var createNode = innerNode('quote').bind(this);
      return createNode(childNode);
    }
  };
  var env = {
    quote: quoteNode,
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
  exprs.evaluate(rootExpr, env);
  return graph;
};

var config = {
  layout: {
    hierarchical: {
      direction: 'DU',
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
