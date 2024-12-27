import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { tracked } from '@glimmer/tracking';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
import RealtimeService from 'irene/services/realtime';
import OrganizationModel from 'irene/models/organization';

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

      triggerAnalytics(
        'feature',
        ENV.csb['createTeam'] as CsbAnalyticsFeatureData
      );
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
