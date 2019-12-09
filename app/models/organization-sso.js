import DS from 'ember-data';
const { Model } = DS;

export default Model.extend({
  enabled: DS.attr('boolean'),
  enforced: DS.attr('boolean'),
});
