import {
  Factory
} from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  scansLeft: faker.random.number(),
  limitedScans: faker.random.arrayElement([true, false]),
  projectsLimit: faker.random.number(),
  expiryDate: faker.date.future()
});
