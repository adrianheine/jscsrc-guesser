'use strict';

const Checker = require('jscs');
const Promise = require('es6-promise').Promise;
Object.assign = Object.assign || require('object-assign');

module.exports = function (rules, conf, paths) {
  const checker = new Checker({ esnext: conf.esnext });
  checker.getConfiguration().overrideFromCLI(conf);
  checker.getConfiguration().registerDefaultRules();

  // Checker overrides conf again
  rules.es3 = conf.es3 || null;
  rules.esnext = conf.esnext || null;
  checker.configure(rules);

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
