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

Object.assign = require('object-assign');
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

function ObjectRuleValues (ruleValues) {
  ruleValues = ruleValues.map(function (ruleValue) {
    return ruleValue.values.getValues.bind(null, ruleValue.property);
  });
  this.getValues = function (ruleName) {
    function walk (ruleValuesIndex, prototype, result) {
      if (ruleValuesIndex === ruleValues.length) {
        result.push({
          ruleName: ruleName,
          value: prototype
        });
      } else {
        ruleValues[ruleValuesIndex]().forEach(function (value) {
          const res = Object.assign({}, prototype);
          res[value.ruleName] = value.value;
          walk(ruleValuesIndex + 1, res, result);
        });
      }
      return result;
    }
    return walk(0, {}, []);
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

function getObjectValueReducer (valueReducers) {
  return function (ruleName, ruleValues) {
    const unpackedValues = ruleValues.map(function (ruleValue) {
      return ruleValue[ruleName];
    });
    return valueReducers.reduce(function (result, valueReducer) {
      result[valueReducer.property] = valueReducer.reducer(valueReducer.property, unpackedValues);
      return result;
    }, {});
  };
}

function getValuePreferringReducer (targetValue) {
  return function (ruleName, ruleValues) {
    return ruleValues.reduce(function (curResult, ruleValue) {
      if (curResult === targetValue || ruleValue[ruleName] === targetValue) {
        return targetValue;
      }
      return ruleValue[ruleName];
    }, null);
  };
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
Rule.ObjectRuleValues = ObjectRuleValues;
Rule.SetRuleValues = SetRuleValues;
Rule.ArrSubsetRuleValues = ArrSubsetRuleValues;
Rule.HashSubsetRuleValues = HashSubsetRuleValues;
Rule.BoolRuleValues = BoolRuleValues;
Rule.getValuePreferringReducer = getValuePreferringReducer;
Rule.getObjectValueReducer = getObjectValueReducer;
Rule.onlyOneValueReducer = onlyOneValueReducer;
Rule.minimumValueReducer = minimumValueReducer;
