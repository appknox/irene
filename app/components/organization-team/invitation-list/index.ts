import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { debounceTask } from 'ember-lifeline';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';
import OrganizationTeamModel from 'irene/models/organization-team';
import OrganizationModel from 'irene/models/organization';
import { ActiveActionDetailsType } from '../details/active-action';

export interface OrganizationTeamInvitationListComponentSignature {
  Args: {
    team: OrganizationTeamModel;
    organization: OrganizationModel;
    handleActiveAction: (actionArgs: ActiveActionDetailsType) => void;
  };
  Element: HTMLElement;
}

export default class OrganizationTeamInvitationList extends Component<OrganizationTeamInvitationListComponentSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;

  @tracked searchQuery = '';

  targetModel = 'organization-team-invitation';

  get columns() {
    return [
      {
        name: this.intl.t('email'),
        valuePath: 'email',
        minWidth: 150,
      },
      {
        name: this.intl.t('invitedOn'),
        component: 'organization-invitation-list/invited-on',
      },
      {
        name: this.intl.t('resend'),
        component: 'organization-invitation-list/invite-resend',
        textAlign: 'center',
      },
      {
        name: this.intl.t('delete'),
        component: 'organization-invitation-list/invite-delete',
        textAlign: 'center',
      },
    ];
  }

  get extraQueryStrings() {
    return {
      teamId: this.args.team.id,
      is_accepted: false,
      q: this.searchQuery,
    };
  }

  @action
  handleInviteUser() {
    this.args.handleActiveAction({ component: 'invite-member' });
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    this.searchQuery = query;
  }

  @action
  handleSearchQueryChange(event: Event) {
    debounceTask(
      this,
      'setSearchQuery',
      (event.target as HTMLInputElement).value,
      500
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::InvitationList': typeof OrganizationTeamInvitationList;
  }
}
