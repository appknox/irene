import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import { waitForPromise } from '@ember/test-waiters';
import type OrganizationService from 'irene/services/organization';
import type ProjectModel from 'irene/models/project';
import type ProfileModel from 'irene/models/profile';
import type { SaveReportPreferenceData } from 'irene/models/profile';

interface ProjectSettingsAnalysisSettingsReportPreferenceSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsAnalysisSettingsReportPreferenceComponent extends Component<ProjectSettingsAnalysisSettingsReportPreferenceSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;

  @tracked profile: ProfileModel | null = null;

  get project() {
    return this.args.project;
  }

  get reportPreference() {
    return this.profile?.reportPreference;
  }

  get reportPreferenceOptions() {
    return [
      {
        label: this.intl.t('dynamicScan'),
        onChecboxClick: this.saveDynamic,
        checked: this.reportPreference?.show_dynamic_scan,
        isSaving: this.saveDynamicReportPreference.isRunning,
        hidden: false,
      },
      {
        label: this.intl.t('apiScan'),
        onChecboxClick: this.saveAPI,
        checked: this.reportPreference?.show_api_scan,
        isSaving: this.saveAPIReportPreference.isRunning,
        hidden: false,
      },
      {
        label: this.intl.t('manualScan'),
        onChecboxClick: this.saveManual,
        checked: this.reportPreference?.show_manual_scan,
        isSaving: this.saveManualReportPreference.isRunning,
        hidden: !this.project?.isManualScanAvailable,
      },
      {
        label: this.intl.t('knoxIq.needsReviewAnalyses'),
        onChecboxClick: this.saveNeedsReviewAnalyses,
        checked: this.reportPreference?.show_needs_review_analyses,
        isSaving: this.saveNeedsReviewAnalysesReportPreference.isRunning,
        hidden: !this.organization.isKnoxIqEnabled,
      },
    ];
  }

  @action getProfie() {
    this.getProfileTask.perform();
  }

  @action saveDynamic(event: Event) {
    const target = event.target as HTMLInputElement;
    this.saveDynamicReportPreference.perform(target.checked);
  }

  @action saveManual(event: Event) {
    const target = event.target as HTMLInputElement;
    this.saveManualReportPreference.perform(target.checked);
  }

  @action saveAPI(event: Event) {
    const target = event.target as HTMLInputElement;
    this.saveAPIReportPreference.perform(target.checked);
  }

  @action saveNeedsReviewAnalyses(event: Event) {
    const target = event.target as HTMLInputElement;
    this.saveNeedsReviewAnalysesReportPreference.perform(target.checked);
  }

  saveDynamicReportPreference = task(async (checked: boolean) => {
    await waitForPromise(
      this.saveReportPreference.perform({ show_dynamic_scan: checked })
    );
  });

  saveAPIReportPreference = task(async (checked: boolean) => {
    await waitForPromise(
      this.saveReportPreference.perform({ show_api_scan: checked })
    );
  });

  saveManualReportPreference = task(async (checked: boolean) => {
    await waitForPromise(
      this.saveReportPreference.perform({ show_manual_scan: checked })
    );
  });

  saveNeedsReviewAnalysesReportPreference = task(async (checked: boolean) => {
    await waitForPromise(
      this.saveReportPreference.perform({
        show_needs_review_analyses: checked,
      })
    );
  });

  /**
   * The endpoint takes the whole preference set, so the toggled field is
   * layered over what is currently stored.
   */
  saveReportPreference = task(
    async (changes: Partial<SaveReportPreferenceData>) => {
      const profile = this.store.peekRecord(
        'profile',
        String(this.profile?.id)
      );

      await profile?.saveReportPreference({
        show_dynamic_scan: !!this.reportPreference?.show_dynamic_scan,
        show_api_scan: !!this.reportPreference?.show_api_scan,
        show_manual_scan: !!this.reportPreference?.show_manual_scan,
        show_needs_review_analyses:
          !!this.reportPreference?.show_needs_review_analyses,
        ...changes,
      });
    }
  );

  getProfileTask = task(async () => {
    const profileId = this.project?.activeProfileId;
    this.profile = await this.store.findRecord('profile', String(profileId));
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::AnalysisSettings::ReportPreference': typeof ProjectSettingsAnalysisSettingsReportPreferenceComponent;
  }
}
