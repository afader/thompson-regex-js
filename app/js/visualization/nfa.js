var assign = require('object.assign').getPolyfill();
var visGraph = function(nfa) {
  var graph = assign({}, nfa);
  var emptyNode = { id: 'empty', color: 'rgba(0,0,0,0)' };
  graph.nodes.push(emptyNode);
  graph.edges.push({ from: emptyNode.id, to: graph.start, label: 'start' });
  graph.drawEndState = function(net) {
    return function(ctx) {
      var nodePosition = net.getPositions([graph.end]);
      var x = nodePosition[graph.end].x;
      var y = nodePosition[graph.end].y;
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.circle(x, y, 18);
      ctx.stroke();
    }
  };
  return graph;
};
var config = {
  layout: {
    randomSeed: 1,
    improvedLayout: true
  },
  edges: {
    arrows: 'to',
    color: 'black',
    smooth: true,
    font: {
      align: 'horizontal',
      background: 'white'
    }
  },
  nodes: {
    color: {
      border: 'black',
      background: 'white'
    }
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
