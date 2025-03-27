import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { debounceTask } from 'ember-lifeline';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';
import MeService from 'irene/services/me';
import OrganizationModel from 'irene/models/organization';
import OrganizationMemberModel from 'irene/models/organization-member';
import { OrganizationMembersRouteQueryParams } from 'irene/routes/authenticated/dashboard/organization/users';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

export interface AdminUserManagementUsersTableComponentSignature {
  Args: {
    organization: OrganizationModel | null;
    queryParams: OrganizationMembersRouteQueryParams;
    limit?: number;
    offset?: number;
  };
  Element: HTMLElement;
}

type UserResponseModel =
  DS.AdapterPopulatedRecordArray<OrganizationMemberModel> & {
    meta?: { count: number };
  };

type UserRowClickArgs = {
  rowValue: OrganizationMemberModel;
  event: Event;
};

export default class AdminUserManagementUsersTableComponent extends Component<AdminUserManagementUsersTableComponentSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare router: RouterService;

  @tracked userResponse: UserResponseModel | null = null;
  @tracked showUserDetailsView = false;
  @tracked selectedUser: OrganizationMemberModel | null = null;

  @action
  handleShowUserDetails(args: UserRowClickArgs) {
    // should not open when role select is triggered
    if (this.isUserRoleSelect(args.event.target as HTMLElement)) {
      return;
    }

    this.selectedUser = args.rowValue;
    this.showUserDetailsView = true;
  }

  get loadingMockData() {
    return new Array(8).fill({});
  }

  isUserRoleSelect(element: HTMLElement) {
    const targetClass = 'user-role-select-trigger';

    return (
      element.classList.contains(targetClass) ||
      element.parentElement?.classList.contains(targetClass)
    );
  }

  @action
  handleUserDetailClose() {
    this.selectedUser = null;
    this.showUserDetailsView = false;
  }

  constructor(
    owner: unknown,
    args: AdminUserManagementUsersTableComponentSignature['Args']
  ) {
    super(owner, args);

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
    return this.userResponse?.slice() || [];
  }

  get totalUserCount() {
    return this.userResponse?.meta?.count || 0;
  }

  get hasNoUser() {
    return this.totalUserCount === 0;
  }

  get statusLabel() {
    return ['pending', 'active', 'deactivated'][Math.floor(Math.random() * 3)]; // Todo: remove this randomization
  }

  @action
  statusLabelColor(label?: string) {
    switch (label) {
      case 'pending':
        return 'warn';
      case 'active':
        return 'success';
      case 'deactivated':
        return 'secondary';
      default:
        return 'info'; // Todo: remove this randomization
    }
  }

  get columns() {
    return [
      {
        name: this.intl.t('user'),
        component: 'admin/user-management/users/table/member-info',
        minWidth: 150,
      },
      {
        name: this.intl.t('email'),
        valuePath: 'member.email',
        minWidth: 150,
      },
      {
        name: this.intl.t('status'),
        component: 'admin/user-management/users/table/member-status',
        statusText: this.statusLabel,
        color: this.statusLabelColor(this.statusLabel),
        headerComponent:
          'admin/user-management/users/table/member-status-header',
      },
      {
        name: this.intl.t('productAccess'),
        component: 'admin/user-management/users/table/product-access',
        headerComponent:
          'admin/user-management/users/table/product-access-header',
      },
      {
        name: this.intl.t('action'),
        valuePath: 'member.email',
        component: 'admin/user-management/users/table/member-action',
        textAlign: 'right',
      },
    ].filter(Boolean);
  }

  @action
  handleNextAction({ limit, offset }: { limit: number; offset: number }) {
    const { user_query, show_inactive_user } = this.args.queryParams;

    this.fetchUsers.perform(limit, offset, user_query, show_inactive_user);
  }

  @action
  handlePrevAction({ limit, offset }: { limit: number; offset: number }) {
    const { user_query, show_inactive_user } = this.args.queryParams;

    this.fetchUsers.perform(limit, offset, user_query, show_inactive_user);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    const { user_query, show_inactive_user } = this.args.queryParams;

    this.fetchUsers.perform(limit, 0, user_query, show_inactive_user);
  }

  @action
  showDeactivatedMembers(event: Event, checked: boolean) {
    const { user_limit, user_query } = this.args.queryParams;

    this.fetchUsers.perform(user_limit, 0, user_query, checked);
  }

  @action
  searchUserForQuery(event: Event): void {
    debounceTask(
      this,
      'setSearchQuery',
      (event.target as HTMLInputElement).value,
      500
    );
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    const { user_limit, show_inactive_user } = this.args.queryParams;

    this.fetchUsers.perform(user_limit, 0, query, show_inactive_user);
  }

  setRouteQueryParams(
    limit?: number,
    offset?: number,
    query?: string,
    showInActiveUser?: boolean
  ) {
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
      } catch (e) {
        const err = e as AdapterError;
        let errMsg = this.intl.t('pleaseTryAgain');

        if (err.errors && err.errors.length) {
          errMsg = err?.errors[0]?.detail || errMsg;
        } else if (err.message) {
          errMsg = err.message;
        }

        this.notify.error(errMsg);
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::UserManagement::Users::Table': typeof AdminUserManagementUsersTableComponent;
  }
}
