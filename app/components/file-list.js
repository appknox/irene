/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';

const FileListComponent = Ember.Component.extend(PaginateMixin, {

  project: null,

  targetObject: "file",
  sortProperties: ["createdOn:desc"],

  classNames: ["columns", "margin-top"],

  extraQueryStrings: Ember.computed("project.id", function() {
    const query =
      {projectId: this.get("project.id")};
    return JSON.stringify(query, Object.keys(query).sort());
  }),


  newFilesObserver: Ember.observer("realtime.FileCounter", function() {
    return this.incrementProperty("version");
  })
}
);

export default FileListComponent;
