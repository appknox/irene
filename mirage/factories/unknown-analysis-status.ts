import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  status() {
    return faker.datatype.boolean();
  },
});
