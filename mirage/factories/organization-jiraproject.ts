import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  key: () => faker.string.uuid(),
  name: () => faker.company.name(),
});
