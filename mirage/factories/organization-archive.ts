import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  created_on: faker.date.recent(),
  available_until: faker.date.future(),

  generated_by(i) {
    return i + 1;
  },

  from_date: faker.date.past(),
  to_date: faker.date.recent(),
  task_id: null,
  progress_percent: 100,
  generated_via: 0,
});
