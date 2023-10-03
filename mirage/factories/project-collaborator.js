import faker from 'faker';

import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  username() {
    return faker.name.firstName();
  },

  write() {
    return faker.random.boolean();
  },

  is_active() {
    return faker.random.boolean();
  },

  email() {
    return faker.internet.email(this.username);
  },
});
