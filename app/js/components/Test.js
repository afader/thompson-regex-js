var React = require('react');
var CharRegex = require('../../../lib/CharRegex.js');
var exprs = require('../../../lib/exprs.js');
var predexprs = require('../../../lib/predexprs.js');
var drawing = require('../visualization/drawing.js');
var getWidth = drawing.getWidth;
var getHeight = drawing.getHeight;
var makeVector = drawing.makeVector;
var translate = drawing.translate;
var makeGroup = drawing.makeGroup;
var makeLine = drawing.makeLine;
var makePath = drawing.makePath;
var makeDefs = drawing.makeDefs;
var addClass = drawing.addClass;
var arrowed = addClass('arrow');

var sizes = {
  predWidth: 60,
  predHeight: 60,
  operatorPad: 30,
  altPad: 0
};

var pred = function(expr) {
  var width = sizes.predWidth;
  var height = sizes.predHeight;
  var from = drawing.makeVector(0, height / 2);
  var to = drawing.makeVector(width, height / 2);
  var label = predexprs.stringify(expr);
  var line = drawing.makeLabeledLine(from, to, label);
  drawing.addAttributes(line, { width, height });
  return line;
};

var max = (a, b) => Math.max(a, b);
var sum = (a, b) => a + b;
var beside = function(elt1, elt2) {
  var maxHeight = max(getHeight(elt1), getHeight(elt2));
  var translation1 = makeVector(0, (maxHeight - getHeight(elt1)) / 2);
  var translation2 = makeVector(getWidth(elt1), (maxHeight - getHeight(elt2)) / 2);
  var translated1 = translate(elt1, translation1);
  var translated2 = translate(elt2, translation2);
  var totalWidth = getWidth(translated1) + getWidth(translated2);
  var group = makeGroup([translated1, translated2], { width: totalWidth, height: maxHeight });
  return group;
};
var above = function(elt1, elt2) {
  var maxWidth = max(getWidth(elt1), getWidth(elt2));
  var totalHeight = getHeight(elt1) + getHeight(elt2);
  var translation = makeVector(0, drawing.getHeight(elt1));
  var translated = translate(elt2, translation);
  return makeGroup([elt1, translated], { width: maxWidth, height: totalHeight });
};

var concatenation = (...elts) => elts.reduce(beside);

var cumsum = function(array) {
  if (array.length == 0) return [];
  var result = [0];
  for (var i = 1; i < array.length; i++) {
    result[i] = result[i - 1] + array[i - 1]
  }
  return result;
};

var alternationGeometry = function(elts) {
  var pad = sizes.altPad;
  var heights = elts.map(getHeight);
  var widths = elts.map(getWidth);
  var totalHeight = heights.reduce(sum) + 2 * pad;
  var maxWidth = widths.reduce(max);
  var totalWidth = maxWidth + 2 * pad;
  var vertOffsets = cumsum(heights).map(x => x + pad);
  var vertMidpoints = vertOffsets.map((offset, i) => offset + heights[i] / 2);
  var eltInputs = vertMidpoints.map(midpoint => makeVector(pad, midpoint));
  var eltOutputs = vertMidpoints.map((midpoint, i) => makeVector(pad + widths[i], midpoint));
  var eltEndpoints = vertMidpoints.map(midpoint => makeVector(pad + maxWidth, midPoint));
  return { heights, widths, totalHeight, totalWidth, vertOffsets, vertMidpoints, eltInputs,
    eltOutputs, eltEndpoints };
};

function zip(arrays) {
    return arrays[0].map(function(_,i){
        return arrays.map(function(array){return array[i]})
    });
}

var alternationForks = function(elts) {
  var forkLines = [];
  var geo = alternationGeometry(elts);
  var lines = geo.
  for (var i = 0; i < n; i++) {
    var vertMidpoint = vertOffsets[i] + heights[i] / 2;
    var horizEndpoint = widths[i];
    var from = makeVector(horizEndpoint, vertMidpoint);
    var to = makeVector(maxWidth, vertMidpoint);
    var line = makeLine(from, to);
    forkLines.push(line);
  }
  return makeGroup(forkLines, { width: maxWidth, height: totalHeight });
};

var alternationBars = function(elts) {
  var n = elts.length;
  var heights = elts.map(getHeight);
  var widths = elts.map(getWidth);
  var maxWidth = widths.reduce(max);
  var totalHeight = heights.reduce(sum);
  var vertOffsets = cumsum(heights);
  var vertMidpoints = vertOffsets.map((offset, i) => offset + heights[i] / 2);
  var leftFrom = makeVector(0, vertMidpoints[0]);
  var leftTo = makeVector(0, vertMidpoints[n - 1]);
  var rightFrom = makeVector(maxWidth, vertMidpoints[0]);
  var rightTo = makeVector(maxWidth, vertMidpoints[n - 1]);
  var leftBar = makeLine(leftFrom, leftTo);
  var rightBar = makeLine(rightFrom, rightTo);
  return makeGroup([leftBar, rightBar], { width: maxWidth, height: totalHeight });
};

var alternation = function(...elts) {
  var stacked = elts.reduce(above);
  var forks = alternationForks(elts);
  var bars = alternationBars(elts);
  var width = getWidth(stacked);
  var height = getHeight(stacked);
  return makeGroup([stacked, forks, bars], { width, height });
};

var centerPad = function(elt, pad) {
  var translation = makeVector(pad, pad);
  var translated = translate(elt, translation);
  return translated;
};

var operatorGeometry = function(elt) {
  var pad = sizes.operatorPad;
  var totalWidth = getWidth(elt) + 2 * pad;
  var totalHeight = getHeight(elt) + 2 * pad;
  var vMidpoint= totalHeight / 2;
  return {
    input: makeVector(0, vMidpoint),
    output: makeVector(totalWidth, vMidpoint),
    eltInput: makeVector(pad, vMidpoint),
    eltOutput: makeVector(pad + getWidth(elt), vMidpoint),
    split: makeVector(pad / 2, vMidpoint),
    join: makeVector(totalWidth - pad / 2, vMidpoint),
    padUpperLeft: makeVector(pad / 2, pad),
    padUpperRight: makeVector(totalWidth - pad / 2, pad),
    width: totalWidth,
    height: totalHeight
  };
};

var centerForOperator = elt => translate(elt, makeVector(sizes.operatorPad, sizes.operatorPad));


var zeroOrOne = function(elt) {
  var centered = centerForOperator(elt);
  var op = operatorGeometry(elt);
  var path = makePath([op.split, op.padUpperLeft, op.padUpperRight, op.join]);
  var input = arrowed(makeLine(op.input, op.eltInput));
  var output = makeLine(op.eltOutput, op.output);
  var parts = [centered, path, input, output];
  return makeGroup(parts, { width: op.width, height: op.height });
};

var oneOrMore = function(elt) {
  var centered = centerForOperator(elt);
  var op = operatorGeometry(elt);
  var path = makePath([op.join, op.padUpperRight, op.padUpperLeft, op.split]);
  var input = makeLine(op.input, op.eltInput);
  var output = makeLine(op.eltOutput, op.output);
  var parts = [centered, path, input, output];
  return makeGroup(parts, { width: op.width, height: op.height });
};

var root = function(elt) {
  var width = 1000;
  var height = 1000;
  var svg = drawing.makeElement('svg', { width, height });
  svg.appendChild(makeDefs());
  svg.appendChild(elt);
  return svg;
};

var env = {
  predicate: pred,
  root: root,
  concatenation: concatenation,
  alternation: alternation,
  zeroOrOne: zeroOrOne
};

var Test = React.createClass({
  componentDidMount: function() {
    var pat = 'x(132|41|bb?|hix)y(a|b)?z';
    var regex = new CharRegex(pat);
    var result = exprs.evaluate(regex.expression, env);
    var container = React.findDOMNode(this.refs.container);
    container.appendChild(result);
  },
  render: function() {
    return <div ref="container"></div>;
  }
});
module.exports = Test;
