import { computed } from '@ember/object';
import DS from 'ember-data';
import ENUMS from 'irene/enums';
import { isEmpty } from '@ember/utils';
import BaseModelMixin from 'irene/mixins/base-model';

export default DS.Model.extend(BaseModelMixin, {
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
  lastFileId: DS.attr('number'),
  fileCount: DS.attr('number'),
  lastFile: DS.belongsTo('file'),

  pdfPassword: computed('uuid', function () {
    const uuid = this.get("uuid");
    if (isEmpty(uuid)) {
      return "Unknown!";
    } else {
      return uuid.split("-")[4];
    }
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

  isAPIScanEnabled: computed('platform', function () {
    const platform = this.get("platform");
    return [ENUMS.PLATFORM.ANDROID, ENUMS.PLATFORM.IOS].includes(platform);
  }),

  addCollaborator(data, id) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.addCollaborator(this.store, this.constructor.modelName, this, data, id);
  },
});
