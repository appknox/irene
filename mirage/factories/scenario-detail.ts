import { faker } from '@faker-js/faker';

import Base from './base';

export default Base.extend({
  name: () => faker.lorem.words(2),
  description: () => faker.lorem.sentence(),
  is_active: () => faker.datatype.boolean(),
  is_deleted: false,
  type: 1,
  roles: () => [],
  steps: () => [],
});
