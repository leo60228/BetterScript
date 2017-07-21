module.exports = function(acorn) {
  let orig = acorn.tokTypes;
  let tokTypes = orig;
  orig.typename = new acorn.TokenType('typename');
  return tokTypes;
}
