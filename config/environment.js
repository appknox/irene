/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    opbeat: { appId: '2cf9471671', orgId: '1ff25e9c6a1d40bbad1293635d201fcb' }
    pace: {
      // addon-specific options to configure theme
      theme: 'minimal',
      color: 'red',

      // pace-specific options
      // learn more on http://github.hubspot.com/pace/#configuration
      // and https://github.com/HubSpot/pace/blob/master/pace.coffee#L1-L72
      catchupTime: 50,
      initialRate: 0.01,
      minTime: 100,
      ghostTime: 50,
      maxProgressPerFrame: 20,
      easeFactor: 1.25,
      startOnPageLoad: true,
      restartOnPushState: true,
      restartOnRequestAfter: 500,
      target: 'body',
      elements: {
        checkInterval: 100,
        selectors: ['body', '.ember-view']
      },
      eventLag: {
        minSamples: 10,
        sampleCount: 3,
        lagThreshold: 3
      },
      ajax: {
        trackMethods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PUT'],
        trackWebSockets: false,
        ignoreURLs: []
      }
    },
    rootURL: '/',
    locationType: 'auto',
    modulePrefix: 'irene',
    environment: environment,
    intercomAppID: "mbkqc0o1",
    pusherKey: "216d53b13aaa5c6fc2cf",
    enableIntercom: true,

    notifications: {
      autoClear: true,
      duration: 4000 // Milliseconds
    },
    moment: {
      allowEmpty: true, // default: false
      includeLocales: ['en', 'ja']
    },
    deviceFarmSsl: true,
    deviceFarmPort: "443",
    deviceFarmPath: "websockify",
    deviceFarmHost: "devicefarm.appknox.com",
    'namespace': "api-v2",
    'host': "https://api.appknox.com",
    'ember-cli-mirage': {
      enabled: false
    },

    stripe: {
      publishableKey: "pk_live_9G633HADop7N2NLdi6g2BHHA"
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
      stripePaymentDevknox: 'stripe_payment_devknox',
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
      enabled:false
    };
    ENV['namespace'] = "api-v2";
    ENV['host'] = "http://0.0.0.0:8000";
    ENV.enableIntercom = false;
  }

  if (environment === 'yashwin') {
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
    ENV['namespace'] = "api-v2";
    ENV['host'] = "http://0.0.0.0:8000";
    ENV.enableIntercom = false;
  }

  if (environment === 'production') {
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV['namespace'] = "api-v2";
    ENV['host'] = "https://api.appknox.com";
    ENV.stripe = {
      publishableKey: "pk_live_9G633HADop7N2NLdi6g2BHHA"
    };
  }

  if (environment === 'test') {
    ENV.locationType = 'none';
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.rootElement = '#ember-testing';
  }

  return ENV;
};
