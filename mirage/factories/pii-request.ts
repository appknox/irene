import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  id: (i) => i + 100 + 1,
  status: () => faker.number.int(),
  created_at: () => faker.date.recent().toISOString(),
  updated_at: () => faker.date.recent().toISOString(),
});
