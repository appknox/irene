import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { debounce } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';
import OrganizationTeamModel from 'irene/models/organization-team';
import OrganizationMemberModel from 'irene/models/organization-member';
import OrganizationModel from 'irene/models/organization';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

interface MemberDetailsComponentSignature {
  Args: {
    organization: OrganizationModel | null;
    member: OrganizationMemberModel | null;
    showUserDetailsView: boolean;
    handleUserDetailClose: () => void;
    handleAddToTeam: () => void;
  };
  Element: HTMLElement;
}

type TeamResponseArray =
  DS.AdapterPopulatedRecordArray<OrganizationTeamModel> & {
    meta: { count: number };
  };

export default class MemberDetailsComponent extends Component<MemberDetailsComponentSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked searchQuery = '';
  @tracked limit = 5;
  @tracked offset = 0;
  @tracked teamResponse: TeamResponseArray | null = null;
  @tracked showAddToTeamView = false;

  constructor(owner: unknown, args: MemberDetailsComponentSignature['Args']) {
    super(owner, args);
    this.fetchTeams.perform(this.limit, this.offset);
  }

  get isDeactivated() {
    return this.args.member?.member?.get('isActive') === false;
  }

  get teamsList() {
    return this.teamResponse?.slice() || [];
  }

  get totalTeamCount() {
    return this.teamResponse?.meta?.count || 0;
  }

  get hasNoTeam() {
    return this.totalTeamCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('teamName'),
        valuePath: 'name',
        minWidth: 150,
      },
      this.me.org?.get('is_admin')
        ? {
            name: this.intl.t('action'),
            component: 'organization-member/list/member-details/remove-action',
            textAlign: 'right',
          }
        : null,
    ].filter(Boolean);
  }

  get memberDetails() {
    return [
      {
        label: this.intl.t('user'),
        value: this.args.member?.member?.get('username'),
      },
      {
        label: this.intl.t('emailId'),
        value: this.args.member?.member?.get('email'),
      },
      {
        label: this.intl.t('role'),
        value: this.args.member?.get('role'),
        component: 'organization-member/list/member-role' as const,
      },
      {
        label: this.intl.t('lastLoggedIn'),
        isLast: true,
        component: 'organization-member/list/member-last-login' as const,
      },
    ];
  }

  @action
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchTeams.perform(limit, offset, this.searchQuery);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchTeams.perform(limit, 0, this.searchQuery);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    this.searchQuery = query;

    this.fetchTeams.perform(this.limit, 0, query);
  }

  @action
  handleSearchQueryChange(event: Event) {
    debounce(
      this,
      this.setSearchQuery,
      (event.target as HTMLInputElement)?.value,
      500
    );
  }

  @action
  handleReloadTeams() {
    this.fetchTeams.perform(this.limit, this.offset, this.searchQuery);
  }

  fetchTeams = task({ drop: true }, async (limit, offset, query = '') => {
    try {
      const queryParams = {
        limit,
        offset,
        q: query,
        include_user: this.args.member?.get('id'),
      };

      this.teamResponse = (await this.store.query(
        'organization-team',
        queryParams
      )) as TeamResponseArray;
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
    'OrganizationMember::List::MemberDetails': typeof MemberDetailsComponent;
    'organization-member/list/member-details': typeof MemberDetailsComponent;
  }
}
