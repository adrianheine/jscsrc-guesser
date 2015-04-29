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

const Promise = require('es6-promise').Promise;

const getRules = require('./jscs-rules');
const runner = require('./jscs-runner');

function merge(objects) {
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
}

module.exports = function (paths, config) {
  return getRules().then(function (rules) {
    const ruleSets = rules.reduce(function (ruleSets, rule) {
      var targetRuleSet;
      for (var i = 0; i < ruleSets.length; ++i) {
        if (!ruleSets[i].hasOwnProperty(rule.ruleName)) {
          targetRuleSet = ruleSets[i];
        }
      }
      if (!targetRuleSet) {
        targetRuleSet = {};
        ruleSets.push(targetRuleSet);
      }
      targetRuleSet[rule.ruleName] = rule.value;
      return ruleSets;
    }, []);
    const promises = ruleSets.map(function (ruleSet) {
      return runner(ruleSet, config, paths).then(function (result) {
        const acceptedRuleSets = [];
        const rejectedRuleSets = [];
        Object.keys(ruleSet).forEach(function (ruleName) {
          const subSet = {};
          subSet[ruleName] = ruleSet[ruleName];
          if (result.indexOf(ruleName) === -1) {
            acceptedRuleSets.push(subSet);
          } else {
            rejectedRuleSets.push(subSet);
          }
        });
        return [ acceptedRuleSets, rejectedRuleSets ];
      });
    });

    return Promise.all(promises).then(function (results) {
      var acceptedRuleSets = [];
      var rejectedRuleSets = [];
      results.forEach(function (result) {
        acceptedRuleSets = acceptedRuleSets.concat(result[0]);
        rejectedRuleSets = rejectedRuleSets.concat(result[1]);
      });

      return {
        config: merge(acceptedRuleSets),
        rejectedRuleSets: rejectedRuleSets
      };
    });
  });
};
