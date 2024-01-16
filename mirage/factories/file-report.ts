import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  generated_on: faker.date.past(),
  language: faker.helpers.arrayElement(['en', 'ja']),
  format: faker.helpers.arrayElement(['DEFAULT', 'DETAILED']),
  progress: faker.number.int({ min: -1, max: 100 }),
});
