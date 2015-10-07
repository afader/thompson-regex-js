var React = require('react');
var Bootstrap = require('react-bootstrap');
var CharRegex = require('../../../lib/CharRegex.js');

var render = {};
render.predicate = function(instr) {
  return 'equals ' + instr.name;
};
render.jump = function(instr, i) {
  var target = i + instr.increment;
  return 'jump to ' + target;
};
render.split = function(instr, i) {
  var target1 = i + 1;
  var target2 = i + instr.increment;
  return 'split to ' + target1 + ', ' + target2;
};
render.match = function(instr, i) {
  return 'match';
};

var ProgramViewer = React.createClass({
  renderRow: function(instr, i) {
    var string = render[instr.type](instr, i);
    return (
      <tr key={i}>
        <td>{i}</td>
        <td>{string}</td>
      </tr>
    );
  },
  render: function() {
    try {
      var regex = new CharRegex(this.props.regex);
      var rows = regex.program.map(this.renderRow);
      return (
	<div className="program">
      <Bootstrap.Table>
	<thead>
          <tr>
            <th>Program Counter</th>
            <th>Instruction</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Bootstrap.Table>
      </div>
      );
    } catch (err) {
      return <Bootstrap.Alert bsStyle="danger">{err}</Bootstrap.Alert>;
    }
  }
});
module.exports = ProgramViewer;
