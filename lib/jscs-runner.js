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

const Checker = require('jscs');
const Promise = require('es6-promise').Promise;
Object.assign = Object.assign || require('object-assign');

module.exports = function (rules, conf, paths) {
  const checker = new Checker();
  const checkerConfig = Object.assign({
    es3: typeof conf.es3 !== 'undefined' ? conf.es3 : null,
    esnext: typeof conf.esnext !== 'undefined' ? conf.esnext : null,
    maxErrors: Infinity
  }, rules);
  checker.getConfiguration().overrideFromCLI(conf);
  checker.getConfiguration().registerDefaultRules();

  // Checker overrides conf again
  checker.configure(checkerConfig);

  return new Promise(function (resolve, reject) {
    Promise.all(paths.map(function (path) {
      return checker.checkPath(path);
    })).then(function (results) {
      const erroringRules = [];
      results.forEach(function (res) {
        res.forEach(function (errors) {
          errors.getErrorList().forEach(function (error) {
            if (error.rule === 'parseError') {
              reject(error);
              return;
            }
            if (erroringRules.indexOf(error.rule) === -1) {
              erroringRules.push(error.rule);
            }
          });
        });
      });
      resolve(erroringRules);
    }).catch(function (err) {
      reject(err);
    });
  });
};
