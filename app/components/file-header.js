// jshint ignore: start
import Ember from 'ember';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';


const isEmpty = inputValue=> Ember.isEmpty(inputValue);

const FileHeaderComponent = Ember.Component.extend({

  roleId: 0,
  userRoles: [],
  globalAlpha:0.4,
  radiusRatio:0.9,

  isBasicInfo: false,
  isVPNDetails: false,
  isScanDetails: true,
  apiScanModal: false,
  isLoginDetails: false,
  isOWASPDetails: false,
  isStartingRescan: false,
  dynamicScanModal: false,
  isRequestingManual: false,
  isDownloadingReport: false,
  showManualScanFormModal: false,
  showRemoveRoleConfirmBox: false,

  i18n: Ember.inject.service(),
  trial: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  vpnStatuses: ["yes", "no"],
  loginStatuses: ["yes", "no"],
  appActions: ENUMS.APP_ACTION.CHOICES.slice(0, -1),
  environments: ENUMS.APP_ENV.CHOICES.slice(0, -1),

  tStartingScan: t("startingScan"),
  tPasswordCopied: t("passwordCopied"),
  tPleaseTryAgain: t("pleaseTryAgain"),
  tManualRequested: t("manualRequested"),
  tRescanInitiated: t("rescanInitiated"),
  tRoleAdded: t("modalCard.manual.roleAdded"),
  tReportIsGettingGenerated: t("reportIsGettingGenerated"),
  tPleaseEnterAllValues: t("modalCard.manual.pleaseEnterAllValues"),
  tPleaseEnterUserRoles: t("modalCard.manual.pleaseEnterUserRoles"),
  tPleaseEnterVPNDetails: t("modalCard.manual.pleaseEnterVPNDetails"),

  manualscan: (function() {
    const fileId = this.get("file.id");
    return this.get("store").findRecord("manualscan", fileId);
  }).property(),

  analyses: (function() {
    return this.get("file.sortedAnalyses");
  }).property("file.sortedAnalyses"),

  filteredEnvironments: (function() {
    const environments = this.get("environments");
    const appEnv = parseInt(this.get("manualscan.filteredAppEnv"));
    return environments.filter(env => appEnv !== env.value);
  }).property("environments", "manualscan.filteredAppEnv"),

  filteredAppActions: (function() {
    const appActions = this.get("appActions");
    const appAction =  parseInt(this.get("manualscan.filteredAppAction"));
    return appActions.filter(action => appAction !== action.value);
  }).property("appActions", "manualscan.filteredAppAction"),

  filteredLoginStatuses: (function() {
    const loginStatuses = this.get("loginStatuses");
    const loginStatus = this.get("manualscan.loginStatus");
    return loginStatuses.filter(status => loginStatus !== status);
  }).property("loginStatuses", "manualscan.loginStatus"),

  filteredVpnStatuses: (function() {
    const vpnStatuses = this.get("vpnStatuses");
    const vpnStatus = this.get("manualscan.vpnStatus");
    return vpnStatuses.filter(status => vpnStatus !== status);
  }).property("vpnStatuses", "manualscan.vpnStatus"),

  chartOptions: (() =>
    ({
      legend: { display: false },
      animation: {animateRotate: false}
    })
  ).property(),

  barChartOptions: (() =>
    ({
      tooltips: {
        callbacks: {
          title: function(tooltipItem, data) {
            return data['tooltips'][tooltipItem[0]['index']];
          }
        }
      },
      scales: { yAxes: [{ ticks: { beginAtZero:true, stepSize: 3 } }]},
    })
  ).property(),

  didInsertElement() {
    const tPasswordCopied = this.get("tPasswordCopied");
    const tPleaseTryAgain = this.get("tPleaseTryAgain");
    const clipboard = new Clipboard('.copy-password');
    this.set("clipboard", clipboard);
    const that = this;
    clipboard.on('success', function(e) {
      that.get("notify").info(tPasswordCopied);
      e.clearSelection();
    });
    clipboard.on('error', () => that.get("notify").error(tPleaseTryAgain));
  },

  willDestroyElement() {
    const clipboard = this.get("clipboard");
    clipboard.destroy();
  },

  confirmCallback() {
    const availableRoles = this.get("availableRoles");
    this.set("manualscan.userRoles", availableRoles);
    this.set("showRemoveRoleConfirmBox", false);
  },

  allUserRoles: (function() {
    const userRoles = this.get("manualscan.userRoles");
    let roleId = this.get("roleId");
    const that = this;
    userRoles.forEach(function(role) {
      roleId = roleId + 1;
      role.id = roleId;
      return that.set("roleId", roleId);
    });
    return userRoles;
  }).property("manualscan.userRoles"),

  availableRoles: Ember.computed.filter('allUserRoles', function(userRole) {
    const { id } = userRole;
    const deletedRole = this.get("deletedRole");
    return id !== deletedRole;
  }),

  userRoleCount: Ember.computed.alias('manualscan.userRoles.length'),

  hasUserRoles: Ember.computed.gt('userRoleCount', 0),

  scanDetailsClass: Ember.computed('isScanDetails', function() {
    if (this.get('isScanDetails')) {
      return 'is-active';
    }
  }),

  owaspDetailsClass: Ember.computed('isOWASPDetails', function() {
    if (this.get('isOWASPDetails')) {
      return 'is-active';
    }
  }),

  owasps: Ember.computed('analyses', function() {
    const analyses = this.get("analyses");
    var owasps = [];
    const risks = [ENUMS.RISK.CRITICAL, ENUMS.RISK.HIGH, ENUMS.RISK.MEDIUM, ENUMS.RISK.LOW];
    for(let analysis of analyses) {
      analysis.get("owasp").forEach(function(owasp) {
        if(risks.includes(analysis.get("risk"))) {
          owasps.push(owasp.id);
        }
      });
    }
    return owasps
  }),

  owaspData: (function() {
    const owasps = this.get("owasps");
    var owaspA1Count = 0, owaspA2Count = 0, owaspA3Count = 0, owaspA4Count = 0,
    owaspA5Count = 0, owaspA6Count = 0, owaspA7Count = 0, owaspA8Count = 0,
    owaspA9Count = 0, owaspA10Count = 0, owaspM1Count = 0, owaspM2Count = 0,
    owaspM3Count = 0, owaspM4Count = 0, owaspM5Count = 0, owaspM6Count = 0,
    owaspM7Count = 0, owaspM8Count = 0, owaspM9Count = 0, owaspM10Count = 0;
    owasps.forEach(function(owasp) {
      switch (owasp) {
        case "A1_2013":
          return owaspA1Count = owaspA1Count + 1;
        case "A2_2013":
          return owaspA2Count = owaspA2Count + 1;
        case "A3_2013":
          return owaspA3Count = owaspA3Count + 1;
        case "A4_2013":
          return owaspA4Count = owaspA4Count + 1;
        case "A5_2013":
          return owaspA5Count = owaspA5Count + 1;
        case "A6_2013":
          return owaspA6Count = owaspA6Count + 1;
        case "A7_2013":
          return owaspA7Count = owaspA7Count + 1;
        case "A8_2013":
          return owaspA8Count = owaspA8Count + 1;
        case "A9_2013":
          return owaspA9Count = owaspA9Count + 1;
        case "A10_2013":
          return owaspA10Count = owaspA10Count + 1;
        case "M1_2016":
          return owaspM1Count = owaspM1Count + 1;
        case "M2_2016":
          return owaspM2Count = owaspM2Count + 1;
        case "M3_2016":
          return owaspM3Count = owaspM3Count + 1;
        case "M4_2016":
          return owaspM4Count = owaspM4Count + 1;
        case "M5_2016":
          return owaspM5Count = owaspM5Count + 1;
        case "M6_2016":
          return owaspM6Count = owaspM6Count + 1;
        case "M7_2016":
          return owaspM7Count = owaspM7Count + 1;
        case "M8_2016":
          return owaspM8Count = owaspM8Count + 1;
        case "M9_2016":
          return owaspM9Count = owaspM9Count + 1;
        case "M10_2016":
          return owaspM10Count = owaspM10Count + 1;
      }
    })
    return {
      mobile: {
        labels: [
          'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10'
        ],
        tooltips: [
          "Improper Platform Usage", "Insecure Data Storage","Insecure Communication",
          "Insecure Authentication","Insufficient Cryptography", "Insecure Authorization",
          "Client Code Quality","Code Tampering", "Reverse Engineering","Extraneous Functionality"
        ],
        datasets: [ {
          label: 'OWASP MOBILE CATEGORIES',
          data: [
            owaspM1Count, owaspM2Count, owaspM3Count, owaspM4Count, owaspM5Count,
            owaspM6Count, owaspM7Count, owaspM8Count, owaspM9Count, owaspM10Count
          ],
          backgroundColor: [
           "#00008b", "#00008b", "#00008b", "#00008b", "#00008b",
           "#00008b", "#00008b", "#00008b", "#00008b", "#00008b",
          ]
        } ]
      },
      web: {
        labels: [
          'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10'
        ],
        tooltips: [
          "Injection","Broken Authentication and Session Management","Cross Site Scripting",
          "IDOR","Security Misconfiguration","Sensitive Data Exposure","Missing function ACL","CSRF",
          "Using components with known vulnerabilities", "Unvalidated Redirects and Forwards"
        ],
        datasets: [ {
          label: 'OWASP WEB CATEGORIES',
          data: [
            owaspA1Count, owaspA2Count, owaspA3Count, owaspA4Count, owaspA5Count,
            owaspA6Count, owaspA7Count, owaspA8Count, owaspA9Count, owaspA10Count
          ],
          backgroundColor: [
           "#36A2EB", "#36A2EB", "#36A2EB", "#36A2EB", "#36A2EB",
           "#36A2EB", "#36A2EB", "#36A2EB", "#36A2EB", "#36A2EB",
          ]
        } ]
      }
    };
  }).property("owasps", "owaspA5Count", "owaspA3Count"),

  actions: {

    displayScanDetails() {
      this.set('isScanDetails', true);
      this.set('isOWASPDetails', false);
    },

    displayOWASPDetails() {
      this.set('isScanDetails', false);
      this.set('isOWASPDetails', true);
    },

    getPDFReportLink() {
      triggerAnalytics('feature', ENV.csb.reportDownload);
      const tReportIsGettingGenerated = this.get("tReportIsGettingGenerated");
      const that = this;
      const fileId = this.get("file.id");
      const url = [ENV.endpoints.signedPdfUrl, fileId].join('/');
      this.set("isDownloadingReport", true);
      this.get("ajax").request(url)
      .then(function(result){
        if(!that.isDestroyed) {
          window.location = result.url;
          that.set("isDownloadingReport", false);
        }
      })
      .catch(function() {
        that.set("isDownloadingReport", false);
        that.get("notify").error(tReportIsGettingGenerated);
      });
    },

    dynamicScan() {
      const file = this.get("file");
      file.setBootingStatus();
      const that = this;
      const file_id = this.get("file.id");
      const dynamicUrl = [ENV.endpoints.dynamic, file_id].join('/');
      this.get("ajax").request(dynamicUrl)
      .catch(function(error) {
        file.setNone();
        that.get("notify").error(error.payload.error);
      });
    },

    setAPIScanOption() {
      const tStartingScan = this.get("tStartingScan");
      const isApiScanEnabled = this.get("isApiScanEnabled");
      const project_id = this.get("file.project.id");
      const apiScanOptions = [ENV.host,ENV.namespace, ENV.endpoints.apiScanOptions, project_id].join('/');
      const that = this;
      const data =
        {isApiScanEnabled};
      this.get("ajax").post(apiScanOptions, {data})
      .then(function(){
        that.get("notify").success(tStartingScan);
        if(!that.isDestroyed) {
          that.send("closeModal");
          that.send("dynamicScan");
        }
      })
      .catch(function(error) {
        that.get("notify").error(error.payload.error);
      });
    },

    doNotRunAPIScan() {
      triggerAnalytics('feature', ENV.csb.runDynamicScan);
      this.set("isApiScanEnabled", false);
      this.send("setAPIScanOption");
    },

    runAPIScan() {
      triggerAnalytics('feature', ENV.csb.runAPIScan);
      this.set("isApiScanEnabled", true);
      this.send("setAPIScanOption");
    },

    showURLFilter(param){
      this.set("showAPIURLFilterScanModal", true);
      if (param === 'api') {
        this.set("showAPIScanModal", false);
        this.set("apiScanModal", true);
        this.set("dynamicScanModal", false);
      }
      if (param === 'dynamic') {
        this.set("showRunDynamicScanModal", false);
        this.set("dynamicScanModal", true);
        this.set("apiScanModal", false);
      }
    },

    loginRequired() {
      const loginRequiredText = this.$('#app-login-required').val();
      this.set("manualscan.loginRequired", false);
      if (loginRequiredText === "yes") {
        this.set("manualscan.loginRequired", true);
      }
    },

    vpnRequired() {
      const vpnRequired = this.$('#vpn-required').val();
      this.set("manualscan.vpnRequired", false);
      if (vpnRequired === "yes") {
        this.set("manualscan.vpnRequired", true);
      }
    },

    requiredAppAction() {
      const appAction = parseInt(this.$('#required-app-action').val());
      if (appAction === ENUMS.APP_ACTION.PROCEED) {
        this.set("manualscan.showProceedText", true);
      } else if (appAction === ENUMS.APP_ACTION.HALT) {
        this.set("manualscan.showHaltText", true);
      } else {
        this.set("manualscan.showProceedText", false);
        this.set("manualscan.showHaltText", false);
      }
      this.set("manualscan.filteredAppAction", appAction);
    },

    selectAppEnvironment() {
      const appEnv = this.$('#app-env').val();
      this.set("manualscan.filteredAppEnv", appEnv);
    },

    openRemoveUserRoleConfirmBox(param){
      this.set("deletedRole", param);
      this.set("showRemoveRoleConfirmBox", true);
    },

    displayAppInfo() {
      this.set("isBasicInfo", !this.get("isBasicInfo"));
      this.set('isLoginDetails', false);
      this.set('isVPNDetails', false);
    },

    displayLoginDetails() {
      this.set('isBasicInfo', false);
      this.set('isLoginDetails', !this.get("isLoginDetails"));
      this.set('isVPNDetails', false);
    },

    displayVPNDetails() {
      this.set('isBasicInfo', false);
      this.set('isLoginDetails', false);
      this.set('isVPNDetails', !this.get("isVPNDetails"));
    },

    addUserRole() {
      const newUserRole = this.get("newUserRole");
      const username = this.get("username");
      const password = this.get("password");
      const tRoleAdded = this.get("tRoleAdded");
      const tPleaseEnterAllValues = this.get("tPleaseEnterAllValues");
      for (let inputValue of [newUserRole, username, password]) {
        if (isEmpty(inputValue)) { return this.get("notify").error(tPleaseEnterAllValues); }
      }
      let userRoles = this.get("manualscan.userRoles");
      let roleId = this.get("roleId");
      roleId = roleId + 1;
      const userRole = {
        "id": roleId,
        "role": newUserRole,
        "username": username,
        "password": password
      };
      if (Ember.isEmpty(userRoles)) {
        userRoles = [];
      }
      userRoles.addObject(userRole);
      this.set("manualscan.userRoles", userRoles);
      this.set("roleId", roleId);
      this.get("notify").success(tRoleAdded);
      this.setProperties({
        newUserRole: "",
        username: "",
        password: ""
        });
    },

    saveManualScanForm() {
      const appName = this.get("file.name");
      const appEnv =  this.get("manualscan.filteredAppEnv");
      const appAction =  this.get("manualscan.filteredAppAction");
      const minOsVersion = this.get("manualscan.minOsVersion");

      const contactName = this.get("manualscan.contact.name");
      const contactEmail = this.get("manualscan.contact.email");

      const contact = {
        name: contactName,
        email: contactEmail
      };

      const tPleaseEnterUserRoles = this.get("tPleaseEnterUserRoles");

      const loginRequired =  this.get("manualscan.loginRequired");
      const userRoles = this.get("manualscan.userRoles");

      if (loginRequired) {
        if (isEmpty(userRoles)) { return this.get("notify").error(tPleaseEnterUserRoles); }
      }

      if (userRoles) {
        userRoles.forEach(userRole => delete userRole.id);
      }

      const tPleaseEnterVPNDetails = this.get("tPleaseEnterVPNDetails");

      const vpnRequired = this.get("manualscan.vpnRequired");

      const vpnAddress =  this.get("manualscan.vpnDetails.address");
      const vpnPort =  this.get("manualscan.vpnDetails.port");

      if (vpnRequired) {
        for (let inputValue of [vpnAddress, vpnPort]) {
          if (isEmpty(inputValue)) { return this.get("notify").error(tPleaseEnterVPNDetails); }
        }
      }

      const vpnUsername =  this.get("manualscan.vpnDetails.username");
      const vpnPassword =  this.get("manualscan.vpnDetails.password");

      const vpnDetails = {
        address: vpnAddress,
        port: vpnPort,
        username: vpnUsername,
        password: vpnPassword
      };

      const additionalComments = this.get("manualscan.additionalComments");

      const data = {
        app_name: appName,
        app_env: appEnv,
        min_os_version: minOsVersion,
        app_action: appAction,
        login_required: loginRequired,
        user_roles: userRoles,
        vpn_required: vpnRequired,
        vpn_details: vpnDetails,
        contact,
        additional_comments: additionalComments
      };

      const that = this;
      const tManualRequested = this.get("tManualRequested");
      this.set("isRequestingManual", true);
      const fileId = this.get("file.id");
      const url = [ENV.endpoints.manualscans, fileId].join('/');
      this.get("ajax").put(url, {data: JSON.stringify(data), contentType: 'application/json'})
      .then(function() {
        triggerAnalytics('feature', ENV.csb.requestManualScan);
        that.get("notify").info(tManualRequested);
        if(!that.isDestroyed) {
          that.set("isRequestingManual", false);
          that.set("file.ifManualNotRequested", false);
          that.set("showManualScanModal", false);
          that.set("showManualScanFormModal", false);
        }
      })
      .catch(function(error) {
        that.set("isRequestingManual", false);
        that.get("notify").error(error.payload.error);
      });
    },

    openAPIScanModal() {
      const platform = this.get("file.project.platform");
      if ([ENUMS.PLATFORM.ANDROID,ENUMS.PLATFORM.IOS].includes(platform)) { // TEMPIOSDYKEY
        this.set("showAPIScanModal", true);
      } else {
        this.send("doNotRunAPIScan");
      }
    },

    goBack() {
      this.set("showAPIURLFilterScanModal", false);
      if (this.get("apiScanModal")) {
        this.set("showAPIScanModal", true);
      }
      if (this.get("dynamicScanModal")) {
        this.set("showRunDynamicScanModal", true);
      }
    },

    closeModal() {
      this.set("showAPIScanModal", false);
      this.set("showAPIURLFilterScanModal", false);
      this.set("showRunDynamicScanModal", false);
    },

    closeSubscribeModal() {
      this.set("showSubscribeModal", false);
    },

    openSubscribeModal() {
      this.set("showSubscribeModal", true);
    },

    openManualScanModal() {
      this.set("showManualScanModal", true);
    },

    closeManualScanModal() {
      this.set("showManualScanModal", false);
    },

    openRescanModal() {
      this.set("showRescanModal", true);
    },

    closeRescanModal() {
      this.set("showRescanModal", false);
    },

    openRunDynamicScanModal() {
      this.set("showRunDynamicScanModal", true);
    },

    closeRunDynamicScanModal() {
      this.set("showRunDynamicScanModal", false);
    },

    subscribePlan() {
      window.location.href = "/billing";
    },

    dynamicShutdown() {
      const file = this.get("file");
      const that = this;
      file.setShuttingDown();
      this.set("isPoppedOut", false);
      const file_id = this.get("file.id");
      const shutdownUrl = [ENV.endpoints.dynamicShutdown, file_id].join('/');
      this.get("ajax").request(shutdownUrl)
      .then(function() {
        if(!that.isDestroyed) {
          file.setNone();
        }
      })
      .catch(function(error) {
        file.setNone();
        that.get("notify").error(error.payload.error);
      });
    },

    rescanApp() {
      const tRescanInitiated = this.get("tRescanInitiated");
      const that = this;
      const fileId = this.get("file.id");
      const data =
        {file_id: fileId};
      this.set("isStartingRescan", true);
      this.get("ajax").post(ENV.endpoints.rescan, {data})
      .then(function() {
        that.get("notify").info(tRescanInitiated);
        if(!that.isDestroyed) {
          that.set("isStartingRescan", false);
          that.set("showRescanModal", false);
        }
      })
      .catch(function(error) {
        that.set("isStartingRescan", false);
        that.get("notify").error(error.payload.error);
      });
    }
  }
});

export default FileHeaderComponent;
