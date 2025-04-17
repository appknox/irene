import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id: (i) => i + 100 + 1,
  name: () => faker.company.name(),
  findings: () => ({
    code_signature: faker.helpers.arrayElements(
      [faker.system.fileName(), faker.system.fileName()],
      faker.number.int({ min: 0, max: 2 })
    ),
    network_signature: faker.helpers.arrayElements(
      [faker.internet.domainName(), faker.internet.domainName()],
      faker.number.int({ min: 0, max: 1 })
    ),
  }),
  categories: () =>
    faker.helpers.arrayElements(
      [faker.lorem.word(), faker.lorem.word()],
      faker.number.int({ min: 0, max: 2 })
    ),
  created_at: () => faker.date.past().toISOString(),
  updated_at: () => faker.date.recent().toISOString(),
});
