import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },
  created_on: faker.date.past().toISOString(),
  updated_on: faker.date.past().toISOString(),
  // createdBy: an ID of a user
});
