/* eslint-disable ember/no-mixins */
import { action } from '@ember/object';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { underscore } from '@ember/string';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENUMS from 'irene/enums';
import { filterPlatformValues } from 'irene/helpers/filter-platform';
import { INPUT } from 'irene/utils/constants';
import { PaginationMixin } from '../../mixins/paginate';

export default class ProjectListComponent extends PaginationMixin(Component) {
  @service intl;
  @service organization;
  @service realtime;
  @service store;

  constructor() {
    super(...arguments);
  }

  targetModel = 'Project';
  platformType = ENUMS.PLATFORM.UNKNOWN;
  tDateUpdated = this.intl.t('dateUpdated');
  tDateCreated = this.intl.t('dateCreated');
  tProjectName = this.intl.t('projectName');
  tPackageName = this.intl.t('packageName');
  tMostRecent = this.intl.t('mostRecent');
  tLeastRecent = this.intl.t('leastRecent');
  tempQuery = '';

  @tracked projects = null;
  @tracked query = '';
  @tracked sortingKey = 'lastFileCreatedOn';
  @tracked sortingReversed = true;

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

  get hasProjects() {
    return this.organization.selected.projectsCount > 0;
  }

  /**
   * @property {Object} showProjectResults
   * Property to check if projects exists for the current paginated results.
   * It has a similar implementation with the hasObject property from the PaginationMixin.
   */
  get showProjectResults() {
    return this.objects.length > 0;
  }

  get showPagination() {
    return this.showProjectResults && !this.isLoading;
  }

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

  get sortProperties() {
    let sortingKey = this.sortingKey;
    const sortingReversed = this.sortingReversed;
    if (sortingReversed) {
      sortingKey = `${sortingKey}:desc`;
    }
    return [sortingKey];
  }

  get offsetResetter() {
    return (() => {
      const result = [];
      for (let property of [
        'query',
        'sortingKey',
        'sortingReversed',
        'platformType',
      ]) {
        const propertyOldName = `_${property}`;
        const propertyNewValue = this[property];
        const propertyOldValue = this[propertyOldName];
        const propertyChanged = propertyOldValue !== propertyNewValue;

        if (propertyChanged) {
          this.propertyOldName = propertyNewValue;
          result.push(run.once(this, '_resetOffset'));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
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

  get platformObjects() {
    return ENUMS.PLATFORM.CHOICES.slice(0, +-4 + 1 || undefined);
  }

  _resetOffset() {
    this.offset = 0;
  }

  @action sortProjects(event) {
    const [sortingKey, sortingReversed] = filterPlatformValues(
      event?.target?.value
    );
    this.sortingKey = sortingKey;
    this.sortingReversed = sortingReversed;
    this.reload();
  }

  @action filterPlatform(event) {
    this.isLoading = true; // state will be updated in the paginate mixin
    this.platformType = event?.target?.value;
    this._resetOffset();
    this.reload();
  }

  @action onSelectTeam(team) {
    this.isLoading = true; // state will be updated in the paginate mixin
    this.selectedTeam = team;
    this._resetOffset();
    this.reload();
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
    this.tempQuery = event.target.value;
    if (this.tempQuery.length >= INPUT.MIN_LENGTH || this.tempQuery === '') {
      this.query = this.tempQuery;
      this.reload();
    }
  }

  /**
   * @function queryTeams
   * @param {String} teamName
   * Method to query all the matching teams with given name
   */
  @task(function* (query) {
    const teamList = [this.defaultTeam];
    const teams = yield this.store.query('organization-team', query);
    teams.forEach((team) => {
      teamList.push({
        name: team.name,
        id: team.id,
      });
    });
    this.teams = teamList;
  })
  queryTeams;
}
