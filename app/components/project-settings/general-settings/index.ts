import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type Store from 'ember-data/store';

import {
  canManageSigningCertificates,
  showsProjectSigningCertificate,
} from 'irene/utils/cyod';

import type ProjectModel from 'irene/models/project';
import type ProfileModel from 'irene/models/profile';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';
import type LoggerService from 'irene/services/logger';

interface ProjectSettingsGeneralSettingsSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsComponent extends Component<ProjectSettingsGeneralSettingsSignature> {
  @service declare me: MeService;
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service declare logger: LoggerService;

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

  get showCyodSection() {
    return showsProjectSigningCertificate(
      this.organization.isCyodRegistrationEnabled,
      this.args.project?.platform,
      canManageSigningCertificates(this.me.org?.is_admin, this.me.org?.is_owner)
    );
  }

  fetchProfile = task(async () => {
    try {
      const profileId = this.args.project?.activeProfileId;

      this.profile = await waitForPromise(
        this.store.findRecord('profile', String(profileId))
      );
    } catch (e) {
      this.profile = null;

      this.logger.error('Could not load the project profile:', e);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings': typeof ProjectSettingsGeneralSettingsComponent;
  }
}
