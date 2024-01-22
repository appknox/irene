import { faker } from '@faker-js/faker';

import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  username() {
    return faker.person.firstName();
  },

  write() {
    return faker.datatype.boolean();
  },

  is_active() {
    return faker.datatype.boolean();
  },

  email() {
    const username = this.username as string;

    return faker.internet.email({ firstName: username });
  },
});
