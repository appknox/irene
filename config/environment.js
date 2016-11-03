/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    rootURL: '/',
    locationType: 'auto',
    modulePrefix: 'irene',
    environment: environment,
    pusherKey: "216d53b13aaa5c6fc2cf",

    deviceFarmSsl: false,
    deviceFarmHost: "devicefarm.appknox.com",
    deviceFarmPor: "8080",

    stripe: {
      publishableKey: "pk_test_UOgd8ILsBsx7R5uUPttDJNgk"
    },

    i18n: {
      defaultLocale: 'en',
    },

    emblemOptions: {
      blueprints: false
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
    },
    'ember-simple-auth': {
      loginEndPoint: '/login',
      checkEndPoint: '/check',
      logoutEndPoint: '/logout',
      routeAfterAuthentication: 'authenticated.index',
      routeIfAlreadyAuthenticated: 'authenticated.index',
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
      signup: 'signup',
      lang: 'lang'
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV['namespace'] = "api-v2";
    ENV['host'] = "http://0.0.0.0:8000";
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.stripe = {
      publishableKey: "pk_live_9G633HADop7N2NLdi6g2BHHA"
    };
  }

  if (environment === 'yashwin') {
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
    ENV['namespace'] = "api-v2";
    ENV['host'] = "http://0.0.0.0:8000";
  }
  return ENV;
};
