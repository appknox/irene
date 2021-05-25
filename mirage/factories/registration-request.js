import {
  Factory
} from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  email: faker.internet.email(),
  data: {
    company: faker.company.companyName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
  },
  createdOn: faker.date.past(),
  isActivated: false,
  approvalStatus: 'pending'
});
