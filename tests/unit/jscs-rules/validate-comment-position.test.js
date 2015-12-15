'use strict';

const assert = require('assert');
const subject = require('../../../lib/jscs-rules/validate-comment-position');

describe('validateCommentPosition', function () {
  it('has the right number of values', function () {
    const values = subject.getValues();
    assert.equal(values.length, 2);
  });
  it('yields above if above passed', function () {
    const rawValues = {
      validateCommentPosition: [
        {position: 'above'}
      ]
    };
    const resultValue = subject.filterAndReduceValues(
      rawValues.validateCommentPosition, rawValues);
    assert.equal(resultValue.position, 'above');
  });
  it('yields nothing if above and beside passed', function () {
    const rawValues = {
      validateCommentPosition: [
        {position: 'above'},
        {position: 'beside'}
      ]
    };
    const resultValue = subject.filterAndReduceValues(
      rawValues.validateCommentPosition, rawValues);
    assert.equal(typeof resultValue, 'undefined');
  });
});
