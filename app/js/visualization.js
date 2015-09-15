var config = {};
var noInteraction = {
  dragNodes: false,
  dragView: true,
  selectable: false
};
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
      border: 'black',
      background: 'white'
    },
  },
  interaction: noInteraction
};
config.nfa = {
  layout: {
    randomSeed: 2
  },
  edges: {
    arrows: 'to',
    color: 'grey',
    font: {
      align: 'horizontal'
    }
  },
  nodes: {
    color: {
      border: 'black',
      background: 'white'
    }
  },
  interaction: noInteraction
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

var nfaGraph = function(nfa) {
  var nodes = [{id: 'start', color: 'rgba(0,0,0,0)'}];
  var edges = [{from: 'start', to: '0', label: 'start', color: 'black'}];
  for (var i = 0; i < nfa.numStates; i++) {
    var thisId = String(i);
    var node = { id: thisId, label: thisId };
    if (i == nfa.finalState) {
      node.borderWidth = 5;
    }
    nodes.push(node);
    var trans = nfa.transitions[i];
    Object.keys(trans).forEach(function(target) {
      var nextId = String(target);
      var label = trans[target].name;
      edges.push({from: thisId, to: nextId, label: label});
    });
  }
  return {nodes: nodes, edges: edges};
};

module.exports = {
  expressionGraph: expressionGraph,
  config: config,
  nfaGraph: nfaGraph
};
