import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import IntlService from 'ember-intl/services/intl';
import OrganizationService from 'irene/services/organization';
import Store from '@ember-data/store';

import { INPUT } from 'irene/utils/constants';
import {
  DEFAULT_PROJECT_COLUMNS,
  initializeColumns,
} from 'irene/utils/table-columns';
import type { FilterColumn } from 'irene/utils/table-columns';

import ProjectService, {
  DEFAULT_PROJECT_QUERY_PARAMS,
} from 'irene/services/project';
import ProjectModel from 'irene/models/project';
import RouterService from '@ember/routing/router-service';

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
  @service declare router: RouterService;

  @tracked limit = DEFAULT_PROJECT_QUERY_PARAMS.limit;
  @tracked offset = DEFAULT_PROJECT_QUERY_PARAMS.offset;
  @tracked query = DEFAULT_PROJECT_QUERY_PARAMS.query;
  @tracked sortKey = DEFAULT_PROJECT_QUERY_PARAMS.sortKey;
  @tracked platform = DEFAULT_PROJECT_QUERY_PARAMS.platform;
  @tracked team = DEFAULT_PROJECT_QUERY_PARAMS.team;
  @tracked allColumnsMap = initializeColumns(DEFAULT_PROJECT_COLUMNS);
  @tracked showColumnManager = false;
  @tracked disableColumnManager = false;

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
    console.log(this.projects);
    return this.projects.length > 0;
  }

  get hasNoProjects() {
    return this.totalProjectCount === 0;
  }

  get showPagination() {
    return this.showProjectResults && !this.isLoading;
  }

  get viewType() {
    return this.projectService.viewType;
  }

  get isCardView() {
    return this.viewType === 'card';
  }

  get isListView() {
    return this.viewType === 'list';
  }

  get selectedColumns() {
    const columns: FilterColumn[] = [];

    this.allColumnsMap.forEach((column) => {
      if (column.selected) {
        columns.push(column);
      }
    });

    return columns.sort((a, b) => a.order - b.order);
  }

  get columns() {
    return this.selectedColumns.map((column) => {
      // Get the translated column name
      const translatedName = this.intl.t(column.name);

      // Map the column configuration based on the field
      const baseColumn = {
        name: translatedName,
        valuePath: column.field,
        component: this.getColumnComponent(column.field),
        width: column?.width,
      };

      return baseColumn;
    });
  }

  getColumnComponent(field: string): string | undefined {
    const componentMap: Record<string, string> = {
      platform: 'project-list/app-platform',
      name: 'project-list/app-name',
      severityLevel: 'project-list/severity-level',
      scanStatus: 'project-list/scan-statuses',
      tags: 'project-list/tags',
    };

    return componentMap[field];
  }

  @action
  async handleProjectRowClick(project: ProjectModel) {
    const lastFile = project.lastFile;
    if (lastFile) {
      try {
        // If lastFile is a PromiseObject, await it
        const file =
          typeof lastFile.then === 'function' ? await lastFile : lastFile;
        if (file?.id) {
          this.router.transitionTo('authenticated.dashboard.file', file.id);
        }
      } catch (error) {
        console.error('Error accessing file:', error);
      }
    }
  }

  @action
  toggleColumn(field: string) {
    const column = this.allColumnsMap.get(field);
    if (column) {
      this.allColumnsMap.set(field, {
        ...column,
        selected: !column.selected,
      });
      // Trigger reactivity
      this.allColumnsMap = new Map(this.allColumnsMap);
    }
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
  }

  @action
  openColumnManager() {
    this.showColumnManager = true;
  }

  @action
  closeColumnManager() {
    this.showColumnManager = false;
  }

  @action
  handleColumnsUpdate(columnsMap: Map<string, FilterColumn>) {
    this.allColumnsMap = new Map(columnsMap);
    // Here you might want to persist the column preferences
    // e.g., save to local storage or update user preferences via API
    this.closeColumnManager();
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
