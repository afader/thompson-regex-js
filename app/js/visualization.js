var config = {};
config.expression = {
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
      border: 'white',
      background: 'white'
    },
  },
  interaction: {
    dragNodes: false,
    dragView: false,
    selectable: false
  }
};

var expressionGraph = function(rootExpr) {
  var nextId = 0;
  var makeNode = function(expr, level) {
    var label = expr.type == 'predicate' ? expr.data.name : expr.type;
    return {
      id: nextId++,
      label: label,
      expr: expr,
      level: level
    };
  };
  var rootNode = makeNode(rootExpr, 0);
  var nodes = [rootNode];
  var edges = [];
  var frontier = [rootNode];
  while (frontier.length > 0) {
    var previous = frontier.pop();
    previous.expr.children.map(function(expr) {
      var next = makeNode(expr, previous.level + 1);
      var edge = {from: previous.id, to: next.id};
      nodes.push(next);
      edges.push(edge);
      frontier.push(next);
    });
  };
  return {nodes: nodes, edges: edges};
};
module.exports = {
  expressionGraph: expressionGraph,
  config: config
};
