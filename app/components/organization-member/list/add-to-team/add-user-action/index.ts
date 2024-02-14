import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { capitalize } from '@ember/string';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';
import OrganizationMemberModel from 'irene/models/organization-member';
import OrganizationTeamModel from 'irene/models/organization-team';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';

interface OrganizationMemberListUserActionSignature {
  Args: {
    member: OrganizationMemberModel;
    team: OrganizationTeamModel;
    reloadTeams: () => void;
  };
}

export default class OrganizationMemberListUserActionComponent extends Component<OrganizationMemberListUserActionSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;

  @tracked isAddingTeamMember = false;

  get confirmText() {
    return capitalize(this.intl.t('teamMemberAdded'));
  }

  addTeamMember = task(async () => {
    try {
      const data = {
        write: false,
      };

      this.isAddingTeamMember = true;

      const member = this.args.member;
      const team = this.args.team;

      await waitForPromise(team.addMember(data, member.id));

      this.isAddingTeamMember = false;

      this.notify.success(this.intl.t('teamMemberAdded'));

      this.args.reloadTeams();
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.isAddingTeamMember = false;
      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationMember::List::AddToTeam::AddUserAction': typeof OrganizationMemberListUserActionComponent;
  }
}
