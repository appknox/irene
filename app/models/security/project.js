import DS from 'ember-data';

export default DS.Model.extend({
  owner: DS.belongsTo('user', {inverse: 'ownedProjects'}),
  files: DS.hasMany('security/file'),
  packageName: DS.attr('string')
});
