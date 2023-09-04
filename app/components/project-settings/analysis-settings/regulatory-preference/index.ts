import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import parseError from 'irene/utils/parse-error';
import Store from '@ember-data/store';
import { Service as IntlService } from 'ember-intl';
import ProjectModel from 'irene/models/project';
import ProfileModel from 'irene/models/profile';

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

  fetchProfile = task(async () => {
    this.profile = await this.store.findRecord(
      'profile',
      String(this.args.project?.activeProfileId)
    );
  });

  // PCIDSS
  savePcidss = task(async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const status = target.checked;
    try {
      await this.profile?.setShowPcidss({ value: status });
      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `${this.intl.t('pcidss')} ${this.intl.t(
          'preferenceSetTo'
        )} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
      target.checked = !status;
    }
  });

  resetPcidss = task(async () => {
    try {
      await this.profile?.unsetShowPcidss();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  // HIPAA
  saveHipaa = task(async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const status = target.checked;
    try {
      await this.profile?.setShowHipaa({ value: status });

      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `${this.intl.t('hipaa')} ${this.intl.t(
          'preferenceSetTo'
        )} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
      target.checked = !status;
    }
  });

  resetHipaa = task(async () => {
    try {
      await this.profile?.unsetShowHipaa();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  // GDPR
  saveGdpr = task(async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const status = target.checked;
    try {
      await this.profile?.setShowGdpr({ value: status });
      const statusDisplay = status ? 'SHOW' : 'HIDE';

      this.notify.info(
        `${this.intl.t('gdpr')} ${this.intl.t(
          'preferenceSetTo'
        )} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
      target.checked = !status;
    }
  });

  resetGdpr = task(async () => {
    try {
      await this.profile?.unsetShowGdpr();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  @action
  onSavePcidss(event: Event) {
    this.savePcidss.perform(event);
  }

  @action
  onSaveHipaa(event: Event) {
    this.saveHipaa.perform(event);
  }

  @action
  onSaveGdpr(event: Event) {
    this.saveGdpr.perform(event);
  }

  @action
  onResetPcidss() {
    this.resetPcidss.perform();
  }

  @action
  onResetHipaa() {
    this.resetHipaa.perform();
  }

  @action
  onResetGdpr() {
    this.resetGdpr.perform();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::AnalysisSettings::RegulatoryPreference': typeof ProjectSettingsAnalysisSettingsRegulatoryPreferenceComponent;
  }
}
