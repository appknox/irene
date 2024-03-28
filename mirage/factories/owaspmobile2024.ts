import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  code(i) {
    return `owaspmobile2024${i}`;
  },

  title: faker.lorem.sentence(),
  year: faker.date.past().getFullYear(),
});
