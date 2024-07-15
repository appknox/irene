import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  code(i) {
    return `gdpr${i}`;
  },

  title() {
    return faker.lorem.sentence();
  },
});
