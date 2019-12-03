import DS from 'ember-data';

const DynamicScan = DS.Model.extend({
  apiScan: DS.attr('boolean'),
  apiUrls: DS.attr(),
  createdOn: DS.attr('date'),
  updatedOn: DS.attr('date'),
  expiresOn: DS.attr('date'),
  deviceType: DS.attr('number'),
  dynamicStatus: DS.attr('number'),
  platform: DS.attr('number'),
  platformVersion: DS.attr('string'),
  proxyHost: DS.attr('string'),
  proxyPort: DS.attr('string'),
  async extendTime(time) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return await adapter.extendTime(this, time);
  },
});

export default DynamicScan;
