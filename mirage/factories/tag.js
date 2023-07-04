import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  id: (i) => i + 100 + 1,
  name: () => faker.lorem.slug(2),
});
