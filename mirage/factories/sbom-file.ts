import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  id(i) {
    return 100 + i + 1;
  },

  file(i) {
    return i + 1;
  },

  status: () => faker.number.int({ min: 1, max: 4 }),

  sb_project(i) {
    return 1000 + i + 1;
  },

  completed_at: () => faker.date.recent().toString(),
  created_at: () => faker.date.past().toString(),
});
