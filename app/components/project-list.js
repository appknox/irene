import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { observer } from '@ember/object';
import { underscore } from '@ember/string';
import { run } from '@ember/runloop';
import PaginateMixin from 'irene/mixins/paginate';
import ENUMS from 'irene/enums';
import {filterPlatformValues} from 'irene/helpers/filter-platform';
import { translationMacro as t } from 'ember-i18n';
import $ from 'jquery';

const ProjectListComponent = Component.extend(PaginateMixin, {

  i18n: service(),

  classNames: ["columns"],
  projects: null,
  hasProjects: computed.gt('projects.meta.count', 0),
  query: "",
  targetObject: "OrganizationProject",

  sortingKey: "lastFileCreatedOn",
  sortingReversed: true,
  platformType: ENUMS.PLATFORM.UNKNOWN,

  tDateUpdated: t("dateUpdated"),
  tDateCreated: t("dateCreated"),
  tProjectName: t("projectName"),
  tPackageName: t("packageName"),
  tMostRecent: t("mostRecent"),
  tLeastRecent: t("leastRecent"),

  newProjectsObserver: observer("realtime.ProjectCounter", function() {
    return this.incrementProperty("version");
  }),

  sortProperties: computed("sortingKey", "sortingReversed", function() {
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

  offsetResetter: observer("query", "sortingKey", "sortingReversed", "platformType", function() {
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


  extraQueryStrings: computed("query", "sortingKey", "sortingReversed", "platformType", function() {
    const platform = this.get("platformType")
    const reverse = this.get("sortingReversed")
    const sorting = underscore(this.get("sortingKey"))

    const query = {
      q: this.get("query"),
      sorting: sorting
    };
    if(platform != null && platform != -1) {
      query["platform"] = platform;
    }
    if (reverse) {
      query["sorting"] = '-' + sorting;
    }
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  sortingKeyObjects: computed(function() {
    const tDateUpdated = this.get("tDateUpdated");
    const tDateCreated = this.get("tDateCreated");
    const tPackageName = this.get("tPackageName");
    const tLeastRecent = this.get("tLeastRecent");
    const tMostRecent = this.get("tMostRecent");
    const keyObjects = [
      { key: "lastFileCreatedOn", text: tDateUpdated },
      { key: "id", text: tDateCreated },
      { key: "packageName", text: tPackageName }
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

  platformObjects: ENUMS.PLATFORM.CHOICES.slice(0, +-4 + 1 || undefined),
  actions: {
    sortProjects() {
      const select = $(this.element).find("#project-sort-property");
      const [sortingKey, sortingReversed] = filterPlatformValues(select.val());
      this.set("sortingKey", sortingKey);
      this.set("sortingReversed", sortingReversed);
    },

    filterPlatform() {
      const select = $(this.element).find("#project-filter-platform");
      this.set("platformType", select.val());
    }
  }
}
);

export default ProjectListComponent;
