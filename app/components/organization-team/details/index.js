import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { t } from 'ember-intl';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class OrganizationTeamDetails extends Component {
  @service intl;
  @service me;
  @service('notifications') notify;

  @tracked showEdit = false;
  @tracked saveEdit = false;

  tPleaseTryAgain = t('pleaseTryAgain');
  tOrganizationTeamNameUpdated = t('organizationTeamNameUpdated');

  @task *updateTeamName() {
    try {
      yield this.args.team.save();

      this.notify.success(this.tOrganizationTeamNameUpdated);
      this.cancelEditing();
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

  @action
  editTeamName() {
    this.showEdit = true;
    this.saveEdit = true;
  }

  @action
  cancelEditing() {
    this.showEdit = false;
    this.saveEdit = false;
  }
}
