import Model, { attr }  from '@ember-data/model';

export default Model.extend({
  status: attr('boolean'),
});
