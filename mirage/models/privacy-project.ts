import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  project: belongsTo('project', { inverse: null }),
  latest_file: belongsTo('file', { inverse: null }),
});
