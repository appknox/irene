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

interface ProjectListHeaderArgs {
  hasProjects: boolean;
  query: string;
  platform: number;
  sortKey: string;
  onQueryChange: (event: Event) => void;
  handleClear: () => void;
  filterPlatform: (platform: PlatformObject) => void;
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

  @tracked teams = [
    {
      name: 'All',
    },
  ];

  @tracked defaultTeam: Team = {
    name: 'All',
  };

  @tracked selectedPlatform = {
    key: 'All',
    value: -1,
  };

  @tracked selectedSortKey: SortingKeyObject;

  @tracked selectedTeam = {
    name: 'All',
  };

  @tracked selectedTeamName = 'All';

  constructor(owner: unknown, args: ProjectListHeaderArgs) {
    super(owner, args);

    this.tDateUpdated = this.intl.t('dateUpdated');
    this.tDateCreated = this.intl.t('dateCreated');
    this.tPackageName = this.intl.t('packageName');
    this.tMostRecent = this.intl.t('mostRecent');
    this.tLeastRecent = this.intl.t('leastRecent');

    this.selectedSortKey = {
      key: '-last_file_created_on',
      text: `${this.tDateUpdated} ${this.tMostRecent}`,
    };
  }

  get showClearFilter() {
    return (
      this.selectedTeam.name !== this.defaultTeam.name ||
      this.selectedPlatform.value !== -1
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
        key: 'All',
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
      key: 'All',
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
