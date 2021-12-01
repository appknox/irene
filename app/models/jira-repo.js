import Model, { attr, belongsTo } from '@ember-data/model';

export default Model.extend({
  project: belongsTo('project'),
  project_key: attr("string"),
  project_name: attr("string"),
  risk_threshold: attr('number'),
  jira_cloud_project_hash: attr("string", { defaultValue: null }),
});
