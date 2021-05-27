import {
  Factory
} from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  lastUploadedOn: faker.date.past(),
  logo: '',
  name: faker.company.companyName(),
  ownerEmails: [faker.internet.email(), faker.internet.email()],
  createdOn: faker.date.past()
});
