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

var jscsRunner = require('../../lib/jscs-runner');

describe('jscsRunner', function () {
  it('correctly passes esnext', function (done) {
    jscsRunner({}, {esnext: true}, [__dirname + '/es-next-snippet.js']).then(function () {
      done();
    }).catch(done);
  });
  it('correctly fails without esnext', function (done) {
    jscsRunner({}, {esnext: false}, [__dirname + '/es-next-snippet.js']).then(function () {
      done('Should not have passed');
    }).catch(function () {
      done();
    });
  });
  it('correctly fails without es3', function (done) {
    jscsRunner({requireDotNotation: true}, {es3: false}, [__dirname + '/es5-snippet.js'])
      .then(function (failingRules) {
        done(failingRules.length === 1 ? null : 'Should have failed');
      })
      .catch(done);
  });
  it('correctly passes with es3', function (done) {
    jscsRunner({requireDotNotation: true}, {es3: true}, [__dirname + '/es5-snippet.js'])
      .then(function (failingRules) {
        done(failingRules.length === 0 ? null : 'Should not have failed');
      })
      .catch(done);
  });
  it('does not alter first parameter', function (done) {
    const rules = {requireDotNotation: true};
    jscsRunner(rules, {es3: true}, [__dirname + '/es5-snippet.js'])
      .then(function () {
        done(Object.keys(rules).length === 1 ? null : 'Should not have altered first parameter');
      })
      .catch(done);
  });
});
