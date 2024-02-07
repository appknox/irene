import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import { action } from '@ember/object';
import IntlService from 'ember-intl/services/intl';
import { waitForPromise } from '@ember/test-waiters';

import ProjectModel from 'irene/models/project';
import parseError from 'irene/utils/parse-error';
import ProjectCollaboratorModel from 'irene/models/project-collaborator';

interface ProjectSettingsGeneralSettingsCollaboratorsTableEditAccessSignature {
  Args: {
    project: ProjectModel | null;
    collaborator: ProjectCollaboratorModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsCollaboratorsTableEditAccessComponent extends Component<ProjectSettingsGeneralSettingsCollaboratorsTableEditAccessSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get tPermissionChanged() {
    return this.intl.t('permissionChanged');
  }

  @action changeTeamWrite(_event: Event, checked: boolean) {
    this.changeCollaboratorWrite.perform(checked);
  }

  changeCollaboratorWrite = task(async (checked: boolean) => {
    try {
      const clb = this.args.collaborator;
      clb?.set('write', checked);

      await waitForPromise(
        (clb as ProjectCollaboratorModel).updateCollaborator(
          String(this.args.project?.id)
        )
      );

      this.notify.success(this.tPermissionChanged);
    } catch (error) {
      this.notify.error(parseError(error, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'project-settings/general-settings/collaborators-table/edit-access': typeof ProjectSettingsGeneralSettingsCollaboratorsTableEditAccessComponent;
  }
}
