import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class OrganizationMemberListComponent extends Component {
  @service intl;
  @service me;
  @service store;
  @service('notifications') notify;
  @service router;

  @tracked userResponse = null;

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  constructor() {
    super(...arguments);

    const { user_limit, user_offset, user_query, show_inactive_user } =
      this.args.queryParams;

    this.fetchUsers.perform(
      user_limit,
      user_offset,
      user_query,
      show_inactive_user,
      false
    );
  }

  get userList() {
    return this.userResponse?.toArray() || [];
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
        name: this.intl.t('user'),
        component: 'organization-member/list/member-info',
        minWidth: 150,
      },
      {
        name: this.intl.t('email'),
        valuePath: 'member.email',
        minWidth: 150,
      },
      {
        name: this.intl.t('role'),
        component: 'organization-member/list/member-role',
        textAlign: this.me.org.get('is_owner') ? 'center' : 'left',
      },
      this.me.org.get('is_owner')
        ? {
            name: this.intl.t('action'),
            component: 'organization-member/list/member-action',
            textAlign: 'center',
          }
        : null,
    ].filter(Boolean);
  }

  @action
  handleNextAction({ limit, offset }) {
    const { user_query, show_inactive_user } = this.args.queryParams;

    this.fetchUsers.perform(limit, offset, user_query, show_inactive_user);
  }

  @action
  handlePrevAction({ limit, offset }) {
    const { user_query, show_inactive_user } = this.args.queryParams;

    this.fetchUsers.perform(limit, offset, user_query, show_inactive_user);
  }

  @action
  handleItemPerPageChange({ limit }) {
    const { user_query, show_inactive_user } = this.args.queryParams;

    this.fetchUsers.perform(limit, 0, user_query, show_inactive_user);
  }

  @action
  showDeactivatedMembers(event, checked) {
    const { user_limit, user_query } = this.args.queryParams;

    this.fetchUsers.perform(user_limit, 0, user_query, checked);
  }

  @action
  searchUserForQuery(event) {
    debounce(this, this.setSearchQuery, event.target.value, 500);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query) {
    const { user_limit, show_inactive_user } = this.args.queryParams;

    this.fetchUsers.perform(user_limit, 0, query, show_inactive_user);
  }

  setRouteQueryParams(limit, offset, query, showInActiveUser) {
    this.router.transitionTo({
      queryParams: {
        user_limit: limit,
        user_offset: offset,
        user_query: query,
        show_inactive_user: showInActiveUser,
      },
    });
  }

  fetchUsers = task(
    { drop: true },
    async (
      limit,
      offset,
      query = '',
      showInActiveUser = false,
      setQueryParams = true
    ) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset, query, showInActiveUser);
      }

      try {
        this.userResponse = await this.store.query('organization-member', {
          limit,
          offset,
          q: query,
          ...(!showInActiveUser && { is_active: true }),
        });
      } catch (err) {
        let errMsg = this.tPleaseTryAgain;

        if (err.errors && err.errors.length) {
          errMsg = err.errors[0].detail || errMsg;
        } else if (err.message) {
          errMsg = err.message;
        }

        this.notify.error(errMsg);
      }
    }
  );
}
