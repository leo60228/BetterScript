let acorn = require('acorn');

let typeMaps = {};

acorn.plugins.BetterScript = function (parser) {
  let tokens = [];

  parser.extend("readToken", function (nextMethod) {
    return function readToken(code, varDecl = false) {
      if (acorn.isIdentifierStart(code, parser.options.ecmaVersion >= 6) || code === 92 /* '\' */) {
        let word = parser.readWord1();
        let type = acorn.tokTypes.name;
        if (parser.keywords.test(word)) {
          if (parser.containsEsc) {
            parser.raiseRecoverable(parserstart, "Escape sequence in keyword " + word);
          }
          type = acorn.keywordTypes[word];
        }

        if (tokens.length === 0) {
          tokens.push(word);
          return parser.finishToken(type, 'let');
        } else {
          tokens.push(word);
        };

        if (tokens.length === 2) {
          typeMaps[parser.pos] = tokens[0];
        }

        return parser.finishToken(type, word);
      }

      tokens = [];

      return parser.getTokenFromCode(code);
    }
  })
};

console.log(acorn.parse('String.a; Number num = 1; String str = "abc"; function func(){}', {plugins: {BetterScript: true}}).body[1].declarations)

console.log(typeMaps);
