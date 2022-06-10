import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { underscore } from '@ember/string';
import { isEmpty } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import { filterPlatformValues } from 'irene/helpers/filter-platform';
import { INPUT } from 'irene/utils/constants';

export default class ProjectListNewComponent extends Component {
  @service intl;
  @service organization;
  @service store;

  @tracked classNames = ['columns', 'project-list'];
  @tracked projects = null;
  @tracked query = '';
  @tracked tempQuery = '';
  @tracked targetModel = 'Project';
  @tracked sortingKey = 'lastFileCreatedOn';
  @tracked sortingReversed = true;
  @tracked platformType = ENUMS.PLATFORM.UNKNOWN;
  @tracked tDateUpdated = this.intl.t('dateUpdated');
  @tracked tDateCreated = this.intl.t('dateCreated');
  @tracked tProjectName = this.intl.t('projectName');
  @tracked tPackageName = this.intl.t('packageName');
  @tracked tMostRecent = this.intl.t('mostRecent');
  @tracked tLeastRecent = this.intl.t('leastRecent');
  @tracked isLoading = true;
  @tracked isJsonApiPagination = false;
  @tracked isDRFPagination = true;
  @tracked currentObjects = [];
  @tracked meta = null;
  @tracked limit = 9;
  @tracked offset = 0;

  platformObjects = ENUMS.PLATFORM.CHOICES.slice(0, +-4 + 1 || undefined);
  offsetMultiplier = ENV.paginate.offsetMultiplier;
  itemPerPageSelectOptions = [9, 18, 27, 36, 45, '50'];

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

  get extraQueryStrings() {
    const platform = this.platformType;
    const reverse = this.sortingReversed;
    const sorting = underscore(this.sortingKey);
    const team = this.selectedTeam;

    const query = {
      q: this.query,
      sorting: sorting,
    };
    if (platform != null && platform != -1) {
      query['platform'] = platform;
    }
    if (reverse) {
      query['sorting'] = '-' + sorting;
    }

    if (team && team.id) {
      query['team'] = team.id;
    }

    return JSON.stringify(query, Object.keys(query).sort());
  }

  get currentQuery() {
    let query;
    if (this.isJsonApiPagination) {
      const query_limit = this.limit;
      const query_offset = this.offset;
      query = {
        'page[limit]': this.limit,
        'page[offset]': query_limit * query_offset,
      };
    } else {
      query = {
        limit: this.limit,
        offset: this.offset,
      };
    }
    const extraQueryStrings = this.extraQueryStrings;
    if (!isEmpty(extraQueryStrings)) {
      const extraQueries = JSON.parse(extraQueryStrings);
      for (let key in extraQueries) {
        const value = extraQueries[key];
        query[key] = value;
      }
    }
    if (this.isDRFPagination) {
      query.offset = query.offset * (this.limit || 1);
    }
    return query;
  }

  get objects() {
    return this.currentObjects;
  }

  get objectCount() {
    return this.objects.length;
  }

  get sortedObjects() {
    return this.objects;
  }

  get hasObjects() {
    return this.objectCount > 0;
  }

  get hasNoObject() {
    return this.meta.count === 0;
  }

  get hasProjects() {
    return this.organization.selected.projectsCount > 0;
  }

  get isEmptyResults() {
    return !this.isLoading && this.objects.length < 1;
  }

  get totalCount() {
    return this.meta.total;
  }

  get sortProperties() {
    let sortingKey = this.sortingKey;
    const sortingReversed = this.sortingReversed;
    if (sortingReversed) {
      sortingKey = `${sortingKey}:desc`;
    }
    return [sortingKey];
  }

  get sortingKeyObjects() {
    const tDateUpdated = this.tDateUpdated;
    const tDateCreated = this.tDateCreated;
    const tPackageName = this.tPackageName;
    const tLeastRecent = this.tLeastRecent;
    const tMostRecent = this.tMostRecent;
    const keyObjects = [
      {
        key: 'lastFileCreatedOn',
        text: tDateUpdated,
      },
      {
        key: 'id',
        text: tDateCreated,
      },
      {
        key: 'packageName',
        text: tPackageName,
      },
    ];
    const keyObjectsWithReverse = [];
    for (let keyObject of Array.from(keyObjects)) {
      for (let reverse of [true, false]) {
        const keyObjectFull = {};
        keyObjectFull.reverse = reverse;
        keyObjectFull.key = keyObject.key;
        keyObjectFull.text = keyObject.text;
        if (reverse) {
          if (['lastFileCreatedOn', 'id'].includes(keyObject.key)) {
            keyObjectFull.text += tMostRecent;
          } else {
            keyObjectFull.text += '(Z -> A)';
          }
        } else {
          if (['lastFileCreatedOn', 'id'].includes(keyObject.key)) {
            keyObjectFull.text += tLeastRecent;
          } else {
            keyObjectFull.text += '(A -> Z)';
          }
        }
        keyObjectsWithReverse.push(keyObjectFull);
      }
    }
    return keyObjectsWithReverse;
  }

  // Pagination page fetch handler
  @action getPage(args) {
    const { selectedItemsPerPage } = args;
    if (this.limit !== selectedItemsPerPage) {
      this.limit = selectedItemsPerPage;
      this.resetOffset();
      this.fetchProjects();
    }
  }

  // Pagination next and previous button action handler
  @action goToPage(args) {
    const { offset } = args;
    if (offset - 1 !== this.offset) {
      this.offset = offset - 1;
      this.fetchProjects();
    }
  }

  @action fetchProjects() {
    return this.fetchObjects.perform();
  }

  @action resetOffset() {
    this.offset = 0;
  }

  @action sortProjects() {
    const select = document.getElementById('project-sort-property');
    const [sortingKey, sortingReversed] = filterPlatformValues(select.value);
    this.sortingKey = sortingKey;
    this.sortingReversed = sortingReversed;
  }

  @action filterPlatform() {
    this.isLoading = true; // state will be updated in the paginate mixin
    const select = document.getElementById('project-filter-platform');
    this.platformType = select.value;
    this.resetOffset();
    this.fetchProjects();
  }

  // Action to get/set selected team object
  @action onSelectTeam(team) {
    this.isLoading = true; // state will be updated in the paginate mixin
    this.selectedTeam = team;
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

  //Action triggered when typing on the search query input
  @action onQueryChange() {
    if (this.tempQuery.length >= INPUT.MIN_LENGTH || this.tempQuery === '') {
      this.query = this.tempQuery;
    }
  }

  @task(function* (query) {
    const teamList = [this.defaultTeam];
    const teams = yield this.store.query('organization-team', query);
    teams.forEach((team) => {
      teamList.pushObject({
        name: team.name,
        id: team.id,
      });
    });
    this.teams = teamList;
  })
  queryTeams;

  @task(function* () {
    const query = this.currentQuery;
    const targetModel = this.targetModel;
    this.isLoading = true;
    try {
      const objects = yield this.store.query(targetModel, query);
      const meta = objects.meta;
      if (objects.links && objects.meta.pagination) {
        // JSON API
        meta.total = objects.meta.pagination.count;
        this.isJsonApiPagination = true;
        this.isDRFPagination = false;
      }
      if ('count' in objects.meta) {
        // DRF
        meta.total = objects.meta.count || 0;
        this.isJsonApiPagination = false;
        this.isDRFPagination = true;
      }
      this.meta = meta;
      this.currentObjects = objects;
      this.isLoading = false;
    } catch (err) {
      this.error = err;
      this.currentObjects = [];
      this.isLoading = false;
    }
  })
  fetchObjects;
}
