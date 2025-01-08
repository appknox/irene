import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { debounceTask } from 'ember-lifeline';
import { task } from 'ember-concurrency';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import MeService from 'irene/services/me';
import IntlService from 'ember-intl/services/intl';
import RouterService from '@ember/routing/router-service';
import OrganizationService from 'irene/services/organization';
import Store from '@ember-data/store';
import OrganizationTeamModel from 'irene/models/organization-team';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

export interface OrganizationTeamComponentSignature {
  Args: {
    queryParams: {
      team_limit: number;
      team_offset: number;
      team_query: string;
    };
  };
}

type TeamResponseModel =
  DS.AdapterPopulatedRecordArray<OrganizationTeamModel> & {
    meta?: { count: number };
  };

export default class OrganizationTeamComponent extends Component<OrganizationTeamComponentSignature> {
  @service declare me: MeService;
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked showTeamDetails = false;
  @tracked selectedTeam: OrganizationTeamModel | null = null;
  @tracked teamResponse: TeamResponseModel | null = null;

  constructor(
    owner: unknown,
    args: OrganizationTeamComponentSignature['Args']
  ) {
    super(owner, args);

    const { team_limit, team_offset, team_query } = this.args.queryParams;

    this.fetchTeams.perform(team_limit, team_offset, team_query, false);
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

  get existsSelectedTeam() {
    return this.selectedTeam && this.organization.selected;
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    const { team_limit } = this.args.queryParams;

    this.fetchTeams.perform(team_limit, 0, query);
  }

  @action
  handleSearchInputKeyUp(event: Event) {
    debounceTask(
      this,
      'setSearchQuery',
      (event.target as HTMLInputElement).value,
      500
    );
  }

  @action
  handleShowTeamDetails(team: OrganizationTeamModel) {
    this.selectedTeam = team;
    this.showTeamDetails = true;
  }

  @action
  handleTeamDetailClose() {
    this.selectedTeam = null;
    this.showTeamDetails = false;
  }

  @action
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    const { team_query } = this.args.queryParams;

    this.fetchTeams.perform(limit, offset, team_query);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    const { team_query } = this.args.queryParams;

    this.fetchTeams.perform(limit, 0, team_query);
  }

  setRouteQueryParams(limit: number, offset: number, query: string) {
    this.router.transitionTo({
      queryParams: {
        team_limit: limit,
        team_offset: offset,
        team_query: query,
      },
    });
  }

  @action
  handleReloadTeams() {
    const { team_limit, team_offset, team_query } = this.args.queryParams;

    this.fetchTeams.perform(team_limit, team_offset, team_query);
  }

  get isAdmin() {
    return this.me.org?.get('is_admin');
  }

  fetchTeams = task(
    { drop: true },
    async (limit, offset, query = '', setQueryParams = true) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset, query);
      }

      try {
        this.teamResponse = await this.store.query('organization-team', {
          limit,
          offset,
          q: query,
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
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationTeam: typeof OrganizationTeamComponent;
  }
}
