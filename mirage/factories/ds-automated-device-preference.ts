import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';

import ENUMS from 'irene/enums';

export default Factory.extend({
  ds_automated_device_selection: () =>
    faker.helpers.arrayElement(ENUMS.DS_AUTOMATED_DEVICE_SELECTION.BASE_VALUES),

  ds_automated_device_selection_display: faker.lorem.sentence(),

  ds_automated_device_type: () =>
    faker.helpers.arrayElement(ENUMS.DS_AUTOMATED_DEVICE_TYPE.BASE_VALUES),

  ds_automated_platform_version_min: '',
  ds_automated_platform_version_max: '',

  ds_automated_device_identifier: () =>
    faker.string.alphanumeric({ length: 7, casing: 'upper' }),

  ds_automated_use_reserved_device: null,
});
