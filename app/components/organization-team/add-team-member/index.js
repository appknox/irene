import { task } from 'ember-concurrency';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import ENV from 'irene/config/environment';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { debounce } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class OrganizationTeamAddTeamMemberComponent extends Component {
  @service intl;
  @service realtime;
  @service store;
  @service('notifications') notify;

  @tracked searchQuery = '';
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked userResponse = null;
  @tracked isAddingMember = false;
  @tracked addMemberErrorCount = 0;
  @tracked selectedMembers = {};

  tTeamMemberAdded = this.intl.t('teamMemberAdded');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  constructor() {
    super(...arguments);

    this.fetchUsers.perform(this.limit, this.offset);
  }

  get userList() {
    const list = this.userResponse?.toArray() || [];

    return list.map((user) => ({
      user,
      checked: !!this.selectedMembers[user.id],
    }));
  }

  get totalUserCount() {
    return this.userResponse?.meta?.count || 0;
  }

  get hasNoUser() {
    return this.totalUserCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('name'),
        valuePath: 'user.username',
        minWidth: 250,
      },
      {
        name: this.intl.t('action'),
        component: 'ak-checkbox',
        textAlign: 'center',
      },
    ];
  }

  @action
  selectionChange(member, event) {
    const selectedMembers = { ...this.selectedMembers };

    if (event.target.checked) {
      selectedMembers[member.id] = member;
    } else {
      delete selectedMembers[member.id];
    }

    this.selectedMembers = selectedMembers;
  }

  get hasNoSelection() {
    return Object.keys(this.selectedMembers).length === 0;
  }

  /* Add member to team */
  addTeamMember = task({ enqueue: true, maxConcurrency: 3 }, async (member) => {
    try {
      const data = {
        write: false,
      };

      const team = this.args.team;
      await team.addMember(data, member.id);

      this.realtime.incrementProperty('TeamMemberCounter');
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
      this.addMemberErrorCount = this.addMemberErrorCount + 1;
    }
  });

  addSelectedTeamMembers = task(async () => {
    this.isAddingMember = true;

    const selectedMembers = Object.values(this.selectedMembers);

    if (selectedMembers.length === 0) {
      return;
    }

    for (let i = 0; i < selectedMembers.length; i++) {
      await this.addTeamMember.perform(selectedMembers[i]);
    }

    if (this.addMemberErrorCount === 0) {
      this.notify.success(this.tTeamMemberAdded);

      this.fetchUsers.perform(this.limit, this.offset, this.searchQuery);

      this.searchQuery = '';
      this.selectedMembers = {};

      triggerAnalytics('feature', ENV.csb.addTeamMember);
    }

    // reload team to update member count
    await this.args.team.reload();

    this.isAddingMember = false;
  });

  @action
  handleNextPrevAction({ limit, offset }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchUsers.perform(limit, offset, this.searchQuery);
  }

  @action
  handleItemPerPageChange({ limit }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchUsers.perform(limit, 0, this.searchQuery);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query) {
    this.searchQuery = query;

    this.fetchUsers.perform(this.limit, 0, query);
  }

  @action
  handleSearchQueryChange(event) {
    debounce(this, this.setSearchQuery, event.target.value, 500);
  }

  fetchUsers = task({ drop: true }, async (limit, offset, query = '') => {
    try {
      const queryParams = {
        limit,
        offset,
        q: query,
        exclude_team: this.args.team.id,
      };

      this.userResponse = await this.store.query(
        'organization-user',
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
