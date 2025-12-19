import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import type OrganizationTeamModel from 'irene/models/organization-team';
import type OrganizationModel from 'irene/models/organization';
import type MeService from 'irene/services/me';
import type AnalyticsService from 'irene/services/analytics';
import { ActiveActionDetailsType } from '../active-action';

export interface OrganizationTeamDetailsTeamInfoComponentSignature {
  Args: {
    team: OrganizationTeamModel;
    organization: OrganizationModel;
    handleActiveAction: (actionArgs: ActiveActionDetailsType) => void;
    drawerCloseHandler: () => void;
  };
  Element: HTMLElement;
}

export default class OrganizationTeamDetailsTeamInfo extends Component<OrganizationTeamDetailsTeamInfoComponentSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  @tracked showTeamDeleteConfirm = false;
  @tracked promptTeamName = '';
  @tracked isDeletingTeam = false;

  @action
  showEditTeamName() {
    this.args.handleActiveAction({
      component: 'organization-team/edit-team-name',
    });
  }

  @action
  handleShowDeleteConfirm() {
    this.showTeamDeleteConfirm = true;
  }

  /* Close team delete confirmation */
  @action
  closeTeamDeleteConfirm() {
    this.showTeamDeleteConfirm = false;
  }

  /* Delete team */
  deleteTeam = task(async () => {
    try {
      this.isDeletingTeam = true;

      const t = this.args.team;

      const teamName = t.name.toLowerCase();
      const promptTeamName = this.promptTeamName.toLowerCase();

      if (promptTeamName !== teamName) {
        throw new Error(this.intl.t('enterRightTeamName'));
      }

      t.deleteRecord();
      await waitForPromise(t.save());

      this.notify.success(
        `${this.args.team.name} ${this.intl.t('teamDeleted')}`
      );

      this.analytics.track({
        name: 'ORGANIZATION_TEAM_EVENT',
        properties: {
          action: 'team_deleted',
          team_id: t.id,
          team_name: t.name,
        },
      });

      // reload organization to update team count
      await waitForPromise(this.args.organization.reload());

      this.args.drawerCloseHandler();

      this.showTeamDeleteConfirm = false;
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::Details::TeamInfo': typeof OrganizationTeamDetailsTeamInfo;
  }
}
