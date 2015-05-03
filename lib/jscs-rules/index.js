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

  // FIXME: support multiple values
  requireSpacesInsideArrayBrackets: 'all', // { allExcept: ['[', ']', '{', '}']
  // FIXME: support multiple values
  requireSpacesInsideObjectBrackets: 'all', // { allExcept: ['[', ']', '{', '}']
  // FIXME: support multiple values
  requireSpacesInsideParentheses: 'all', // Some object, difficult rules :),
  safeContextKeyword: [ '_this', 'self' ], // FIXME: gnargh
};

const Rule = require('./Rule');

const rules = {
  validateIndentation: new Rule('validateIndentation',
    new Rule.ObjectRuleValues([
      // FIXME: There are more possible values
      {property: 'value', values: new Rule.SetRuleValues(['\t', 1, 2, 3, 4])},
      {property: 'includeEmptyLines', values: new Rule.SetRuleValues([true, false])}
    ]),
    Rule.getObjectValueReducer([
      {property: 'value', reducer: Rule.onlyOneValueReducer},
      {property: 'includeEmptyLines', reducer: Rule.getValuePreferringReducer(true)}
    ])
  ),

  maximumNumberOfLines: new Rule('maximumNumberOfLines',
    // FIXME: There are more possible values
    new Rule.SetRuleValues([50, 100, 200, 500, 1000, 2000]),
    Rule.minimumValueReducer
  ),

  maximumLineLength: new Rule('maximumLineLength',
    // FIXME: There are more possible values
    new Rule.SetRuleValues([72, 75, 80, 90, 100, 120]),
    Rule.minimumValueReducer
  ),

  requireAlignedObjectValues: new Rule('requireAlignedObjectValues',
    new Rule.SetRuleValues(['all', 'ignoreFunction', 'ignoreLineBreak']),
    Rule.getValuePreferringReducer('all')
  ),

  validateLineBreaks: new Rule('validateLineBreaks',
    new Rule.SetRuleValues(['CR', 'CRLF', 'LF']),
    Rule.onlyOneValueReducer
  ),

  validateParameterSeparator: new Rule('validateParameterSeparator',
    // FIXME: Or anything else with comma and space
    new Rule.SetRuleValues([',', ' ,', ', ']),
    Rule.onlyOneValueReducer
  ),
};

Object.keys(valueForRule).forEach(function (ruleName) {
  const ruleValue = valueForRule[ruleName];
  if (typeof ruleValue.forEach === 'function') {
    rules[ruleName] = new Rule(ruleName, new Rule.ArrSubsetRuleValues(ruleValue));
  } else if (typeof ruleValue === 'object') {
    rules[ruleName] = new Rule(ruleName, new Rule.HashSubsetRuleValues(ruleValue));
  } else {
    rules[ruleName] = new Rule(ruleName, {
      getValues: function (ruleName) {
        return [{
          ruleName: ruleName,
          value: ruleValue
        }];
      }
    });
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
      const availableRules = ruleNames.filter(function (ruleName) {
        return uncheckedRules.indexOf(ruleName) === -1;
      }).reduce(function (curRules, ruleName, i) {
        curRules[ruleName] = rules[ruleName] || new Rule(ruleName, new Rule.BoolRuleValues());
        return curRules;
      }, {});
      resolve(availableRules);
    });
  });
};
