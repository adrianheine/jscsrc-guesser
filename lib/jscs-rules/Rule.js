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

const merge = require('./merge');

function Rule (name, values, reducer) {
  this.getValues = function () {
    return values.getValues(name);
  };
  this.reduceValues = function (ruleValues) {
    return reducer ? reducer(name, ruleValues) : merge(ruleValues)[name];
  };
}

function SetRuleValues (set) {
  this.getValues = function (ruleName) {
    return set.map(function (value) {
      return {
        ruleName: ruleName,
        value: value
      };
    });
  };
}

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

function BoolRuleValues () {
  this.getValues = function (ruleName) {
    return [{
      ruleName: ruleName,
      value: true
    }];
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

function allPreferringValueReducer (ruleName, ruleValues) {
  return ruleValues.reduce(function (curResult, ruleValue) {
    if (curResult === 'all' || ruleValue[ruleName] === 'all') {
      return 'all';
    }
    return ruleValue[ruleName];
  }, null);
}

function onlyOneValueReducer (ruleName, ruleValues) {
  if (ruleValues.length !== 1) {
    return null;
  }
  return ruleValues[0][ruleName];
}

function minimumValueReducer (ruleName, ruleValues) {
  return Math.min.apply(Math, ruleValues.map(function (curRuleValue) {
    return curRuleValue[ruleName];
  }));
}

module.exports = Rule;
Rule.SetRuleValues = SetRuleValues;
Rule.ArrSubsetRuleValues = ArrSubsetRuleValues;
Rule.HashSubsetRuleValues = HashSubsetRuleValues;
Rule.BoolRuleValues = BoolRuleValues;
Rule.allPreferringValueReducer = allPreferringValueReducer;
Rule.onlyOneValueReducer = onlyOneValueReducer;
Rule.minimumValueReducer = minimumValueReducer;
