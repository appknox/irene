import { Model, hasMany } from 'miragejs';

export default Model.extend({
  invoices: hasMany('invoice'),
});
