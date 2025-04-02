import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { debounceTask } from 'ember-lifeline';
import { tracked } from '@glimmer/tracking';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';

import parseError from 'irene/utils/parse-error';
import type MeService from 'irene/services/me';
import type OrganizationTeamModel from 'irene/models/organization-team';
import type OrganizationMemberModel from 'irene/models/organization-member';
import type OrganizationModel from 'irene/models/organization';

import styles from './index.scss';

interface AdminSettingsUserDetailsAppknoxInfoTeamsComponentSignature {
  Args: {
    organization: OrganizationModel | null;
    member: OrganizationMemberModel | null;
  };
  Element: HTMLElement;
}

type TeamResponseArray =
  DS.AdapterPopulatedRecordArray<OrganizationTeamModel> & {
    meta: { count: number };
  };

export default class AdminSettingsUserDetailsAppknoxInfoTeamsComponent extends Component<AdminSettingsUserDetailsAppknoxInfoTeamsComponentSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked searchQuery = '';
  @tracked limit = 5;
  @tracked offset = 0;
  @tracked teamResponse: TeamResponseArray | null = null;
  @tracked showAddToTeamsDrawer = false;

  constructor(
    owner: unknown,
    args: AdminSettingsUserDetailsAppknoxInfoTeamsComponentSignature['Args']
  ) {
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
      {
        name: this.intl.t('action'),
        component: 'admin-settings/user-details/appknox-info/teams/action',
        textAlign: 'right',
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

  get classes() {
    return { textFieldRootClass: styles['teams-search-query-root-class'] };
  }

  @action
  setSearchQuery(query: string) {
    this.searchQuery = query;
    this.offset = 0;

    this.fetchTeams.perform(this.limit, this.offset, query);
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
  handleFetchTeams(limit: number, offset: number) {
    this.fetchTeams.perform(limit, offset, this.searchQuery);
  }

  @action
  launchAddToTeamDrawer() {
    this.showAddToTeamsDrawer = true;
  }

  @action
  closeAddToTeamsDrawer() {
    this.showAddToTeamsDrawer = false;
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
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::AppknoxInfo::Teams': typeof AdminSettingsUserDetailsAppknoxInfoTeamsComponent;
  }
}
