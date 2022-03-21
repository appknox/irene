/* eslint-disable prettier/prettier, ember/no-classic-classes */
import Model, { attr }  from '@ember-data/model';

const Device = Model.extend({
  isTablet: attr('boolean'),
  version: attr('string'),
  platform: attr('number')
});

export default Device;
