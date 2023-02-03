import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class OrganizationTeamEditTeamName extends Component {
  @service intl;
  @service me;
  @service('notifications') notify;

  @tracked teamName = '';

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');
  tOrganizationTeamNameUpdated = this.intl.t('organizationTeamNameUpdated');

  constructor() {
    super(...arguments);

    this.teamName = this.args.team.name;
  }

  get teamNameEmptyOrSame() {
    return (
      this.teamName.trim() === '' ||
      this.teamName.trim() === this.args.team.name
    );
  }

  @task *updateTeamName() {
    try {
      const team = this.args.team;

      team.name = this.teamName;
      yield team.save();

      this.notify.success(this.tOrganizationTeamNameUpdated);

      this.args.cancelActiveAction();
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
}
