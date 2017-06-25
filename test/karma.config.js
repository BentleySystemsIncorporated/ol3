var pkg = require('../package.json');
var path = require('path');

/**
 * The config below is not enough to run Karma.  In addition, we need to add
 * all library files in dependency order.  This could be done with a plugin if
 * Karma supported async plugins (there may other alternatives as well).  But
 * for now we start Karma with the `tasks/test-all.js` script.  This script
 * sorts dependencies and add files to the Karma config below.
 */

module.exports = function(karma) {
  karma.set({
    frameworks: ['mocha'],
    files: [
      {
        pattern: path.resolve(__dirname, require.resolve('jquery/dist/jquery.js')),
        watched: false
      }, {
        pattern: path.resolve(__dirname, require.resolve('expect.js/index.js')),
        watched: false
      }, {
        pattern: path.resolve(__dirname, require.resolve('sinon/pkg/sinon.js')),
        watched: false
      }, {
        pattern: path.resolve(__dirname, require.resolve('proj4/dist/proj4.js')),
        watched: false
      }, {
        pattern: path.resolve(__dirname, './test-extensions.js')
      }, {
        pattern: '**/*.test.js'
      }, {
        pattern: '**/*',
        included: false,
        watched: false
      }
    ],
    proxies: {
      '/spec/': '/base/spec/'
    }
  });

  if (process.env.TRAVIS) {
    if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
      process.stderr.write('SAUCE_USERNAME or SAUCE_ACCESS_KEY not set\n');
      process.exit(1);
    }

    // see https://wiki.saucelabs.com/display/DOCS/Platform+Configurator
    // for platform and browserName options (Selenium API, node.js code)
    var customLaunchers = {
      SL_Chrome: {
        base: 'SauceLabs',
        browserName: 'chrome'
      },
      SL_Firefox: {
        base: 'SauceLabs',
        browserName: 'firefox'
      },
      SL_IE: {
        base: 'SauceLabs',
        platform: 'Windows 10',
        browserName: 'internet explorer'
      },
      SL_Edge: {
        base: 'SauceLabs',
        platform: 'Windows 10',
        browserName: 'MicrosoftEdge'
      },
      SL_Safari: {
        base: 'SauceLabs',
        platform: 'macos 10.12',
        browserName: 'safari'
      }
    };
    karma.set({
      sauceLabs: {
        testName: pkg.name + ' ' + pkg.version,
        recordScreenshots: false,
        connectOptions: {
          port: 5757
        },
        startConnect: false,
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY
      },
      reporters: ['dots', 'saucelabs'],
      captureTimeout: 240000,
      browserNoActivityTimeout: 240000,
      customLaunchers: customLaunchers,
      browsers: Object.keys(customLaunchers)
    });
  } else {
    karma.set({
      browsers: ['Chrome']
    });
  }
};
