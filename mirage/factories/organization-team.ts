import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  name() {
    return faker.lorem.word();
  },

  organization: 1,

  created_on() {
    return faker.date.past();
  },

  members_count() {
    return faker.number.int();
  },

  projects_count() {
    return faker.number.int();
  },
});
