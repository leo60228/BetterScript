Error.stackTraceLimit = Infinity;

let acorn = require('acorn');
let escodegen = require('escodegen');
require('./src/parser')(acorn);

let options = {
  plugins: {
    BetterScript: true
  }
};
let code = require('fs').readFileSync('./parsertest.btrs');
let ast = acorn.parse(code, options);
let formattedAst = JSON.stringify(ast.body, null, 2)
let JScode = escodegen.generate(ast);

function decl(node) {
  console.error(node.id.name, node.variableType);
}

require('acorn/dist/walk').simple(ast, {
  VariableDeclarator: decl
});

console.log(JScode);
