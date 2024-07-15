import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  description: faker.lorem.paragraph(),
  year: faker.date.past().getFullYear(),

  code(i) {
    return `owasp${i}`;
  },

  title() {
    return faker.lorem.sentence();
  },
});
