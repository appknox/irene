/* eslint-disable prettier/prettier */
import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  membersCount: faker.number.int(),
  projectsCount: faker.number.int(),

  name() {
    return faker.company.name();
  },

  members() {
    const desc = [];

    for (let i = 0; i < 5; i++) {
      desc.push(faker.person.firstName().split(' '));
    }

    return desc.join(',');
  },
});
