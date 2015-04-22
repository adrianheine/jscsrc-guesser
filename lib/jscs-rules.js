'use strict';

const fs = require('fs');
const Promise = require('es6-promise').Promise;

const keywords = [ 'do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 'enum',
  'eval', 'null', 'this', 'true', 'void', 'with', 'await', 'break', 'catch', 'class', 'const',
  'false', 'super', 'throw', 'while', 'yield', 'delete', 'export', 'import', 'public', 'return',
  'static', 'switch', 'typeof', 'default', 'extends', 'finally', 'package', 'private', 'continue',
  'debugger', 'function', 'arguments', 'interface', 'protected', 'implements', 'instanceof'
];

const functionSpace = {
  beforeOpeningRoundBrace: true,
  beforeOpeningCurlyBrace: true
};

const valueForRule = {
  disallowImplicitTypeConversion: [
    'numeric', 'boolean', 'binary', 'string'
  ],
  disallowKeywordsOnNewLine: keywords,
  requireKeywordsOnNewLine: keywords,
  disallowKeywords: keywords,

  disallowSpacesInAnonymousFunctionExpression: functionSpace,
  disallowSpacesInFunctionDeclaration: functionSpace,
  disallowSpacesInFunctionExpression: functionSpace,
  disallowSpacesInFunction: functionSpace,
  disallowSpacesInNamedFunctionExpression: functionSpace,
  requireSpacesInAnonymousFunctionExpression: functionSpace,
  requireSpacesInFunctionDeclaration: functionSpace,
  requireSpacesInFunctionExpression: functionSpace,
  requireSpacesInFunction: functionSpace,
  requireSpacesInNamedFunctionExpression: functionSpace,
  validateJSDoc: {
    checkParamNames: true,
    checkRedundantParams: true,
    requireParamTypes: true
  },

  // FIXME: support multiple values or even a scale
  maximumLineLength: 100,
  // FIXME: support multiple values
  requireAlignedObjectValues: 'all', // ignoreFunction, ignoreLineBreak
  // FIXME: support multiple values
  requireSpacesInsideArrayBrackets: 'all', // { allExcept: ['[', ']', '{', '}']
  // FIXME: support multiple values
  requireSpacesInsideObjectBrackets: 'all', // { allExcept: ['[', ']', '{', '}']
  // FIXME: support multiple values
  requireSpacesInsideParentheses: 'all', // some object, difficult rules :),
  safeContextKeyword: [ '_this', 'self' ], // FIXME: gnargh
  // FIXME: support multiple values or even a scale and then there is this includeEmptyLines option
  validateIndentation: 2, // \t { value: 2, includeEmptyLines: true }
  // FIXME: support multiple values
  validateLineBreaks: 'CRLF', // LF, CR
  // FIXME: support multiple values
  validateParameterSeparator: ', ', // Or anything else with comma and space
};

const uncheckedRules = [
  'disallowIdentifierNames'
];

// FIXME: require.resolve
const base = './node_modules/jscs/lib/rules/';

module.exports = function () {
  return new Promise(function (resolve, reject) {
    fs.readdir(base, function (err, files) {
      const ruleNames = files.map(function (fileName, i) {
        return require('jscs/lib/rules/' + fileName).prototype.getOptionName();
      });
      const rules = ruleNames.reduce(function (rules, ruleName, i) {
        const v = valueForRule[ruleName] || true;
        if (typeof v.forEach === 'function') {
          v.forEach(function (value) {
            rules.push({
              ruleName: ruleName,
              value: [ value ]
            });
          });
        } else if (typeof v === 'object') {
          Object.keys(v).forEach(function (key) {
            const value = {};
            value[key] = v[key];
            rules.push({
              ruleName: ruleName,
              value: value
            });
          });
        } else if (uncheckedRules.indexOf(ruleName) === -1) {
          rules.push({
            ruleName: ruleName,
            value: v
          });
        }
        return rules;
      }, []);
      resolve(rules);
    });
  });
};
