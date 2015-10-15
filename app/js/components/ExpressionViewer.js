var React = require('react');
var Bootstrap = require('react-bootstrap');
var vis = require('vis');
var visualization = require('../visualization/expression.js');
var CharRegex = require('../../../lib/CharRegex.js');
var ExpressionViewer = React.createClass({
  drawGraph: function() {
    var cont = React.findDOMNode(this.refs.container);
    var data = visualization.visGraph(this.regex.expression);
    var net = new vis.Network(cont, data, visualization.config);
    var parentHeight = React.findDOMNode(this).offsetHeight;
    net.setOptions({height: String(parentHeight)});
  },
  componentDidMount: function() {
    if (this.didCompile) this.drawGraph();
  },
  componentDidUpdate: function() {
    if (this.didCompile) this.drawGraph();
  },
  render: function() {
    try {
      this.regex = new CharRegex(this.props.regex);
      this.didCompile = true;
      return <div ref="container"></div>;
    } catch(err) {
      this.didCompile = false;
      console.log(err.stack);
      return <Bootstrap.Alert bsStyle="danger">{err.message}</Bootstrap.Alert>;
    }
  }
});
module.exports = ExpressionViewer;
