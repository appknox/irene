import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { capitalize } from '@ember/string';
import { task } from 'ember-concurrency-decorators';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { tracked } from '@glimmer/tracking';

export default class OrganizationProjectOverview extends Component {
  @service intl;
  @service realtime;
  @service me;
  @service('notifications') notify;
  @service store;

  @tracked showRemoveProjectConfirm = false;
  @tracked isRemovingProject = false;

  tProjectRemoved = this.intl.t('projectRemoved');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  get confirmText() {
    return capitalize(this.intl.t('remove'));
  }

  /* Open remove-project confirmation */
  @action
  openRemoveProjectConfirm() {
    this.showRemoveProjectConfirm = true;
  }

  /* Remove project action */
  @task *removeProject() {
    try {
      this.isRemovingProject = true;

      const prj = this.args.project;
      const teamId = this.args.team.id;

      yield prj.deleteProject(teamId);
      yield this.store.unloadRecord(prj);

      this.notify.success(this.tProjectRemoved);
      triggerAnalytics('feature', ENV.csb.teamProjectRemove);

      this.showRemoveProjectConfirm = false;
      this.isRemovingProject = false;

      this.realtime.incrementProperty('OrganizationNonTeamProjectCounter');
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
      this.isRemovingProject = false;
    }
  }
}
