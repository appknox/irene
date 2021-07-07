import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import ENUMS from 'irene/enums';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import ENV from 'irene/config/environment';
import { t } from 'ember-intl';

export default Component.extend({
  intl: service(),
  tPleaseTryAgain: t('pleaseTryAgain'),

  manualStatuses: ENUMS.MANUAL.CHOICES.filter((c) => c.key !== 'UNKNOWN').map(
    (c) => String(c.value)
  ),
  // to String because power-select has issues with 0
  // https://github.com/cibernox/ember-power-select/issues/962
  manualToString: computed('file.manual', function () {
    const manual = this.get('file.manual');
    return String(manual);
  }),

  vulnerabilities: computed('file.project.id', 'store', function () {
    const projectId = this.get('file.project.id');
    const store = this.get('store');
    return store
      .query('security/vulnerability', { projectId, limit: 0 })
      .then((data) =>
        store.query('security/vulnerability', {
          projectId,
          limit: data.meta.count,
        })
      );
  }),

  ireneFilePath: computed('file.id', function () {
    const fileid = this.get('file.id');
    const ireneHost = ENV.ireneHost;
    return [ireneHost, 'file', fileid].join('/');
  }),

  setApiScanStatus: task(function* (isApiDone) {
    const apiScanStatus = isApiDone
      ? ENUMS.SCAN_STATUS.COMPLETED
      : ENUMS.SCAN_STATUS.UNKNOWN;
    const file = yield this.get('file');
    file.set('apiScanStatus', apiScanStatus);
    yield file.save();
  }).evented(),

  setApiScanStatusSucceeded: on('setApiScanStatus:succeeded', function () {
    this.get('notify').success('Successfully saved the API scan status');
  }),

  setApiScanStatusErrored: on('setApiScanStatus:errored', function (_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if (error.message) {
      errMsg = error.message;
    }
    this.get('notify').error(errMsg);
  }),

  setDynamicDone: task(function* (isDynamicDone) {
    const file = yield this.get('file');
    file.set('isDynamicDone', isDynamicDone);
    yield file.save();
  }).evented(),

  setDynamicDoneSucceeded: on('setDynamicDone:succeeded', function () {
    this.get('notify').success('Dynamic scan status updated');
  }),

  setDynamicDoneErrored: on('setDynamicDone:errored', function (_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if (error.message) {
      errMsg = error.message;
    }
    this.get('notify').error(errMsg);
  }),

  selectManualScan: task(function* (status) {
    const file = yield this.get('file');
    file.set('manual', status);
    yield file.save();
  }).evented(),

  selectManualScanSucceeded: on('selectManualScan:succeeded', function () {
    this.get('notify').success('Manual Scan Status Updated');
  }),

  selectManualScanErrored: on('selectManualScan:errored', function (_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),

  openPurgeAPIAnalysisConfirmBox: task(function* () {
    yield this.set('showPurgeAPIAnalysisConfirmBox', true);
  }),

  confirmPurge: task(function* () {
    this.set('isPurgingAPIAnalysis', true);
    const fileid = this.get('file.id');
    const url = [
      ENV.endpoints.files,
      fileid,
      ENV.endpoints.purgeAPIAnalyses,
    ].join('/');
    return yield this.get('ajax').post(url, { namespace: 'api/hudson-api' });
  }).evented(),

  confirmPurgeSucceeded: on('confirmPurge:succeeded', function () {
    const fileid = this.get('file.id');
    this.get('store').findRecord('security/file', fileid);
    this.get('notify').success('Successfully Purged the Analysis');
    this.set('isPurgingAPIAnalysis', false);
    this.set('showPurgeAPIAnalysisConfirmBox', false);
  }),

  confirmPurgeErrored: on('confirmPurge:errored', function (_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if (error.message) {
      errMsg = error.message;
    }

    this.get('notify').error(errMsg);

    this.set('isPurgingAPIAnalysis', false);
  }),

  openAddAnalysisModal: task(function* () {
    yield this.set('showAddAnalysisModal', true);
  }),

  selectVulnerabilty: task(function* (value) {
    yield this.set('selectedVulnerability', value);
  }).evented(),

  downloadApp: task(function* () {
    const fileid = this.get('file.id');
    const url = [ENV.endpoints.apps, fileid].join('/');
    const data = yield this.get('ajax').request(url, {
      namespace: 'api/hudson-api',
    });
    window.location = data.url;
  }),

  downloadAppModified: task(function* () {
    const fileid = this.get('file.id');
    const url = [ENV.endpoints.apps, fileid, 'modified'].join('/');
    const data = yield this.get('ajax').request(url, {
      namespace: 'api/hudson-api',
    });
    window.location = data.url;
  }),
  downloadAppErrored: on('downloadApp:errored', function (_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if (error.message) {
      errMsg = error.message;
    }
    this.get('notify').error(errMsg);
  }),

  fetchSignedReportURL: task(function* () {
    const fileid = this.get('file.id');
    const url = [ENV.endpoints.reports, fileid, 'download_url'].join('/');
    const data = yield this.get('ajax').request(url, {
      namespace: 'api/hudson-api',
    });
    return data;
  }),

  downloadReportExcel: task(function* () {
    const data = yield this.get('fetchSignedReportURL').perform();
    if (data.xlsx) {
      window.location.href = data.xlsx;
    }
  }),

  downloadReportExcelErrored: on(
    'downloadReportExcel:errored',
    function (_, error) {
      let errMsg = this.get('tPleaseTryAgain');
      if (error.errors && error.errors.length) {
        errMsg = error.errors[0].detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }
      this.get('notify').error(errMsg);
    }
  ),

  downloadReportHTMLja: task(function* () {
    const data = yield this.get('fetchSignedReportURL').perform();
    if (data.html_ja) {
      window.location.href = data.html_ja;
    }
  }),

  downloadReportHTMLen: task(function* () {
    const data = yield this.get('fetchSignedReportURL').perform();
    if (data.html_en) {
      window.location.href = data.html_en;
    }
  }),

  addAnalysis: task(function* () {
    const vulnerability = this.get('selectedVulnerability');
    const file = this.get('file');

    if (isEmpty(vulnerability)) {
      return this.get('notify').error('Please select a vulnerability');
    }

    const analysis = yield this.get('store').createRecord('security/analysis', {
      vulnerability: vulnerability,
      file: file,
    });
    try {
      yield analysis.save();
    } catch (e) {
      analysis.unloadRecord();
      throw e;
    }
  }).evented(),

  addAnalysisSucceeded: on('addAnalysis:succeeded', function () {
    this.set('showAddAnalysisModal', false);
    this.get('notify').success('Analysis Added Successfully');
  }),

  addAnalysisErrored: on('addAnalysis:errored', function (_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if (error.message) {
      errMsg = error.message;
    }
    this.get('notify').error(errMsg);
  }),

  actions: {
    generateReport() {
      const fileid = this.get('file.id');
      const emails = this.get('emails');
      let data = {};
      if (!isEmpty(emails)) {
        data = {
          emails: emails.split(',').map((item) => item.trim()),
        };
      }
      this.set('isGeneratingReport', true);
      const url = [ENV.endpoints.reports, fileid].join('/');
      return this.get('ajax')
        .put(url, {
          namespace: 'api/hudson-api',
          data,
          contentType: 'application/json',
        })
        .then(
          () => {
            this.set('isGeneratingReport', false);
            this.set('reportGenerated', true);
            this.set('emailIDs', emails.split(','));
            this.set('emails', '');
          },
          (error) => {
            this.set('isGeneratingReport', false);
            for (error of error.errors) {
              this.get('notify').error(error.detail.error);
            }
          }
        );
    },

    openGenerateReportModal() {
      this.set('reportGenerated', false);
      this.set('showGenerateReportModal', true);
    },

    confirmPurgeAPIAnalysisConfirmBox() {
      this.get('confirmPurge').perform();
    },
  },
});
