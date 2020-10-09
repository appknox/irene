import DS from 'ember-data';

export default DS.Model.extend({
  isEnabled: DS.attr('boolean'),
  filesToKeep: DS.attr('number'),
  lastCleanedAt: DS.attr('date')
});
