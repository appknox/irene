import faker from 'faker';

import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  platform_version() {
    return faker.random.number();
  },

  is_tablet() {
    return faker.random.boolean();
  },

  platform() {
    return faker.random.arrayElement([0, 1, 2]);
  },
});
