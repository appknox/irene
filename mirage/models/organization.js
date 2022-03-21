/* eslint-disable prettier/prettier */
import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  users: hasMany('user'),
  teams: hasMany('team')
});
