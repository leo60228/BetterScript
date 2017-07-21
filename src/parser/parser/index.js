let walker = require('acorn/dist/walk');

module.exports = function(acorn, nextMethod, isFunction) {
  let tokenTypes = require('../tokentypes')(acorn);
  let tt = tokenTypes;

  return {
    parseVarStatement: function(node, kind) {
      this.next();
      let typename = this.value;
      let type = this.value.split(':')[0];
      let name = this.value.split(':')[1];
      this.next();
      this.finishToken(tt.name, name);

      this.parseVar(node, false, kind);

      for (let e of node.declarations) {
        e.variableType = type;
        e.init = this.parseMaybeAssign();
        this.eat(tt.semi);
      }

      return this.finishNode(node, "VariableDeclaration");
    },
    parseBindingAtom: function() {
      return nextMethod.call(this);
    },
    parseBindingList: function(close, allowEmpty, allowTrailingComma, allowNonIdent) {
      let elts = [],
        first = true
      while (!this.eat(close)) {
        console.log(this.type);
        if (first || this.type.label === 'typename') first = false
        else this.expect(tt.comma)
        if (allowEmpty && this.type === tt.comma) {
          elts.push(null)
        } else if (allowTrailingComma && this.afterTrailingComma(close)) {
          break
        } else if (this.type === tt.ellipsis) {
          let rest = this.parseRest(allowNonIdent)
          this.parseBindingListItem(rest)
          elts.push(rest)
          if (this.type === tt.comma) this.raise(this.start, "Comma is not permitted after the rest element")
          this.expect(close)
          break
        } else if (this.type.label === 'typename') {
          let typenamearr = this.value.split(':');

          let type = typenamearr[0];
          let name = typenamearr[1];

          this.next();

          console.log(type, name, this.type);

          this.finishToken(tt.name, name);

          let elem = this.parseMaybeDefault(this.start, this.startLoc)
          this.parseBindingListItem(elem)
          elts.push(elem)
          first = true;
          isFunction.real = false;
        } else {
          let elem = this.parseMaybeDefault(this.start, this.startLoc)
          this.parseBindingListItem(elem)
          elts.push(elem)
        }
      }
      return elts
    }
  }
}
