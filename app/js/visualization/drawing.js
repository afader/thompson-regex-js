var svgNs = 'http://www.w3.org/2000/svg';
var deepCopy = elt => elt.cloneNode(true);
var makeElement = function(name, attrs) {
  var elt = document.createElementNS(svgNs, name);
  addAttributes(elt, attrs);
  return elt;
};
var addAttributes = function(elt, attrs) {
  var attrs = attrs || {};
  Object.keys(attrs).forEach(attrName => elt.setAttribute(attrName, attrs[attrName]));
};
var getWidth = elt => parseFloat(elt.getAttribute('width'));
var getHeight = elt => parseFloat(elt.getAttribute('height'));
var translate = function(elt, vec) {
  var copy = deepCopy(elt);
  copy.setAttribute('transform', `translate(${vec.x}, ${vec.y})`);
  return copy;
}
var addClass = className => function(elt) { 
  var oldClass = elt.getAttribute('class') || '';
  var newClass = oldClass + ' ' + className;
  var copy = deepCopy(elt);
  copy.setAttribute('class', newClass);
  return copy;
}
var makeVector = (x, y) => ({ x, y });
var addVecs = (u, v) => makeVector(u.x + v.x, u.y + v.y);
var scaleVec = (a, v) => makeVector(a * v.x, a * v.y);
var subVecs = (u, v) => addVecs(u, scaleVec(-1, v));
var makeLine = function(from, to) {
  var line = makeElement('line', { x1: from.x, y1: from.y, x2: to.x, y2: to.y });
  return line;
};
var makeLabeledLine = function(from, to, label) {
  var line = makeLine(from, to);
  var midpoint = scaleVec(0.5, addVecs(to, from));
  var textAttrs = {
    x: midpoint.x,
    y: midpoint.y,
    'alignment-baseline': 'text-before-edge',
    'text-anchor': 'middle'
  };
  var text = makeElement('text', textAttrs);
  text.textContent = label;
  return makeGroup([text, line]);
};
var max = (a, b) => Math.max(a, b);
var min = (a, b) => Math.min(a, b);
var xAxis = point => point.x;
var yAxis = point => point.y;
var makePath = function(points, attrs) {
  if (points.length < 2) throw new Error('Need at least two points for a path');
  var path = makeElement('path', attrs);
  var head = points[0];
  var tail = points.slice(1);
  var start = `M${head.x} ${head.y}`;
  var rest = points.slice(1).map(point => `L${point.x} ${point.y}`).join(" ");
  var d = `${start} ${rest}`;
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  var width = points.map(xAxis).reduce(max);
  var height = points.map(yAxis).reduce(max);
  var group = makeGroup([path], { width, height });
  return group;
};
var makeGroup = function(elts, attrs) {
  var group = makeElement('g', attrs);
  var copies = elts.map(deepCopy);
  copies.forEach(elt => group.appendChild(elt));
  return group;
};
var makeDefs = function() {
  var defs = makeElement('defs');
  var arrowMarker = makeElement('marker', {
    markerWidth: 12,
    markerHeight: 12,
    refX: 6,
    refY: 4,
    orient: 'auto',
    id: 'marker-arrow'
  });
  var path = makeElement('path', {
    d: 'M 0 1 6 4 0 7 Z',
  });
  arrowMarker.appendChild(path);
  defs.appendChild(arrowMarker);
  return defs;
};
module.exports = { makeGroup, makeLine, makeLabeledLine, makePath, makeVector, getWidth, getHeight,
  translate, addClass, makeElement, addAttributes, makeDefs };
