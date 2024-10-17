import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import IntlService from 'ember-intl/services/intl';
import OrganizationService from 'irene/services/organization';
import Store from '@ember-data/store';

import { INPUT } from 'irene/utils/constants';

import ProjectService, {
  DEFAULT_PROJECT_QUERY_PARAMS,
} from 'irene/services/project';

interface Team {
  name: string;
  id?: string;
}

interface SortingKeyObject {
  key: string;
  text: string;
}

interface PlatformObject {
  key: string;
  value: number;
}

export default class ProjectListComponent extends Component {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service('project') declare projectService: ProjectService;

  @tracked limit = DEFAULT_PROJECT_QUERY_PARAMS.limit;
  @tracked offset = DEFAULT_PROJECT_QUERY_PARAMS.offset;
  @tracked query = DEFAULT_PROJECT_QUERY_PARAMS.query;
  @tracked sortKey = DEFAULT_PROJECT_QUERY_PARAMS.sortKey;
  @tracked platform = DEFAULT_PROJECT_QUERY_PARAMS.platform;
  @tracked team = DEFAULT_PROJECT_QUERY_PARAMS.team;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.projectService.fetchProjects.perform();
  }

  get isLoading() {
    return this.projectService.fetchProjects.isRunning;
  }

  get projects() {
    return this.projectService.projectQueryResponse?.slice() || [];
  }

  get hasProjects() {
    return (
      (this.organization.selected &&
        this.organization.selected.projectsCount > 0) ||
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

  @action
  handlePrevNextAction({ limit, offset }: { limit: number; offset: number }) {
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
  handleItemPerPageChange({ limit }: { limit: number }) {
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

  @action sortProjects(selected: SortingKeyObject) {
    this.sortKey = selected?.key;
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

  @action filterPlatform(platform: PlatformObject) {
    this.platform = platform.value;
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

  @action
  handleClear() {
    this.query = '';

    this.projectService.fetchProjects.perform(
      this.limit,
      0,
      this.query,
      this.sortKey,
      this.platform,
      this.team
    );
  }

  @action onSelectTeam(team: Team) {
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

  @action onQueryChange(event: Event) {
    const query = (event.target as HTMLSelectElement).value;

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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ProjectList: typeof ProjectListComponent;
  }
}
