import {
  Model,
  hasMany
} from 'ember-cli-mirage';

export default Model.extend({
  projects: hasMany("project"),
  submissions: hasMany("submission")
  // teams: hasMany("team")
});
