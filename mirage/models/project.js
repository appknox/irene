import {
  Model,
  belongsTo,
  hasMany
} from 'ember-cli-mirage';

export default Model.extend({
  owner: belongsTo('user', {
    inverse: 'ownedProjects'
  }),
  files: hasMany('file', {
    inverse: 'project'
  }),

  lastFileId: belongsTo('file')

  // lastFileId: belongsTo('file')
});
