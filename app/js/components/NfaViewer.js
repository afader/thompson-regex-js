var React = require('react');
var Bootstrap = require('react-bootstrap');
var vis = require('vis');
var visualization = require('../visualization.js');
var NfaViewer = React.createClass({
  drawGraph: function() {
    var cont = React.findDOMNode(this.refs.container);
    var nfa = this.props.nfa;
    var data = visualization.nfaGraph(nfa);
    new vis.Network(cont, data, visualization.config.nfa);
  },
  componentDidMount: function() {
    this.drawGraph();
  },
  componentDidUpdate: function() {
    this.drawGraph();
  },
  render: function() {
    var header = "NFA";
    return (
      <Bootstrap.Panel header={header}>
	<div ref="container" className="fill"></div>
      </Bootstrap.Panel>
    );
  }
});
module.exports = NfaViewer;
