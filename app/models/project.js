import DS from 'ember-data';
import BaseModelMixin from 'irene/mixins/base-model';
import ENUMS from 'irene/enums';
import Ember from 'ember';

const Project = DS.Model.extend(BaseModelMixin, {
  activeProfileId: DS.attr('number'),
  owner: DS.belongsTo('user', {inverse: 'ownedProjects'}),
  files: DS.hasMany('file', {inverse:'project'}),
  name: DS.attr('string'),
  packageName: DS.attr('string'),
  platform: DS.attr('number'),
  source: DS.attr('number'),
  collaborations: DS.hasMany('collaboration', {inverse: 'project'}),
  githubRepo: DS.attr('string'),
  jiraProject: DS.attr('string'),
  testUser:DS.attr('string'),
  testPassword: DS.attr('string'),
  url: DS.attr('string'),
  lastFileCreatedOn: DS.attr('date'),
  fileCount: DS.attr('number'),
  apiUrlFilters: DS.attr('string'),
  showUnknownAnalysis: DS.attr('boolean'),
  showIgnoredAnalysis: DS.attr('boolean'),

  apiUrlFilterItems:(function() {
    const apiUrlFilters = this.get("apiUrlFilters");
    if (!Ember.isEmpty(apiUrlFilters)) {
      return (apiUrlFilters != null ? apiUrlFilters.split(",") : undefined);
    }
  }).property("apiUrlFilters"),

  hasApiUrlFilters: Ember.computed.alias('apiUrlFilterItems.length'),



  pdfPassword: (function() {
    const uuid = this.get("uuid");
    if (Ember.isEmpty(uuid)) {
      return "Unknown!";
    } else {
      return uuid.split("-")[4];
    }
  }).property("uuid"),

  hasFiles: Ember.computed.gt('fileCount', 0),
  hasMultipleFiles: Ember.computed.gt('fileCount', 1),

  platformIconClass:( function() {
    switch (this.get("platform")) {
      case ENUMS.PLATFORM.ANDROID: return "android";
      case ENUMS.PLATFORM.IOS: return "apple";
      case ENUMS.PLATFORM.WINDOWS: return "windows";
      default: return "mobile";
    }
  }).property("platform"),

  isAPIScanEnabled: ( function() {
    const platform = this.get("platform");
    return [ENUMS.PLATFORM.ANDROID , ENUMS.PLATFORM.IOS].includes(platform);
  }).property("platform"),

  lastFile:( function() {
    const params = {
      projectId: this.get("id"),
      lastFileOnly: true
    };
    return this.store.queryRecord("file", params);
  }).property("fileCount")
}
);


export default Project;
