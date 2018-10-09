import DS from 'ember-data';

export default DS.Model.extend({
  totalScanCount: DS.attr('number'),
  totalAndroidScanCount: DS.attr('number'),
  totalIosScanCount: DS.attr('number'),
  staticScanCount: DS.attr('number'),
  dynamicScanCount: DS.attr('number'),
  apiScanCount: DS.attr('number'),
  manualScanCount: DS.attr('number')
});
