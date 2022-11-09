import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class ReportPreferenceComponent extends Component {
  @service store;
  @service organization;

  @tracked profile = null;

  get project() {
    return this.args.project;
  }

  get manualScanIsDisabled() {
    return !this.organization.selected.features.manualscan;
  }

  get reportPreference() {
    return this.profile?.reportPreference;
  }

  @action getProfie() {
    this.getProfileTask.perform();
  }

  @action saveDynamic(event) {
    this.saveDynamicReportPreference.perform(event.target.checked);
  }

  @action saveManual(event) {
    this.saveManualReportPreference.perform(event.target.checked);
  }

  @action saveAPI(event) {
    this.saveAPIReportPreference.perform(event.target.checked);
  }

  @task(function* (value) {
    const dynamicScan = value;
    const apiScan = this.reportPreference.show_api_scan;
    const manualScan = this.reportPreference.show_manual_scan;
    yield this.saveReportPreference.perform(dynamicScan, apiScan, manualScan);
  })
  saveDynamicReportPreference;

  @task(function* (value) {
    const dynamicScan = this.reportPreference.show_dynamic_scan;
    const apiScan = value;
    const manualScan = this.reportPreference.show_manual_scan;
    yield this.saveReportPreference.perform(dynamicScan, apiScan, manualScan);
  })
  saveAPIReportPreference;

  @task(function* (value) {
    const dynamicScan = this.reportPreference.show_dynamic_scan;
    const apiScan = this.reportPreference.show_api_scan;
    const manualScan = value;
    yield this.saveReportPreference.perform(dynamicScan, apiScan, manualScan);
  })
  saveManualReportPreference;

  @task(function* (dynamicScan, apiScan, manualScan) {
    const profile = this.store.peekRecord('profile', this.profile.id);

    yield profile.saveReportPreference({
      show_dynamic_scan: dynamicScan,
      show_api_scan: apiScan,
      show_manual_scan: manualScan,
    });
  })
  saveReportPreference;

  @task(function* () {
    const profileId = this.project?.activeProfileId;
    if (!profileId) {
      this.profile = null;
    }
    const profile = yield this.store.findRecord('profile', profileId);
    this.profile = profile;
  })
  getProfileTask;
}
