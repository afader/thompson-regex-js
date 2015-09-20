var predicates = require('../predicates.js');
var env = function(symbol) {
  if (symbol == 'wildcard') {
    return predicates.alwaysTrue;
  } else {
    return predicates.equals(symbol);
  }
};
module.exports = env;
