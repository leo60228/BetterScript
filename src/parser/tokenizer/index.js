module.exports = function(acorn, nextMethod, isFunction) {
  let tokens = [];
  let tokenTypes = require('../tokentypes')(acorn);

  return function(code) {
    let oldPosition = this.pos;

    console.log(isFunction.real, this.pos);

    if (acorn.isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */ ) {
      let word = this.readWord1();
      let type = acorn.tokTypes.name;
      if (this.keywords.test(word)) {
        if (this.containsEsc) {
          this.raiseRecoverable(this.start, "Escape sequence in keyword " + word);
        }
        type = acorn.keywordTypes[word];
      }

      if (tokens.length === 0 && isFunction.real) {
        tokens.push(word);
        return;
      } else if (word !== 'function' && tokens.length === 0 && this.fullCharCodeAtPos() === 32) {
        tokens.push(word);
        return this.finishToken(type, 'let');
      } else if (word === 'function') {
        tokens = [];
        isFunction.real = true;

        this.pos = oldPosition;

        return;
      } else if (tokens.length === 0) {
        let newWord = this.readWord();
        if (acorn.isIdentifierStart(this.fullCharCodeAtPos(), this.options.ecmaVersion >= 6)) {
          tokens.push(word);
        }
        this.pos = oldPosition;
      }
      tokens.push(word);

      this.pos = oldPosition;

      console.log(tokens);

      let ret = nextMethod.call(this, code);

      if (tokens.length === 2) {
        this.finishToken(tokenTypes.typename, `${tokens[0]}:${tokens[1]}`);
        console.log(this.type);

        if (isFunction.real) {
          return;
        }
      }

      return ret;
    }

    tokens = [];

    let ret = nextMethod.call(this, code);
    if (this.type !== tokenTypes.parenL && this.type !== tokenTypes.comma) isFunction.real = false;
    return ret;
  }
}
