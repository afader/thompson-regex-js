var React = require('react');
var Bootstrap = require('react-bootstrap');
var CharRegex = require('../../../lib/CharRegex.js');
var RegexTextBox = React.createClass({
  getInitialState: function() {
    return { value: this.props.initial };
  },
  handleChange: function(e) {
    this.setState({value: e.target.value});
  },
  render: function() {
    var pattern = this.props.pattern;
    var regex = new CharRegex(pattern);
    var value = this.state.value;
    var matches = regex.match(value);
    var style = matches ? 'success' : 'error';
    return <Bootstrap.Input type='text' onChange={this.handleChange} value={this.state.value} bsStyle={style} hasFeedback/>
  }
});
module.exports = RegexTextBox;
