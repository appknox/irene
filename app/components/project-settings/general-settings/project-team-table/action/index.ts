import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { waitForPromise } from '@ember/test-waiters';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type ProjectTeamModel from 'irene/models/project-team';
import type MeService from 'irene/services/me';
import type RealtimeService from 'irene/services/realtime';
import type ProjectModel from 'irene/models/project';
import type AnalyticsService from 'irene/services/analytics';

interface ProjectSettingsGeneralSettingsProjectTeamTableActionSignature {
  Args: {
    project: ProjectModel | null;
    team: ProjectTeamModel | null;
    reloadTeamsList: () => void;
  };
}

export default class ProjectSettingsGeneralSettingsProjectTeamTableActionComponent extends Component<ProjectSettingsGeneralSettingsProjectTeamTableActionSignature> {
  @service declare me: MeService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare realtime: RealtimeService;
  @service declare intl: IntlService;
  @service declare analytics: AnalyticsService;

  @tracked showRemoveTeamConfirm = false;

  get project() {
    return this.args.project;
  }

  get team() {
    return this.args.team;
  }

  get tTeamRemoved() {
    return this.intl.t('teamRemoved');
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get tPermissionChanged() {
    return this.intl.t('permissionChanged');
  }

  /* Open remove-team confirmation */
  @action openRemoveTeamConfirm() {
    this.showRemoveTeamConfirm = true;
  }

  /* Remove team action */
  @action removeTeamProxy() {
    this.removeTeam.perform();
  }

  removeTeam = task(async () => {
    try {
      const orgTeamProjects = await waitForPromise(
        this.store.queryRecord('organization-team-project', {
          teamId: this.team?.id,
          id: this.project?.id,
        })
      );

      await waitForPromise(
        orgTeamProjects.deleteProject(String(this.team?.id))
      );

      this.realtime.incrementProperty('ProjectNonTeamCounter');
      this.store.unloadRecord(this.team as ProjectTeamModel);

      this.notify.success(this.tTeamRemoved);
      this.analytics.track({
        name: 'PROJECT_TEAM_EVENT',
        properties: {
          feature: 'remove_team',
          teamId: this.team?.id,
          projectId: this.project?.id,
        },
      });

      this.showRemoveTeamConfirm = false;

      this.args.reloadTeamsList();
    } catch (error) {
      this.notify.error(parseError(error, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'project-settings/general-settings/project-team-table/action': typeof ProjectSettingsGeneralSettingsProjectTeamTableActionComponent;
  }
}
