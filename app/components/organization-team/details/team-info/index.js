import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class OrganizationTeamDetailsTeamInfo extends Component {
  @service intl;
  @service me;
  @service('notifications') notify;

  @tracked showTeamDeleteConfirm = false;
  @tracked promptTeamName = '';

  tEnterRightTeamName = this.intl.t('enterRightTeamName');
  tTeamDeleted = this.intl.t('teamDeleted');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

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

  /* Delete team */
  deleteTeam = task(async () => {
    try {
      this.isDeletingTeam = true;

      const t = this.args.team;

      const teamName = t.name.toLowerCase();
      const promptTeamName = this.promptTeamName.toLowerCase();

      if (promptTeamName !== teamName) {
        throw new Error(this.tEnterRightTeamName);
      }

      t.deleteRecord();
      await t.save();

      this.notify.success(`${this.args.team.name} ${this.tTeamDeleted}`);

      // reload organization to update team count
      await this.args.organization.reload();

      this.args.drawerCloseHandler();

      this.showTeamDeleteConfirm = false;
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}
