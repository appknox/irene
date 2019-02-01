var url = require('url');

module.exports = function(environment) {
  var devicefarmEnv = process.env.IRENE_DEVICEFARM_URL || "wss://devicefarm.appknox.com";
  var deviceFarmWebsockifyHost = url.parse(devicefarmEnv);
  var deviceFarmSsl = deviceFarmWebsockifyHost.protocol == "wss:";
  var deviceFarmPort = deviceFarmWebsockifyHost.port || (deviceFarmSsl ? 443:80);
  var deviceFarmHost = deviceFarmWebsockifyHost.hostname;
  var host = process.env.IRENE_API_HOST || 'https://api.appknox.com';
  var socketPath = process.env.IRENE_API_SOCKET_PATH || 'https://socket.appknox.com';
  var enableSSO = process.env.IRENE_ENABLE_SSO || false;
  var ENV = {
    version: Date.now(),
    isDevknox: false,
    isAppknox: false,
    isEnterprise: false,
    exportApplicationGlobal: true,
    devknoxPrice: 9,  // This should also change in `mycroft/settings.py`
    socketPath: socketPath,
    platform: -1,
    paginate: {
      perPageLimit: 9,
      pagePadding: 5,
      offsetMultiplier: 9,
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
    enableCrisp: true,
    enablePendo: true,
    enableInspectlet: true,
    enableCSB: true,
    enableSSO: enableSSO,

    notifications: {
      autoClear: true,
      duration: 7000 // Milliseconds
    },
    moment: {
      allowEmpty: true, // default: false
      includeLocales: ['en', 'ja']
    },
    deviceFarmSsl: deviceFarmSsl,
    deviceFarmPort: deviceFarmPort,
    deviceFarmPath: "websockify",
    deviceFarmHost: deviceFarmHost,
    namespace: "api",
    host: host,
    'ember-cli-mirage': {
      enabled: false
    },

    i18n: {
      defaultLocale: 'en',
    },

    emblemOptions: {
      blueprints: true
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
      authenticationRoute: '/login',
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
      dynamic: 'dynamicscan',
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
      invite: 'invite',
      invitation: 'invitation',
      invitations: 'invitations',
      signup: 'signup',
      lang: 'lang',
      deleteGHRepo: 'delete_github_repo',
      deleteJIRAProject: 'delete_jira_project',
      apiScanOptions: 'api_scan_options',
      enableMFA: 'mfa/enable',
      disableMFA: 'mfa/disable',
      teams: 'teams',
      organizations: 'organizations',
      users: 'users',
      members: 'members',
      signedInvoiceUrl: 'download_url',
      invoices: 'invoices',
      chargebeeCallback: "chargebee/callback",
      subscriptions: "subscriptions",
      rescan: "rescan",
      personaltokens: "personaltokens",
      unknownAnalysisStatus: "unknown_analysis_status",
      reportPreference: "report_preference",
      registration: "registration",
      activate: "activate",
      saml2: "sso/saml2",
      saml2Login: "sso/saml2/login",
      files: "files",
      profiles: "profiles",
      analyses: "analyses",
      vulnerabilityPreferences: "vulnerability_preferences",
      uploadFile: 'attachments',
      uploadedAttachment: 'attachments/upload_finished',
      deleteAttachment: 'delete_attachment',
      downloadAttachment: 'download',
      purgeAPIAnalyses: 'purge_api',
      apps: 'apps',
      reports: 'reports',
      setUnknownAnalysisStatus: "set_unknown_analysis_status",
      userSearch: "user_search",
      status: 'status',
      ping: 'ping',
      requestAccess: 'request_access'
    },
    csb: {
      reportDownload: { feature: "Account Settings", module: "Setup", product: "Appknox" },
      runDynamicScan: { feature: "Dynamic Scan", module: "Security", product: "Appknox" },
      runAPIScan: { feature: "API Scan", module: "Security", product: "Appknox" },
      requestManualScan: { feature: "Manual Scan", module: "Security", product: "Appknox" },
      addAPIEndpoints: { feature: "Add API Endpoints", module: "Security", product: "Appknox" },
      createTeam: { feature: "Create Team", module: "Security", product: "Appknox" },
      namespaceAdded: { feature: "Namespace Add", module: "Security", product: "Appknox" },
      namespaceRejected: { feature: "Namespace Reject", module: "Security", product: "Appknox" },
      applicationUpload: { feature: "Application Upload", module: "Security", product: "Appknox" },
      integrateGithub: { feature: "Integrate Github", module: "Report", product: "Appknox" },
      integrateJIRA: { feature: "Integrate JIRA", module: "Report", product: "Appknox" },
      changePassword: { feature: "Change Password", module: "Setup", product: "Appknox" },
      inviteResend: { feature: "Invitation Resend", module: "Security", product: "Appknox" },
      inviteDelete: { feature: "Invitation Delete", module: "Security", product: "Appknox" },
      teamProjectAdd: { feature: "Add Team Project", module: "Security", product: "Appknox" },
      teamProjectRemove: { feature: "Remove Team Project", module: "Security", product: "Appknox" },
      updateOrgName: { feature: "Update Organization Name", module: "Setup", product: "Appknox" },
      addTeamMember: { feature: "Add Team Member", module: "Security", product: "Appknox" },
      inviteMember: { feature: "Invite Member", module: "Security", product: "Appknox" },
      projectCollaboratorRemove: { feature: "Remove Project Collaborator", module: "Security", product: "Appknox" },
      projectTeamRemove: { feature: "Remove Project Team", module: "Security", product: "Appknox" },
    },
    whitelabel: {
      theme: 'dark'
    },
    gReCaptcha: {
      jsUrl: 'https://recaptcha.net/recaptcha/api.js?render=explicit',
      siteKey: '6LfDdlUUAAAAAE9Bz9-3FLjrNw_AEUk11zXDH-0_'
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
    ENV.enableCrisp = false;
    ENV.enablePendo = false;
    ENV.enableInspectlet = false;
    ENV.enableCSB = false;
    ENV.gReCaptcha = {
      siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    }
  }

  if (environment === 'mirage') {
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
    ENV['host'] = "http://0.0.0.0:8000";
    ENV.enableCrisp = false;
    ENV.enablePendo = false;
    ENV.enableInspectlet = false;
    ENV.enableCSB = false;
    ENV.rollbar = {
      enabled: false
    };
  }


  if (environment === 'testing') {
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV['host'] = "http://localhost:8000";
    ENV.enableCrisp = false;
    ENV.enablePendo = false;
    ENV.enableInspectlet = false;
    ENV.enableCSB = false;
    ENV.rollbar = {
      enabled: false
    };
    ENV.gReCaptcha['siteKey'] = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
  }

  if (environment === 'production') {
    ENV.rollbar = {
      accessToken: '4381303f93734918966ff4e1b028cee5'
    };
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV.mixpanel.enabled = true;
  }

  if (environment === 'staging') {
    ENV.enablePendo = false;
    ENV.enableInspectlet = false;
    ENV.enableCSB = false;
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV.rollbar = {
      enabled: false
    };
  }

  if (environment === 'test') {
    ENV.locationType = 'none';
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (
    environment === 'whitelabel' ||
    environment === 'sequelstring'
  ) {
    ENV.enableCrisp = false;
    ENV.enablePendo = true;  //TODO: fix this.
    ENV.enableInspectlet = false;
    ENV.enableCSB = false;
    ENV.isEnterprise = process.env.ENTERPRISE;
    ENV.whitelabel.enabled = (process.env.WHITELABEL_ENABLED || '').toString().toLowerCase() === 'true';
    if (ENV.whitelabel.enabled) {
      ENV.whitelabel.name = process.env.WHITELABEL_NAME;
      ENV.whitelabel.logo = process.env.WHITELABEL_LOGO;
      ENV.whitelabel.theme = process.env.WHITELABEL_THEME; // 'light' or 'dark'
    }
  }
  return ENV;
};
