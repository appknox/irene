import DS from 'ember-data';
import ENUMS from 'irene/enums';

const Coupon = DS.Model.extend({
  code: DS.attr('string'),
  discount: DS.attr('string')
});

export default Coupon;
