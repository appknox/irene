/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    isDevknox: false,
    isAppknox: false,
    devknoxPrice: 9,  // This should also change in `mycroft/settings.py`
    socketPath: "http://localhost:8008",
    platform: -1,
    paginate: {
      perPageLimit: 9,
      pagePadding: 5
    },
    'ember-websockets': {
      socketIO: true
    },
    mixpanel: {
      enabled: false,
      LOG_EVENT_TRACKING: false,
      token: 'baf97efda8bb7c89401cf455d33bcd29'
    },
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
        trackMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        trackWebSockets: false,
        ignoreURLs: ['api.mixpanel.com', 'socket.appknox.com', 'm.stripe.com', 'appknox-production.s3.amazonaws.com']
      }
    },
    rootURL: '/',
    locationType: 'auto',
    modulePrefix: 'irene',
    environment: environment,
    intercomAppID: "mbkqc0o1",
    enableIntercom: true,
    enablePendo: true,

    notifications: {
      autoClear: true,
      duration: 7000 // Milliseconds
    },
    moment: {
      allowEmpty: true, // default: false
      includeLocales: ['en', 'ja']
    },
    deviceFarmSsl: true,
    deviceFarmPort: "443",
    deviceFarmPath: "websockify",
    deviceFarmHost: "devicefarm.appknox.com",
    namespace: "api",
    host: "https://api.appknox.com",
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
      devices: 'devices',
      devicePreferences: 'device_preference',
      dynamic: 'dynamic',
      dynamicShutdown: 'dynamic_shutdown',
      signedPdfUrl: 'signed_pdf_url',
      storeUrl: 'store_url',
      deleteProject: 'projects/delete',
      recover: 'recover',
      reset: 'reset',
      setup: 'setup',
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
      collaborations: 'collaborations',
      deleteCollaboration: 'collaboration/delete',
      invitation: 'invitation',
      signup: 'signup',
      lang: 'lang',
      deleteGHRepo: 'delete_github_repo',
      deleteJIRAProject: 'delete_jira_project',
      apiScanOptions: 'api_scan_options',
      enableMFA: 'mfa/enable',
      disableMFA: 'mfa/disable',
      teams: 'teams',
      members: 'members',
      signedInvoiceUrl: 'download_url',
      invoices: 'invoices',
      chargebeeCallback: "chargebee/callback"
    },
    csb: {
      feature: {
        runAPIScan: "API Scan",
        runDynamicScan: "Dynamic Scan",
        requestManualScan: "Manual Scan",
        applicationUpload: "Application Upload",
        reportDownload: "Report Download",
        addAPIEndpoints: "Add API Endpoints",
        namespaceAdded: "Namespace Add",
        changePassword: "Change Password",
        createTeam: "Create Team",
        integrateJIRA: "Integrate JIRA",
        integrateGithub: "Integrate Github"
      },
      module: {
        security: "Security",
        report: "Report",
        setup: "Setup"
      },
      product: {
        appknox: "Appknox"
      }
    }
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
    ENV['host'] = "http://0.0.0.0:8000";
    ENV.enableIntercom = false;
    ENV.enablePendo = false;
  }

  if (environment === 'mirage') {
    ENV.socketPath = "https://socket.appknox.com";
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
    ENV['host'] = "http://0.0.0.0:8000";
    ENV.enableIntercom = false;
    ENV.enablePendo = false;
    ENV.stripe = {
      publishableKey: "pk_test_9G633HADop7N2NLdi6g2BHHA"
    };
    ENV['APP'].opbeat = {
        DEBUG: true
    };
    ENV.rollbar = {
      enabled: false
    };
  }

  if (environment === 'testing') {
    ENV.socketPath = "https://socket.appknox.com";
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV['host'] = "http://localhost:8000";
    ENV.enableIntercom = false;
    ENV.enablePendo = false;
    ENV.stripe = {
      publishableKey: "pk_test_9G633HADop7N2NLdi6g2BHHA"
    };
    ENV['APP'].opbeat = {
        DEBUG: true
    };
    ENV.rollbar = {
      enabled: false
    };
  }

  if (environment === 'production') {
    ENV.rollbar = {
      accessToken: '4381303f93734918966ff4e1b028cee5'
    };
    ENV.socketPath = "https://socket.appknox.com";
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV.mixpanel.enabled = true;
    ENV['host'] = "https://api.appknox.com";
    ENV.stripe = {
      publishableKey: "pk_live_9G633HADop7N2NLdi6g2BHHA"
    };
    ENV['APP'].opbeat = {
        appId: '61501c19d2',
        orgId: '1ff25e9c6a1d40bbad1293635d201fcb'
      };
  }


  if (environment === 'staging') {
    ENV.socketPath = "https://socket.appknox.com";
    ENV.enablePendo = false;
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV['host'] = "https://api.appknox.com";
    ENV.stripe = {
      publishableKey: "pk_test_9G633HADop7N2NLdi6g2BHHA"
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
