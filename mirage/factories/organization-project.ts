import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  last_file_createdOn: faker.date.past(),

  active_profile_id(i) {
    return i + 1;
  },

  organization: 1,

  name() {
    return faker.company.name();
  },

  package_name() {
    return faker.internet.domainName();
  },

  platform() {
    return faker.helpers.arrayElement([0, 1, 2]);
  },
});
