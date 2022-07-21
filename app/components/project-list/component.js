/* eslint-disable ember/no-array-prototype-extensions, ember/no-classic-components, prettier/prettier, ember/no-mixins, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, ember/no-observers, ember/no-get, ember/no-actions-hash, ember/no-jquery */
import Component from '@ember/component';
import {
  inject as service
} from '@ember/service';
import {
  computed
} from '@ember/object';
import {
  observer
} from '@ember/object';
import {
  underscore
} from '@ember/string';
import {
  run
} from '@ember/runloop';
import PaginateMixin from 'irene/mixins/paginate';
import ENUMS from 'irene/enums';
import {
  filterPlatformValues
} from 'irene/helpers/filter-platform';
import {
  t
} from 'ember-intl';
import $ from 'jquery';
import {
  task
} from 'ember-concurrency';
import {
  INPUT
} from 'irene/utils/constants';

const ProjectListComponent = Component.extend(PaginateMixin, {

  intl: service(),
  organization: service(),

  classNames: ["columns", "project-list"],
  projects: null,
  hasProjects: computed.gt('organization.selected.projectsCount', 0),
  query: "",
  tempQuery: "",
  targetModel: "Project",

  sortingKey: "lastFileCreatedOn",
  sortingReversed: true,
  platformType: ENUMS.PLATFORM.UNKNOWN,

  tDateUpdated: t("dateUpdated"),
  tDateCreated: t("dateCreated"),
  tProjectName: t("projectName"),
  tPackageName: t("packageName"),
  tMostRecent: t("mostRecent"),
  tLeastRecent: t("leastRecent"),

  isLoading: false,

  /**
   * @property {Array} teams
   * Property for list of matching teams
   */
  teams: [{
    name: 'All'
  }],

  defaultTeam: {
    name: 'All'
  },

  /**
   * @property {Object} selectedTeam
   * Property for selected team from the list
   */
  selectedTeam: {
    name: 'All'
  },

  newProjectsObserver: observer("realtime.ProjectCounter", "realtime.FileCounter", function () {
    return this.incrementProperty("version");
  }),

  sortProperties: computed("sortingKey", "sortingReversed", function () {
    let sortingKey = this.get("sortingKey");
    const sortingReversed = this.get("sortingReversed");
    if (sortingReversed) {
      sortingKey = `${sortingKey}:desc`;
    }
    return [sortingKey];
  }),

  resetOffset() {
    return this.set("offset", 0);
  },

  offsetResetter: observer("query", "sortingKey", "sortingReversed", "platformType", function () {
    return (() => {
      const result = [];
      for (let property of ["query", "sortingKey", "sortingReversed", "platformType"]) {
        const propertyOldName = `_${property}`;
        const propertyNewValue = this.get(property);
        const propertyOldValue = this.get(propertyOldName);
        const propertyChanged = propertyOldValue !== propertyNewValue;
        if (propertyChanged) {
          this.set(propertyOldName, propertyNewValue);
          result.push(run.once(this, 'resetOffset'));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }),


  extraQueryStrings: computed("query", "sortingKey", "sortingReversed", "platformType", "selectedTeam", function () {
    const platform = this.get("platformType")
    const reverse = this.get("sortingReversed")
    const sorting = underscore(this.get("sortingKey"))
    const team = this.get('selectedTeam');

    const query = {
      q: this.get("query"),
      sorting: sorting
    };
    if (platform != null && platform != -1) {
      query["platform"] = platform;
    }
    if (reverse) {
      query["sorting"] = '-' + sorting;
    }

    if (team && team.id) {
      query['team'] = team.id;
    }
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  sortingKeyObjects: computed('tDateCreated', 'tDateUpdated', 'tLeastRecent', 'tMostRecent', 'tPackageName', function () {
    const tDateUpdated = this.get("tDateUpdated");
    const tDateCreated = this.get("tDateCreated");
    const tPackageName = this.get("tPackageName");
    const tLeastRecent = this.get("tLeastRecent");
    const tMostRecent = this.get("tMostRecent");
    const keyObjects = [{
        key: "lastFileCreatedOn",
        text: tDateUpdated
      },
      {
        key: "id",
        text: tDateCreated
      },
      {
        key: "packageName",
        text: tPackageName
      }
    ];
    const keyObjectsWithReverse = [];
    for (let keyObject of Array.from(keyObjects)) {
      for (let reverse of [true, false]) {
        const keyObjectFull = {};
        keyObjectFull.reverse = reverse;
        keyObjectFull.key = keyObject.key;
        keyObjectFull.text = keyObject.text;
        if (reverse) {
          if (["lastFileCreatedOn", "id"].includes(keyObject.key)) {
            keyObjectFull.text += tMostRecent;
          } else {
            keyObjectFull.text += "(Z -> A)";
          }
        } else {
          if (["lastFileCreatedOn", "id"].includes(keyObject.key)) {
            keyObjectFull.text += tLeastRecent;
          } else {
            keyObjectFull.text += "(A -> Z)";
          }
        }
        keyObjectsWithReverse.push(keyObjectFull);
      }
    }
    return keyObjectsWithReverse;
  }),

  platformObjects: ENUMS.PLATFORM.CHOICES.slice(0, + -4 + 1 || undefined),
  actions: {
    sortProjects() {
      const select = $(this.element).find("#project-sort-property");
      const [sortingKey, sortingReversed] = filterPlatformValues(select.val());
      this.set("sortingKey", sortingKey);
      this.set("sortingReversed", sortingReversed);
    },

    filterPlatform() {
      this.set('isLoading', true); // state will be updated in the paginate mixin
      const select = $(this.element).find("#project-filter-platform");
      this.set("platformType", select.val());
    },
    // Action to get/set selected team object
    onSelectTeam(team) {
      this.set('isLoading', true); // state will be updated in the paginate mixin
      this.set('selectedTeam', team);
    },

    onOpenTFilter() {
      const query = {
        limit: 10
      }
      this.queryTeams.perform(query)
    },

    searchTeams(teamName) {
      if (teamName && teamName.length) {
        const query = {
          q: teamName
        }
        this.queryTeams.perform(query);
      }
    },

    //Action triggered when typing on the search query input
    onQueryChange() {
      if (this.get('tempQuery.length') >= INPUT.MIN_LENGTH || this.get('tempQuery') === '') {
        this.set('query', this.get('tempQuery'));
      }
    }
  },

  /**
   * @function queryTeams
   * @param {String} teamName
   * Method to query all the matching teams with given name
   */
  queryTeams: task(function* (query) {
    const teamList = [this.get('defaultTeam')];
    const teams = yield this.get('store').query('organization-team', query)
    teams.forEach((team) => {
      teamList.pushObject({
        name: team.name,
        id: team.id
      })
    })
    this.set('teams', teamList)
  })
});

export default ProjectListComponent;
