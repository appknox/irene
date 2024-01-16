import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  value: faker.internet.domainName,
  isApproved: faker.datatype.boolean(),
  platform: faker.helpers.arrayElement([0, 1]),
  createdOn: faker.date.past(),
});
