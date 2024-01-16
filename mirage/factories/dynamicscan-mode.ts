import { faker } from '@faker-js/faker';

import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  dynamicscan_mode: () => faker.helpers.arrayElement(['Manual', 'Automated']),
});
