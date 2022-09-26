import { hasMany, Model } from 'ember-cli-mirage';

export default Model.extend({
  users: hasMany('user'),
  teams: hasMany('team'),
  projects: hasMany('organization-project'),
});
