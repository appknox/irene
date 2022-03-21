/* eslint-disable prettier/prettier, ember/no-classic-classes */
import Model, { attr, hasMany, belongsTo }  from '@ember-data/model';

export default Model.extend({
  owner: belongsTo('user', {inverse: 'ownedProjects'}),
  files: hasMany('security/file'),
  packageName: attr('string')
});
