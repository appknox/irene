import DS from 'ember-data';

export default DS.Model.extend({
  analysis: DS.belongsTo('analysis'),
  createdOn: DS.attr('date'),
  description: DS.attr('string'),
  title: DS.attr('string'),
  updatedOn:DS.attr('date')
});
