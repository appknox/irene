import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  lastUploadedOn: faker.date.past(),
  logo: '',
  name: faker.company.name(),
  ownerEmails: () => [faker.internet.email(), faker.internet.email()],
  createdOn: faker.date.past(),
});
