import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  code(i) {
    return `hipaa${i}`;
  },
  title: faker.lorem.sentence(),
  safeguard: faker.lorem.word(),
  standards() {
    var stds = [];
    for (var i = 0; i < 4; i++) {
      stds.push({
        title: faker.lorem.sentence(),
        specifications: 'Required',
        description: faker.lorem.paragraph(),
      });
    }
    return stds;
  },
});
