import DS from 'ember-data';

export default DS.Model.extend({
  account: DS.attr('string'),
  project: DS.belongsTo('project'),
  repo: DS.attr('string'),
  risk_threshold: DS.attr('number'),
  repo_details: DS.attr()
});
