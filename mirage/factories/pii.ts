import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id: (i) => i + 100 + 1,
  sources: () => faker.company.name(),
  type: () => faker.hacker.noun(),
  pii_data: () => {
    return Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(
      () => ({
        value: faker.lorem.word(),
        source: faker.helpers.arrayElement(['BINARY', 'API']),
        url: faker.internet.url(),
      })
    );
  },
  highlight: faker.datatype.boolean(),
});
