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

module.exports = function (paths, config) {
  return getRules().then(function (rules) {
    const ruleValues = Object.keys(rules).reduce(function (ruleValues, ruleName) {
      return ruleValues.concat(rules[ruleName].getValues());
    }, []);
    const ruleSets = ruleValues.reduce(function (ruleSets, rule) {
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
        const acceptedRuleValues = [];
        const rejectedRuleValues = [];
        Object.keys(ruleSet).forEach(function (ruleName) {
          const subSet = {};
          subSet[ruleName] = ruleSet[ruleName];
          if (result.indexOf(ruleName) === -1) {
            acceptedRuleValues.push(subSet);
          } else {
            rejectedRuleValues.push(subSet);
          }
        });
        return [ acceptedRuleValues, rejectedRuleValues ];
      });
    });

    return Promise.all(promises).then(function (results) {
      var acceptedRuleValues = [];
      var rejectedRuleValues = [];
      results.forEach(function (result) {
        acceptedRuleValues = acceptedRuleValues.concat(result[0]);
        rejectedRuleValues = rejectedRuleValues.concat(result[1]);
      });

      const groupedConfig = acceptedRuleValues.reduce(function (groups, ruleValue) {
        const ruleName = Object.keys(ruleValue)[0];
        if (!groups[ruleName]) {
          groups[ruleName] = [];
        }
        groups[ruleName].push(ruleValue[ruleName]);
        return groups;
      }, {});
      const config = Object.keys(groupedConfig).reduce(function (config, ruleName) {
        config[ruleName] = rules[ruleName].reduceValues(groupedConfig[ruleName]);
        return config;
      }, {});

      return {
        config: config,
        rejectedRuleValues: rejectedRuleValues
      };
    });
  });
};
