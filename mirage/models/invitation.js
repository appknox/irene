/* eslint-disable prettier/prettier */
import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  user : belongsTo('user'),
  project : belongsTo('project')
});
