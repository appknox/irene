import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import ProjectModel from 'irene/models/project';
import ProfileModel from 'irene/models/profile';

interface ReportPreferenceSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ReportPreferenceComponent extends Component<ReportPreferenceSignature> {
  @service declare store: Store;

  @tracked profile: ProfileModel | any = null;

  get project() {
    return this.args.project;
  }

  get reportPreference() {
    return this.profile?.reportPreference;
  }

  @action getProfie() {
    this.getProfileTask.perform();
  }

  @action saveDynamic(event: any) {
    this.saveDynamicReportPreference.perform(event.target.checked);
  }

  @action saveManual(event: any) {
    this.saveManualReportPreference.perform(event.target.checked);
  }

  @action saveAPI(event: any) {
    this.saveAPIReportPreference.perform(event.target.checked);
  }

  saveDynamicReportPreference = task(async (value) => {
    const dynamicScan = value;
    const apiScan = this.reportPreference?.show_api_scan;
    const manualScan = this.reportPreference?.show_manual_scan;
    await this.saveReportPreference.perform(dynamicScan, apiScan, manualScan);
  });

  saveAPIReportPreference = task(async (value) => {
    const dynamicScan = this.reportPreference.show_dynamic_scan;
    const apiScan = value;
    const manualScan = this.reportPreference.show_manual_scan;
    await this.saveReportPreference.perform(dynamicScan, apiScan, manualScan);
  });

  saveManualReportPreference = task(async (value) => {
    const dynamicScan = this.reportPreference.show_dynamic_scan;
    const apiScan = this.reportPreference.show_api_scan;
    const manualScan = value;
    await this.saveReportPreference.perform(dynamicScan, apiScan, manualScan);
  });

  saveReportPreference = task(async (dynamicScan, apiScan, manualScan) => {
    const profile = this.store.peekRecord('profile', this.profile.id);

    await profile?.saveReportPreference({
      show_dynamic_scan: dynamicScan,
      show_api_scan: apiScan,
      show_manual_scan: manualScan,
    });
  });

  getProfileTask = task(async () => {
    const profileId = this.project?.activeProfileId;
    if (profileId) {
      const profile = await this.store.findRecord('profile', profileId);
      this.profile = profile;
    } else {
      this.profile = null;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ReportPreference: typeof ReportPreferenceComponent;
    'report-preference': typeof ReportPreferenceComponent;
  }
}
