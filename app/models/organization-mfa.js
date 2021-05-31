import Model, { attr }  from '@ember-data/model';

export default Model.extend({
  mandate: attr('boolean'),
});
