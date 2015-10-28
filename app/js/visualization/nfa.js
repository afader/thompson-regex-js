var assign = require('object.assign').getPolyfill();
var predexprs = require('../../../lib/predexprs.js');
var exprs = require('../../../lib/exprs.js');
var painters = require('../../../lib/painters.js');

var MutableGraph = function() {
  var nodes = this.nodes = [];
  var edges = this.edges = [];
  var id = 0;
  var nextId = () => id++;
  this.addNode = function() {
    var id = nextId();
    var node = { id };
    nodes.push(node);
    return node;
  };
  this.addEdge = function(from, to) {
    var id = nextId();
    var edge = { from, to, id };
    edges.push(edge);
    return edge;
  };
};

var GraphPainter = function() {
  var graph = new MutableGraph();
  var positionNode = function(node, vec, frame) {
    var m = painters.frameCoordMap(frame);
    var position = m(vec);
    node.x = position.x;
    node.y = position.y;
  };
  var paintNode = type => vec => function(frame) {
    var node = graph.addNode();
    positionNode(node, vec, frame);
    node.type = type;
  };
  var paintEdge = type => (fromVec, toVec, label) => function(frame) {
    var fromNode = graph.addNode();
    fromNode.type = 'joint';
    positionNode(fromNode, fromVec, frame);
    var toNode = graph.addNode();
    positionNode(toNode, toVec, frame);
    toNode.type = 'joint';
    var edge = graph.addEdge(fromNode.id, toNode.id);
    edge.type = type;
    edge.label = label;
  };
  var paint = this.paint = { };
  paint.stateNode = paintNode('state');
  paint.jointNode = paintNode('joint');
  paint.arrow = paintEdge('arrow');
  paint.segment = paintEdge('segment');
  paint.overlay = painters.over;
  paint.blank = painters.blank;
  paint.squashUp = painters.squashUp;
  paint.squashDown = painters.squashDown;
  paint.squashLeft = painters.squashLeft;
  paint.squashRight = painters.squashRight;
  this.paintGraph = function(painter, width, height) {
    var origin = painters.makeVec(0, 0);
    var horiz = painters.makeVec(width, 0);
    var vert = painters.makeVec(0, height);
    var frame = painters.makeFrame(origin, horiz, vert);
    painter(frame);
    return { nodes: graph.nodes, edges: graph.edges };
  };
};

var size = {
  predicateWidth: 40,
  predicateHeight: 40,
  alternationPad: 20,
  opPad: 20
};

var location = {
  center: painters.makeVec(0.5, 0.5),
  bottomCenter: painters.makeVec(0.5, 1),
  topCenter: painters.makeVec(0.5, 0),
  topLeft: painters.makeVec(0, 0),
  topRight: painters.makeVec(1, 0),
  bottomLeft: painters.makeVec(0, 1),
  bottomRight: painters.makeVec(1, 1),
  predicateMiddle: painters.makeVec(0.5, 0.2),
  bottom: x => painters.makeVec(x, 1),
  top: x => painters.makeVec(x, 0),
  left: y => painters.makeVec(0, y),
  right: y => painters.makeVec(1, y),
  centerHoriz: y => painters.makeVec(0.5, y),
  centerVert: x => painters.makeVec(x, 0.5),
  point: (x, y) => painters.makeVec(x, y)
};

var makeFragment = (painter, width, height) => ({ painter, width, height });
var fragBeside = function(frag1, frag2) {
  var totalWidth = frag1.width + frag2.width;
  var totalHeight = Math.max(frag1.height, frag2.height);
  var frac = frag1.width / totalWidth;
  var p1 = painters.squashLeft(frag1.painter, frac);
  var p2 = painters.squashRight(frag2.painter, frac);
  var both = painters.over(p1, p2);
  return makeFragment(both, totalWidth, totalHeight);
};
var fragAbove = function(frag1, frag2) {
  var totalHeight = frag1.height + frag2.height;
  var totalWidth = Math.max(frag1.width, frag2.width);
  var frac = frag1.height / totalHeight;
  var p1 = painters.squashDown(frag1.painter, frac);
  var p2 = painters.squashUp(frag2.painter, frac);
  var both = painters.over(p1, p2);
  return makeFragment(both, totalWidth, totalHeight);
};

var visGraph = function(rootExpr) {
  var graphPainter = new GraphPainter();
  var paint = graphPainter.paint;
  var makeFragment = (painter, width, height) => ({ painter, width, height });
  var env = {
    predicate: function(expr) {
      var label = predexprs.stringify(expr);
      var state = paint.stateNode(location.predicateMiddle);
      var arrow = paint.arrow(location.topCenter, location.predicateMiddle);
      var segment = paint.segment(location.predicateMiddle, location.bottomCenter, label);
      var parts = paint.overlay(arrow, segment);//state, segment);
      var result = makeFragment(parts, size.predicateWidth, size.predicateHeight);
      return result;
    },
    root: function(frag) {
      return makeFragment(painters.rotate90(frag.painter), frag.height, frag.width);
    },
    alternation: function(...frags) {
      var altFrag = frags.reduce(fragBeside);
      var first = frags[0];
      var last = frags[frags.length - 1];
      var firstCenter = first.width / 2 / altFrag.width;
      var lastCenter = 1 - last.width / 2 / altFrag.width;
      var topBar = paint.segment(location.bottom(firstCenter), location.bottom(lastCenter));
      var input = paint.segment(location.topCenter, location.bottomCenter);
      var split = paint.stateNode(location.bottomCenter);
      var top = paint.overlay(topBar, input);//, split);
      var bottomBar = paint.segment(location.top(firstCenter), location.top(lastCenter));
      var output = paint.segment(location.topCenter, location.bottomCenter);
      var bottom = paint.overlay(bottomBar, output);
      var topFrag = makeFragment(top, altFrag.width, size.alternationPad);
      var bottomFrag = makeFragment(bottom, altFrag.width, size.alternationPad);
      var frags = [topFrag, altFrag, bottomFrag];
      return frags.reduce(fragAbove);
    },
    zeroOrOne: function(frag) {
      var totalWidth = 2 * size.opPad + frag.width;
      var totalHeight = 2 * size.opPad + frag.height;
      var hRelPad = size.opPad / totalWidth;
      var vRelPad  = size.opPad / totalHeight;
      var splitPos = location.centerHoriz(vRelPad / 2);
      var joinPos = location.centerHoriz(1 - vRelPad / 2);
      var inputPos = location.centerHoriz(vRelPad);
      var outputPos = location.centerHoriz(1 - vRelPad);
      var turnDownPos = location.point(1 - hRelPad / 2, vRelPad / 2);
      var turnLeftPos = location.point(1 - hRelPad / 2, 1 - vRelPad / 2);
      var split = paint.stateNode(splitPos);
      var join = paint.stateNode(joinPos);
      var parts = paint.overlay(
	paint.segment(location.topCenter, splitPos),
	paint.segment(splitPos, inputPos),
	paint.segment(outputPos, joinPos),
	paint.segment(joinPos, location.bottomCenter),
	paint.segment(splitPos, turnDownPos),
	paint.segment(turnDownPos, turnLeftPos),
	paint.arrow(turnLeftPos, joinPos)
      );
      var centered = painters.squashCenter(frag.painter, hRelPad, vRelPad);
      var painter = paint.overlay(parts, centered);
      return makeFragment(painter, totalWidth, totalHeight);
    },
    oneOrMore: function(frag) {
      var totalWidth = 2 * size.opPad + frag.width;
      var totalHeight = 2 * size.opPad + frag.height;
      var hRelPad = size.opPad / totalWidth;
      var vRelPad  = size.opPad / totalHeight;
      var joinPos = location.centerHoriz(vRelPad / 2);
      var splitPos = location.centerHoriz(1 - vRelPad / 2);
      var inputPos = location.centerHoriz(vRelPad);
      var outputPos = location.centerHoriz(1 - vRelPad);
      var turnLeftPos = location.point(1 - hRelPad / 2, vRelPad / 2);
      var turnUpPos = location.point(1 - hRelPad / 2, 1 - vRelPad / 2);
      var parts = paint.overlay(
	paint.segment(location.topCenter, inputPos),
	paint.segment(outputPos, location.bottomCenter),
	paint.segment(splitPos, turnUpPos),
	paint.segment(turnUpPos, turnLeftPos),
	paint.arrow(turnLeftPos, joinPos)
      );
      var centered = painters.squashCenter(frag.painter, hRelPad, vRelPad);
      var painter = paint.overlay(parts, centered);
      return makeFragment(painter, totalWidth, totalHeight);
    },
    zeroOrMore: function(frag) {
      var totalWidth = 2 * size.opPad + frag.width;
      var totalHeight = 2 * size.opPad + frag.height;
      var hRelPad = size.opPad / totalWidth;
      var vRelPad  = size.opPad / totalHeight;
      var loopPos = location.centerHoriz(vRelPad / 2);
      var inputPos = location.centerHoriz(vRelPad);
      var outputPos = location.centerHoriz(1 - vRelPad);
      var loopPos1 = location.centerHoriz(1 - (2/3) * vRelPad);
      var loopPos2 = location.point(1 - hRelPad/2, 1 - (2/3) * vRelPad);
      var loopPos3 = location.point(1 - hRelPad/2, vRelPad / 2);
      var breakPos1 = location.point(hRelPad/2, vRelPad/2);
      var breakPos2 = location.point(hRelPad/2, 1 - vRelPad/3);
      var breakPos3 = location.centerHoriz(1 - vRelPad/3);
      var parts = paint.overlay(
	paint.segment(location.topCenter, inputPos),
	paint.segment(outputPos, loopPos1),
	paint.segment(loopPos1, loopPos2),
	paint.segment(loopPos2, loopPos3),
	paint.arrow(loopPos3, loopPos),
	paint.segment(loopPos, breakPos1),
	paint.segment(breakPos1, breakPos2),
	paint.segment(breakPos2, breakPos3),
	paint.segment(breakPos3, location.bottomCenter)
      );
      var centered = painters.squashCenter(frag.painter, hRelPad, vRelPad);
      var painter = paint.overlay(parts, centered);
      return makeFragment(painter, totalWidth, totalHeight);
    },
    concatenation: function(...frags) {
      var result = frags.reduce(fragAbove);
      return result;
    }
  };
  var rootFrag = exprs.evaluate(rootExpr, env);
  var graph = graphPainter.paintGraph(rootFrag.painter, rootFrag.width, rootFrag.height);
  return graph;
};

var config = {
  edges: { smooth: false, color: 'gray', font: {color: 'maroon', background: 'white'} },
  nodes: {
    color: { border: 'gray', background: 'white' },
    shape: 'dot',
    size: 2
  }
};
module.exports = {
  visGraph: visGraph,
  config: config
};
