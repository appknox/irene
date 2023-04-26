import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  generated_on: faker.date.past(),
  language: faker.random.arrayElement(['en', 'ja']),
  format: faker.random.arrayElement(['DEFAULT', 'DETAILED']),
  progress: faker.random.number({ min: -1, max: 100 }),
});
