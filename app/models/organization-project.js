import { computed } from '@ember/object';
import DS from 'ember-data';
import ENUMS from 'irene/enums';

export default DS.Model.extend({
  activeProfileId: DS.attr('number'),
  organization: DS.belongsTo('organization'),
  files: DS.hasMany('file', {inverse:'project'}),
  name: DS.attr('string'),
  packageName: DS.attr('string'),
  platform: DS.attr('number'),
  source: DS.attr('number'),
  githubRepo: DS.attr('string'),
  jiraProject: DS.attr('string'),
  url: DS.attr('string'),
  lastFileCreatedOn: DS.attr('date'),
  fileCount: DS.attr('number'),

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
