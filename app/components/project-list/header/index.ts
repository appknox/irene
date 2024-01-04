import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import OrganizationService from 'irene/services/organization';
import Store from '@ember-data/store';
import ENUMS from 'irene/enums';
import ProjectService from 'irene/services/project';
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
  onQueryChange(event: Event): void;
  handleClear(): void;
  filterPlatform(platform: PlatformObject): void;
  onSelectTeam(team: Team): void;
  sortProjects(selected: SortingKeyObject): void;
}

export default class ProjectListHeaderComponent extends Component<ProjectListHeaderArgs> {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service('project') declare projectService: ProjectService;

  tDateUpdated: string;
  tDateCreated: string;
  tPackageName: string;
  tMostRecent: string;
  tLeastRecent: string;

  @tracked teams = [
    {
      name: ENUMS.TEAM.ALL,
    },
  ];

  @tracked defaultTeam: Team = {
    name: ENUMS.TEAM.ALL,
  };

  @tracked selectedPlatform = {
    key: ENUMS.PLATFORM_TEXT.ALL,
    value: ENUMS.PLATFORM.ALL,
  };

  @tracked selectedSortKey: SortingKeyObject;

  @tracked selectedTeam = {
    name: ENUMS.TEAM.ALL,
  };

  @tracked selectedTeamName = ENUMS.TEAM.ALL;

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

    this.projectService.fetchProjects.perform();
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
    return [
      {
        key: ENUMS.PLATFORM_TEXT.ALL,
        value: ENUMS.PLATFORM.ALL,
      },
      {
        key: ENUMS.PLATFORM_TEXT.ANDROID,
        value: ENUMS.PLATFORM.ANDROID,
      },
      {
        key: ENUMS.PLATFORM_TEXT.IOS,
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

  @action onSortProjectsChange(selected: SortingKeyObject) {
    this.selectedSortKey = selected;

    this.args.sortProjects(selected);
  }

  @action filterPlatformChange(platform: PlatformObject) {
    this.selectedPlatform = platform;
    this.args.filterPlatform(platform);
  }

  @action
  clearSearchInput() {
    this.args.handleClear();
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

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectList::Header': typeof ProjectListHeaderComponent;
  }
}
