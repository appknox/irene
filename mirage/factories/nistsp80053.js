import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  code(i) {
    return `nistsp80053-${i}`;
  },

  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
});
