import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  code(i) {
    return `pcidss${i}`;
  },

  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
});
