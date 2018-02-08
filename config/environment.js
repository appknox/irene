/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    isDevknox: false,
    isAppknox: false,
    isEnterprise: false,
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
        ignoreURLs: ['api.mixpanel.com', 'socket.appknox.com', 'appknox-production.s3.amazonaws.com']
      }
    },
    rootURL: '/',
    locationType: 'auto',
    modulePrefix: 'irene',
    environment: environment,
    intercomAppID: "mbkqc0o1",
    enableIntercom: true,
    enablePendo: true,
    enableInspectlet: true,
    enableCSB: true,

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
      manualscans: 'manualscans',
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
      chargebeeCallback: "chargebee/callback",
      subscriptions: "subscriptions",
      rescan: "rescan",
      personaltokens: "personaltokens",
      setUnknownAnalysisStatus: "set_unknown_analysis_status"
    },
    csb: {
      reportDownload: { feature: "Account Settings", module: "Setup", product: "Appknox" },
      runDynamicScan: { feature: "Dynamic Scan", module: "Security", product: "Appknox" },
      runAPIScan: { feature: "API Scan", module: "Security", product: "Appknox" },
      requestManualScan: { feature: "Manual Scan", module: "Security", product: "Appknox" },
      addAPIEndpoints: { feature: "Add API Endpoints", module: "Security", product: "Appknox" },
      createTeam: { feature: "Create Team", module: "Security", product: "Appknox" },
      namespaceAdded: { feature: "Namespace Add", module: "Security", product: "Appknox" },
      applicationUpload: { feature: "Application Upload", module: "Security", product: "Appknox" },
      integrateGithub: { feature: "Integrate Github", module: "Report", product: "Appknox" },
      integrateJIRA: { feature: "Integrate JIRA", module: "Report", product: "Appknox" },
      changePassword: { feature: "Change Password", module: "Setup", product: "Appknox" }
    },
    whitelabel: {}
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
    ENV.enableInspectlet = false;
    ENV.enableCSB = false;
  }

  if (environment === 'mirage') {
    ENV.socketPath = "https://socket.appknox.com";
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
    ENV['host'] = "http://0.0.0.0:8000";
    ENV.enableIntercom = false;
    ENV.enablePendo = false;
    ENV.enableInspectlet = false;
    ENV.enableCSB = false;
    ENV['APP'].opbeat = {
        DEBUG: true
    };
    ENV.rollbar = {
      enabled: false
    };
  }

  if (environment === 'whitelabel') {
    ENV.enableIntercom = false;
    ENV.enablePendo = false;
    ENV.enableInspectlet = false;
    ENV.enableCSB = false;
  }

  if (environment === 'testing') {
    ENV.socketPath = "https://socket.appknox.com";
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV['host'] = "http://192.168.0.198:8000";
    ENV.enableIntercom = false;
    ENV.enablePendo = false;
    ENV.enableInspectlet = false;
    ENV.enableCSB = false;
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
    ENV['APP'].opbeat = {
        appId: '61501c19d2',
        orgId: '1ff25e9c6a1d40bbad1293635d201fcb'
      };
  }

  if (environment === 'staging') {
    ENV.socketPath = "https://socket.appknox.com";
    ENV.enablePendo = false;
    ENV.enableInspectlet = false;
    ENV.enableCSB = false;
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV['APP'].opbeat = {
        DEBUG: true
    };
    ENV.rollbar = {
      enabled: false
    };
    ENV['host'] = "https://api.appknox.com";
  }

  if (environment === 'test') {
    ENV.locationType = 'none';
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'whitelabel') {
    ENV.isEnterprise = true;
    ENV.whitelabel.name = process.env.WHITELABEL_NAME;
    ENV.whitelabel.logo = process.env.WHITELABEL_LOGO;
    ENV.host = process.env.IRENE_API_HOST || 'https://api.appknox.com';
    ENV.socketPath = process.env.IRENE_API_SOCKET_PATH || 'https://socket.appknox.com';
  }

  return ENV;
};
