/**
 * Copyright 2015 Adrian Heine <mail@adrianheine.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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

const rulesValues = {
};

function ArrSubsetRuleValues (values) {
  this.getValues = function (ruleName) {
    return values.map(function (value) {
      return {
        ruleName: ruleName,
        value: [ value ]
      };
    });
  };
}

function HashSubsetRuleValues (values) {
  this.getValues = function (ruleName) {
    return Object.keys(values).map(function (key) {
      const value = {};
      value[key] = values[key];
      return {
        ruleName: ruleName,
        value: value
      };
    });
  };
}

Object.keys(valueForRule).forEach(function (ruleName) {
  const ruleValue = valueForRule[ruleName];
  if (typeof ruleValue.forEach === 'function') {
    rulesValues[ruleName] = new ArrSubsetRuleValues(ruleValue);
  } else if (typeof ruleValue === 'object') {
    rulesValues[ruleName] = new HashSubsetRuleValues(ruleValue);
  } else {
    rulesValues[ruleName] = {
      getValues: function (ruleName) {
        return [{
          ruleName: ruleName,
          value: ruleValue
        }];
      }
    };
  }
});

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
        const v = rulesValues[ruleName] || true;
        if (v === true) {
          if (uncheckedRules.indexOf(ruleName) === -1) {
            rules.push({
              ruleName: ruleName,
              value: v
            });
          }
        } else {
          rules = rules.concat(v.getValues(ruleName));
        }
        return rules;
      }, []);
      resolve(rules);
    });
  });
};
