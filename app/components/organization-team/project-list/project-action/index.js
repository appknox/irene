import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { capitalize } from '@ember/string';
import { task } from 'ember-concurrency';
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
  removeProject = task(async () => {
    try {
      this.isRemovingProject = true;

      const prj = this.args.project;
      const team = this.args.team;

      await prj.deleteProject(team.id);
      await this.store.unloadRecord(prj);

      // reload project list
      this.args.reloadTeamProjects();

      this.notify.success(this.tProjectRemoved);

      triggerAnalytics('feature', ENV.csb.teamProjectRemove);

      this.showRemoveProjectConfirm = false;
      this.isRemovingProject = false;

      // reload team to update project count
      // for some reason because of 'reloadTeamProjects' this has to be last for test & implementation to work
      await team.reload();
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
  });
}
