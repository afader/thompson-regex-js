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
	  <Bootstrap.Col>
	    <RegexInspector/>
	  </Bootstrap.Col>
	</Bootstrap.Row>
      </Bootstrap.Grid>
    );
  }
});
module.exports = App;
