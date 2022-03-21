/* eslint-disable prettier/prettier */
import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  uuid: faker.random.uuid(),
  name: faker.system.fileName(),
  downloadUrl: faker.internet.url()
});
