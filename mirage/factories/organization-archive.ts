import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  task_id: null,
  progress_percent: 100,
  generated_via: 0,

  generated_by(i) {
    return i + 1;
  },

  created_on: () => faker.date.recent().toString(),
  available_until: () => faker.date.future().toString(),
  from_date: () => faker.date.past().toString(),
  to_date: () => faker.date.recent().toString(),
  archive_type: () => faker.helpers.arrayElement([0, 1]),
});
