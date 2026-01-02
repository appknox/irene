import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { waitForPromise } from '@ember/test-waiters';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type MeService from 'irene/services/me';
import type RealtimeService from 'irene/services/realtime';
import type AnalyticsService from 'irene/services/analytics';
import type ProjectModel from 'irene/models/project';
import type ProjectCollaboratorModel from 'irene/models/project-collaborator';

interface ProjectSettingsGeneralSettingsCollaboratorsTableActionSignature {
  Args: {
    project: ProjectModel | null;
    collaborator: ProjectCollaboratorModel | null;
    reloadCollaborators: () => void;
  };
}

export default class ProjectSettingsGeneralSettingsCollaboratorsTableActionComponent extends Component<ProjectSettingsGeneralSettingsCollaboratorsTableActionSignature> {
  @service declare me: MeService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare realtime: RealtimeService;
  @service declare intl: IntlService;
  @service declare analytics: AnalyticsService;

  @tracked showRemoveCollaboratorConfirm = false;

  get project() {
    return this.args.project;
  }

  get collaborator() {
    return this.args.collaborator;
  }

  get tCollaboratorRemoved() {
    return this.intl.t('collaboratorRemoved');
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get tPermissionChanged() {
    return this.intl.t('permissionChanged');
  }

  @action openRemoveCollaboratorConfirm() {
    this.showRemoveCollaboratorConfirm = true;
  }

  @action
  closeRemoveCollaboratorConfirm() {
    this.showRemoveCollaboratorConfirm = false;
  }

  @action removeProjectCollaborator() {
    this.removeCollaborator.perform();
  }

  removeCollaborator = task(async () => {
    try {
      await waitForPromise(
        (this.collaborator as ProjectCollaboratorModel).deleteCollaborator(
          String(this.project?.id)
        )
      );

      this.store.unloadRecord(this.collaborator as ProjectCollaboratorModel);

      this.notify.success(this.tCollaboratorRemoved);

      this.analytics.track({
        name: 'PROJECT_COLLABORATOR_EVENT',
        properties: {
          feature: 'remove_collaborator',
          collaboratorId: this.collaborator?.id,
          projectId: this.project?.id,
        },
      });

      this.showRemoveCollaboratorConfirm = false;
      this.args.reloadCollaborators();
    } catch (error) {
      this.notify.error(parseError(error, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'project-settings/general-settings/collaborators-table/action': typeof ProjectSettingsGeneralSettingsCollaboratorsTableActionComponent;
  }
}
