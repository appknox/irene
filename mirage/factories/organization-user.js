import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  username() {
    return faker.name.firstName(this.id);
  },
  email() {
    return faker.internet.email(this.username);
  },
  is_active: true,
});
