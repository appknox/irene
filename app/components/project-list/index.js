import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { isEmpty } from '@ember/utils';

import ENUMS from 'irene/enums';
import { INPUT } from 'irene/utils/constants';
import { DEFAULT_PROJECT_QUERY_PARAMS } from 'irene/services/project';

export default class ProjectListComponent extends Component {
  @service intl;
  @service organization;
  @service store;
  @service('project') projectService;

  tDateUpdated = this.intl.t('dateUpdated');
  tDateCreated = this.intl.t('dateCreated');
  tProjectName = this.intl.t('projectName');
  tPackageName = this.intl.t('packageName');
  tMostRecent = this.intl.t('mostRecent');
  tLeastRecent = this.intl.t('leastRecent');

  @tracked limit = DEFAULT_PROJECT_QUERY_PARAMS.limit;
  @tracked offset = DEFAULT_PROJECT_QUERY_PARAMS.offset;
  @tracked query = DEFAULT_PROJECT_QUERY_PARAMS.query;
  @tracked sortKey = DEFAULT_PROJECT_QUERY_PARAMS.sortKey;
  @tracked platform = DEFAULT_PROJECT_QUERY_PARAMS.platform;
  @tracked team = DEFAULT_PROJECT_QUERY_PARAMS.team;

  /**
   * @property {Array} teams
   * Property for list of matching teams
   */
  @tracked teams = [
    {
      name: 'All',
    },
  ];

  @tracked defaultTeam = {
    name: 'All',
  };

  /**
   * @property {Object} selectedTeam
   * Property for selected team from the list
   */
  @tracked selectedTeam = {
    name: 'All',
  };

  constructor() {
    super(...arguments);

    this.projectService.fetchProjects.perform();
  }

  get isLoading() {
    return this.projectService.fetchProjects.isRunning;
  }

  get projects() {
    return this.projectService.projectQueryResponse?.toArray() || [];
  }

  get hasProjects() {
    return (
      this.organization.selected.projectsCount > 0 ||
      !isEmpty(this.projectService.projectQueryResponse)
    );
  }

  get totalProjectCount() {
    return this.projectService.projectQueryResponse?.meta?.count || 0;
  }

  /**
   * @property {Object} showProjectResults
   * Property to check if projects exists for the current paginated results.
   * It has a similar implementation with the hasObject property from the PaginationMixin.
   */
  get showProjectResults() {
    return this.projects.length > 0;
  }

  get hasNoProjects() {
    return this.totalProjectCount === 0;
  }

  get showPagination() {
    return this.showProjectResults && !this.isLoading;
  }

  get sortingKeyObjects() {
    return [
      {
        key: '-last_file_created_on',
        text: `${this.tDateUpdated} ${this.tMostRecent}`,
      },
      {
        key: 'last_file_created_on',
        text: `${this.tDateUpdated} ${this.tLeastRecent}`,
      },
      {
        key: '-id',
        text: `${this.tDateCreated} ${this.tMostRecent}`,
      },
      {
        key: 'id',
        text: `${this.tDateCreated} ${this.tLeastRecent}`,
      },
      {
        key: '-package_name',
        text: `${this.tPackageName} (Z -> A)`,
      },
      {
        key: 'package_name',
        text: `${this.tPackageName} (A -> Z)`,
      },
    ];
  }

  get platformObjects() {
    return ENUMS.PLATFORM.CHOICES.slice(0, +-4 + 1 || undefined);
  }

  @action
  handlePrevNextAction({ limit, offset }) {
    this.limit = limit;
    this.offset = offset;

    this.projectService.fetchProjects.perform(
      limit,
      offset,
      this.query,
      this.sortKey,
      this.platform,
      this.team
    );
  }

  @action
  handleItemPerPageChange({ limit }) {
    this.limit = limit;
    this.offset = 0;

    this.projectService.fetchProjects.perform(
      limit,
      0,
      this.query,
      this.sortKey,
      this.platform,
      this.team
    );
  }

  @action sortProjects(event) {
    this.sortKey = event?.target?.value;
    this.offset = 0;

    this.projectService.fetchProjects.perform(
      this.limit,
      0,
      this.query,
      this.sortKey,
      this.platform,
      this.team
    );
  }

  @action filterPlatform(event) {
    this.platform = parseInt(event?.target?.value);
    this.offset = 0;

    this.projectService.fetchProjects.perform(
      this.limit,
      0,
      this.query,
      this.sortKey,
      this.platform,
      this.team
    );
  }

  @action onSelectTeam(team) {
    this.selectedTeam = team;
    this.team = team?.id || '';

    this.projectService.fetchProjects.perform(
      this.limit,
      0,
      this.query,
      this.sortKey,
      this.platform,
      this.team
    );
  }

  @action onOpenTFilter() {
    const query = {
      limit: 10,
    };
    this.queryTeams.perform(query);
  }

  @action searchTeams(teamName) {
    if (teamName && teamName.length) {
      const query = {
        q: teamName,
      };
      this.queryTeams.perform(query);
    }
  }

  @action onQueryChange(event) {
    const query = event.target.value;

    if (query.length >= INPUT.MIN_LENGTH || query === '') {
      this.query = query;

      this.projectService.fetchProjects.perform(
        this.limit,
        0,
        this.query,
        this.sortKey,
        this.platform,
        this.team
      );
    }
  }

  /**
   * @function queryTeams
   * @param {String} teamName
   * Method to query all the matching teams with given name
   */
  queryTeams = task(async (query) => {
    const teamList = [this.defaultTeam];
    const teams = await this.store.query('organization-team', query);

    teams.forEach((team) => {
      teamList.push({
        name: team.name,
        id: team.id,
      });
    });

    this.teams = teamList;
  });
}
