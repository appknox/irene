import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  code(i) {
    return `masvs-${i}`;
  },
  title: faker.lorem.sentence(),
});
