/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'irene',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    'simple-auth': {
      store: 'simple-auth-session-store:local-storage',
      serverTokenRevocationEndpoint: '/logout'
    }
  };

  if (environment === 'development') {
    //ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.usePretender = true;
    if (ENV.usePretender) {
      ENV.APP.API_HOST = '';
    }
    else{
      ENV.APP.API_HOST = 'http://localhost:8000';
    }
    ENV['simple-auth'] = {
      authorizer: 'authorizer:foo-rest',
      serverTokenEndpoint: ENV.APP.API_HOST + '/api-token-auth/',
      crossOriginWhitelist: [ENV.APP.API_HOST]
    };
    ENV.contentSecurityPolicy = {
      "connect-src": "'self' " + ENV.APP.API_HOST
    };
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'auto';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV['simple-auth']['store'] = 'simple-auth-session-store:ephemeral'
  }

  if (environment === 'production') {

  }

  return ENV;
};
