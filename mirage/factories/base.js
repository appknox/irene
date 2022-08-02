/* eslint-disable prettier/prettier */
import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },
  created_on: faker.date.past,
  updated_on: faker.date.past,
  // createdBy: an ID of a user
});
