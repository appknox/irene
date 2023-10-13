import faker from 'faker';
import { Factory } from 'miragejs';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  key: () => faker.datatype.uuid(),
  name: () => faker.company.companyName(),
});
