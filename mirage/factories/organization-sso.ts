import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  enabled: faker.datatype.boolean(),
  enforced: faker.datatype.boolean(),
});
