import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type Store from 'ember-data/store';

import { showsProjectSigningCertificate } from 'irene/utils/cyod';
import type ProjectModel from 'irene/models/project';
import type ProfileModel from 'irene/models/profile';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';

interface ProjectSettingsGeneralSettingsSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsComponent extends Component<ProjectSettingsGeneralSettingsSignature> {
  @service declare me: MeService;
  @service declare store: Store;
  @service declare organization: OrganizationService;

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

  /**
   * Whether to render the CYOD section and the divider that introduces it.
   *
   * The section's divider, width and padding live in this template alongside
   * where its Teams / Collaborators siblings declare theirs, so this component
   * decides the divider's visibility — it must go with the section rather than
   * dangle. Shares one predicate with the panel itself so the two agree.
   */
  get showCyodSection() {
    return showsProjectSigningCertificate(
      this.organization.isCyodRegistrationEnabled,
      this.args.project?.platform
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
      return;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings': typeof ProjectSettingsGeneralSettingsComponent;
  }
}
