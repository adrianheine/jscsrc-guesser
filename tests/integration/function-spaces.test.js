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

const jscsrcGuesser = require('../../lib/jscsrc-guesser');

describe('function spaces', function () {
  it('is not set if multiple values pass', function (done) {
    jscsrcGuesser([__dirname + '/../data/function-spaces-snippet.js'], {})
    .then(function (result) {
      assert.ok(
        result.config.disallowSpacesInAnonymousFunctionExpression.beforeOpeningRoundBrace
      );
      assert.ok(
        result.config.requireSpacesInAnonymousFunctionExpression.beforeOpeningCurlyBrace
      );
      assert.ok(result.config.disallowSpacesInFunctionDeclaration.beforeOpeningCurlyBrace);
      assert.ok(
        result.config.disallowSpacesInNamedFunctionExpression.beforeOpeningRoundBrace
      );
      assert.ok(
        result.config.disallowSpacesInNamedFunctionExpression.beforeOpeningCurlyBrace
      );
      assert.ok(
        result.config.disallowSpacesInFunctionExpression.beforeOpeningRoundBrace
      );
      assert.ok(
        result.config.requireSpacesInFunctionDeclaration.beforeOpeningRoundBrace
      );
      done();
    }).catch(done);
  });
});
