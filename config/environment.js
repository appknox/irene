const possibleENVS = [
  "IRENE_API_HOST",
  "IRENE_DEVICEFARM_HOST",
  "IRENE_API_SOCKET_PATH",
  "IRENE_ENABLE_REGISTRATION",
  "IRENE_REGISTRATION_LINK",
  "IRENE_SHOW_LICENSE",
  "IRENE_CRISP_WEBSITE_ID",
  "IRENE_ENABLE_HOTJAR",
  "IRENE_ENABLE_PENDO",
  "IRENE_ENABLE_CSB",
  "IRENE_ENABLE_MARKETPLACE",
  "IRENE_ENABLE_ROLLBAR",
  "ENTERPRISE",
  "WHITELABEL_ENABLED",
  "WHITELABEL_NAME",
  "WHITELABEL_LOGO",
  "WHITELABEL_THEME",
  "WHITELABEL_FAVICON",
];

const ENVHandlerCONST = {
  possibleENVS: possibleENVS,
  defaults: {
    IRENE_API_HOST: "https://api.appknox.com",
    IRENE_DEVICEFARM_HOST: "https://devicefarm.appknox.com",
    IRENE_API_SOCKET_PATH: "https://socket.appknox.com",
    IRENE_ENABLE_REGISTRATION: false,
    IRENE_REGISTRATION_LINK: "",
    IRENE_SHOW_LICENSE: false,
    IRENE_CRISP_WEBSITE_ID: "",
    IRENE_ENABLE_HOTJAR: false,
    IRENE_ENABLE_PENDO: false,
    IRENE_ENABLE_CSB: false,
    IRENE_ENABLE_MARKETPLACE: false,
    IRENE_ENABLE_ROLLBAR: false,
    ENTERPRISE: false,
    WHITELABEL_ENABLED: false,
    WHITELABEL_NAME: "",
    WHITELABEL_LOGO: "",
    WHITELABEL_THEME: "dark",
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
    return !(typeof runtimeGlobalConfig == "undefined");
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
    return value === "true";
  }

  getBoolean(env_key) {
    return this.isTrue(this.getEnv(env_key));
  }

  getDefault(env_key) {
    this.assertEnvKey(env_key);
    return this.envHandlerConst.defaults[env_key];
  }

  getValueForPlugin(env_key) {
    const enterpriseKey = "ENTERPRISE";
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
  var devicefarmHost = handler.getEnv('IRENE_DEVICEFARM_HOST');
  var socketPath = handler.getEnv('IRENE_API_SOCKET_PATH');
  var enableRegistration = handler.getBoolean('IRENE_ENABLE_REGISTRATION');
  var registrationLink = handler.getBoolean('IRENE_REGISTRATION_LINK');
  var isEnterprise = handler.getBoolean('ENTERPRISE');
  var showLicense = handler.getBoolean('IRENE_SHOW_LICENSE');
  var shouldDisableReCaptcha = enableRegistration && isEnterprise;
  var ENV = {
    ENVHandlerCONST: ENVHandlerCONST,
    version: Date.now(),
    isDevknox: false,
    isAppknox: false,
    isEnterprise: isEnterprise,
    showLicense: showLicense,
    isRegistrationEnabled: enableRegistration,
    shouldDisableReCaptcha: shouldDisableReCaptcha,
    registrationLink: registrationLink,
    exportApplicationGlobal: true,
    devknoxPrice: 9, // This should also change in `mycroft/settings.py`
    socketPath: socketPath,
    platform: -1,
    paginate: {
      perPageLimit: 9,
      pagePadding: 5,
      offsetMultiplier: 9,
    },
    "ember-websockets": {
      socketIO: true,
    },
    pace: {
      // addon-specific options to configure theme
      theme: "minimal",
      color: "red",

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
      target: "body",
      elements: {
        checkInterval: 100,
        selectors: ["body", ".ember-view"],
      },
      eventLag: {
        minSamples: 10,
        sampleCount: 3,
        lagThreshold: 3,
      },
      ajax: {
        trackMethods: ["GET", "POST", "DELETE", "OPTIONS"],
        trackWebSockets: false,
        ignoreURLs: [
          "socket.appknox.com",
          "appknox-production.s3.amazonaws.com",
        ],
      },
    },
    rootURL: "/",
    favicon: "/images/favicon.ico",
    locationType: "auto",
    modulePrefix: "irene",
    environment: environment,
    crispWebsiteId: handler.getEnv('IRENE_CRISP_WEBSITE_ID'),
    enableHotjar: handler.getValueForPlugin('IRENE_ENABLE_HOTJAR'),
    enablePendo: handler.getValueForPlugin('IRENE_ENABLE_PENDO'),
    enableCSB: handler.getValueForPlugin('IRENE_ENABLE_CSB'),
    enableMarketplace: handler.getValueForPlugin('IRENE_ENABLE_MARKETPLACE'),
    emberRollbarClient: {
      enabled: handler.getValueForPlugin('IRENE_ENABLE_ROLLBAR'),
    },

    notifications: {
      autoClear: true,
      duration: 7000, // Milliseconds
    },
    deviceFarmPassword: "1234",
    namespace: "api",
    namespace_v2: "api/v2",
    host: host,
    devicefarmHost: devicefarmHost,
    "ember-cli-mirage": {
      enabled: false,
    },

    emblemOptions: {
      blueprints: true,
    },

    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
    },
    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    "ember-simple-auth": {
      authenticationRoute: "/login",
      loginEndPoint: "/login",
      checkEndPoint: "/check",
      logoutEndPoint: "/logout",
      routeAfterAuthentication: "authenticated.index",
      routeIfAlreadyAuthenticated: "authenticated.index",
    },
    endpoints: {
      token: "token",
      tokenNew: "token/new.json",
      signedUrl: "signed_url",
      uploadedFile: "uploaded_file",
      invoice: "invoice",
      logout: "logout",
      devices: "devices",
      devicePreferences: "device_preference",
      dynamic: "dynamicscan",
      dynamicShutdown: "dynamic_shutdown",
      signedPdfUrl: "signed_pdf_url",
      storeUrl: "store_url",
      deleteProject: "projects/delete",
      recover: "v2/forgot_password",
      reset: "v2/forgot_password",
      setup: "setup",
      init: "init",
      manual: "manual",
      manualscans: "manualscans",
      githubRepos: "github_repos",
      jiraProjects: "jira_projects",
      setGithub: "set_github",
      setJira: "set_jira",
      feedback: "feedback",
      revokeGitHub: "unauthorize_github",
      revokeJira: "unauthorize_jira",
      integrateJira: "integrate_jira",
      changePassword: "v2/change_password",
      namespaceAdd: "namespace_add",
      applyCoupon: "apply_coupon",
      saveCredentials: "projects/save_credentials",
      invite: "invite",
      invitation: "invitation",
      invitations: "invitations",
      signup: "signup",
      lang: "lang",
      deleteGHRepo: "delete_github_repo",
      deleteJIRAProject: "delete_jira_project",
      apiScanOptions: "api_scan_options",
      enableMFA: "mfa/enable",
      disableMFA: "mfa/disable",
      mfa: "mfa",
      mfaSendOTPMail: "mfa/send_otp_mail",
      mfaVerify: "mfa/verify",
      mfaVerifyDisable: "mfa/verify_disable",
      teams: "teams",
      organizations: "organizations",
      users: "users",
      members: "members",
      signedInvoiceUrl: "download_url",
      invoices: "invoices",
      chargebeeCallback: "chargebee/callback",
      subscriptions: "subscriptions",
      rescan: "rescan",
      personaltokens: "personaltokens",
      unknownAnalysisStatus: "unknown_analysis_status",
      dynamicscanMode: "dynamicscan_mode",
      uploadAutomationScript: "upload_automation_script",
      uploadAutomationScriptSignedUrl: "upload_automation_script/signed_url",
      reportPreference: "report_preference",
      registration: "registration",
      activate: "activate",
      saml2: "sso/saml2",
      saml2IdPMetadata: "sso/saml2/idp_metadata",
      saml2SPMetadata: "v2/sso/saml2/metadata",
      saml2Login: "sso/saml2/login",
      files: "files",
      profiles: "profiles",
      analyses: "analyses",
      vulnerabilityPreferences: "vulnerability_preferences",
      uploadFile: "attachments",
      uploadedAttachment: "attachments/upload_finished",
      deleteAttachment: "delete_attachment",
      downloadAttachment: "download",
      purgeAPIAnalyses: "purge_api",
      apps: "apps",
      reports: "reports",
      setUnknownAnalysisStatus: "set_unknown_analysis_status",
      userSearch: "user_search",
      status: "status",
      ping: "ping",
      requestAccess: "request_access",
      appscan: "appscan",
      scancount: "scancount",
      recentIssues: "recent_issues",
      tags: "tags",
      capturedApiScanStart: "start_apiscan",
    },
    csb: {
      userLoggedIn: {
        feature: "Log In",
        module: "Navigation",
        product: "Appknox",
      },
      clickProjectCard: {
        feature: "Project Card",
        module: "Projects",
        product: "Appknox",
      },
      reportDownload: {
        feature: "Report Download",
        module: "Security",
        product: "Appknox",
      },
      dynamicScanBtnClick: {
        feature: "Dynamic Scan Button",
        module: "Security",
        product: "Appknox",
      },
      runDynamicScan: {
        feature: "Dynamic Scan Run",
        module: "Security",
        product: "Appknox",
      },
      apiScanBtnClick: {
        feature: "API Scan Button",
        module: "Security",
        product: "Appknox",
      },
      runAPIScan: {
        feature: "API Scan Run",
        module: "Security",
        product: "Appknox",
      },
      manualScanBtnClick: {
        feature: "Manual Scan Button",
        module: "Security",
        product: "Appknox",
      },
      requestManualScan: {
        feature: "Manual Scan Request",
        module: "Security",
        product: "Appknox",
      },
      editAnalysis: {
        feature: "Edit Analysis",
        module: "Security",
        product: "Appknox",
      },
      addAPIEndpoints: {
        feature: "Add API Endpoints",
        module: "Security",
        product: "Appknox",
      },
      navigateToSettings: {
        feature: "Project Settings",
        module: "Setup",
        product: "Appknox",
      },
      navigateToAllScans: {
        feature: "All Scans",
        module: "Security",
        product: "Appknox",
      },
      naigateToCompareScans: {
        feature: "Compare Scans",
        module: "Security",
        product: "Appknox",
      },
      navigateToProjects: {
        feature: "Projects",
        module: "Navigation",
        product: "Appknox",
      },
      navigateToAnalytics: {
        feature: "Analytics",
        module: "Navigation",
        product: "Appknox",
      },
      navigateToOrganization: {
        feature: "Organization",
        module: "Navigation",
        product: "Appknox",
      },
      navigateToOrgSettings: {
        feature: "Organization Settings",
        module: "Organization",
        product: "Appknox",
      },
      navigateToAccountSettings: {
        feature: "Account Settings",
        module: "Navigation",
        product: "Appknox",
      },
      navigateToMarketPlace: {
        feature: "Marketplace",
        module: "Navigation",
        product: "Appknox",
      },
      navigateToBilling: {
        feature: "Billing",
        module: "Navigation",
        product: "Appknox",
      },
      createTeam: {
        feature: "Create Team",
        module: "Security",
        product: "Appknox",
      },
      namespaceAdded: {
        feature: "Namespace Add",
        module: "Security",
        product: "Appknox",
      },
      namespaceRejected: {
        feature: "Namespace Reject",
        module: "Security",
        product: "Appknox",
      },
      applicationUpload: {
        feature: "Application Upload",
        module: "Security",
        product: "Appknox",
      },
      integrateGithub: {
        feature: "Integrate Github",
        module: "Report",
        product: "Appknox",
      },
      integrateJIRA: {
        feature: "Integrate JIRA",
        module: "Report",
        product: "Appknox",
      },
      changePassword: {
        feature: "Change Password",
        module: "Setup",
        product: "Appknox",
      },
      inviteResend: {
        feature: "Invitation Resend",
        module: "Security",
        product: "Appknox",
      },
      inviteDelete: {
        feature: "Invitation Delete",
        module: "Security",
        product: "Appknox",
      },
      teamProjectAdd: {
        feature: "Add Team Project",
        module: "Security",
        product: "Appknox",
      },
      teamProjectRemove: {
        feature: "Remove Team Project",
        module: "Security",
        product: "Appknox",
      },
      updateOrgName: {
        feature: "Update Organization Name",
        module: "Setup",
        product: "Appknox",
      },
      addTeamMember: {
        feature: "Add Team Member",
        module: "Security",
        product: "Appknox",
      },
      inviteMember: {
        feature: "Invite Member",
        module: "Security",
        product: "Appknox",
      },
      projectCollaboratorRemove: {
        feature: "Remove Project Collaborator",
        module: "Security",
        product: "Appknox",
      },
      projectTeamRemove: {
        feature: "Remove Project Team",
        module: "Security",
        product: "Appknox",
      },
      enableProxy: {
        feature: "Enable Proxy",
        module: "Setup",
        product: "Appknox",
      },
      disableProxy: {
        feature: "Disable Proxy",
        module: "Setup",
        product: "Appknox",
      },
      changeProxySettings: {
        feature: "Change Proxy Settings",
        module: "Setup",
        product: "Appknox",
      },
    },
    whitelabel: {
      theme: "dark",
      enabled: handler.getBoolean('WHITELABEL_ENABLED'),
    },
    gReCaptcha: {
      jsUrl: "https://recaptcha.net/recaptcha/api.js?render=explicit",
      siteKey: "6LfDdlUUAAAAAE9Bz9-3FLjrNw_AEUk11zXDH-0_",
    },
  };

  if (ENV.whitelabel.enabled) {
    ENV.whitelabel.name = handler.getEnv('WHITELABEL_NAME');
    ENV.whitelabel.logo = handler.getEnv('WHITELABEL_LOGO');
    ENV.whitelabel.theme = handler.getEnv('WHITELABEL_THEME'); // 'light' or 'dark'
    ENV.whitelabel.favicon = handler.getEnv('WHITELABEL_FAVICON');
  }

  if (environment === "development") {
    ENV["ember-cli-mirage"] = {
      enabled: false,
    };
    ENV.isRegistrationEnabled = true;
    ENV.gReCaptcha = {
      jsUrl: "https://recaptcha.net/recaptcha/api.js?render=explicit",
      siteKey: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
    };
  }

  if (environment === "mirage") {
    ENV["ember-cli-mirage"] = {
      enabled: true,
    };
    ENV["host"] = "http://0.0.0.0:8000";
    ENV.isRegistrationEnabled = true;
  }

  if (environment === "testing" || environment === "test") {
    ENV["ember-cli-mirage"] = {
      enabled: true,
    };
    ENV["host"] = "http://0.0.0.0:8000";
    ENV.isRegistrationEnabled = true;
    ENV.gReCaptcha["siteKey"] = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
  }

  if (environment === "production") {
    ENV.emberRollbarClient.accessToken = "4381303f93734918966ff4e1b028cee5";
    ENV["ember-cli-mirage"] = {
      enabled: false,
    };
  }

  if (environment === "staging") {
    ENV["ember-cli-mirage"] = {
      enabled: false,
    };
  }

  if (environment === "test") {
    ENV.locationType = "none";
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.rootElement = "#ember-testing";
    ENV.APP.autoboot = false;
  }

  return ENV;
};
