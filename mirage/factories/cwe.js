import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  code(i) {
    return `cwe${i}`;
  },
  url: faker.internet.url(),
});
