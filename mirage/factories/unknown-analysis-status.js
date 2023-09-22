import faker from 'faker';
import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },
  status() {
    return faker.random.boolean();
  },
});
