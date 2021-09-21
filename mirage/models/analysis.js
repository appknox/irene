import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  file: belongsTo('file'),
  vulnerability: belongsTo('vulnerability'),
});
