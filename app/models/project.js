import DS from 'ember-data';
import BaseModelMixin from 'irene/mixins/base-model';
import ENUMS from 'irene/enums';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

const Project = DS.Model.extend(BaseModelMixin, {
  activeProfileId: DS.attr('number'),
  owner: DS.belongsTo('user', {inverse: 'ownedProjects'}),
  files: DS.hasMany('file', {inverse:'project'}),
  name: DS.attr('string'),
  packageName: DS.attr('string'),
  platform: DS.attr('number'),
  source: DS.attr('number'),
  githubRepo: DS.attr('string'),
  jiraProject: DS.attr('string'),
  testUser:DS.attr('string'),
  testPassword: DS.attr('string'),
  url: DS.attr('string'),
  lastFileCreatedOn: DS.attr('date'),
  fileCount: DS.attr('number'),

  pdfPassword: computed('uuid', function() {
    const uuid = this.get("uuid");
    if (isEmpty(uuid)) {
      return "Unknown!";
    } else {
      return uuid.split("-")[4];
    }
  }),

  hasFiles: computed.gt('fileCount', 0),
  hasMultipleFiles: computed.gt('fileCount', 1),

  platformDisplay: computed('platform', function() {
    switch (this.get("platform")) {
      case ENUMS.PLATFORM.ANDROID: return "Android";
      case ENUMS.PLATFORM.IOS: return "iOS";
      case ENUMS.PLATFORM.WINDOWS: return "Windows";
      default: return "";
    }
  }),

  platformIconClass: computed('platform', function() {
    switch (this.get("platform")) {
      case ENUMS.PLATFORM.ANDROID: return "android";
      case ENUMS.PLATFORM.IOS: return "apple";
      case ENUMS.PLATFORM.WINDOWS: return "windows";
      default: return "mobile";
    }
  }),

  isAPIScanEnabled: computed('platform', function() {
    const platform = this.get("platform");
    return [ENUMS.PLATFORM.ANDROID , ENUMS.PLATFORM.IOS].includes(platform);
  }),

  lastFile:computed('fileCount', function() {
    const params = {
      projectId: this.get("id"),
      lastFileOnly: true
    };
    return this.store.queryRecord("file", params);
  })
}
);


export default Project;
