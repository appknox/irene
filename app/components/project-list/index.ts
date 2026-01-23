import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';

import { INPUT } from 'irene/utils/constants';
import {
  DEFAULT_PROJECT_COLUMNS,
  type FilterColumn,
} from 'irene/components/project-list/table-columns';

import type ProjectService from 'irene/services/project';
import type OrganizationService from 'irene/services/organization';
import type LoggerService from 'irene/services/logger';
import { DEFAULT_PROJECT_QUERY_PARAMS } from 'irene/services/project';
import type ProjectModel from 'irene/models/project';

const COLUMN_PREFERENCES_KEY = 'projectListColumnPreferences';

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

interface ScanTypeObject {
  key: string;
  value: number;
}

export default class ProjectListComponent extends Component {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service('project') declare projectService: ProjectService;
  @service declare router: RouterService;
  @service declare logger: LoggerService;

  @tracked limit = DEFAULT_PROJECT_QUERY_PARAMS.limit;
  @tracked offset = DEFAULT_PROJECT_QUERY_PARAMS.offset;
  @tracked query = DEFAULT_PROJECT_QUERY_PARAMS.query;
  @tracked sortKey = DEFAULT_PROJECT_QUERY_PARAMS.sortKey;
  @tracked platform = DEFAULT_PROJECT_QUERY_PARAMS.platform;
  @tracked scanType = DEFAULT_PROJECT_QUERY_PARAMS.scanType;
  @tracked team = DEFAULT_PROJECT_QUERY_PARAMS.team;
  @tracked allColumnsMap: Map<string, FilterColumn>;
  @tracked showColumnManager = false;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.allColumnsMap = this.loadColumnPreferences();

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
    return Array.from(this.allColumnsMap.values())
      .filter((column) => column.selected)
      .sort((a, b) => a.order - b.order);
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
        minWidth: column?.minWidth,
        isFixed: column?.isFixed,
        isHideable: column?.isHideable,
        default: column?.default,
      };

      return baseColumn;
    });
  }

  @action
  initializeColumns(
    columns: Omit<FilterColumn, 'order' | 'defaultOrder'>[]
  ): Map<string, FilterColumn> {
    const columnMap = new Map<string, FilterColumn>();

    columns.forEach((col, index) => {
      columnMap.set(col.field, {
        ...col,
        order: index,
        defaultOrder: index,
      });
    });

    return columnMap;
  }

  @action
  handleProjectRowClick(project: ProjectModel) {
    this.router.transitionTo(
      'authenticated.dashboard.file',
      project.lastFile?.id
    );
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
      this.saveColumnPreferences();
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
      this.team,
      this.scanType
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
      this.team,
      this.scanType
    );
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
    this.saveColumnPreferences();
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
      this.team,
      this.scanType
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
      this.team,
      this.scanType
    );
  }

  @action filterScanType(scanType: ScanTypeObject) {
    this.scanType = scanType.value;
    this.offset = 0;

    this.projectService.fetchProjects.perform(
      this.limit,
      0,
      this.query,
      this.sortKey,
      this.platform,
      this.team,
      this.scanType
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
      this.team,
      this.scanType
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
      this.team,
      this.scanType
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
        this.team,
        this.scanType
      );
    }
  }

  getColumnComponent(field: string): string | undefined {
    const componentMap: Record<string, string> = {
      platform: 'project-list/app-platform',
      name: 'project-list/app-name',
      severityLevel: 'project-list/severity-level',
      scanStatus: 'project-list/scan-statuses',
      tags: 'project-list/tags',
      action: 'project-list/action',
    };

    return componentMap[field];
  }

  loadColumnPreferences() {
    const defaultColumnsMap = this.initializeColumns(DEFAULT_PROJECT_COLUMNS);

    try {
      const saved = localStorage.getItem(COLUMN_PREFERENCES_KEY);
      const preferences = JSON.parse(saved || '{}');

      if (Object.keys(preferences).length < 1) {
        return defaultColumnsMap;
      }

      // Get default columns as the base
      const map = new Map<string, FilterColumn>();

      // Iterate through default columns and merge with saved preferences
      defaultColumnsMap.forEach((defaultColumn, field) => {
        const savedPref = preferences[field];

        const computedColData = savedPref
          ? {
              ...defaultColumn,
              selected: savedPref.selected ?? defaultColumn.selected,
              order: savedPref.order ?? defaultColumn.order,
              width: savedPref.width ?? defaultColumn.width,
              minWidth: savedPref.minWidth ?? defaultColumn.minWidth,
            }
          : defaultColumn;

        map.set(field, computedColData);
      });

      return map;
    } catch (error) {
      this.logger.error('Failed to load column preferences:', error);
      localStorage.removeItem(COLUMN_PREFERENCES_KEY);

      return defaultColumnsMap;
    }
  }

  saveColumnPreferences() {
    const preferences = Array.from(this.allColumnsMap.entries()).reduce(
      (acc, [field, column]) => ({
        ...acc,
        [field]: {
          selected: column.selected,
          order: column.order,
          width: column.width,
          minWidth: column.minWidth,
        },
      }),
      {}
    );

    localStorage.setItem(COLUMN_PREFERENCES_KEY, JSON.stringify(preferences));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ProjectList: typeof ProjectListComponent;
  }
}
