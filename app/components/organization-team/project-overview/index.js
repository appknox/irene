/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { observer, action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { t } from 'ember-intl';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { tracked } from '@glimmer/tracking';

export default class OrganizationProjectOverview extends Component {
  @service intl;
  @service realtime;
  @service me;
  @service('notifications') notify;
  @service store;

  tagName = ['tr'];
  @tracked showRemoveProjectConfirm = false;
  @tracked isRemovingProject = false;

  tProjectRemoved = t('projectRemoved');
  tPleaseTryAgain = t('pleaseTryAgain');
  tPermissionChanged = t('permissionChanged');

  /* Fetch project for the given id */
  get teamProject() {
    return this.store.findRecord('project', this.args.project.id);
  }

  /* Watch for allowEdit input */
  watchProjectWrite = observer('project.write', function () {
    this.changeProjectWrite.perform();
  });

  /* Save project-write value */
  @task *changeProjectWrite() {
    try {
      const prj = this.args.project;
      yield prj.updateProject(this.args.team.id);

      this.notify.success(this.tPermissionChanged);
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
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
