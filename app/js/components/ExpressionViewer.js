var React = require('react');
var Bootstrap = require('react-bootstrap');
var vis = require('vis');
var visualization = require('../visualization.js');
var ExpressionViewer = React.createClass({
  drawGraph: function() {
    var cont = React.findDOMNode(this.refs.container);
    var expr = this.props.expr;
    var data = visualization.expressionGraph(expr);
    this.net = new vis.Network(cont, data, visualization.config.expression);
  },
  componentDidMount: function() {
    this.drawGraph();
  },
  componentDidUpdate: function() {
    this.drawGraph();
  },
  render: function() {
    var input = this.props.expr.input;
    var header = "Expression Tree";
    return (
      <Bootstrap.Panel header={header}>
	<div key={input} ref="container" className="fill"></div>
      </Bootstrap.Panel>
    );
  }
});
module.exports = ExpressionViewer;
