import Model, { attr }  from '@ember-data/model';

export default Model.extend({
  enabled: attr('boolean'),
  enforced: attr('boolean'),
});
