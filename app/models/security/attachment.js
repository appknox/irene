/* eslint-disable prettier/prettier, ember/no-classic-classes */
import Model, { attr }  from '@ember-data/model';

export default Model.extend({
   user: attr('string'),
   name: attr('string'),
   createdOn: attr('date')
});
