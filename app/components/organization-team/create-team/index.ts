import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type RealtimeService from 'irene/services/realtime';
import type AnalyticsService from 'irene/services/analytics';
import type OrganizationModel from 'irene/models/organization';

export interface OrganizationTeamCreateTeamComponentSignature {
  Args: {
    organization: OrganizationModel | null;
    reloadTeams: () => void;
  };
  Element: HTMLElement;
}

export default class OrganizationTeamCreateTeam extends Component<OrganizationTeamCreateTeamComponentSignature> {
  @service declare intl: IntlService;
  @service declare realtime: RealtimeService;
  @service declare store: Store;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  @tracked teamName = '';
  @tracked isCreatingTeam = false;
  @tracked showTeamModal = false;

  /* Open create-team modal */
  @action
  openTeamModal() {
    this.showTeamModal = true;
  }

  @action
  closeTeamModal() {
    this.showTeamModal = false;
  }

  /* Create team */
  createTeam = task(async (event) => {
    event.preventDefault();

    try {
      if (isEmpty(this.teamName)) {
        throw new Error(this.intl.t('enterTeamName'));
      }

      this.isCreatingTeam = true;

      const t = this.store.createRecord('organization-team', {
        name: this.teamName,
      });

      await t.save();

      this.notify.success(this.intl.t('teamCreated'));

      // reload organization to update team count
      await this.args.organization?.reload();

      // reload teams list
      this.args.reloadTeams();

      this.showTeamModal = false;
      this.teamName = '';
      this.isCreatingTeam = false;

      this.analytics.track({
        name: 'ORGANIZATION_TEAM_EVENT',
        properties: {
          feature: 'create_team',
          teamId: t.id,
          teamName: t.name,
        },
      });
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
      this.isCreatingTeam = false;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::CreateTeam': typeof OrganizationTeamCreateTeam;
  }
}
