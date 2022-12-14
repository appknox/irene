import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { t } from 'ember-intl';
import { tracked } from '@glimmer/tracking';

export default class OrganizationTeamMemberOverview extends Component {
  @service intl;
  @service realtime;
  @service me;
  @service('notifications') notify;

  team = null;
  tagName = ['tr'];

  @tracked isRemovingMember = false;
  @tracked showRemoveMemberPrompt = false;

  tEnterRightUserName = t('enterRightUserName');
  tTeamMember = t('teamMember');
  tTeamMemberRemoved = t('teamMemberRemoved');

  /* Open remove-member prompt */
  @action
  openRemoveMemberPrompt() {
    this.showRemoveMemberPrompt = true;
  }

  /* Remove member */
  @task *removeMember(inputValue) {
    try {
      this.isRemovingMember = true;

      const memberName = this.args.member.user.username.toLowerCase();
      const promptedMember = inputValue.toLowerCase();

      if (promptedMember !== memberName) {
        throw new Error(this.tEnterRightUserName);
      }

      const { team, member } = this.args;
      yield team.deleteMember(member);

      this.notify.success(this.tTeamMemberRemoved);

      this.showRemoveMemberPrompt = false;
      this.isRemovingMember = false;

      this.realtime.incrementProperty('OrganizationNonTeamMemberCounter');
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
  }
}
