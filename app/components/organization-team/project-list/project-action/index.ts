import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { capitalize } from '@ember/string';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';

import type RealtimeService from 'irene/services/realtime';
import type MeService from 'irene/services/me';
import type AnalyticsService from 'irene/services/analytics';
import type OrganizationTeamProjectModel from 'irene/models/organization-team-project';
import type OrganizationTeamModel from 'irene/models/organization-team';

export interface OrganizationProjectOverviewComponentSignature {
  Args: {
    project: OrganizationTeamProjectModel;
    team: OrganizationTeamModel;
    reloadTeamProjects: () => void;
  };
  Element: HTMLElement;
}

export default class OrganizationProjectOverview extends Component<OrganizationProjectOverviewComponentSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare me: MeService;
  @service declare realtime: RealtimeService;
  @service declare analytics: AnalyticsService;

  @tracked showRemoveProjectConfirm = false;
  @tracked isRemovingProject = false;

  get confirmText() {
    return capitalize(this.intl.t('remove'));
  }

  /* Open remove-project confirmation */
  @action
  openRemoveProjectConfirm() {
    this.showRemoveProjectConfirm = true;
  }

  /* Remove project action */
  removeProject = task(async () => {
    try {
      this.isRemovingProject = true;

      const prj = this.args.project;
      const team = this.args.team;

      await waitForPromise(prj.deleteProject(team.id));
      await this.store.unloadRecord(prj);

      // reload project list
      this.args.reloadTeamProjects();

      this.notify.success(this.intl.t('projectRemoved'));

      this.analytics.track({
        name: 'ORGANIZATION_TEAM_EVENT',
        properties: {
          feature: 'remove_project_from_team',
          teamId: team.id,
          projectId: prj.id,
        },
      });

      this.showRemoveProjectConfirm = false;
      this.isRemovingProject = false;

      // reload team to update project count
      // for some reason because of 'reloadTeamProjects' this has to be last for test & implementation to work
      await waitForPromise(team.reload());
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
      this.isRemovingProject = false;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::ProjectList::ProjectAction': typeof OrganizationProjectOverview;
  }
}
