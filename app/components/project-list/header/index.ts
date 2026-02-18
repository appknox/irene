import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type OrganizationService from 'irene/services/organization';
import type ProjectService from 'irene/services/project';
import type { FilterColumn } from 'irene/components/project-list/table-columns';
import ENUMS from 'irene/enums';
import styles from './index.scss';

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

interface ProjectListHeaderArgs {
  hasProjects: boolean;
  query: string;
  platform: number;
  scanType: number;
  sortKey: string;
  onQueryChange: (event: Event) => void;
  handleClear: () => void;
  filterPlatform: (platform: PlatformObject) => void;
  filterScanType: (scanType: ScanTypeObject) => void;
  onSelectTeam: (team: Team) => void;
  sortProjects: (selected: SortingKeyObject) => void;
  onColumnsUpdate: (columnsMap: Map<string, FilterColumn>) => void;
  onOpenColumnManager: () => void;
}

export default class ProjectListHeaderComponent extends Component<ProjectListHeaderArgs> {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service('project') declare projectService: ProjectService;
  @service declare store: Store;

  tDateUpdated: string;
  tDateCreated: string;
  tPackageName: string;
  tMostRecent: string;
  tLeastRecent: string;
  tAll: string;

  @tracked teams;
  @tracked defaultTeam: Team;
  @tracked selectedPlatform;
  @tracked selectedScanType;
  @tracked selectedSortKey: SortingKeyObject;
  @tracked selectedTeam;
  @tracked selectedTeamName;

  constructor(owner: unknown, args: ProjectListHeaderArgs) {
    super(owner, args);

    this.tDateUpdated = this.intl.t('dateUpdated');
    this.tDateCreated = this.intl.t('dateCreated');
    this.tPackageName = this.intl.t('packageName');
    this.tMostRecent = this.intl.t('mostRecent');
    this.tLeastRecent = this.intl.t('leastRecent');
    this.tAll = this.intl.t('all');

    this.teams = [{ name: this.tAll }];
    this.defaultTeam = { name: this.tAll };
    this.selectedPlatform = { key: this.tAll, value: -1 };
    this.selectedScanType = { key: this.tAll, value: -1 };
    this.selectedTeam = { name: this.tAll };
    this.selectedTeamName = this.tAll;

    this.selectedSortKey = {
      key: '-last_file_created_on',
      text: `${this.tDateUpdated} ${this.tMostRecent}`,
    };
  }

  get showClearFilter() {
    return (
      !this.projectService.fetchProjects.isRunning &&
      (this.selectedTeam.name !== this.defaultTeam.name ||
        this.selectedPlatform.value !== -1 ||
        this.selectedScanType.value !== -1)
    );
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

  get platformObjects(): PlatformObject[] {
    return [
      {
        key: this.tAll,
        value: -1,
      },
      {
        key: 'Android',
        value: ENUMS.PLATFORM.ANDROID,
      },
      {
        key: 'iOS',
        value: ENUMS.PLATFORM.IOS,
      },
    ];
  }

  get isManualScanAvailable() {
    return this.organization.selected?.features?.manualscan;
  }

  get scanTypeObjects() {
    return [
      {
        key: this.tAll,
        value: -1,
      },
      {
        key: this.intl.t('static'),
        value: ENUMS.SCAN_TYPE_FILTER.STATIC_SCAN,
      },
      {
        key: this.intl.t('dynamic'),
        value: ENUMS.SCAN_TYPE_FILTER.DYNAMIC_SCAN,
      },
      {
        key: this.intl.t('api'),
        value: ENUMS.SCAN_TYPE_FILTER.API_SCAN,
      },
      this.isManualScanAvailable && {
        key: this.intl.t('manual'),
        value: ENUMS.SCAN_TYPE_FILTER.MANUAL_SCAN,
      },
    ].filter(Boolean) as ScanTypeObject[];
  }

  get dropDownClass() {
    return styles['filter-input-dropdown'];
  }

  get triggerClass() {
    return styles['filter-input'];
  }

  get clearFilterIconClass() {
    return styles['clear-filter-icon'];
  }

  get viewType() {
    return this.projectService.viewType;
  }

  get totalProjectCount() {
    return this.projectService.projectQueryResponse?.meta?.count || 0;
  }

  get overallProjectCount() {
    return this.projectService.overallProjectCount;
  }

  get isCardView() {
    return this.viewType === 'card';
  }

  get isListView() {
    return this.viewType === 'list';
  }

  @action handleCardViewClick() {
    this.projectService.setViewType('card');
  }

  @action handleListViewClick() {
    this.projectService.setViewType('list');
  }

  @action onSortProjectsChange(selected: SortingKeyObject) {
    this.selectedSortKey = selected;

    this.args.sortProjects(selected);
  }

  @action filterPlatformChange(platform: PlatformObject) {
    this.selectedPlatform = platform;
    this.args.filterPlatform(platform);
  }

  @action filterScanTypeChange(scanType: ScanTypeObject) {
    this.selectedScanType = scanType;
    this.args.filterScanType(scanType);
  }

  @action handleOpenColumnManager() {
    this.args.onOpenColumnManager?.();
  }

  @action
  clearSearchInput() {
    this.args.handleClear();
  }

  @action clearFilters() {
    this.onSelectTeamChange(this.defaultTeam);

    this.filterPlatformChange({
      key: this.tAll,
      value: -1,
    });

    this.filterScanTypeChange({
      key: this.tAll,
      value: -1,
    });
  }

  @action onSelectTeamChange(team: Team) {
    this.selectedTeam = team;

    this.selectedTeamName = team.name;

    this.args.onSelectTeam(team);
  }

  @action onOpenTFilter() {
    const query = {
      limit: 10,
    };

    this.queryTeams.perform(query);
  }

  @action searchTeams(teamName: string) {
    if (teamName && teamName.length) {
      const query = {
        q: teamName,
      };

      this.queryTeams.perform(query);
    }
  }

  @action onSearchQueryChange(event: Event) {
    this.args.onQueryChange(event);
  }

  /**
   * @function queryTeams
   * @param {String} teamName
   * Method to query all the matching teams with given name
   */
  queryTeams = task(async (query) => {
    const teamList: Team[] = [];
    const teams = await this.store.query('organization-team', query);

    if (Number(teams.length) > 0) {
      teamList.push(this.defaultTeam);
    }

    teams.forEach((team) => {
      teamList.push({
        name: team.name,
        id: team.id,
      });
    });

    this.teams = teamList;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectList::Header': typeof ProjectListHeaderComponent;
  }
}
