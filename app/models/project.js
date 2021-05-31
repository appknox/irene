import Model, { attr, hasMany, belongsTo }  from '@ember-data/model';
import BaseModelMixin from 'irene/mixins/base-model';
import ENUMS from 'irene/enums';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';

const Project = Model.extend(BaseModelMixin, {
  activeProfileId: attr('number'),
  owner: belongsTo('user', {inverse: 'ownedProjects'}),
  files: hasMany('file', {inverse:'project'}),
  name: attr('string'),
  packageName: attr('string'),
  platform: attr('number'),
  source: attr('number'),
  githubRepo: attr('string'),
  jiraProject: attr('string'),
  testUser:attr('string'),
  testPassword: attr('string'),
  url: attr('string'),
  lastFileCreatedOn: attr('date'),
  fileCount: attr('number'),
  lastFileId: belongsTo('file'),
  // lastFile: belongsTo('file'),

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

  lastFile: alias('lastFileId')
});


export default Project;
