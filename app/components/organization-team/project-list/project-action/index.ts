import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { capitalize } from '@ember/string';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import RealtimeService from 'irene/services/realtime';
import MeService from 'irene/services/me';
import OrganizationTeamProjectModel from 'irene/models/organization-team-project';
import OrganizationTeamModel from 'irene/models/organization-team';
import { waitForPromise } from '@ember/test-waiters';

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

      triggerAnalytics(
        'feature',
        ENV.csb['teamProjectRemove'] as CsbAnalyticsFeatureData
      );

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
