import { faker } from '@faker-js/faker';

import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  platform_version() {
    return faker.number.int();
  },

  is_tablet() {
    return faker.datatype.boolean();
  },

  platform() {
    return faker.helpers.arrayElement([0, 1, 2]);
  },
});
