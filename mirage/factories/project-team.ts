import { faker } from '@faker-js/faker';

import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  write() {
    return faker.datatype.boolean();
  },

  members_count() {
    return faker.datatype.number();
  },

  name() {
    return faker.company.name();
  },
});
