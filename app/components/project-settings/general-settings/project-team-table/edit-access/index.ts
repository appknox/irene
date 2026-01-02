import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import Store from 'ember-data/store';
import { action } from '@ember/object';
import IntlService from 'ember-intl/services/intl';
import { waitForPromise } from '@ember/test-waiters';

import ProjectTeamModel from 'irene/models/project-team';
import ProjectModel from 'irene/models/project';
import parseError from 'irene/utils/parse-error';

interface ProjectSettingsGeneralSettingsProjectTeamTableEditAccessSignature {
  Args: {
    project: ProjectModel | null;
    team: ProjectTeamModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsProjectTeamTableEditAccessComponent extends Component<ProjectSettingsGeneralSettingsProjectTeamTableEditAccessSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked isRemovingTeam = false;
  @tracked showRemoveTeamConfirm = false;

  get project() {
    return this.args.project;
  }

  get team() {
    return this.args.team;
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get tPermissionChanged() {
    return this.intl.t('permissionChanged');
  }

  /* Save team-write value */
  @action onTeamWriteChange(_event: Event, checked: boolean) {
    this.changeTeamWrite.perform(checked);
  }

  changeTeamWrite = task(async (checked: boolean) => {
    try {
      const prj = await waitForPromise(
        this.store.queryRecord('organization-team-project', {
          teamId: this.team?.id,
          id: this.project?.id,
        })
      );

      prj.set('write', checked);
      await waitForPromise(prj.updateProject(String(this.team?.id)));

      this.notify.success(this.tPermissionChanged);
    } catch (error) {
      this.notify.error(parseError(error, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'project-settings/general-settings/project-team-table/edit-access': typeof ProjectSettingsGeneralSettingsProjectTeamTableEditAccessComponent;
  }
}
