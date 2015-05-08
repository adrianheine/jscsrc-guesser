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

var jscsrcGuesser = require('../../lib/jscsrc-guesser');

describe('requireAlignedObjectValues', function () {
  it('is set to all if multiple values pass', function (done) {
    jscsrcGuesser([__dirname + '/../data/es-next-snippet.js'], {esnext: true})
    .then(function (result) {
      assert.equal(result.config.requireAlignedObjectValues, 'all');
      done();
    }).catch(done);
  });
});
