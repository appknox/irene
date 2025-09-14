import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  file_type: () => faker.helpers.arrayElement(['json', 'har']),
  progress: () => faker.number.int({ min: -1, max: 100 }),
  status: () => faker.number.int({ min: 1, max: 4 }),
  is_outdated: () => faker.datatype.boolean(),
  generated_on: () => faker.date.recent().toString(),
  created_on: () => faker.date.recent().toString(),
});
