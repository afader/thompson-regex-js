var React = require('react');
var Bootstrap = require('react-bootstrap');
var ExpressionViewer = require('./ExpressionViewer.js');
var NfaViewer = require('./NfaViewer.js');
var RegexInput = require('./RegexInput.js');
var nfa = require('../../../lib/nfa.js');
var predicates = require('../../../lib/predicates.js');
var parsers = require('../../../lib/parsers.js');

var env = {
  'a': predicates.equals('a'),
  'b': predicates.equals('b'),
  '.': predicates.alwaysTrue
};

var RegexInspector = React.createClass({
  getInitialState: function() {
    return {
      input: 'a(bb)+a'
    };
  },
  handleSubmit: function(value) {
    this.setState({input: value});
  },
  render: function() {
    var parsed = parsers.simpleCharRegex(this.state.input);
    var compiled = nfa.build(parsed.value, env);
    return (
      <Bootstrap.Grid>
	<Bootstrap.Row>
	  <Bootstrap.Col md={12} lg={12} sm={12} xs={12}>
	    <RegexInput value={this.state.input} onSubmit={this.handleSubmit}/>
	  </Bootstrap.Col>
	</Bootstrap.Row>
	<Bootstrap.Row>
	  <Bootstrap.Col md={6} lg={6} sm={6} xs={6}>
	    <ExpressionViewer expr={parsed.value}/>
	  </Bootstrap.Col>
	  <Bootstrap.Col md={6} lg={6} sm={6} xs={6}>
	    <NfaViewer nfa={compiled}/>
	  </Bootstrap.Col>
	</Bootstrap.Row>
      </Bootstrap.Grid>
    );
  }
});
module.exports = RegexInspector;
