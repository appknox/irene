import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  key: faker.person.firstName(),
  name: faker.person.firstName(),
  // Mirage calls attribute functions with the record index, so passing the
  // bare faker helper made the first record call date.past(0), which throws.
  created: () => faker.date.past(),
});
