/* eslint-disable prettier/prettier, ember/no-classic-classes */
import Model, { attr }  from '@ember-data/model';

export default Model.extend({
  isTablet: attr('boolean'),
  platformVersion: attr('string'),
  platform: attr('number')
});
