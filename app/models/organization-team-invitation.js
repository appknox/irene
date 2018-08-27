import DS from 'ember-data';

export default DS.Model.extend({
  role : DS.attr('number'),
  email: DS.attr('string'),
});
