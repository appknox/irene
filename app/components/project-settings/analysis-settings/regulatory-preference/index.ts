import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import parseError from 'irene/utils/parse-error';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
import ProjectModel from 'irene/models/project';
import ProfileModel, {
  ProfileRegulatoryReportPreference,
} from 'irene/models/profile';

interface ProjectSettingsAnalysisSettingsRegulatoryPreferenceSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsAnalysisSettingsRegulatoryPreferenceComponent extends Component<ProjectSettingsAnalysisSettingsRegulatoryPreferenceSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked project: ProjectModel | null = null;
  @tracked profile: ProfileModel | null = null;

  constructor(
    owner: unknown,
    args: ProjectSettingsAnalysisSettingsRegulatoryPreferenceSignature['Args']
  ) {
    super(owner, args);
    this.fetchProfile.perform();
  }

  get regulatoryPrefCheckboxOptions() {
    return [
      {
        label: this.intl.t('pcidss'),
        title: this.intl.t('pcidssExpansion'),
        value: this.profile?.reportPreference.show_pcidss?.value,
        toggleHandler: this.onSavePcidss,
        resetHandler: this.onResetPcidss,
        isSaving: this.onSavePcidss.isRunning,
        isOverriden: !this.profile?.reportPreference.show_pcidss?.is_inherited,
      },
      {
        label: this.intl.t('hipaa'),
        title: this.intl.t('hipaaExpansion'),
        value: this.profile?.reportPreference.show_hipaa?.value,
        toggleHandler: this.onSaveHipaa,
        resetHandler: this.onResetHipaa,
        isSaving: this.onSaveHipaa.isRunning,
        isOverriden: !this.profile?.reportPreference.show_hipaa?.is_inherited,
      },
      {
        label: this.intl.t('gdpr'),
        title: this.intl.t('gdprExpansion'),
        value: this.profile?.reportPreference.show_gdpr?.value,
        toggleHandler: this.onSaveGdpr,
        resetHandler: this.onResetGdpr,
        isSaving: this.onSaveGdpr.isRunning,
        isOverriden: !this.profile?.reportPreference.show_gdpr?.is_inherited,
      },
      {
        label: this.intl.t('nist'),
        title: this.intl.t('nistExpansion'),
        value: this.profile?.reportPreference.show_nist?.value,
        toggleHandler: this.onSaveNist,
        resetHandler: this.onResetNist,
        isSaving: this.onSaveNist.isRunning,
        isOverriden: !this.profile?.reportPreference.show_nist?.is_inherited,
      },
    ];
  }

  fetchProfile = task(async () => {
    if (this.args.project?.activeProfileId) {
      this.profile = await this.store.findRecord(
        'profile',
        this.args.project.activeProfileId
      );
    }
  });

  savePreference = task(
    async (event: Event, preference: ProfileRegulatoryReportPreference) => {
      const target = event.target as HTMLInputElement;
      const status = target.checked;

      try {
        await this.profile?.setShowPreference(preference, { value: status });

        const statusDisplay = status ? 'SHOW' : 'HIDE';

        this.notify.info(
          `${this.intl.t(preference)} ${this.intl.t(
            'preferenceSetTo'
          )} ${statusDisplay}`
        );
      } catch (err) {
        this.notify.error(parseError(err));
        target.checked = !status;
      }
    }
  );

  resetPreference = task(
    async (preference: ProfileRegulatoryReportPreference) => {
      try {
        await this.profile?.unsetShowPreference(preference);
        this.notify.info(this.intl.t('regulatoryPreferenceReset'));
      } catch (err) {
        this.notify.error(parseError(err));
      }
    }
  );

  onSavePcidss = task(async (event: Event) => {
    await this.savePreference.perform(event, 'pcidss');
  });

  onSaveHipaa = task(async (event: Event) => {
    await this.savePreference.perform(event, 'hipaa');
  });

  onSaveGdpr = task(async (event: Event) => {
    await this.savePreference.perform(event, 'gdpr');
  });

  onSaveNist = task(async (event: Event) => {
    await this.savePreference.perform(event, 'nist');
  });

  onResetPcidss = task(async () => {
    await this.resetPreference.perform('pcidss');
  });

  onResetHipaa = task(async () => {
    await this.resetPreference.perform('hipaa');
  });

  onResetGdpr = task(async () => {
    await this.resetPreference.perform('gdpr');
  });

  onResetNist = task(async () => {
    await this.resetPreference.perform('nist');
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::AnalysisSettings::RegulatoryPreference': typeof ProjectSettingsAnalysisSettingsRegulatoryPreferenceComponent;
  }
}
