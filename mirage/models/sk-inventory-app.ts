import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  app_metadata: belongsTo('sk-app-metadata'),
  coreProject: belongsTo('project'),
  coreProjectLatestVersion: belongsTo('file'),
});
