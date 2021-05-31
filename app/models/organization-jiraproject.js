import Model, { attr }  from '@ember-data/model';

export default Model.extend({
  key: attr('string'),
  name: attr('string')
});
