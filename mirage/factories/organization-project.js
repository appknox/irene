import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  write: faker.datatype.boolean(),
});
