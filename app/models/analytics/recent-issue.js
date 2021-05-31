import Model, { attr, belongsTo }  from '@ember-data/model';

export default Model.extend({
  count: attr('number'),
  vulnerability: belongsTo('vulnerability')
});
