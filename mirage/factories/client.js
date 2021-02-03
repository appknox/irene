import {
  Factory
} from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  username: faker.internet.userName,
  firstName: faker.name.firstName,
  lastName: faker.name.lastName,
  email: faker.internet.email,
  status: faker.random.boolean,
  company: faker.company.companyName,
  isTrail: faker.random.boolean,
  "last-upload": faker.date.past
});
