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

interface AdminSettingsUserDetailsAppknoxInfoTeamsActionSignature {
  Args: {
    member: OrganizationUserModel;
    team: OrganizationTeamModel;
    reloadTeams: () => void;
  };
}

export default class AdminSettingsUserDetailsAppknoxInfoTeamsActionComponent extends Component<AdminSettingsUserDetailsAppknoxInfoTeamsActionSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;

  @tracked showRemoveMemberPrompt = false;
  @tracked promptMemberName = '';
  @tracked teamActionsMenuRef: HTMLElement | null = null;

  get teamActions() {
    return [
      {
        label: 'Remove Team',
        icon: 'person-remove',
        action: this.removeTeam,
      },
    ];
  }

  @action
  handleTeamActionsOpen(event: MouseEvent) {
    this.teamActionsMenuRef = event.currentTarget as HTMLElement;
  }

  @action
  handleTeamActionsClose() {
    this.teamActionsMenuRef = null;
  }

  @action
  removeTeam() {
    this.teamActionsMenuRef = null;
  }

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

  removeMember = task(async () => {});
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'admin-settings/user-details/appknox-info/teams/action': typeof AdminSettingsUserDetailsAppknoxInfoTeamsActionComponent;
  }
}
