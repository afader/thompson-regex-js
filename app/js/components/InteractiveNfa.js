var React = require('react');
var InteractiveFigure = require('./InteractiveFigure.js');
var NfaViewer = require('./NfaViewer.js');
module.exports = InteractiveFigure(NfaViewer, 'regex');
