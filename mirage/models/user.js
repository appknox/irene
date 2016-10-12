import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  ownedProjects: hasMany("project"),
  submissions: hasMany("submission"),
  collaborations: hasMany("collaboration")
});
