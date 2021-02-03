import {
  Model,
  belongsTo,
  hasMany
} from 'ember-cli-mirage';

export default Model.extend({

  owner: belongsTo('user'),
  users: hasMany('user', {
    inverse: null
  }),

});
