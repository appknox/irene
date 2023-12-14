import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';

export default class FileActionsNewComponent extends Component {
  @service intl;
  @service store;
  @service notifications;
  @service ajax;

  @tracked selectedVulnerability = null;
  @tracked showPurgeAPIAnalysisConfirmBox = false;
  @tracked isPurgingAPIAnalysis = false;
  @tracked showAddAnalysisModal = false;
  @tracked vulnerabilities = null;

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  // to String because power-select has issues with 0
  // https://github.com/cibernox/ember-power-select/issues/962
  get manualToString() {
    const manual = this.file.manual;
    return String(manual);
  }

  get manualStatuses() {
    return ENUMS.MANUAL.CHOICES.filter((c) => c.key !== 'UNKNOWN').map((c) =>
      String(c.value)
    );
  }

  get file() {
    return this.args.file;
  }

  get fileId() {
    return this.file.get('id');
  }

  get projectId() {
    return this.file.project.get('id');
  }

  get ireneFilePath() {
    const fileId = this.file.id;
    const ireneHost = ENV.ireneHost;
    return [ireneHost, 'file', fileId].join('/');
  }

  @action openAddAnalysisModal() {
    this.showAddAnalysisModal = true;
  }

  @action closeAddAnalysisModal() {
    this.showAddAnalysisModal = false;
  }

  @action selectVulnerabilty(value) {
    this.selectedVulnerability = value;
  }

  @action confirmPurgeAPIAnalysisConfirmBox() {
    this.confirmPurge.perform();
  }

  @action selectManualScan(status) {
    this.updateManualScan.perform(status);
  }

  @action openPurgeAPIAnalysisConfirmBox() {
    this.showPurgeAPIAnalysisConfirmBox = true;
  }

  @task(function* (isApiDone) {
    const apiScanStatus = isApiDone
      ? ENUMS.SCAN_STATUS.COMPLETED
      : ENUMS.SCAN_STATUS.UNKNOWN;

    try {
      const file = yield this.file;
      file.set('apiScanStatus', apiScanStatus);
      yield file.save();
      this.notifications.success('Successfully saved the API scan status');
    } catch (error) {
      let errMsg = this.tPleaseTryAgain;
      if (error.errors && error.errors.length) {
        errMsg = error.errors[0].detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }
      this.notifications.error(errMsg);
    }
  })
  setApiScanStatus;

  @task(function* (isDynamicDone) {
    try {
      const file = yield this.file;
      file.set('isDynamicDone', isDynamicDone);
      yield file.save();
      this.notifications.success('Dynamic scan status updated');
    } catch (error) {
      let errMsg = this.tPleaseTryAgain;
      if (error.errors && error.errors.length) {
        errMsg = error.errors[0].detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }
      this.notifications.error(errMsg);
    }
  })
  setDynamicDone;

  @task(function* (status) {
    try {
      const file = yield this.file;
      file.set('manual', status);
      yield file.save();
      this.notifications.success('Manual Scan Status Updated');
    } catch (error) {
      let errMsg = this.tPleaseTryAgain;
      if (error.errors && error.errors.length) {
        errMsg = error.errors[0].detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }
      this.notifications.error(errMsg);
    }
  })
  updateManualScan;

  @task(function* () {
    this.isPurgingAPIAnalysis = true;

    const url = [
      ENV.endpoints.files,
      this.fileId,
      ENV.endpoints.purgeAPIAnalyses,
    ].join('/');

    yield this.ajax.post(url, { namespace: 'api/hudson-api' });

    try {
      this.store.findRecord('security/file', this.fileId);
      this.notifications.success('Successfully Purged the Analysis');
      this.isPurgingAPIAnalysis = false;
      this.showPurgeAPIAnalysisConfirmBox = false;
    } catch (error) {
      let errMsg = this.tPleaseTryAgain;
      if (error.errors && error.errors.length) {
        errMsg = error.errors[0].detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }

      this.notifications.error(errMsg);

      this.isPurgingAPIAnalysis = false;
    }
  })
  confirmPurge;

  @task(function* () {
    try {
      const url = [ENV.endpoints.apps, this.fileId].join('/');
      const data = yield this.ajax.request(url, {
        namespace: 'api/hudson-api',
      });
      window.location = data.url;
    } catch (error) {
      let errMsg = this.tPleaseTryAgain;
      if (error.errors && error.errors.length) {
        errMsg = error.errors[0].detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }
      this.notifications.error(errMsg);
    }
  })
  downloadApp;

  @task(function* () {
    const url = [ENV.endpoints.apps, this.fileId, 'modified'].join('/');
    const data = yield this.ajax.request(url, {
      namespace: 'api/hudson-api',
    });
    window.location = data.url;
  })
  downloadAppModified;

  @task(function* () {
    const vulnerability = this.selectedVulnerability;
    const file = this.file;

    if (isEmpty(vulnerability)) {
      return this.notifications.error('Please select a vulnerability');
    }

    const analysis = yield this.store.createRecord('security/analysis', {
      vulnerability: vulnerability,
      file: file,
    });

    try {
      yield analysis.save();
      this.showAddAnalysisModal = false;
      this.notifications.success('Analysis Added Successfully');
    } catch (error) {
      analysis.unloadRecord();
      let errMsg = this.tPleaseTryAgain;
      if (error.errors && error.errors.length) {
        errMsg = error.errors[0].detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }
      this.notifications.error(errMsg);
    }
  })
  addAnalysis;

  @task(function* () {
    const store = this.store;
    this.vulnerabilities = yield store
      .query('vulnerability', {
        projectId: this.projectId,
        limit: 0,
      })
      .then((data) =>
        store.query('vulnerability', {
          projectId: this.projectId,
          limit: data.meta.count,
        })
      );
  })
  getVulnerabilities;
}
