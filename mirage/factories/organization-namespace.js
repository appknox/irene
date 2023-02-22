import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  value: faker.internet.domainName,
  isApproved: faker.datatype.boolean(),
  platform: faker.random.arrayElement([0, 1]),
  createdOn: faker.date.past(),
});
