import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  code(i) {
    return `hipaa${i}`;
  },
  title: faker.lorem.sentence(),
  safeguard: faker.lorem.word(),

  standards() {
    const stds = [];

    for (let i = 0; i < 4; i++) {
      stds.push({
        title: faker.lorem.sentence(),
        specifications: 'Required',
        description: faker.lorem.paragraph(),
      });
    }

    return stds;
  },
});
