import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import Store from '@ember-data/store';
import { action } from '@ember/object';
import IntlService from 'ember-intl/services/intl';
import { waitForPromise } from '@ember/test-waiters';

import ENV from 'irene/config/environment';
import MeService from 'irene/services/me';
import RealtimeService from 'irene/services/realtime';
import ProjectModel from 'irene/models/project';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import parseError from 'irene/utils/parse-error';
import ProjectCollaboratorModel from 'irene/models/project-collaborator';

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

      triggerAnalytics(
        'feature',
        ENV.csb['projectCollaboratorRemove'] as CsbAnalyticsData
      );

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
