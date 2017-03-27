/*global parserstart*/

let acorn = require('acorn');

let typeMaps = {};

acorn.plugins.BetterScript = function (parser) {
  let walker = require('acorn/dist/walk');
  let tokens = [];

  parser.extend("readToken", function (nextMethod) {
    return function readToken(code, varDecl = false) {
      if (acorn.isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */) {
        let word = this.readWord1();
        let type = acorn.tokTypes.name;
        if (this.keywords.test(word)) {
          if (this.containsEsc) {
            this.raiseRecoverable(parserstart, "Escape sequence in keyword " + word);
          }
          type = acorn.keywordTypes[word];
        }

        if (tokens.length === 0) {
          tokens.push(word);
          return this.finishToken(type, 'let');
        } else {
          tokens.push(word);
        };

        if (tokens.length === 2) {
          typeMaps[this.pos] = tokens[0];
        }

        return nextMethod.call(this, code);
      }

      tokens = [];

      return nextMethod.call(this, code);
    }
  });
  
  parser.extend('parse', function(nextMethod) {
    return function() {
      let program = nextMethod.call(this);
      //console.log(program);
      walker.simple(program, {
        Indentifier: function(node) {
          if (typeMaps.hasOwnProperty(node.end)) {
            node.type = typeMaps[node.end];
          }
        }
      });
      return program;
    }
  });
};

console.log(acorn.parse('String.a; Number num = 1; String str = "abc"; function func(){}', {plugins: {BetterScript: true}}).body[1].declarations)

console.log(typeMaps);
