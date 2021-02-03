import {
  Factory
} from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  expiredOn: faker.date.past,
  company: faker.company.companyName,
  firstName: faker.name.firstName,
  lastName: faker.name.lastName,
  email: faker.internet.email,
  noOfScans: faker.random.number,
  isTrail: faker.random.boolean,
  registrationType() {
    return faker.random.arrayElement(['BY_INVITE', 'BY_REGISTRATION']);
  },
  approved: faker.random.boolean,
  createdOn: faker.date.recent,
  updatedOn: faker.date.recent
});
