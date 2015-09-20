var React = require('react');
var ExpressionViewer = require('./ExpressionViewer.js');
var InteractiveFigure = require('./InteractiveFigure.js');
module.exports = InteractiveFigure(ExpressionViewer, 'regex');
