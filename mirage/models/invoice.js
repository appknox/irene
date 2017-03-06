import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  user : belongsTo('user'),
  pricing : belongsTo('pricing'),
  coupon : belongsTo('coupon')
});
