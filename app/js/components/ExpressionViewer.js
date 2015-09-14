var React = require('react');
var vis = require('vis');
var visualization = require('../visualization.js');
var ExpressionViewer = React.createClass({
  componentDidMount: function() {
    var container = this.getDOMNode();
    var expr = this.props.expr;
    var data = visualization.expressionGraph(expr);
    new vis.Network(container, data, visualization.config.expression);
  },
  render: function() {
    return <div className="expressionContainer"></div>;
  }
});
module.exports = ExpressionViewer;
