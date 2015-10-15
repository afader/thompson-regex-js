var React = require('react');
var Bootstrap = require('react-bootstrap');
var vis = require('vis');
var x = require('../visualization/expression.js');
//delete x.config.layout;
var x = JSON.parse(JSON.stringify(x));
delete x.config.layout;
var CharRegex = require('../../../lib/CharRegex.js');
var NfaViewer = React.createClass({
  drawGraph: function() {
    var cont = React.findDOMNode(this.refs.container);
    var start = this.regex.nfa.start;
    var end = this.regex.nfa.end;
    this.regex.nfa.nodes.find(function(x) { return x.id == start }).color = 'red';
    this.regex.nfa.nodes.find(function(x) { return x.id == end }).color = 'blue';
    var net = new vis.Network(cont, this.regex.nfa, x.config);
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
      return <Bootstrap.Alert bsStyle="danger">{err.message}</Bootstrap.Alert>;
    }
  }
});
module.exports = NfaViewer;
