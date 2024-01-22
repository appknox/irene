import { Model, hasMany } from 'miragejs';

export default Model.extend({
  projects: hasMany('project'),
  submissions: hasMany('submission'),
  // teams: hasMany("team")
});
