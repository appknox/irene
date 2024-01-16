import { hasMany, Model } from 'miragejs';

export default Model.extend({
  users: hasMany('user'),
  teams: hasMany('team'),
  projects: hasMany('organization-project'),
});
