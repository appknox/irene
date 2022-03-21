/* eslint-disable prettier/prettier */
import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  key: faker.name.firstName,
  name: faker.name.firstName,
  created: faker.date.past
});
