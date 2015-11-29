'use strict';

const Rule = require('./Rule');

module.exports = new Rule('validateOrderInObjectKeys',
  new Rule.SetRuleValues(['asc', 'asc-insensitive', 'asc-natural', 'desc',
    'desc-insensitive', 'desc-natural']),
  function (values) {
    return values.reduce(function (result, value) {
      if (result.dir === 'mixed') {
        return result;
      }
      const thisDir = value.substr(0, 3) === 'asc' ? 'asc' : 'desc';
      if (result.dir && result.dir !== thisDir) {
        return {dir: 'mixed'};
      }
      if (typeof result.value === 'undefined' || result.value.length > value.length) {
        result.dir = thisDir;
        result.value = value;
      }
      return result;
    }, {dir: null, value: undefined}).value;
  }
);
