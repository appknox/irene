/* eslint-disable ember/no-classic-components, ember/no-mixins, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/avoid-leaking-state-in-ember-objects, ember/no-get, ember/no-observers */
import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';

const FileListComponent = Component.extend(PaginateMixin, {

  project: null,

  targetModel: "file",
  sortProperties: ["createdOn:desc"],

  classNames: ["columns", "margin-top"],

  extraQueryStrings: computed("project.id", function() {
    const query =
      {projectId: this.get("project.id")};
    return JSON.stringify(query, Object.keys(query).sort());
  }),


  newFilesObserver: observer("realtime.FileCounter", function() {
    return this.incrementProperty("version");
  })
}
);

export default FileListComponent;
