import DS from 'ember-data';

export default DS.Model.extend({
  enabled: DS.attr('boolean'),
  host: DS.attr('string'),
  port: DS.attr('string'),
});
