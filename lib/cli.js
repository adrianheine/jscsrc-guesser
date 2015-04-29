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

const jscsrcGuesser = require('./jscsrc-guesser');

module.exports = function (program) {
  const paths = program.args;
  if (paths.length === 0) {
    console.log('You need to pass path(s).');
    return;
  }

  jscsrcGuesser(paths, program).then(function (result) {
    result.rejectedRuleSets.forEach(function (ruleSet) {
      const ruleName = Object.keys(ruleSet)[0];
      const ruleValue = ruleSet[ruleName];
      const ruleSerialization = ruleValue === true ? '' : (': ' + JSON.stringify(ruleValue));
      process.stderr.write('Does not follow rule ' + ruleName + ruleSerialization + '\n');
    });
    console.log(JSON.stringify(result.config, null, 2));
  }).catch(console.log);
};
