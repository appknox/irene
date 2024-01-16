import { faker } from '@faker-js/faker';

import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  file_key: () => faker.string.uuid(),
  file_name: () => faker.system.fileName(),
  created_on: () => faker.date.past(),
  is_valid: () => faker.datatype.boolean(),
});
