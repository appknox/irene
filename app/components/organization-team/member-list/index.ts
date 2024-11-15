import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { debounce } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';
import Store from '@ember-data/store';
import { AsyncHasMany } from '@ember-data/model';
import { waitForPromise } from '@ember/test-waiters';

import OrganizationTeamModel from 'irene/models/organization-team';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import OrganizationTeamMemberModel from 'irene/models/organization-team-member';
import OrganizationModel from 'irene/models/organization';
import { ActiveActionDetailsType } from '../details/active-action';

export interface OrganizationTeamMemberListComponentSignature {
  Args: {
    team: OrganizationTeamModel;
    organization: OrganizationModel;
    members: AsyncHasMany<OrganizationTeamMemberModel>;
    handleActiveAction: (actionArgs: ActiveActionDetailsType) => void;
  };
  Element: HTMLElement;
}

type teamMemberResponseModel =
  DS.AdapterPopulatedRecordArray<OrganizationTeamMemberModel> & {
    meta?: { count: number };
  };

export default class OrganizationTeamMemberListComponent extends Component<OrganizationTeamMemberListComponentSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked searchQuery = '';
  @tracked limit = 5;
  @tracked offset = 0;
  @tracked teamMemberResponse: teamMemberResponseModel | null = null;

  constructor(
    owner: unknown,
    args: OrganizationTeamMemberListComponentSignature['Args']
  ) {
    super(owner, args);

    this.fetchTeamMembers.perform(this.limit, this.offset);
  }

  get teamMemberList() {
    return this.teamMemberResponse?.slice() || [];
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
      this.me.org?.get('is_admin')
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
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchTeamMembers.perform(limit, offset, this.searchQuery);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchTeamMembers.perform(limit, 0, this.searchQuery);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    this.searchQuery = query;

    this.fetchTeamMembers.perform(this.limit, 0, query);
  }

  @action
  handleSearchQueryChange(event: Event) {
    debounce(
      this,
      this.setSearchQuery,
      (event.target as HTMLInputElement).value,
      500
    );
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

      this.teamMemberResponse = await waitForPromise(
        this.store.query('organization-team-member', queryParams)
      );
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::MemberList': typeof OrganizationTeamMemberListComponent;
  }
}
