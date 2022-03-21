/* eslint-disable prettier/prettier, ember/no-classic-classes */
import Model, { attr }  from '@ember-data/model';

export default Model.extend({
  username: attr('string'),
  email: attr('string'),
  isActive: attr('boolean')
});
