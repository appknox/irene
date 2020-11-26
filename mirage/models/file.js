import {
  Model,
  hasMany,
  belongsTo
} from 'ember-cli-mirage';

export default Model.extend({
  project: belongsTo('project', {
    inverse: 'files'
  }),
  analyses: hasMany('analysis'),
  profile: belongsTo('profile', {
    inverse: 'files'
  })
});
