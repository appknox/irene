import DS from 'ember-data';
import BaseModelMixin from 'irene/mixins/base-model';
import ENUMS from 'irene/enums';
import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';

const Project = DS.Model.extend(BaseModelMixin, {
  i18n: Ember.inject.service(),
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
  deviceType: DS.attr('number'),
  platformVersion: DS.attr('string'),
  apiUrlFilters: DS.attr('string'),
  showUnknownAnalysis: DS.attr('boolean'),

  apiUrlFilterItems:(function() {
    const apiUrlFilters = this.get("apiUrlFilters");
    if (!Ember.isEmpty(apiUrlFilters)) {
      return (apiUrlFilters != null ? apiUrlFilters.split(",") : undefined);
    }
  }).property("apiUrlFilters"),

  hasApiUrlFilters: Ember.computed.alias('apiUrlFilterItems.length'),

  tNoPreference: t("noPreference"),

  pdfPassword: (function() {
    const uuid = this.get("uuid");
    if (Ember.isEmpty(uuid)) {
      return "Unknown!";
    } else {
      return uuid.split("-")[4];
    }
  }).property("uuid"),

  versionText: (function() {
    const platformVersion = this.get("platformVersion");
    const tNoPreference = this.get("tNoPreference");
    if (platformVersion === "0") {
      return tNoPreference;
    } else {
      return platformVersion;
    }
  }).property("platformVersion"),

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
