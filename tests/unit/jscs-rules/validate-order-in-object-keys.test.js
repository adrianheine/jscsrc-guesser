'use strict';

const assert = require('assert');
const subject = require('../../../lib/jscs-rules/validate-order-in-object-keys');

describe('validateOrderInObjectKeys', function () {
  it('has the right number of values', function () {
    const values = subject.getValues();
    assert.equal(values.length, 6);
  });
  it('yields asc if asc is set', function () {
    const rawValues = {
      validateOrderInObjectKeys: [
        'asc'
      ]
    };
    const resultValue = subject.filterAndReduceValues(
      rawValues.validateOrderInObjectKeys, rawValues);
    assert.equal(resultValue, 'asc');
  });
  it('yields nothing if asc and desc are set', function () {
    const rawValues = {
      validateOrderInObjectKeys: [
        'asc', 'desc'
      ]
    };
    const resultValue = subject.filterAndReduceValues(
      rawValues.validateOrderInObjectKeys, rawValues);
    assert.equal(typeof resultValue, 'undefined');
  });
  it('yields nothing if asc and desc-natural are set', function () {
    const rawValues = {
      validateOrderInObjectKeys: [
        'asc', 'desc-natural'
      ]
    };
    const resultValue = subject.filterAndReduceValues(
      rawValues.validateOrderInObjectKeys, rawValues);
    assert.equal(typeof resultValue, 'undefined');
  });
  it('yields asc if asc and asc-natural are set', function () {
    const rawValues = {
      validateOrderInObjectKeys: [
        'asc', 'asc-natural'
      ]
    };
    const resultValue = subject.filterAndReduceValues(
      rawValues.validateOrderInObjectKeys, rawValues);
    assert.equal(resultValue, 'asc');
  });
});
