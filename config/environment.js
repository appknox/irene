var url = require('url');

function isTrue(value) {
  value = String(value).toLowerCase();
  return value === 'true';
}

const thirdPartyPluginEnvMap = {
  'crisp': {
    'env': 'IRENE_ENABLE_CRISP',
    'default': false
  },
  'hotjar': {
    'env' :'IRENE_ENABLE_HOTJAR',
    'default': false
  },
  'pendo': {
    'env' : 'IRENE_ENABLE_PENDO',
    'default': false
  },
  'csb':{
    'env': 'IRENE_ENABLE_CSB',
    'default': false
  },
  'marketplace': {
    'env': 'IRENE_ENABLE_MARKETPLACE',
    'default': false
  },
  'rollbar': {
    'env': 'IRENE_ENABLE_ROLLBAR',
    'default': false
  }
};

function getPluginActivationStatus(pluginName){
  const pluginEnvVariable = thirdPartyPluginEnvMap[pluginName];
  if(pluginEnvVariable.env in process.env){
    return isTrue(process.env[pluginEnvVariable.env]);
  }
  if('ENTERPRISE' in process.env){
    const isEnterprise = process.env.ENTERPRISE
    return !isTrue(isEnterprise);
  }
  return pluginEnvVariable.default;
}

module.exports = function(environment) {
  var devicefarmEnv = process.env.IRENE_DEVICEFARM_URL || "wss://devicefarm.appknox.com";
  var deviceFarmPath = "/websockify";
  var deviceFarmWebsockifyHost = new url.URL(devicefarmEnv);
  var deviceFarmSsl = deviceFarmWebsockifyHost.protocol == "wss:";
  var deviceFarmPort = deviceFarmWebsockifyHost.port || (deviceFarmSsl ? 443:80);
  var deviceFarmHostname = deviceFarmWebsockifyHost.hostname;
  var deviceFarmURL = url.format({
    protocol: deviceFarmWebsockifyHost.protocol,
    hostname: deviceFarmHostname,
    port: deviceFarmPort,
    pathname: deviceFarmPath
  });
  var host = process.env.IRENE_API_HOST || 'https://api.appknox.com';
  var devicefarmHost = process.env.IRENE_DEVICEFARM_HOST || 'https://devicefarm2.appknox.com';
  var socketPath = process.env.IRENE_API_SOCKET_PATH || 'https://socket.appknox.com';
  var enableRegistration = isTrue(process.env.IRENE_ENABLE_REGISTRATION || false);
  var registrationLink = process.env.IRENE_REGISTRATION_LINK || '';
  var isEnterprise = isTrue(process.env.ENTERPRISE || false);
  var showLicense = isTrue(process.env.IRENE_SHOW_LICENSE || false);
  var shouldDisableReCaptcha = enableRegistration && isEnterprise;
  var ENV = {
    version: Date.now(),
    isDevknox: false,
    isAppknox: false,
    isEnterprise: isEnterprise,
    showLicense: showLicense,
    isRegistrationEnabled: enableRegistration,
    shouldDisableReCaptcha: shouldDisableReCaptcha,
    registrationLink: registrationLink,
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
        ignoreURLs: ['socket.appknox.com', 'appknox-production.s3.amazonaws.com']
      }
    },
    rootURL: '/',
    locationType: 'auto',
    modulePrefix: 'irene',
    environment: environment,
    thirdPartyPluginEnvMap: thirdPartyPluginEnvMap,
    enableCrisp: getPluginActivationStatus('crisp'),
    enableHotjar: getPluginActivationStatus('hotjar'),
    enablePendo: getPluginActivationStatus('pendo'),
    enableCSB: getPluginActivationStatus('csb'),
    enableMarketplace: getPluginActivationStatus('marketplace'),
    emberRollbarClient: {
      enabled: getPluginActivationStatus('rollbar')
    },

    notifications: {
      autoClear: true,
      duration: 7000 // Milliseconds
    },
    moment: {
      allowEmpty: true, // default: false
      includeLocales: ['en', 'ja']
    },
    deviceFarmURL: deviceFarmURL,
    deviceFarmPassword: '1234',
    namespace: "api",
    namespace_v2: "api/v2",
    host: host,
    devicefarmHost: devicefarmHost,
    'ember-cli-mirage': {
      enabled: false
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
      recover: 'v2/forgot_password',
      reset: 'v2/forgot_password',
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
      changePassword: 'v2/change_password',
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
      mfa: 'mfa',
      mfaSendOTPMail: 'mfa/send_otp_mail',
      mfaVerify: 'mfa/verify',
      mfaVerifyDisable: 'mfa/verify_disable',
      teams: 'teams',
      organizations: 'organizations',
      users: 'users',
      members: 'members',
      signedInvoiceUrl: 'download_url',
      invoices: 'invoices',
      chargebeeCallback: 'chargebee/callback',
      subscriptions: 'subscriptions',
      rescan: 'rescan',
      personaltokens: 'personaltokens',
      unknownAnalysisStatus: 'unknown_analysis_status',
      reportPreference: 'report_preference',
      registration: 'registration',
      activate: 'activate',
      saml2: 'sso/saml2',
      saml2IdPMetadata: 'sso/saml2/idp_metadata',
      saml2SPMetadata: 'v2/sso/saml2/metadata',
      saml2Login: 'sso/saml2/login',
      files: 'files',
      profiles: 'profiles',
      analyses: 'analyses',
      vulnerabilityPreferences: 'vulnerability_preferences',
      uploadFile: 'attachments',
      uploadedAttachment: 'attachments/upload_finished',
      deleteAttachment: 'delete_attachment',
      downloadAttachment: 'download',
      purgeAPIAnalyses: 'purge_api',
      apps: 'apps',
      reports: 'reports',
      setUnknownAnalysisStatus: 'set_unknown_analysis_status',
      userSearch: 'user_search',
      status: 'status',
      ping: 'ping',
      requestAccess: 'request_access',
      appscan: 'appscan',
      scancount: 'scancount',
      recentIssues: 'recent_issues',
      tags: 'tags',
      capturedApiScanStart: 'start_apiscan',
    },
    csb: {
      userLoggedIn: {feature: "Log In", module: "Navigation", product: "Appknox"},
      clickProjectCard: {feature: "Project Card", module: "Projects", product: "Appknox"},
      reportDownload: { feature: "Report Download", module: "Security", product: "Appknox" },
      dynamicScanBtnClick: { feature: "Dynamic Scan Button", module: "Security", product: "Appknox" },
      runDynamicScan: { feature: "Dynamic Scan Run", module: "Security", product: "Appknox" },
      apiScanBtnClick: { feature: "API Scan Button", module: "Security", product: "Appknox" },
      runAPIScan: { feature: "API Scan Run", module: "Security", product: "Appknox" },
      manualScanBtnClick: { feature: "Manual Scan Button", module: "Security", product: "Appknox" },
      requestManualScan: { feature: "Manual Scan Request", module: "Security", product: "Appknox" },
      editAnalysis: {feature:"Edit Analysis", module:"Security", product: "Appknox"},
      addAPIEndpoints: { feature: "Add API Endpoints", module: "Security", product: "Appknox" },
      navigateToSettings: {feature: "Project Settings", module: "Setup", product: "Appknox" },
      navigateToAllScans: { feature: "All Scans", module: "Security", product: "Appknox" },
      naigateToCompareScans: { feature: "Compare Scans", module: "Security", product: "Appknox" },
      navigateToProjects: {feature: "Projects", module:"Navigation", product:"Appknox"},
      navigateToAnalytics: {feature: "Analytics", module:"Navigation", product:"Appknox"},
      navigateToOrganization: {feature: "Organization", module:"Navigation", product:"Appknox"},
      navigateToOrgSettings: {feature: "Organization Settings", module:"Organization", product:"Appknox"},
      navigateToAccountSettings: {feature: "Account Settings", module:"Navigation", product:"Appknox"},
      navigateToMarketPlace: {feature: "Marketplace", module:"Navigation", product:"Appknox"},
      navigateToBilling: {feature: "Billing", module:"Navigation", product:"Appknox"},
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
      enableProxy: { feature: "Enable Proxy", module: "Setup", product: "Appknox" },
      disableProxy: { feature: "Disable Proxy", module: "Setup", product: "Appknox" },
      changeProxySettings: { feature: "Change Proxy Settings", module: "Setup", product: "Appknox" },
    },
    whitelabel: {
      theme: 'dark',
      enabled: isTrue(process.env.WHITELABEL_ENABLED),
    },
    gReCaptcha: {
      jsUrl: 'https://recaptcha.net/recaptcha/api.js?render=explicit',
      siteKey: '6LfDdlUUAAAAAE9Bz9-3FLjrNw_AEUk11zXDH-0_'
    }
  };

  if (ENV.whitelabel.enabled) {
    ENV.whitelabel.name = process.env.WHITELABEL_NAME;
    ENV.whitelabel.logo = process.env.WHITELABEL_LOGO;
    ENV.whitelabel.theme = process.env.WHITELABEL_THEME; // 'light' or 'dark'
  }

  if (environment === 'development') {
    ENV['ember-cli-mirage'] = {
      enabled:false
    };
    ENV.isRegistrationEnabled = true;
    ENV.gReCaptcha = {
      jsUrl: 'https://recaptcha.net/recaptcha/api.js?render=explicit',
      siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    };
  }

  if (environment === 'mirage') {
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
    ENV['host'] = "http://0.0.0.0:8000";
    ENV.isRegistrationEnabled = true;
  }


  if (environment === 'testing') {
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV['host'] = "http://localhost:8000";
    ENV.isRegistrationEnabled = true;
    ENV.gReCaptcha['siteKey'] = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
  }

  if (environment === 'production') {
    ENV.emberRollbarClient.accessToken = '4381303f93734918966ff4e1b028cee5';
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
  }

  if (environment === 'staging') {
    ENV['ember-cli-mirage'] = {
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

  return ENV;
};
