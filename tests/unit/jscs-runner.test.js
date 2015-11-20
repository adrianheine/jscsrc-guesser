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

const jscsRunner = require('../../lib/jscs-runner');
const esNextSnippetPath = __dirname + '/../data/es-next-snippet.js';
const es5SnippetPath = __dirname + '/../data/es5-snippet.js';

describe('jscsRunner', function () {
  it('defaults to esnext', function (done) {
    jscsRunner({}, {}, [esNextSnippetPath]).then(function () {
      done();
    }).catch(done);
  });
  it('correctly fails without es3', function (done) {
    jscsRunner({requireDotNotation: true}, {es3: false}, [es5SnippetPath])
      .then(function (failingRules) {
        assert.equal(failingRules.length, 1);
        done();
      })
      .catch(done);
  });
  it('correctly passes with es3', function (done) {
    jscsRunner({requireDotNotation: true}, {es3: true}, [es5SnippetPath])
      .then(function (failingRules) {
        assert.equal(failingRules.length, 0);
        done();
      })
      .catch(done);
  });
  it('does not alter first parameter', function (done) {
    const rules = {requireDotNotation: true};
    jscsRunner(rules, {es3: true}, [es5SnippetPath])
      .then(function () {
        assert.equal(Object.keys(rules).length, 1);
        done();
      })
      .catch(done);
  });
});
