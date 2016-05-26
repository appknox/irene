/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    deviceFarmSsl: false,
    deviceFarmHost: "devicefarm.appknox.com",
    deviceFarmPort: "8080",
    pusherKey: "216d53b13aaa5c6fc2cf",
    modulePrefix: 'irene',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    stripe: {
      publishableKey: "pk_test_UOgd8ILsBsx7R5uUPttDJNgk"
    },
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
      manual: 'manual',
      githubRepos: 'github_repos',
      jiraProjects: 'jira_projects',
      setGithub: 'set_github',
      setJira: 'set_jira',
      feedback: 'feedback',
      revokeGitHub: 'unauthorize_github',
      revokeJira: 'unauthorize_jira',
      integrateJira: 'integrate_jira',
      changePassword: 'change_password',
      namespaceAdd: 'namespace_add',
      stripePayment: 'stripe_payment',
      applyCoupon: 'apply_coupon',
      saveCredentials: 'projects/save_credentials',
      collaboration: 'collaboration',
      deleteCollaboration: 'collaboration/delete',
      invitation: 'invitation',
      signup: 'signup'
    },
    webengage: {
      code: '~13410634d',
      src: 'http://cdn.widgets.webengage.com'
    },
    TOUR: {
      newScan: 'Scan An App',
      scanResult: 'View Scan Results',
      scanDetail: 'Scan Details',
      dashboard: 'Dashboard'
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.stripe = {
      publishableKey: "pk_test_UOgd8ILsBsx7R5uUPttDJNgk"
    };
    ENV.LOG_STRIPE_SERVICE = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.APP.API_HOST = 'http://localhost:8000';
    ENV.deviceFarmHost = "localhost";
    ENV.deviceFarmPort = "8080";

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
  }

  if (environment === 'production') {
    ENV.APP.LOG_RESOLVER = false;
    ENV.stripe = {
      publishableKey: "pk_live_9G633HADop7N2NLdi6g2BHHA"
    };
    ENV.APP.API_HOST = 'http://api.appknox.com';
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_TRANSITIONS = false;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.webengage.code = '~15ba20801'
    ENV.webengage.src = 'https://ssl.widgets.webengage.com'

    ENV.ravenDSN = "https://8bbbacbaacd841afa91c38eb420018bb@sentry.appknox.com/3"
  }

  if (environment === 'staging') {
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV.deviceFarmSsl = "";
    ENV.deviceFarmHost = "";
    ENV.deviceFarmPort = "";

  }

  ENV.contentSecurityPolicy = {
    "connect-src": "'self'",
    "frame-src": "'self'",
    "report-uri": "'self'",
    'img-src': "'self'",
    'style-src': "'self'",
    'script-src': "'self'",
    'font-src': "'self'"
  };

  ENV.APP.API_BASE = [ENV.APP.API_HOST, ENV.APP.API_NAMESPACE].join("/");
  ENV['simple-auth']['crossOriginWhitelist'] = [ENV.APP.API_HOST];
  ENV['simple-auth']['loginEndpoint'] = [ENV.APP.API_BASE, ENV.endpoints.tokenNew].join("/");
  ENV['simple-auth']['logoutEndpoint'] = [ENV.APP.API_BASE, ENV.endpoints.logout].join("/");

  return ENV;
};
