import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { debounce } from '@ember/runloop';

export default class OrganizationTeamInvitationList extends Component {
  @service intl;
  @service me;

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
    const query = {
      teamId: this.args.team.id,
      is_accepted: false,
      q: this.searchQuery,
    };

    return JSON.stringify(query, Object.keys(query).sort());
  }

  @action
  handleInviteUser() {
    this.args.handleActiveAction({ component: 'invite-member' });
  }

  /* Set debounced searchQuery */
  setSearchQuery(query) {
    this.searchQuery = query;
  }

  @action
  handleSearchQueryChange(event) {
    debounce(this, this.setSearchQuery, event.target.value, 500);
  }
}
