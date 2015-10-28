var makeVec = (x, y) => ({ x, y });
var addVecs = (u, v) => makeVec(u.x + v.x, u.y + v.y);
var scaleVec = (c, v) => makeVec(c * v.x, c * v.y);
var subVecs = (u, v) => addVecs(u, scaleVec(-1, v));
var squared = c => c * c;
var sqrt = Math.sqrt;
var vecLength = v => sqrt(squared(v.x) + squared(v.y));
var zero = makeVec(0, 0);
var unitX = makeVec(1, 0);
var unitY = makeVec(0, 1);

var makeFrame = (origin, horiz, vert) => ({ origin, horiz, vert });

var frameCoordMap = frame => function(vec) {
  var x = scaleVec(vec.x, frame.horiz);
  var y = scaleVec(vec.y, frame.vert);
  return addVecs(frame.origin, addVecs(x, y));
};

var transformPainter = (painter, origin, horiz, vert) => function(frame) {
  var m = frameCoordMap(frame);
  var newOrigin = m(origin);
  var newHoriz = subVecs(m(horiz), frame.origin);
  var newVert = subVecs(m(vert), frame.origin);
  var newFrame = makeFrame(newOrigin, newHoriz, newVert);
  return painter(newFrame);
};

var over = (...painters) => frame => painters.forEach(p => p(frame));

var rotate90 = painter => transformPainter(painter, makeVec(0, 1), makeVec(0, -1), makeVec(1, 0));

var squashLeft = (painter, frac) => transformPainter(painter, zero, scaleVec(frac, unitX), unitY);
var squashRight = function(painter, frac) {
  var newOrigin = scaleVec(frac, unitX);
  var newHoriz = subVecs(unitX, newOrigin);
  return transformPainter(painter, newOrigin, newHoriz, unitY);
};
var iterFrac = frac => (1 - 2 * frac) / (1 - frac);
var squashCenterH = (p, frac) => squashRight(squashLeft(p, iterFrac(frac)), frac);
var beside = (p1, p2, frac) => frame => over(squashLeft(p1, frac), squashRight(p2, frac));

var squashDown = (painter, frac) => transformPainter(painter, zero, unitX, scaleVec(frac, unitY));
var squashUp = function(painter, frac) {
  var newOrigin = scaleVec(frac, unitY);
  var newVert = subVecs(unitY, newOrigin);
  return transformPainter(painter, newOrigin, unitX, newVert);
};
var squashCenterV = (p, frac) => squashUp(squashDown(p, iterFrac(frac)), frac);
var above = (p1, p2, frac) => frame => over(squashUp(p1, frac), squashDown(p2, frac));

var squashCenter = (p, fracH, fracV) => squashCenterH(squashCenterV(p, fracV), fracH);

var shift = (painter, vec) => function(frame) {
  var newOrigin = addVecs(frame.origin, vec);
  return painter(makeFrame(newOrigin, frame.horiz, frame.vert));
};

var frameAspect = frame => vecLength(frame.horiz) / vecLength(frame.vert);
var aspect = (painter, frac) => function(frame) {
  var relFrac = frac / frameAspect(frame);
  var newPainter = relFrac < 1 ? squashLeft(painter, relFrac) : squashDown(painter, 1 / relFrac);
  return newPainter(frame);
};
var centerAspect = (painter, frac) => function(frame) {
  var relFrac = frac / frameFrac(frame);
  var scaled = aspect(painter, frac);
  var horizGap = 1 - relFrac;
  var vertGap = 1 - 1 / relFrac;
  var offset = relFrac < 1 ? scaleVec(horizGap / 2, unitX) : scaleVec(vertGap / 2, unitY);
  var shifted = shift(painter, offset);
  return shifted(frame);
};

var blank = function(frame) { };

module.exports = { over, makeFrame, beside, above, shift, aspect, makeVec, centerAspect,
  frameCoordMap, squashUp, squashDown, squashLeft, squashRight, blank, squashCenterH, rotate90,
  squashCenter };
