import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  code(i) {
    return `nistsp80053-${i}`;
  },

  title: faker.lorem.sentence(5),
  description: faker.lorem.paragraph(),
});
