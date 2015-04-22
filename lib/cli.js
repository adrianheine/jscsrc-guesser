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

module.exports = function (program) {
  const paths = program.args;
  if (paths.length === 0) {
    console.log('You need to pass path(s).');
    return;
  }

  getRules().then(function (rules) {
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
      return runner(ruleSet, program, paths).then(function (result) {
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

    Promise.all(promises).then(function (results) {
      var acceptedRuleSets = [];
      var rejectedRuleSets = [];
      results.forEach(function (result) {
        acceptedRuleSets = acceptedRuleSets.concat(result[0]);
        rejectedRuleSets = rejectedRuleSets.concat(result[1]);
      });

      rejectedRuleSets.forEach(function (ruleSet) {
        const ruleName = Object.keys(ruleSet)[0];
        const ruleValue = ruleSet[ruleName];
        const ruleSerialization = ruleValue === true ? '' : (': ' + JSON.stringify(ruleValue));
        process.stderr.write('Does not follow rule ' + ruleName + ruleSerialization + '\n');
      });
      console.log(JSON.stringify(merge(acceptedRuleSets), null, 2));
    });
  }).catch(console.log);
};
