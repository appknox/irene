import DS from 'ember-data';

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

  lastFile: (function() {
    const params = {
      projectId: this.get("id"),
      lastFileOnly: true
    };
    return this.store.queryRecord("file", params);
  }).property("fileCount")

});
