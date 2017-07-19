import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({

  project: belongsTo("project"),
  user: belongsTo("user"),
  team: belongsTo("team")

});
