import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  code(i) {
    return `cwe${i}`;
  },

  url: faker.internet.url(),
});
