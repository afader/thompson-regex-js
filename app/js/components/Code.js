var React = require('react');
module.exports = React.createClass({
  render: function() {
    return <span className="code">{this.props.children}</span>;
  }
});
