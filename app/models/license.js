/* eslint-disable prettier/prettier, ember/no-classic-classes */
import Model, { attr }  from '@ember-data/model';
import { computed } from '@ember/object';


export default Model.extend({
  key: attr('string'),
  startDate: attr('date'),
  expiryDate: attr('date'),
  name: attr('string'),
  email: attr('string'),
  isLimitedScans: attr('boolean'),
  status: attr('string'),
  perAppId: attr('string'),
  perAppName: attr('string'),
  perAppDescription: attr('string'),
  perAppQuantity: attr('number'),
  perScanId: attr('string'),
  perScanName: attr('string'),
  perScanDescription: attr('string'),
  perScanQuantity: attr('number'),


  isActive: computed.equal('status', 'Active'),

  isExpired: computed.equal('status', 'Expired'),
});
