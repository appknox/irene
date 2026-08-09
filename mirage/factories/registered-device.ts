/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-expect-error "trait" prop missing from miragejs
import { Factory, trait } from 'miragejs';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';

export default Factory.extend({
  name: () =>
    faker.helpers.arrayElement(['Pixel 7', 'iPhone 14', 'Galaxy S23']),
  serial_number: () =>
    faker.string.alphanumeric({ length: 8, casing: 'upper' }),
  model: () => faker.helpers.arrayElement(['Pixel', 'iPhone', 'Galaxy']),
  platform: ENUMS.PLATFORM.ANDROID,
  is_connected: true,
  created_on: () => faker.date.recent().toISOString(),

  offline: trait({
    is_connected: false,
  }),

  ios: trait({
    platform: ENUMS.PLATFORM.IOS,
  }),

  unnamed: trait({
    name: null,
  }),
});
