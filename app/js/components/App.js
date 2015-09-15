var React = require('react');
var Bootstrap = require('react-bootstrap');
var RegexInspector = require('./RegexInspector.js');

var App = React.createClass({
  render: function() {
    return (
      <Bootstrap.Grid>
	<Bootstrap.Row>
	  <Bootstrap.Col>
	    <h2>Thompson NFA Construction</h2>
	  </Bootstrap.Col>
	</Bootstrap.Row>
	<Bootstrap.Row>
	  <p>
	    This is a visualization of a regular expression parser and compiler.
	    Enter a regular expression over the 
	    symbols <tt>a</tt> and <tt>b</tt> and hit enter. To the left you 
	    will see the parse of the input regular expression. To the right 
	    you will see the automaton of the regular expression that can be 
	    used to match strings of <tt>a</tt> and <tt>b</tt> symbols. You 
	    can scroll and drag the visualizations to see them in more detail.
	  </p>
	</Bootstrap.Row>
	<Bootstrap.Row>
	  <Bootstrap.Col>
	    <RegexInspector/>
	  </Bootstrap.Col>
	</Bootstrap.Row>
      </Bootstrap.Grid>
    );
  }
});
module.exports = App;
