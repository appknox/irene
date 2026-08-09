import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  generated_on: faker.date.past(),
  language: faker.helpers.arrayElement(['en', 'ja']),
  progress: faker.number.int({ min: 0, max: 100 }),
});
