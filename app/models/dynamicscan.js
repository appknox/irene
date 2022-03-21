/* eslint-disable prettier/prettier, ember/no-classic-classes */
import Model, { attr }  from '@ember-data/model';

const DynamicScan = Model.extend({
  apiScan: attr('boolean'),
  apiUrls: attr(),
  createdOn: attr('date'),
  updatedOn: attr('date'),
  expiresOn: attr('date'),
  deviceType: attr('number'),
  dynamicStatus: attr('number'),
  platform: attr('number'),
  platformVersion: attr('string'),
  proxyHost: attr('string'),
  proxyPort: attr('string'),
  async extendTime(time) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return await adapter.extendTime(this, time);
  },
});

export default DynamicScan;
