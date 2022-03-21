/* eslint-disable prettier/prettier, ember/no-classic-classes */
import Model, { attr, belongsTo }  from '@ember-data/model';

export default Model.extend({
  account: attr('string'),
  project: belongsTo('project'),
  repo: attr('string'),
  risk_threshold: attr('number'),
  repo_details: attr()
});
