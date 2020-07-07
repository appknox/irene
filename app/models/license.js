import DS from 'ember-data';
import { computed } from '@ember/object';


export default DS.Model.extend({
  key: DS.attr('string'),
  startDate: DS.attr('date'),
  expiryDate: DS.attr('date'),
  name: DS.attr('string'),
  email: DS.attr('string'),
  isLimitedScans: DS.attr('boolean'),
  status: DS.attr('string'),
  perAppId: DS.attr('string'),
  perAppName: DS.attr('string'),
  perAppDescription: DS.attr('string'),
  perAppQuantity: DS.attr('number'),
  perScanId: DS.attr('string'),
  perScanName: DS.attr('string'),
  perScanDescription: DS.attr('string'),
  perScanQuantity: DS.attr('number'),


  isActive: computed.equal('status', 'Active'),

  isExpired: computed.equal('status', 'Expired'),
});
