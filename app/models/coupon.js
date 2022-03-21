/* eslint-disable prettier/prettier, ember/no-classic-classes */
import Model, { attr }  from '@ember-data/model';

const Coupon = Model.extend({
  code: attr('string'),
  discount: attr('string')
});

export default Coupon;
