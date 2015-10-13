var React = require('react');
var Bootstrap = require('react-bootstrap');
var Input = Bootstrap.Input;
var Figure = require('./Figure.js');

var wrapInteractiveFigure = function(Component, propName) {
  return React.createClass({
    getInitialState: function() {
      return { value: this.props[propName] };
    },
    componentDidMount: function() {
      this.setState({value: this.props.defaultValue });
    },
    setChildState: function(val) {
      var state = this.state;
      state[propName] = val;
      this.setState(state);
    },
    getInputValue: function() {
      var node = React.findDOMNode(this.refs.input);
      var val = node.getElementsByTagName('input')[0].value
      return val;
    },
    handleSubmit: function(e) {
      e.preventDefault();
      this.setChildState(this.getInputValue());
    },
    render: function() {
      var caption = this.props.caption;
      var captionComponent;
      var input = <Input ref="input" type="text" defaultValue={this.state.value}/>;
      var button = <Bootstrap.Button onClick={this.handleSubmit}>Submit</Bootstrap.Button>;
      input = React.cloneElement(input, {buttonAfter: button});
      if (caption) {
        captionComponent = <div className="caption">{caption}</div>;
      }
      return (
	<Figure>
	  <form onSubmit={this.handleSubmit}>{input}</form>
	  <Component {...this.props} {...this.state} />
	</Figure>
      );
    }
  });
};

module.exports = wrapInteractiveFigure;
