const possibleENVS = [
  'IRENE_API_HOST',
  'IRENE_SHOW_LICENSE',
  'IRENE_ENABLE_PENDO',
  'IRENE_ENABLE_MARKETPLACE',
  'IRENE_POSTHOG_API_KEY',
  'IRENE_POSTHOG_API_HOST',
  'ENTERPRISE',
  'WHITELABEL_ENABLED',
  'WHITELABEL_NAME',
  'WHITELABEL_LOGO',
  'WHITELABEL_THEME',
  'WHITELABEL_FAVICON',
];

const ENVHandlerCONST = {
  possibleENVS: possibleENVS,
  defaults: {
    IRENE_API_HOST: 'https://api.appknox.com',
    IRENE_SHOW_LICENSE: false,
    IRENE_ENABLE_PENDO: false,
    IRENE_ENABLE_MARKETPLACE: false,
    IRENE_POSTHOG_API_KEY: '',
    IRENE_POSTHOG_API_HOST: '',
    ENTERPRISE: false,
    WHITELABEL_ENABLED: false,
    WHITELABEL_NAME: '',
    WHITELABEL_LOGO: '',
    WHITELABEL_THEME: 'dark',
  },

  processENV: Object.keys(process.env).reduce((acc, key) => {
    if (possibleENVS.indexOf(key) > -1) {
      acc[key] = process.env[key];
    }
    return acc;
  }, {}),
};

class ENVHandler {
  constructor(envHandlerConst) {
    this.envHandlerConst = envHandlerConst;
  }

  isRuntimeAvailable() {
    return !(typeof runtimeGlobalConfig == 'undefined');
  }

  getEnv(env_key) {
    const host_key = 'IRENE_API_HOST';
    this.assertEnvKey(env_key);
    if (this.isAvailableInRuntimeENV(env_key)) {
      const runtimeValue = this.getRuntimeObject()[env_key];
      if (env_key === host_key) {
        if (runtimeValue === '/') {
          return '';
        }
      }
      return runtimeValue;
    }
    if (this.isAvailableInProcessENV(env_key)) {
      const processValue = this.envHandlerConst.processENV[env_key];
      if (env_key === host_key) {
        if (processValue === '/') {
          return '';
        }
      }
      return processValue;
    }
    return this.getDefault(env_key);
  }

  isRegisteredEnv(env_key) {
    return this.envHandlerConst.possibleENVS.indexOf(env_key) > -1;
  }

  isAvailableInENV(env_key) {
    return (
      this.isAvailableInRuntimeENV(env_key) ||
      this.isAvailableInProcessENV(env_key)
    );
  }

  getRuntimeObject() {
    if (this.isRuntimeAvailable()) {
      return runtimeGlobalConfig; // eslint-disable-line
    }
    return {};
  }

  isAvailableInRuntimeENV(env_key) {
    const runtimeObj = this.getRuntimeObject();
    return env_key in runtimeObj;
  }

  isAvailableInProcessENV(env_key) {
    return env_key in this.envHandlerConst.processENV;
  }

  assertEnvKey(env_key) {
    if (!this.isRegisteredEnv(env_key)) {
      throw new Error(`ENV: ${env_key} not registered`);
    }
  }

  isTrue(value) {
    value = String(value).toLowerCase();
    return value === 'true';
  }

  getBoolean(env_key) {
    return this.isTrue(this.getEnv(env_key));
  }

  getDefault(env_key) {
    this.assertEnvKey(env_key);
    return this.envHandlerConst.defaults[env_key];
  }

  getValueForPlugin(env_key) {
    const enterpriseKey = 'ENTERPRISE';
    this.assertEnvKey(enterpriseKey);
    this.assertEnvKey(env_key);

    if (this.isAvailableInENV(env_key)) {
      return this.getBoolean(env_key);
    }

    if (this.isAvailableInENV(enterpriseKey)) {
      return !this.getBoolean(enterpriseKey);
    }

    return this.getDefault(env_key);
  }
}

module.exports = function (environment) {
  const handler = new ENVHandler(ENVHandlerCONST);
  var host = handler.getEnv('IRENE_API_HOST');
  var isEnterprise = handler.getBoolean('ENTERPRISE');
  var showLicense = handler.getBoolean('IRENE_SHOW_LICENSE');
  var ENV = {
    ENVHandlerCONST: ENVHandlerCONST,
    productVersions: {
      appknox: '25.12',
      storeknox: '25.8',
    },
    version: Date.now(),
    isDevknox: false,
    isAppknox: false,
    isEnterprise: isEnterprise,
    showLicense: showLicense,
    exportApplicationGlobal: false,
    devknoxPrice: 9, // This should also change in `mycroft/settings.py`
    platform: -1,
    paginate: {
      perPageLimit: 9,
      pagePadding: 5,
      offsetMultiplier: 9,
    },
    'ember-websockets': {
      socketIO: true,
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
        selectors: ['body', '.ember-view'],
      },
      eventLag: {
        minSamples: 10,
        sampleCount: 3,
        lagThreshold: 3,
      },
      ajax: {
        trackMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        trackWebSockets: false,
        ignoreURLs: [
          'socket.appknox.com',
          'appknox-production.s3.amazonaws.com',
        ],
      },
    },
    rootURL: '/',
    favicon: '/images/favicon.ico',
    locationType: 'history',
    modulePrefix: 'irene',
    environment: environment,
    enablePendo: handler.getValueForPlugin('IRENE_ENABLE_PENDO'),
    enableMarketplace: handler.getValueForPlugin('IRENE_ENABLE_MARKETPLACE'),
    posthogApiKey: handler.getEnv('IRENE_POSTHOG_API_KEY'),
    posthogApiHost: handler.getEnv('IRENE_POSTHOG_API_HOST'),

    notifications: {
      autoClear: true,
      duration: 7000, // Milliseconds
    },
    deviceFarmPassword: '1234',
    namespace: 'api',
    namespace_v2: 'api/v2',
    namespace_v3: 'api/v3',
    host: host,
    'ember-cli-mirage': {
      enabled: false,
    },

    emblemOptions: {
      blueprints: true,
    },

    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
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
      uploadedFile: 'uploaded_file',
      invoice: 'invoice',
      logout: 'logout',
      devices: 'devices',
      dynamic: 'dynamicscan',
      dynamicscans: 'dynamicscans',
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
      integrateServiceNow: 'servicenow',
      integrateSlack: 'slack',
      integrateSplunk: 'splunk',
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
      uploadAutomationScript: 'upload_automation_script',
      uploadAutomationScriptSignedUrl: 'upload_automation_script/signed_url',
      scheduleDynamicscanAutomation: 'schedule_automation',
      reportPreference: 'report_preference',
      registration: 'registration',
      saml2: 'sso/saml2',
      saml2IdPMetadata: 'sso/saml2/idp_metadata',
      saml2SPMetadata: 'v2/sso/saml2/metadata',
      saml2Login: 'sso/saml2/login',
      oidcSsoLogin: 'sso/oidc/authenticate',
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
      capturedApiScanStart: 'start_apiscan_v2',
      amAppVersions: 'v2/am_app_versions',
      userVaNotificationPref: 'nf_email_notification_preference',
    },
    whitelabel: {
      theme: 'dark',
      enabled: handler.getBoolean('WHITELABEL_ENABLED'),
    },
    gReCaptcha: {
      jsUrl: 'https://recaptcha.net/recaptcha/api.js?render=explicit',
      siteKey: '6LffPdIaAAAAANWL4gm7J6j9EJzKSuYEDAQ0Ry2x',
    },
  };

  if (ENV.whitelabel.enabled) {
    ENV.whitelabel.name = handler.getEnv('WHITELABEL_NAME');
    ENV.whitelabel.logo = handler.getEnv('WHITELABEL_LOGO');
    ENV.whitelabel.theme = handler.getEnv('WHITELABEL_THEME'); // 'light' or 'dark'
    ENV.whitelabel.favicon = handler.getEnv('WHITELABEL_FAVICON');
  }

  if (environment === 'development') {
    ENV['ember-cli-mirage'] = {
      enabled: false,
    };
  }

  if (
    environment === 'testing' ||
    environment === 'test' ||
    environment === 'mirage'
  ) {
    ENV['ember-cli-mirage'] = {
      enabled: true,
      trackRequests: true,
    };
    ENV['host'] = 'http://0.0.0.0:8000';
    ENV.ENVHandlerCONST.processENV['IRENE_API_HOST'] = '/';
  }

  if (environment === 'production') {
    ENV['ember-cli-mirage'] = {
      enabled: false,
    };
  }

  if (environment === 'staging') {
    ENV['ember-cli-mirage'] = {
      enabled: false,
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
