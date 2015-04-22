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
});
