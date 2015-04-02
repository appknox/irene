/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'irene',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    useFakeS3: false,
    fakeS3URL: 'http://localhost:4000/',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      API_HOST: '',
      API_NAMESPACE: 'api'
    },
    'simple-auth': {
      store: 'simple-auth-session-store:local-storage',
      authorizer: 'authorizer:irene',
      authenticator: 'authenticator:irene',
      session: 'session:irene'
    },
    endpoints: {
      token: 'token',
      tokenNew: 'token/new.json',
      signedUrl: 'signed_url',
      uploadedFile: 'uploaded_file',
      invoice: 'invoice',
      logout: 'logout',
      dynamic: 'dynamic',
      dynamicShutdown: 'dynamic_shutdown',
      signedPdfUrl: 'signed_pdf_url',
      storeUrl: 'store_url',
      deleteProject: 'projects/delete',
      recover: 'recover',
      reset: 'reset',
      init: 'init',
      manual: 'manual'
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.usePretender = false;
    if (!ENV.usePretender) {
      ENV.APP.API_HOST = 'http://localhost:8000';
    }
    ENV.socketHost = 'localhost';
    ENV.socketPort = '8008';
    ENV.socketSecure = false;

    ENV.useFakeS3 = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'auto';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV['simple-auth']['store'] = 'simple-auth-session-store:ephemeral';
    ENV.usePretender = true;
  }

  if (environment === 'production') {
    ENV.APP.LOG_RESOLVER = false;
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_TRANSITIONS = false;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.usePretender = false;
    ENV.socketHost = 'ws.appknox.com';
    ENV.socketSecure = true;
    ENV.socketPort = 443;

  }

  if (environment === 'staging') {
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV.usePretender = false;
    ENV.socketHost = 'staging.appknox.com';
    ENV.socketPort = 80;

  }

  ENV.contentSecurityPolicy = {
    "connect-src": "'self' storage.googleapis.com ws://localhost:8008 http://localhost:8008 ws://localhost:6080/websockify sherlock-test.s3.amazonaws.com sherlock-staging.s3.amazonaws.com " + ENV.APP.API_HOST + " " + ENV.fakeS3URL,
    'img-src': "'self' www.gravatar.com placehold.it storage.googleapis.com s3.amazonaws.com",
    'style-src': "'self' 'unsafe-inline'",
    'script-src': "'self' 'unsafe-eval' localhost:35729 0.0.0.0:35729 storage.googleapis.com"
  };

  ENV.APP.API_BASE = [ENV.APP.API_HOST, ENV.APP.API_NAMESPACE].join("/");
  ENV['simple-auth']['crossOriginWhitelist'] = [ENV.APP.API_HOST];
  ENV['simple-auth']['loginEndpoint'] = [ENV.APP.API_BASE, ENV.endpoints.tokenNew].join("/");
  ENV['simple-auth']['logoutEndpoint'] = [ENV.APP.API_BASE, ENV.endpoints.logout].join("/");

  return ENV;
};
