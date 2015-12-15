'use strict';

const Rule = require('./Rule');

module.exports = new Rule('validateCommentPosition',
  new Rule.SetRuleValues([{position: 'above'}, {position: 'beside'}]),
  function (values) {
    return values.reduce(function (result, value) {
      if (result && result.position !== value.position) {
        result = undefined;
      } else {
        result = value;
      }
      return result;
    }, undefined);
  }
);
