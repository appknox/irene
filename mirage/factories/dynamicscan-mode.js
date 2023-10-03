import faker from 'faker';

import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  dynamicscan_mode: () => faker.random.arrayElement(['Manual', 'Automated']),
});
