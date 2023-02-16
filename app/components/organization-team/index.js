import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { task } from 'ember-concurrency';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class OrganizationTeamComponent extends Component {
  @service me;
  @service intl;
  @service router;
  @service store;
  @service organization;
  @service('notifications') notify;

  @tracked showTeamDetails = false;
  @tracked selectedTeam = null;
  @tracked teamResponse = null;

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  constructor() {
    super(...arguments);

    const { team_limit, team_offset, team_query } = this.args.queryParams;

    this.fetchTeams.perform(team_limit, team_offset, team_query, false);
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

  /* Set debounced searchQuery */
  setSearchQuery(query) {
    const { team_limit } = this.args.queryParams;

    this.fetchTeams.perform(team_limit, 0, query);
  }

  @action
  handleSearchInputKeyUp(event) {
    debounce(this, this.setSearchQuery, event.target.value, 500);
  }

  @action
  handleShowTeamDetails(team) {
    this.selectedTeam = team;
    this.showTeamDetails = true;
  }

  @action
  handleTeamDetailClose() {
    this.selectedTeam = null;
    this.showTeamDetails = false;
  }

  @action
  handleNextPrevAction({ limit, offset }) {
    const { team_query } = this.args.queryParams;

    this.fetchTeams.perform(limit, offset, team_query);
  }

  @action
  handleItemPerPageChange({ limit }) {
    const { team_query } = this.args.queryParams;

    this.fetchTeams.perform(limit, 0, team_query);
  }

  setRouteQueryParams(limit, offset, query) {
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
