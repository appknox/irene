import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  key: faker.person.firstName(),
  name: faker.person.firstName(),
  created: faker.date.past,
});
