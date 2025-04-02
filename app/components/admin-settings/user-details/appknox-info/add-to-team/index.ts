import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { debounceTask } from 'ember-lifeline';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';

import parseError from 'irene/utils/parse-error';
import type OrganizationMemberModel from 'irene/models/organization-member';
import type OrganizationTeamModel from 'irene/models/organization-team';
import type MeService from 'irene/services/me';
import type OrganizationModel from 'irene/models/organization';

interface AddToTeamComponentSignature {
  Element: HTMLElement;
  Args: {
    member: OrganizationMemberModel | null;
    organization: OrganizationModel | null;
    showAddToTeamsDrawer: boolean;
    handleDrawerClose(): void;
  };
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

  constructor(owner: unknown, args: AddToTeamComponentSignature['Args']) {
    super(owner, args);

    this.fetchTeams.perform(this.limit, this.offset);
  }

  get columns() {
    return [
      {
        name: this.intl.t('teamName'),
        valuePath: 'name',
        minWidth: 150,
      },
      {
        name: this.intl.t('action'),
        textAlign: 'right',
        component:
          'admin-settings/user-details/appknox-info/add-to-team/add-user-action',
      },
    ];
  }

  get teamList() {
    return this.teamResponse?.slice() || [];
  }

  get totalTeamCount() {
    return this.teamResponse?.meta?.count || 0;
  }

  get hasNoTeam() {
    return this.totalTeamCount === 0;
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

  @action
  setSearchQuery(query: string) {
    this.searchQuery = query;

    this.fetchTeams.perform(this.limit, 0, query);
  }

  @action
  handleSearchQueryChange(event: Event) {
    debounceTask(
      this,
      'setSearchQuery',
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
      this.teamResponse = await this.store.query('organization-team', {
        limit,
        offset,
        q: query,
        exclude_user: this.args.member?.get('id'),
      });
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::AppknoxInfo::AddToTeam': typeof AddToTeamComponent;
  }
}
