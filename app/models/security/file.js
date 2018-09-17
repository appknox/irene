import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  user: DS.belongsTo('user'),
  project: DS.belongsTo('security/project'),
  analyses: DS.hasMany('security/analysis'),

  analysesSorting: ['risk:desc'],
  sortedAnalyses: Ember.computed.sort('analyses', 'analysesSorting'),
});
