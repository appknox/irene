import DS from 'ember-data';

export default DS.Model.extend({
  code: DS.attr(),
  title: DS.attr(),
  description: DS.attr(),
  year: DS.attr()
});