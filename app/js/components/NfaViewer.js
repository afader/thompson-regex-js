var React = require('react');
var Bootstrap = require('react-bootstrap');
var vis = require('vis');
var visualization = require('../visualization/nfa.js');
var CharRegex = require('../../../lib/CharRegex.js');
var predexprs = require('../../../lib/predexprs.js');
var exprs = require('../../../lib/exprs.js');

var Pred = expr => React.createClass({
  width: 60,
  height: 60,
  render: function() {
    var w = this.width;
    var h = this.height;
    var text = <text x={w/2} y={h/2 - 5} textAnchor="middle" alignmentBaseline="text-before-edge">{predexprs.stringify(expr)}</text>;
    return (
      <g>
	{text}
	<line x1="0" y1={h/2} x2={w} y2={h/2} style={{stroke: 'black', strokeWidth: 1}}/>
      </g>
    );
  }
});
var Root = Component => React.createClass({
  render: function() {
    return (
      <svg width="200" height="200">
	<g>
	 <Component/>
	</g>
      </svg>
    );
  }
});
var Alternation = (...Components) => React.createClass({
  render: function() {
  }
});

var env = {
  predicate: Pred,
  root: Root,
  alternation: Alternation
};

var NfaViewer = React.createClass({
  render: function() {
    try {
      this.regex = new CharRegex(this.props.regex);
      this.didCompile = true;
      var Result = exprs.evaluate(this.regex.expression, env);
      return <div ref="container"><Result/></div>;
    } catch(err) {
      this.didCompile = false;
      return <Bootstrap.Alert bsStyle="danger">{err.message}</Bootstrap.Alert>;
    }
  }
});
module.exports = NfaViewer;
