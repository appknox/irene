import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { capitalize } from '@ember/string';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';
import RealtimeService from 'irene/services/realtime';
import OrganizationTeamModel from 'irene/models/organization-team';
import OrganizationTeamMemberModel from 'irene/models/organization-team-member';
import { waitForPromise } from '@ember/test-waiters';

export interface OrganizationTeamMemberListUserActionComponentSignature {
  Args: {
    team: OrganizationTeamModel;
    member: OrganizationTeamMemberModel;
    reloadTeamMembers: () => void;
  };
  Element: HTMLElement;
}

export default class OrganizationTeamMemberListUserAction extends Component<OrganizationTeamMemberListUserActionComponentSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare realtime: RealtimeService;
  @service('notifications') declare notify: NotificationService;

  @tracked isRemovingMember = false;
  @tracked showRemoveMemberPrompt = false;
  @tracked promptMemberName = '';

  get confirmText() {
    return capitalize(this.intl.t('remove'));
  }

  /* Open remove-member prompt */
  @action
  openRemoveMemberPrompt() {
    this.showRemoveMemberPrompt = true;
  }

  /* Close remove-member prompt */
  @action
  closeRemoveMemberPrompt() {
    this.showRemoveMemberPrompt = false;
  }

  /* Remove member */
  removeMember = task(async () => {
    try {
      const user = this.args.member.user;

      if (!user) {
        return;
      }

      this.isRemovingMember = true;

      const memberName = user.username.toLowerCase();
      const promptMemberName = this.promptMemberName.toLowerCase();

      if (promptMemberName !== memberName) {
        throw new Error(this.intl.t('enterRightUserName'));
      }

      const { team } = this.args;

      await waitForPromise(team.deleteMember(user));

      // reload member list
      this.args.reloadTeamMembers();

      this.notify.success(this.intl.t('teamMemberRemoved'));

      this.showRemoveMemberPrompt = false;
      this.isRemovingMember = false;

      // reload team to update member count
      // for some reason because of 'reloadTeamMembers' this has to be last for test & implementation to work
      await team.reload();
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
      this.isRemovingMember = false;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::MemberList::UserAction': typeof OrganizationTeamMemberListUserAction;
  }
}
