var React = require('react');
var Bootstrap = require('react-bootstrap');
var InteractiveExpression = require('./InteractiveExpression.js');
var InteractiveNfa = require('./InteractiveNfa.js');
var InteractiveProgram = require('./InteractiveProgram.js');

var App = React.createClass({
  render: function() {
    return (
      <Bootstrap.Grid>
	<Bootstrap.Col lg={6} md={6} sm={12} xs={12}>
	  <h1>Visualizing Regular Expressions</h1>
	  <p>The first visualization is the parse tree view of regular 
	  expressions. This this visualizes the syntax of a regular expression
	  as a tree.</p>
	  <InteractiveExpression regex='a'/>
	  <p>Now a visualization of an NFA.</p>
	  <InteractiveNfa regex='a'/>
	</Bootstrap.Col>
      </Bootstrap.Grid>
    );
  }
});
module.exports = App;
