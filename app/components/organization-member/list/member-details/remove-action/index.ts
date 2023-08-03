import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { capitalize } from '@ember/string';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';
import OrganizationTeamModel from 'irene/models/organization-team';
import OrganizationUserModel from 'irene/models/organization-user';

interface MemberRemoveActionSignature {
  Args: {
    member: OrganizationUserModel;
    team: OrganizationTeamModel;
    reloadTeams: () => void;
  };
}

export default class MemberRemoveActionComponent extends Component<MemberRemoveActionSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;

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

  @action
  closeRemoveMemberPrompt() {
    this.showRemoveMemberPrompt = false;
  }

  /* Remove member */
  removeMember = task(async () => {
    try {
      const { team, member } = this.args;
      await team.deleteMember(member);

      this.notify.success(this.intl.t('teamMemberRemoved'));

      this.args.reloadTeams();

      this.showRemoveMemberPrompt = false;
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationMember::List::MemberDetails::RemoveAction': typeof MemberRemoveActionComponent;
  }
}
