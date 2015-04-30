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

module.exports = function merge (objects) {
  return objects.reduce(function (merged, object) {
    Object.keys(object).forEach(function (key) {
      if (!merged[key]) {
        merged[key] = object[key];
      } else if (merged[key].length) {
        merged[key] = merged[key].concat(object[key]);
      } else {
        merged[key] = merge([ merged[key], object[key] ]);
      }
    });
    return merged;
  }, {});
};
