import Model, { attr } from '@ember-data/model';

export default Model.extend({
  key: attr('string'),
  name: attr('string'),
  jira_cloud_id: attr("string", { defaultValue: null }),
});
