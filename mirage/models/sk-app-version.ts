import { Model, hasMany } from 'miragejs';

export default Model.extend({
  skStoreInstances: hasMany('sk-store-instance'),
});
