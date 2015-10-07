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
	  <InteractiveExpression regex='a+b+'/>
	  <p>The second visualization is the NFA view of regular expressions.
	  This visualizes the semantics of a regular expression as a graph.
	  A string that matches the regular expression can be mapped to a path
	  through the graph starting at the start node and ending at the 
	  final bolded node.</p>
	  <InteractiveNfa regex='a+b+'/>
	  <p>The third visualization is the machine code view of regular 
	  expressions. This visualizes the semantics of a regular expression as
	  a sequence of instructions. A string that matches the regular 
	  expression can be mapped to an execution path through the machine 
	  code, terminating at the match instruction.</p>
	  <InteractiveProgram regex='a+b+'/>
	</Bootstrap.Col>
      </Bootstrap.Grid>
    );
  }
});
module.exports = App;
