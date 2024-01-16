import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  username() {
    return faker.person.firstName();
  },

  email() {
    const username = this.username as string;

    return faker.internet.email({ firstName: username });
  },

  is_active: true,
});
