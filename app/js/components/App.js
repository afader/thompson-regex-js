var React = require('react');
var Bootstrap = require('react-bootstrap');
var InteractiveExpression = require('./InteractiveExpression.js');
var InteractiveNfa = require('./InteractiveNfa.js');


var App = React.createClass({
  render: function() {
    return (
      <Bootstrap.Grid>
	<Bootstrap.Col lg={6} md={6} sm={12} xs={12}>
	  <h1>Visualizing Regular Expressions</h1>
	  <InteractiveExpression regex='a+b+'/>
	  <InteractiveNfa regex='a+b+'/>
	</Bootstrap.Col>
      </Bootstrap.Grid>
    );
  }
});
module.exports = App;
