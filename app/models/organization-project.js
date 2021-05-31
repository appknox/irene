import { computed } from '@ember/object';
import Model, { attr, hasMany, belongsTo }  from '@ember-data/model';
import ENUMS from 'irene/enums';

export default Model.extend({
  activeProfileId: attr('number'),
  organization: belongsTo('organization'),
  files: hasMany('file', {inverse:'project'}),
  name: attr('string'),
  packageName: attr('string'),
  platform: attr('number'),
  source: attr('number'),
  githubRepo: attr('string'),
  jiraProject: attr('string'),
  url: attr('string'),
  lastFileCreatedOn: attr('date'),
  fileCount: attr('number'),

  lastFile: computed('fileCount', 'id', 'store', function() {
    const params = {
      projectId: this.get("id"),
      lastFileOnly: true
    };
    return this.store.queryRecord("file", params);
  }),

  hasMultipleFiles: computed.gt('fileCount', 1),

  platformIconClass:computed('platform', function() {
    switch (this.get("platform")) {
      case ENUMS.PLATFORM.ANDROID: return "android";
      case ENUMS.PLATFORM.IOS: return "apple";
      case ENUMS.PLATFORM.WINDOWS: return "windows";
      default: return "mobile";
    }
  }),

  addCollaborator(data, id) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.addCollaborator(this.store, this.constructor.modelName, this, data, id);
  },
});
