/* eslint-disable prettier/prettier */
import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  id (i) {
    return i+1;
  },
  createdOn: faker.date.past,
  updatedOn: faker.date.past
  // createdBy: an ID of a user
});
