import DS from 'ember-data';

export default DS.Model.extend({
  isTablet: DS.attr('boolean'),
  platformVersion: DS.attr('string'),
  platform: DS.attr('number')
});
