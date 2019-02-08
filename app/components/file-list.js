import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';

const FileListComponent = Component.extend(PaginateMixin, {

  project: null,

  targetObject: "file",
  sortProperties: ["createdOn:desc"],

  projectClassSelector: false,
  showMoreDetails: false,

  classNames: ['columns', 'margin-top', 'projectClassSelector:mp-plus:mp-minus'],

  extraQueryStrings: computed("project.id", function() {
    const query =
      {projectId: this.get("project.id")};
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newFilesObserver: observer("realtime.FileCounter", function() {
    return this.incrementProperty("version");
  }),

  actions: {
    toggleFileDetails() {
      this.set("projectClassSelector", this.get("showMoreDetails"));
      this.set("showMoreDetails", !this.get("showMoreDetails"));
    },

  },
}
);

export default FileListComponent;
