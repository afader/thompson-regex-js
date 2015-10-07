var React = require('react');
var InteractiveFigure = require('./InteractiveFigure.js');
var ProgramViewer = require('./ProgramViewer.js');
module.exports = InteractiveFigure(ProgramViewer, 'regex');
