import DS from 'ember-data';

export default DS.Model.extend({
  owner: DS.belongsTo('user', {inverse: 'ownedProjects'}),
  files: DS.hasMany('file', {inverse:'project'}),
  packageName: DS.attr('string')
});
