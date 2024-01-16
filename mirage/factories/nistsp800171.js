import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  code(i) {
    return `nistsp800171-${i}`;
  },

  title: faker.lorem.sentence(5),
  description: faker.lorem.paragraph(),
});
