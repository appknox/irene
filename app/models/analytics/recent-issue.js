/* eslint-disable prettier/prettier, ember/no-classic-classes */
import Model, { attr, belongsTo }  from '@ember-data/model';

export default Model.extend({
  count: attr('number'),
  vulnerability: belongsTo('vulnerability')
});
