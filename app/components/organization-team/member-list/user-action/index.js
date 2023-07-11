import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { capitalize } from '@ember/string';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class OrganizationTeamMemberListUserAction extends Component {
  @service intl;
  @service realtime;
  @service me;
  @service('notifications') notify;

  @tracked isRemovingMember = false;
  @tracked showRemoveMemberPrompt = false;
  @tracked promptMemberName = '';

  tEnterRightUserName = this.intl.t('enterRightUserName');
  tTeamMember = this.intl.t('teamMember');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');
  tTeamMemberRemoved = this.intl.t('teamMemberRemoved');

  get confirmText() {
    return capitalize(this.intl.t('remove'));
  }

  /* Open remove-member prompt */
  @action
  openRemoveMemberPrompt() {
    this.showRemoveMemberPrompt = true;
  }

  /* Remove member */
  removeMember = task(async () => {
    try {
      this.isRemovingMember = true;

      const memberName = (await this.args.member.user).username.toLowerCase();
      const promptMemberName = this.promptMemberName.toLowerCase();

      if (promptMemberName !== memberName) {
        throw new Error(this.tEnterRightUserName);
      }

      const { team, member } = this.args;

      await team.deleteMember(member);

      // reload member list
      this.args.reloadTeamMembers();

      this.notify.success(this.tTeamMemberRemoved);

      this.showRemoveMemberPrompt = false;
      this.isRemovingMember = false;

      // reload team to update member count
      // for some reason because of 'reloadTeamMembers' this has to be last for test & implementation to work
      await team.reload();
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
      this.isRemovingMember = false;
    }
  });
}
