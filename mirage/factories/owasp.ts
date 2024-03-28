import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  code(i) {
    return `owasp${i}`;
  },

  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  year: faker.date.past().getFullYear(),
});
