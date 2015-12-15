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

const esprimaNodeTypes = [ 'AssignmentExpression', 'AssignmentPattern', 'ArrayExpression',
  'ArrayPattern', 'ArrowFunctionExpression', 'BlockStatement', 'BinaryExpression', 'BreakStatement',
  'CallExpression', 'CatchClause', 'ClassBody', 'ClassDeclaration', 'ClassExpression',
  'ConditionalExpression', 'ContinueStatement', 'DoWhileStatement', 'DebuggerStatement',
  'EmptyStatement', 'ExportAllDeclaration', 'ExportDefaultDeclaration', 'ExportNamedDeclaration',
  'ExportSpecifier', 'ExpressionStatement', 'ForStatement', 'ForInStatement', 'FunctionDeclaration',
  'FunctionExpression', 'Identifier', 'IfStatement', 'ImportDeclaration', 'ImportDefaultSpecifier',
  'ImportNamespaceSpecifier', 'ImportSpecifier', 'Literal', 'LabeledStatement', 'LogicalExpression',
  'MemberExpression', 'MethodDefinition', 'NewExpression', 'ObjectExpression', 'ObjectPattern',
  'Program', 'Property', 'RestElement', 'ReturnStatement', 'SequenceExpression', 'SpreadElement',
  'Super', 'SwitchCase', 'SwitchStatement', 'TaggedTemplateExpression', 'TemplateElement',
  'TemplateLiteral', 'ThisExpression', 'ThrowStatement', 'TryStatement', 'UnaryExpression',
  'UpdateExpression', 'VariableDeclaration', 'VariableDeclarator', 'WhileStatement', 'WithStatement'
];

const yodaConditions = [ '==', '===', '!=', '!==' ];

const valueForRule = {
  disallowNodeTypes: esprimaNodeTypes,
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

  // FIXME: support multiple values
  requireSpacesInsideArrayBrackets: 'all', // { allExcept: ['[', ']', '{', '}']
  // FIXME: support multiple values
  requireSpacesInsideObjectBrackets: 'all', // { allExcept: ['[', ']', '{', '}']
  // FIXME: support multiple values
  requireSpacesInsideParentheses: 'all', // Some object, difficult rules :),
  safeContextKeyword: [ '_this', 'self' ], // FIXME: gnargh

  requireYodaConditions: yodaConditions, // FIXME: or true
  disallowYodaConditions: yodaConditions // FIXME: or true
};

const Rule = require('./Rule');

const spacesInsideParenthesizedExpressionValues = new Rule.AlternativeRuleValues([
  new Rule.SetRuleValues([true]),
  new Rule.ObjectRuleValues([
    {
      property: 'allExcept',
      values: new Rule.ArrNonEmptySubsetRuleValues(['{', '}', 'function'])
    },
  ])
]);

const spacesInsideParenthesizedExpressionValuesReducer = function (values) {
  return values.reduce(function (result, value) {
    if (value === true || result === true) {
      return true;
    }
    result.allExcept = result.allExcept.reduce(function (res, v) {
      if (value.allExcept.indexOf(v) !== -1) {
        res.push(v);
      }
      return res;
    }, []);
    return result;
  }, {
    allExcept: ['{', '}', 'function']
  });
};

const rules = {

  requireSpacesInsideParenthesizedExpression:
    new Rule('requireSpacesInsideParenthesizedExpression',
    spacesInsideParenthesizedExpressionValues,
    spacesInsideParenthesizedExpressionValuesReducer
  ),

  disallowSpacesInsideParenthesizedExpression:
    new Rule('disallowSpacesInsideParenthesizedExpression',
    spacesInsideParenthesizedExpressionValues,
    spacesInsideParenthesizedExpressionValuesReducer
  ),

  disallowEmptyBlocks: new Rule('disallowEmptyBlocks',
    new Rule.SetRuleValues([true, {allExcept: ['comments']}]),
    Rule.getValuePreferringReducer(true)
  ),

  validateCommentPosition: require('./validate-comment-position'),

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

  requireDollarBeforejQueryAssignment: new Rule('requireDollarBeforejQueryAssignment',
    new Rule.SetRuleValues([true, 'ignoreProperties']),
    Rule.getValuePreferringReducer(true)
  ),

  requirePaddingNewLinesAfterBlocks: new Rule('requirePaddingNewLinesAfterBlocks',
    new Rule.AlternativeRuleValues([
      new Rule.SetRuleValues([true]),
      new Rule.ObjectRuleValues([
        {
          property: 'allExcept',
          values: new Rule.ArrNonEmptySubsetRuleValues([
            'inCallExpressions',
            'inArrayExpressions',
            'inNewExpressions',
            'inProperties'
          ])
        },
      ])
    ]),
    function (values) {
      return values.reduce(function (result, value) {
        if (value === true || result === true) {
          return true;
        }
        result.allExcept = result.allExcept.reduce(function (res, v) {
          if (value.allExcept.indexOf(v) !== -1) {
            res.push(v);
          }
          return res;
        }, []);
        return result;
      }, {
        allExcept: [
          'inCallExpressions',
          'inArrayExpressions',
          'inProperties'
        ]
      });
    }
  ),

  requireAnonymousFunctions: new Rule('requireAnonymousFunctions',
    new Rule.SetRuleValues([true, {allExcept: ['declarations']}]),
    Rule.getValuePreferringReducer(true)
  ),

  requireBlocksOnNewline: new Rule('requireBlocksOnNewline',
    new Rule.AlternativeRuleValues([
      // FIXME: There are more possible integer values
      new Rule.SetRuleValues([true, 1, 2, 3, 4, 5]),
      new Rule.ObjectRuleValues([
        {
          property: 'includeComments',
          values: new Rule.SetRuleValues([true])
        },
        {
          property: 'minLines',
          values: new Rule.SetRuleValues([0, 1, 2, 3, 4, 5])
        }
      ])
    ]),
    function (values) {
      const internalConfig = values.reduce(function (result, value) {
        if (value === true) {
          result.minLines = 0;
        } else if (typeof value === 'number') {
          result.minLines = Math.min(value, result.minLines);
        } else {
          result.minLines = Math.min(value.minLines, result.minLines);
          result.includeComments = result.includeComments || value.includeComments;
        }
        return result;
      }, {
        minLines: null,
        includeComments: false
      });
      return internalConfig.includeComments ? internalConfig : (internalConfig.minLines || true);
    }
  ),

  requirePaddingNewLinesAfterUseStrict: new Rule('requirePaddingNewLinesAfterUseStrict',
    new Rule.SetRuleValues([true, {allExcept: ['require']}]),
    Rule.getValuePreferringReducer(true)
  ),

  requireSpaceBeforeBlockStatements: new Rule('requireSpaceBeforeBlockStatements',
    // FIXME: There are more possible values
    new Rule.SetRuleValues([1, 2, 3, 4, 5]),
    Rule.maximumValueReducer
  ),

  requireTemplateStrings: new Rule('requireTemplateStrings',
    new Rule.SetRuleValues([true, {allExcept: ['stringConcatenation']}]),
    Rule.getValuePreferringReducer(true)
  ),

  validateLineBreaks: new Rule('validateLineBreaks',
    new Rule.SetRuleValues(['CR', 'CRLF', 'LF']),
    Rule.onlyOneValueReducer
  ),

  validateOrderInObjectKeys: require('./validate-order-in-object-keys'),

  validateParameterSeparator: new Rule('validateParameterSeparator',
    // FIXME: Or anything else with comma and space
    new Rule.SetRuleValues([',', ' ,', ', ']),
    Rule.onlyOneValueReducer
  ),

  validateAlignedFunctionParameters: Rule.getHashRule('validateAlignedFunctionParameters',
    {
      lineBreakAfterOpeningBrace: true,
      lineBreakBeforeClosingBrace: true
    }
  ),

  validateNewlineAfterArrayElements: new Rule('validateNewlineAfterArrayElements',
    new Rule.ObjectRuleValues([
      // FIXME: There are more possible maxima
      {property: 'maximum', values: new Rule.SetRuleValues([2, 3, 4, 5, 6, 7, 8, 9, 10])},
      // FIXME: See https://github.com/jscs-dev/node-jscs/issues/1342
      // FIXME: {property: 'ignoreBrackets', values: new Rule.SetRuleValues([true, false])}
    ]),
    Rule.getObjectValueReducer([
      {property: 'maximum', reducer: Rule.minimumValueReducer},
      // FIXME: {property: 'ignoreBrackets', reducer: Rule.getValuePreferringReducer(false)}
    ])
  ),
};

Object.keys(valueForRule).forEach(function (ruleName) {
  const ruleValue = valueForRule[ruleName];
  if (typeof ruleValue.forEach === 'function') {
    rules[ruleName] = Rule.getArrayRule(ruleName, ruleValue);
  } else if (typeof ruleValue === 'object') {
    rules[ruleName] = Rule.getHashRule(ruleName, ruleValue);
  } else {
    rules[ruleName] = new Rule(ruleName,
      new Rule.SetRuleValues([ruleValue]),
      Rule.getValuePreferringReducer(ruleValue)
    );
  }
});

const uncheckedRules = [
  'disallowIdentifierNames',
  'jsDoc' // FIXME: This should be do-able
];

// FIXME: require.resolve
const base = __dirname + '/../../node_modules/jscs/lib/rules/';

module.exports = function () {
  return new Promise(function (resolve, reject) {
    fs.readdir(base, function (err, files) {
      if (err) {
        reject(err);
        return;
      }
      const ruleNames = files.map(function (fileName) {
        return require('jscs/lib/rules/' + fileName).prototype.getOptionName();
      });
      const availableRules = ruleNames.filter(function (ruleName) {
        return uncheckedRules.indexOf(ruleName) === -1;
      }).reduce(function (curRules, ruleName) {
        curRules[ruleName] = rules[ruleName] || Rule.getBoolRule(ruleName);
        return curRules;
      }, {});
      resolve(availableRules);
    });
  });
};
