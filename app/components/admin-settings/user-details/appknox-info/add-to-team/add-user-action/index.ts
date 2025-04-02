import Component from '@glimmer/component';
import { service } from '@ember/service';
import { capitalize } from '@ember/string';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';

import parseError from 'irene/utils/parse-error';
import type IntlService from 'ember-intl/services/intl';
import type MeService from 'irene/services/me';
import type OrganizationMemberModel from 'irene/models/organization-member';
import type OrganizationTeamModel from 'irene/models/organization-team';

interface AdminSettingsUserDetailsAppknoxInfoAddToTeamAddUserActionSignature {
  Args: {
    member: OrganizationMemberModel;
    team: OrganizationTeamModel;
    reloadTeams: () => void;
  };
}

export default class AdminSettingsUserDetailsAppknoxInfoAddToTeamAddUserActionComponent extends Component<AdminSettingsUserDetailsAppknoxInfoAddToTeamAddUserActionSignature> {
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
      this.isAddingTeamMember = false;

      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'admin-settings/user-details/appknox-info/add-to-team/add-user-action': typeof AdminSettingsUserDetailsAppknoxInfoAddToTeamAddUserActionComponent;
  }
}
