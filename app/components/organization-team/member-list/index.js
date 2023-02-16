import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { debounce } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class OrganizationTeamMemberListComponent extends Component {
  @service intl;
  @service me;
  @service store;
  @service('notifications') notify;

  @tracked searchQuery = '';
  @tracked limit = 5;
  @tracked offset = 0;
  @tracked teamMemberResponse = null;

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  constructor() {
    super(...arguments);

    this.fetchTeamMembers.perform(this.limit, this.offset);
  }

  get teamMemberList() {
    return this.teamMemberResponse?.toArray() || [];
  }

  get totalTeamMemberCount() {
    return this.teamMemberResponse?.meta?.count || 0;
  }

  get hasNoTeamMember() {
    return this.totalTeamMemberCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('user'),
        valuePath: 'user.username',
        minWidth: 150,
      },
      {
        name: this.intl.t('email'),
        valuePath: 'user.email',
        minWidth: 150,
      },
      this.me.org.get('is_admin')
        ? {
            name: this.intl.t('action'),
            component: 'organization-team/member-list/user-action',
            textAlign: 'center',
          }
        : null,
    ].filter(Boolean);
  }

  @action
  showAddMemberList() {
    const handleAction = this.args.handleActiveAction;

    handleAction({ component: 'organization-team/add-team-member' });
  }

  @action
  handleNextPrevAction({ limit, offset }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchTeamMembers.perform(limit, offset, this.searchQuery);
  }

  @action
  handleItemPerPageChange({ limit }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchTeamMembers.perform(limit, 0, this.searchQuery);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query) {
    this.searchQuery = query;

    this.fetchTeamMembers.perform(this.limit, 0, query);
  }

  @action
  handleSearchQueryChange(event) {
    debounce(this, this.setSearchQuery, event.target.value, 500);
  }

  @action
  handleReloadTeamMembers() {
    this.fetchTeamMembers.perform(this.limit, this.offset, this.searchQuery);
  }

  fetchTeamMembers = task({ drop: true }, async (limit, offset, query = '') => {
    try {
      const queryParams = {
        limit,
        offset,
        q: query,
        teamId: this.args.team.id,
      };

      this.teamMemberResponse = await this.store.query(
        'organization-team-member',
        queryParams
      );
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
