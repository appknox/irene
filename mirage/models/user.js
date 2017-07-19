import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  projects: hasMany("project"),
  submissions: hasMany("submission"),
  collaborations: hasMany("collaboration"),
  teams: hasMany("team")
});
