import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  file: belongsTo('file', { inverse: null }),
});
