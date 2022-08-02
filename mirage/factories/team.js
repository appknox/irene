/* eslint-disable prettier/prettier */
import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  membersCount: faker.random.number(),
  projectsCount: faker.random.number(),
  name() {
    return faker.company.companyName();
  },
  members() {
    var desc = [];
    for (var i = 0; i < 5; i++) {
      desc.push(faker.name.firstName(2).split(' '));
    }
    return desc.join(',');
  },
});
