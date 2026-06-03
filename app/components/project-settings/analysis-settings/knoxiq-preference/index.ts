import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type ProjectModel from 'irene/models/project';
import type ProfileModel from 'irene/models/profile';

interface ProjectSettingsAnalysisSettingsKnoxIqPreferenceSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsAnalysisSettingsKnoxIqPreferenceComponent extends Component<ProjectSettingsAnalysisSettingsKnoxIqPreferenceSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked profile: ProfileModel | null = null;

  constructor(
    owner: unknown,
    args: ProjectSettingsAnalysisSettingsKnoxIqPreferenceSignature['Args']
  ) {
    super(owner, args);

    this.fetchProfile.perform();
  }

  get knoxIqPreference() {
    return this.profile?.knoxiqAutomatedTrigger ? 'automated' : 'manual';
  }

  get isSaving() {
    return this.saveKnoxIqPreference.isRunning;
  }

  fetchProfile = task(async () => {
    const profileId = this.args.project?.activeProfileId;

    if (profileId) {
      this.profile = await this.store.findRecord('profile', profileId);
    }
  });

  saveKnoxIqPreference = task(async (value: string) => {
    if (!this.profile) {
      return;
    }

    const isAutomated = value === 'automated';

    try {
      await this.profile.saveKnoxIqAutomatedTrigger({ status: isAutomated });

      this.notify.success(this.intl.t('savedPreferences'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  @action
  handleKnoxIqPreferenceChange(_event: Event, value: string) {
    this.saveKnoxIqPreference.perform(value);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::AnalysisSettings::KnoxiqPreference': typeof ProjectSettingsAnalysisSettingsKnoxIqPreferenceComponent;
  }
}
