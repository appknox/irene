import { Model } from 'ember-cli-mirage';

export default Model.extend({
  invoices: hasMany('invoice')
});
