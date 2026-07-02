import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  skInventoryApp: belongsTo('sk-inventory-app'),
});
