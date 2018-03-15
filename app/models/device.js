import DS from 'ember-data';

const Device = DS.Model.extend({
  isTablet: DS.attr('boolean'),
  version: DS.attr('string'),
  platform: DS.attr('number')
});

export default Device;
