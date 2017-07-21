module.exports = function(acorn) {
  acorn.plugins.BetterScript = function(parser) {
    let lexical = require('./tokenizer')
    let syntactic = require('./parser');
    let isFunction = {
      real: false
    };

    parser.extend("readToken", function(nextMethod) {
      return lexical(acorn, ...arguments, isFunction);
    });

    parser.extend('parseVarStatement', function(nextMethod) {
      return syntactic(acorn, ...arguments, isFunction).parseVarStatement;
    });

    parser.extend('parseBindingAtom', function(nextMethod) {
      return syntactic(acorn, ...arguments, isFunction).parseBindingAtom;
    });

    parser.extend('parseBindingList', function(nextMethod) {
      return syntactic(acorn, ...arguments, isFunction).parseBindingList;
    });
  };
}
