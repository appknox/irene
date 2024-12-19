import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type Store from '@ember-data/store';

import type ProjectModel from 'irene/models/project';
import type ProfileModel from 'irene/models/profile';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';
import type ConfigurationService from 'irene/services/configuration';

interface ProjectSettingsGeneralSettingsSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsComponent extends Component<ProjectSettingsGeneralSettingsSignature> {
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service declare configuration: ConfigurationService;
  @service declare store: Store;

  @tracked profile: ProfileModel | null = null;

  constructor(
    owner: unknown,
    args: ProjectSettingsGeneralSettingsSignature['Args']
  ) {
    super(owner, args);

    this.fetchProfile.perform();
  }

  get project() {
    return this.args.project;
  }

  get dynamicscanAutomationAvailable() {
    return !!this.organization.selected?.features?.dynamicscan_automation;
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  fetchProfile = task(async () => {
    try {
      const profileId = this.args.project?.activeProfileId;

      this.profile = await waitForPromise(
        this.store.findRecord('profile', String(profileId))
      );
    } catch (e) {
      this.profile = null;
      return;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings': typeof ProjectSettingsGeneralSettingsComponent;
  }
}
