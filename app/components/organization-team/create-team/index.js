import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { tracked } from '@glimmer/tracking';

export default class OrganizationTeamCreateTeam extends Component {
  @service intl;
  @service ajax;
  @service('notifications') notify;
  @service store;
  @service realtime;

  @tracked teamName = '';
  @tracked isCreatingTeam = false;
  @tracked showTeamModal = false;

  tEnterTeamName = this.intl.t('enterTeamName');
  tTeamCreated = this.intl.t('teamCreated');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  /* Open create-team modal */
  @action
  openTeamModal() {
    this.showTeamModal = true;
  }

  /* Create team */
  @task
  *createTeam() {
    try {
      if (isEmpty(this.teamName)) {
        throw new Error(this.tEnterTeamName);
      }

      this.isCreatingTeam = true;

      const t = this.store.createRecord('organization-team', {
        name: this.teamName,
      });
      yield t.save();

      // signal to update invitation list
      this.realtime.incrementProperty('OrganizationTeamCounter');

      this.notify.success(this.tTeamCreated);

      this.showTeamModal = false;
      this.teamName = '';
      this.isCreatingTeam = false;
      triggerAnalytics('feature', ENV.csb.createTeam);
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
      this.isCreatingTeam = false;
    }
  }
}
