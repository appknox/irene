import faker from 'faker';

import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  write() {
    return faker.random.boolean();
  },

  members_count() {
    return faker.random.number();
  },

  name() {
    return faker.company.companyName();
  },
});
