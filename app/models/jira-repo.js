import DS from 'ember-data';

export default DS.Model.extend({
  project: DS.belongsTo('project'),
  project_key: DS.attr("string"),
  project_name: DS.attr("string"),
  risk_threshold: DS.attr('number')
});
