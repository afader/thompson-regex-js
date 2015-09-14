var React = require('react');
var ExpressionViewer = require('./ExpressionViewer.js');
var parsers = require('../../../lib/parsers.js');
var App = React.createClass({
  render: function() {
   var parsed = parsers.simpleCharRegex('(abc)|d+e?').value;
   return <ExpressionViewer expr={parsed}/>;
  }
});
module.exports = App;
