var fromObject = function(obj) {
  return function(symbol) {
    if (symbol in obj) {
      return obj[symbol];
    } else {
      throw 'Unknown symbol: "' + symbol + '"';
    }
  };
};

module.exports = {
  fromObject: fromObject
};
