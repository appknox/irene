import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';
import RouterService from '@ember/routing/router-service';
import StoreService from '@ember-data/store';
import OrganizationModel from 'irene/models/organization';
import OrganizationMemberModel from 'irene/models/organization-member';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import { OrganizationMembersRouteQueryParams } from 'irene/routes/authenticated/organization/users';

export interface OrganizationMemberListComponentSignature {
  Args: {
    organization: OrganizationModel | null;
    queryParams: OrganizationMembersRouteQueryParams;
    limit?: number;
    offset?: number;
  };
  Element: HTMLElement;
}
type userResponseModel =
  DS.AdapterPopulatedRecordArray<OrganizationMemberModel> & {
    meta?: { count: number };
  };

export default class OrganizationMemberListComponent extends Component<OrganizationMemberListComponentSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare store: StoreService;
  @service('notifications') declare notify: NotificationService;
  @service declare router: RouterService;

  @tracked userResponse: userResponseModel | null = null;

  constructor(
    owner: unknown,
    args: OrganizationMemberListComponentSignature['Args']
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
        textAlign: this.me.org?.get('is_owner') ? 'center' : 'left',
      },
      this.me.org?.get('is_owner')
        ? {
            name: this.intl.t('action'),
            component: 'organization-member/list/member-action',
            textAlign: 'center',
          }
        : null,
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
    debounce(
      this,
      this.setSearchQuery,
      (event?.target as HTMLInputElement)?.value,
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
    'OrganizationMember::List': typeof OrganizationMemberListComponent;
  }
}
