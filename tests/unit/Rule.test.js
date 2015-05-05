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

const assert = require('assert');

const Rule = require('../../lib/jscs-rules/Rule');

describe('Rule', function () {
  describe('ObjectRuleValues', function () {
    it('correctly works with one property', function () {
      const subject = new Rule.ObjectRuleValues([
        {property: 'property', values: new Rule.SetRuleValues([true, false])}
      ]);
      const values = subject.getValues('ruleName');
      assert.equal(values.length, 2);
      assert.equal(values[0].ruleName, 'ruleName');
      assert.equal(values[1].ruleName, 'ruleName');
      assert.equal(values[0].value.property, true);
      assert.equal(values[1].value.property, false);
    });
    it('correctly works with two properties', function () {
      const subject = new Rule.ObjectRuleValues([
        {property: 'property1', values: new Rule.SetRuleValues([true, false])},
        {property: 'property2', values: new Rule.SetRuleValues([true, false])}
      ]);
      const ruleName = 'ruleName';
      const values = subject.getValues(ruleName);
      assert.deepEqual(values, [
        {ruleName: ruleName, value: {property1: true, property2: true}},
        {ruleName: ruleName, value: {property1: true, property2: false}},
        {ruleName: ruleName, value: {property1: false, property2: true}},
        {ruleName: ruleName, value: {property1: false, property2: false}},
      ]);
    });
  });
  describe('getObjectValueReducer', function () {
    it('correctly works with one property', function () {
      const subject = Rule.getObjectValueReducer([
        {property: 'property', reducer: Rule.minimumValueReducer}
      ]);
      const result = subject([
        {property: 1},
        {property: 2},
      ]);
      assert.equal(result.property, 1);
    });
    it('correctly works with two properties', function () {
      const subject = Rule.getObjectValueReducer([
        {property: 'property1', reducer: Rule.minimumValueReducer},
        {property: 'property2', reducer: Rule.minimumValueReducer}
      ]);
      const result = subject([
        {property1: 1, property2: 50},
        {property1: 2, property2: 5}
      ]);
      assert.equal(result.property1, 1);
      assert.equal(result.property2, 5);
    });
  });
  describe('ArrNonEmptySubsetRuleValues', function () {
    it('returns the right amount of values with three input values', function () {
      const ret = new Rule.ArrNonEmptySubsetRuleValues([1, 2, 3]).getValues('ruleName');
      assert.equal(ret.length, 7);
    });
  });
});
