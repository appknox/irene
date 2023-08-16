import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { debounce } from '@ember/runloop';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import RouterService from '@ember/routing/router-service';
import OrganizationMemberModel from 'irene/models/organization-member';
import OrganizationTeamModel from 'irene/models/organization-team';
import MeService from 'irene/services/me';
import OrganizationModel from 'irene/models/organization';

interface AddToTeamComponentSignature {
  Args: {
    member: OrganizationMemberModel | null;
    organization: OrganizationModel | null;
    handleBackToTeamDetail: () => void;
  };
  Element: HTMLElement;
}

type TeamResponseArray =
  DS.AdapterPopulatedRecordArray<OrganizationTeamModel> & {
    meta?: { count: number };
  };

export default class AddToTeamComponent extends Component<AddToTeamComponentSignature> {
  @service declare intl: IntlService;
  @service declare notify: NotificationService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare me: MeService;

  @tracked teamResponse: TeamResponseArray | null = null;
  @tracked searchQuery = '';
  @tracked limit = 10;
  @tracked offset = 0;

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
            component: 'organization-member/list/add-to-team/add-user-action',
            textAlign: 'right',
          }
        : null,
    ].filter(Boolean);
  }

  constructor(owner: unknown, args: AddToTeamComponentSignature['Args']) {
    super(owner, args);
    this.fetchTeams.perform(this.limit, this.offset);
  }

  get teamList() {
    return this.teamResponse?.toArray() || [];
  }

  get totalTeamCount() {
    return this.teamResponse?.meta?.count || 0;
  }

  get hasNoTeam() {
    return this.totalTeamCount === 0;
  }

  fetchTeams = task({ drop: true }, async (limit, offset, query = '') => {
    try {
      this.teamResponse = await this.store.query('organization-team', {
        limit,
        offset,
        q: query,
        exclude_user: this.args.member?.get('id'),
      });
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
    'OrganizationMember::List::AddToTeam': typeof AddToTeamComponent;
  }
}
