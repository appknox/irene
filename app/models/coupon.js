import DS from 'ember-data';

const Coupon = DS.Model.extend({
  code: DS.attr('string'),
  discount: DS.attr('string')
});

export default Coupon;
