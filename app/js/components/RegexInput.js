var React = require('react');
var Bootstrap = require('react-bootstrap');
var RegexInput = React.createClass({
  getInitialState: function() {
    return {value: this.props.value};
  },
  handleSubmit: function(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.value);
  },
  handleChange: function(e) {
    this.setState({value: e.target.value});
  },
  render: function() {
    var button = <Bootstrap.Button>Inspect</Bootstrap.Button>;
    return (
      <form onSubmit={this.handleSubmit}>
	<Bootstrap.Input
	  type='text'
	  onChange={this.handleChange} 
	  placeholder='Enter a regular expression over symbols {a,b}'
	  value={this.state.value}
	  buttonAfter={button}/>
      </form>
    );
    return <h3>Input</h3>;
  }
});
module.exports = RegexInput;
