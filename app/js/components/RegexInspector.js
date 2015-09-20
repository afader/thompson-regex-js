var React = require('react');
var Bootstrap = require('react-bootstrap');
var ExpressionViewer = require('./ExpressionViewer.js');
var NfaViewer = require('./NfaViewer.js');
var ProgramViewer = require('./ProgramViewer.js');
var Figure = require('./Figure.js');
var RegexInput = require('./RegexInput.js');
var CharRegex = require('../../../lib/CharRegex.js');

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
    var regex = new CharRegex(this.state.input);
    var exprView = <ExpressionViewer regex={regex}/>;
    return (
      <Bootstrap.Grid>
	<Bootstrap.Row>
	  <Bootstrap.Col md={12} lg={12} sm={12} xs={12}>
	    <RegexInput value={this.state.input} onSubmit={this.handleSubmit}/>
	  </Bootstrap.Col>
	</Bootstrap.Row>
	<Bootstrap.Row>
	  <Bootstrap.Col md={6} lg={6} sm={6} xs={6}>
	    <Figure caption="The Expression!" content={exprView}/>
	  </Bootstrap.Col>
	</Bootstrap.Row>
      </Bootstrap.Grid>
    );
  }
});
module.exports = RegexInspector;
