/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';
import ENUMS from 'irene/enums';
import {filterPlatformValues} from 'irene/helpers/filter-platform';
import { translationMacro as t } from 'ember-i18n';

const ProjectListComponent = Ember.Component.extend(PaginateMixin, {

  i18n: Ember.inject.service(),

  classNames: ["columns"],

  query: "",
  targetObject: "project",

  sortingKey: "lastFileCreatedOn",
  sortingReversed: true,
  platformType: ENUMS.PLATFORM.UNKNOWN,

  tDateUpdated: t("dateUpdated"),
  tDateCreated: t("dateCreated"),
  tProjectName: t("projectName"),
  tPackageName: t("packageName"),
  tMostRecent: t("mostRecent"),
  tLeastRecent: t("leastRecent"),

  newProjectsObserver: Ember.observer("realtime.ProjectCounter", function() {
    return this.incrementProperty("version");
  }),

  sortProperties: (function() {
    let sortingKey = this.get("sortingKey");
    const sortingReversed = this.get("sortingReversed");
    if (sortingReversed) {
      sortingKey = `${sortingKey}:desc`;
    }
    return [sortingKey];
  }).property("sortingKey", "sortingReversed"),

  resetOffset() {
    return this.set("offset", 0);
  },

  offsetResetter: Ember.observer("query", "sortingKey", "sortingReversed", "platformType", function() {
    return (() => {
      const result = [];
      for (let property of ["query", "sortingKey", "sortingReversed", "platformType"]) {
        const propertyOldName = `_${property}`;
        const propertyNewValue = this.get(property);
        const propertyOldValue = this.get(propertyOldName);
        const propertyChanged = propertyOldValue !== propertyNewValue;
        if (propertyChanged) {
          this.set(propertyOldName, propertyNewValue);
          result.push(Ember.run.once(this, 'resetOffset'));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }),


  extraQueryStrings: Ember.computed("query", "sortingKey", "sortingReversed", "platformType", function() {
    const query = {
      query: this.get("query"),
      sortingKey: this.get("sortingKey"),
      reverse: this.get("sortingReversed"),
      platform: this.get("platformType")
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  sortingKeyObjects: (function() {
    const tDateUpdated = this.get("tDateUpdated");
    const tDateCreated = this.get("tDateCreated");
    const tProjectName = this.get("tProjectName");
    const tPackageName = this.get("tPackageName");
    const tLeastRecent = this.get("tLeastRecent");
    const tMostRecent = this.get("tMostRecent");
    const keyObjects = [
      { key: "lastFileCreatedOn", text: tDateUpdated },
      { key: "createdOn", text: tDateCreated },
      { key: "name", text: tProjectName },
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
          if (["lastFileCreatedOn", "createdOn"].includes(keyObject.key)) {
            keyObjectFull.text += tMostRecent;
          } else {
            keyObjectFull.text += "(Z -> A)";
          }
        } else {
          if (["lastFileCreatedOn", "createdOn"].includes(keyObject.key)) {
            keyObjectFull.text += tLeastRecent;
          } else {
            keyObjectFull.text += "(A -> Z)";
          }
        }
        keyObjectsWithReverse.push(keyObjectFull);
      }
    }
    return keyObjectsWithReverse;
  }).property(),

  platformObjects: ENUMS.PLATFORM.CHOICES.slice(0, +-4 + 1 || undefined),
  actions: {
    sortProjects() {
      const select = $(this.element).find("#project-sort-property");
      const [sortingKey, sortingReversed] = Array.from(filterPlatformValues(select.val()));
      this.set("sortingKey", sortingKey);
      return this.set("sortingReversed", sortingReversed);
    },

    filterPlatform() {
      const select = $(this.element).find("#project-filter-platform");
      return this.set("platformType", select.val());
    }
  }
}
);

export default ProjectListComponent;
