import {
  Factory
} from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({

  status: faker.random.boolean()
});
