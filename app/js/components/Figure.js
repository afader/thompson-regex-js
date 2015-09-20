var React = require('react');
var Bootstrap = require('react-bootstrap');
var Figure = React.createClass({
  render: function() {
    var caption = this.props.caption;
    var captionComponent;
    if (caption) {
      captionComponent = <div className="caption">{caption}</div>;
    }
    var content = this.props.children;
    return (
      <div className="figure">
	<Bootstrap.Panel className="figureBox">
	  {content}
	</Bootstrap.Panel>
	{captionComponent}
      </div>
    );
  }
});
module.exports = Figure;
