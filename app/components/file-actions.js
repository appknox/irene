import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import ENUMS from 'irene/enums';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

export default Component.extend({

  i18n: service(),

  tPleaseTryAgain: t('pleaseTryAgain'),

  vulnerabilities: computed(function() {
    const store = this.get("store");
    return store.query("security/vulnerability", {'limit':0})
    .then(
      data => store.query("security/vulnerability", {'limit':data.meta.count})
    )
  }),

  fileDetails: computed(function() {
    const fileid = this.get("file.fileid");
    return this.get("store").findRecord("security/file", fileid);
  }),

  ireneFilePath: computed(function() {
    const fileid = this.get("file.fileid");
    const ireneHost = ENV.ireneHost;
    return [ireneHost, "file", fileid].join('/');
  }),

  setApiScanStatus: task(function * () {
    let isApiDone = this.$("#api-scan-status").prop('checked');
    let apiScanStatus = ENUMS.SCAN_STATUS.UNKNOWN;
    if(isApiDone) apiScanStatus = ENUMS.SCAN_STATUS.COMPLETED;
    const file = yield this.get("fileDetails")
    file.set('apiScanStatus', apiScanStatus);
    yield file.save();
  }).evented(),

  setApiScanStatusSucceeded: on('setApiScanStatus:succeeded', function() {
    this.get('notify').success('Successfully saved the API scan status');
  }),

  setApiScanStatusErrored: on('setApiScanStatus:errored', function(_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message;
    }
    this.get("notify").error(errMsg);
  }),

  openPurgeAPIAnalysisConfirmBox: task(function * () {
    yield this.set('showPurgeAPIAnalysisConfirmBox', true);
  }),

  confirmPurge: task(function * () {
    this.set('isPurgingAPIAnalysis', true);
    const fileid = this.get("file.fileid");
    const url = [ENV.endpoints.files,fileid, ENV.endpoints.purgeAPIAnalyses].join('/');
    return yield this.get("ajax").post(url, { namespace: 'api/hudson-api'})
  }).evented(),

  confirmPurgeSucceeded: on('confirmPurge:succeeded', function() {
    const fileid = this.get("file.fileid");
    this.get("store").findRecord("security/file", fileid);
    this.get('notify').success('Successfully Purged the Analysis');
    this.set('isPurgingAPIAnalysis', false);
    this.set('showPurgeAPIAnalysisConfirmBox', false);
  }),

  confirmPurgeErrored: on('confirmPurge:errored', function(_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message;
    }

    this.get("notify").error(errMsg);

    this.set('isPurgingAPIAnalysis', false);
  }),

  openAddAnalysisModal: task(function *() {
    yield this.set("showAddAnalysisModal", true);
  }),

  selectVulnerabilty: task(function *(value) {
    yield this.set("selectedVulnerability", value);
  }).evented(),

  downloadApp: task(function *() {
    const fileid = this.get("file.fileid");
    const url = [ENV.endpoints.apps, fileid].join('/');
    const data = yield this.get("ajax").request(url, { namespace: 'api/hudson-api'})
    window.location = data.url;
  }),

  downloadAppErrored: on('downloadApp:errored', function(_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message;
    }
    this.get("notify").error(errMsg);
  }),

  downloadReportExcel: task(function *() {
    const fileid = this.get("file.fileid");
    const url = [ENV.endpoints.reports, fileid, 'download_url'].join('/');
    const data = yield this.get("ajax").request(url, { namespace: 'api/hudson-api'});
    window.location.href = data.xlsx;
  }),

  downloadReportExcelErrored: on('downloadReportExcel:errored', function(_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message;
    }
    this.get("notify").error(errMsg);
  }),

  addAnalysis: task(function *() {
    const vulnerability = this.get("selectedVulnerability");
    const file = this.get("fileDetails");

    if(isEmpty(vulnerability)) {
      return this.get("notify").error("Please select a vulnerability");
    }

    const analysis = yield this.get("store").createRecord(
      'security/analysis', {
        vulnerability: vulnerability,
        file: file
      }
    );
    try {
      yield analysis.save();
    }
    catch(e) {
      analysis.unloadRecord();
      throw e;
    }
  }).evented(),

  addAnalysisSucceeded: on('addAnalysis:succeeded', function() {
    this.set("showAddAnalysisModal", false);
    this.get("notify").success("Analysis Added Successfully");
  }),

  addAnalysisErrored: on('addAnalysis:errored', function(_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message;
    }
    this.get("notify").error(errMsg);
  }),

  actions: {
    generateReport() {
      const fileid = this.get("file.fileid");
      const emails = this.get("emails");
      let data = {
      };
      if(!isEmpty(emails)) {
        data = {
          emails: emails.split(",").map(item => item.trim())
        };
      }
      this.set("isGeneratingReport", true);
      const url = [ENV.endpoints.reports, fileid].join('/');
      return this.get("ajax").put(url, { namespace: 'api/hudson-api', data, contentType: 'application/json'})
      .then(() => {
        this.set("isGeneratingReport", false);
        this.set("reportGenerated", true);
        this.set("emailIDs", emails.split(','));
        this.set("emails", "");
      }, (error) => {
        this.set("isGeneratingReport", false);
        for (error of error.errors) {
          this.get("notify").error(error.detail.error);
        }
      });
    },

    openGenerateReportModal() {
      this.set("reportGenerated", false);
      this.set("showGenerateReportModal", true);
    },

    confirmPurgeAPIAnalysisConfirmBox() {
      this.get('confirmPurge').perform();
    }
  }

});
