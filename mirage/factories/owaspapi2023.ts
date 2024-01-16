import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  code(i) {
    return `owaspapi2023-${i}`;
  },

  title: faker.lorem.sentence(),
  year: faker.date.past().getFullYear(),
});
