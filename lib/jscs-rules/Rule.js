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

function Rule (name, values, reducer, filter) {
  this.getValues = function () {
    return values.getValues(name);
  };
  this.reduceValues = function (ruleValues) {
    return reducer(ruleValues);
  };
  this.filterValue = filter || function () {
    return true;
  };
  this.filterAndReduceValues = function (ruleValues, allRuleValues) {
    const self = this;
    const filteredValues = ruleValues.filter(function (value) {
      return self.filterValue(value, allRuleValues);
    });
    if (filteredValues.length > 0) {
      return this.reduceValues(filteredValues);
    }
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

function AlternativeRuleValues(ruleValues) {
  this.getValues = function (ruleName) {
    return Array.prototype.concat.apply([], ruleValues.map(function (value) {
      return value.getValues(ruleName);
    }));
  };
}

function recursiveWalk(arr, fn, init) {
  function walk (index, currentValue, result) {
    if (index === arr.length) {
      result.push(currentValue);
    } else {
      arr[index].forEach(function (value) {
        walk(index + 1, fn(currentValue, value), result);
      });
    }
    return result;
  }
  return walk(0, init, []);
}

function ObjectRuleValues (ruleValues) {
  ruleValues = ruleValues.map(function (ruleValue) {
    return ruleValue.values.getValues(ruleValue.property);
  });
  this.getValues = function (ruleName) {
    return recursiveWalk(ruleValues, function (prototype, value) {
      const res = Object.assign({}, prototype.value);
      res[value.ruleName] = value.value;
      return {
        ruleName: ruleName,
        value: res
      };
    }, {});
  };
}

function ArrNonEmptySubsetRuleValues (values) {
  const dont = {};
  this.getValues = function (ruleName) {
    return recursiveWalk(values.map(function (v) {
      return [ v, dont ];
    }), function (values, value) {
      if (value !== dont) {
        // Create clone
        values = values.concat([value]);
      }
      return values;
    }, []).filter(function (v) {
      return v.length > 0;
    }).map(function (v) {
      return {
        ruleName: ruleName,
        value: v
      };
    });
  };
}

function ArrElementRuleValues (values) {
  this.getValues = function (ruleName) {
    return values.map(function (value) {
      return {
        ruleName: ruleName,
        value: [ value ]
      };
    });
  };
}

function HashElementRuleValues (values) {
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

/**
 * [{a:1}, {a:2}] -> {a:[1,2]}
 */
function group(arr) {
  return arr.reduce(function (res, value) {
    Object.keys(value).forEach(function (key) {
      if (!res[key]) {
        res[key] = [];
      }
      res[key].push(value[key]);
    });
    return res;
  }, {});
}

function getObjectValueReducer (valueReducers) {
  return function (ruleValues) {
    const groupedValues = group(ruleValues);
    return valueReducers.reduce(function (result, valueReducer) {
      result[valueReducer.property] = valueReducer.reducer(groupedValues[valueReducer.property]);
      return result;
    }, {});
  };
}

function getValuePreferringReducer (targetValue) {
  return function (ruleValues) {
    return ruleValues.reduce(function (curResult, ruleValue) {
      if (curResult === targetValue || ruleValue === targetValue) {
        return targetValue;
      }
      return ruleValue;
    }, null);
  };
}

function onlyOneValueReducer (ruleValues) {
  if (ruleValues.length !== 1) {
    return null;
  }
  return ruleValues[0];
}

function maximumValueReducer (ruleValues) {
  return Math.max.apply(Math, ruleValues);
}

function minimumValueReducer (ruleValues) {
  return Math.min.apply(Math, ruleValues);
}

function concatReducer (ruleValues) {
  return Array.prototype.concat.apply([], ruleValues);
}

function mergeReducer (objects) {
  return Object.assign.apply(Object, [{}].concat(objects));
}

function swapRequireDisallowRuleName (ruleName) {
  const match = ruleName.match(/^(require|disallow)(.+)$/);
  return match ? ({require: 'disallow', disallow: 'require'}[match[1]] + match[2]) : null;
}

Rule.getArrayRule = function (ruleName, values) {
  const oppositeRuleName = swapRequireDisallowRuleName(ruleName);
  return new Rule(ruleName,
    new ArrElementRuleValues(values),
    concatReducer,
    oppositeRuleName ? function (value, allValues) {
      const oppositeRuleValues = allValues[oppositeRuleName];
      if (!oppositeRuleValues) {
        return true;
      }
      return oppositeRuleValues.filter(function (oRV) {
        return oRV.indexOf(value[0]) !== -1;
      }).length === 0;
    } : null
  );
};

Rule.getHashRule = function (ruleName, values) {
  const oppositeRuleName = swapRequireDisallowRuleName(ruleName);
  return new Rule(ruleName,
    new HashElementRuleValues(values),
    mergeReducer,
    oppositeRuleName ? function (value, allValues) {
      const oppositeRuleValues = allValues[oppositeRuleName];
      if (!oppositeRuleValues) {
        return true;
      }
      const key = Object.keys(value)[0];
      return oppositeRuleValues.filter(function (oRV) {
        return oRV[key] === true;
      }).length === 0;
    } : null
  );
};

Rule.getBoolRule = function (ruleName) {
  const oppositeRuleName = swapRequireDisallowRuleName(ruleName);
  return new Rule(ruleName,
    new Rule.SetRuleValues([true]),
    Rule.getValuePreferringReducer(true),
    oppositeRuleName ? function (value, allValues) {
      return value === true && !(allValues[oppositeRuleName]);
    } : null
  );
};

module.exports = Rule;
Rule.AlternativeRuleValues = AlternativeRuleValues;
Rule.ObjectRuleValues = ObjectRuleValues;
Rule.SetRuleValues = SetRuleValues;
Rule.ArrNonEmptySubsetRuleValues = ArrNonEmptySubsetRuleValues;
Rule.getValuePreferringReducer = getValuePreferringReducer;
Rule.getObjectValueReducer = getObjectValueReducer;
Rule.onlyOneValueReducer = onlyOneValueReducer;
Rule.maximumValueReducer = maximumValueReducer;
Rule.minimumValueReducer = minimumValueReducer;
