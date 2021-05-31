import Component from '@ember/component';
import {
  inject as service
} from '@ember/service';
import {
  computed
} from '@ember/object';
import {
  isEmpty
} from '@ember/utils';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import {
  task
} from 'ember-concurrency';
import {
  on
} from '@ember/object/evented';
import {
  t
} from 'ember-intl';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import ClipboardJS from 'clipboard/src/clipboard';
import {
  FILE_TAG_MAX_CHAR
} from 'irene/utils/constants';

import {
  checkStringCharRange
} from 'irene/utils/utils';

const FileHeaderComponent = Component.extend({

  localClassNames: ['file-header'],
  roleId: 0,
  progress: 0,
  userRoles: [],
  globalAlpha: 0.4,
  radiusRatio: 0.9,
  isBasicInfo: false,
  isVPNDetails: false,
  isScanDetails: true,
  isLoginDetails: false,
  isOWASPDetails: false,
  isStartingRescan: false,
  isRequestingManual: false,
  isDownloadingReport: false,
  showManualScanFormModal: false,
  showRemoveRoleConfirmBox: false,
  showAddTagBtn: true,
  showAddTagForm: false,

  intl: service(),
  trial: service(),
  ajax: service(),
  organization: service(),
  notify: service('notifications'),

  vpnStatuses: ["yes", "no"],
  loginStatuses: ["yes", "no"],
  appActions: ENUMS.APP_ACTION.CHOICES.slice(0, -1),
  environments: ENUMS.APP_ENV.CHOICES.slice(0, -1),
  newTag: '',

  tPasswordCopied: t("passwordCopied"),
  tPleaseTryAgain: t("pleaseTryAgain"),
  tManualRequested: t("manualRequested"),
  tRescanInitiated: t("rescanInitiated"),
  tAccessRequested: t("accessRequested"),
  tRoleAdded: t("modalCard.manual.roleAdded"),
  tReportIsGettingGenerated: t("reportIsGettingGenerated"),
  tPleaseEnterAllValues: t("modalCard.manual.pleaseEnterAllValues"),
  tPleaseEnterUserRoles: t("modalCard.manual.pleaseEnterUserRoles"),
  tPleaseEnterVPNDetails: t("modalCard.manual.pleaseEnterVPNDetails"),

  invalidNewTag: computed('newTag', function () {
    const tag = this.get('newTag');
    return !checkStringCharRange(tag, 1, FILE_TAG_MAX_CHAR);
  }),

  manualscan: computed('file.id', 'store', function () {
    const fileId = this.get("file.id");
    return this.get("store").findRecord("manualscan", fileId);
  }),

  unknownAnalysisStatus: computed('file.profile.id', 'store', function () {
    return this.get("store").queryRecord('unknown-analysis-status', {
      id: this.get("file.profile.id")
    });
  }),

  analyses: computed.reads('file.sortedAnalyses'),

  filteredEnvironments: computed("environments", "manualscan.filteredAppEnv", function () {
    const environments = this.get("environments");
    const appEnv = parseInt(this.get("manualscan.filteredAppEnv"));
    return environments.filter(env => appEnv !== env.value);
  }),

  filteredAppActions: computed("appActions", "manualscan.filteredAppAction", function () {
    const appActions = this.get("appActions");
    const appAction = parseInt(this.get("manualscan.filteredAppAction"));
    return appActions.filter(action => appAction !== action.value);
  }),

  filteredLoginStatuses: computed("loginStatuses", "manualscan.loginStatus", function () {
    const loginStatuses = this.get("loginStatuses");
    const loginStatus = this.get("manualscan.loginStatus");
    return loginStatuses.filter(status => loginStatus !== status);
  }),

  filteredVpnStatuses: computed("vpnStatuses", "manualscan.vpnStatus", function () {
    const vpnStatuses = this.get("vpnStatuses");
    const vpnStatus = this.get("manualscan.vpnStatus");
    return vpnStatuses.filter(status => vpnStatus !== status);
  }),

  chartOptions: (() =>
    ({
      legend: {
        display: false
      },
      animation: {
        animateRotate: false
      },
      responsive: false,
    })
  ).property(),

  barChartOptions: (() =>
    ({
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data['tooltips'][tooltipItem[0]['index']];
          }
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            stepSize: 3
          }
        }]
      },
      responsive: false,
    })
  ).property(),

  didInsertElement() {
this._super(...arguments);
    const tPasswordCopied = this.get("tPasswordCopied");
    const tPleaseTryAgain = this.get("tPleaseTryAgain");
    // eslint-disable-next-line no-undef
    const clipboard = new ClipboardJS('.copy-password');
    this.set("clipboard", clipboard)
    clipboard.on('success', (e) => {
      this.get("notify").info(tPasswordCopied);
      e.clearSelection();
    });
    clipboard.on('error', () => this.get("notify").error(tPleaseTryAgain));
  },

  willDestroyElement() {
this._super(...arguments);
    const clipboard = this.get("clipboard");
    clipboard.destroy();
  },

  confirmCallback() {
    const availableRoles = this.get("availableRoles");
    this.set("manualscan.userRoles", availableRoles);
    this.set("showRemoveRoleConfirmBox", false);
  },

  allUserRoles: computed('manualscan.userRoles', 'roleId', function () {
    const userRoles = this.get("manualscan.userRoles");
    let roleId = this.get("roleId")
    userRoles.forEach((role) => {
      roleId = roleId + 1;
      role.id = roleId;
      return this.set("roleId", roleId); // eslint-disable-line
    });
    return userRoles;
  }),

  availableRoles: computed.filter('allUserRoles', function (userRole) {
    const {
      id
    } = userRole;
    const deletedRole = this.get("deletedRole");
    return id !== deletedRole;
  }),

  userRoleCount: computed.alias('manualscan.userRoles.length'),

  hasUserRoles: computed.gt('userRoleCount', 0),

  scanDetailsClass: computed('isScanDetails', function () {
    if (this.get('isScanDetails')) {
      return 'is-active';
    }
  }),

  owaspDetailsClass: computed('isOWASPDetails', function () {
    if (this.get('isOWASPDetails')) {
      return 'is-active';
    }
  }),

  owasps: computed('analyses', function () {
    const analyses = this.get("analyses");
    var owasps = [];
    const risks = [ENUMS.RISK.CRITICAL, ENUMS.RISK.HIGH, ENUMS.RISK.MEDIUM, ENUMS.RISK.LOW];
    for (let analysis of analyses) {
      analysis.get("owasp").forEach((owasp) => {
        if (risks.includes(analysis.get("risk"))) {
          owasps.push(owasp.id);
        }
      });
    }
    return owasps
  }),

  owaspData: computed("owasps", "owaspA5Count", "owaspA3Count", function () {
    const owasps = this.get("owasps");
    var owaspA1Count = 0,
      owaspA2Count = 0,
      owaspA3Count = 0,
      owaspA4Count = 0,
      owaspA5Count = 0,
      owaspA6Count = 0,
      owaspA7Count = 0,
      owaspA8Count = 0,
      owaspA9Count = 0,
      owaspA10Count = 0,
      owaspM1Count = 0,
      owaspM2Count = 0,
      owaspM3Count = 0,
      owaspM4Count = 0,
      owaspM5Count = 0,
      owaspM6Count = 0,
      owaspM7Count = 0,
      owaspM8Count = 0,
      owaspM9Count = 0,
      owaspM10Count = 0;
    owasps.forEach((owasp) => {
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
          "Improper Platform Usage", "Insecure Data Storage", "Insecure Communication",
          "Insecure Authentication", "Insufficient Cryptography", "Insecure Authorization",
          "Client Code Quality", "Code Tampering", "Reverse Engineering", "Extraneous Functionality"
        ],
        datasets: [{
          label: 'OWASP MOBILE CATEGORIES',
          data: [
            owaspM1Count, owaspM2Count, owaspM3Count, owaspM4Count, owaspM5Count,
            owaspM6Count, owaspM7Count, owaspM8Count, owaspM9Count, owaspM10Count
          ],
          backgroundColor: [
            "#00008b", "#00008b", "#00008b", "#00008b", "#00008b",
            "#00008b", "#00008b", "#00008b", "#00008b", "#00008b",
          ]
        }]
      },
      web: {
        labels: [
          'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10'
        ],
        tooltips: [
          "Injection", "Broken Authentication and Session Management", "Cross Site Scripting",
          "IDOR", "Security Misconfiguration", "Sensitive Data Exposure", "Missing function ACL", "CSRF",
          "Using components with known vulnerabilities", "Unvalidated Redirects and Forwards"
        ],
        datasets: [{
          label: 'OWASP WEB CATEGORIES',
          data: [
            owaspA1Count, owaspA2Count, owaspA3Count, owaspA4Count, owaspA5Count,
            owaspA6Count, owaspA7Count, owaspA8Count, owaspA9Count, owaspA10Count
          ],
          backgroundColor: [
            "#36A2EB", "#36A2EB", "#36A2EB", "#36A2EB", "#36A2EB",
            "#36A2EB", "#36A2EB", "#36A2EB", "#36A2EB", "#36A2EB",
          ]
        }]
      }
    };
  }),

  openRequestAccessModal: task(function* () {
    yield this.set("showRequestAccessModal", true);
  }),

  closeRequestAccessModal: task(function* () {
    yield this.set("showRequestAccessModal", false);
  }),

  requestAccess: task(function* () {
    const orgId = this.get("organization.selected.id");
    const url = [ENV.endpoints.organizations, orgId, ENV.endpoints.requestAccess].join('/');
    yield this.get("ajax").post(url);
  }).evented(),

  requestAccessSucceeded: on('requestAccess:succeeded', function () {
    const tAccessRequested = this.get("tAccessRequested");
    this.get("notify").success(tAccessRequested);
    this.set("showRequestAccessModal", false);
  }),

  requestAccessErrored: on('requestAccess:errored', function (_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),


  addTag: task(function* (tag) {
    if (tag) {
      const url = [ENV.endpoints.files, this.get('file.id'), ENV.endpoints.tags].join('/');
      yield this.get('ajax').post(url, {
        namespace: ENV.namespace_v2,
        data: {
          'name': tag,
        }
      });
      yield this.get('store').findRecord('file', this.get('file.id'));
    } else {
      throw Error('tag value cannot be blank');
    }
  }).evented(),

  addTagSucceeded: on('addTag:succeeded', function () {
    this.get('notify').success('Tag added');
    this.set('newTag', '');
    this.set('showAddTagBtn', true);
    this.set('showAddTagForm', false);
  }),

  addTagErrored: on('addTag:errored', function (_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.payload) {
      Object.keys(err.payload).forEach(p => {
        errMsg = err.payload[p]
        if (typeof (errMsg) !== "string") {
          errMsg = err.payload[p][0];
        }
        this.get('notify').error(errMsg);
      });
      return;
    } else if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),


  deleteTag: task(function* (tagId) {
    const url = [ENV.endpoints.files, this.get('file.id'), ENV.endpoints.tags, tagId].join('/');
    yield this.get('ajax').delete(url, {
      namespace: ENV.namespace_v2
    });
    yield this.get('store').findRecord('file', this.get('file.id'));
  }).evented(),

  deleteTagSucceeded: on('deleteTag:succeeded', function () {
    this.get('notify').success('Tag deleted');
  }),

  deleteTagErrored: on('deleteTag:errored', function (_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),


  actions: {
    displayScanDetails() {
      this.set('isScanDetails', true);
      this.set('isOWASPDetails', false);
    },

    displayOWASPDetails() {
      this.set('isScanDetails', false);
      this.set('isOWASPDetails', true);
    },

    displayAddTagForm() {
      this.set('showAddTagBtn', false);
      this.set('showAddTagForm', true);
    },

    hideAddTagForm() {
      this.set('showAddTagBtn', true);
      this.set('showAddTagForm', false);
    },

    getPDFReportLink() {
      triggerAnalytics('feature', ENV.csb.reportDownload);
      const tReportIsGettingGenerated = this.get("tReportIsGettingGenerated");
      const fileId = this.get("file.id");
      const url = [ENV.endpoints.signedPdfUrl, fileId].join('/');
      this.set("isDownloadingReport", true);
      this.get("ajax").request(url)
        .then((result) => {
          if (!this.isDestroyed) {
            window.location = result.url;
            this.set("isDownloadingReport", false);
            setTimeout(() => {
              this.set("showCopyPasswordModal", true);
            }, 3000);
          }
        }, (error) => {
          // eslint-disable-next-line no-console
          console.log(error);
          this.set("isDownloadingReport", false);
          this.get("notify").error(tReportIsGettingGenerated);
        });
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

    openRemoveUserRoleConfirmBox(param) {
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
        if (isEmpty(inputValue)) {
          return this.get("notify").error(tPleaseEnterAllValues);
        }
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
      if (isEmpty(userRoles)) {
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
      const appEnv = this.get("manualscan.filteredAppEnv");
      const appAction = this.get("manualscan.filteredAppAction");
      const minOsVersion = this.get("manualscan.minOsVersion");

      const contactName = this.get("manualscan.contact.name");
      const contactEmail = this.get("manualscan.contact.email");

      const contact = {
        name: contactName,
        email: contactEmail
      };

      const tPleaseEnterUserRoles = this.get("tPleaseEnterUserRoles");

      const loginRequired = this.get("manualscan.loginRequired");
      const userRoles = this.get("manualscan.userRoles");

      if (loginRequired) {
        if (isEmpty(userRoles)) {
          return this.get("notify").error(tPleaseEnterUserRoles);
        }
      }

      if (userRoles) {
        userRoles.forEach(userRole => delete userRole.id);
      }

      const tPleaseEnterVPNDetails = this.get("tPleaseEnterVPNDetails");

      const vpnRequired = this.get("manualscan.vpnRequired");

      const vpnAddress = this.get("manualscan.vpnDetails.address");
      const vpnPort = this.get("manualscan.vpnDetails.port");

      if (vpnRequired) {
        for (let inputValue of [vpnAddress, vpnPort]) {
          if (isEmpty(inputValue)) {
            return this.get("notify").error(tPleaseEnterVPNDetails);
          }
        }
      }

      const vpnUsername = this.get("manualscan.vpnDetails.username");
      const vpnPassword = this.get("manualscan.vpnDetails.password");

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

      const tManualRequested = this.get("tManualRequested");
      this.set("isRequestingManual", true);
      const fileId = this.get("file.id");
      const url = [ENV.endpoints.manualscans, fileId].join('/');
      this.get("ajax").put(url, {
          data: JSON.stringify(data),
          contentType: 'application/json'
        })
        .then(() => {
          triggerAnalytics('feature', ENV.csb.requestManualScan);
          this.get("notify").info(tManualRequested);
          if (!this.isDestroyed) {
            this.set("isRequestingManual", false);
            this.set("file.ifManualNotRequested", false);
            this.set("showManualScanModal", false);
            this.set("showManualScanFormModal", false);
          }
        }, (error) => {
          this.set("isRequestingManual", false);
          this.get("notify").error(error.payload.error);
        });
    },

    openManualScanModal() {
      triggerAnalytics('feature', ENV.csb.manualScanBtnClick);
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

    rescanApp() {
      const tRescanInitiated = this.get("tRescanInitiated");
      const fileId = this.get("file.id");
      const data = {
        file_id: fileId
      };
      this.set("isStartingRescan", true);
      this.get("ajax").post(ENV.endpoints.rescan, {
          data
        })
        .then(() => {
          this.get("notify").info(tRescanInitiated);
          if (!this.isDestroyed) {
            this.set("isStartingRescan", false);
            this.set("showRescanModal", false);
          }
        }, (error) => {
          this.set("isStartingRescan", false);
          this.get("notify").error(error.payload.detail);
          this.set("showRescanModal", false);
        });
    }
  }
});

export default FileHeaderComponent;
