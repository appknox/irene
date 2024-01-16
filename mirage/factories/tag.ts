import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  id: (i) => i + 100 + 1,
  name: () => faker.lorem.slug(2),
});
