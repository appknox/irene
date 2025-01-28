import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';

import ENUMS from 'irene/enums';

export default Factory.extend({
  ds_manual_device_selection: () =>
    faker.helpers.arrayElement(ENUMS.DS_MANUAL_DEVICE_SELECTION.BASE_VALUES),

  ds_manual_device_selection_display: faker.lorem.sentence(),

  ds_manual_device_identifier: () =>
    faker.string.alphanumeric({ length: 7, casing: 'upper' }),
});
