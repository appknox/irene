import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id(i: number) {
    return i + 1;
  },

  name() {
    return faker.person.jobTitle();
  },
});
