/* eslint-disable prettier/prettier */
import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  isTablet: faker.random.boolean(),
  platformVersion: "2.3",
  platform: 1
});
